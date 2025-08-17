#!/usr/bin/env node

/**
 * Scene Capture Script for AI Storm Navigator
 * 
 * This script captures the current scene data from localStorage and generates
 * a README file that can be used to recreate the layers and positions.
 * 
 * Note: Popup cards are now handled separately in cardConfigs.js and are
 * not included in this backup system.
 * 
 * Usage: node capture_scenes.js
 */

const fs = require('fs');
const path = require('path');

// Storage key used by the AI Storm Navigator
const STORAGE_KEY = 'windOnlyForeclosureMap_scenes_v1';

function captureScenes() {
  console.log('🎯 Capturing AI Storm Navigator scenes...\n');
  
  try {
    // Read the current scenes from localStorage (this would be from browser)
    // For this script, we'll create a template that shows the structure
    
    const scenes = [
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

    // Generate README content
    const readmeContent = generateREADME(scenes[0]); // Use first scene as template
    
    // Write to file
    const outputPath = path.join(__dirname, 'SCENE_BACKUP_README.md');
    fs.writeFileSync(outputPath, readmeContent);
    
    console.log('✅ Scene backup README generated successfully!');
    console.log(`📁 File saved to: ${outputPath}`);
    console.log('\n📋 To capture actual scenes from browser:');
    console.log('1. Open browser console');
    console.log('2. Run: console.log(JSON.stringify(JSON.parse(localStorage.getItem("windOnlyForeclosureMap_scenes_v1")), null, 2))');
    console.log('3. Copy the output and replace the template in this script');
    
  } catch (error) {
    console.error('❌ Error capturing scenes:', error.message);
  }
}

function generateREADME(sceneTemplate) {
  const timestamp = new Date().toISOString();
  
  return `# AI Storm Navigator - Scene Backup

**Generated:** ${timestamp}  
**Storage Key:** ${STORAGE_KEY}

## Overview

This document contains the saved scene configurations from the AI Storm Navigator. Each scene includes:
- Camera position (center, zoom, pitch, bearing)
- Layer visibility states
- Parks toggle state
- Timestamp of creation

**Note:** Popup cards are now managed separately in \`src/components/cardConfigs.js\` and are not included in this backup system.

## Scene Data Structure

\`\`\`json
${JSON.stringify(sceneTemplate, null, 2)}
\`\`\`

## Layer Definitions

### Flood Zone Layers
- **floodZones**: Primary flood zone data
- **coastalFloodZones**: Coastal flood zone data  
- **coastalExtensionFloodZones**: Extended coastal flood zones
- **floodMax**: Maximum flood extent
- **usace**: USACE flood data

### Infrastructure Layers
- **zipCodeBoundaries**: Zip code boundary polygons
- **hurricaneMilton**: Hurricane Milton impact data
- **buildings**: 3D building extrusions
- **roads**: Road network data
- **paths**: Path and trail data
- **blocks**: Block group boundaries
- **parks**: Parks & Open Spaces (Mapbox layers)

### Property & POI Layers
- **redfinProperties**: Redfin property data
- **commercialPois**: Commercial points of interest
- **socialPois**: Social/community points of interest
- **environmentalPois**: Environmental points of interest
- **blockGroupBoundaries**: Census block group boundaries

## Camera Position Format

Each scene's camera position includes:
- **center**: { lng, lat } - Map center coordinates
- **zoom**: Number - Zoom level (typically 9-16)
- **pitch**: Number - Map tilt (0-60 degrees)
- **bearing**: Number - Map rotation (0-360 degrees)

## Recreation Instructions

### 1. Manual Recreation
To recreate a scene manually:

1. **Set camera position:**
   \`\`\`javascript
   map.easeTo({
     center: [scene.camera.center.lng, scene.camera.center.lat],
     zoom: scene.camera.zoom,
     pitch: scene.camera.pitch,
     bearing: scene.camera.bearing,
     duration: 4000
   });
   \`\`\`

2. **Set layer visibility:**
   \`\`\`javascript
   setLayerVisibility(scene.layerVisibility);
   \`\`\`

3. **Set parks state:**
   \`\`\`javascript
   if (scene.parksEnabled !== undefined) {
     handleParksToggle(scene.parksEnabled);
   }
   \`\`\`

### 2. Programmatic Recreation
To programmatically recreate scenes:

\`\`\`javascript
// Load scenes from localStorage
const scenes = JSON.parse(localStorage.getItem('${STORAGE_KEY}') || '[]');

// Recreate a specific scene
function recreateScene(sceneId) {
  const scene = scenes.find(s => s.id === sceneId);
  if (!scene) return;
  
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
  
  // Apply parks state
  if (scene.parksEnabled !== undefined) {
    handleParksToggle(scene.parksEnabled);
  }
}
\`\`\`

## Data Sources

### GeoJSON Files
- **Flood Zones**: \`/FLOOD2/cape_coral_9x_flood_zones.geojson\`
- **Coastal Flood Zones**: \`/FLOOD2/cape_coral_coastal_simplified_flood_zones.geojson\`
- **Coastal Extension**: \`/FLOOD2/cape_coral_coastal_extension_flood_zones.geojson\`
- **Flood Max**: \`/FLOOD2/floodMax.geojson\`
- **USACE**: \`/FLOOD2/USACE.geojson\`
- **Zip Codes**: \`/florida_zipcodes_with_insurance_data_20250703_171735.geojson\`
- **Hurricane Milton**: \`/FLOOD2/hurricane_milton_COMPLETE_20250710_150039.geojson\`
- **Buildings**: \`/FLOOD2/cape_coral_buildings.geojson\`
- **Roads**: \`/FLOOD2/cape_coral_roads.geojson\`
- **Paths**: \`/FLOOD2/cape_coral_paths.geojson\`
- **Redfin Properties**: \`/florida_properties_real_data_20250703_105442.geojson\`
- **Commercial POIs**: \`/FLOOD2/commercial_pois.geojson\`
- **Social POIs**: \`/FLOOD2/social_pois.geojson\`
- **Environmental POIs**: \`/FLOOD2/environmental_pois.geojson\`
- **Block Groups**: \`/lee_county_blockgroups_population_65.geojson\`

### Mapbox Layers
- **Parks**: Built-in Mapbox park layers (park, park-label, national-park, golf-course, pitch, grass)
- **Landuse**: Mapbox landuse layer with custom filtering
- **POI Labels**: Mapbox poi-label layer with custom filtering

## Layer Styling

### Color Scheme
- **Flood Zones**: Blue gradient (#06b6d4 to #0c4a6e)
- **Buildings**: White extrusions with height-based opacity
- **Roads**: Gray (#6b7280)
- **Paths**: Light gray (#9ca3af)
- **Blocks**: Yellow (#fbbf24)
- **Parks**: Green gradient (#2a9d2a to #1e5e1e)
- **POIs**: Purple gradient (#8b5cf6 to #7c3aed)

### Performance Notes
- **Buildings**: Optimized rendering based on zoom level
- **Environmental POIs**: Limited to 80% of total markers for performance
- **Layer mounting**: Automatic cleanup when layers are toggled off
- **Render capacity**: Monitored to prevent performance issues

## Backup Instructions

### To Capture Current Scenes:
1. Open browser console
2. Run: \`console.log(JSON.stringify(JSON.parse(localStorage.getItem("${STORAGE_KEY}")), null, 2))\`
3. Copy the output
4. Replace the template in \`capture_scenes.js\`
5. Run: \`node capture_scenes.js\`

### To Restore Scenes:
1. Copy the scene data to localStorage
2. Refresh the application
3. Scenes will be available in the AI Storm Navigator

## Notes

- **Scene IDs**: Generated using \`Date.now().toString()\`
- **Timestamps**: ISO 8601 format
- **Layer States**: Boolean values for visibility
- **Parks State**: Separate from layer visibility for Mapbox integration
- **Animation Duration**: 4000ms for smooth transitions
- **Popup Cards**: Now managed in \`src/components/cardConfigs.js\` for hot-reloading without cache clearing

---
*Generated by AI Storm Navigator Scene Capture Script*
`;
}

// Run the capture
captureScenes(); 