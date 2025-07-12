import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './WindOnlyForeclosureMap.css';

const WindOnlyForeclosureMap = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('2020_H1');
  const [selectedMetric, setSelectedMetric] = useState('annual_premium');
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1000); // milliseconds between periods

  // Florida center coordinates
  const floridaCenter = [27.7663, -82.6404];

  // Time periods for animation
  const timePeriods = ['2020_H1', '2020_H2', '2021_H1', '2021_H2', '2022_H1', '2022_H2',
                     '2023_H1', '2023_H2', '2024_H1', '2024_H2', '2025_H1'];



  useEffect(() => {
    // Load the comprehensive GeoJSON data with 513+ zip code boundaries
    fetch('/florida_zipcodes_with_insurance_data_20250703_171735.geojson')
      .then(response => response.json())
      .then(data => {
        console.log('Comprehensive GeoJSON loaded:', data);
        console.log(`Loaded ${data.features.length} zip code boundaries`);
        setGeoJsonData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading GeoJSON data:', error);
        setLoading(false);
      });
  }, []);

  // Play animation effect
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setSelectedPeriod(currentPeriod => {
          const currentIndex = timePeriods.indexOf(currentPeriod);
          const nextIndex = (currentIndex + 1) % timePeriods.length;
          return timePeriods[nextIndex];
        });
      }, playSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, timePeriods]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setSelectedPeriod('2020_H1');
  };

  const getColorByValue = (value, metric) => {
    let intensity;

    switch (metric) {
      case 'foreclosure_risk_score':
        // 0-100 scale
        intensity = Math.min(value / 100, 1);
        break;
      case 'rate_change_percent':
        // -20 to +50 scale
        intensity = Math.min(Math.max((value + 20) / 70, 0), 1);
        break;
      case 'annual_premium':
        // $2000-$7000 scale
        intensity = Math.min(Math.max((value - 2000) / 5000, 0), 1);
        break;
      default:
        intensity = 0.5;
    }

    // Enhanced color gradient - more vibrant colors
    if (intensity < 0.2) {
      return '#00ff00'; // Bright green for very low values
    } else if (intensity < 0.4) {
      return '#80ff00'; // Yellow-green
    } else if (intensity < 0.6) {
      return '#ffff00'; // Yellow
    } else if (intensity < 0.8) {
      return '#ff8000'; // Orange
    } else {
      return '#ff0000'; // Bright red for high values
    }
  };

  const getValueFromFeature = (feature, period, metric) => {
    const props = feature.properties;

    // Check if this zip code has insurance data
    const hasInsuranceData = props.data_summary?.has_insurance_data;

    if (!hasInsuranceData) {
      return null; // Return null for zip codes without data
    }

    switch (metric) {
      case 'foreclosure_risk_score':
        return props.foreclosure_risk?.foreclosure_risk_score || 0;
      case 'rate_change_percent':
        const periodKey = `${period.replace('_H1', '_H1_to_').replace('_H2', '_H2_to_')}_H1`;
        return props.insurance_data?.rate_changes?.[periodKey]?.rate_change_percent || 0;
      case 'annual_premium':
        return props.insurance_data?.time_series?.[period]?.annual_premium || 0;
      default:
        return 0;
    }
  };

  const getGeoJsonStyle = (feature) => {
    const value = getValueFromFeature(feature, selectedPeriod, selectedMetric);

    // Handle zip codes without insurance data
    if (value === null) {
      return {
        fillColor: '#404040',  // Dark gray for areas without data
        weight: 1,
        opacity: 0.5,
        color: '#666666',
        dashArray: '3,3',      // Dashed border to indicate no data
        fillOpacity: 0.3
      };
    }

    const fillColor = getColorByValue(value, selectedMetric);

    return {
      fillColor: fillColor,
      weight: 3,
      opacity: 1,
      color: '#ffffff',
      dashArray: '',
      fillOpacity: 0.8
    };
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties;
    const zipCode = props.zipcode || props.ZCTA5CE20;
    const riskData = props.foreclosure_risk;
    const insuranceData = props.insurance_data;
    const periodData = insuranceData?.time_series?.[selectedPeriod];

    // Add hover effects
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 4,
          color: '#ffff00',
          dashArray: '',
          fillOpacity: 0.9
        });
        layer.bringToFront();
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(getGeoJsonStyle(feature));
      }
    });

    // Create popup content based on data availability
    const hasInsuranceData = props.data_summary?.has_insurance_data;

    const popupContent = `
      <div class="popup-content">
        <h3>📍 Zip Code ${zipCode}</h3>

        ${hasInsuranceData ? `
          <div class="popup-section">
            <h4>🌪️ Wind-Only Insurance (${selectedPeriod.replace('_', ' ')})</h4>
            ${periodData ? `
              <p><strong>Annual Premium:</strong> $${periodData.annual_premium?.toLocaleString()}</p>
              <p><strong>Change from Previous:</strong> ${periodData.change_from_previous > 0 ? '+' : ''}${periodData.change_from_previous}%</p>
              <p><strong>Market Availability:</strong> ${periodData.market_availability}</p>
              <p><strong>Companies Offering:</strong> ${periodData.companies_offering}</p>
            ` : '<p>No period data available</p>'}
          </div>

          <div class="popup-section">
            <h4>🚨 Foreclosure Risk Analysis</h4>
            <p><strong>Risk Score:</strong> ${riskData?.foreclosure_risk_score || 'N/A'}/100</p>
            <p><strong>Risk Category:</strong> ${riskData?.risk_category?.replace('_', ' ') || 'N/A'}</p>
            <p><strong>6-Month Probability:</strong> ${riskData?.foreclosure_probability_6_months || 'N/A'}%</p>
            <p><strong>12-Month Probability:</strong> ${riskData?.foreclosure_probability_12_months || 'N/A'}%</p>
          </div>

          <div class="popup-section">
            <h4>📊 Risk Factors</h4>
            <p><strong>Risk Level:</strong> ${props.data_summary?.risk_level?.replace('_', ' ') || 'N/A'}</p>
            <p><strong>Base Premium:</strong> $${props.data_summary?.base_premium?.toLocaleString() || 'N/A'}</p>
            <p><strong>Volatility Factor:</strong> ${((props.data_summary?.volatility_factor || 0) * 100).toFixed(0)}%</p>
            <p><strong>Max Rate Increase:</strong> ${riskData?.primary_risk_factors?.max_rate_increase || 'N/A'}%</p>
          </div>

          <div class="popup-section">
            <h4>🏢 Active Companies</h4>
            <ul>
              ${insuranceData?.companies_active?.slice(0, 3).map(company => `<li>${company}</li>`).join('') || '<li>No data available</li>'}
            </ul>
          </div>
        ` : `
          <div class="popup-section">
            <h4>ℹ️ Data Availability</h4>
            <p><strong>Status:</strong> No wind-only insurance data available</p>
            <p><strong>Coverage:</strong> This zip code is not in our current dataset</p>
            <p><strong>Note:</strong> Data is available for 30 high-risk zip codes with confirmed wind-only insurance activity</p>
          </div>

          <div class="popup-section">
            <h4>📍 Location Info</h4>
            <p><strong>Zip Code:</strong> ${zipCode}</p>
            <p><strong>Data Source:</strong> ${props.data_source || 'Unknown'}</p>
            <p><strong>Boundary Type:</strong> Geographic boundary available</p>
          </div>
        `}
      </div>
    `;

    layer.bindPopup(popupContent);
  };





  const getMetricLabel = (metric) => {
    switch (metric) {
      case 'foreclosure_risk_score':
        return 'Foreclosure Risk Score';
      case 'rate_change_percent':
        return 'Rate Change %';
      case 'annual_premium':
        return 'Annual Premium';
      default:
        return metric;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Wind-Only Insurance Foreclosure Risk Map...</p>
      </div>
    );
  }

  if (!geoJsonData) {
    return (
      <div className="error-container">
        <p>Error loading GeoJSON data. Please check the data file.</p>
      </div>
    );
  }

  return (
    <div className="wind-only-map-container">
      <div className="map-header">
        <h1>🌪️ Wind-Only Insurance Foreclosure Risk Map</h1>
        <p>Florida Zip Code Analysis: 2020-2025</p>
      </div>

      <div className="map-controls">
        <div className="control-group">
          <label htmlFor="period-select">Time Period:</label>
          <select
            id="period-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            disabled={isPlaying}
          >
            {timePeriods.map(period => (
              <option key={period} value={period}>
                {period.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="metric-select">Display Metric:</label>
          <select
            id="metric-select"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            <option value="annual_premium">Annual Premium</option>
            <option value="foreclosure_risk_score">Foreclosure Risk Score</option>
            <option value="rate_change_percent">Rate Change %</option>
          </select>
        </div>

        <div className="control-group">
          <label>Animation Controls:</label>
          <div className="animation-controls">
            <button
              className={`play-button ${isPlaying ? 'playing' : ''}`}
              onClick={handlePlayPause}
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
            <button
              className="reset-button"
              onClick={handleReset}
            >
              🔄 Reset
            </button>
          </div>
        </div>

        <div className="control-group">
          <label htmlFor="speed-select">Animation Speed:</label>
          <select
            id="speed-select"
            value={playSpeed}
            onChange={(e) => setPlaySpeed(Number(e.target.value))}
          >
            <option value={2000}>Slow (2s)</option>
            <option value={1000}>Normal (1s)</option>
            <option value={500}>Fast (0.5s)</option>
          </select>
        </div>
      </div>

      <div className="map-legend">
        <div className="legend-header">
          <h3>{getMetricLabel(selectedMetric)}</h3>
          <div className={`period-indicator ${isPlaying ? 'playing' : ''}`}>
            📅 {selectedPeriod.replace('_', ' ')}
            {isPlaying && <span className="playing-indicator">🔴 LIVE</span>}
          </div>
        </div>
        <div className="legend-gradient">
          <span className="legend-low">Low Risk</span>
          <div className="gradient-bar"></div>
          <span className="legend-high">High Risk</span>
        </div>
        <div className="legend-note">
          <span className="legend-gray">⬜ Gray areas: No insurance data available</span>
          <span className="legend-colored">🌈 Colored areas: Wind-only insurance data (30 zip codes)</span>
        </div>
      </div>

      <MapContainer 
        center={floridaCenter} 
        zoom={7} 
        style={{ height: '600px', width: '100%' }}
        className="foreclosure-map"
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Dark Theme">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Light Theme">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <GeoJSON
          data={geoJsonData}
          style={getGeoJsonStyle}
          onEachFeature={onEachFeature}
          key={`${selectedPeriod}-${selectedMetric}`} // Force re-render when period/metric changes
        />
      </MapContainer>

      <div className="map-summary">
        <div className="summary-stats">
          <h3>📊 Summary Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Zip Codes Analyzed:</span>
              <span className="stat-value">{geoJsonData.features.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Time Period:</span>
              <span className="stat-value">2020-2025</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Data Source:</span>
              <span className="stat-value">{geoJsonData.metadata.data_source}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Data Frequency:</span>
              <span className="stat-value">Semi Annual</span>
            </div>
          </div>
        </div>

        <div className="hurricane-events">
          <h3>🌀 Major Hurricane Events</h3>
          <ul>
            <li><strong>2020 H2:</strong> Multiple storms (15% impact)</li>
            <li><strong>2021 H1:</strong> Market adjustment (8% impact)</li>
            <li><strong>2022 H2:</strong> Hurricane Ian (45% impact)</li>
            <li><strong>2023 H1:</strong> Post-Ian adjustment (25% impact)</li>
            <li><strong>2023 H2:</strong> Hurricane Idalia (18% impact)</li>
            <li><strong>2024 H1:</strong> Market stabilization (12% impact)</li>
            <li><strong>2024 H2:</strong> Hurricane season (20% impact)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WindOnlyForeclosureMap;
