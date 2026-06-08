"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ExploreBaliBookSection from '@/components/sections/ExploreBaliBookSection';

export default function DesktopHomepage() {

  const showcaseProperties = [
    {
      name: "Ubud zen river house",
      details: "Villa • 4 guests • 3 beds • 1 bath. Kitchen • WiFi • air conditioning • Hot Tub",
      price: "from Rp 3.000.000 per night",
      image: "/homepage_villa/VillaZen.webp",
      thumb: "/homepage_villa/curated-5-lounge.webp"
    },
    {
      name: "Casaluna Loft I",
      details: "Effortlessly manage your real estate portfolio, reduce vacancies, and create AI-driven advertiser campaigns to reach highly targeted stays...",
      price: "from Rp 1.300.000 per night",
      image: "/homepage_villa/curated-3-corner.webp",
      thumb: "/homepage_villa/curated-3-corner.webp"
    },
    {
      name: "Casaluna Loft III",
      details: "Effortlessly manage your real estate portfolio, reduce vacancies, and create AI-driven advertiser campaigns to reach highly targeted stays...",
      price: "from Rp 2.000.000 per night",
      image: "/homepage_villa/curated-8.webp",
      thumb: "/homepage_villa/curated-8.webp"
    }
  ];

  return (
    <div className="desktop-homepage-container">
      
      {/* SECTION 1: Brand Collection Grid */}
      <section className="desktop-section">
        <div className="desktop-container-shell">
          <div className="desktop-intro-header-row">
            <div>
              <h1 className="text-[70px] text-[#446B4A]">A home, not a hotel</h1>
              
              {/* Navigation arrows block */}
              <div className="desktop-brand-nav-row">
                <div className="desktop-brand-nav-ctrls">
                  <button className="desktop-nav-arrow" aria-label="Previous">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="desktop-nav-arrow desktop-nav-arrow-active" aria-label="Home">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                  </button>
                  <button className="desktop-nav-arrow" aria-label="Next">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <p className="desktop-brand-copy">
            We curate private villas and design-led apartments that keep only what matters. Comfort, Simplicity, and Ease. Spaces that let you settle in, slow down, and experience Bali in a way that feels natural and personal.
            </p>
          </div>

          <div className="desktop-grid-3col">
            {/* Card 1: River Villas */}
            <motion.div whileHover={{ y: -4 }} className="desktop-villa-card">
              <div className="desktop-villa-card-header-tag">
                <span>River Villas</span>
                <span className="badge-num">2345+</span>
              </div>
              <div className="desktop-villa-image-wrapper">
                <Image
                  src="/homepage_villa/VillaZen.webp"
                  alt="Ubud zen river house"
                  fill
                  sizes="350px"
                  className="object-cover"
                />
              </div>
              <div className="desktop-villa-title-row">
                <h3 className="desktop-villa-title">Ubud zen river house</h3>
                <div className="desktop-villa-blue-icon">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
              <p className="desktop-villa-metadata">Villa • 4 guests • 3 beds • 1 bath</p>
              <p className="desktop-villa-metadata" style={{ marginTop: '-8px', textTransform: 'none', letterSpacing: 'normal' }}>Kitchen • Wifi • Air conditioning • Hot Tub</p>
              <p className="desktop-villa-price">from <strong>Rp 3.000.000</strong> per night</p>
            </motion.div>

            {/* Card 2: Loft Villas */}
            <motion.div whileHover={{ y: -4 }} className="desktop-villa-card">
              <div className="desktop-villa-card-header-tag">
                <span>Loft Villas</span>
                <span className="badge-num">678+</span>
              </div>
              <div className="desktop-villa-image-wrapper">
                <Image
                  src="/homepage_villa/curated-3-corner.webp"
                  alt="Casaluna Loft I"
                  fill
                  sizes="350px"
                  className="object-cover"
                />
              </div>
              <div className="desktop-villa-title-row">
                <h3 className="desktop-villa-title">Casaluna Loft I</h3>
                <div className="desktop-villa-blue-icon">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
              <p className="desktop-villa-metadata">Villa • 4 guests • 2 beds • 2 bath</p>
              <p className="desktop-villa-metadata" style={{ marginTop: '-8px', textTransform: 'none', letterSpacing: 'normal' }}>Kitchen • Wifi • Air conditioning • Hot Tub</p>
              <p className="desktop-villa-price">from <strong>Rp 1.300.000</strong> per night</p>
            </motion.div>

            {/* Card 3: Luxury Villas */}
            <motion.div whileHover={{ y: -4 }} className="desktop-villa-card">
              <div className="desktop-villa-card-header-tag">
                <span>Luxury Villas</span>
                <span className="badge-num">543+</span>
              </div>
              <div className="desktop-villa-image-wrapper">
                <Image
                  src="/homepage_villa/curated-8.webp"
                  alt="Casaluna Loft III"
                  fill
                  sizes="350px"
                  className="object-cover"
                />
              </div>
              <div className="desktop-villa-title-row">
                <h3 className="desktop-villa-title">Casaluna Loft III</h3>
                <div className="desktop-villa-blue-icon">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
              <p className="desktop-villa-metadata">Villa • 2 guests • 1 beds • 1 bath</p>
              <p className="desktop-villa-metadata" style={{ marginTop: '-8px', textTransform: 'none', letterSpacing: 'normal' }}>Kitchen • Wifi • Air conditioning • Hot Tub</p>
              <p className="desktop-villa-price">from <strong>Rp 2.000.000</strong> per night</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Bawa House Bento Curation */}
      <section className="desktop-section desktop-section-border-y">
        <div className="desktop-container-shell">
          <div className="desktop-bawa-header-row">
            <h2 className="desktop-bawa-title">BAWA HOUSE</h2>
            <div className="desktop-bawa-subtitle-col">
              <div className="desktop-bawa-sub-bar-stack">
              </div>
              <h3 className="desktop-bawa-subtitle">CURATED LUXURY STAYS</h3>
            </div>
          </div>

          <div className="desktop-bawa-grid">
            {/* Left Column: Title and Large Villa Image */}
            <div className="desktop-bawa-left-col">
              <div className="desktop-bawa-title-block">
                <p className="desktop-bawa-villa-name">Bawa House</p>
                <p className="desktop-bawa-villa-loc">Ubud, Gianyar Regency, Bali</p>
              </div>
              <div className="desktop-bawa-large-img-wrapper">
                <Image
                  src="/homepage_villa/curated-6-exterior.webp"
                  alt="Casarosa Villa Exterior"
                  fill
                  sizes="540px"
                  priority
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right Column: 2x2 Bento composition */}
            <div className="desktop-bawa-right-col">
              {/* Row 1, Col 1: Medium image */}
              <div className="desktop-bawa-mid-img">
                <Image
                  src="/homepage_villa/curated-4-view.webp"
                  alt="Casarosa Villa View"
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              </div>

              {/* Row 1, Col 2: Description Text */}
              <div className="desktop-bawa-desc-box">
                <strong style={{ display: 'block', color: '#0b1c30', fontSize: '14px', marginBottom: '8px' }}>Description</strong>
                Villa • 6 guests • 3 beds • 3 bath. Kitchen • Wifi • Washing machine • Air conditioning. Experience the pinnacle of Balinese luxury living.
              </div>

              {/* Row 2, Col 1: Price and Pills details block */}
              <div className="desktop-bawa-details-block">
                <div className="desktop-bawa-price-header">
                  <h4 className="desktop-bawa-price-title">Start from $66.5 Million</h4>
                  <div className="desktop-blue-square-icon-btn">
                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
                <p className="desktop-bawa-explore-desc">
                  Explore Bhirawa Residence, the perfect tool for effortlessly managing your property inv...
                </p>
                <div className="desktop-bawa-pills-row">
                  <span className="desktop-bawa-pill">5 Bedrooms</span>
                  <span className="desktop-bawa-pill">4 Bathrooms</span>
                  <span className="desktop-bawa-pill">2 Kitchen</span>
                </div>
              </div>

              {/* Row 2, Col 2: Small rounded image */}
              <div className="desktop-bawa-small-img-wrapper">
                <Image
                  src="/homepage_villa/curated-7.webp"
                  alt="Casarosa Villa Evening"
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Featured Properties Split Layout */}
      <section className="desktop-section">
        <div className="desktop-container-shell">
          <div className="desktop-featured-header">
            <h2 className="desktop-featured-stacked-title">
              <span>FEATURED</span>
              <span>PROPERTIES</span>
            </h2>
            <p className="desktop-featured-desc">
              curated selection of the world's most exceptional private estates. From Mediterranean sanctuaries to brutalist masterpieces, each property is chosen for its architectural integrity and soul.
            </p>
          </div>

          {/* Quick Category / Filter Row */}
          <div className="desktop-filter-bar">
            <div className="desktop-filter-col desktop-filter-col-border">
              <span className="desktop-filter-lbl">Property type</span>
              <select className="desktop-filter-select" aria-label="Property type">
                <option>Houses / apartments / villa</option>
                <option>Villas</option>
                <option>Lofts</option>
              </select>
            </div>
            
            <div className="desktop-filter-col desktop-filter-col-pad">
              <span className="desktop-filter-lbl">Location</span>
              <input className="desktop-filter-input" aria-label="Location" placeholder="Search city or area" type="text" defaultValue="Search city or area" />
            </div>

            <div className="desktop-filter-col desktop-filter-col-pad-end">
              <span className="desktop-filter-lbl">Price</span>
              <select className="desktop-filter-select" aria-label="Price range">
                <option>Select range budget</option>
                <option>Rp 1M - Rp 3M</option>
                <option>Rp 3M - Rp 10M</option>
              </select>
            </div>

            <button className="desktop-discover-btn">
              Discover
            </button>
          </div>

          {/* Asymmetric grid */}
          <div className="desktop-featured-split">
            {/* Left side: stacked small cards */}
            <div className="desktop-stacked-cards">
              
              {/* Card 1: Ubud zen river house */}
              <div className="desktop-small-row-card-wrapper">
                <span className="desktop-small-card-location">Taman Dayu, Pasuruan</span>
                <div className="desktop-small-row-card">
                  <div className="desktop-small-card-img">
                    <Image
                      src="/homepage_villa/VillaZen.webp"
                      alt="Ubud zen river house"
                      fill
                      sizes="140px"
                      className="object-cover"
                    />
                  </div>
                  <div className="desktop-small-card-body">
                    <div className="desktop-small-card-title-row">
                      <div className="u-flex-col">
                        <h4 className="desktop-small-card-title">Ubud zen river house</h4>
                        <p className="desktop-small-card-price">Rp 3.000.000 / Night</p>
                      </div>
                      <div className="desktop-blue-square-icon-btn">
                        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                    <p className="desktop-small-card-details">
                      Villa • 4 guests • 2 beds • 1 bath. Kitchen • Wifi • Air conditioning • Hot Tub
                    </p>
                    <div className="desktop-small-card-pills">
                      <span className="desktop-small-card-pill">5 Bedrooms</span>
                      <span className="desktop-small-card-pill">4 Bathrooms</span>
                      <span className="desktop-small-card-pill">2 Kitchen</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Casaluna Loft I */}
              <div className="desktop-small-row-card-wrapper">
                <span className="desktop-small-card-location">Canggu Padonan</span>
                <div className="desktop-small-row-card">
                  <div className="desktop-small-card-img">
                    <Image
                      src="/homepage_villa/curated-3-corner.webp"
                      alt="Casaluna Loft I"
                      fill
                      sizes="140px"
                      className="object-cover"
                    />
                  </div>
                  <div className="desktop-small-card-body">
                    <div className="desktop-small-card-title-row">
                      <div className="u-flex-col">
                        <h4 className="desktop-small-card-title">Casaluna Loft I</h4>
                        <p className="desktop-small-card-price">Rp 1.300.000 / Night</p>
                      </div>
                      <div className="desktop-blue-square-icon-btn">
                        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                    <p className="desktop-small-card-details">
                      Villa • 4 guests • 2 beds • 2 bath. Kitchen • Wifi • Air conditioning • Hot Tub
                    </p>
                    <div className="desktop-small-card-pills">
                      <span className="desktop-small-card-pill">3 Bedrooms</span>
                      <span className="desktop-small-card-pill">4 Bathrooms</span>
                      <span className="desktop-small-card-pill">2 Kitchen</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right side: large highlighted premium card */}
            <div className="desktop-premium-card-wrapper">
              <span className="desktop-premium-location">Ubud, Gianyar Regency</span>
              <div className="desktop-premium-card">
                <div className="desktop-premium-img-wrapper">
                  <Image
                    src="/homepage_villa/curated-8.webp"
                    alt="Casaluna Loft III Premium Selection"
                    fill
                    sizes="600px"
                    className="object-cover"
                  />
                </div>
                
                <div className="desktop-premium-content">
                  <div className="desktop-premium-header-row">
                    <div className="desktop-premium-title-group">
                      <h3 className="desktop-premium-title">Casaluna Loft III</h3>
                      <span className="desktop-premium-subtitle">Premium Selection</span>
                    </div>
                    <div className="desktop-blue-square-icon-btn desktop-blue-square-icon-btn-large">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>

                  <p className="desktop-premium-desc">
                    Villa • 2 guests • 1 beds • 1 bath. Kitchen • Wifi • Air conditioning • Hot Tub. A masterpiece of modern design and comfort.
                  </p>

                  <div className="desktop-premium-pills-row">
                    <span className="desktop-premium-pill">5 Bedrooms</span>
                    <span className="desktop-premium-pill">4 Bathrooms</span>
                    <span className="desktop-premium-pill">2 Kitchen</span>
                    <span className="desktop-premium-pill">2 Garden</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: Desktop 3D Bali Collection Flip Book */}
      <ExploreBaliBookSection />

    </div>
  );
}
