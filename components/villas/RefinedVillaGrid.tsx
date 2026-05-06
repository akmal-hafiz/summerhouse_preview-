"use client";

import React from 'react';
import styles from './RefinedVillaGrid.module.css';
import RefinedVillaCard from './RefinedVillaCard';

interface RefinedVillaGridProps {
  villas: any[];
}

const RefinedVillaGrid = ({ villas }: RefinedVillaGridProps) => {
  return (
    <div className={styles.gridContainer}>
      {villas.map((villa, index) => (
        <RefinedVillaCard 
          key={villa.id} 
          property={villa} 
          index={index} 
        />
      ))}
    </div>
  );
};

export default RefinedVillaGrid;
