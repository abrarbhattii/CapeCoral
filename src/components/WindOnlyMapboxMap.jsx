import React, { useState, useEffect, useMemo } from 'react';
import Map, { Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const WindOnlyMapboxMap = () => {
  const [hypothesisData, setHypothesisData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedZipCode, setSelectedZipCode] = useState(null);
  const [currentZipIndex, setCurrentZipIndex] = useState(0);
  const [viewState, setViewState] = useState({
    longitude: -81.9495,
    latitude: 26.5629,
    zoom: 9,
    pitch: 0,
    bearing: 0
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load our wind-only hypothesis dataset
        const response = await fetch('/wind_only_hypothesis_dataset_20250704_072043.json');
        if (!response.ok) {
          throw new Error(`Failed to load hypothesis data: ${response.status}`);
        }
        const data = await response.json();
        
        console.log('Loaded wind-only hypothesis data:', data);
        
        setHypothesisData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Animation effect for playing through zip codes
  useEffect(() => {
    let interval;
    if (isPlaying && hypothesisData) {
      const zipCodes = Object.keys(hypothesisData.zip_code_wind_only_estimates);
      interval = setInterval(() => {
        setCurrentZipIndex(prev => {
          const next = (prev + 1) % zipCodes.length;
          setSelectedZipCode(zipCodes[next]);
          
          // Update view to focus on selected zip code
          const coords = getZipCodeCoordinates(zipCodes[next]);
          setViewState(prev => ({
            ...prev,
            longitude: coords[0],
            latitude: coords[1],
            zoom: 11
          }));
          
          return next;
        });
      }, 3000); // 3 seconds per zip code
    }
    return () => clearInterval(interval);
  }, [isPlaying, hypothesisData]);

  const zipCodeGeoJSON = useMemo(() => {
    if (!hypothesisData?.zip_code_wind_only_estimates) return null;

    const features = Object.entries(hypothesisData.zip_code_wind_only_estimates).map(([zipCode, data]) => {
      const coords = getZipCodeCoordinates(zipCode);
      
      return {
        type: 'Feature',
        properties: {
          zipCode,
          windOnlyPolicies: data.estimated_wind_only_policies.total_wind_only_policies,
          concentration: data.foreclosure_risk_indicators.wind_only_concentration,
          riskLevel: data.foreclosure_risk_indicators.motivated_seller_potential,
          propertyCount: data.distribution_factors.property_count,
          avgValue: data.distribution_factors.avg_property_value,
          windRiskScore: data.distribution_factors.wind_risk_score,
          personalResidential: data.estimated_wind_only_policies.personal_residential_wind_only,
          commercialResidential: data.estimated_wind_only_policies.commercial_residential_wind_only,
          marketStressScore: data.foreclosure_risk_indicators.market_stress_score
        },
        geometry: {
          type: 'Point',
          coordinates: coords
        }
      };
    });

    return {
      type: 'FeatureCollection',
      features
    };
  }, [hypothesisData]);

  const getZipCodeCoordinates = (zipCode) => {
    // Coordinates for Florida zip codes from our data
    const coords = {
      '33904': [-81.9495, 26.5629], // Cape Coral
      '33914': [-81.8723, 26.5629], // Cape Coral
      '33990': [-81.8723, 26.4801], // Cape Coral
      '33991': [-81.8723, 26.4801], // Cape Coral
      '33901': [-81.8607, 26.6406], // Fort Myers
      '33912': [-81.8607, 26.6406], // Fort Myers
      '33905': [-81.8607, 26.6406], // Fort Myers
      '33907': [-81.8607, 26.6406], // Fort Myers
      '33916': [-81.8607, 26.6406], // Fort Myers
      '33909': [-81.8607, 26.6406], // Fort Myers
      '33936': [-82.1009, 26.4614], // Punta Gorda
      '33971': [-82.2343, 26.9342], // Port Charlotte
      '33972': [-82.2343, 26.9342], // Port Charlotte
      '33973': [-82.2343, 26.9342], // Port Charlotte
      '33974': [-82.2343, 26.9342], // Port Charlotte
      '34287': [-82.4543, 27.4989], // Bradenton
      '34288': [-82.4543, 27.4989], // Bradenton
      '34289': [-82.4543, 27.4989], // Bradenton
      '34291': [-82.4543, 27.4989], // Bradenton
      '34292': [-82.4543, 27.4989], // Bradenton
      '33948': [-82.1009, 26.4614], // Punta Gorda
      '33949': [-82.1009, 26.4614], // Punta Gorda
      '33950': [-82.1009, 26.4614], // Punta Gorda
      '33952': [-82.1009, 26.4614], // Punta Gorda
      '33953': [-82.1009, 26.4614]  // Punta Gorda
    };
    
    return coords[zipCode] || [-81.9495, 26.5629]; // Default to Cape Coral
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    
    if (!isPlaying && hypothesisData) {
      // Reset to first zip code when starting
      const zipCodes = Object.keys(hypothesisData.zip_code_wind_only_estimates);
      setCurrentZipIndex(0);
      setSelectedZipCode(zipCodes[0]);
    } else {
      // Reset view when stopping
      setSelectedZipCode(null);
      setViewState(prev => ({
        ...prev,
        longitude: -81.9495,
        latitude: 26.5629,
        zoom: 9
      }));
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f172a',
        color: '#e2e8f0',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px', fontWeight: '600' }}>
            🌪️ Loading Wind-Only Foreclosure Analysis
          </div>
          <div style={{ fontSize: '16px', opacity: 0.7 }}>
            Analyzing Citizens Insurance data for foreclosure prediction...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f172a',
        color: '#ef4444',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: '16px' }}>Error Loading Data</div>
          <div style={{ fontSize: '14px' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      backgroundColor: '#0f172a',
      fontFamily: "'Inter', sans-serif",
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #334155',
        padding: '20px 32px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: '700',
              color: '#f1f5f9',
              marginBottom: '6px'
            }}>
              🌪️ Wind-Only Insurance Foreclosure Predictor
            </h1>
            <p style={{
              margin: 0,
              fontSize: '16px',
              color: '#94a3b8'
            }}>
              Citizens Property Insurance • {hypothesisData?.citizens_totals?.total_wind_only_policies?.toLocaleString()} Total Policies • {hypothesisData?.metadata?.zip_codes_covered} Zip Codes
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={handlePlay}
              style={{
                backgroundColor: isPlaying ? '#dc2626' : '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
            >
              {isPlaying ? '⏸️ Pause Analysis' : '▶️ Play Analysis'}
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
      >
        {zipCodeGeoJSON && (
          <Source id="zip-codes" type="geojson" data={zipCodeGeoJSON}>
            <Layer
              id="zip-code-circles"
              type="circle"
              paint={{
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['get', 'windOnlyPolicies'],
                  0, 8,
                  50, 15,
                  100, 25,
                  500, 35,
                  1000, 45,
                  90000, 60
                ],
                'circle-color': [
                  'case',
                  ['>', ['get', 'concentration'], 100], '#dc2626',
                  ['>', ['get', 'concentration'], 1.0], '#ea580c',
                  '#059669'
                ],
                'circle-opacity': [
                  'case',
                  ['==', ['get', 'zipCode'], selectedZipCode || ''], 1.0,
                  0.8
                ],
                'circle-stroke-width': [
                  'case',
                  ['==', ['get', 'zipCode'], selectedZipCode || ''], 4,
                  2
                ],
                'circle-stroke-color': [
                  'case',
                  ['==', ['get', 'zipCode'], selectedZipCode || ''], '#fbbf24',
                  '#f1f5f9'
                ]
              }}
            />
          </Source>
        )}
      </Map>

      {/* Information Panel */}
      {selectedZipCode && hypothesisData?.zip_code_wind_only_estimates?.[selectedZipCode] && (
        <div style={{
          position: 'absolute',
          top: '120px',
          right: '32px',
          zIndex: 1000,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid #334155',
          padding: '24px',
          width: '320px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          {(() => {
            const data = hypothesisData.zip_code_wind_only_estimates[selectedZipCode];
            return (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: data.foreclosure_risk_indicators.motivated_seller_potential === 'high' ? '#dc2626' :
                                   data.foreclosure_risk_indicators.motivated_seller_potential === 'medium' ? '#ea580c' : '#059669'
                  }} />
                  <h3 style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#f1f5f9'
                  }}>
                    Zip Code {selectedZipCode}
                  </h3>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    color: '#fbbf24',
                    lineHeight: 1,
                    marginBottom: '4px'
                  }}>
                    {data.estimated_wind_only_policies.total_wind_only_policies.toLocaleString()}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#94a3b8'
                  }}>
                    Total Wind-Only Policies
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#f1f5f9',
                      marginBottom: '4px'
                    }}>
                      {data.foreclosure_risk_indicators.wind_only_concentration.toFixed(2)}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#94a3b8'
                    }}>
                      Policies per Property
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#f1f5f9',
                      marginBottom: '4px'
                    }}>
                      {data.foreclosure_risk_indicators.motivated_seller_potential.toUpperCase()}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#94a3b8'
                    }}>
                      Foreclosure Risk
                    </div>
                  </div>
                </div>

                <div style={{
                  borderTop: '1px solid #334155',
                  paddingTop: '16px',
                  fontSize: '13px',
                  color: '#94a3b8',
                  lineHeight: 1.5
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#f1f5f9' }}>Properties:</strong> {data.distribution_factors.property_count.toLocaleString()}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#f1f5f9' }}>Avg Value:</strong> ${data.distribution_factors.avg_property_value.toLocaleString()}
                  </div>
                  <div>
                    <strong style={{ color: '#f1f5f9' }}>Wind Risk Score:</strong> {(data.distribution_factors.wind_risk_score * 100).toFixed(0)}%
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        left: '32px',
        right: '32px',
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid #334155',
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto auto',
          gap: '32px',
          alignItems: 'center'
        }}>
          {/* Hypothesis Explanation */}
          <div>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#f1f5f9'
            }}>
              🧪 Foreclosure Prediction Hypothesis
            </h4>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#94a3b8',
              lineHeight: 1.5
            }}>
              <strong>Theory:</strong> High wind-only insurance concentration indicates market stress →
              Increased foreclosure risk → Motivated seller opportunities.
              {isPlaying && selectedZipCode && (
                <span style={{ color: '#fbbf24' }}> Currently analyzing {selectedZipCode}...</span>
              )}
            </p>
          </div>

          {/* Stats */}
          <div style={{
            textAlign: 'center',
            padding: '0 24px',
            borderLeft: '1px solid #334155'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#dc2626',
              lineHeight: 1,
              marginBottom: '4px'
            }}>
              {hypothesisData ? Object.values(hypothesisData.zip_code_wind_only_estimates)
                .filter(data => data.foreclosure_risk_indicators.motivated_seller_potential === 'high')
                .length : 0}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#94a3b8'
            }}>
              High Risk Zones
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '0 24px',
            borderLeft: '1px solid #334155'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#fbbf24',
              lineHeight: 1,
              marginBottom: '4px'
            }}>
              {hypothesisData ? (
                Object.values(hypothesisData.zip_code_wind_only_estimates)
                  .reduce((sum, data) => sum + data.foreclosure_risk_indicators.wind_only_concentration, 0) /
                Object.keys(hypothesisData.zip_code_wind_only_estimates).length
              ).toFixed(1) : '0'}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#94a3b8'
            }}>
              Avg Concentration
            </div>
          </div>

          {/* Legend */}
          <div style={{
            borderLeft: '1px solid #334155',
            paddingLeft: '24px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#f1f5f9',
              marginBottom: '12px'
            }}>
              Risk Levels
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { color: '#059669', label: 'Low Risk', desc: '<1.0 per property' },
                { color: '#ea580c', label: 'Medium Risk', desc: '1.0-100 per property' },
                { color: '#dc2626', label: 'High Risk', desc: '>100 per property' }
              ].map(({ color, label, desc }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: color,
                    borderRadius: '50%'
                  }} />
                  <div>
                    <div style={{ fontSize: '11px', color: '#f1f5f9', fontWeight: '500' }}>{label}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WindOnlyMapboxMap;
