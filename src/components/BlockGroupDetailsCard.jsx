import React from 'react';

const BlockGroupDetailsCard = ({ block, onClose, coords }) => {
  // Drag state
  const cardRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [cardPos, setCardPos] = React.useState(null);

  // Mouse event handlers for drag
  const handleDragStart = React.useCallback((e) => {
    setDragging(true);
    const rect = cardRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);
  const handleDrag = React.useCallback((e) => {
    if (!dragging) return;
    setCardPos({
      left: e.clientX - dragOffset.x,
      top: e.clientY - dragOffset.y
    });
  }, [dragging, dragOffset]);
  const handleDragEnd = React.useCallback(() => {
    setDragging(false);
  }, []);

  React.useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [dragging, handleDrag, handleDragEnd]);
  if (!block) return null;
  const { GEOID, NAMELSAD, population_65_plus, ALAND, AWATER, INTPTLAT, INTPTLON, NAME } = block.properties;

  // Format numbers for readability
  const formatNum = n => n ? n.toLocaleString() : '-';

  let cardStyle = {
    position: 'fixed',
    background: 'rgba(24,24,27,0.98)',
    color: '#e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.75)',
    padding: '18px 18px 12px 18px',
    minWidth: '220px',
    maxWidth: '70vw',
    zIndex: 1000,
    border: '1px solid #23232b',
    left: cardPos ? `${cardPos.left}px` : '50%',
    top: cardPos ? `${cardPos.top}px` : '50%',
    transform: cardPos ? 'none' : 'translate(-50%, -50%) scale(0.96)',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    opacity: 0,
    animation: 'fadeInCard 0.5s cubic-bezier(.4,0,.2,1) forwards',
    cursor: dragging ? 'grabbing' : 'default',
  };
  if (!cardPos && coords && typeof window !== 'undefined') {
    cardStyle = {
      ...cardStyle,
      left: `calc(${coords.lon}px)`,
      top: `calc(${coords.lat}px)`
    };
  }

  // Add keyframes for fade-in animation
  const styleSheet = typeof document !== 'undefined' ? document.styleSheets[0] : null;
  if (styleSheet && !Array.from(styleSheet.cssRules).find(r => r.name === 'fadeInCard')) {
    styleSheet.insertRule(`@keyframes fadeInCard { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.96); } 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); } }`, styleSheet.cssRules.length);
  }

  return (
    <div ref={cardRef} style={cardStyle}>
      {/* Drag handle */}
      <div
        style={{
          width: '100%',
          height: 18,
          cursor: dragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 2,
          userSelect: 'none',
        }}
        onMouseDown={handleDragStart}
        title="Drag to move card"
      >
        <div style={{
          width: 36,
          height: 4,
          borderRadius: 2,
          background: dragging ? '#64748b' : '#23232b',
          opacity: 0.7,
          marginTop: 2,
        }} />
      </div>
      {/* Top bar with title and close button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 18, color: '#fff', letterSpacing: 0.2 }}>
          {NAME ? NAME : NAMELSAD ? NAMELSAD : GEOID ? `Block Group ${GEOID}` : 'Block Group Details'}
        </span>
        <button onClick={onClose} style={{
          background: 'none',
          color: '#a1a1aa',
          border: 'none',
          fontSize: 22,
          cursor: 'pointer',
          fontWeight: 600,
          marginLeft: 8,
          transition: 'color 0.2s',
          padding: 0,
        }} title="Close"
          onMouseOver={e => e.currentTarget.style.color = '#f87171'}
          onMouseOut={e => e.currentTarget.style.color = '#a1a1aa'}
        >×</button>
      </div>
      <div style={{ borderBottom: '1px solid #23232b', marginBottom: 16, opacity: 0.7 }} />

      {/* Main details grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 8 }}>
        <div style={{ fontWeight: 500, color: '#a1a1aa', fontSize: 14 }}>Name</div>
        <div style={{ fontWeight: 500, color: '#e2e8f0', fontSize: 14 }}>{NAMELSAD}</div>
        <div style={{ fontWeight: 500, color: '#a1a1aa', fontSize: 14 }}>GEOID</div>
        <div style={{ fontWeight: 500, color: '#e2e8f0', fontSize: 14 }}>{GEOID}</div>
        <div style={{ fontWeight: 500, color: '#a1a1aa', fontSize: 14 }}>Population 65+</div>
        <div style={{ fontWeight: 600, color: '#fbbf24', fontSize: 15 }}>{formatNum(population_65_plus)}</div>
        <div style={{ fontWeight: 500, color: '#a1a1aa', fontSize: 14 }}>Land Area</div>
        <div style={{ fontWeight: 600, color: '#10b981', fontSize: 15 }}>{formatNum(ALAND)} m²</div>
        <div style={{ fontWeight: 500, color: '#a1a1aa', fontSize: 14 }}>Water Area</div>
        <div style={{ fontWeight: 600, color: '#0ea5e9', fontSize: 15 }}>{formatNum(AWATER)} m²</div>
      </div>
      <div style={{ borderBottom: '1px solid #23232b', marginBottom: 8, opacity: 0.5 }} />
      {/* Center coordinates */}
      <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 2 }}>
        <span style={{ fontWeight: 500, color: '#64748b' }}>Center:</span> {INTPTLAT}, {INTPTLON}
      </div>
    </div>
  );
};

export default BlockGroupDetailsCard;
