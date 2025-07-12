import { useMemo } from 'react';

// Data loading configuration with priorities
export const DATA_LOADING_CONFIG = {
  // Phase 1: Essential layers (load immediately)
  essential: [
    { key: 'floodZones', url: '/FLOOD2/cape_coral_9x_flood_zones.geojson', priority: 1 },
    { key: 'zipCodeBoundaries', url: '/florida_zipcodes_with_insurance_data_20250703_171735.geojson', priority: 1 },
  ],
  // Phase 2: Core layers (load after essential)
  core: [
    { key: 'coastalFloodZones', url: '/FLOOD2/cape_coral_coastal_simplified_flood_zones.geojson', priority: 2 },

    { key: 'coastalExtensionFloodZones', url: '/FLOOD2/cape_coral_coastal_extension_flood_zones.geojson', priority: 2 },
    { key: 'floodMax', url: '/FLOOD2/floodMax.geojson', priority: 2 },
    { key: 'usace', url: '/FLOOD2/USACE.geojson', priority: 2 },
    { key: 'hurricaneMilton', url: '/FLOOD2/hurricane_milton_COMPLETE_20250710_150039.geojson', priority: 2 },
  ],
  // Phase 3: Heavy layers (load on demand or after core)
  heavy: [
    { key: 'buildings', url: '/FLOOD2/cape_coral_buildings.geojson', priority: 3, delay: 1000 },
    { key: 'roads', url: '/FLOOD2/cape_coral_roads.geojson', priority: 3, delay: 500 },
    { key: 'paths', url: '/FLOOD2/cape_coral_paths.geojson', priority: 3, delay: 500 },
    { key: 'redfinProperties', url: '/florida_properties_real_data_20250703_105442.geojson', priority: 3, delay: 500 },
  ],
  // Phase 4: POI layers (load last)
  poi: [
    { key: 'commercialPois', url: '/FLOOD2/commercial_pois.geojson', priority: 4, delay: 200 },
    { key: 'socialPois', url: '/FLOOD2/social_pois.geojson', priority: 4, delay: 200 },
    { key: 'environmentalPois', url: '/FLOOD2/environmental_pois.geojson', priority: 4, delay: 200 },
  ],
  // Phase 5: Administrative boundaries (load after POIs)
  admin: [
    { key: 'blockGroupBoundaries', url: '/lee_county_blockgroups_population_65.geojson', priority: 5, delay: 300 },
  ]
};

// Layer styles configuration
export const layerStyles = {
  // Flood zones layer style
  floodZones: {
    id: 'flood-zones',
    type: 'fill',
    paint: {
      'fill-color': [
        'match',
        ['get', 'flood_zone'],
        1, '#06b6d4',
        2, '#0891b2',
        3, '#0e7490',
        4, '#155e75',
        '#0c4a6e'
      ],
      'fill-opacity': 0.18,
      'fill-outline-color': '#e0f2fe'
    }
  },

  // Buildings layer style
  buildings: {
    id: 'buildings',
    type: 'fill-extrusion',
    maxzoom: 18,
    paint: {
      'fill-extrusion-color': '#ffffff',
      'fill-extrusion-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        10, 0.1, // Very light opacity at low zoom
        12, 0.2, // Light opacity at medium-low zoom
        14, 0.3, // Medium opacity at medium zoom
        16, 0.5, // Higher opacity at high zoom
        18, 0.6  // Full opacity at very high zoom
      ],
      'fill-extrusion-height': [
        'interpolate',
        ['linear'],
        ['zoom'],
        10, 1,   // Very low height at low zoom
        12, 2,   // Low height at medium-low zoom
        14, 3,   // Medium height at medium zoom
        16, 5,   // Higher height at high zoom
        18, [
          'case',
          ['has', 'height'], ['min', ['get', 'height'], 30],
          ['has', 'levels'], ['min', ['*', ['get', 'levels'], 2], 30],
          ['has', 'building_type'], [
            'match',
            ['get', 'building_type'],
            'house', 4,
            'apartments', 8,
            'commercial', 6,
            'industrial', 5,
            'school', 6,
            'hospital', 10,
            3
          ],
          3
        ]
      ],
      'fill-extrusion-base': 0,
      'fill-extrusion-translate': [0, 0],
      'fill-extrusion-translate-anchor': 'map'
    }
  },

  // Roads layer style
  roads: {
    id: 'roads',
    type: 'line',
    paint: {
      'line-color': [
        'case',
        ['==', ['get', 'highway_type'], 'motorway'], '#dc2626',
        ['==', ['get', 'highway_type'], 'primary'], '#ea580c',
        ['==', ['get', 'highway_type'], 'secondary'], '#f59e0b',
        ['==', ['get', 'highway_type'], 'residential'], '#6b7280',
        '#9ca3af' // Default
      ],
      'line-width': [
        'case',
        ['==', ['get', 'highway_type'], 'motorway'], 3,
        ['==', ['get', 'highway_type'], 'primary'], 2.5,
        ['==', ['get', 'highway_type'], 'secondary'], 2,
        ['==', ['get', 'highway_type'], 'residential'], 1,
        0.5 // Default
      ],
      'line-opacity': 0.8
    }
  },

  // Paths layer style
  paths: {
    id: 'paths',
    type: 'line',
    paint: {
      'line-color': '#10b981',
      'line-width': 1,
      'line-opacity': 0.6,
      'line-dasharray': [2, 2]
    }
  },

  // Redfin properties markers layer style
  redfinProperties: {
    id: 'redfin-properties',
    type: 'circle',
    paint: {
      'circle-radius': [
        'case',
        ['==', ['get', 'risk_level'], 'high'], 8,
        ['==', ['get', 'risk_level'], 'medium'], 6,
        4
      ],
      'circle-color': [
        'case',
        ['==', ['get', 'risk_level'], 'high'], '#ef4444',
        ['==', ['get', 'risk_level'], 'medium'], '#f59e0b',
        '#10b981'
      ],
      'circle-opacity': 0.8
    }
  },

  // POI layer styles
  commercialPois: {
    id: 'commercial-pois',
    type: 'circle',
    paint: {
      'circle-radius': 4,
      'circle-color': '#f59e0b',
      'circle-opacity': 0.8
    }
  },

  socialPois: {
    id: 'social-pois',
    type: 'circle',
    paint: {
      'circle-radius': 4,
      'circle-color': '#10b981',
      'circle-opacity': 0.8
    }
  },

  environmentalPois: {
    id: 'environmental-pois',
    type: 'circle',
    paint: {
      'circle-radius': 1.24,
      'circle-color': '#3b82f6',
      'circle-opacity': 0.6
    }
  },

  // Block group boundaries layer style (with population 65+ coloring)
  blockGroupBoundaries: {
    id: 'block-group-boundaries',
    type: 'fill',
    paint: {
      'fill-color': '#FF0000',
      'fill-opacity': [
        'interpolate',
        ['linear'],
        ['get', 'population_65_plus'],
        0, 0.01,    // Very Low: 10% opacity
        100, 0.001,  // Low: 20% opacity
        200, 0.001,  // Medium-Low: 40% opacity
        300, 0.005,  // Medium: 60% opacity
        400, 0.01,  // Medium-High: 80% opacity
        500, 0.20   // High: 90% opacity
      ],
      'fill-outline-color': '#6366f1'
    }
  },

  // Coastal flood zones layer style
  coastalFloodZones: {
    id: 'coastal-flood-zones',
    type: 'fill',
    paint: {
      'fill-color': [
        'match',
        ['get', 'flood_zone'],
        1, '#06b6d4',
        2, '#0891b2',
        3, '#0e7490',
        4, '#155e75',
        '#0c4a6e'
      ],
      'fill-opacity': 0.18,
      'fill-outline-color': '#e0f2fe'
    }
  },





  // Coastal extension flood zones layer style
  coastalExtensionFloodZones: {
    id: 'coastal-extension-flood-zones',
    type: 'fill',
    paint: {
      'fill-color': [
        'match',
        ['get', 'flood_zone'],
        1, '#10b981',
        2, '#059669',
        3, '#047857',
        4, '#065f46',
        '#064e3b'
      ],
      'fill-opacity': 0.15,
      'fill-outline-color': '#10b981'
    }
  },

  // FloodMax layer style
  floodMax: {
    id: 'flood-max',
    type: 'fill',
    paint: {
      'fill-color': [
        'match',
        ['get', 'flood_zone'],
        1, '#f59e0b',
        2, '#d97706',
        3, '#b45309',
        4, '#92400e',
        '#78350f'
      ],
      'fill-opacity': 0.2,
      'fill-outline-color': '#f59e0b'
    }
  },

  // USACE layer style
  usace: {
    id: 'usace',
    type: 'fill',
    paint: {
      'fill-color': [
        'match',
        ['get', 'description'],
        'TAMPA PERMITS SECTION', '#8b5cf6',
        'PANAMA CITY PERMITS SECTION', '#7c3aed',
        'PENSACOLA PERMITS SECTION', '#6d28d9',
        'JACKSONVILLE PERMITS SECTION', '#5b21b6',
        'FORT MYERS PERMITS SECTION', '#4c1d95',
        'MIAMI PERMITS SECTION', '#3730a3',
        'PALM BEACH GARDENS PERMITS SECTION', '#312e81',
        'COCOA PERMITS SECTION', '#1e1b4b',
        '#8b5cf6'
      ],
      'fill-opacity': 0.15,
      'fill-outline-color': '#8b5cf6'
    }
  },

  // Zip code boundaries layer style
  zipCodeBoundaries: {
    id: 'zip-code-boundaries',
    type: 'line',
    paint: {
      'line-color': '#ef4444',
      'line-width': 1,
      'line-opacity': 0.8
    }
  },

  // Hurricane Milton damage layer style
  hurricaneMilton: {
    id: 'hurricane-milton',
    type: 'circle',
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'total_damage'],
        0, 2,
        100000, 4,
        500000, 8,
        800000, 12
      ],
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'total_damage'],
        0, '#10b981',
        50000, '#f59e0b',
        200000, '#f97316',
        500000, '#dc2626',
        800000, '#7c2d12'
      ],
      'circle-opacity': 0.7,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 1
    }
  }
}; 