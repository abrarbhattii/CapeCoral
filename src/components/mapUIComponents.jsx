import React, { useState, useEffect, useRef } from 'react';

// Scene Transition Hook - shared between Navigator and Legend
export const useSceneTransition = () => {
  const [transitionState, setTransitionState] = useState({
    isTransitioning: false,
    changedLayers: new Set(),
    transitionId: null,
    transitionType: 'none' // 'scene-sync', 'manual', 'none'
  });

  const triggerSceneTransition = (oldState, newState, type = 'scene-sync') => {
    const changes = new Set();
    Object.keys(newState).forEach(key => {
      if (oldState[key] !== newState[key]) {
        changes.add(key);
      }
    });

    const transitionId = Date.now();
    setTransitionState({
      isTransitioning: true,
      changedLayers: changes,
      transitionId,
      transitionType: type
    });

    // Clear transition state after animation completes
    setTimeout(() => {
      setTransitionState(prev => 
        prev.transitionId === transitionId 
          ? { isTransitioning: false, changedLayers: new Set(), transitionId: null, transitionType: 'none' }
          : prev
      );
    }, 2000);
  };

  return { transitionState, triggerSceneTransition };
};

// Enhanced Layer Control Component with Pulse Animation
const LayerControl = ({ 
  label, 
  isVisible, 
  onClick, 
  hasData, 
  color, 
  complexity,
  isPulsing = false,
  transitionType = 'none', // 'activated', 'deactivated', 'none'
  layerKey = '' // Used to identify the layer for animations
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle click with brief flash animation
  const handleClick = () => {
    setIsAnimating(true);
    onClick();
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Dynamic styles based on animation state
  const getAnimationStyles = () => {
    let styles = {};

    // Scene pulse animation
    if (isPulsing) {
      styles = {
        animation: `scenePulse 1.5s ease-out`,
        boxShadow: `0 0 15px ${color}40, 0 0 25px ${color}20`,
        transform: 'scale(1.02)',
        zIndex: 10
      };
    }

    // Transition glow effect
    if (transitionType !== 'none') {
      const transitionColor = transitionType === 'activated' ? color : '#ef4444';
      styles = {
        ...styles,
        background: `linear-gradient(90deg, ${transitionColor}20, transparent, ${transitionColor}20)`,
        backgroundSize: '200% 100%',
        animation: `${styles.animation ? styles.animation + ', ' : ''}slideGlow 1s ease-out`
      };
    }

    // Click animation
    if (isAnimating) {
      styles = {
        ...styles,
        transform: 'scale(0.98)',
        transition: 'transform 0.1s ease-out'
      };
    }

    return styles;
  };

  return (
    <div 
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 6px',
        borderRadius: '3px',
        cursor: 'pointer',
        backgroundColor: isVisible ? 'rgba(59, 130, 246, 0.2)' : 'rgba(75, 85, 99, 0.2)',
        border: `1px solid ${isVisible ? color : 'rgba(75, 85, 99, 0.3)'}`,
        fontSize: '8px',
        transition: isPulsing ? 'none' : 'all 0.2s ease',
        opacity: hasData ? 1 : 0.5,
        position: 'relative',
        ...getAnimationStyles()
      }}
      onMouseEnter={(e) => {
        if (!isPulsing) {
          e.currentTarget.style.backgroundColor = isVisible ? 'rgba(59, 130, 246, 0.3)' : 'rgba(75, 85, 99, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isPulsing) {
          e.currentTarget.style.backgroundColor = isVisible ? 'rgba(59, 130, 246, 0.2)' : 'rgba(75, 85, 99, 0.2)';
        }
      }}
    >
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '2px',
        backgroundColor: color,
        marginRight: '6px',
        opacity: isVisible ? 1 : 0.5,
        animation: isPulsing ? 'colorPulse 1.5s ease-out' : 'none'
      }} />
      <span style={{ 
        flex: 1, 
        fontWeight: isVisible ? '600' : '400',
        color: isVisible ? '#e2e8f0' : '#94a3b8'
      }}>
        {label}
      </span>
      {complexity && (
        <span style={{ 
          fontSize: '7px', 
          color: complexity === 'high' ? '#ef4444' : complexity === 'medium' ? '#f59e0b' : '#10b981',
          fontWeight: '600'
        }}>
          {complexity === 'high' ? '⚡' : complexity === 'medium' ? '⚡' : '⚡'}
        </span>
      )}
      {!hasData && (
        <span style={{ 
          fontSize: '7px', 
          color: '#6b7280',
          marginLeft: '4px'
        }}>
          ⏳
        </span>
      )}
      {/* Scene sync indicator */}
      {isPulsing && (
        <div style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          width: '6px',
          height: '6px',
          backgroundColor: '#60a5fa',
          borderRadius: '50%',
          animation: 'syncIndicator 1.5s ease-out'
        }} />
      )}
    </div>
  );
};

// Population 65+ Color Legend Component
const Population65Legend = ({ isVisible }) => {
  if (!isVisible) return null;
  
  const colorLevels = [
    { label: 'Very Low (0-100) - 1% opacity', color: '#FF0000', opacity: 0.01 },
    { label: 'Low (100-200) - 20% opacity', color: '#FF0000', opacity: 0.1 },
    { label: 'Medium-Low (200-300) - 40% opacity', color: '#FF0000', opacity: 0.4 },
    { label: 'Medium (300-400) - 60% opacity', color: '#FF0000', opacity: 0.6 },
    { label: 'Medium-High (400-500) - 80% opacity', color: '#FF0000', opacity: 0.8 },
    { label: 'High (500+) - 90% opacity', color: '#FF0000', opacity: 0.9 }
  ];

  return (
    <div style={{
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid #444',
      borderRadius: '4px',
      padding: '8px',
      marginTop: '8px',
      fontSize: '11px',
      maxWidth: '200px',
      color: '#fff'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '12px', color: '#fff' }}>
        Population 65+ Legend
      </div>
      {colorLevels.map((level, index) => (
        <div key={index} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '2px',
          fontSize: '10px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: level.color,
            opacity: level.opacity,
            border: '0px solid #666',
            marginRight: '6px',
            borderRadius: '2px'
          }} />
          <span style={{ color: '#fff' }}>{level.label}</span>
        </div>
      ))}
    </div>
  );
};

// Legend Component
export const MapLegend = ({ 
  layerVisibility, 
  toggleLayerVisibility, 
  layerComplexity, 
  renderCapacity, 
  mountedLayers,
  viewState,
  // Data states
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
  blockGroupBoundariesData,
  blocksData,
  handleParksToggle,
  parksEnabled,
  // Scene transition props
  sceneTransitionState = null
}) => {
  const { transitionState, triggerSceneTransition } = useSceneTransition();
  const previousLayerVisibility = useRef(layerVisibility);
  const [internalTransitionState, setInternalTransitionState] = useState({
    isTransitioning: false,
    changedLayers: new Set(),
    transitionType: 'none'
  });

  // Use external scene transition state if provided, otherwise use internal
  const activeTransitionState = sceneTransitionState || transitionState;

  // Detect layer visibility changes and trigger animations
  useEffect(() => {
    const detectLayerChanges = () => {
      const changes = new Set();
      const transitionTypes = new Map();

      Object.keys(layerVisibility).forEach(layer => {
        if (layerVisibility[layer] !== previousLayerVisibility.current[layer]) {
          changes.add(layer);
          transitionTypes.set(layer, layerVisibility[layer] ? 'activated' : 'deactivated');
        }
      });

      // Also check parks state
      if (parksEnabled !== previousLayerVisibility.current.parksEnabled) {
        changes.add('parks');
        transitionTypes.set('parks', parksEnabled ? 'activated' : 'deactivated');
      }

      if (changes.size > 0) {
        // If external scene transition state isn't provided, use internal
        if (!sceneTransitionState) {
          setInternalTransitionState({
            isTransitioning: true,
            changedLayers: changes,
            transitionType: 'manual'
          });

          setTimeout(() => {
            setInternalTransitionState({
              isTransitioning: false,
              changedLayers: new Set(),
              transitionType: 'none'
            });
          }, 2000);
        }
      }

      // Update previous state
      previousLayerVisibility.current = { ...layerVisibility, parksEnabled };
    };

    detectLayerChanges();
  }, [layerVisibility, parksEnabled, sceneTransitionState]);

  // Helper function to determine if a layer should pulse
  const shouldLayerPulse = (layerKey) => {
    return activeTransitionState.isTransitioning && activeTransitionState.changedLayers.has(layerKey);
  };

  // Helper function to get transition type for a layer
  const getLayerTransitionType = (layerKey) => {
    if (!activeTransitionState.isTransitioning || !activeTransitionState.changedLayers.has(layerKey)) {
      return 'none';
    }
    return layerVisibility[layerKey] ? 'activated' : 'deactivated';
  };

  // Dynamic border pulse styles
  const getBorderPulseStyles = () => {
    if (activeTransitionState.isTransitioning && activeTransitionState.transitionType === 'scene-sync') {
      return {
        border: '2px solid #60a5fa',
        boxShadow: '0 0 0 0 rgba(96, 165, 250, 0.4)',
        animation: 'legendBorderPulse 2s ease-out',
        transform: 'scale(1.01)',
        // Enhanced background during pulse
        background: `
          linear-gradient(135deg, 
            rgba(15, 23, 42, 0.95) 0%,
            rgba(30, 41, 59, 0.9) 50%,
            rgba(15, 23, 42, 0.95) 100%
          )
        `,
        // Inner glow effect
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      };
    }
    return {
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
      backgroundColor: 'rgba(15, 23, 42, 0.9)'
    };
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      color: '#e2e8f0',
      padding: '12px',
      fontFamily: "'Inter', sans-serif",
      maxWidth: '280px',
      transition: activeTransitionState.isTransitioning ? 'none' : 'all 0.3s ease',
      // Add subtle border-radius enhancement during pulse
      borderRadius: activeTransitionState.isTransitioning && activeTransitionState.transitionType === 'scene-sync' ? '8px' : '6px',
      ...getBorderPulseStyles()
    }}>
      {/* Enhanced Header with Scene Sync Indicator */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '6px',
        justifyContent: 'space-between'
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '14px', 
          fontWeight: '600',
          // Header glow during scene sync
          textShadow: activeTransitionState.isTransitioning && activeTransitionState.transitionType === 'scene-sync'
            ? '0 0 8px rgba(96, 165, 250, 0.6), 0 0 16px rgba(96, 165, 250, 0.3)'
            : 'none',
          transition: 'text-shadow 0.3s ease'
        }}>
          Multi-Peril Analysis
        </h3>
        {activeTransitionState.isTransitioning && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            animation: 'sceneSync 2s ease-out',
            fontSize: '10px',
            color: '#60a5fa',
            fontWeight: '600'
          }}>
            <span style={{ 
              marginRight: '4px',
              animation: 'syncSpin 1s linear infinite'
            }}>⚡</span>
            {activeTransitionState.transitionType === 'scene-sync' ? 'Scene Sync' : 'Updating...'}
          </div>
        )}
      </div>
      
      {/* Render Capacity Indicator */}
      <div style={{ 
        marginBottom: '12px', 
        padding: '8px', 
        borderRadius: '4px',
        backgroundColor: renderCapacity.isCritical ? 'rgba(239, 68, 68, 0.2)' : 
                        renderCapacity.isWarning ? 'rgba(245, 158, 11, 0.2)' : 
                        'rgba(34, 197, 94, 0.2)',
        border: `1px solid ${renderCapacity.isCritical ? '#ef4444' : 
                            renderCapacity.isWarning ? '#f59e0b' : 
                            '#22c55e'}`,
        fontSize: '11px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '4px'
        }}>
          <span style={{ fontWeight: '600' }}>Water Capacity:</span>
          <span style={{ 
            color: renderCapacity.isCritical ? '#ef4444' : 
                   renderCapacity.isWarning ? '#f59e0b' : 
                   '#22c55e',
            fontWeight: '600'
          }}>
            {renderCapacity.currentLoad}%
          </span>
        </div>
        <div style={{ 
          width: '100%', 
          height: '4px', 
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${renderCapacity.currentLoad}%`,
            height: '100%',
            backgroundColor: renderCapacity.isCritical ? '#ef4444' : 
                           renderCapacity.isWarning ? '#f59e0b' : 
                           '#22c55e',
            transition: 'width 0.3s ease'
          }} />
        </div>
        {renderCapacity.isCritical && (
          <div style={{ 
            marginTop: '4px', 
            color: '#ef4444', 
            fontSize: '10px',
            fontWeight: '600'
          }}>
            ⚠️ Critical: Consider disabling some layers
          </div>
        )}
        {renderCapacity.isWarning && !renderCapacity.isCritical && (
          <div style={{ 
            marginTop: '4px', 
            color: '#f59e0b', 
            fontSize: '10px',
            fontWeight: '600'
          }}>
            ⚠️ Warning: High load detected
          </div>
        )}
      </div>
      
      {/* Memory Status Indicator */}
      <div style={{ 
        marginBottom: '8px', 
        padding: '4px 8px', 
        backgroundColor: 'rgba(16, 185, 129, 0.1)', 
        borderRadius: '4px',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        fontSize: '9px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>💾 Flood Zone Status:</span>
          <span style={{ fontWeight: '600', color: '#10b981' }}>
            {mountedLayers.size} layers mounted
          </span>
        </div>
        <div style={{ fontSize: '8px', opacity: 0.7, marginTop: '2px' }}>
          Layers are unmounted when turned off to free memory
        </div>
        {/* Smart rendering indicator */}
        {layerVisibility.buildings && buildingsData && viewState.zoom < 10 && (
          <div style={{ 
            fontSize: '8px', 
            color: '#f59e0b', 
            marginTop: '4px',
            fontWeight: '600'
          }}>
            🏗️ Buildings: Very light rendering for overview
          </div>
        )}
        {layerVisibility.buildings && buildingsData && viewState.zoom >= 10 && viewState.zoom < 12 && (
          <div style={{ 
            fontSize: '8px', 
            color: '#f59e0b', 
            marginTop: '4px',
            fontWeight: '600'
          }}>
            🏗️ Buildings: Light detail for medium view
          </div>
        )}
        {layerVisibility.buildings && buildingsData && viewState.zoom >= 12 && viewState.zoom < 14 && (
          <div style={{ 
            fontSize: '8px', 
            color: '#10b981', 
            marginTop: '4px',
            fontWeight: '600'
          }}>
            ⚡ Buildings: Optimized for performance
          </div>
        )}
        {layerVisibility.buildings && buildingsData && viewState.zoom >= 14 && viewState.zoom < 16 && (
          <div style={{ 
            fontSize: '8px', 
            color: '#10b981', 
            marginTop: '4px',
            fontWeight: '600'
          }}>
            🏗️ Buildings: Enhanced 3D detail
          </div>
        )}
        {layerVisibility.buildings && buildingsData && viewState.zoom >= 16 && (
          <div style={{ 
            fontSize: '8px', 
            color: '#3b82f6', 
            marginTop: '4px',
            fontWeight: '600'
          }}>
            🎯 Buildings: Full 3D rendering
          </div>
        )}
      </div>
      
      {/* Interactive Layer Controls */}
      <div style={{ fontSize: '10px', opacity: 0.9 }}>
        <div style={{ marginBottom: '8px', fontWeight: '600' }}>Layer Controls (Click to Toggle):</div>
        
        {/* Flood Zone Layers */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: '#60a5fa' }}>Flood Zones:</div>
          <div style={{ display: 'grid', gap: '2px' }}>
            <LayerControl 
              label="Flood Zones" 
              isVisible={layerVisibility.floodZones} 
              onClick={() => toggleLayerVisibility('floodZones')}
              hasData={floodZonesData}
              color="#3b82f6"
              layerKey="floodZones"
              isPulsing={shouldLayerPulse('floodZones')}
              transitionType={getLayerTransitionType('floodZones')}
            />
            <LayerControl 
              label="Coastal Flood Zones" 
              isVisible={layerVisibility.coastalFloodZones} 
              onClick={() => toggleLayerVisibility('coastalFloodZones')}
              hasData={coastalFloodZonesData}
              color="#06b6d4"
              layerKey="coastalFloodZones"
              isPulsing={shouldLayerPulse('coastalFloodZones')}
              transitionType={getLayerTransitionType('coastalFloodZones')}
            />
            
            
            <LayerControl 
              label="Coastal Extension" 
              isVisible={layerVisibility.coastalExtensionFloodZones} 
              onClick={() => toggleLayerVisibility('coastalExtensionFloodZones')}
              hasData={coastalExtensionFloodZonesData}
              color="#155e75"
              layerKey="coastalExtensionFloodZones"
              isPulsing={shouldLayerPulse('coastalExtensionFloodZones')}
              transitionType={getLayerTransitionType('coastalExtensionFloodZones')}
            />
            <LayerControl 
              label="Flood Max" 
              isVisible={layerVisibility.floodMax} 
              onClick={() => toggleLayerVisibility('floodMax')}
              hasData={floodMaxData}
              color="#164e63"
              layerKey="floodMax"
              isPulsing={shouldLayerPulse('floodMax')}
              transitionType={getLayerTransitionType('floodMax')}
            />
            <LayerControl 
              label="USACE" 
              isVisible={layerVisibility.usace} 
              onClick={() => toggleLayerVisibility('usace')}
              hasData={usaceData}
              color="#1e40af"
              layerKey="usace"
              isPulsing={shouldLayerPulse('usace')}
              transitionType={getLayerTransitionType('usace')}
            />
          </div>
        </div>

        {/* Infrastructure Layers */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: '#f59e0b' }}>Infrastructure:</div>
          <div style={{ display: 'grid', gap: '2px' }}>
            <LayerControl 
              label="Zip Code Boundaries" 
              isVisible={layerVisibility.zipCodeBoundaries} 
              onClick={() => toggleLayerVisibility('zipCodeBoundaries')}
              hasData={zipCodeBoundariesData}
              color="#f59e0b"
              layerKey="zipCodeBoundaries"
              isPulsing={shouldLayerPulse('zipCodeBoundaries')}
              transitionType={getLayerTransitionType('zipCodeBoundaries')}
            />
            <LayerControl 
              label="Hurricane Milton" 
              isVisible={layerVisibility.hurricaneMilton} 
              onClick={() => toggleLayerVisibility('hurricaneMilton')}
              hasData={hurricaneMiltonData}
              color="#dc2626"
              layerKey="hurricaneMilton"
              isPulsing={shouldLayerPulse('hurricaneMilton')}
              transitionType={getLayerTransitionType('hurricaneMilton')}
            />
            <LayerControl 
              label="3D Buildings" 
              isVisible={layerVisibility.buildings} 
              onClick={() => toggleLayerVisibility('buildings')}
              hasData={buildingsData}
              color="#10b981"
              complexity={layerComplexity.buildings}
              layerKey="buildings"
              isPulsing={shouldLayerPulse('buildings')}
              transitionType={getLayerTransitionType('buildings')}
            />
            <LayerControl 
              label="Roads" 
              isVisible={layerVisibility.roads} 
              onClick={() => toggleLayerVisibility('roads')}
              hasData={roadsData}
              color="#6b7280"
              layerKey="roads"
              isPulsing={shouldLayerPulse('roads')}
              transitionType={getLayerTransitionType('roads')}
            />
            <LayerControl 
              label="Paths" 
              isVisible={layerVisibility.paths} 
              onClick={() => toggleLayerVisibility('paths')}
              hasData={pathsData}
              color="#9ca3af"
              layerKey="paths"
              isPulsing={shouldLayerPulse('paths')}
              transitionType={getLayerTransitionType('paths')}
            />
            <LayerControl 
              label="Block Group Boundaries (Population 65+)" 
              isVisible={layerVisibility.blockGroupBoundaries} 
              onClick={() => toggleLayerVisibility('blockGroupBoundaries')}
              hasData={blockGroupBoundariesData}
              color="#6366f1"
              layerKey="blockGroupBoundaries"
              isPulsing={shouldLayerPulse('blockGroupBoundaries')}
              transitionType={getLayerTransitionType('blockGroupBoundaries')}
            />
            <Population65Legend isVisible={layerVisibility.blockGroupBoundaries} />
            <LayerControl 
              label="Blocks" 
              isVisible={layerVisibility.blocks} 
              onClick={() => toggleLayerVisibility('blocks')}
              hasData={blocksData}
              color="#fbbf24"
              layerKey="blocks"
              isPulsing={shouldLayerPulse('blocks')}
              transitionType={getLayerTransitionType('blocks')}
            />
            <LayerControl 
              label="Parks & Open Spaces" 
              isVisible={parksEnabled} 
              onClick={() => handleParksToggle(!parksEnabled)}
              hasData={true} // Parks are always available from Mapbox
              color="#22c55e"
              layerKey="parks"
              isPulsing={shouldLayerPulse('parks')}
              transitionType={parksEnabled ? 'activated' : 'deactivated'}
            />
          </div>
        </div>

        {/* Property & POI Layers */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: '#ec4899' }}>Properties & POIs:</div>
          <div style={{ display: 'grid', gap: '2px' }}>
            <LayerControl 
              label="Redfin Properties" 
              isVisible={layerVisibility.redfinProperties} 
              onClick={() => toggleLayerVisibility('redfinProperties')}
              hasData={redfinPropertiesData}
              color="#ec4899"
              layerKey="redfinProperties"
              isPulsing={shouldLayerPulse('redfinProperties')}
              transitionType={getLayerTransitionType('redfinProperties')}
            />
            <LayerControl 
              label="Commercial POIs" 
              isVisible={layerVisibility.commercialPois} 
              onClick={() => toggleLayerVisibility('commercialPois')}
              hasData={commercialPoisData}
              color="#8b5cf6"
              layerKey="commercialPois"
              isPulsing={shouldLayerPulse('commercialPois')}
              transitionType={getLayerTransitionType('commercialPois')}
            />
            <LayerControl 
              label="Social POIs" 
              isVisible={layerVisibility.socialPois} 
              onClick={() => toggleLayerVisibility('socialPois')}
              hasData={socialPoisData}
              color="#a855f7"
              layerKey="socialPois"
              isPulsing={shouldLayerPulse('socialPois')}
              transitionType={getLayerTransitionType('socialPois')}
            />
            <LayerControl 
              label="Environmental POIs" 
              isVisible={layerVisibility.environmentalPois} 
              onClick={() => toggleLayerVisibility('environmentalPois')}
              hasData={environmentalPoisData}
              color="#7c3aed"
              layerKey="environmentalPois"
              isPulsing={shouldLayerPulse('environmentalPois')}
              transitionType={getLayerTransitionType('environmentalPois')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Popup Component
export const MapPopup = ({ popupInfo, setPopupInfo }) => {
  if (!popupInfo) return null;

  return (
    <div style={{
      position: 'absolute',
      left: `${popupInfo.point.x}px`,
      top: `${popupInfo.point.y}px`,
      transform: 'translate(-50%, -100%)',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      color: '#e2e8f0',
      padding: popupInfo.isHurricaneMilton ? '12px' : '16px',
      borderRadius: '8px',
      fontFamily: "'Inter', sans-serif",
      minWidth: popupInfo.isHurricaneMilton ? '220px' : '280px',
      maxWidth: popupInfo.isHurricaneMilton ? '240px' : '320px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 1000,
      marginTop: '-10px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: popupInfo.isHurricaneMilton ? '8px' : '12px' }}>
        <h3 style={{ margin: '0', fontSize: popupInfo.isHurricaneMilton ? '14px' : '16px', fontWeight: '600' }}>
          {popupInfo.isHurricaneMilton ? 'Hurricane Milton Claim' : popupInfo.floodZone ? (popupInfo.isOptimizedCoastal ? `Optimized Coastal Flood Zone ${popupInfo.floodZone}` : popupInfo.isCoastal ? `Coastal Flood Zone ${popupInfo.floodZone}` : popupInfo.isUltraSimplifiedMega ? `Ultra-Simplified Mega Flood Zone ${popupInfo.floodZone}` : popupInfo.isCoastalExtension ? `Coastal Extension Flood Zone ${popupInfo.floodZone}` : popupInfo.isFloodMax ? `Flood Max Zone ${popupInfo.floodZone}` : popupInfo.isUsace ? `USACE ${popupInfo.regulatoryType}` : `Flood Zone ${popupInfo.floodZone}`) : popupInfo.address}
        </h3>
        <button 
          onClick={() => setPopupInfo(null)}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
        {popupInfo.floodZone ? (
          // Flood zone info
          <>
            <div style={{ marginBottom: '8px' }}>
              <strong>Risk Level:</strong> {popupInfo.riskLevel}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Insurance Required:</strong> {popupInfo.insuranceRequired}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Data Source:</strong> {popupInfo.dataSource}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Area:</strong> {popupInfo.areaSqKm} sq km
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Coordinates:</strong> {popupInfo.lngLat.lng.toFixed(4)}, {popupInfo.lngLat.lat.toFixed(4)}
            </div>
          </>
        ) : popupInfo.isUsace ? (
          // USACE info
          <>
            <div style={{ marginBottom: '8px' }}>
              <strong>Agency:</strong> {popupInfo.agency}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Branch:</strong> {popupInfo.branch}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Permits Section:</strong> {popupInfo.permitsSection}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Description:</strong> {popupInfo.description}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Jurisdiction:</strong> {popupInfo.jurisdiction}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Acquisition Date:</strong> {popupInfo.acquisitionDate}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Coordinates:</strong> {popupInfo.lngLat.lng.toFixed(4)}, {popupInfo.lngLat.lat.toFixed(4)}
            </div>
          </>
        ) : popupInfo.isZipCodeBoundary ? (
          // Zip Code Boundary info
          <>
            <div style={{ marginBottom: '8px' }}>
              <strong>Zip Code:</strong> {popupInfo.zipCode}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Risk Level:</strong> {popupInfo.riskLevel}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Base Annual Premium:</strong> ${popupInfo.baseAnnualPremium?.toLocaleString()}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Foreclosure Risk Score:</strong> {popupInfo.foreclosureRiskScore?.toFixed(1)}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Risk Category:</strong> {popupInfo.foreclosureRiskCategory}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>6-Month Foreclosure Probability:</strong> {popupInfo.foreclosureProbability6Months?.toFixed(2)}%
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>12-Month Foreclosure Probability:</strong> {popupInfo.foreclosureProbability12Months?.toFixed(2)}%
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Insurance Companies:</strong> {popupInfo.companiesCount}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Coordinates:</strong> {popupInfo.lngLat.lng.toFixed(4)}, {popupInfo.lngLat.lat.toFixed(4)}
            </div>
          </>
        ) : popupInfo.isHurricaneMilton ? (
          // Hurricane Milton Damage info - Compact Design
          <>
            {/* Key Dates Section */}
            <div style={{ 
              marginBottom: '12px', 
              padding: '8px', 
              backgroundColor: 'rgba(59, 130, 246, 0.1)', 
              borderRadius: '4px',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#3b82f6', marginBottom: '4px' }}>
                KEY DATES
              </div>
              <div style={{ fontSize: '11px', marginBottom: '2px' }}>
                <strong>Date of Loss:</strong> {new Date(popupInfo.dateOfLoss).toLocaleDateString()}
              </div>
              <div style={{ fontSize: '11px', marginBottom: '2px' }}>
                <strong>Days from Landfall:</strong> {popupInfo.daysFromLandfall}
              </div>
              <div style={{ fontSize: '11px' }}>
                <strong>Phase:</strong> {popupInfo.isPreLandfall ? 'Pre-Landfall' : popupInfo.isLandfallDay ? 'Landfall Day' : 'Post-Landfall'}
              </div>
            </div>
            
            {/* Damage & Payout Section */}
            <div style={{ 
              padding: '8px', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: '4px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#ef4444', marginBottom: '4px' }}>
                DAMAGE & PAYOUT
              </div>
              <div style={{ fontSize: '11px', marginBottom: '2px' }}>
                <strong>Total Damage:</strong> ${popupInfo.totalDamage?.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', marginBottom: '2px' }}>
                <strong>Building Damage:</strong> ${popupInfo.buildingDamage?.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', marginBottom: '2px' }}>
                <strong>Contents Damage:</strong> ${popupInfo.contentsDamage?.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', marginBottom: '2px' }}>
                <strong>Total Payout:</strong> ${popupInfo.totalPayout?.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px' }}>
                <strong>Payout Gap:</strong> ${popupInfo.payoutGap?.toLocaleString()}
              </div>
            </div>
          </>
        ) : (
          // Property info
          <>
            <div style={{ marginBottom: '8px' }}>
              <strong>Address:</strong> {popupInfo.address}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Zip Code:</strong> {popupInfo.zipCode}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Price:</strong> {popupInfo.price}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Beds:</strong> {popupInfo.beds} | <strong>Baths:</strong> {popupInfo.baths}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Sq Ft:</strong> {popupInfo.sqft}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Risk Level:</strong> {popupInfo.riskLevel}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Coordinates:</strong> {popupInfo.lngLat.lng.toFixed(4)}, {popupInfo.lngLat.lat.toFixed(4)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Add CSS animations for scene synchronization
const animationStyles = `
  @keyframes scenePulse {
    0% { 
      transform: scale(1);
      box-shadow: 0 0 0 rgba(96, 165, 250, 0);
    }
    50% { 
      transform: scale(1.03);
      box-shadow: 0 0 20px rgba(96, 165, 250, 0.4);
    }
    100% { 
      transform: scale(1);
      box-shadow: 0 0 0 rgba(96, 165, 250, 0);
    }
  }

  @keyframes slideGlow {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes sceneSync {
    0% { opacity: 0; transform: translateX(-10px); }
    20% { opacity: 1; transform: translateX(0); }
    80% { opacity: 1; transform: translateX(0); }
    100% { opacity: 0; transform: translateX(10px); }
  }

  @keyframes syncSpin {
    0% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(90deg) scale(1.1); }
    50% { transform: rotate(180deg) scale(1); }
    75% { transform: rotate(270deg) scale(1.1); }
    100% { transform: rotate(360deg) scale(1); }
  }

  @keyframes syncIndicator {
    0% { 
      opacity: 0; 
      transform: scale(0); 
    }
    50% { 
      opacity: 1; 
      transform: scale(1.2); 
    }
    100% { 
      opacity: 0; 
      transform: scale(0); 
    }
  }

  @keyframes colorPulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
  }

  @keyframes legendBorderPulse {
    0% { 
      border-color: rgba(96, 165, 250, 0.3);
      box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.4), 0 4px 16px rgba(0,0,0,0.25);
      transform: scale(1);
    }
    25% { 
      border-color: rgba(96, 165, 250, 0.8);
      box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.3), 0 6px 20px rgba(96, 165, 250, 0.2);
      transform: scale(1.015);
    }
    50% { 
      border-color: rgba(96, 165, 250, 1);
      box-shadow: 0 0 0 8px rgba(96, 165, 250, 0.2), 0 8px 25px rgba(96, 165, 250, 0.3);
      transform: scale(1.02);
    }
    75% { 
      border-color: rgba(96, 165, 250, 0.6);
      box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.1), 0 6px 20px rgba(96, 165, 250, 0.15);
      transform: scale(1.01);
    }
    100% { 
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow: 0 0 0 0 rgba(96, 165, 250, 0), 0 4px 16px rgba(0,0,0,0.25);
      transform: scale(1);
    }
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleElement = document.getElementById('scene-animation-styles');
  if (!styleElement) {
    const style = document.createElement('style');
    style.id = 'scene-animation-styles';
    style.textContent = animationStyles;
    document.head.appendChild(style);
  }
} 