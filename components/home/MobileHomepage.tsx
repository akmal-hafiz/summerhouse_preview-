"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function MobileHomepage() {
  const [activePropertyIndex, setActivePropertyIndex] = useState(0);

  const showcaseProperties = [
    {
      name: "Ubud zen river house",
      details: "Villa • 4 guests • 3 beds • 1 bath. Kitchen • WiFi • air conditioning • Hot Tub",
      price: "from Rp 2.000.000 per night",
      image: "/homepage_villa/VillaZen.webp",
    },
    {
      name: "Casaluna Loft I",
      details: "Effectively manage your real estate portfolio, reduce vacancies, and create AI-driven advertiser campaigns to reach highly targeted stays...",
      price: "from Rp 1.300.000 per night",
      image: "/homepage_villa/curated-3-corner.webp",
    },
    {
      name: "Casaluna Loft III",
      details: "Effectively manage your real estate portfolio, reduce vacancies, and create AI-driven advertiser campaigns to reach highly targeted stays...",
      price: "from Rp 2.000.000 per night",
      image: "/homepage_villa/curated-8.webp",
    }
  ];

  return (
    <div className="mobile-homepage-container">
      
      {/* SECTION 1: Brand Collection Category Cards Row (Horizontal Scroll) */}
      <section className="mobile-section">
        <div className="mobile-brand-header-col">
          <h1 className="mobile-brand-title">SUMMERHOUSES</h1>
          <p className="mobile-brand-copy">
            SummerHouses is a property discovery platform focused on thoughtfully curated houses, apartments, and villas across Indonesia. Space that invites you to rethink, slow down, and experience life in a way that feels natural and personal.
          </p>
        </div>

        <div className="mobile-category-row">
          {/* Card 1: River Villas */}
          <motion.div whileTap={{ scale: 0.98 }} className="mobile-category-card">
            <div className="mobile-category-header-tag">
              <span>River Villas</span>
              <span className="badge-num">2345+</span>
            </div>
            <div className="mobile-category-image-wrapper">
              <Image
                src="/homepage_villa/VillaZen.webp"
                alt="Ubud zen river house"
                fill
                sizes="260px"
                className="object-cover"
              />
            </div>
            <div className="mobile-category-title-row">
              <h3 className="mobile-category-title">Ubud zen river house</h3>
              <div className="mobile-blue-square-icon-btn">
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
            <p className="mobile-category-metadata">Villa • 4 guests • 3 beds • 1 bath</p>
            <p className="mobile-category-price">from <strong>Rp 3.000.000</strong> per night</p>
          </motion.div>

          {/* Card 2: Loft Villas */}
          <motion.div whileTap={{ scale: 0.98 }} className="mobile-category-card">
            <div className="mobile-category-header-tag">
              <span>Loft Villas</span>
              <span className="badge-num">6789+</span>
            </div>
            <div className="mobile-category-image-wrapper">
              <Image
                src="/homepage_villa/curated-3-corner.webp"
                alt="Casaluna Loft I"
                fill
                sizes="260px"
                className="object-cover"
              />
            </div>
            <div className="mobile-category-title-row">
              <h3 className="mobile-category-title">Casaluna Loft I</h3>
              <div className="mobile-blue-square-icon-btn">
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
            <p className="mobile-category-metadata">Villa • 4 guests • 2 beds • 2 bath</p>
            <p className="mobile-category-price">from <strong>Rp 1.300.000</strong> per night</p>
          </motion.div>

          {/* Card 3: Luxury Villas */}
          <motion.div whileTap={{ scale: 0.98 }} className="mobile-category-card">
            <div className="mobile-category-header-tag">
              <span>Luxury Villas</span>
              <span className="badge-num">543+</span>
            </div>
            <div className="mobile-category-image-wrapper">
              <Image
                src="/homepage_villa/curated-8.webp"
                alt="Casaluna Loft III"
                fill
                sizes="260px"
                className="object-cover"
              />
            </div>
            <div className="mobile-category-title-row">
              <h3 className="mobile-category-title">Casaluna Loft III</h3>
              <div className="mobile-blue-square-icon-btn">
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
            <p className="mobile-category-metadata">Villa • 2 guests • 1 beds • 1 bath</p>
            <p className="mobile-category-price">from <strong>Rp 2.000.000</strong> per night</p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: Bawa House Curation Spotlight Section */}
      <section className="mobile-section mobile-section-border-y">
        <div className="mobile-bawa-header-row">
          <h2 className="mobile-bawa-title">BAWA HOUSE</h2>
          <div className="mobile-bawa-subtitle-col">
            <div className="mobile-bawa-sub-bar-stack">
              <span className="mobile-bawa-sub-bar">// BEST DEALS FEATURED PROPERTIES</span>
              <span className="mobile-bawa-sub-bar">SPOTLIGHT TYPE A CLUSTER</span>
            </div>
            <h3 className="mobile-bawa-subtitle">CURATED LUXURY STAYS</h3>
          </div>
        </div>

        <div className="mobile-bawa-layout">
          {/* Title and Location info */}
          <div className="mobile-bawa-title-block">
            <p className="mobile-bawa-villa-name">Casarosa Villa</p>
            <p className="mobile-bawa-villa-loc">Ubud, Gianyar Regency, Bali</p>
          </div>

          {/* Large main image */}
          <div className="mobile-bawa-large-img-wrapper">
            <Image
              src="/homepage_villa/curated-6-exterior.webp"
              alt="Casarosa Villa Exterior"
              fill
              sizes="320px"
              priority
              className="object-cover"
            />
          </div>

          {/* Medium supporting image */}
          <div className="mobile-bawa-mid-img">
            <Image
              src="/homepage_villa/curated-4-view.webp"
              alt="Casarosa Villa View"
              fill
              sizes="320px"
              className="object-cover"
            />
          </div>

          {/* Description text */}
          <div className="mobile-bawa-desc-box">
            <strong style={{ display: 'block', color: '#0b1c30', fontSize: '13px', marginBottom: '6px' }}>Description</strong>
            Villa • 6 guests • 3 beds • 3 bath. Kitchen • Wifi • Washing machine • Air conditioning. Experience the pinnacle of Balinese luxury living.
          </div>

          {/* Details / price block */}
          <div className="mobile-bawa-details-block">
            <div className="mobile-bawa-price-header">
              <h4 className="mobile-bawa-price-title">Start from $66.5 Million</h4>
              <div className="mobile-blue-square-icon-btn">
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
            <p className="mobile-bawa-explore-desc">
              Explore Bhirawa Residence, the perfect tool for effortlessly managing your property Inv...
            </p>
            <div className="mobile-bawa-pills-row">
              <span className="mobile-bawa-pill">5 Bedrooms</span>
              <span className="mobile-bawa-pill">4 Bathrooms</span>
              <span className="mobile-bawa-pill">2 Kitchen</span>
            </div>
          </div>

          {/* Evening secondary supporting image */}
          <div className="mobile-bawa-small-img-wrapper">
            <Image
              src="/homepage_villa/curated-7.webp"
              alt="Casarosa Villa Evening"
              fill
              sizes="320px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: Featured Properties & Filters Section */}
      <section className="mobile-section">
        <div className="mobile-featured-header">
          <h2 className="mobile-featured-stacked-title">
            <span>FEATURED</span>
            <span>PROPERTIES</span>
          </h2>
          <p className="mobile-featured-desc">
            SummerHouses is a property discovery platform focused on thoughtfully curated houses, apartments, and villas across Indonesia.
          </p>
        </div>

        {/* Filter bar */}
        <div className="mobile-filter-bar">
          <div className="mobile-filter-col">
            <span className="mobile-filter-lbl">Property type</span>
            <select className="mobile-filter-select" aria-label="Property type">
              <option>Houses / apartments / villa</option>
              <option>Villas</option>
              <option>Lofts</option>
            </select>
          </div>
          
          <div className="mobile-filter-col">
            <span className="mobile-filter-lbl">Location</span>
            <input className="mobile-filter-input" aria-label="Location" placeholder="Search city or area" type="text" defaultValue="Search city or area" />
          </div>

          <div className="mobile-filter-col">
            <span className="mobile-filter-lbl">Price</span>
            <select className="mobile-filter-select" aria-label="Price range">
              <option>Select range budget</option>
              <option>Rp 1M - Rp 3M</option>
              <option>Rp 3M - Rp 10M</option>
            </select>
          </div>

          <button className="mobile-discover-btn">
            Discover
          </button>
        </div>

        {/* Properties layout list */}
        <div className="mobile-featured-layout">
          
          {/* Highlighted featured item FIRST for maximum mobile hierarchy */}
          <div className="mobile-premium-card-wrapper">
            <span className="mobile-premium-location">Ubud, Gianyar Regency</span>
            <div className="mobile-premium-card">
              <div className="mobile-premium-img-wrapper">
                <Image
                  src="/homepage_villa/curated-8.webp"
                  alt="Casaluna Loft III Premium Selection"
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              </div>
              
              <div className="mobile-premium-content">
                <div className="mobile-premium-header-row">
                  <div className="mobile-premium-title-group">
                    <h3 className="mobile-premium-title">Casaluna Loft III</h3>
                    <span className="mobile-premium-subtitle">Premium Selection</span>
                  </div>
                  <div className="mobile-blue-square-icon-btn mobile-blue-square-icon-btn-large">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>

                <p className="mobile-premium-desc">
                  Villa • 2 guests • 1 beds • 1 bath. Kitchen • Wifi • Air conditioning • Hot Tub. A masterpiece of modern design and comfort.
                </p>

                <div className="mobile-premium-pills-row">
                  <span className="mobile-premium-pill">5 Bedrooms</span>
                  <span className="mobile-premium-pill">4 Bathrooms</span>
                  <span className="mobile-premium-pill">2 Kitchen</span>
                  <span className="mobile-premium-pill">2 Garden</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compact stacked items */}
          <div className="mobile-stacked-cards">
            
            {/* Card 1: Ubud zen river house */}
            <div className="mobile-small-row-card-wrapper">
              <span className="mobile-small-card-location">Taman Dayu, Pasuruan</span>
              <div className="mobile-small-row-card">
                <div className="mobile-small-card-img">
                  <Image
                    src="/homepage_villa/VillaZen.webp"
                    alt="Ubud zen river house"
                    fill
                    sizes="90px"
                    className="object-cover"
                  />
                </div>
                <div className="mobile-small-card-body">
                  <div className="mobile-small-card-title-row">
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                      <h4 className="mobile-small-card-title">Ubud zen river house</h4>
                      <p className="mobile-small-card-price">Rp 3.000.000 / Night</p>
                    </div>
                    <div className="mobile-blue-square-icon-btn">
                      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                  <p className="mobile-small-card-details">
                    Villa • 4 guests • 3 beds • 1 bath. Kitchen • Wifi • Air conditioning • Hot Tub
                  </p>
                  <div className="mobile-small-card-pills">
                    <span className="mobile-small-card-pill">5 Bedrooms</span>
                    <span className="mobile-small-card-pill">4 Bathrooms</span>
                    <span className="mobile-small-card-pill">2 Kitchen</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Casaluna Loft I */}
            <div className="mobile-small-row-card-wrapper">
              <span className="mobile-small-card-location">Canggu Padonan</span>
              <div className="mobile-small-row-card">
                <div className="mobile-small-card-img">
                  <Image
                    src="/homepage_villa/curated-3-corner.webp"
                    alt="Casaluna Loft I"
                    fill
                    sizes="90px"
                    className="object-cover"
                  />
                </div>
                <div className="mobile-small-card-body">
                  <div className="mobile-small-card-title-row">
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                      <h4 className="mobile-small-card-title">Casaluna Loft I</h4>
                      <p className="mobile-small-card-price">Rp 1.300.000 / Night</p>
                    </div>
                    <div className="mobile-blue-square-icon-btn">
                      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                  <p className="mobile-small-card-details">
                    Villa • 4 guests • 2 beds • 2 bath. Kitchen • Wifi • Air conditioning • Hot Tub
                  </p>
                  <div className="mobile-small-card-pills">
                    <span className="mobile-small-card-pill">5 Bedrooms</span>
                    <span className="mobile-small-card-pill">4 Bathrooms</span>
                    <span className="mobile-small-card-pill">2 Kitchen</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 4: Split Panel Interactive Showcase adaptation */}
      <section className="mobile-section mobile-section-border-y" style={{ paddingBottom: '96px' }}>
        <div className="mobile-split-showcase-layout">
          
          {/* Main Visual Image Card with Text */}
          <div className="mobile-showcase-left">
            <Image
              src="/homepage_villa/curated-1-main.webp"
              alt="Bawa House Feature Large"
              fill
              sizes="320px"
              className="object-cover"
            />
            <div className="mobile-showcase-left-overlay"></div>
            
            <div className="mobile-showcase-left-content">
              <h3 className="mobile-showcase-left-title">BAWA HOUSE</h3>
              <p className="mobile-showcase-left-price">RP 10 million / Night</p>
            </div>
          </div>

          {/* Interactive selection stack */}
          <div className="mobile-showcase-right">
            {showcaseProperties.map((item, idx) => {
              const isActive = activePropertyIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="mobile-showcase-item"
                  onClick={() => setActivePropertyIndex(idx)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, paddingRight: '12px' }}>
                    <h4 className="mobile-showcase-item-title">{item.name}</h4>
                    <p className="mobile-showcase-item-desc">
                      {isActive 
                        ? item.details 
                        : item.details.slice(0, 60) + "..."}
                    </p>
                    {isActive && (
                      <p className="mobile-showcase-item-price">{item.price}</p>
                    )}
                  </div>
                  
                  {/* Indicator */}
                  <div className="mobile-showcase-active-indicator" style={{ opacity: isActive ? 1 : 0.2 }}>
                    {isActive && <div className="mobile-showcase-active-indicator-dot" />}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
}
