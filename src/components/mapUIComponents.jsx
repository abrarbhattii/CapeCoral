import React from 'react';

// Layer Control Component
const LayerControl = ({ label, isVisible, onClick, hasData, color, complexity }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 6px',
        borderRadius: '3px',
        cursor: 'pointer',
        backgroundColor: isVisible ? 'rgba(59, 130, 246, 0.2)' : 'rgba(75, 85, 99, 0.2)',
        border: `1px solid ${isVisible ? color : 'rgba(75, 85, 99, 0.3)'}`,
        fontSize: '8px',
        transition: 'all 0.2s ease',
        opacity: hasData ? 1 : 0.5
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = isVisible ? 'rgba(59, 130, 246, 0.3)' : 'rgba(75, 85, 99, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = isVisible ? 'rgba(59, 130, 246, 0.2)' : 'rgba(75, 85, 99, 0.2)';
      }}
    >
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '2px',
        backgroundColor: color,
        marginRight: '6px',
        opacity: isVisible ? 1 : 0.5
      }} />
      <span style={{ 
        flex: 1, 
        fontWeight: isVisible ? '600' : '400',
        color: isVisible ? '#e2e8f0' : '#94a3b8'
      }}>
        {label}
      </span>
      {complexity && (
        <span style={{ 
          fontSize: '7px', 
          color: complexity === 'high' ? '#ef4444' : complexity === 'medium' ? '#f59e0b' : '#10b981',
          fontWeight: '600'
        }}>
          {complexity === 'high' ? '⚡' : complexity === 'medium' ? '⚡' : '⚡'}
        </span>
      )}
      {!hasData && (
        <span style={{ 
          fontSize: '7px', 
          color: '#6b7280',
          marginLeft: '4px'
        }}>
          ⏳
        </span>
      )}
    </div>
  );
};

// Population 65+ Color Legend Component
const Population65Legend = ({ isVisible }) => {
  if (!isVisible) return null;
  
  const colorLevels = [
    { label: 'Very Low (0-100) - 1% opacity', color: '#FF0000', opacity: 0.01 },
    { label: 'Low (100-200) - 20% opacity', color: '#FF0000', opacity: 0.1 },
    { label: 'Medium-Low (200-300) - 40% opacity', color: '#FF0000', opacity: 0.4 },
    { label: 'Medium (300-400) - 60% opacity', color: '#FF0000', opacity: 0.6 },
    { label: 'Medium-High (400-500) - 80% opacity', color: '#FF0000', opacity: 0.8 },
    { label: 'High (500+) - 90% opacity', color: '#FF0000', opacity: 0.9 }
  ];

  return (
    <div style={{
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid #444',
      borderRadius: '4px',
      padding: '8px',
      marginTop: '8px',
      fontSize: '11px',
      maxWidth: '200px',
      color: '#fff'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '12px', color: '#fff' }}>
        Population 65+ Legend
      </div>
      {colorLevels.map((level, index) => (
        <div key={index} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '2px',
          fontSize: '10px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: level.color,
            opacity: level.opacity,
            border: '0px solid #666',
            marginRight: '6px',
            borderRadius: '2px'
          }} />
          <span style={{ color: '#fff' }}>{level.label}</span>
        </div>
      ))}
    </div>
  );
};

// Legend Component
export const MapLegend = ({ 
  layerVisibility, 
  toggleLayerVisibility, 
  layerComplexity, 
  renderCapacity, 
  mountedLayers,
  viewState,
  // Data states
  floodZonesData,
  coastalFloodZonesData,


  coastalExtensionFloodZonesData,
  floodMaxData,
  usaceData,
  zipCodeBoundariesData,
  hurricaneMiltonData,
  buildingsData,
  roadsData,
  pathsData,
  redfinPropertiesData,
  commercialPoisData,
  socialPoisData,
  environmentalPoisData,
  blockGroupBoundariesData
}) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      color: '#e2e8f0',
      padding: '12px',
      borderRadius: '6px',
      fontFamily: "'Inter', sans-serif",
      maxWidth: '280px'
    }}>
      <h3 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '600' }}>
        Multi-Peril Analysis
      </h3>
      
      {/* Render Capacity Indicator */}
      <div style={{ 
        marginBottom: '12px', 
        padding: '8px', 
        borderRadius: '4px',
        backgroundColor: renderCapacity.isCritical ? 'rgba(239, 68, 68, 0.2)' : 
                        renderCapacity.isWarning ? 'rgba(245, 158, 11, 0.2)' : 
                        'rgba(34, 197, 94, 0.2)',
        border: `1px solid ${renderCapacity.isCritical ? '#ef4444' : 
                            renderCapacity.isWarning ? '#f59e0b' : 
                            '#22c55e'}`,
        fontSize: '11px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '4px'
        }}>
          <span style={{ fontWeight: '600' }}>Render Capacity:</span>
          <span style={{ 
            color: renderCapacity.isCritical ? '#ef4444' : 
                   renderCapacity.isWarning ? '#f59e0b' : 
                   '#22c55e',
            fontWeight: '600'
          }}>
            {renderCapacity.currentLoad}%
          </span>
        </div>
        <div style={{ 
          width: '100%', 
          height: '4px', 
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${renderCapacity.currentLoad}%`,
            height: '100%',
            backgroundColor: renderCapacity.isCritical ? '#ef4444' : 
                           renderCapacity.isWarning ? '#f59e0b' : 
                           '#22c55e',
            transition: 'width 0.3s ease'
          }} />
        </div>
        {renderCapacity.isCritical && (
          <div style={{ 
            marginTop: '4px', 
            color: '#ef4444', 
            fontSize: '10px',
            fontWeight: '600'
          }}>
            ⚠️ Critical: Consider disabling some layers
          </div>
        )}
        {renderCapacity.isWarning && !renderCapacity.isCritical && (
          <div style={{ 
            marginTop: '4px', 
            color: '#f59e0b', 
            fontSize: '10px',
            fontWeight: '600'
          }}>
            ⚠️ Warning: High load detected
          </div>
        )}
      </div>
      
      {/* Memory Status Indicator */}
      <div style={{ 
        marginBottom: '8px', 
        padding: '4px 8px', 
        backgroundColor: 'rgba(16, 185, 129, 0.1)', 
        borderRadius: '4px',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        fontSize: '9px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>💾 Memory Status:</span>
          <span style={{ fontWeight: '600', color: '#10b981' }}>
            {mountedLayers.size} layers mounted
          </span>
        </div>
        <div style={{ fontSize: '8px', opacity: 0.7, marginTop: '2px' }}>
          Layers are unmounted when turned off to free memory
        </div>
        {/* Smart rendering indicator */}
        {layerVisibility.buildings && buildingsData && viewState.zoom < 10 && (
          <div style={{ 
            fontSize: '8px', 
            color: '#f59e0b', 
            marginTop: '4px',
            fontWeight: '600'
          }}>
            🏗️ Buildings: Very light rendering for overview
          </div>
        )}
        {layerVisibility.buildings && buildingsData && viewState.zoom >= 10 && viewState.zoom < 12 && (
          <div style={{ 
            fontSize: '8px', 
            color: '#f59e0b', 
            marginTop: '4px',
            fontWeight: '600'
          }}>
            🏗️ Buildings: Light detail for medium view
          </div>
        )}
        {layerVisibility.buildings && buildingsData && viewState.zoom >= 12 && viewState.zoom < 14 && (
          <div style={{ 
            fontSize: '8px', 
            color: '#10b981', 
            marginTop: '4px',
            fontWeight: '600'
          }}>
            ⚡ Buildings: Optimized for performance
          </div>
        )}
        {layerVisibility.buildings && buildingsData && viewState.zoom >= 14 && viewState.zoom < 16 && (
          <div style={{ 
            fontSize: '8px', 
            color: '#10b981', 
            marginTop: '4px',
            fontWeight: '600'
          }}>
            🏗️ Buildings: Enhanced 3D detail
          </div>
        )}
        {layerVisibility.buildings && buildingsData && viewState.zoom >= 16 && (
          <div style={{ 
            fontSize: '8px', 
            color: '#3b82f6', 
            marginTop: '4px',
            fontWeight: '600'
          }}>
            🎯 Buildings: Full 3D rendering
          </div>
        )}
      </div>
      
      {/* Interactive Layer Controls */}
      <div style={{ fontSize: '10px', opacity: 0.9 }}>
        <div style={{ marginBottom: '8px', fontWeight: '600' }}>Layer Controls (Click to Toggle):</div>
        
        {/* Flood Zone Layers */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: '#60a5fa' }}>Flood Zones:</div>
          <div style={{ display: 'grid', gap: '2px' }}>
            <LayerControl 
              label="Flood Zones" 
              isVisible={layerVisibility.floodZones} 
              onClick={() => toggleLayerVisibility('floodZones')}
              hasData={floodZonesData}
              color="#3b82f6"
            />
            <LayerControl 
              label="Coastal Flood Zones" 
              isVisible={layerVisibility.coastalFloodZones} 
              onClick={() => toggleLayerVisibility('coastalFloodZones')}
              hasData={coastalFloodZonesData}
              color="#06b6d4"
            />
            
            
            <LayerControl 
              label="Coastal Extension" 
              isVisible={layerVisibility.coastalExtensionFloodZones} 
              onClick={() => toggleLayerVisibility('coastalExtensionFloodZones')}
              hasData={coastalExtensionFloodZonesData}
              color="#155e75"
            />
            <LayerControl 
              label="Flood Max" 
              isVisible={layerVisibility.floodMax} 
              onClick={() => toggleLayerVisibility('floodMax')}
              hasData={floodMaxData}
              color="#164e63"
            />
            <LayerControl 
              label="USACE" 
              isVisible={layerVisibility.usace} 
              onClick={() => toggleLayerVisibility('usace')}
              hasData={usaceData}
              color="#1e40af"
            />
          </div>
        </div>

        {/* Infrastructure Layers */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: '#f59e0b' }}>Infrastructure:</div>
          <div style={{ display: 'grid', gap: '2px' }}>
            <LayerControl 
              label="Zip Code Boundaries" 
              isVisible={layerVisibility.zipCodeBoundaries} 
              onClick={() => toggleLayerVisibility('zipCodeBoundaries')}
              hasData={zipCodeBoundariesData}
              color="#f59e0b"
            />
            <LayerControl 
              label="Hurricane Milton" 
              isVisible={layerVisibility.hurricaneMilton} 
              onClick={() => toggleLayerVisibility('hurricaneMilton')}
              hasData={hurricaneMiltonData}
              color="#dc2626"
            />
            <LayerControl 
              label="3D Buildings" 
              isVisible={layerVisibility.buildings} 
              onClick={() => toggleLayerVisibility('buildings')}
              hasData={buildingsData}
              color="#10b981"
              complexity={layerComplexity.buildings}
            />
            <LayerControl 
              label="Roads" 
              isVisible={layerVisibility.roads} 
              onClick={() => toggleLayerVisibility('roads')}
              hasData={roadsData}
              color="#6b7280"
            />
            <LayerControl 
              label="Paths" 
              isVisible={layerVisibility.paths} 
              onClick={() => toggleLayerVisibility('paths')}
              hasData={pathsData}
              color="#9ca3af"
            />
            <LayerControl 
              label="Block Group Boundaries (Population 65+)" 
              isVisible={layerVisibility.blockGroupBoundaries} 
              onClick={() => toggleLayerVisibility('blockGroupBoundaries')}
              hasData={blockGroupBoundariesData}
              color="#6366f1"
            />
            <Population65Legend isVisible={layerVisibility.blockGroupBoundaries} />
          </div>
        </div>

        {/* Property & POI Layers */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: '#ec4899' }}>Properties & POIs:</div>
          <div style={{ display: 'grid', gap: '2px' }}>
            <LayerControl 
              label="Redfin Properties" 
              isVisible={layerVisibility.redfinProperties} 
              onClick={() => toggleLayerVisibility('redfinProperties')}
              hasData={redfinPropertiesData}
              color="#ec4899"
            />
            <LayerControl 
              label="Commercial POIs" 
              isVisible={layerVisibility.commercialPois} 
              onClick={() => toggleLayerVisibility('commercialPois')}
              hasData={commercialPoisData}
              color="#8b5cf6"
            />
            <LayerControl 
              label="Social POIs" 
              isVisible={layerVisibility.socialPois} 
              onClick={() => toggleLayerVisibility('socialPois')}
              hasData={socialPoisData}
              color="#a855f7"
            />
            <LayerControl 
              label="Environmental POIs" 
              isVisible={layerVisibility.environmentalPois} 
              onClick={() => toggleLayerVisibility('environmentalPois')}
              hasData={environmentalPoisData}
              color="#7c3aed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Popup Component
export const MapPopup = ({ popupInfo, setPopupInfo }) => {
  if (!popupInfo) return null;

  return (
    <div style={{
      position: 'absolute',
      left: `${popupInfo.point.x}px`,
      top: `${popupInfo.point.y}px`,
      transform: 'translate(-50%, -100%)',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      color: '#e2e8f0',
      padding: '16px',
      borderRadius: '8px',
      fontFamily: "'Inter', sans-serif",
      minWidth: '280px',
      maxWidth: '320px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 1000,
      marginTop: '-10px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>
          {popupInfo.floodZone ? (popupInfo.isOptimizedCoastal ? `Optimized Coastal Flood Zone ${popupInfo.floodZone}` : popupInfo.isCoastal ? `Coastal Flood Zone ${popupInfo.floodZone}` : popupInfo.isUltraSimplifiedMega ? `Ultra-Simplified Mega Flood Zone ${popupInfo.floodZone}` : popupInfo.isCoastalExtension ? `Coastal Extension Flood Zone ${popupInfo.floodZone}` : popupInfo.isFloodMax ? `Flood Max Zone ${popupInfo.floodZone}` : popupInfo.isUsace ? `USACE ${popupInfo.regulatoryType}` : `Flood Zone ${popupInfo.floodZone}`) : popupInfo.address}
        </h3>
        <button 
          onClick={() => setPopupInfo(null)}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
        {popupInfo.floodZone ? (
          // Flood zone info
          <>
            <div style={{ marginBottom: '8px' }}>
              <strong>Risk Level:</strong> {popupInfo.riskLevel}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Insurance Required:</strong> {popupInfo.insuranceRequired}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Data Source:</strong> {popupInfo.dataSource}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Area:</strong> {popupInfo.areaSqKm} sq km
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Coordinates:</strong> {popupInfo.lngLat.lng.toFixed(4)}, {popupInfo.lngLat.lat.toFixed(4)}
            </div>
          </>
        ) : popupInfo.isUsace ? (
          // USACE info
          <>
            <div style={{ marginBottom: '8px' }}>
              <strong>Agency:</strong> {popupInfo.agency}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Branch:</strong> {popupInfo.branch}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Permits Section:</strong> {popupInfo.permitsSection}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Description:</strong> {popupInfo.description}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Jurisdiction:</strong> {popupInfo.jurisdiction}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Acquisition Date:</strong> {popupInfo.acquisitionDate}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Coordinates:</strong> {popupInfo.lngLat.lng.toFixed(4)}, {popupInfo.lngLat.lat.toFixed(4)}
            </div>
          </>
        ) : popupInfo.isZipCodeBoundary ? (
          // Zip Code Boundary info
          <>
            <div style={{ marginBottom: '8px' }}>
              <strong>Zip Code:</strong> {popupInfo.zipCode}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Risk Level:</strong> {popupInfo.riskLevel}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Base Annual Premium:</strong> ${popupInfo.baseAnnualPremium?.toLocaleString()}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Foreclosure Risk Score:</strong> {popupInfo.foreclosureRiskScore?.toFixed(1)}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Risk Category:</strong> {popupInfo.foreclosureRiskCategory}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>6-Month Foreclosure Probability:</strong> {popupInfo.foreclosureProbability6Months?.toFixed(2)}%
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>12-Month Foreclosure Probability:</strong> {popupInfo.foreclosureProbability12Months?.toFixed(2)}%
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Insurance Companies:</strong> {popupInfo.companiesCount}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Coordinates:</strong> {popupInfo.lngLat.lng.toFixed(4)}, {popupInfo.lngLat.lat.toFixed(4)}
            </div>
          </>
        ) : popupInfo.isHurricaneMilton ? (
          // Hurricane Milton Damage info
          <>
            <div style={{ marginBottom: '8px' }}>
              <strong>Property ID:</strong> {popupInfo.propertyId}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Zip Code:</strong> {popupInfo.zipCode}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Community:</strong> {popupInfo.community}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Date of Loss:</strong> {new Date(popupInfo.dateOfLoss).toLocaleDateString()}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Total Damage:</strong> ${popupInfo.totalDamage?.toLocaleString()}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Building Damage:</strong> ${popupInfo.buildingDamage?.toLocaleString()}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Contents Damage:</strong> ${popupInfo.contentsDamage?.toLocaleString()}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Total Payout:</strong> ${popupInfo.totalPayout?.toLocaleString()}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Payout Gap:</strong> ${popupInfo.payoutGap?.toLocaleString()}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Days from Landfall:</strong> {popupInfo.daysFromLandfall}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Phase:</strong> {popupInfo.isPreLandfall ? 'Pre-Landfall' : popupInfo.isLandfallDay ? 'Landfall Day' : 'Post-Landfall'}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Coordinates:</strong> {popupInfo.lngLat.lng.toFixed(4)}, {popupInfo.lngLat.lat.toFixed(4)}
            </div>
          </>
        ) : (
          // Property info
          <>
            <div style={{ marginBottom: '8px' }}>
              <strong>Address:</strong> {popupInfo.address}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Zip Code:</strong> {popupInfo.zipCode}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Price:</strong> {popupInfo.price}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Beds:</strong> {popupInfo.beds} | <strong>Baths:</strong> {popupInfo.baths}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Sq Ft:</strong> {popupInfo.sqft}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Risk Level:</strong> {popupInfo.riskLevel}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Coordinates:</strong> {popupInfo.lngLat.lng.toFixed(4)}, {popupInfo.lngLat.lat.toFixed(4)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 