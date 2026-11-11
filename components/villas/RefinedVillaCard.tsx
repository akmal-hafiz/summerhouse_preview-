"use client";

import React from 'react';
import styles from './RefinedVillaCard.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface RefinedVillaCardProps {
  property: {
    id: number | string;
    name: string;
    description?: string;
    imageUrl: string;
    bedrooms: number | string;
    bathrooms: number | string;
    location: string;
    price?: string | number;
    isFeatured?: boolean;
  };
  index: number;
}

const RefinedVillaCard = ({ property, index }: RefinedVillaCardProps) => {
  const isLarge = index % 5 === 0; 

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={`${styles.card} ${isLarge ? styles.largeCard : ''}`}
    >
      <Link href={`/villas/${property.id}`} className={styles.link}>
        <div className={styles.imageWrapper}>
          <Image 
            src={property.imageUrl || "/homepage_villa/VillaZen.webp"} 
            alt={property.name} 
            fill 
            priority={index < 3}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={styles.image} 
          />
          {property.isFeatured && (
            <div className={styles.featuredBadge}>Featured</div>
          )}
          <div className={styles.overlay}>
            <span className={styles.viewDetails}>Explore Sanctuary</span>
          </div>
        </div>
        
        <div className={styles.info}>
          <div className={styles.locationHeader}>
            <span className={styles.location}>{property.location}</span>
            <div className={styles.divider}></div>
          </div>
          <h3 className={styles.name}>{property.name}</h3>
          <div className={styles.meta}>
            <div className={styles.metaItem}>
               <span className="material-symbols-outlined">bed</span>
               <span>{property.bedrooms} Beds</span>
            </div>
            <div className={styles.metaItem}>
               <span className="material-symbols-outlined">bathtub</span>
               <span>{property.bathrooms} Baths</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RefinedVillaCard;
