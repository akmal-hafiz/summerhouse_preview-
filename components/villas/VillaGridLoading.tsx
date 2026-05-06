import React from 'react';
import styles from './RefinedVillaGrid.module.css';
import VillaCardSkeleton from './VillaCardSkeleton';

const VillaGridLoading = () => {
  return (
    <div className={styles.gridContainer}>
      {[...Array(6)].map((_, i) => (
        <VillaCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default VillaGridLoading;
