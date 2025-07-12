import { useState, useEffect, useCallback, useRef } from 'react';
import { DATA_LOADING_CONFIG } from './mapLayerStyles';

// Custom hook for data loading
export const useMapDataLoader = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingPhase, setLoadingPhase] = useState(1);
  const [loadedData, setLoadedData] = useState(new Set());
  const loadingQueueRef = useRef([]);
  const isInitializingRef = useRef(true);

  // Data states
  const [floodZonesData, setFloodZonesData] = useState(null);
  const [buildingsData, setBuildingsData] = useState(null);
  const [roadsData, setRoadsData] = useState(null);
  const [pathsData, setPathsData] = useState(null);
  const [redfinPropertiesData, setRedfinPropertiesData] = useState(null);
  const [coastalFloodZonesData, setCoastalFloodZonesData] = useState(null);


  const [coastalExtensionFloodZonesData, setCoastalExtensionFloodZonesData] = useState(null);
  const [floodMaxData, setFloodMaxData] = useState(null);
  const [usaceData, setUsaceData] = useState(null);
  const [zipCodeBoundariesData, setZipCodeBoundariesData] = useState(null);
  const [hurricaneMiltonData, setHurricaneMiltonData] = useState(null);
  const [commercialPoisData, setCommercialPoisData] = useState(null);
  const [socialPoisData, setSocialPoisData] = useState(null);
  const [environmentalPoisData, setEnvironmentalPoisData] = useState(null);
  const [blockGroupBoundariesData, setBlockGroupBoundariesData] = useState(null);

  // Centralized data loading function
  const loadDataItem = async (config) => {
    const maxRetries = config.maxRetries || 1;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        // Add delay if specified
        if (config.delay) {
          await new Promise(resolve => setTimeout(resolve, config.delay));
        }
        
        console.log(`Loading ${config.key} from ${config.url} (attempt ${retryCount + 1}/${maxRetries})`);
        const response = await fetch(config.url);
        
        if (!response.ok) {
          throw new Error(`Failed to load ${config.key}: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Special processing for Environmental POIs - only show 80% of markers
        let processedData = data;
        if (config.key === 'environmentalPois') {
          const features = data.features || [];
          const totalFeatures = features.length;
          const featuresToShow = Math.floor(totalFeatures * 0.8); // 80% of markers
          
          // Randomly select 80% of the features
          const shuffled = features.sort(() => 0.5 - Math.random());
          const selectedFeatures = shuffled.slice(0, featuresToShow);
          
          processedData = {
            ...data,
            features: selectedFeatures
          };
          
          console.log(`📊 Environmental POIs: Showing ${featuresToShow}/${totalFeatures} markers (80%)`);
        }
        
        // Standard processing for all layers
        const setterMap = {
          floodZones: setFloodZonesData,
          buildings: setBuildingsData,
          roads: setRoadsData,
          paths: setPathsData,
          redfinProperties: setRedfinPropertiesData,
          coastalFloodZones: setCoastalFloodZonesData,
          coastalExtensionFloodZones: setCoastalExtensionFloodZonesData,
          floodMax: setFloodMaxData,
          usace: setUsaceData,
          zipCodeBoundaries: setZipCodeBoundariesData,
          hurricaneMilton: setHurricaneMiltonData,
          commercialPois: setCommercialPoisData,
          socialPois: setSocialPoisData,
          environmentalPois: setEnvironmentalPoisData,
          blockGroupBoundaries: setBlockGroupBoundariesData
        };
        
        const setter = setterMap[config.key];
        if (setter) {
          setter(processedData);
          setLoadedData(prev => new Set([...prev, config.key]));
          console.log(`✅ Loaded ${config.key}: ${processedData.features?.length || 0} features`);
        }
        
        // Success - break out of retry loop
        break;
        
      } catch (err) {
        retryCount++;
        console.error(`Error loading ${config.key} (attempt ${retryCount}/${maxRetries}):`, err);
        
        if (retryCount >= maxRetries) {
          // Final attempt failed
          if (config.priority === 1) {
            setError(`Failed to load ${config.key} data after ${maxRetries} attempts`);
          } else {
            console.warn(`⚠️ Non-essential layer ${config.key} failed to load after ${maxRetries} attempts`);
          }
        } else {
          // Wait before retry
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          console.log(`🔄 Retrying ${config.key} in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
  };

  // Progressive loading manager
  const startProgressiveLoading = useCallback(async () => {
    if (!isInitializingRef.current) return;
    isInitializingRef.current = false;
    
    console.log('🚀 Starting progressive data loading...');
    
    // Phase 1: Load essential layers immediately
    setLoadingPhase(1);
    const essentialPromises = DATA_LOADING_CONFIG.essential.map(loadDataItem);
    await Promise.all(essentialPromises);
    
    // Phase 2: Load core layers
    setLoadingPhase(2);
    const corePromises = DATA_LOADING_CONFIG.core.map(loadDataItem);
    await Promise.all(corePromises);
    
    // Phase 3: Load heavy layers with delays
    setLoadingPhase(3);
    for (const config of DATA_LOADING_CONFIG.heavy) {
      await loadDataItem(config);
    }
    
    // Phase 4: Load POI layers
    setLoadingPhase(4);
    const poiPromises = DATA_LOADING_CONFIG.poi.map(loadDataItem);
    await Promise.all(poiPromises);
    
    // Phase 5: Load administrative boundaries
    setLoadingPhase(5);
    const adminPromises = DATA_LOADING_CONFIG.admin.map(loadDataItem);
    await Promise.all(adminPromises);
    
    console.log('✅ Progressive loading complete');
    setLoading(false);
  }, []);

  // Initialize progressive loading
  useEffect(() => {
    startProgressiveLoading();
  }, [startProgressiveLoading]);

  // Legacy loading completion (for backward compatibility)
  useEffect(() => {
    if (!loading && isInitializingRef.current) {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [loading]);

  return {
    // Loading states
    loading,
    error,
    loadingPhase,
    loadedData,
    
    // Data states
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
    blockGroupBoundariesData,
    
    // Functions
    loadDataItem,
    startProgressiveLoading
  };
}; 