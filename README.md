# Wind-Only Foreclosure Map

A React-based interactive mapping application for visualizing wind-only insurance foreclosure risk in Lee County, Florida. The application displays flood zones, census data, and environmental points of interest to help analyze vulnerability and risk factors.

## Features

- **Interactive Map**: Built with Mapbox GL JS and React Map GL
- **Flood Zone Visualization**: Multiple flood zone datasets with different resolutions
- **Census Data Integration**: Block group boundaries with population vulnerability data
- **Environmental POIs**: Points of interest including environmental, social, and commercial locations
- **Scene Management**: Capture and recreate map scenes with specific configurations
- **Layer Controls**: Toggle visibility of different data layers
- **Responsive Design**: Works on desktop and mobile devices
- **Data Catalog**: Comprehensive documentation of all geospatial datasets

## Data Sources

### Flood Data
- **FLOOD/**: High-resolution flood zone data (excluded from git due to size)
- **FLOOD2/**: Optimized flood zone data for web display
- Sources: FEMA DFIRM data, USACE flood data

### Census Data
- **CEN/**: Census block group boundaries (excluded from git due to size)
- Population vulnerability metrics
- Sources: US Census Bureau

### Points of Interest
- Environmental POIs (parks, conservation areas)
- Social POIs (schools, hospitals, community centers)
- Commercial POIs (businesses, retail locations)
- Sources: OpenStreetMap, government datasets

### Property Data
- Florida property data with insurance information
- Wind-only insurance time series data
- Sources: Property records, insurance databases

## Project Structure

```
wind-only-foreclosure-map/
├── public/                    # Static assets and data files
│   ├── FLOOD/                # High-resolution flood data (gitignored)
│   ├── FLOOD2/               # Optimized flood data
│   ├── CEN/                  # Census data (gitignored)
│   └── index.html            # Main HTML file
├── src/                      # React application source
│   ├── components/           # React components
│   │   ├── WindOnlyForeclosureMap.jsx
│   │   ├── WindOnlyHypothesisMap.jsx
│   │   ├── WindOnlyMapboxMap.jsx
│   │   ├── MapMainPanel.jsx
│   │   ├── BlockGroupDetailsCard.jsx
│   │   ├── ScenePopupCard.jsx
│   │   ├── ScenePopupManager.jsx
│   │   ├── mapLayerManager.js
│   │   ├── mapDataLoader.js
│   │   ├── mapUIComponents.jsx
│   │   ├── scenesMgm.js
│   │   └── WindOnlyForeclosureMap.css
│   ├── App.js               # Main application component
│   └── index.js             # Application entry point
├── capture_scenes.js          # Scene capture utility
├── capture_scenes_browser.js  # Browser-based scene capture
├── recreate_scenes.js         # Scene recreation utility
├── GEOJSON_DATA_CATALOG.md   # Comprehensive data documentation
├── SCENE_BACKUP_README.md    # Scene backup documentation
├── package.json             # Node.js dependencies
└── README.md               # This file
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd wind-only-foreclosure-map
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
```

## Data Processing

The project includes several Python scripts for data processing (excluded from git):

- `create_population_65_map.py`: Generates population 65+ choropleth maps
- `create_census_vulnerability_map.py`: Creates vulnerability index maps
- `get_lee_county_blockgroup_geojson.py`: Downloads and processes census boundaries
- `create_color_palette.py`: Generates color palettes for visualization

## Large Data Files

The following large data files are excluded from version control (see `.gitignore`):

- **Flood zone data**: Multi-gigabyte shapefiles and GeoTIFFs
- **Census boundaries**: Large shapefile datasets
- **Property data**: Real estate and insurance datasets
- **Generated maps**: PNG and GeoJSON files created during processing

### 📋 GeoJSON Data Catalog

For a comprehensive overview of all GeoJSON files in this project, see **[GEOJSON_DATA_CATALOG.md](./GEOJSON_DATA_CATALOG.md)**. This catalog includes:

- **35+ GeoJSON files** (~3.5GB total)
- Detailed descriptions and file sizes
- Data sources and APIs used
- Step-by-step recreation methods
- Recommended storage strategies

### Getting the Data Files

To obtain the data files:
1. **Regenerate from sources**: Use the methods documented in `GEOJSON_DATA_CATALOG.md`
2. **Contact project maintainers** for access to the data repository
3. **Use provided scripts**: Run data download scripts (requires appropriate API access)

Key data sources include:
- **FEMA National Flood Hazard Layer** (flood zones)
- **OpenStreetMap** (roads, buildings, POIs)
- **US Census Bureau** (demographics, boundaries)
- **Microsoft Building Footprints** (building data)
- **Florida Office of Insurance Regulation** (insurance data)

## Configuration

The application uses several configuration files:
- `rconfig.txt`: API keys and configuration (excluded from git)
- Mapbox access tokens (set via environment variables)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all tests pass
5. Submit a pull request

## License

[Add your license information here]

## Contact

[Add contact information here]

## Data Attribution

- **Flood Data**: FEMA DFIRM, USACE
- **Census Data**: US Census Bureau
- **POI Data**: OpenStreetMap contributors
- **Property Data**: [Add source attribution] 