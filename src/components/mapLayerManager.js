import { useState, useEffect, useCallback, useRef } from 'react';

// Custom hook for layer management
export const useMapLayerManager = (viewState) => {
  const DEBUG_MODE = false; // Set to true to enable detailed logging
  // Layer visibility states
  const [layerVisibility, setLayerVisibility] = useState({
    floodZones: false,
    coastalFloodZones: false,
    coastalExtensionFloodZones: false,
    floodMax: false,
    usace: false,
    zipCodeBoundaries: false,
    hurricaneMilton: false,
    buildings: false,
    roads: false,
    paths: false,
    redfinProperties: false,
    commercialPois: false,
    socialPois: false,
    environmentalPois: false,
    blockGroupBoundaries: false,
    blocks: true, // Blocks layer enabled by default
    parks: false // Parks layer toggle
  });

  // Render capacity monitoring
  const [renderCapacity, setRenderCapacity] = useState({
    currentLoad: 0,
    maxCapacity: 100,
    isWarning: false,
    isCritical: false
  });

  const [layerComplexity, setLayerComplexity] = useState({
    floodZones: 0,
    coastalFloodZones: 0,
    coastalExtensionFloodZones: 0,
    floodMax: 0,
    usace: 0,
    zipCodeBoundaries: 0,
    hurricaneMilton: 0,
    buildings: 0,
    roads: 0,
    paths: 0,
    redfinProperties: 0,
    commercialPois: 0,
    socialPois: 0,
    environmentalPois: 0,
    blockGroupBoundaries: 0,
    blocks: 0,
    parks: 0
  });

  // Memory management: Track mounted layers with more detailed state
  const [mountedLayers, setMountedLayers] = useState(new Set());
  const layerMountState = useRef(new Map()); // Track detailed mount state
  const mapInstance = useRef(null);

  // Set map instance for cleanup operations
  const setMapInstance = (map) => {
    mapInstance.current = map;
  };

  // Enhanced layer mounting/unmounting with proper cleanup
  const trackLayerMount = useCallback((layerName, isMounted, data = null) => {
    setMountedLayers(prev => {
      const newSet = new Set(prev);
      if (isMounted) {
        newSet.add(layerName);
        layerMountState.current.set(layerName, {
          mounted: true,
          timestamp: Date.now(),
          dataSize: data ? JSON.stringify(data).length : 0
        });
        if (DEBUG_MODE) console.log(`🔵 Layer mounted: ${layerName} (${newSet.size} total)`);
      } else {
        newSet.delete(layerName);
        layerMountState.current.delete(layerName);
        if (DEBUG_MODE) console.log(`🔴 Layer unmounted: ${layerName} (${newSet.size} total)`);
      }
      return newSet;
    });

    // Force garbage collection for unmounted layers
    if (!isMounted && mapInstance.current) {
      try {
        // Remove any event listeners for this layer
        const layerIds = getLayerIds(layerName);
        layerIds.forEach(layerId => {
          if (mapInstance.current.getLayer(layerId)) {
            // Remove layer-specific event listeners
            mapInstance.current.off('mousemove', layerId);
            mapInstance.current.off('mouseleave', layerId);
            mapInstance.current.off('click', layerId);
          }
        });
        
        // Force cleanup of any cached data
        if (window.gc) {
          if (DEBUG_MODE) console.log(`🧹 Forcing GC after unmounting ${layerName}`);
          window.gc();
        }
      } catch (error) {
        console.warn(`Error during layer cleanup for ${layerName}:`, error);
      }
    }
  }, []);

  // Get layer IDs for a given layer name
  const getLayerIds = (layerName) => {
    const layerIdMap = {
      floodZones: ['flood-zones'],
      coastalFloodZones: ['coastal-flood-zones'],
      coastalExtensionFloodZones: ['coastal-extension-flood-zones'],
      floodMax: ['flood-max'],
      usace: ['usace'],
      zipCodeBoundaries: ['zip-code-boundaries'],
      hurricaneMilton: ['hurricane-milton'],
      buildings: ['buildings'],
      roads: ['roads'],
      paths: ['paths'],
      redfinProperties: ['redfin-properties'],
      commercialPois: ['commercial-pois'],
      socialPois: ['social-pois'],
      environmentalPois: ['environmental-pois'],
      blockGroupBoundaries: ['block-group-boundaries'],
      blocks: ['blocks', 'blocks-hover'],
      parks: ['park', 'park-label', 'national-park', 'golf-course', 'pitch', 'grass', 'landuse', 'landuse-overlay', 'poi-label']
    };
    return layerIdMap[layerName] || [];
  };

  // Enhanced toggle with proper cleanup
  const toggleLayerVisibility = useCallback((layerName) => {
    setLayerVisibility(prev => {
      const newVisibility = !prev[layerName];
      
      // If turning off, schedule cleanup
      if (!newVisibility && mountedLayers.has(layerName)) {
        // Delay cleanup to avoid race conditions
        setTimeout(() => {
          trackLayerMount(layerName, false);
        }, 100);
      }
      
      return {
      ...prev,
        [layerName]: newVisibility
  };
    });
  }, [mountedLayers, trackLayerMount]);

  // Enhanced shouldRenderLayer with better resource management
  const shouldRenderLayer = useCallback((layerName, data) => {
    const shouldRender = data && layerVisibility[layerName];
    const isCurrentlyMounted = mountedLayers.has(layerName);
    
    // Special handling for buildings layer
    if (layerName === 'buildings' && shouldRender) {
      const heavyLayersOn = layerVisibility.floodZones || 
                            layerVisibility.coastalFloodZones || 
                            layerVisibility.hurricaneMilton;
      const isHighZoom = viewState.zoom >= 16;
      
      // Always render buildings, but with smart optimization
      if (!isCurrentlyMounted) {
        trackLayerMount(layerName, true, data);
      }
      return true;
    }
    
    // Track mounting/unmounting for other layers
    if (shouldRender && !isCurrentlyMounted) {
      trackLayerMount(layerName, true, data);
    } else if (!shouldRender && isCurrentlyMounted) {
      trackLayerMount(layerName, false);
    }
    
    return shouldRender;
  }, [layerVisibility, mountedLayers, trackLayerMount, viewState.zoom]);

  // Force cleanup all layers
  const forceCleanupAllLayers = useCallback(() => {
    if (mountedLayers.size > 0) {
      console.log('🧹 Force cleaning up all layers');
      mountedLayers.forEach(layerName => {
        trackLayerMount(layerName, false);
      });
    }
  }, [mountedLayers, trackLayerMount]);

  // Get layer mount statistics
  const getLayerStats = useCallback(() => {
    const stats = {
      totalMounted: mountedLayers.size,
      mountedLayers: Array.from(mountedLayers),
      mountDetails: Array.from(layerMountState.current.entries()).map(([name, details]) => ({
        name,
        ...details
      }))
    };
    return stats;
  }, [mountedLayers]);

  // Function to get layer data safely
  const getLayerData = (layerName) => {
    const dataMap = {
      floodZones: null, // Will be passed from parent
      coastalFloodZones: null,
      coastalExtensionFloodZones: null,
      floodMax: null,
      usace: null,
      zipCodeBoundaries: null,
      hurricaneMilton: null,
      buildings: null,
      roads: null,
      paths: null,
      redfinProperties: null,
      commercialPois: null,
      socialPois: null,
      environmentalPois: null,
      blockGroupBoundaries: null,
      blocks: null
    };
    return dataMap[layerName];
  };

  // Calculate render capacity based on visible layers
  const calculateRenderCapacity = useCallback((dataStates) => {
    let totalLoad = 0;
    const complexity = {};

    // Calculate load for each visible layer
    if (layerVisibility.floodZones && dataStates.floodZonesData) {
      const featureCount = dataStates.floodZonesData.features?.length || 0;
      const load = Math.min(featureCount * 0.1, 15);
      totalLoad += load;
      complexity.floodZones = load;
    }

    if (layerVisibility.coastalFloodZones && dataStates.coastalFloodZonesData) {
      const featureCount = dataStates.coastalFloodZonesData.features?.length || 0;
      const load = Math.min(featureCount * 0.08, 12);
      totalLoad += load;
      complexity.coastalFloodZones = load;
    }

    if (layerVisibility.coastalExtensionFloodZones && dataStates.coastalExtensionFloodZonesData) {
      const featureCount = dataStates.coastalExtensionFloodZonesData.features?.length || 0;
      const load = Math.min(featureCount * 0.08, 12);
      totalLoad += load;
      complexity.coastalExtensionFloodZones = load;
    }

    if (layerVisibility.floodMax && dataStates.floodMaxData) {
      const featureCount = dataStates.floodMaxData.features?.length || 0;
      const load = Math.min(featureCount * 0.08, 12);
      totalLoad += load;
      complexity.floodMax = load;
    }

    if (layerVisibility.usace && dataStates.usaceData) {
      const featureCount = dataStates.usaceData.features?.length || 0;
      const load = Math.min(featureCount * 0.05, 10); // USACE data is relatively light
      totalLoad += load;
      complexity.usace = load;
    }

    if (layerVisibility.zipCodeBoundaries && dataStates.zipCodeBoundariesData) {
      const featureCount = dataStates.zipCodeBoundariesData.features?.length || 0;
      const load = Math.min(featureCount * 0.03, 8); // Zip code boundaries are light
      totalLoad += load;
      complexity.zipCodeBoundaries = load;
    }

    if (layerVisibility.hurricaneMilton && dataStates.hurricaneMiltonData) {
      const featureCount = dataStates.hurricaneMiltonData.features?.length || 0;
      const load = Math.min(featureCount * 0.01, 15); // Hurricane Milton data is moderate
      totalLoad += load;
      complexity.hurricaneMilton = load;
    }

    if (layerVisibility.buildings && dataStates.buildingsData) {
      const featureCount = dataStates.buildingsData.features?.length || 0;
      const zoomLevel = viewState.zoom || 12;
      
      // Progressive load based on zoom level
      let loadMultiplier = 0.02;
      if (zoomLevel < 10) loadMultiplier = 0.001; // Very light at very low zoom
      else if (zoomLevel < 12) loadMultiplier = 0.003; // Light at low zoom
      else if (zoomLevel < 14) loadMultiplier = 0.005; // Medium-light at medium-low zoom
      else if (zoomLevel < 16) loadMultiplier = 0.01; // Medium at medium zoom
      else loadMultiplier = 0.02; // Normal at high zoom
      
      const load = Math.min(featureCount * loadMultiplier, 20); // Keep max at 20
      totalLoad += load;
      complexity.buildings = load;
    }

    if (layerVisibility.roads && dataStates.roadsData) {
      const featureCount = dataStates.roadsData.features?.length || 0;
      const load = Math.min(featureCount * 0.05, 15);
      totalLoad += load;
      complexity.roads = load;
    }

    if (layerVisibility.paths && dataStates.pathsData) {
      const featureCount = dataStates.pathsData.features?.length || 0;
      const load = Math.min(featureCount * 0.03, 10);
      totalLoad += load;
      complexity.paths = load;
    }

    if (layerVisibility.redfinProperties && dataStates.redfinPropertiesData) {
      const featureCount = dataStates.redfinPropertiesData.features?.length || 0;
      const load = Math.min(featureCount * 0.01, 8);
      totalLoad += load;
      complexity.redfinProperties = load;
    }

    if (layerVisibility.commercialPois && dataStates.commercialPoisData) {
      const featureCount = dataStates.commercialPoisData.features?.length || 0;
      const load = Math.min(featureCount * 0.01, 8);
      totalLoad += load;
      complexity.commercialPois = load;
    }

    if (layerVisibility.socialPois && dataStates.socialPoisData) {
      const featureCount = dataStates.socialPoisData.features?.length || 0;
      const load = Math.min(featureCount * 0.01, 8);
      totalLoad += load;
      complexity.socialPois = load;
    }

    if (layerVisibility.environmentalPois && dataStates.environmentalPoisData) {
      const featureCount = dataStates.environmentalPoisData.features?.length || 0;
      const load = Math.min(featureCount * 0.01, 8);
      totalLoad += load;
      complexity.environmentalPois = load;
    }

    if (layerVisibility.blockGroupBoundaries && dataStates.blockGroupBoundariesData) {
      const featureCount = dataStates.blockGroupBoundariesData.features?.length || 0;
      const load = Math.min(featureCount * 0.02, 8); // Block group boundaries are light
      totalLoad += load;
      complexity.blockGroupBoundaries = load;
    }

    if (layerVisibility.blocks && dataStates.blockGroupBoundariesData) {
      const featureCount = dataStates.blockGroupBoundariesData.features?.length || 0;
      const load = Math.min(featureCount * 0.01, 5); // Blocks are very light
      totalLoad += load;
      complexity.blocks = load;
    }

    // Update render capacity state
    const isWarning = totalLoad > 60;
    const isCritical = totalLoad > 80;

    setRenderCapacity({
      currentLoad: Math.round(totalLoad),
      maxCapacity: 100,
      isWarning,
      isCritical
    });

    setLayerComplexity(complexity);
    
    // Only log if there's a significant change or warning
    if (DEBUG_MODE && (isCritical || isWarning || totalLoad > 50)) {
      console.log(`📊 Render capacity: ${totalLoad.toFixed(1)}% (${isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'OK'})`);
    }
  }, [layerVisibility, viewState.zoom]);

  return {
    layerVisibility,
    setLayerVisibility,
    renderCapacity,
    layerComplexity,
    mountedLayers,
    toggleLayerVisibility,
    shouldRenderLayer,
    calculateRenderCapacity,
    setMapInstance,
    forceCleanupAllLayers,
    getLayerStats,
    getLayerData
  };
}; 