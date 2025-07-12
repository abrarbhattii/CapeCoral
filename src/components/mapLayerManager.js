import { useState, useEffect, useCallback } from 'react';

// Custom hook for layer management
export const useMapLayerManager = (viewState) => {
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
    blockGroupBoundaries: false
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
    blockGroupBoundaries: 0
  });

  // Memory management: Track mounted layers
  const [mountedLayers, setMountedLayers] = useState(new Set());
  
  // Function to track layer mounting/unmounting
  const trackLayerMount = (layerName, isMounted) => {
    setMountedLayers(prev => {
      const newSet = new Set(prev);
      if (isMounted) {
        newSet.add(layerName);
        console.log(`🔵 Layer mounted: ${layerName} (${mountedLayers.size + 1} total mounted)`);
      } else {
        newSet.delete(layerName);
        console.log(`🔴 Layer unmounted: ${layerName} (${mountedLayers.size - 1} total mounted)`);
      }
      return newSet;
    });
  };

  // Toggle layer visibility with unmounting
  const toggleLayerVisibility = (layerName) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  // Function to check if a layer should be rendered (data loaded AND visible)
  const shouldRenderLayer = (layerName, data) => {
    const shouldRender = data && layerVisibility[layerName];
    
    // Special handling for buildings layer
    if (layerName === 'buildings' && shouldRender) {
      const heavyLayersOn = layerVisibility.floodZones || 
                            layerVisibility.coastalFloodZones || 
                            layerVisibility.hurricaneMilton;
      const isHighZoom = viewState.zoom >= 16;
      
      // Always render buildings, but with smart optimization
      // At low zoom or when heavy layers are on, buildings will be very light
      if (!mountedLayers.has(layerName)) {
        trackLayerMount(layerName, true);
      }
      return true;
    }
    
    // Track mounting/unmounting for other layers
    if (shouldRender && !mountedLayers.has(layerName)) {
      trackLayerMount(layerName, true);
    } else if (!shouldRender && mountedLayers.has(layerName)) {
      trackLayerMount(layerName, false);
    }
    
    return shouldRender;
  };

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
      blockGroupBoundaries: null
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

    // Cap total load at 100
    totalLoad = Math.min(totalLoad, 100);

    // Determine warning levels
    const isWarning = totalLoad > 70;
    const isCritical = totalLoad > 90;

    setRenderCapacity({
      currentLoad: Math.round(totalLoad),
      maxCapacity: 100,
      isWarning,
      isCritical
    });

    setLayerComplexity(complexity);
  }, [layerVisibility, viewState.zoom]);

  return {
    // States
    layerVisibility,
    renderCapacity,
    layerComplexity,
    mountedLayers,
    
    // Functions
    toggleLayerVisibility,
    shouldRenderLayer,
    getLayerData,
    calculateRenderCapacity,
    trackLayerMount
  };
}; 