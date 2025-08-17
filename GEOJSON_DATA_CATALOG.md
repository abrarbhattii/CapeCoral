# GeoJSON Data Catalog for Cape Coral Wind-Only Foreclosure Map

This document catalogs all GeoJSON files in the project, their sizes, content descriptions, and how to recreate them.

## File Overview

### Large Data Files (Currently Git Ignored)

| File | Size | Location | Description | Source/Method to Recreate |
|------|------|----------|-------------|---------------------------|

## FLOOD Directory (`public/FLOOD/`)

### Flood Zone Data
- **cape_coral_flood_zones.geojson** (9.7MB)
  - Original Cape Coral flood zones from FEMA
  - Contains flood zone polygons with AE, VE, X zones
  - Source: FEMA National Flood Hazard Layer

- **cape_coral_9x_flood_zones.geojson** (145MB)
  - 9x expanded flood zone data
  - Enlarged flood boundaries for analysis
  - Method: Buffer/expand original flood zones by factor of 9

- **cape_coral_expanded_3x_flood_zones.geojson** (43MB)
  - 3x expanded flood zone data
  - Method: Buffer/expand original flood zones by factor of 3

- **cape_coral_coastal_extension_flood_zones.geojson** (364MB)
  - Extended coastal flood zones
  - Enhanced coastal flood risk areas
  - Method: Coastal buffer analysis + FEMA data

- **cape_coral_coastal_simplified_flood_zones.geojson** (45MB)
  - Simplified version of coastal extension zones
  - Method: Geometry simplification of coastal extension data

- **cape_coral_extended_simplified_coastal_flood_zones.geojson** (588MB)
  - Extended and simplified coastal zones
  - Largest flood zone dataset

- **cape_coral_mega_simplified_flood_zones.geojson** (1.2GB)
  - Mega simplified flood zones (largest file)
  - Ultra-detailed flood risk mapping

- **cape_coral_optimized_extended_coastal_flood_zones.geojson** (43MB)
  - Optimized version of extended coastal zones
  - Method: Geometry optimization for performance

- **cape_coral_ultra_simplified_mega_flood_zones.geojson** (51MB)
  - Ultra simplified version of mega zones
  - Method: Aggressive geometry simplification

### Flood Max Data
- **floodMax.geojson** (270MB)
  - Maximum flood extent data
  - Worst-case flooding scenarios

- **floodMax2.geojson** (211MB)
  - Alternative maximum flood extent
  - Different flood modeling scenario

## FLOOD2 Directory (`public/FLOOD2/`)

### Core Flood Data
- **cape_coral_flood_zones.geojson** (9.7MB)
  - Copy of main flood zones data
  - Same as FLOOD directory version

- **cape_coral_9x_flood_zones.geojson** (145MB)
  - 9x expanded zones (duplicate)

- **cape_coral_expanded_3x_flood_zones.geojson** (43MB)
  - 3x expanded zones (duplicate)

- **cape_coral_coastal_extension_flood_zones.geojson** (364MB)
  - Coastal extension zones (duplicate)

- **cape_coral_coastal_simplified_flood_zones.geojson** (45MB)
  - Simplified coastal zones (duplicate)

- **cape_coral_optimized_extended_coastal_flood_zones.geojson** (43MB)
  - Optimized coastal zones (duplicate)

- **cape_coral_ultra_simplified_mega_flood_zones.geojson** (51MB)
  - Ultra simplified zones (duplicate)

### Building Data
- **cape_coral_buildings.geojson** (202MB)
  - Building footprints for Cape Coral
  - Contains building polygons with attributes:
    - building_type, height, levels, address, amenity
  - Source: Microsoft Building Footprints + OSM data

### Transportation Data
- **cape_coral_roads.geojson** (40MB)
  - Road network for Cape Coral
  - Source: OpenStreetMap road data
  - Method: OSM Overpass API query for highways

- **cape_coral_paths.geojson** (6.7MB)
  - Pedestrian paths and trails
  - Source: OpenStreetMap path data
  - Method: OSM Overpass API query for footways/paths

### Points of Interest (POI) Data
- **commercial_pois.geojson** (864KB)
  - Commercial points of interest
  - Shops, restaurants, services
  - Source: OpenStreetMap POI data
  - Method: OSM Overpass API query for commercial amenities

- **social_pois.geojson** (346KB)
  - Social/community points of interest
  - Schools, libraries, community centers
  - Source: OpenStreetMap POI data

- **environmental_pois.geojson** (34MB)
  - Environmental/natural points of interest
  - Parks, nature areas, water features
  - Source: OpenStreetMap environmental data

### Hurricane Data
- **hurricane_milton_COMPLETE_20250710_150039.geojson** (4.4MB)
  - Hurricane Milton track and impact data
  - Timestamp: July 10, 2025, 15:00:39
  - Contains hurricane path and affected areas

### Flood Max Data
- **floodMax.geojson** (270MB)
  - Maximum flood extent (duplicate from FLOOD)

### US Army Corps of Engineers Data
- **USACE.geojson** (4.2MB)
  - US Army Corps of Engineers flood control data
  - Levees, dams, flood control structures
  - Source: USACE National Levee Database

## Root Public Directory (`public/`)

### Property Data
- **florida_properties_real_data_20250703_105442.geojson** (405KB)
  - Real property data for Florida
  - Timestamp: July 3, 2025, 10:54:42
  - Property records with ownership and value data

### Insurance Data
- **florida_zipcodes_with_insurance_data_20250703_165901.geojson** (1.4MB)
  - ZIP code boundaries with insurance statistics
  - Timestamp: July 3, 2025, 16:59:01

- **florida_zipcodes_with_insurance_data_20250703_171735.geojson** (26MB)
  - Updated ZIP code insurance data
  - Timestamp: July 3, 2025, 17:17:35
  - More comprehensive insurance data

### Census Data
- **lee_county_blockgroup_boundaries.geojson** (543KB)
  - Lee County census block group boundaries
  - Source: US Census TIGER/Line files

- **lee_county_blockgroups_population_65.geojson** (543KB)
  - Block groups with population 65+ statistics
  - Source: US Census ACS data + TIGER boundaries

- **lee_county_blockgroups_with_vulnerability.geojson** (595KB)
  - Block groups with vulnerability indices
  - Social vulnerability and flood risk metrics

### Nested FLOOD2 Data
- **public/FLOOD2/public/FLOOD2/cape_coral_paths.geojson** (6.7MB)
  - Duplicate paths data (nested structure)

- **public/FLOOD2/public/FLOOD2/cape_coral_roads.geojson** (40MB)
  - Duplicate roads data (nested structure)

## Data Sources and Recreation Methods

### FEMA Flood Data
- **Source**: FEMA National Flood Hazard Layer (NFHL)
- **API**: FEMA Map Service API
- **Method**: Download flood zones for Lee County, FL
- **Processing**: Filter for Cape Coral city boundaries

### OpenStreetMap Data
- **Source**: OpenStreetMap
- **API**: Overpass API
- **Queries**:
  ```
  [out:json][timeout:25];
  (
    way["highway"](area:"Cape Coral, FL");
    way["footway"](area:"Cape Coral, FL");
    node["amenity"](area:"Cape Coral, FL");
  );
  out geom;
  ```

### Building Footprints
- **Source**: Microsoft Building Footprints
- **Method**: Download building polygons for Lee County
- **Processing**: Filter for Cape Coral boundaries

### Census Data
- **Source**: US Census Bureau
- **APIs**: 
  - TIGER/Line Shapefiles API
  - American Community Survey (ACS) API
- **Processing**: Join demographic data with geographic boundaries

### Insurance Data
- **Source**: Florida Office of Insurance Regulation
- **Method**: Aggregate insurance claims and policy data by ZIP code
- **Processing**: Join with ZIP code boundaries

## File Timestamps and Versions

Most files have timestamps in their names indicating when they were generated:
- `20250703_105442` = July 3, 2025, 10:54:42
- `20250703_165901` = July 3, 2025, 16:59:01
- `20250703_171735` = July 3, 2025, 17:17:35
- `20250710_150039` = July 10, 2025, 15:00:39

## Storage and Git Strategy

### Currently Ignored (Large Files)
All GeoJSON files are ignored in `.gitignore` due to size constraints:
- Files range from 346KB to 1.2GB
- Total size: ~3.5GB of geospatial data
- Only 3 small files are currently tracked in git

### Recommended Storage Strategy
1. **Git LFS**: Use Git Large File Storage for files > 100MB
2. **External Storage**: Store on cloud storage (AWS S3, Google Cloud)
3. **Data Pipeline**: Create scripts to regenerate data from sources
4. **Compressed Archives**: Store compressed versions for backup

## Recreation Scripts

### Recommended Scripts to Create
1. **fetch_flood_data.py** - Download FEMA flood zones
2. **fetch_osm_data.py** - Download OSM roads, buildings, POIs
3. **fetch_census_data.py** - Download census boundaries and demographics
4. **process_insurance_data.py** - Process and geocode insurance data
5. **expand_flood_zones.py** - Create expanded flood zone variants
6. **generate_hurricane_data.py** - Process hurricane track data

## Usage Notes

- Files are used by the React mapping application
- Loaded dynamically based on user selections
- Some files are alternatives/variants for different analysis scenarios
- Duplicate files exist for testing different data versions

---

*Generated: January 2025*
*Total GeoJSON files cataloged: 35+*
*Total estimated size: ~3.5GB*
