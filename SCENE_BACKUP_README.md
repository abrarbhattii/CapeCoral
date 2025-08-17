# AI Storm Navigator - Scene Backup

**Generated:** 2025-07-19T02:32:49.163Z  
**Storage Key:** windOnlyForeclosureMap_scenes_v1

## Overview

This document contains the saved scene configurations from the AI Storm Navigator. Each scene includes:
- Camera position (center, zoom, pitch, bearing)
- Layer visibility states
- Parks toggle state
- Timestamp of creation

## Scene Data Structure

```json
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
}
```

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
   ```javascript
   map.easeTo({
     center: [scene.camera.center.lng, scene.camera.center.lat],
     zoom: scene.camera.zoom,
     pitch: scene.camera.pitch,
     bearing: scene.camera.bearing,
     duration: 4000
   });
   ```

2. **Set layer visibility:**
   ```javascript
   setLayerVisibility(scene.layerVisibility);
   ```

3. **Set parks state:**
   ```javascript
   if (scene.parksEnabled !== undefined) {
     handleParksToggle(scene.parksEnabled);
   }
   ```

### 2. Programmatic Recreation
To programmatically recreate scenes:

```javascript
// Load scenes from localStorage
const scenes = JSON.parse(localStorage.getItem('windOnlyForeclosureMap_scenes_v1') || '[]');

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
```

## Data Sources

### GeoJSON Files
- **Flood Zones**: `/FLOOD2/cape_coral_9x_flood_zones.geojson`
- **Coastal Flood Zones**: `/FLOOD2/cape_coral_coastal_simplified_flood_zones.geojson`
- **Coastal Extension**: `/FLOOD2/cape_coral_coastal_extension_flood_zones.geojson`
- **Flood Max**: `/FLOOD2/floodMax.geojson`
- **USACE**: `/FLOOD2/USACE.geojson`
- **Zip Codes**: `/florida_zipcodes_with_insurance_data_20250703_171735.geojson`
- **Hurricane Milton**: `/FLOOD2/hurricane_milton_COMPLETE_20250710_150039.geojson`
- **Buildings**: `/FLOOD2/cape_coral_buildings.geojson`
- **Roads**: `/FLOOD2/cape_coral_roads.geojson`
- **Paths**: `/FLOOD2/cape_coral_paths.geojson`
- **Redfin Properties**: `/florida_properties_real_data_20250703_105442.geojson`
- **Commercial POIs**: `/FLOOD2/commercial_pois.geojson`
- **Social POIs**: `/FLOOD2/social_pois.geojson`
- **Environmental POIs**: `/FLOOD2/environmental_pois.geojson`
- **Block Groups**: `/lee_county_blockgroups_population_65.geojson`

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
2. Run: `console.log(JSON.stringify(JSON.parse(localStorage.getItem("windOnlyForeclosureMap_scenes_v1")), null, 2))`
3. Copy the output
4. Replace the template in `capture_scenes.js`
5. Run: `node capture_scenes.js`

### To Restore Scenes:
1. Copy the scene data to localStorage
2. Refresh the application
3. Scenes will be available in the AI Storm Navigator

## Notes

- **Scene IDs**: Generated using `Date.now().toString()`
- **Timestamps**: ISO 8601 format
- **Layer States**: Boolean values for visibility
- **Parks State**: Separate from layer visibility for Mapbox integration
- **Animation Duration**: 4000ms for smooth transitions

---
*Generated by AI Storm Navigator Scene Capture Script*
