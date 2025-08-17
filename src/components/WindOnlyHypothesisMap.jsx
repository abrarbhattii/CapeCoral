import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Map, { Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { layerStyles } from './mapLayerStyles';
import { useMapDataLoader } from './mapDataLoader';
import { useMapLayerManager } from './mapLayerManager';
import { MapLegend, MapPopup, useSceneTransition } from './mapUIComponents';
import BlockGroupDetailsCard from './BlockGroupDetailsCard';
import MapMainPanel from './MapMainPanel';
import ScenePopupManager from './ScenePopupManager';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const WindOnlyHypothesisMap = () => {
  // Use custom hooks for data loading and layer management
  const {
    loading,
    error,
    loadingPhase,
    loadedData,
    floodZonesData,
    buildingsData,
    roadsData,
    pathsData,
    redfinPropertiesData,
    coastalFloodZonesData,
    coastalExtensionFloodZonesData,
    floodMaxData,
    usaceData,
    zipCodeBoundariesData,
    hurricaneMiltonData,
    commercialPoisData,
    socialPoisData,
    environmentalPoisData,
    blockGroupBoundariesData
  } = useMapDataLoader();
  
  const [viewState, setViewState] = useState({
    longitude: -81.9495,
    latitude: 26.5629,
    zoom: 12,
    pitch: 45,
    bearing: 0
  });

  const {
    layerVisibility,
    renderCapacity,
    layerComplexity,
    mountedLayers,
    toggleLayerVisibility,
    shouldRenderLayer,
    calculateRenderCapacity,
    setLayerVisibility,
    setMapInstance: setLayerManagerMapInstance,
    forceCleanupAllLayers,
    getLayerStats
  } = useMapLayerManager(viewState);

  const [clickedFeature, setClickedFeature] = useState(null);
  const [detailsCardBlock, setDetailsCardBlock] = useState(null);
  const [detailsCardCoords, setDetailsCardCoords] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [parksEnabled, setParksEnabled] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [activePopupCards, setActivePopupCards] = useState([]);

  // Note: Scene navigation is now handled via DOM intervention in popup cards
  // (no longer needed: hoveredBlockId, setHoveredBlockId)
  
  // Scene transition coordination between Navigator and Legend
  const { transitionState, triggerSceneTransition } = useSceneTransition();

  // Ensure each block feature has an id property (from GEOID)
  const blocksGeoJson = useMemo(() => {
    if (!blockGroupBoundariesData) return null;
    // Only add id if not present
    if (blockGroupBoundariesData.features.every(f => f.id)) return blockGroupBoundariesData;
    return {
      ...blockGroupBoundariesData,
      features: blockGroupBoundariesData.features.map(f => ({
        ...f,
        id: f.id || f.properties.GEOID
      }))
    };
  }, [blockGroupBoundariesData]);

  // Block group click handler
  const handleMapClick = useCallback((event) => {
    if (!event || !event.features) return;
    // Look for block group feature (block-group-boundaries) or blocks layer
    let blockFeature = event.features.find(f => f.layer && f.layer.id === 'block-group-boundaries');
    if (!blockFeature) {
      blockFeature = event.features.find(f => f.layer && f.layer.id === 'blocks');
    }
    if (blockFeature) {
      console.log('Block clicked:', blockFeature);
      console.log('Block properties:', blockFeature.properties);
      setDetailsCardBlock(blockFeature);
      setSelectedBlockId(blockFeature.id || blockFeature.properties.GEOID);
      // Use centroid from properties if available, else calculate from geometry
      let lat = null, lon = null;
      if (blockFeature.properties.INTPTLAT && blockFeature.properties.INTPTLON) {
        lat = parseFloat(blockFeature.properties.INTPTLAT);
        lon = parseFloat(blockFeature.properties.INTPTLON);
      } else if (blockFeature.geometry && blockFeature.geometry.type === 'Polygon') {
        // Simple centroid calculation for polygons
        const coords = blockFeature.geometry.coordinates[0];
        let x = 0, y = 0;
        coords.forEach(([lng, latPt]) => {
          x += lng;
          y += latPt;
        });
        lon = x / coords.length;
        lat = y / coords.length;
      }
      if (lat && lon) setDetailsCardCoords({ lat, lon });
      else setDetailsCardCoords(null);
    }
    else {
      setSelectedBlockId(null);
    }
  }, []);

  // Parks & Open Spaces Layer Toggle Mechanism
  const handleParksToggle = useCallback(async (checked) => {
    if (!mapInstance) return;
    
    setParksEnabled(checked);
    
    if (checked) {
      // 1. Find and toggle predefined park layers
      const parkLayers = [
        'park', 'park-label', 'national-park', 'golf-course', 'pitch', 'grass'
      ];
      
      parkLayers.forEach(layerId => {
        if (mapInstance.getLayer(layerId)) {
          // Toggle visibility and style existing Mapbox layers
          mapInstance.setLayoutProperty(layerId, 'visibility', 'visible');
          mapInstance.setPaintProperty(layerId, 'fill-color', '#2a9d2a');
          mapInstance.setPaintProperty(layerId, 'fill-opacity', 0.45);
        }
      });

      // 2. Filter and style the 'landuse' layer for park features
      if (mapInstance.getLayer('landuse')) {
        // Store original filter for restoration
        if (!mapInstance._originalLanduseFilter) {
          mapInstance._originalLanduseFilter = mapInstance.getFilter('landuse') || ['all'];
        }
        
        // Apply comprehensive filter for park-related landuse
        mapInstance.setFilter('landuse', ['all', 
          mapInstance._originalLanduseFilter,
          ['any',
            ['==', ['get', 'class'], 'park'],
            ['==', ['get', 'class'], 'recreation_ground'],
            ['==', ['get', 'class'], 'forest'],
            ['==', ['get', 'class'], 'agriculture'],
            ['==', ['get', 'class'], 'grass'],
            ['==', ['get', 'class'], 'golf_course']
          ]
        ]);
        
        // Apply color-coded styling based on landuse type
        mapInstance.setPaintProperty('landuse', 'fill-color', [
          'case',
          ['==', ['get', 'class'], 'park'], '#2a9d2a',        // bright green
          ['==', ['get', 'class'], 'forest'], '#1e5e1e',      // forest green
          ['==', ['get', 'class'], 'agriculture'], '#9acd32',  // yellow-green
          ['==', ['get', 'class'], 'grass'], '#90EE90',        // light green
          ['==', ['get', 'class'], 'golf_course'], '#228B22',  // forest green
          '#2a9d2a' // default
        ]);
        
        mapInstance.setPaintProperty('landuse', 'fill-opacity', 0.6);
      }

      // 3. Filter 'landuse_overlay' for special features
      if (mapInstance.getLayer('landuse_overlay')) {
        if (!mapInstance._originalLanduseOverlayFilter) {
          mapInstance._originalLanduseOverlayFilter = mapInstance.getFilter('landuse_overlay') || ['all'];
        }
        
        mapInstance.setFilter('landuse_overlay', ['any',
          ['==', ['get', 'class'], 'national_park'],
          ['==', ['get', 'class'], 'wetland'],
          ['==', ['get', 'class'], 'forest']
        ]);
        
        mapInstance.setPaintProperty('landuse_overlay', 'fill-color', '#1e5e1e');
        mapInstance.setPaintProperty('landuse_overlay', 'fill-opacity', 0.4);
      }

      // 4. Filter 'poi_label' for park-related POIs
      if (mapInstance.getLayer('poi_label')) {
        if (!mapInstance._originalPoiLabelFilter) {
          mapInstance._originalPoiLabelFilter = mapInstance.getFilter('poi_label') || ['all'];
        }
        
        mapInstance.setFilter('poi_label', ['any',
          ['==', ['get', 'maki'], 'park'],
          ['==', ['get', 'maki'], 'playground'],
          ['==', ['get', 'type'], 'Park'],
          ['==', ['get', 'type'], 'Golf Course'],
          ['==', ['get', 'type'], 'Recreation Area']
        ]);
      }

    } else {
      // Restore all layers to original state
      const parkLayers = [
        'park', 'park-label', 'national-park', 'golf-course', 'pitch', 'grass'
      ];
      
      parkLayers.forEach(layerId => {
        if (mapInstance.getLayer(layerId)) {
          mapInstance.setLayoutProperty(layerId, 'visibility', 'none');
        }
      });
      
      // Restore original filters and styles
      if (mapInstance._originalLanduseFilter) {
        mapInstance.setFilter('landuse', mapInstance._originalLanduseFilter);
        mapInstance.setPaintProperty('landuse', 'fill-color', undefined);
        mapInstance.setPaintProperty('landuse', 'fill-opacity', undefined);
      }
      
      if (mapInstance._originalLanduseOverlayFilter) {
        mapInstance.setFilter('landuse_overlay', mapInstance._originalLanduseOverlayFilter);
        mapInstance.setPaintProperty('landuse_overlay', 'fill-color', undefined);
        mapInstance.setPaintProperty('landuse_overlay', 'fill-opacity', undefined);
      }
      
      if (mapInstance._originalPoiLabelFilter) {
        mapInstance.setFilter('poi_label', mapInstance._originalPoiLabelFilter);
      }
    }
  }, [mapInstance]);

  // Sync parks state with layer visibility
  useEffect(() => {
    if (parksEnabled !== layerVisibility.parks) {
      setLayerVisibility(prev => ({
        ...prev,
        parks: parksEnabled
      }));
    }
  }, [parksEnabled, layerVisibility.parks, setLayerVisibility]);

  // Mapbox hover feature-state for blocks
  useEffect(() => {
    if (!mapInstance || !layerVisibility.blocks || !blocksGeoJson) return;
    const map = mapInstance;
    let hoveredId = null;

    function onMouseMove(e) {
      if (!e.features || !e.features.length) return;
      const feature = e.features[0];
      // Clear previous
      if (hoveredId !== null) {
        map.setFeatureState({ source: 'blocks-source', id: hoveredId }, { hover: false });
      }
      hoveredId = feature.id;
      map.setFeatureState({ source: 'blocks-source', id: hoveredId }, { hover: true });
    }

    function onMouseLeave() {
      if (hoveredId !== null) {
        map.setFeatureState({ source: 'blocks-source', id: hoveredId }, { hover: false });
      }
      hoveredId = null;
    }

    function onClick(e) {
      if (!e.features || !e.features.length) return;
      const feature = e.features[0];
      console.log('[Blocks-hover] Block clicked:', feature);
      console.log('[Blocks-hover] Block properties:', feature.properties);
      setSelectedBlockId(feature.id || feature.properties.GEOID);
      // Compute bounds from feature geometry
      const coordinates = feature.geometry.type === 'Polygon'
        ? feature.geometry.coordinates[0]
        : feature.geometry.type === 'MultiPolygon'
          ? feature.geometry.coordinates[0][0]
          : null;
      if (coordinates) {
        let minLng = coordinates[0][0], minLat = coordinates[0][1], maxLng = coordinates[0][0], maxLat = coordinates[0][1];
        coordinates.forEach(([lng, lat]) => {
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        });
        map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 300, duration: 800 });
      }
      // Show census details card for block in center of screen after 1 second delay
      setDetailsCardBlock(null);
      setDetailsCardCoords(null);
      setTimeout(() => {
        setDetailsCardBlock(feature);
        setDetailsCardCoords(null);
      }, 1000);
    }

    map.on('mousemove', 'blocks-hover', onMouseMove);
    map.on('mouseleave', 'blocks-hover', onMouseLeave);
    map.on('click', 'blocks-hover', onClick);

    return () => {
      map.off('mousemove', 'blocks-hover', onMouseMove);
      map.off('mouseleave', 'blocks-hover', onMouseLeave);
      map.off('click', 'blocks-hover', onClick);
      // Clean up any lingering hover state
      if (hoveredId !== null) {
        map.setFeatureState({ source: 'blocks-source', id: hoveredId }, { hover: false });
      }
    };
  }, [mapInstance, layerVisibility.blocks, blocksGeoJson]);

  // Recalculate render capacity when layers or data change
  useEffect(() => {
    const dataStates = {
    floodZonesData,
    coastalFloodZonesData,
    coastalExtensionFloodZonesData,
    floodMaxData,
    usaceData,
    zipCodeBoundariesData,
    hurricaneMiltonData,
    buildingsData,
    roadsData,
    pathsData,
    redfinPropertiesData,
    commercialPoisData,
    socialPoisData,
    environmentalPoisData,
    blockGroupBoundariesData
    };
    calculateRenderCapacity(dataStates);
  }, [calculateRenderCapacity, floodZonesData, coastalFloodZonesData, coastalExtensionFloodZonesData, floodMaxData, usaceData, zipCodeBoundariesData, hurricaneMiltonData, buildingsData, roadsData, pathsData, redfinPropertiesData, commercialPoisData, socialPoisData, environmentalPoisData, blockGroupBoundariesData]);

  // Note: Removed cleanup effect to prevent infinite loop
  // Layer cleanup is handled by the layer manager itself

  // Handle click on map
  const onClick = (event) => {
    console.log('Click event:', event);
    
    // Get available layers from the map
    const availableLayers = event.target.getStyle().layers.map(layer => layer.id);
    console.log('Available layers:', availableLayers);
    
    // Define the layers we want to query
    const queryLayers = ['flood-zones', 'coastal-flood-zones', 'optimized-coastal-flood-zones', 'ultra-simplified-mega-flood-zones', 'coastal-extension-flood-zones', 'flood-max', 'usace', 'zip-code-boundaries', 'hurricane-milton', 'redfin-properties'];
    
    // Filter to only query layers that actually exist
    const existingLayers = queryLayers.filter(layerId => availableLayers.includes(layerId));
    console.log('Querying layers:', existingLayers);
    
    // Query for features at the click point
    const features = event.target.queryRenderedFeatures(event.point, {
      layers: existingLayers
    });
    
    console.log('Features at click point:', features);
    
    if (features && features.length > 0) {
      const feature = features[0];
      console.log('Clicked feature:', feature);
      console.log('Properties:', feature.properties);
      
      if (feature.layer.id === 'flood-zones') {
        setClickedFeature(feature);
        setPopupInfo({
          floodZone: feature.properties.flood_zone,
          riskLevel: feature.properties.risk_level,
          insuranceRequired: feature.properties.insurance_required,
          dataSource: feature.properties.data_source,
          areaSqKm: feature.properties.area_sq_km,
          lngLat: event.lngLat,
          point: event.point
        });
      } else if (feature.layer.id === 'coastal-flood-zones') {
        setClickedFeature(feature);
        setPopupInfo({
          floodZone: feature.properties.flood_zone,
          riskLevel: feature.properties.risk_level,
          insuranceRequired: feature.properties.insurance_required,
          dataSource: feature.properties.data_source,
          areaSqKm: feature.properties.area_sq_km,
          lngLat: event.lngLat,
          point: event.point,
          isCoastal: true
        });
      } else if (feature.layer.id === 'optimized-coastal-flood-zones') {
        setClickedFeature(feature);
        setPopupInfo({
          floodZone: feature.properties.flood_zone,
          riskLevel: feature.properties.risk_level,
          insuranceRequired: feature.properties.insurance_required,
          dataSource: feature.properties.data_source,
          areaSqKm: feature.properties.area_sq_km,
          lngLat: event.lngLat,
          point: event.point,
          isOptimizedCoastal: true
        });
      } else if (feature.layer.id === 'ultra-simplified-mega-flood-zones') {
        setClickedFeature(feature);
        setPopupInfo({
          floodZone: feature.properties.flood_zone,
          riskLevel: feature.properties.risk_level,
          insuranceRequired: feature.properties.insurance_required,
          dataSource: feature.properties.data_source,
          areaSqKm: feature.properties.area_sq_km,
          lngLat: event.lngLat,
          point: event.point,
          isUltraSimplifiedMega: true
        });
      } else if (feature.layer.id === 'coastal-extension-flood-zones') {
        setClickedFeature(feature);
        setPopupInfo({
          floodZone: feature.properties.flood_zone,
          riskLevel: feature.properties.risk_level,
          insuranceRequired: feature.properties.insurance_required,
          dataSource: feature.properties.data_source,
          areaSqKm: feature.properties.area_sq_km,
          lngLat: event.lngLat,
          point: event.point,
          isCoastalExtension: true
        });
      } else if (feature.layer.id === 'flood-max') {
        setClickedFeature(feature);
        setPopupInfo({
          floodZone: feature.properties.flood_zone,
          riskLevel: feature.properties.risk_level,
          insuranceRequired: feature.properties.insurance_required,
          dataSource: feature.properties.data_source,
          areaSqKm: feature.properties.area_sq_km,
          lngLat: event.lngLat,
          point: event.point,
          isFloodMax: true
        });
      } else if (feature.layer.id === 'usace') {
        setClickedFeature(feature);
        setPopupInfo({
          branch: feature.properties.branch,
          permitsSection: feature.properties.permits_section,
          description: feature.properties.description,
          acquisitionDate: feature.properties.acquisition_date,
          regulatoryType: feature.properties.regulatory_type,
          jurisdiction: feature.properties.jurisdiction,
          agency: feature.properties.agency,
          lngLat: event.lngLat,
          point: event.point,
          isUsace: true
        });
      } else if (feature.layer.id === 'zip-code-boundaries') {
        setClickedFeature(feature);
        setPopupInfo({
          zipCode: feature.properties.zipcode,
          riskLevel: feature.properties.risk_level,
          baseAnnualPremium: feature.properties.insurance_data?.base_annual_premium,
          foreclosureRiskScore: feature.properties.foreclosure_risk?.foreclosure_risk_score,
          foreclosureRiskCategory: feature.properties.foreclosure_risk?.risk_category,
          foreclosureProbability6Months: feature.properties.foreclosure_risk?.foreclosure_probability_6_months,
          foreclosureProbability12Months: feature.properties.foreclosure_risk?.foreclosure_probability_12_months,
          companiesCount: feature.properties.data_summary?.companies_count,
          lngLat: event.lngLat,
          point: event.point,
          isZipCodeBoundary: true
        });
      } else if (feature.layer.id === 'hurricane-milton') {
        setClickedFeature(feature);
        setPopupInfo({
          propertyId: feature.properties.property_id,
          zipCode: feature.properties.zip_code,
          community: feature.properties.community,
          dateOfLoss: feature.properties.date_of_loss,
          buildingDamage: feature.properties.building_damage,
          contentsDamage: feature.properties.contents_damage,
          totalDamage: feature.properties.total_damage,
          buildingPayout: feature.properties.building_payout,
          contentsPayout: feature.properties.contents_payout,
          totalPayout: feature.properties.total_payout,
          payoutGap: feature.properties.payout_gap,
          daysFromLandfall: feature.properties.days_from_landfall,
          isPreLandfall: feature.properties.is_pre_landfall,
          isLandfallDay: feature.properties.is_landfall_day,
          isPostLandfall: feature.properties.is_post_landfall,
          lngLat: event.lngLat,
          point: event.point,
          isHurricaneMilton: true
        });
      } else if (feature.layer.id === 'redfin-properties') {
        setClickedFeature(feature);
        setPopupInfo({
          address: feature.properties.address,
          zipCode: feature.properties.zip_code,
          price: feature.properties.price,
          beds: feature.properties.beds,
          baths: feature.properties.baths,
          sqft: feature.properties.sqft,
          riskLevel: feature.properties.risk_level,
          lngLat: event.lngLat,
          point: event.point
        });
      }
    } else {
      setClickedFeature(null);
      setPopupInfo(null);
    }
  };

  // (no longer needed: onMouseMoveBlocks)

  // Pulse animation for selected block border
  useEffect(() => {
    if (!mapInstance || !selectedBlockId) return;
    let pulse = 0;
    const map = mapInstance;
    let animationFrame;
    const animate = () => {
      pulse = (pulse + 1) % 2;
      map.setFeatureState({ source: 'blocks-source', id: selectedBlockId }, { pulse });
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      map.setFeatureState({ source: 'blocks-source', id: selectedBlockId }, { pulse: 0 });
    };
  }, [mapInstance, selectedBlockId]);

  if (loading) {
    const getLoadingMessage = () => {
      switch (loadingPhase) {
        case 1:
          return 'Loading essential flood zones and zip code boundaries...';
        case 2:
          return 'Loading core flood zone layers and hurricane data...';
        case 3:
          return 'Loading infrastructure data (buildings, roads, paths)...';
        case 4:
          return 'Loading points of interest data...';
        default:
          return 'Analyzing Citizens Insurance data for foreclosure prediction...';
      }
    };

    const getProgressPercentage = () => {
      switch (loadingPhase) {
        case 1: return 25;
        case 2: return 50;
        case 3: return 75;
        case 4: return 90;
        default: return 0;
      }
    };

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f172a',
        color: '#e2e8f0',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px', fontWeight: '600' }}>
            🌪️ Loading Wind-Only Foreclosure Analysis
          </div>
          <div style={{ fontSize: '16px', opacity: 0.7, marginBottom: '20px' }}>
            {getLoadingMessage()}
          </div>
          
          {/* Progress bar */}
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '16px'
          }}>
            <div style={{
              width: `${getProgressPercentage()}%`,
              height: '100%',
              backgroundColor: '#10b981',
              transition: 'width 0.5s ease',
              borderRadius: '4px'
            }} />
          </div>
          
          {/* Loading phase indicator */}
          <div style={{ fontSize: '12px', opacity: 0.6 }}>
            Phase {loadingPhase} of 5 • {loadedData.size} datasets loaded
          </div>
          
          {/* Loaded datasets list */}
          {loadedData.size > 0 && (
            <div style={{ 
              marginTop: '16px', 
              fontSize: '11px', 
              opacity: 0.5,
              textAlign: 'left',
              maxHeight: '100px',
              overflow: 'hidden'
            }}>
              <div style={{ marginBottom: '4px', fontWeight: '600' }}>Loaded:</div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '2px',
                fontSize: '10px'
              }}>
                {Array.from(loadedData).map(key => (
                  <div key={key} style={{ 
                    backgroundColor: 'rgba(16, 185, 129, 0.2)', 
                    padding: '2px 6px', 
                    borderRadius: '3px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    ✓ {key}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f172a',
        color: '#ef4444',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: '16px' }}>Error Loading Data</div>
          <div style={{ fontSize: '14px' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', backgroundColor: '#0f172a' }}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        projection="globe"
        onClick={onClick}
        onLoad={e => {
          const map = e.target;
          setMapInstance(map);
          setLayerManagerMapInstance(map);
          console.log('🗺️ Map loaded, layer manager initialized');
        }}
      >
        {/* Map Layers */}
        {shouldRenderLayer('floodZones', floodZonesData) && (
          <Source id="flood-zones-source" type="geojson" data={floodZonesData}>
            <Layer 
              {...layerStyles.floodZones} 
              interactive={true}
              style={{ cursor: 'pointer' }}
            />
          </Source>
        )}

        {shouldRenderLayer('coastalFloodZones', coastalFloodZonesData) && (
          <Source id="coastal-flood-zones-source" type="geojson" data={coastalFloodZonesData}>
            <Layer {...layerStyles.coastalFloodZones} />
          </Source>
        )}





        {shouldRenderLayer('coastalExtensionFloodZones', coastalExtensionFloodZonesData) && (
          <Source id="coastal-extension-flood-zones-source" type="geojson" data={coastalExtensionFloodZonesData}>
            <Layer {...layerStyles.coastalExtensionFloodZones} />
          </Source>
        )}

        {shouldRenderLayer('floodMax', floodMaxData) && (
          <Source id="flood-max-source" type="geojson" data={floodMaxData}>
            <Layer {...layerStyles.floodMax} />
          </Source>
        )}

        {shouldRenderLayer('usace', usaceData) && (
          <Source id="usace-source" type="geojson" data={usaceData}>
            <Layer {...layerStyles.usace} />
          </Source>
        )}

        {shouldRenderLayer('zipCodeBoundaries', zipCodeBoundariesData) && (
          <Source id="zip-code-boundaries-source" type="geojson" data={zipCodeBoundariesData}>
            <Layer {...layerStyles.zipCodeBoundaries} />
          </Source>
        )}

        {shouldRenderLayer('hurricaneMilton', hurricaneMiltonData) && (
          <Source id="hurricane-milton-source" type="geojson" data={hurricaneMiltonData}>
            <Layer {...layerStyles.hurricaneMilton} />
          </Source>
        )}

        {shouldRenderLayer('buildings', buildingsData) && (
          <Source id="buildings-source" type="geojson" data={buildingsData}>
            <Layer {...layerStyles.buildings} />
          </Source>
        )}

        {shouldRenderLayer('roads', roadsData) && (
          <Source id="roads-source" type="geojson" data={roadsData}>
            <Layer {...layerStyles.roads} />
          </Source>
        )}

        {shouldRenderLayer('paths', pathsData) && (
          <Source id="paths-source" type="geojson" data={pathsData}>
            <Layer {...layerStyles.paths} />
          </Source>
        )}

        {shouldRenderLayer('redfinProperties', redfinPropertiesData) && (
          <Source id="redfin-properties-source" type="geojson" data={redfinPropertiesData}>
            <Layer {...layerStyles.redfinProperties} />
          </Source>
        )}

        {shouldRenderLayer('commercialPois', commercialPoisData) && (
          <Source id="commercial-pois-source" type="geojson" data={commercialPoisData}>
            <Layer {...layerStyles.commercialPois} />
          </Source>
        )}

        {shouldRenderLayer('socialPois', socialPoisData) && (
          <Source id="social-pois-source" type="geojson" data={socialPoisData}>
            <Layer {...layerStyles.socialPois} />
          </Source>
        )}

        {shouldRenderLayer('environmentalPois', environmentalPoisData) && (
          <Source id="environmental-pois-source" type="geojson" data={environmentalPoisData}>
            <Layer {...layerStyles.environmentalPois} />
          </Source>
        )}

        {layerVisibility.blocks && blocksGeoJson && (
          <Source id="blocks-source" type="geojson" data={blocksGeoJson}>
            <Layer
              {...{
                ...layerStyles.blocks,
                paint: {
                  ...layerStyles.blocks.paint,
                }
              }}
            />
            <Layer
              {...layerStyles.blocksHover}
            />
            {/* Selected block fill highlight as a separate fill layer */}
            {selectedBlockId && (
              <Layer
                id="blocks-selected-fill"
                type="fill"
                source="blocks-source"
                filter={["==", ["id"], selectedBlockId]}
                paint={{
                  "fill-color": "#ec4899",
                  "fill-opacity": 0.15
                }}
              />
            )}
            {/* Selected block border highlight as a separate line layer */}
            <Layer
              id="blocks-selected-line"
              type="line"
              source="blocks-source"
              filter={["==", ["id"], selectedBlockId]}
              paint={{
                "line-color": "#ec4899",
                "line-width": [
                  "interpolate",
                  ["linear"],
                  ["coalesce", ["feature-state", "pulse"], 0],
                  0, 4,
                  1, 8
                ],
                "line-opacity": 0.95
              }}
            />
          </Source>
        )}

        {shouldRenderLayer('blockGroupBoundaries', blockGroupBoundariesData) && (
          <Source id="block-group-boundaries-source" type="geojson" data={blocksGeoJson}>
            <Layer {...layerStyles.blockGroupBoundaries} />
          </Source>
        )}
      </Map>
      
      {/* UI Components */}
      <MapPopup popupInfo={popupInfo} setPopupInfo={setPopupInfo} />
      <BlockGroupDetailsCard 
        block={detailsCardBlock} 
        onClose={() => setDetailsCardBlock(null)} 
        coords={detailsCardCoords}
      />
      
      <MapLegend 
        layerVisibility={layerVisibility}
        toggleLayerVisibility={toggleLayerVisibility}
        layerComplexity={layerComplexity}
        renderCapacity={renderCapacity}
        mountedLayers={mountedLayers}
        viewState={viewState}
        floodZonesData={floodZonesData}
        coastalFloodZonesData={coastalFloodZonesData}
        coastalExtensionFloodZonesData={coastalExtensionFloodZonesData}
        floodMaxData={floodMaxData}
        usaceData={usaceData}
        zipCodeBoundariesData={zipCodeBoundariesData}
        hurricaneMiltonData={hurricaneMiltonData}
        buildingsData={buildingsData}
        roadsData={roadsData}
        pathsData={pathsData}
        redfinPropertiesData={redfinPropertiesData}
        commercialPoisData={commercialPoisData}
        socialPoisData={socialPoisData}
        environmentalPoisData={environmentalPoisData}
        blockGroupBoundariesData={blockGroupBoundariesData}
        blocksData={blockGroupBoundariesData}
        handleParksToggle={handleParksToggle}
        parksEnabled={parksEnabled}
        sceneTransitionState={transitionState}
      />
      <MapMainPanel 
        map={mapInstance} 
        layerVisibility={layerVisibility}
        setLayerVisibility={setLayerVisibility}
        parksEnabled={parksEnabled}
        handleParksToggle={handleParksToggle}
        sharedSceneTransition={triggerSceneTransition}
        activePopupCards={activePopupCards}
        setActivePopupCards={setActivePopupCards}
      />
      <ScenePopupManager 
        mapInstance={mapInstance}
        activeCards={activePopupCards}
        onCardClose={(cardId) => {
          setActivePopupCards(prev => prev.filter(card => card.id !== cardId));
        }}
      />
    </div>
  );
};

export default WindOnlyHypothesisMap;

