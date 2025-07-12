const fs = require('fs');
const path = require('path');
const shapefile = require('shapefile');

async function convertShapefileToGeoJSON() {
    const shapefilePath = path.join(__dirname, 'public', 'FLOOD', 'flood_zones_vector.shp');
    const outputPath = path.join(__dirname, 'public', 'FLOOD', 'flood_zones_vector.json');
    
    try {
        console.log('Reading shapefile...');
        const source = await shapefile.open(shapefilePath);
        
        const features = [];
        let result;
        
        console.log('Converting features...');
        while ((result = await source.read()) && !result.done) {
            features.push(result.value);
        }
        
        const geojson = {
            type: 'FeatureCollection',
            features: features
        };
        
        console.log(`Writing ${features.length} features to JSON...`);
        fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
        
        console.log(`Conversion complete! Output saved to: ${outputPath}`);
        console.log(`Total features: ${features.length}`);
        
    } catch (error) {
        console.error('Error converting shapefile:', error);
    }
}

convertShapefileToGeoJSON(); 