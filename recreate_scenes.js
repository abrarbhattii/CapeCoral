/**
 * Scene Recreation Script for AI Storm Navigator
 * 
 * This script contains functions to recreate all captured scenes
 * with their exact camera positions, layer visibility, and parks state.
 * 
 * Usage: Copy the relevant function into browser console or integrate into app
 */

// Captured scenes from AI Storm Navigator
const CAPTURED_SCENES = [
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
    }
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

/**
 * Recreate a specific scene by ID
 * @param {string} sceneId - The scene ID to recreate
 * @param {object} map - Mapbox map instance
 * @param {function} setLayerVisibility - Function to set layer visibility
 * @param {function} handleParksToggle - Function to toggle parks
 */
function recreateSceneById(sceneId, map, setLayerVisibility, handleParksToggle) {
  const scene = CAPTURED_SCENES.find(s => s.id === sceneId);
  if (!scene) {
    console.error(`Scene with ID ${sceneId} not found`);
    return;
  }
  
  console.log(`🎯 Recreating scene: ${scene.name}`);
  
  // Apply camera position
  map.easeTo({
    center: [scene.camera.center.lng, scene.camera.center.lat],
    zoom: scene.camera.zoom,
    pitch: scene.camera.pitch,
    bearing: scene.camera.bearing,
    duration: 4000
  });
  
  // Apply layer visibility
  setLayerVisibility(scene.layerVisibility);
  
  // Apply parks state if available
  if (scene.parksEnabled !== undefined && handleParksToggle) {
    handleParksToggle(scene.parksEnabled);
  }
  
  console.log(`✅ Scene "${scene.name}" recreated successfully`);
}

/**
 * Recreate a scene by name
 * @param {string} sceneName - The scene name to recreate
 * @param {object} map - Mapbox map instance
 * @param {function} setLayerVisibility - Function to set layer visibility
 * @param {function} handleParksToggle - Function to toggle parks
 */
function recreateSceneByName(sceneName, map, setLayerVisibility, handleParksToggle) {
  const scene = CAPTURED_SCENES.find(s => s.name === sceneName);
  if (!scene) {
    console.error(`Scene with name "${sceneName}" not found`);
    return;
  }
  
  recreateSceneById(scene.id, map, setLayerVisibility, handleParksToggle);
}

/**
 * Recreate all scenes in sequence
 * @param {object} map - Mapbox map instance
 * @param {function} setLayerVisibility - Function to set layer visibility
 * @param {function} handleParksToggle - Function to toggle parks
 * @param {number} delay - Delay between scenes in milliseconds (default: 5000)
 */
function recreateAllScenes(map, setLayerVisibility, handleParksToggle, delay = 5000) {
  console.log(`🎬 Starting recreation of all ${CAPTURED_SCENES.length} scenes`);
  
  CAPTURED_SCENES.forEach((scene, index) => {
    setTimeout(() => {
      recreateSceneById(scene.id, map, setLayerVisibility, handleParksToggle);
    }, index * delay);
  });
}

/**
 * Get scene information
 * @param {string} sceneId - The scene ID
 * @returns {object|null} Scene information or null if not found
 */
function getSceneInfo(sceneId) {
  return CAPTURED_SCENES.find(s => s.id === sceneId) || null;
}

/**
 * List all available scenes
 */
function listScenes() {
  console.log('📋 Available Scenes:');
  CAPTURED_SCENES.forEach((scene, index) => {
    const activeLayers = Object.entries(scene.layerVisibility)
      .filter(([key, value]) => value === true)
      .map(([key]) => key);
    
    console.log(`${index + 1}. "${scene.name}" (ID: ${scene.id})`);
    console.log(`   Position: [${scene.camera.center.lng.toFixed(6)}, ${scene.camera.center.lat.toFixed(6)}]`);
    console.log(`   Zoom: ${scene.camera.zoom.toFixed(2)}, Pitch: ${scene.camera.pitch.toFixed(2)}°, Bearing: ${scene.camera.bearing.toFixed(2)}°`);
    console.log(`   Active Layers: ${activeLayers.length} (${activeLayers.join(', ')})`);
    if (scene.parksEnabled !== undefined) {
      console.log(`   Parks: ${scene.parksEnabled ? 'Enabled' : 'Disabled'}`);
    }
    console.log('');
  });
}

/**
 * Get layer statistics across all scenes
 */
function getLayerStatistics() {
  const layerStats = {};
  
  CAPTURED_SCENES.forEach(scene => {
    if (scene.layerVisibility) {
      Object.entries(scene.layerVisibility).forEach(([layer, enabled]) => {
        if (!layerStats[layer]) {
          layerStats[layer] = { total: 0, enabled: 0 };
        }
        layerStats[layer].total++;
        if (enabled) layerStats[layer].enabled++;
      });
    }
  });
  
  console.log('📊 Layer Statistics:');
  Object.entries(layerStats).forEach(([layer, stats]) => {
    const percentage = ((stats.enabled / stats.total) * 100).toFixed(1);
    console.log(`   ${layer}: ${stats.enabled}/${stats.total} scenes (${percentage}%)`);
  });
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CAPTURED_SCENES,
    recreateSceneById,
    recreateSceneByName,
    recreateAllScenes,
    getSceneInfo,
    listScenes,
    getLayerStatistics
  };
}

// Browser console usage examples:
console.log(`
🎯 AI Storm Navigator Scene Recreation Script

Available functions:
- recreateSceneById(sceneId, map, setLayerVisibility, handleParksToggle)
- recreateSceneByName(sceneName, map, setLayerVisibility, handleParksToggle)
- recreateAllScenes(map, setLayerVisibility, handleParksToggle, delay)
- getSceneInfo(sceneId)
- listScenes()
- getLayerStatistics()

Example usage:
listScenes(); // List all available scenes
getLayerStatistics(); // Show layer usage statistics
recreateSceneByName("Scene 2", map, setLayerVisibility, handleParksToggle); // Recreate specific scene
`); 