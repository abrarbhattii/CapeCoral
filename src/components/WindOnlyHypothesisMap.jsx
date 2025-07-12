import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Map, { Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { layerStyles } from './mapLayerStyles';
import { useMapDataLoader } from './mapDataLoader';
import { useMapLayerManager } from './mapLayerManager';
import { MapLegend, MapPopup } from './mapUIComponents';

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
    calculateRenderCapacity
  } = useMapLayerManager(viewState);

  const [clickedFeature, setClickedFeature] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);

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

        {shouldRenderLayer('blockGroupBoundaries', blockGroupBoundariesData) && (
          <Source id="block-group-boundaries-source" type="geojson" data={blockGroupBoundariesData}>
            <Layer {...layerStyles.blockGroupBoundaries} />
          </Source>
        )}
      </Map>
      
      {/* UI Components */}
      <MapPopup popupInfo={popupInfo} setPopupInfo={setPopupInfo} />
      
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
      />
    </div>
  );
};

export default WindOnlyHypothesisMap;

