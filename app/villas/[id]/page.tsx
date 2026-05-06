import React from 'react';
import { getPropertyById, getPropertyImages, getPropertyRooms } from "@/lib/lodgify";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import styles from "./VillaDetail.module.css";
import Image from "next/image";
import Link from "next/link";

interface VillaDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: VillaDetailPageProps) {
  const { id } = await params;
  const property = await getPropertyById(id);
  return {
    title: `${property?.name || 'Villa'} | Summerhouse Bali`,
    description: property?.description || "Explore this luxury sanctuary in Bali.",
  };
}

export default async function VillaDetailPage({ params }: VillaDetailPageProps) {
  const { id } = await params;
  const [property, images, rooms] = await Promise.all([
    getPropertyById(id),
    getPropertyImages(id),
    getPropertyRooms(id)
  ]);

  if (!property) {
    return (
      <div className={styles.errorContainer}>
        <Navbar />
        <div className={styles.errorContent}>
          <h1>Villa not found</h1>
          <Link href="/villas" className={styles.backButton}>Back to Collection</Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Get first room for specific details
  const mainRoom = rooms && rooms.length > 0 ? rooms[0] : null;

  // Formatting amenities - handle both array and object formats from Lodgify
  let rawAmenities = property.amenities || (mainRoom?.amenities) || [];
  const amenities = Array.isArray(rawAmenities) 
    ? rawAmenities 
    : typeof rawAmenities === 'object' 
      ? Object.values(rawAmenities) 
      : [];
  
  // Gallery Logic: Fallback if /images returns 404
  let displayImages = images || [];
  if (displayImages.length === 0) {
    const roomImages = rooms?.map((r: any) => ({ url: r.image_url, name: r.name }))
      .filter((img: any) => img.url && img.url !== property.image_url);
    
    displayImages = [
      { url: property.image_url, name: property.name },
      ...(roomImages || [])
    ];
  }

  // Ensure we have at least 5 for the mosaic, or fallback to main image
  const mosaicImages = displayImages.length >= 5 
    ? displayImages.slice(0, 5) 
    : [...displayImages, ...Array(5 - displayImages.length).fill({ url: property.image_url })].slice(0, 5);

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className={styles.container}>
        {/* ─── 1. HEADER SECTION ─── */}
        <section className={styles.headerSection}>
          <div className={styles.titleWrapper}>
            <h1 className={styles.title}>{property.name}</h1>
            <div className={styles.headerActions}>
              <button className={styles.actionBtn}>
                <span className="material-symbols-outlined">ios_share</span>
                Share
              </button>
              <button className={styles.actionBtn}>
                <span className="material-symbols-outlined">favorite</span>
                Save
              </button>
            </div>
          </div>
          <div className={styles.metaHeader}>
            <span className={styles.rating}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>star</span>
              New
            </span>
            <span>•</span>
            <span className={styles.reviewsCount}>No reviews yet</span>
            <span>•</span>
            <span className={styles.locationLink}>{property.location?.name || property.city || "Bali"}, Indonesia</span>
          </div>
        </section>

        {/* ─── 2. GALLERY SECTION (Mosaic) ─── */}
        <section className={styles.gallerySection}>
          <div className={styles.mosaicGrid}>
            <div className={`${styles.mosaicItem} ${styles.mainImage}`}>
              <Image 
                src={mosaicImages[0].url} 
                alt={property.name} 
                fill 
                priority 
                className={styles.objectCover}
                unoptimized
              />
            </div>
            {mosaicImages.slice(1, 5).map((img, i) => (
              <div key={i} className={styles.mosaicItem}>
                <Image 
                  src={img.url} 
                  alt={`${property.name} detail ${i + 1}`} 
                  fill 
                  className={styles.objectCover}
                  unoptimized
                />
              </div>
            ))}
          </div>
        </section>

        {/* ─── 3. CONTENT SECTION ─── */}
        <section className={styles.contentSection}>
          <div className={styles.layoutGrid}>
            
            {/* Left Column: Info */}
            <div className={styles.infoColumn}>
              <div className={styles.hostSummary}>
                <div>
                  <h2 className={styles.hostTitle}>Entire villa hosted by Summerhouses</h2>
                  <div className={styles.propertyStats}>
                    {mainRoom?.max_people || property.max_people || 4} guests • {mainRoom?.bedrooms || property.rooms_count || 2} bedrooms • {mainRoom?.bathrooms || property.bathrooms_count || 2} baths
                  </div>
                </div>
                <div className={styles.hostAvatar}>
                  <Image src="/logo.png" alt="Summerhouses" fill className={styles.objectCover} />
                </div>
              </div>

              <div className={styles.sectionDivider} />

              <div className={styles.highlights}>
                <div className={styles.highlightItem}>
                  <span className={`material-symbols-outlined ${styles.highlightIcon}`}>workspace_premium</span>
                  <div className={styles.highlightText}>
                    <h4>Experienced host</h4>
                    <p>Summerhouses has been welcoming guests to Bali for years.</p>
                  </div>
                </div>
                <div className={styles.highlightItem}>
                  <span className={`material-symbols-outlined ${styles.highlightIcon}`}>location_on</span>
                  <div className={styles.highlightText}>
                    <h4>Great location</h4>
                    <p>100% of recent guests gave the location a 5-star rating.</p>
                  </div>
                </div>
                <div className={styles.highlightItem}>
                  <span className={`material-symbols-outlined ${styles.highlightIcon}`}>calendar_today</span>
                  <div className={styles.highlightText}>
                    <h4>Free cancellation</h4>
                    <p>Full refund if cancelled within 48 hours.</p>
                  </div>
                </div>
              </div>

              <div className={styles.sectionDivider} />

              <div className={styles.description}>
                <div 
                  className={styles.descriptionText}
                  dangerouslySetInnerHTML={{ __html: property.description }} 
                />
              </div>

              <div className={styles.sectionDivider} />

              <div className={styles.amenities}>
                <h2 className={styles.subTitle}>What this place offers</h2>
                <div className={styles.amenitiesGrid}>
                  {amenities.slice(0, 10).map((amenity: any, index: number) => (
                    <div key={index} className={styles.amenityItem}>
                      <span className={`material-symbols-outlined ${styles.amenityIcon}`}>
                        {amenity.name?.toLowerCase().includes('wifi') ? 'wifi' : 
                         amenity.name?.toLowerCase().includes('pool') ? 'pool' :
                         amenity.name?.toLowerCase().includes('kitchen') ? 'kitchen' :
                         amenity.name?.toLowerCase().includes('parking') ? 'local_parking' :
                         'check_circle'}
                      </span>
                      <span>{amenity.name || 'Amenity'}</span>
                    </div>
                  ))}
                </div>
                {amenities.length > 10 && (
                  <button className={styles.showAllBtn}>Show all {amenities.length} amenities</button>
                )}
              </div>
            </div>

            {/* Right Column: Sticky Booking */}
            <div className={styles.bookingColumn}>
              <div className={styles.stickyWrapper}>
                <div className={styles.bookingCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.priceDisplay}>
                      $ {property.min_price?.toFixed(0) || "---"} <span>/ night</span>
                    </div>
                    <div className={styles.rating}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>star</span>
                      New
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <div className={styles.dateRow}>
                      <div className={styles.inputBox}>
                        <span className={styles.inputLabel}>Check-in</span>
                        <span className={styles.inputValue}>Add date</span>
                      </div>
                      <div className={styles.inputBox}>
                        <span className={styles.inputLabel}>Checkout</span>
                        <span className={styles.inputValue}>Add date</span>
                      </div>
                    </div>
                    <div className={styles.guestBox}>
                      <div>
                        <span className={styles.inputLabel}>Guests</span>
                        <span className={styles.inputValue}>1 guest</span>
                      </div>
                      <span className="material-symbols-outlined">expand_more</span>
                    </div>
                  </div>

                  <a 
                    href={`https://lodgify.com/v2/direct-booking?propertyId=${property.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <button className={styles.reserveBtn}>Check Availability</button>
                  </a>

                  <p className={styles.bookingNote}>You won't be charged yet</p>

                  <div className={styles.priceBreakdown}>
                    <div className={styles.priceRow}>
                      <span>$ {property.min_price?.toFixed(0) || "0"} x 1 night</span>
                      <span>$ {property.min_price?.toFixed(0) || "0"}</span>
                    </div>
                    <div className={styles.priceRow}>
                      <span>Cleaning fee</span>
                      <span>$ 0</span>
                    </div>
                    <div className={styles.priceRow}>
                      <span>Service fee</span>
                      <span>$ 0</span>
                    </div>
                    <div className={styles.totalRow}>
                      <span>Total before taxes</span>
                      <span>$ {property.min_price?.toFixed(0) || "0"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
