import React, { useState, useRef, useEffect } from 'react';

const ScenePopupCard = ({ card, screenPosition, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPinned, setIsPinned] = useState(false); // Track if card has been manually positioned
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDataRows, setShowDataRows] = useState(false);
  const [isDataExpanded, setIsDataExpanded] = useState(false);
  const [showPinkBall, setShowPinkBall] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef(null);

  // Initialize position based on screen position (only if not pinned)
  useEffect(() => {
    if (screenPosition && !isPinned) {
      setPosition({
        x: screenPosition.x - 112, // 20% smaller centering (was 140)
        y: screenPosition.y - 48   // 20% smaller centering (was 60)
      });
    }
  }, [screenPosition, isPinned]);

  // Cleanup effect to remove any lingering event listeners
  useEffect(() => {
    return () => {
      // Clean up any remaining event listeners when component unmounts
      const cleanupMouseMove = () => {};
      const cleanupMouseUp = () => {};
      document.removeEventListener('mousemove', cleanupMouseMove);
      document.removeEventListener('mouseup', cleanupMouseUp);
    };
  }, []);

  // Text animation system
  useEffect(() => {
    if (!card.content.description) return;
    
    console.log('Starting animation for card:', card.id);
    console.log('Description:', card.content.description);
    
    // Reset animation state
    setIsTyping(true);
    setDisplayedText('');
    setShowDataRows(false);
    
    const text = card.content.description;
    let index = 0;
    let timeoutId = null;
    
    const typeNextChar = () => {
      if (index < text.length) {
        setDisplayedText(prev => {
          const newText = prev + text[index];
          console.log(`Char ${index}: "${text[index]}" -> "${newText}"`);
          return newText;
        });
        index++;
        timeoutId = setTimeout(typeNextChar, 10);
      } else {
        console.log('Animation complete');
        setIsTyping(false);
        // Trigger pink ball appearance after 1-second delay
        setTimeout(() => {
          console.log('🎯 Setting showPinkBall to true for card:', card.id);
          setShowPinkBall(true);
        }, 1000);
        // Note: Data is now hidden by default, user must click pink ball to expand
      }
    };
    
    // Start the animation
    typeNextChar();
    
    // Cleanup function to prevent multiple animations
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [card.id]); // Use card.id instead of description to prevent re-runs

  // CSS keyframes injection for animations
  useEffect(() => {
    const keyframes = `
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      @keyframes dataRowsSlideIn {
        0% { transform: translateY(-10px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      @keyframes dataRowFadeIn {
        0% { opacity: 0; transform: translateX(-5px); }
        100% { opacity: 1; transform: translateX(0); }
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  if (!card || !screenPosition) return null;

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };

    const handleMouseMove = (e) => {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsPinned(true); // Mark card as pinned after dragging
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    // Add global mouse event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const finalPosition = {
    x: position.x,
    y: position.y
  };

  return (
    <div 
      ref={dragRef}
      style={{
        position: 'absolute',
        left: finalPosition.x,
        top: finalPosition.y,
        background: '#000000',
        border: '1px solid #333333',
        borderRadius: '6px',
        minWidth: '224px',  // 20% smaller (was 280px)
        maxWidth: '256px',  // 20% smaller (was 320px)
        boxShadow: '0 4px 16px rgba(0,0,0,0.8)',
        zIndex: 1000 + (card.style?.priority || 0),
        color: '#ffffff',
        fontSize: '11px',    // 20% smaller (was 13px)
        fontFamily: 'system-ui, -apple-system, sans-serif',
        animation: 'popupFadeIn 0.3s ease-out',
        pointerEvents: 'auto',
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* Drag Handle */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '8px',
          borderBottom: '1px solid #333333',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          backgroundColor: isDragging ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          transition: 'background-color 0.2s'
        }}
        onMouseDown={handleMouseDown}
      >
                  {/* Drag handle dots */}
          <div style={{ display: 'flex', gap: '2px' }}>
            <div style={{ width: '4px', height: '4px', backgroundColor: '#999999', borderRadius: '50%' }}></div>
            <div style={{ width: '4px', height: '4px', backgroundColor: '#999999', borderRadius: '50%' }}></div>
            <div style={{ width: '4px', height: '4px', backgroundColor: '#999999', borderRadius: '50%' }}></div>
            <div style={{ width: '4px', height: '4px', backgroundColor: '#999999', borderRadius: '50%' }}></div>
            <div style={{ width: '4px', height: '4px', backgroundColor: '#999999', borderRadius: '50%' }}></div>
          </div>
      </div>



      {/* Content */}
      <div style={{ padding: '10px 12px', lineHeight: '1.4', position: 'relative' }}>  {/* 20% smaller padding */}
        {/* Close Button */}
        <button
          onClick={() => onClose(card.id)}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'none',
            border: 'none',
            color: '#999999',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '2px',
            transition: 'color 0.2s',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#999999';
          }}
        >
          ×
        </button>
        
        {/* Animated Text Description */}
        {card.content.description && (
          <div 
            onClick={(e) => {
              if (card.nextSceneId) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 Text clicked - triggering DOM intervention for nextSceneId:', card.nextSceneId);
                
                // DOM intervention: Find and click the corresponding saved scene in AI Storm Navigator
                const sceneItems = document.querySelectorAll('li');
                
                // Look for the scene that contains our target scene ID
                for (const item of sceneItems) {
                  const itemText = item.textContent || '';
                  // Check if this list item corresponds to our target scene
                  // Match by new scene names
                  if ((itemText.includes('CAPE CORAL') || itemText.includes('Scene 2')) && card.nextSceneId === '1752890011711') {
                    console.log('🎯 Found CAPE CORAL/Scene 2, clicking it');
                    item.click();
                    return;
                  } else if ((itemText.includes('COSTAL IMPACT') || itemText.includes('Scene 3')) && card.nextSceneId === '1752890044121') {
                    console.log('🎯 Found COSTAL IMPACT/Scene 3, clicking it');
                    item.click();
                    return;
                  } else if ((itemText.includes('STORM ANALYSIS') || itemText.includes('Scene 4')) && card.nextSceneId === '1752890582825') {
                    console.log('🎯 Found STORM ANALYSIS/Scene 4, clicking it');
                    item.click();
                    return;
                  } else if ((itemText.includes('FLOOD SCORE') || itemText.includes('Scene 5')) && card.nextSceneId === '1752891127158') {
                    console.log('🎯 Found FLOOD SCORE/Scene 5, clicking it');
                    item.click();
                    return;
                  } else if ((itemText.includes('OVERVIEW') || itemText.includes('Scene 1')) && card.nextSceneId === '1752889907158') {
                    console.log('🎯 Found OVERVIEW/Scene 1, clicking it');
                    item.click();
                    return;
                  }
                }
                console.warn('🎯 Could not find scene to click for ID:', card.nextSceneId);
              }
            }}
            style={{
              marginBottom: '12px',
              fontFamily: 'monospace',
              fontSize: '11px',
              lineHeight: '1.5',
              color: '#ffffff',
              whiteSpace: 'pre-wrap', // Preserve line breaks
              cursor: card.nextSceneId ? 'pointer' : 'default',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => {
              if (card.nextSceneId) {
                e.target.style.opacity = '0.8';
              }
            }}
            onMouseLeave={(e) => {
              if (card.nextSceneId) {
                e.target.style.opacity = '1';
              }
            }}
            title={card.nextSceneId ? 'Click to navigate to next scene' : ''}
          >
            {displayedText.split('**').map((part, index) => (
              <span key={index} style={{
                fontWeight: index % 2 === 1 ? 'bold' : 'normal',
                color: index % 2 === 1 ? '#ec4899' : '#ffffff'
              }}>
                {part}
              </span>
            ))}
            {isTyping && <span style={{ animation: 'blink 1s infinite' }}>|</span>}
          </div>
        )}



        {/* Data Rows (Toggleable) */}
        {isDataExpanded && Object.keys(card.content.data || {}).length > 0 && (
          <div style={{
            animation: 'dataRowsSlideIn 0.5s ease-out',
            borderTop: '1px solid #333333',
            paddingTop: '8px',
            marginTop: '8px'
          }}>
            {Object.entries(card.content.data || {}).map(([key, value], index) => (
              <div key={key} style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '4px',
                padding: '2px 0',
                animation: `dataRowFadeIn 0.3s ease-out ${index * 0.1}s both`
              }}>
                <span style={{ 
                  color: '#cccccc',
                  textTransform: 'capitalize',
                  fontWeight: '400'
                }}>
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                </span>
                <span style={{ 
                  color: '#ffffff',
                  fontWeight: '600',
                  textAlign: 'right'
                }}>
                  {typeof value === 'number' && (key.includes('damage') || key.includes('cost') || key.includes('payout'))
                    ? `$${value.toLocaleString()}` 
                    : value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>



      <style>{`
        @keyframes popupFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pinkBallPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
      
      {/* Pink Ball Animation */}
      {showPinkBall && Object.keys(card.content.data || {}).length > 0 && (
        <>
          {console.log('🎯 Rendering pink ball for card:', card.id, 'showPinkBall:', showPinkBall, 'data keys:', Object.keys(card.content.data || {}).length)}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '100%',
            transform: 'translateX(-50%)',
            marginTop: '8px',
            zIndex: 1000 + (card.style?.priority || 0) - 1
          }}>
            <button
              onClick={() => {
                console.log('🎯 Pink ball clicked! Setting isDataExpanded to:', !isDataExpanded);
                setIsDataExpanded(!isDataExpanded);
              }}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#ec4899',
                border: 'none',
                cursor: 'pointer',
                animation: 'pinkBallPulse 2s ease-in-out infinite',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(236, 72, 153, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.2)';
                e.target.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 8px rgba(236, 72, 153, 0.4)';
              }}
              title={isDataExpanded ? 'Hide details' : 'Show details'}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ScenePopupCard; 