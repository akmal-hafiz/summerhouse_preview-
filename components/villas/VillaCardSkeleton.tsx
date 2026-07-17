import React from 'react';
import styles from './RefinedVillaCard.module.css';

const VillaCardSkeleton = () => {
  return (
    <div className={styles.cardSkeleton}>
      <div className={`${styles.imageSkeleton} skeleton`}></div>
      <div className={styles.info}>
        <div className={styles.locationHeaderSkeleton}>
          <div className={`${styles.labelSkeleton} skeleton`}></div>
          <div className={styles.divider}></div>
        </div>
        <div className={`${styles.titleSkeleton} skeleton`}></div>
        <div className={styles.metaSkeleton}>
          <div className={`${styles.metaItemSkeleton} skeleton`}></div>
          <div className={`${styles.metaItemSkeleton} skeleton`}></div>
        </div>
      </div>
    </div>
  );
};

export default VillaCardSkeleton;
