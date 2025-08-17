import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Styled components for the Scene Manager component
const SceneContainer = styled.div`
  position: absolute;
  bottom: 24px;
  right: 24px;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  min-width: ${props => props.$isCollapsed ? '50px' : '200px'};
  max-width: ${props => props.$isCollapsed ? '50px' : '250px'};
  width: ${props => props.$isCollapsed ? '50px' : 'auto'};
  transition: all 0.3s ease;
`;

const SceneHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => props.$isCollapsed ? 'center' : 'space-between'};
  margin-bottom: ${props => props.$isCollapsed ? '0' : '8px'};
  padding-bottom: ${props => props.$isCollapsed ? '0' : '4px'};
  border-bottom: ${props => props.$isCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'};
`;

const SceneTitle = styled.h3`
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  display: ${props => props.$isCollapsed ? 'none' : 'flex'};
  align-items: center;
  gap: 6px;
`;

const SaveButton = styled.button`
  background: #3498DB;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  color: white;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;
  margin-bottom: 8px;

  &:hover {
    background: #2980B9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SceneList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 8px;
`;

const SceneItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 10px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(2px);
  }

  ${props => props.$isPlaying && `
    background: rgba(16, 185, 129, 0.2);
    border-color: #10b981;
  `}
`;

const SceneName = styled.div`
  color: #e0e0e0;
  font-weight: 500;
  flex: 1;
`;

const SceneTime = styled.div`
  color: #888;
  font-size: 9px;
  margin-left: 8px;
`;

const SceneActions = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button`
  background: ${props => props.$variant === 'delete' ? '#e74c3c' : '#10b981'};
  border: none;
  border-radius: 3px;
  padding: 2px 4px;
  color: white;
  cursor: pointer;
  font-size: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$variant === 'delete' ? '#c0392b' : '#059669'};
  }
`;

const StatusText = styled.div`
  color: #e0e0e0;
  font-size: 10px;
  margin-top: 6px;
  text-align: center;
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: all 0.2s ease;
  border-radius: 4px;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    width: 16px;
    height: 16px;
    transform: rotate(${props => props.$isCollapsed ? '0deg' : '180deg'});
    transition: transform 0.3s ease;
  }
`;

const SceneContent = styled.div`
  display: ${props => props.$isCollapsed ? 'none' : 'block'};
`;

const AnimationProgress = styled.div`
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-top: 6px;
  overflow: hidden;
`;

const ProgressBar = styled.div.attrs(props => ({
  style: {
    width: `${props.$progress}%`,
  },
}))`
  height: 100%;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  border-radius: 2px;
  transition: width 0.3s ease;
`;

const SceneManager = ({ 
  map,
  layerStates,
  onLoadScene
}) => {
  const [scenes, setScenes] = useState([]);
  const [playingSceneId, setPlayingSceneId] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Load scenes from localStorage on component mount
  useEffect(() => {
    console.log('🔄 Loading scenes from localStorage...');
    
    // Check what's in localStorage
    const allKeys = Object.keys(localStorage);
    console.log('🔍 All localStorage keys:', allKeys);
    
    const savedScenes = localStorage.getItem('mapScenes');
    console.log('🔍 Raw savedScenes data:', savedScenes);
    
    if (savedScenes) {
      try {
        const parsedScenes = JSON.parse(savedScenes);
        console.log('📥 Loaded scenes from localStorage:', parsedScenes);
        
        // Validate the loaded scenes
        if (Array.isArray(parsedScenes)) {
          const validScenes = parsedScenes.filter(scene => {
            if (!scene || !scene.id || !scene.name || !scene.timestamp || !scene.camera) {
              console.warn('Invalid scene data found, skipping:', scene);
              return false;
            }
            return true;
          });
          
          console.log(`✅ Loaded ${validScenes.length} valid scenes`);
          setScenes(validScenes);
        } else {
          console.warn('Invalid scenes data format, not an array');
        }
      } catch (error) {
        console.error('Error loading scenes from localStorage:', error);
        // Try to clear corrupted data
        try {
          localStorage.removeItem('mapScenes');
          console.log('Cleared corrupted scene data');
        } catch (clearError) {
          console.error('Failed to clear corrupted scene data:', clearError);
        }
      }
    } else {
      console.log('No saved scenes found in localStorage');
    }
  }, []);

  // Save scenes to localStorage whenever scenes change
  useEffect(() => {
    if (scenes.length === 0) {
      console.log('No scenes to save');
      return;
    }
    
    console.log('💾 Saving scenes to localStorage...', scenes.length, 'scenes');
    try {
      // Only save the scene data, not the entire scenes array which might contain map references
      const scenesToSave = scenes.map(scene => {
        // Validate that scene has all required properties
        if (!scene.id || !scene.name || !scene.timestamp) {
          console.warn('Invalid scene data, skipping:', scene);
          return null;
        }
        
        // Ensure all properties are serializable
        const serializableScene = {
          id: String(scene.id),
          name: String(scene.name),
          timestamp: String(scene.timestamp),
          camera: {
            center: {
              lng: Number(scene.camera.center.lng),
              lat: Number(scene.camera.center.lat)
            },
            zoom: Number(scene.camera.zoom),
            pitch: Number(scene.camera.pitch),
            bearing: Number(scene.camera.bearing)
          },
          layerStates: {},
          allLayerStates: {},
          enhancedFlow: {
            hasActivePopup: Boolean(scene.enhancedFlow?.hasActivePopup),
            popupFeatureId: scene.enhancedFlow?.popupFeatureId ? String(scene.enhancedFlow.popupFeatureId) : null,
            popupCoordinates: scene.enhancedFlow?.popupCoordinates ? [
              Number(scene.enhancedFlow.popupCoordinates[0]),
              Number(scene.enhancedFlow.popupCoordinates[1])
            ] : null,
            hasBuildingHighlights: Boolean(scene.enhancedFlow?.hasBuildingHighlights),
            buildingHighlightLayers: Array.isArray(scene.enhancedFlow?.buildingHighlightLayers) 
              ? scene.enhancedFlow.buildingHighlightLayers.map(String) 
              : [],
            hasRadiusCircles: Boolean(scene.enhancedFlow?.hasRadiusCircles),
            radiusCircleLayers: Array.isArray(scene.enhancedFlow?.radiusCircleLayers) 
              ? scene.enhancedFlow.radiusCircleLayers.map(String) 
              : []
          }
        };
        
        // Add layer states (only boolean values)
        if (scene.layerStates) {
          Object.keys(scene.layerStates).forEach(key => {
            if (typeof scene.layerStates[key] === 'boolean') {
              serializableScene.layerStates[key] = Boolean(scene.layerStates[key]);
            }
          });
        }
        
        // Add all layer states (only boolean values)
        if (scene.allLayerStates) {
          Object.keys(scene.allLayerStates).forEach(key => {
            if (typeof scene.allLayerStates[key] === 'boolean') {
              serializableScene.allLayerStates[key] = Boolean(scene.allLayerStates[key]);
            }
          });
        }
        
        return serializableScene;
      }).filter(scene => scene !== null); // Remove invalid scenes
      
      console.log('💾 Saving serializable scenes:', scenesToSave);
      localStorage.setItem('mapScenes', JSON.stringify(scenesToSave));
      console.log('✅ Successfully saved scenes to localStorage');
    } catch (error) {
      console.error('Error saving scenes to localStorage:', error);
      // If there's still a circular reference, try to save without the problematic data
      try {
        const basicScenes = scenes.map(scene => ({
          id: String(scene.id),
          name: String(scene.name),
          timestamp: String(scene.timestamp),
          camera: {
            center: {
              lng: Number(scene.camera.center.lng),
              lat: Number(scene.camera.center.lat)
            },
            zoom: Number(scene.camera.zoom),
            pitch: Number(scene.camera.pitch),
            bearing: Number(scene.camera.bearing)
          }
        }));
        localStorage.setItem('mapScenes', JSON.stringify(basicScenes));
        console.log('Saved basic scene data (without layer states)');
      } catch (fallbackError) {
        console.error('Failed to save even basic scene data:', fallbackError);
      }
    }
  }, [scenes]);

  // Capture current map state as a scene
  const captureCurrentScene = () => {
    console.log('📸 Capturing current scene...');
    
    if (!map) {
      console.warn('⚠️ Map not available for capture');
      setStatus('Map not available');
      return;
    }

    try {
      // Capture camera state
      const cameraState = {
        center: map.getCenter(),
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing()
      };

      // Capture enhanced flow state (marker click, popup, building highlights, radius circles)
      const enhancedFlowState = {
        hasActivePopup: !!document.querySelector('.mapboxgl-popup'),
        popupFeatureId: null,
        popupCoordinates: null,
        hasBuildingHighlights: map.getLayer('target-buildings') || map.getLayer('nearby-buildings'),
        buildingHighlightLayers: [],
        hasRadiusCircles: map.getLayer('radius-100m') || map.getLayer('radius-300m'),
        radiusCircleLayers: []
      };

      // Capture popup details if exists
      const popupElement = document.querySelector('.mapboxgl-popup');
      if (popupElement && popupElement._featureId) {
        enhancedFlowState.popupFeatureId = popupElement._featureId;
        const popupLngLat = map.unproject([popupElement.offsetLeft, popupElement.offsetTop]);
        enhancedFlowState.popupCoordinates = [popupLngLat.lng, popupLngLat.lat];
      }

      // Capture building highlight layers
      const buildingHighlightLayers = ['target-buildings', 'nearby-buildings'];
      buildingHighlightLayers.forEach(layerId => {
        if (map.getLayer(layerId)) {
          enhancedFlowState.buildingHighlightLayers.push(layerId);
        }
      });

      // Capture radius circle layers
      const radiusCircleLayers = ['radius-100m', 'radius-300m'];
      radiusCircleLayers.forEach(layerId => {
        if (map.getLayer(layerId)) {
          enhancedFlowState.radiusCircleLayers.push(layerId);
        }
      });

      // Capture all layer states
      const allLayerStates = {};
      const style = map.getStyle();
      if (style && style.layers) {
        // Only capture specific layers that we know are safe to restore
        const safeLayers = [
          'sf-bike-network', 'sf-pedestrian-paths', 'sf-pedestrian-crossings',
          'ai-circles', 'ai-circles-stroke',
          'neighborhoods', 'neighborhoods-label',
          'park', 'park-label', 'national-park', 'golf-course', 'pitch', 'grass', 'natural',
          'target-buildings', 'nearby-buildings',
          'radius-100m', 'radius-300m',
          'osm-transit-stops', 'osm-transit-routes',
          'osm-bike-lanes', 'osm-bike-paths', 'osm-bike-parking',
          'osm-pedestrian-paths', 'osm-pedestrian-crossings'
        ];
        
        style.layers.forEach(layer => {
          try {
            // Only capture layers that are in our safe list
            if (safeLayers.includes(layer.id)) {
              const visibility = map.getLayoutProperty(layer.id, 'visibility');
              // Only save if it's a string value
              if (typeof visibility === 'string') {
                allLayerStates[layer.id] = visibility === 'visible';
              }
            }
          } catch (error) {
            // Skip layers that can't be queried
          }
        });
      }

      // Create new scene
      const cleanLayerStates = {};
      if (layerStates) {
        // Extract only the boolean values from layerStates
        Object.keys(layerStates).forEach(key => {
          if (typeof layerStates[key] === 'boolean') {
            cleanLayerStates[key] = layerStates[key];
          }
        });
      }

      // Ensure allLayerStates only contains boolean values
      const cleanAllLayerStates = {};
      Object.keys(allLayerStates).forEach(key => {
        if (typeof allLayerStates[key] === 'boolean') {
          cleanAllLayerStates[key] = allLayerStates[key];
        }
      });

      const newScene = {
        id: Date.now().toString(),
        name: `Scene ${scenes.length + 1}`,
        timestamp: new Date().toISOString(),
        camera: cameraState,
        layerStates: cleanLayerStates, // Clean copy with only boolean values
        allLayerStates: cleanAllLayerStates, // Clean copy with only boolean values
        enhancedFlow: enhancedFlowState
      };

      setScenes(prevScenes => [...prevScenes, newScene]);
      setStatus(`Scene saved at ${new Date().toLocaleTimeString()}`);

    } catch (error) {
      console.error('❌ Error capturing scene:', error);
      setStatus('Error capturing scene');
    }
  };

  // Play a specific scene
  const playScene = async (scene) => {
    if (!scene || !map) {
      console.warn('⚠️ No scene or map available');
      setStatus('No scene available');
      return;
    }

    // Wait for map style to be loaded if it's not ready
    if (!map.isStyleLoaded()) {
      console.log('⏳ Map style not loaded, waiting...');
      setStatus('Waiting for map...');
      
      // Wait for style to load with timeout and event listener
      const maxWaitTime = 10000; // 10 seconds
      const startTime = Date.now();
      
      try {
        await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Map style load timeout'));
          }, maxWaitTime);
          
          const checkStyle = () => {
            if (map.isStyleLoaded()) {
              clearTimeout(timeoutId);
              resolve();
            } else {
              setTimeout(checkStyle, 100);
            }
          };
          
          // Start checking
          checkStyle();
          
          // Also listen for the style.load event as backup
          const handleStyleLoad = () => {
            clearTimeout(timeoutId);
            resolve();
          };
          
          map.once('style.load', handleStyleLoad);
        });
        
        console.log('✅ Map style loaded, proceeding with scene restoration');
      } catch (error) {
        console.warn('⚠️ Map style still not loaded after timeout:', error.message);
        setStatus('Map not ready');
        return;
      }
    }

    // Additional safety check - ensure map is fully ready
    if (!map || !map.isStyleLoaded()) {
      console.warn('⚠️ Map still not ready after waiting');
      setStatus('Map not ready');
      return;
    }

    console.log('▶️ Playing scene:', scene.name);
    setPlayingSceneId(scene.id);
    setStatus('Loading scene...');
    setAnimationProgress(0);

    try {
      // Animate camera over 3 seconds
      const duration = 3000;
      const startTime = Date.now();
      
      const animateCamera = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        setAnimationProgress(progress * 100);

        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        } else {
          console.log('✅ Scene animation completed');
          setPlayingSceneId(null);
          setStatus('Scene loaded');
          setAnimationProgress(0);
        }
      };

      // Start camera animation
      map.easeTo({
        center: [scene.camera.center.lng, scene.camera.center.lat],
        zoom: scene.camera.zoom,
        pitch: scene.camera.pitch,
        bearing: scene.camera.bearing,
        duration: duration
      });

      // Start progress animation
      animateCamera();

      // Restore all layer states
      if (scene.allLayerStates) {
        console.log('🎨 Restoring all layer states...');
        
        // Wait a bit for sources to be ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        Object.entries(scene.allLayerStates).forEach(([layerId, isVisible]) => {
          try {
            // Skip AI startups layers - they're managed by the toggle system
            if (layerId === 'ai-startups-points' || layerId === 'ai-startups-labels') {
              return;
            }
            
            // Skip certain problematic layers that might cause issues
            const skipLayers = [
              'ai-startups-points', 'ai-startups-labels',
              'background', 'background-pattern',
              'landuse', 'landuse-overlay',
              'water', 'waterway', 'water-label',
              'road', 'road-label',
              'building', 'building-outline',
              'poi', 'poi-label',
              'place', 'place-label',
              'boundary', 'boundary-label',
              'admin', 'admin-label',
              'settlement', 'settlement-label',
              'state', 'state-label',
              'country', 'country-label'
            ];
            
            if (skipLayers.includes(layerId)) {
              return;
            }
            
            // Only restore layers that actually exist
            if (map.getLayer(layerId)) {
              map.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none');
            }
          } catch (error) {
            console.warn(`Could not restore layer ${layerId}:`, error);
          }
        });
      }

      // Restore toggle states
      if (scene.layerStates && onLoadScene) {
        console.log('🔄 Restoring toggle states...');
        try {
          onLoadScene(scene.layerStates);
        } catch (error) {
          console.warn('⚠️ Error restoring toggle states:', error);
        }
      }

      // Restore enhanced flow state
      if (scene.enhancedFlow) {
        console.log('🎬 Restoring enhanced flow state...');
        
        const enhancedFlow = scene.enhancedFlow;
        
        if (enhancedFlow.hasActivePopup && enhancedFlow.popupFeatureId) {
          // Wait for AI startups source to be loaded
          let attempts = 0;
          const maxAttempts = 50; // 5 seconds
          
          const checkSource = () => {
            const source = map.getSource('ai-startups');
            if (source && source._data && source._data.features) {
              const feature = source._data.features.find(f => f.id === enhancedFlow.popupFeatureId);
              if (feature && window.triggerEnhancedMarkerClick) {
                setTimeout(() => {
                  if (!map || !map.isStyleLoaded()) {
                    return;
                  }
                  
                  try {
                    window.triggerEnhancedMarkerClick(map, feature, feature.geometry.coordinates);
                  } catch (error) {
                    console.error('❌ Error triggering enhanced marker click:', error);
                  }
                }, duration + 1000);
              }
            } else if (attempts < maxAttempts) {
              attempts++;
              setTimeout(checkSource, 100);
            }
          };
          
          checkSource();
        }
      }

    } catch (error) {
      console.error('❌ Error during scene playback:', error);
      setPlayingSceneId(null);
      setStatus('Scene playback failed');
      setAnimationProgress(0);
    }
  };

  // Delete a scene
  const deleteScene = (sceneId) => {
    setScenes(prevScenes => prevScenes.filter(scene => scene.id !== sceneId));
    setStatus('Scene deleted');
  };

  // Handle save button click
  const handleSaveClick = () => {
    captureCurrentScene();
  };

  return (
    <SceneContainer $isCollapsed={isCollapsed}>
      <SceneHeader $isCollapsed={isCollapsed}>
        {isCollapsed ? (
          <CollapseButton
            onClick={() => setIsCollapsed(!isCollapsed)}
            $isCollapsed={isCollapsed}
            title="Expand scenes panel"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </CollapseButton>
        ) : (
          <>
            <SceneTitle $isCollapsed={isCollapsed}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Scenes
            </SceneTitle>
            <CollapseButton
              onClick={() => setIsCollapsed(!isCollapsed)}
              $isCollapsed={isCollapsed}
              title="Collapse scenes panel"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </CollapseButton>
          </>
        )}
      </SceneHeader>

      <SceneContent $isCollapsed={isCollapsed}>
        <SaveButton onClick={handleSaveClick}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Save Current Scene
        </SaveButton>

        <SceneList>
          {scenes.map((scene) => (
            <SceneItem 
              key={scene.id}
              onClick={() => playScene(scene)}
              $isPlaying={playingSceneId === scene.id}
            >
              <SceneName>{scene.name}</SceneName>
              <SceneTime>{new Date(scene.timestamp).toLocaleTimeString()}</SceneTime>
              <SceneActions>
                <ActionButton
                  $variant="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteScene(scene.id);
                  }}
                >
                  ×
                </ActionButton>
              </SceneActions>
            </SceneItem>
          ))}
        </SceneList>

        {animationProgress > 0 && (
          <AnimationProgress>
            <ProgressBar $progress={animationProgress} />
          </AnimationProgress>
        )}

        <StatusText>
          {status}
        </StatusText>
      </SceneContent>
    </SceneContainer>
  );
};

export default SceneManager; 