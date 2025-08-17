import React, { useState, useEffect } from 'react';
import ScenePopupCard from './ScenePopupCard';

const ScenePopupManager = ({ mapInstance, activeCards, onCardClose }) => {
  const [cardPositions, setCardPositions] = useState(new Map());

  // Update screen positions when map or cards change
  useEffect(() => {
    if (!mapInstance || !activeCards || activeCards.length === 0) {
      setCardPositions(new Map());
      return;
    }

    const updatePositions = () => {
      const positions = new Map();
      activeCards.forEach(card => {
        if (card.position && card.position.lng !== undefined && card.position.lat !== undefined) {
          try {
            // Convert lat/lng to screen coordinates
            const screenCoords = mapInstance.project([card.position.lng, card.position.lat]);
            positions.set(card.id, {
              x: screenCoords.x,
              y: screenCoords.y
            });
          } catch (error) {
            console.warn(`Error projecting coordinates for card ${card.id}:`, error);
          }
        }
      });
      setCardPositions(positions);
    };

    // Initial position calculation
    updatePositions();

    // Update positions when map moves
    const handleMapMove = () => {
      updatePositions();
    };

    // Listen for map movement events
    mapInstance.on('move', handleMapMove);
    mapInstance.on('zoom', handleMapMove);
    mapInstance.on('rotate', handleMapMove);
    mapInstance.on('pitch', handleMapMove);

    // Cleanup event listeners
    return () => {
      mapInstance.off('move', handleMapMove);
      mapInstance.off('zoom', handleMapMove);
      mapInstance.off('rotate', handleMapMove);
      mapInstance.off('pitch', handleMapMove);
    };
  }, [mapInstance, activeCards]);

  if (!activeCards || activeCards.length === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none', // Allow map interaction through the overlay
      zIndex: 1000
    }}>
      {activeCards.map(card => {
        const screenPosition = cardPositions.get(card.id);
        return (
          <ScenePopupCard
            key={card.id}
            card={card}
            screenPosition={screenPosition}
            onClose={onCardClose}
          />
        );
      })}
    </div>
  );
};

export default ScenePopupManager; 