import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getCardsForScene } from './cardConfigs';

const STORAGE_KEY = 'windOnlyForeclosureMap_scenes_v3'; // Updated version to use dynamic card system

// Default captured scenes to restore (from capture_scenes.js)
const DEFAULT_SCENES = [
  {
    "id": "1752889907158",
    "name": "Scene 1",
    "timestamp": "2025-07-19T02:19:02.186Z",
    "camera": {
      "center": {
        "lng": -81.95682833196808,
        "lat": 26.56669858505245
      },
      "zoom": 11.524905657584014,
      "pitch": 0,
      "bearing": 0
    },
    "layerVisibility": {
      "floodZones": false,
      "coastalFloodZones": false,
      "coastalExtensionFloodZones": false,
      "floodMax": false,
      "usace": false,
      "zipCodeBoundaries": false,
      "hurricaneMilton": false,
      "buildings": false,
      "roads": false,
      "paths": false,
      "redfinProperties": false,
      "commercialPois": false,
      "socialPois": false,
      "environmentalPois": false,
      "blockGroupBoundaries": false,
      "blocks": true,
      "parks": false
    },
    "parksEnabled": false
  },
  {
    "id": "1752890011711",
    "name": "Scene 2",
    "timestamp": "2025-07-19T02:24:35.683Z",
    "camera": {
      "center": {
        "lng": -81.94324363035832,
        "lat": 26.555254094403452
      },
      "zoom": 13.528855165913832,
      "pitch": 21.277772323849426,
      "bearing": -26.754556165056783
    },
    "layerVisibility": {
      "floodZones": true,
      "coastalFloodZones": false,
      "coastalExtensionFloodZones": false,
      "floodMax": false,
      "usace": false,
      "zipCodeBoundaries": true,
      "hurricaneMilton": true,
      "buildings": false,
      "roads": true,
      "paths": false,
      "redfinProperties": false,
      "commercialPois": true,
      "socialPois": true,
      "environmentalPois": false,
      "blockGroupBoundaries": false,
      "blocks": true,
      "parks": true
    },
    "parksEnabled": true
  },
  {
    "id": "1752890044121",
    "name": "Scene 3",
    "timestamp": "2025-07-19T01:54:49.578Z",
    "camera": {
      "center": {
        "lng": -81.9976940256121,
        "lat": 26.553875382327405
      },
      "zoom": 10.508734837651597,
      "pitch": 25.897638972203104,
      "bearing": 29.724910428357816
    },
    "layerVisibility": {
      "floodZones": true,
      "coastalFloodZones": true,
      "coastalExtensionFloodZones": false,
      "floodMax": false,
      "usace": false,
      "zipCodeBoundaries": true,
      "hurricaneMilton": true,
      "buildings": false,
      "roads": true,
      "paths": true,
      "redfinProperties": false,
      "commercialPois": true,
      "socialPois": true,
      "environmentalPois": false,
      "blockGroupBoundaries": true,
      "blocks": true,
      "parks": false
    },
    "parksEnabled": false
  },
  {
    "id": "1752890582825",
    "name": "Scene 4",
    "timestamp": "2025-07-19T02:26:57.307Z",
    "camera": {
      "center": {
        "lng": -82.11932784076174,
        "lat": 26.676171360812873
      },
      "zoom": 12.223839569450135,
      "pitch": 46.74128647540479,
      "bearing": 135.2319278204609
    },
    "layerVisibility": {
      "floodZones": true,
      "coastalFloodZones": true,
      "coastalExtensionFloodZones": false,
      "floodMax": false,
      "usace": false,
      "zipCodeBoundaries": true,
      "hurricaneMilton": true,
      "buildings": false,
      "roads": true,
      "paths": true,
      "redfinProperties": false,
      "commercialPois": true,
      "socialPois": true,
      "environmentalPois": true,
      "blockGroupBoundaries": true,
      "blocks": true,
      "parks": true
    },
    "parksEnabled": true
  },
  {
    "id": "1752891127158",
    "name": "Scene 5",
    "timestamp": "2025-07-19T02:22:04.208Z",
    "camera": {
      "center": {
        "lng": -81.80894922385728,
        "lat": 26.666340929259476
      },
      "zoom": 9.869574451201823,
      "pitch": 48.41281825443745,
      "bearing": -168.17309802979378
    },
    "layerVisibility": {
      "floodZones": false,
      "coastalFloodZones": true,
      "coastalExtensionFloodZones": false,
      "floodMax": false,
      "usace": true,
      "zipCodeBoundaries": true,
      "hurricaneMilton": false,
      "buildings": false,
      "roads": true,
      "paths": false,
      "redfinProperties": true,
      "commercialPois": true,
      "socialPois": true,
      "environmentalPois": false,
      "blockGroupBoundaries": false,
      "blocks": true,
      "parks": false
    },
    "parksEnabled": false
  }
];

const MapMainPanel = ({ map, layerVisibility, setLayerVisibility, parksEnabled, handleParksToggle, sharedSceneTransition, activePopupCards, setActivePopupCards }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [scenes, setScenes] = useState(DEFAULT_SCENES); // Initialize with default scenes
  const [status, setStatus] = useState('');
  const [playing, setPlaying] = useState(false);
  const [playingSceneId, setPlayingSceneId] = useState(null);
  const [editingSceneId, setEditingSceneId] = useState(null);
  const [editingSceneName, setEditingSceneName] = useState('');
  const [animationSteps, setAnimationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [scenesLoaded, setScenesLoaded] = useState(false);
  const initialLoadComplete = useRef(false);
  
  // Track previous layer state for coordinated animations
  const previousLayerVisibility = useRef({ ...layerVisibility, parksEnabled });
  
  // Update previous layer state when layers change (for manual changes)
  useEffect(() => {
    previousLayerVisibility.current = { ...layerVisibility, parksEnabled };
  }, [layerVisibility, parksEnabled]);

  // Load scenes from localStorage on mount, but keep defaults if localStorage is empty
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setScenes(parsed);
          console.log('Loaded scenes from localStorage:', parsed.length);
        } else {
          // If localStorage has empty array, keep our default scenes
          console.log('localStorage empty, using default scenes:', DEFAULT_SCENES.length);
        }
      } else {
        // No localStorage data, keep default scenes
        console.log('No localStorage data, using default scenes:', DEFAULT_SCENES.length);
      }
      // Mark initial load as complete
      initialLoadComplete.current = true;
      setScenesLoaded(true);
    } catch (e) {
      console.error('Error loading scenes from localStorage:', e);
      // On error, keep default scenes
      console.log('Using default scenes due to localStorage error');
      initialLoadComplete.current = true;
      setScenesLoaded(true);
    }
  }, []);

  // Save scenes to localStorage whenever they change
  useEffect(() => {
    // Only save if scenes have been loaded from localStorage first AND initial load is complete
    if (scenesLoaded && initialLoadComplete.current) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes));
        console.log('Saved scenes to localStorage:', scenes.length);
      } catch (e) {
        console.error('Error saving scenes to localStorage:', e);
      }
    }
  }, [scenes, scenesLoaded]);

  // Enhanced animated icon component with white icons and varied animations
  const AnimatedIcon = ({ children, animationType = 'pulse' }) => {
    const getAnimationStyle = () => {
      const animations = {
        pulse: 'iconPulse 1.5s infinite',
        spin: 'iconSpin 2s linear infinite',
        bounce: 'iconBounce 1s infinite',
        glow: 'iconGlow 2s ease-in-out infinite',
        zoom: 'iconZoom 1.2s ease-in-out infinite',
        rotate: 'iconRotate 3s linear infinite',
        thrust: 'iconThrust 0.8s ease-in-out infinite',
        blink: 'iconBlink 1.5s ease-in-out infinite',
        wave: 'iconWave 2s ease-in-out infinite',
        orbit: 'iconOrbit 4s linear infinite',
        target: 'iconTarget 1s ease-in-out infinite',
        mystical: 'iconMystical 3s ease-in-out infinite',
        calculate: 'iconCalculate 1.5s linear infinite',
        spiral: 'iconSpiral 2s linear infinite',
        build: 'iconBuild 2s ease-in-out infinite',
        tick: 'iconTick 1s linear infinite',
        process: 'iconProcess 2s ease-in-out infinite',
        focus: 'iconFocus 1.5s ease-in-out infinite',
        blast: 'iconBlast 0.6s ease-out infinite'
      };
      return animations[animationType] || animations.pulse;
    };

    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 16,
        height: 16,
        marginRight: 8,
        animation: getAnimationStyle(),
        filter: 'brightness(1.5) contrast(1.2)', // Make icons brighter/whiter
        WebkitFilter: 'brightness(1.5) contrast(1.2)',
        textShadow: '0 0 3px rgba(255,255,255,0.8), 0 0 6px rgba(255,255,255,0.4)',
        fontSize: '12px'
      }}>
        {children}
      </div>
    );
  };

  // Enhanced animation step sequences with variations
  const getAnimationSequence = (scene) => {
    // Calculate scene complexity based on layer changes
    const layerCount = Object.values(scene.layerVisibility).filter(Boolean).length;
    const hasComplexLayers = scene.layerVisibility.buildings || scene.layerVisibility.hurricaneMilton || scene.layerVisibility.floodZones;
    const hasCameraChange = scene.camera.pitch > 0 || scene.camera.bearing !== 0;
    
         // Define different sequences based on complexity - ALL WHITE ICONS with VARIABLE TIMING
     const sequences = {
       simple: [
         { text: 'Init analyzer', icon: '○', animation: 'spin', duration: 0.8 },
         { text: 'Process params', icon: '↻', animation: 'pulse', duration: 0.6 },
         { text: 'Update layers', icon: '⦿', animation: 'bounce', duration: 1.2 },
         { text: 'Execute transition', icon: '✦', animation: 'glow', duration: 1.4 }
       ],
       moderate: [
         { text: 'Scan config', icon: '◎', animation: 'zoom', duration: 0.7 },
         { text: 'Validate data', icon: '◆', animation: 'pulse', duration: 0.9 },
         { text: 'Optimize pipeline', icon: '⚙', animation: 'spin', duration: 1.1 },
         { text: 'Sync visibility', icon: '▣', animation: 'bounce', duration: 0.5 },
         { text: 'Compute path', icon: '⊕', animation: 'rotate', duration: 1.3 },
         { text: 'Launch transition', icon: '▲', animation: 'thrust', duration: 0.5 }
       ],
       complex: [
         { text: 'Activate AI', icon: '◉', animation: 'blink', duration: 0.6 },
         { text: 'Deep scan matrix', icon: '◈', animation: 'zoom', duration: 1.4 },
         { text: 'Process flood data', icon: '≋', animation: 'wave', duration: 1.6 },
         { text: 'Calibrate 3D geo', icon: '◢', animation: 'spin', duration: 1.2 },
         { text: 'Optimize shaders', icon: '▦', animation: 'pulse', duration: 0.8 },
         { text: 'Calc trajectory', icon: '◯', animation: 'orbit', duration: 0.9 },
         { text: 'Execute precision', icon: '◎', animation: 'target', duration: 0.5 }
       ],
       expert: [
         { text: 'Init quantum nav', icon: '◊', animation: 'mystical', duration: 0.8 },
         { text: 'Analyze geo matrix', icon: '⬢', animation: 'calculate', duration: 1.7 },
         { text: 'Process hurricane', icon: '◐', animation: 'spiral', duration: 1.9 },
         { text: 'Rebuild meshes', icon: '▦', animation: 'build', duration: 1.5 },
         { text: 'Sync temporal', icon: '◷', animation: 'tick', duration: 0.7 },
         { text: 'Optimize clusters', icon: '⬚', animation: 'process', duration: 1.1 },
         { text: 'Calibrate optics', icon: '◉', animation: 'focus', duration: 0.6 },
         { text: 'Launch hypersonic', icon: '▲', animation: 'blast', duration: 0.3 }
       ]
     };
    
    // Select sequence based on complexity
    if (layerCount >= 8 && hasComplexLayers && hasCameraChange) {
      return sequences.expert;
    } else if (layerCount >= 5 && hasComplexLayers) {
      return sequences.complex;
    } else if (layerCount >= 3 || hasCameraChange) {
      return sequences.moderate;
    } else {
      return sequences.simple;
    }
  };

  // Add animation steps with enhanced data
  const addAnimationStep = (text, icon = '○', animation = 'pulse', duration = 1.0) => {
    setAnimationSteps(prev => [...prev, { text, icon, animation, duration }]);
  };

  // Clear animation steps
  const clearAnimationSteps = () => {
    setAnimationSteps([]);
    setCurrentStep(0);
  };

  // Capture current map state as a scene, including layer visibility
  const handleAddScene = () => {
    if (!map || !map.getCenter) {
      setStatus('Map not available');
      return;
    }
    const camera = {
      center: map.getCenter(),
      zoom: map.getZoom(),
      pitch: map.getPitch(),
      bearing: map.getBearing(),
    };
    const newScene = {
      id: Date.now().toString(),
      name: `Scene ${scenes.length + 1}`,
      timestamp: new Date().toISOString(),
      camera,
      layerVisibility: { ...layerVisibility }, // Save a copy
      parksEnabled: parksEnabled, // Save parks state
    };
    console.log('Creating new scene:', newScene);
    setScenes(prev => [...prev, newScene]);
    setStatus(`Scene saved at ${new Date().toLocaleTimeString()}`);
  };

  // Play the last saved scene
  const handlePlay = () => {
    if (!map || !map.easeTo) {
      setStatus('Map not available');
      return;
    }
    if (scenes.length === 0) {
      setStatus('No scenes to play');
      return;
    }
    const scene = scenes[scenes.length - 1];
    playScene(scene);
  };

  // Play a specific scene with animated transitions
  const playScene = async (scene) => {
    if (!map || !map.easeTo) {
      setStatus('Map not available');
      return;
    }
    if (!scene) {
      setStatus('Scene not found');
      return;
    }

    setPlaying(true);
    setPlayingSceneId(scene.id);
    clearAnimationSteps();

    // Clear any existing popup cards
    if (setActivePopupCards) {
      setActivePopupCards([]);
    }

    // Get dynamic animation sequence based on scene complexity
    const animationSequence = getAnimationSequence(scene);
    const totalDuration = 4000; // Keep 4 second total duration
    
    // Calculate dynamic timing based on step durations
    const totalStepDuration = animationSequence.reduce((sum, step) => sum + step.duration, 0);
    const timeScale = totalDuration / totalStepDuration; // Scale to fit total duration
    
    // Start animation sequence AND map transition simultaneously
    setStatus('Initializing navigation...');
    
    // Add first step immediately
    addAnimationStep(animationSequence[0].text, animationSequence[0].icon, animationSequence[0].animation, animationSequence[0].duration);
    
    // Trigger scene transition animation for coordinated legend pulses
    const oldVisibility = { ...previousLayerVisibility.current };
    const newVisibility = { ...scene.layerVisibility, parksEnabled: scene.parksEnabled };
    
    // Trigger coordinated animation using shared function
    if (sharedSceneTransition) {
      sharedSceneTransition(oldVisibility, newVisibility, 'scene-sync');
    }
    
    // Apply layer visibility immediately
    if (scene.layerVisibility) {
      console.log('🎛️ Applying layer visibility:', scene.layerVisibility);
      setLayerVisibility(scene.layerVisibility);
    }

    // Apply parks state if available
    if (scene.parksEnabled !== undefined && handleParksToggle) {
      console.log('🌳 Applying parks state:', scene.parksEnabled);
      handleParksToggle(scene.parksEnabled);
    }
    
    // Update previous state for next comparison
    previousLayerVisibility.current = { ...scene.layerVisibility, parksEnabled: scene.parksEnabled };

    // Start map transition immediately
    console.log('🗺️ Starting map transition to:', scene.camera);
    console.log('🎯 Scene popup cards check:', scene.name, 'has popupCards:', !!scene.popupCards, 'count:', scene.popupCards?.length || 0);
    map.easeTo({
      center: [scene.camera.center.lng, scene.camera.center.lat],
      zoom: scene.camera.zoom,
      pitch: scene.camera.pitch,
      bearing: scene.camera.bearing,
      duration: totalDuration,
    });

    // Add remaining animation steps with variable timing
    let cumulativeTime = animationSequence[0].duration * timeScale;
    
    animationSequence.slice(1).forEach((step, index) => {
      setTimeout(() => {
        addAnimationStep(step.text, step.icon, step.animation, step.duration);
      }, cumulativeTime);
      
      // Add this step's duration to cumulative time for next step
      cumulativeTime += step.duration * timeScale;
    });

    // Show popup cards after 1 second delay
    // Use dynamic card configuration instead of stored scene data
    const dynamicCards = getCardsForScene(scene.id);
    console.log('🎯 Loading cards for scene:', scene.id, 'Cards found:', dynamicCards);
    const hasPopupCards = dynamicCards && dynamicCards.length > 0;
    if (hasPopupCards) {
      setTimeout(() => {
        if (setActivePopupCards) {
          console.log('🎯 Showing dynamic popup cards for scene:', scene.name, dynamicCards);
          setActivePopupCards(dynamicCards);
        }
      }, 2000);
    }

    // Complete animation after transition
    setTimeout(() => {
      setPlaying(false);
      setPlayingSceneId(null);
      setStatus('Analysis Complete');
      clearAnimationSteps();
    }, totalDuration);

    // Note: Popup cards now persist until next scene transition (removed auto-hide timer)
  };

  // Note: Scene navigation is now handled via DOM intervention in popup cards

  // Delete a scene
  const deleteScene = (sceneId) => {
    setScenes(prev => prev.filter(scene => scene.id !== sceneId));
    setStatus('Scene deleted');
  };

  // Start editing a scene name
  const startEditing = (scene) => {
    setEditingSceneId(scene.id);
    setEditingSceneName(scene.name);
  };

  // Save edited scene name
  const saveEditing = (sceneId) => {
    setScenes(prev => prev.map(scene =>
      scene.id === sceneId ? { ...scene, name: editingSceneName.trim() || scene.name } : scene
    ));
    setEditingSceneId(null);
    setEditingSceneName('');
  };

  // Handle Enter or blur for editing
  const handleEditKeyDown = (e, sceneId) => {
    if (e.key === 'Enter') {
      saveEditing(sceneId);
    } else if (e.key === 'Escape') {
      setEditingSceneId(null);
      setEditingSceneName('');
    }
  };

  // Save current legend state and camera to a scene
  const updateSceneLayers = (sceneId) => {
    if (!map || !map.getCenter) return;
    const camera = {
      center: map.getCenter(),
      zoom: map.getZoom(),
      pitch: map.getPitch(),
      bearing: map.getBearing(),
    };
    setScenes(prev => prev.map(scene =>
      scene.id === sceneId
        ? { ...scene, layerVisibility: { ...layerVisibility }, parksEnabled: parksEnabled, camera, timestamp: new Date().toISOString() }
        : scene
    ));
    setStatus('Scene updated with current view and layers');
  };

  // Debug function to check storage
  const debugStorage = () => {
    console.log('Current localStorage state:');
    console.log('STORAGE_KEY:', STORAGE_KEY);
    console.log('Raw localStorage value:', localStorage.getItem(STORAGE_KEY));
    console.log('Current scenes state:', scenes);
  };

  // Debug function to check layer states
  const debugLayers = () => {
    console.log('🔍 Layer Debug Info:');
    console.log('Current layer visibility:', layerVisibility);
    console.log('Mounted layers count:', Object.keys(layerVisibility).filter(key => layerVisibility[key]).length);
    console.log('Memory usage estimate:', JSON.stringify(layerVisibility).length, 'bytes');
  };

  if (collapsed) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          color: '#e2e8f0',
          borderRadius: '6px',
          padding: '6px',
          zIndex: 1200,
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          fontFamily: "'Inter', sans-serif",
          cursor: 'pointer',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Expand panel"
        onClick={() => setCollapsed(false)}
      >
        <span style={{ fontSize: 18, color: '#60a5fa' }}>☰</span>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        color: '#e2e8f0',
        borderRadius: '6px',
        padding: '16px 18px 14px 16px',
        zIndex: 1200,
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        fontFamily: "'Inter', sans-serif",
        minWidth: 220,
        maxWidth: 320,
        transition: 'all 0.3s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 
          onClick={() => setShowActions(!showActions)}
          style={{ 
            margin: 0, 
            fontSize: 15, 
            fontWeight: 600, 
            letterSpacing: 0.2, 
            color: '#60a5fa',
            cursor: 'pointer',
            transition: 'color 0.2s',
            userSelect: 'none'
          }}
          onMouseOver={e => (e.target.style.color = '#93c5fd')}
          onMouseOut={e => (e.target.style.color = '#60a5fa')}
          title={showActions ? "Hide actions" : "Show actions"}
        >
          AI Storm Navigator
        </h3>
        <button
          onClick={() => setCollapsed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: 20,
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
          }}
          title="Collapse panel"
        >
          ×
        </button>
      </div>

      {/* Actions Toggle */}
      {showActions && (
        <div style={{ 
          marginBottom: 10, 
          padding: '8px 12px',
          backgroundColor: 'rgba(96, 165, 250, 0.05)',
          borderRadius: '4px',
          border: '1px solid rgba(96, 165, 250, 0.2)'
        }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleAddScene}
              style={{
                background: '#23272f',
                color: '#e2e8f0',
                border: 'none',
                borderRadius: 4,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                transition: 'background 0.2s',
              }}
            >
              Capture
            </button>
            <button
              onClick={handlePlay}
              disabled={playing || scenes.length === 0}
              style={{
                background: playing ? '#374151' : '#23272f',
                color: '#e2e8f0',
                border: 'none',
                borderRadius: 4,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 500,
                cursor: playing || scenes.length === 0 ? 'not-allowed' : 'pointer',
                opacity: playing || scenes.length === 0 ? 0.6 : 1,
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                transition: 'background 0.2s',
              }}
            >
              Navigate
            </button>
          </div>
        </div>
      )}
      <div style={{ fontSize: 11, color: '#cbd5e1', minHeight: 18 }}>
        {status}
      </div>
      {scenes.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 10, color: '#a5b4fc' }}>
          <b>Saved Views:</b>
          <ul style={{ margin: '4px 0 0 0', padding: 0, listStyle: 'none' }}>
            {scenes.map(scene => {
              // Scene focus animation logic
              const isActiveScene = playingSceneId === scene.id;
              const isOtherScene = playing && playingSceneId !== scene.id;
              
              // Dynamic styles for scene focus effect
              const getSceneFocusStyles = () => {
                if (isActiveScene && playing) {
                  // Active scene: prominent pulse animation
                  return {
                    background: 'rgba(59,130,246,0.25)',
                    color: '#60a5fa',
                    border: '1px solid rgba(96, 165, 250, 0.4)',
                    boxShadow: '0 0 0 0 rgba(96, 165, 250, 0.4)',
                    animation: 'activeScenePulse 2s ease-in-out',
                    transform: 'scale(1.02)',
                    zIndex: 10,
                    fontWeight: 700,
                    opacity: 1
                  };
                }
                
                if (isOtherScene) {
                  // Other scenes: fade to background
                  return {
                    opacity: 0.3,
                    transform: 'scale(0.96)',
                    filter: 'blur(0.5px)',
                    background: 'rgba(75, 85, 99, 0.1)',
                    color: '#6b7280',
                    pointerEvents: 'none'
                  };
                }
                
                // Normal state
                return {
                  background: 'none',
                  opacity: 1,
                  transform: 'scale(1)',
                  filter: 'none'
                };
              };

              return (
                <React.Fragment key={scene.id}>
                  <li
                    onClick={e => {
                      if (playing) return;
                      // Only play if not clicking the delete or edit button
                      if (e.target.dataset.delete || e.target.dataset.edit) return;
                      playScene(scene);
                    }}
                    style={{
                      marginBottom: 2,
                      cursor: playing ? 'not-allowed' : 'pointer',
                      borderRadius: 3,
                      padding: '2px 4px',
                      transition: playing ? 'none' : 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 4,
                      position: 'relative',
                      ...getSceneFocusStyles()
                    }}
                    title={playing ? 'Wait for animation to finish' : 'Click to navigate to this view'}
                  >
                    {/* Active scene indicator */}
                    {isActiveScene && playing && (
                      <div style={{
                        position: 'absolute',
                        left: '-6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '3px',
                        height: '80%',
                        backgroundColor: '#60a5fa',
                        borderRadius: '2px',
                        animation: 'sceneFocusBar 2s ease-in-out'
                      }} />
                    )}
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {editingSceneId === scene.id ? (
                    <input
                      type="text"
                      value={editingSceneName}
                      autoFocus
                      onChange={e => setEditingSceneName(e.target.value)}
                      onBlur={() => saveEditing(scene.id)}
                      onKeyDown={e => handleEditKeyDown(e, scene.id)}
                      style={{
                        fontSize: 11,
                        padding: '2px 4px',
                        borderRadius: 3,
                        border: '1px solid #374151',
                        background: '#18181b',
                        color: '#e2e8f0',
                        minWidth: 60,
                        maxWidth: 120,
                      }}
                    />
                  ) : (
                    <>
                      {scene.name} <span style={{ color: '#64748b' }}>({new Date(scene.timestamp).toLocaleTimeString()})</span>
                    </>
                  )}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <button
                    data-edit
                    onClick={e => {
                      e.stopPropagation();
                      startEditing(scene);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fbbf24',
                      fontSize: 13,
                      marginLeft: 2,
                      cursor: 'pointer',
                      padding: 0,
                      lineHeight: 1,
                      borderRadius: 2,
                      transition: 'background 0.15s',
                      // Enhanced glow for active scene buttons
                      ...(isActiveScene && playing ? {
                        animation: 'buttonGlow 2s ease-in-out',
                        filter: 'drop-shadow(0 0 3px rgba(251,191,36,0.6))'
                      } : {})
                    }}
                    title="Edit scene name"
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(251,191,36,0.12)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'none')}
                  >
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#fbbf24',
                      margin: '0 auto'
                    }}></div>
                  </button>
                  <button
                    data-save
                    onClick={e => {
                      e.stopPropagation();
                      updateSceneLayers(scene.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: 13,
                      marginLeft: 2,
                      cursor: 'pointer',
                      padding: 0,
                      lineHeight: 1,
                      borderRadius: 2,
                      transition: 'background 0.15s',
                      // Enhanced glow for active scene buttons
                      ...(isActiveScene && playing ? {
                        animation: 'buttonGlow 2s ease-in-out',
                        filter: 'drop-shadow(0 0 3px rgba(56,189,248,0.6))'
                      } : {})
                    }}
                    title="Update scene with current layers"
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.12)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'none')}
                  >
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#38bdf8',
                      margin: '0 auto'
                    }}></div>
                  </button>
                  <button
                    data-delete
                    onClick={e => {
                      e.stopPropagation();
                      deleteScene(scene.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: 13,
                      marginLeft: 2,
                      cursor: 'pointer',
                      padding: 0,
                      lineHeight: 1,
                      borderRadius: 2,
                      transition: 'background 0.15s',
                      // Enhanced glow for active scene buttons
                      ...(isActiveScene && playing ? {
                        animation: 'buttonGlow 2s ease-in-out',
                        filter: 'drop-shadow(0 0 3px rgba(239,68,68,0.6))'
                      } : {})
                    }}
                    title="Delete scene"
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.12)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'none')}
                  >
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#ef4444',
                      margin: '0 auto'
                    }}></div>
                  </button>
                </span>
                  </li>
                  
                  {/* Animation Steps Display - Right under the active scene */}
                  {isActiveScene && playing && animationSteps.length > 0 && (
                    <li style={{ listStyle: 'none', margin: '12px 0 8px 0', padding: 0 }}>
                      <div style={{ 
                        marginLeft: '8px',
                        marginRight: '8px',
                        padding: '8px 12px', 
                        backgroundColor: 'rgba(99, 102, 241, 0.15)', 
                        borderRadius: '6px',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        animation: 'taskBarSlideIn 0.3s ease-out',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
                        position: 'relative'
                      }}>
                        {/* Connection line to active scene */}
                        <div style={{
                          position: 'absolute',
                          top: '-12px',
                          left: '20px',
                          width: '2px',
                          height: '12px',
                          backgroundColor: '#60a5fa',
                          borderRadius: '1px'
                        }} />
                        
                        {animationSteps.map((step, index) => (
                          <div key={index} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            fontSize: 10, 
                            color: '#cbd5e1',
                            marginBottom: index < animationSteps.length - 1 ? 3 : 0,
                            opacity: index === animationSteps.length - 1 ? 1 : 0.7,
                            // Highlight the current step
                            background: index === animationSteps.length - 1 ? 'rgba(255,255,255,0.05)' : 'transparent',
                            borderRadius: '3px',
                            padding: '2px 4px',
                            transition: 'all 0.3s ease'
                          }}>
                            <AnimatedIcon animationType={step.animation}>
                              <span style={{ fontSize: 11 }}>{step.icon}</span>
                            </AnimatedIcon>
                            <span style={{
                              fontWeight: index === animationSteps.length - 1 ? '600' : '400',
                              color: index === animationSteps.length - 1 ? '#e2e8f0' : '#cbd5e1'
                            }}>{step.text}</span>
                          </div>
                        ))}
                      </div>
                    </li>
                  )}
                </React.Fragment>
              );
            })}
          </ul>
        </div>
      )}
      

      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Enhanced Icon Animations */
        @keyframes iconPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        @keyframes iconSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes iconBounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
          60% { transform: translateY(-2px); }
        }

        @keyframes iconGlow {
          0%, 100% { 
            filter: brightness(1.5) contrast(1.2);
            text-shadow: 0 0 3px rgba(255,255,255,0.8), 0 0 6px rgba(255,255,255,0.4);
          }
          50% { 
            filter: brightness(2) contrast(1.5);
            text-shadow: 0 0 6px rgba(255,255,255,1), 0 0 12px rgba(255,255,255,0.6);
          }
        }

        @keyframes iconZoom {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.2); }
          75% { transform: scale(0.9); }
        }

        @keyframes iconRotate {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.1); }
          50% { transform: rotate(180deg) scale(1); }
          75% { transform: rotate(270deg) scale(0.9); }
          100% { transform: rotate(360deg) scale(1); }
        }

        @keyframes iconThrust {
          0% { transform: translateY(0) scale(1); }
          30% { transform: translateY(-3px) scale(1.2); }
          60% { transform: translateY(1px) scale(0.9); }
          100% { transform: translateY(0) scale(1); }
        }

        @keyframes iconBlink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0.3; }
        }

        @keyframes iconWave {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          25% { transform: rotate(5deg) translateY(-2px); }
          50% { transform: rotate(0deg) translateY(0); }
          75% { transform: rotate(-5deg) translateY(2px); }
        }

        @keyframes iconOrbit {
          0% { transform: rotate(0deg) translateX(3px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(3px) rotate(-360deg); }
        }

        @keyframes iconTarget {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }

        @keyframes iconMystical {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            filter: brightness(1.5) hue-rotate(0deg);
          }
          33% { 
            transform: scale(1.1) rotate(120deg);
            filter: brightness(2) hue-rotate(120deg);
          }
          66% { 
            transform: scale(0.9) rotate(240deg);
            filter: brightness(1.8) hue-rotate(240deg);
          }
        }

        @keyframes iconCalculate {
          0% { transform: translateX(0); }
          25% { transform: translateX(2px); }
          50% { transform: translateX(-2px); }
          75% { transform: translateX(1px); }
          100% { transform: translateX(0); }
        }

        @keyframes iconSpiral {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }

        @keyframes iconBuild {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-2px) scaleY(1.2); }
        }

        @keyframes iconTick {
          0%, 50%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(6deg); }
          75% { transform: rotate(-6deg); }
        }

        @keyframes iconProcess {
          0%, 100% { 
            transform: scale(1);
            filter: brightness(1.5);
          }
          50% { 
            transform: scale(1.15);
            filter: brightness(2);
          }
        }

        @keyframes iconFocus {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.25); opacity: 0.8; }
        }

        @keyframes iconBlast {
          0% { transform: scale(1) translateY(0); }
          30% { transform: scale(1.3) translateY(-3px); }
          100% { transform: scale(1) translateY(0); }
        }

        @keyframes activeScenePulse {
          0% { 
            background: rgba(59,130,246,0.15);
            box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.4);
            transform: scale(1);
          }
          25% { 
            background: rgba(59,130,246,0.3);
            box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
            transform: scale(1.03);
          }
          50% { 
            background: rgba(59,130,246,0.35);
            box-shadow: 0 0 0 6px rgba(96, 165, 250, 0.2);
            transform: scale(1.04);
          }
          75% { 
            background: rgba(59,130,246,0.25);
            box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
            transform: scale(1.02);
          }
          100% { 
            background: rgba(59,130,246,0.2);
            box-shadow: 0 0 0 0 rgba(96, 165, 250, 0);
            transform: scale(1.01);
          }
        }

                 @keyframes sceneFocusBar {
           0% { 
             height: 0%;
             opacity: 0;
             background: #60a5fa;
           }
           25% { 
             height: 60%;
             opacity: 0.8;
             background: #93c5fd;
           }
           50% { 
             height: 100%;
             opacity: 1;
             background: #60a5fa;
           }
           75% { 
             height: 80%;
             opacity: 0.9;
             background: #3b82f6;
           }
           100% { 
             height: 80%;
             opacity: 0.8;
             background: #60a5fa;
           }
         }

                   @keyframes buttonGlow {
            0% { 
              filter: drop-shadow(0 0 0 rgba(255,255,255,0));
            }
            25% { 
              filter: drop-shadow(0 0 2px rgba(255,255,255,0.3));
            }
            50% { 
              filter: drop-shadow(0 0 4px rgba(255,255,255,0.5));
            }
            75% { 
              filter: drop-shadow(0 0 3px rgba(255,255,255,0.4));
            }
            100% { 
              filter: drop-shadow(0 0 2px rgba(255,255,255,0.2));
            }
          }

          @keyframes taskBarSlideIn {
            0% { 
              opacity: 0;
              transform: translateY(-10px) scale(0.95);
              box-shadow: 0 0 0 rgba(99, 102, 241, 0);
            }
            50% { 
              opacity: 0.8;
              transform: translateY(-2px) scale(1.02);
              box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            }
            100% { 
              opacity: 1;
              transform: translateY(0) scale(1);
              box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
            }
          }
      `}</style>
    </div>
  );
};

export default MapMainPanel; 