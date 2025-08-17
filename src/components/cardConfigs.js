/**
 * Dynamic Card Configurations for AI Storm Navigator
 * 
 * This file contains popup card configurations that can be updated on-the-fly
 * without requiring browser cache clearing. Cards are loaded dynamically
 * and override any stored scene data.
 * 
 * Usage: Update coordinates here and refresh page to see changes immediately.
 */

export const CARD_CONFIGS = {
  // Scene 1 Cards (Overview)
  "1752889907158": [
    {
      "id": "card_overview_summary",
      "position": { "lat": 26.560, "lng": -81.987 },
      "title": "Cape Coral: AI Analysis Target",
      "nextSceneId": "1752890011711", // Scene 2
      "content": {
        "type": "overview_report",
        "description": "**AI Analysis Complete**\n\nCape Coral identified as primary target zone. **30 zip codes** mapped and analyzed. Current insurance premiums averaging **$15,000/year** with **8% underwater mortgages** detected. Market conditions indicate **accelerated risk abandonment** pattern.",
        "data": {
          "analysisScope": "30 zip codes mapped",
          "aiTarget": "Cape Coral identified",
          "currentPremiums": "$15K/year insurance",
          "marketStatus": "8% underwater mortgages"
        }
      },
      "style": {
        "theme": "dark",
        "size": "medium",
        "priority": 1
      }
    }
  ],
  
  // Scene 2 Cards
  "1752890011711": [
    {
      "id": "card_infrastructure_status",
      "position": { "lat": 26.554, "lng": -81.954 },
      "title": "The Pricing Death Spiral",
      "nextSceneId": "1752890044121", // Scene 3
      "content": {
        "type": "infrastructure_report",
        "description": "**Pricing Analysis**\n\nAnnual premiums now **$15,000/year** - exceeding most rental costs. Market response: **cancel coverage** rather than upgrade. Primary targets: **fixed income seniors** with limited financial flexibility. Death spiral **accelerating**.",
        "data": {
          "annualPremiums": "$15,000/year",
          "vsRentCosts": "More than most rent",
          "marketResponse": "Cancel, don't upgrade",
          "targetDemo": "Fixed income seniors"
        }
      },
      "style": {
        "theme": "dark",
        "size": "medium",
        "priority": 1
      }
    }
  ],
  
  // Scene 3 Cards
  "1752890044121": [
    {
      "id": "card_flood_zone",
      "position": { "lat": 26.410, "lng": -81.971 },
      "title": "The Silent Market Exit",
      "nextSceneId": "1752890582825", // Scene 4
      "content": {
        "type": "flood_zone",
        "description": "**Market Exit Pattern**\n\nResidents **own homes outright** - no mortgage requirements. **Free choice** to cancel coverage. Pattern: **silent abandonment** rather than public protest. Market hollowing out **before storm impact**.",
        "data": {
          "homeOwnership": "Own homes outright",
          "mortgageStatus": "No mortgage = no requirement",
          "choicePattern": "Cancel coverage by choice",
          "marketExit": "Silent abandonment"
        }
      },
      "style": {
        "theme": "dark",
        "size": "medium",
        "priority": 2
      }
    },
    {
      "id": "card_hurricane_impact",
      "position": { "lat": 26.770, "lng": -82.000 },
      "title": "Pre-Storm Hollowing",
      "nextSceneId": "1752890582825", // Scene 4
      "content": {
        "type": "damage_report",
        "description": "**Pre-Storm Market Collapse**\n\nCape Coral **hollowed out before Milton hit**. **Cost > asset value** drove **silent abandonment**. When **protection costs exceed property value**, the market **self-destructs predictably**.",
        "data": {
          "timing": "Before Milton hit",
          "process": "Cape Coral hollowed out",
          "mechanism": "Cost > asset value",
          "outcome": "Risk abandonment"
        }
      },
      "style": {
        "theme": "dark",
        "size": "medium",
        "priority": 1
      }
    }
  ],
  
  // Scene 4 Cards
  "1752890582825": [
    {
      "id": "card_environmental_analysis",
      "position": { "lat": 26.676, "lng": -82.119 },
      "title": "Milton Hits Uninsured",
      "nextSceneId": "1752891127158", // Scene 5
      "content": {
        "type": "environmental_report",
        "description": "**FEMA Coverage Gap**\n\n**95% success rate** on claims, but **15% got less than half** their damages. **$250K federal cap** vs **$500K+ wind damage**. When **coverage costs more than the home**, the system breaks from both ends.",
        "data": {
          "stormHits": "Hurricane Milton arrives",
          "exposedProperties": "Uninsured by choice",
          "recoveryMath": "Unaffordable by design",
          "systemicOutcome": "Planned obsolescence"
        }
      },
      "style": {
        "theme": "dark",
        "size": "medium",
        "priority": 1
      }
    }
  ],
  
  // Scene 5 Cards
  "1752891127158": [
    {
      "id": "card_property_assessment",
      "position": { "lat": 26.229, "lng": -81.579 },
      "title": "Not Climate Risk - Pricing Risk",
      "nextSceneId": "1752889907158", // Back to Scene 1 (cycle)
      "content": {
        "type": "property_report",
        "description": "**The Real Math**\n\n**$15K/year premiums** approaching **home values**. **8% underwater mortgages** already. When **protection costs more than the asset**, the market breaks **predictably**. Not climate risk—**pricing risk**.",
        "data": {
          "realStory": "Pricing death spiral",
          "notAbout": "Climate or storms",
          "actualProblem": "Cost > asset value",
          "endResult": "Risk abandonment"
        }
      },
      "style": {
        "theme": "dark",
        "size": "medium",
        "priority": 1
      }
    },
    {
      "id": "card_coastal_protection",
      "position": { "lat": 26.840, "lng": -81.865 },
      "title": "Insurers Fled the Math",
      "nextSceneId": "1752889907158", // Back to Scene 1 (cycle)
      "content": {
        "type": "protection_report",
        "description": "**Insurers' Real Flight**\n\nNot fleeing **climate risk**—running from **markets where total coverage costs more than the home itself**. **Systemic pricing failure** before storms even hit. The **math broke first**.",
        "data": {
          "didntFlee": "Not the storms",
          "actualFear": "The math",
          "timing": "Before Milton hit",
          "collapse": "Systemic pricing failure"
        }
      },
      "style": {
        "theme": "dark",
        "size": "medium",
        "priority": 2
      }
    }
  ]
};

/**
 * Get cards for a specific scene
 * @param {string} sceneId - The scene ID
 * @returns {Array} Array of card configurations
 */
export const getCardsForScene = (sceneId) => {
  return CARD_CONFIGS[sceneId] || [];
};

/**
 * Update card position dynamically
 * @param {string} sceneId - The scene ID
 * @param {string} cardId - The card ID
 * @param {Object} position - New position {lat, lng}
 */
export const updateCardPosition = (sceneId, cardId, position) => {
  if (CARD_CONFIGS[sceneId]) {
    const card = CARD_CONFIGS[sceneId].find(c => c.id === cardId);
    if (card) {
      card.position = position;
      console.log(`🎯 Updated ${cardId} position:`, position);
    }
  }
};

/**
 * Add a new card to a scene
 * @param {string} sceneId - The scene ID
 * @param {Object} cardConfig - Card configuration object
 */
export const addCardToScene = (sceneId, cardConfig) => {
  if (!CARD_CONFIGS[sceneId]) {
    CARD_CONFIGS[sceneId] = [];
  }
  CARD_CONFIGS[sceneId].push(cardConfig);
  console.log(`🎯 Added card ${cardConfig.id} to scene ${sceneId}`);
};

// Development helpers for testing positions
export const DEV_HELPERS = {
  // Quick position presets for Cape Coral area
  POSITIONS: {
    DOWNTOWN: { lat: 26.560, lng: -81.990 },
    WATERFRONT: { lat: 26.545, lng: -82.005 },
    NORTH_CAPE: { lat: 26.580, lng: -81.970 },
    SOUTH_CAPE: { lat: 26.520, lng: -82.020 },
    EAST_CAPE: { lat: 26.550, lng: -81.950 },
    WEST_CAPE: { lat: 26.550, lng: -82.050 }
  },
  
  // Quick update functions for development
  updateScene1Card: (pos) => {
    if (CARD_CONFIGS["1752889907158"]) {
      CARD_CONFIGS["1752889907158"][0].position = pos || DEV_HELPERS.POSITIONS.DOWNTOWN;
      console.log("🎯 Updated Scene 1 card position");
    }
  },
  
  updateScene2Card: (pos) => {
    if (CARD_CONFIGS["1752890011711"]) {
      CARD_CONFIGS["1752890011711"][0].position = pos || DEV_HELPERS.POSITIONS.DOWNTOWN;
      console.log("🎯 Updated Scene 2 card position");
    }
  },
  
  updateScene3Cards: (pos1, pos2) => {
    if (CARD_CONFIGS["1752890044121"]) {
      CARD_CONFIGS["1752890044121"][0].position = pos1 || DEV_HELPERS.POSITIONS.DOWNTOWN;
      CARD_CONFIGS["1752890044121"][1].position = pos2 || DEV_HELPERS.POSITIONS.WATERFRONT;
      console.log("🎯 Updated Scene 3 card positions");
    }
  },
  
  updateScene4Card: (pos) => {
    if (CARD_CONFIGS["1752890582825"]) {
      CARD_CONFIGS["1752890582825"][0].position = pos || DEV_HELPERS.POSITIONS.NORTH_CAPE;
      console.log("🎯 Updated Scene 4 card position");
    }
  },
  
  updateScene5Cards: (pos1, pos2) => {
    if (CARD_CONFIGS["1752891127158"]) {
      CARD_CONFIGS["1752891127158"][0].position = pos1 || DEV_HELPERS.POSITIONS.EAST_CAPE;
      CARD_CONFIGS["1752891127158"][1].position = pos2 || DEV_HELPERS.POSITIONS.SOUTH_CAPE;
      console.log("🎯 Updated Scene 5 card positions");
    }
  }
}; 