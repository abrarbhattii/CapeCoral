/**
 * Browser Console Script for AI Storm Navigator Scene Capture
 * 
 * Run this script in the browser console to capture current scenes
 * and display them in a format that can be copied to the backup script.
 * 
 * Usage: Copy and paste this entire script into browser console
 */

(function() {
  'use strict';
  
  const STORAGE_KEY = 'windOnlyForeclosureMap_scenes_v1';
  
  console.log('🎯 AI Storm Navigator Scene Capture');
  console.log('=====================================\n');
  
  try {
    // Get scenes from localStorage
    const savedScenes = localStorage.getItem(STORAGE_KEY);
    
    if (!savedScenes) {
      console.log('❌ No scenes found in localStorage');
      console.log('💡 Create some scenes using the AI Storm Navigator first');
      return;
    }
    
    const scenes = JSON.parse(savedScenes);
    
    if (!Array.isArray(scenes) || scenes.length === 0) {
      console.log('❌ No scenes found in localStorage');
      console.log('💡 Create some scenes using the AI Storm Navigator first');
      return;
    }
    
    console.log(`✅ Found ${scenes.length} saved scene(s)\n`);
    
    // Display scene summary
    scenes.forEach((scene, index) => {
      console.log(`📸 Scene ${index + 1}: "${scene.name}"`);
      console.log(`   ID: ${scene.id}`);
      console.log(`   Created: ${new Date(scene.timestamp).toLocaleString()}`);
      console.log(`   Position: [${scene.camera.center.lng.toFixed(6)}, ${scene.camera.center.lat.toFixed(6)}]`);
      console.log(`   Zoom: ${scene.camera.zoom.toFixed(2)}`);
      console.log(`   Pitch: ${scene.camera.pitch.toFixed(2)}°`);
      console.log(`   Bearing: ${scene.camera.bearing.toFixed(2)}°`);
      
      // Count active layers
      const activeLayers = Object.entries(scene.layerVisibility || {})
        .filter(([key, value]) => value === true)
        .map(([key]) => key);
      
      console.log(`   Active Layers: ${activeLayers.length} (${activeLayers.join(', ')})`);
      
      if (scene.parksEnabled !== undefined) {
        console.log(`   Parks: ${scene.parksEnabled ? 'Enabled' : 'Disabled'}`);
      }
      
      console.log('');
    });
    
    // Generate JSON for backup
    console.log('📋 JSON for Backup Script:');
    console.log('Copy the following and replace the template in capture_scenes.js:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(scenes, null, 2));
    console.log('='.repeat(60));
    
    // Generate recreation code
    console.log('\n🔧 Recreation Code:');
    console.log('Use this code to programmatically recreate scenes:');
    console.log('='.repeat(60));
    
    scenes.forEach((scene, index) => {
      console.log(`// Recreate Scene ${index + 1}: "${scene.name}"`);
      console.log(`function recreateScene${index + 1}() {`);
      console.log(`  // Camera position`);
      console.log(`  map.easeTo({`);
      console.log(`    center: [${scene.camera.center.lng}, ${scene.camera.center.lat}],`);
      console.log(`    zoom: ${scene.camera.zoom},`);
      console.log(`    pitch: ${scene.camera.pitch},`);
      console.log(`    bearing: ${scene.camera.bearing},`);
      console.log(`    duration: 4000`);
      console.log(`  });`);
      console.log(``);
      console.log(`  // Layer visibility`);
      console.log(`  setLayerVisibility(${JSON.stringify(scene.layerVisibility, null, 2)});`);
      console.log(``);
      if (scene.parksEnabled !== undefined) {
        console.log(`  // Parks state`);
        console.log(`  handleParksToggle(${scene.parksEnabled});`);
      }
      console.log(`}`);
      console.log(``);
    });
    
    console.log('='.repeat(60));
    
    // Generate layer statistics
    console.log('\n📊 Layer Statistics:');
    const layerStats = {};
    
    scenes.forEach(scene => {
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
    
    Object.entries(layerStats).forEach(([layer, stats]) => {
      const percentage = ((stats.enabled / stats.total) * 100).toFixed(1);
      console.log(`   ${layer}: ${stats.enabled}/${stats.total} scenes (${percentage}%)`);
    });
    
    console.log('\n✅ Scene capture complete!');
    console.log('💡 Copy the JSON above to update your backup script');
    
  } catch (error) {
    console.error('❌ Error capturing scenes:', error.message);
    console.error('Stack trace:', error.stack);
  }
})(); 