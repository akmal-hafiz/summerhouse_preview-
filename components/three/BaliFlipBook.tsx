"use client";

import { Html, useCursor, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { easing } from "maath";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  MathUtils,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector3,
  type Group,
} from "three";

import { baliCollections, type BaliCollectionItem } from "@/data/baliCollections";

const BOOK_TEXTURE_PATH = "/book-slider/textures";
const PAGE_FLIP_AUDIO = "/book-slider/audios/page-flip-01a.mp3";
const FALLBACK_IMAGE = "/homepage_villa/VillaZen.webp";

type BookPageData = {
  id: string;
  front: string;
  back: string;
};

type CollectionImageSet = {
  id: string;
  images: string[];
};

const easingFactor = 0.5;
const easingFactorFold = 0.3;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const pageGeometry = new BoxGeometry(PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH, PAGE_SEGMENTS, 2);
pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndexes: number[] = [];
const skinWeights: number[] = [];

for (let i = 0; i < position.count; i += 1) {
  vertex.fromBufferAttribute(position, i);
  const x = vertex.x;
  const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
  const skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;

  skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
  skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
}

pageGeometry.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndexes, 4));
pageGeometry.setAttribute("skinWeight", new Float32BufferAttribute(skinWeights, 4));

const pageEdgeColor = new Color("#eadcc8");
const pageSideColor = new Color("#312820");
const emissiveColor = new Color("#c69b63");
const basePageMaterials = [
  new MeshStandardMaterial({ color: pageEdgeColor, roughness: 0.92, metalness: 0 }),
  new MeshStandardMaterial({ color: pageSideColor, roughness: 0.9, metalness: 0 }),
  new MeshStandardMaterial({ color: pageEdgeColor, roughness: 0.92, metalness: 0 }),
  new MeshStandardMaterial({ color: pageEdgeColor, roughness: 0.92, metalness: 0 }),
];

function resolveTexturePath(texture: string) {
  if (texture.startsWith("/") || texture.startsWith("data:")) {
    return texture;
  }

  return `${BOOK_TEXTURE_PATH}/${texture}.jpg`;
}

let cachedFontSans = "";
let cachedFontSerif = "";

function getFontSans() {
  if (cachedFontSans) return cachedFontSans;
  if (typeof window !== "undefined") {
    const val = window.getComputedStyle(document.body).getPropertyValue("--font-dm-sans");
    if (val) {
      cachedFontSans = val.trim();
      return cachedFontSans;
    }
  }
  return "Arial, sans-serif";
}

function getFontSerif() {
  if (cachedFontSerif) return cachedFontSerif;
  if (typeof window !== "undefined") {
    const val = window.getComputedStyle(document.body).getPropertyValue("--font-playfair");
    if (val) {
      cachedFontSerif = val.trim();
      return cachedFontSerif;
    }
  }
  return "Georgia, serif";
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  words.forEach((word) => {
    const nextLine = `${line}${word} `;
    if (context.measureText(nextLine).width > maxWidth && line.length > 0) {
      context.fillText(line.trim(), x, currentY);
      line = `${word} `;
      currentY += lineHeight;
    } else {
      line = nextLine;
    }
  });

  context.fillText(line.trim(), x, currentY);
  return currentY;
}

function drawPills(context: CanvasRenderingContext2D, items: string[], x: number, y: number, maxWidth: number) {
  let currentX = x;
  let currentY = y;
  const fontSans = getFontSans();

  items.forEach((item) => {
    context.font = `800 22px ${fontSans}`;
    const width = Math.min(maxWidth, context.measureText(item).width + 46);
    if (currentX + width > x + maxWidth) {
      currentX = x;
      currentY += 62;
    }

    context.fillStyle = "rgba(68, 107, 74, 0.1)";
    roundedRect(context, currentX, currentY, width, 44, 22);
    context.fill();
    context.strokeStyle = "rgba(68, 107, 74, 0.18)";
    context.lineWidth = 1.5;
    context.stroke();
    context.fillStyle = "#446B4A";
    context.font = `800 22px ${fontSans}`;
    context.fillText(item.toUpperCase(), currentX + 22, currentY + 29);
    currentX += width + 12;
  });

  return currentY + 44;
}

function drawSheen(context: CanvasRenderingContext2D, width: number, height: number) {
  const sheen = context.createLinearGradient(0, 0, width, height);
  sheen.addColorStop(0, "rgba(255,255,255,0)");
  sheen.addColorStop(0.42, "rgba(255,255,255,0.08)");
  sheen.addColorStop(0.52, "rgba(255,255,255,0.13)");
  sheen.addColorStop(0.64, "rgba(255,255,255,0.04)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = sheen;
  context.fillRect(0, 0, width, height);
}

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;

  context.save();
  roundedRect(context, x, y, width, height, radius);
  context.clip();
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  context.restore();
}

function loadCanvasImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function mergeCollectionImages(collections: BaliCollectionItem[], remoteCollections: CollectionImageSet[]) {
  const remoteMap = new Map(remoteCollections.map((item) => [item.id, item.images.filter(Boolean)]));

  return collections.map((item) => {
    const remoteImages = remoteMap.get(item.id) || [];
    if (remoteImages.length === 0) return item;

    return {
      ...item,
      image: remoteImages[0] || item.image,
      galleryImages: Array.from(new Set([...remoteImages, ...item.galleryImages])).slice(0, 7),
    };
  });
}

async function fetchCollectionImageSets(): Promise<CollectionImageSet[]> {
  try {
    const response = await fetch("/api/lodgify/collection-images", {
      cache: "no-store",
    });

    if (!response.ok) return [];
    const data = (await response.json()) as { collections?: CollectionImageSet[] };
    return Array.isArray(data.collections) ? data.collections : [];
  } catch {
    return [];
  }
}

async function loadCollectionImages(item: BaliCollectionItem) {
  const sources = [item.image, ...item.galleryImages].filter(Boolean);
  const uniqueSources = Array.from(new Set(sources)).slice(0, 5);
  const images = await Promise.all(uniqueSources.map((src) => loadCanvasImage(src)));
  const validImages = images.filter((image): image is HTMLImageElement => Boolean(image));

  if (validImages.length > 0) {
    return validImages;
  }

  const fallback = await loadCanvasImage(FALLBACK_IMAGE);
  return fallback ? [fallback] : [];
}

function createCoverTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2400;
  canvas.height = 3200;
  const context = canvas.getContext("2d");
  if (!context) {
    return "";
  }
  context.scale(2, 2);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  const W = 1200;
  const H = 1600;

  context.fillStyle = "#FAFAF9";
  context.fillRect(0, 0, W, H);

  const gradient = context.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, "rgba(68, 107, 74, 0.08)");
  gradient.addColorStop(0.52, "rgba(250, 250, 249, 0)");
  gradient.addColorStop(1, "rgba(68, 107, 74, 0.14)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, W, H);

  context.strokeStyle = "rgba(68, 107, 74, 0.22)";
  context.lineWidth = 3;
  context.strokeRect(78, 78, W - 156, H - 156);

  const fontSans = getFontSans();
  const fontSerif = getFontSerif();

  context.fillStyle = "#446B4A";
  context.font = `700 38px ${fontSans}`;
  context.fillText("SUMMERHOUSES", 120, 180);

  context.fillStyle = "#446B4A";
  context.font = `500 122px ${fontSerif}`;
  drawWrappedText(context, "Bali Destination Guide", 120, 570, 820, 132);

  context.fillStyle = "rgba(68, 107, 74, 0.82)";
  context.font = `500 38px ${fontSans}`;
  drawWrappedText(
    context,
    "Discover the character of Bali through its most iconic destinations, then find the perfect villa for your stay.",
    120,
    1020,
    820,
    58,
  );

  context.fillStyle = "#446B4A";
  roundedRect(context, 120, 1340, 410, 96, 48);
  context.fill();

  context.fillStyle = "#FAFAF9";
  context.font = `700 34px ${fontSans}`;
  context.fillText("EXPLORE BALI", 170, 1398);
  drawSheen(context, W, H);

  return canvas.toDataURL("image/png");
}

function createGalleryTexture(item: BaliCollectionItem, images: HTMLImageElement[]) {
  const canvas = document.createElement("canvas");
  canvas.width = 2400;
  canvas.height = 3200;
  const context = canvas.getContext("2d");
  if (!context) {
    return "";
  }
  context.scale(2, 2);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  const W = 1200;
  const H = 1600;

  const imageSet = images.length > 0 ? images : [];
  const brandGreen = "#446B4A";
  const offWhite = "#FAFAF9";
  const M = 72;
  const cw = W - M * 2;
  const R = 24;

  const fontSans = getFontSans();
  const fontSerif = getFontSerif();

  // ─── Page background ───
  context.fillStyle = offWhite;
  context.fillRect(0, 0, W, H);

  // Subtle diagonal texture for premium print feel
  context.save();
  context.strokeStyle = "rgba(68, 107, 74, 0.02)";
  context.lineWidth = 1;
  for (let i = -1600; i < 1200; i += 48) {
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i + 1600, 1600);
    context.stroke();
  }
  context.restore();

  // ═══════════════════════════════════════════
  // HEADER BAR
  // ═══════════════════════════════════════════
  context.fillStyle = brandGreen;
  context.font = `800 18px ${fontSans}`;
  const brandLabel = "SUMMERHOUSES";
  context.fillText(brandLabel, M, M + 22);

  const brandW = context.measureText(brandLabel).width;
  context.beginPath();
  context.arc(M + brandW + 16, M + 17, 3, 0, Math.PI * 2);
  context.fill();

  context.font = `500 18px ${fontSans}`;
  context.fillStyle = "rgba(68, 107, 74, 0.55)";
  context.fillText("BALI LIFESTYLE GUIDE", M + brandW + 30, M + 22);

  context.save();
  context.font = `800 18px ${fontSans}`;
  context.fillStyle = "rgba(68, 107, 74, 0.28)";
  context.textAlign = "right";
  const collIdx = baliCollections.findIndex((c) => c.id === item.id);
  context.fillText(`NO. ${String(collIdx + 1 > 0 ? collIdx + 1 : 1).padStart(2, "0")}`, M + cw, M + 22);
  context.restore();

  context.strokeStyle = "rgba(68, 107, 74, 0.1)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(M, M + 42);
  context.lineTo(M + cw, M + 42);
  context.stroke();

  // ═══════════════════════════════════════════
  // COLUMN 1 — Tall Hero Image (65% width)
  // ═══════════════════════════════════════════
  const mainY = M + 60;
  const heroW = 660;
  const heroH = 1260;

  if (imageSet[0]) {
    // Elegant drop shadow for the image card
    context.save();
    context.shadowColor = "rgba(30, 48, 34, 0.08)";
    context.shadowBlur = 30;
    context.shadowOffsetY = 12;
    context.fillStyle = offWhite;
    roundedRect(context, M, mainY, heroW, heroH, R);
    context.fill();
    context.restore();

    drawImageCover(context, imageSet[0], M, mainY, heroW, heroH, R);

    // Subtle dark gradient at the bottom of the photo for legibility
    const grad = context.createLinearGradient(M, mainY + heroH * 0.7, M, mainY + heroH);
    grad.addColorStop(0, "rgba(30, 48, 34, 0)");
    grad.addColorStop(1, "rgba(30, 48, 34, 0.35)");
    context.fillStyle = grad;
    context.save();
    roundedRect(context, M, mainY, heroW, heroH, R);
    context.clip();
    context.fillRect(M, mainY, heroW, heroH);
    context.restore();

    // Corner accent lines inside the image
    context.strokeStyle = "rgba(250, 250, 249, 0.18)";
    context.lineWidth = 1.5;
    roundedRect(context, M + 15, mainY + 15, heroW - 30, heroH - 30, R - 4);
    context.stroke();

    // Capsule tag top-left of photo
    context.fillStyle = "rgba(250, 250, 249, 0.22)";
    roundedRect(context, M + 30, mainY + 30, 150, 32, 16);
    context.fill();
    context.fillStyle = offWhite;
    context.font = `800 12px ${fontSans}`;
    context.textAlign = "center";
    context.fillText("JOURNAL SCENE", M + 105, mainY + 50);
    context.textAlign = "left"; // reset
  } else {
    context.fillStyle = "rgba(68, 107, 74, 0.04)";
    roundedRect(context, M, mainY, heroW, heroH, R);
    context.fill();
  }

  // ═══════════════════════════════════════════
  // COLUMN 2 — Lifestyle Pillars (Right side)
  // ═══════════════════════════════════════════
  const col2X = M + heroW + 40;
  const col2W = cw - heroW - 40;

  // Destination Tag
  context.fillStyle = brandGreen;
  context.font = `800 14px ${fontSans}`;
  context.fillText(item.tag.toUpperCase(), col2X, mainY + 30);

  // Large Location title
  context.fillStyle = "#1E3022";
  context.font = `600 56px ${fontSerif}`;
  const locTitleY = drawWrappedText(context, item.location, col2X, mainY + 95, col2W, 64);

  // Divider line
  context.strokeStyle = "rgba(68, 107, 74, 0.16)";
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(col2X, locTitleY + 30);
  context.lineTo(col2X + 160, locTitleY + 30);
  context.stroke();

  // Section Header
  context.fillStyle = "rgba(68, 107, 74, 0.5)";
  context.font = `800 13px ${fontSans}`;
  context.fillText("LIFESTYLE PILLARS", col2X, locTitleY + 75);

  // Render the pillars
  let pillarY = locTitleY + 120;
  const pillars = item.lifestylePillars || baliCollections.find((c) => c.id === item.id)?.lifestylePillars || [];
  
  pillars.slice(0, 3).forEach((pillar, idx) => {
    // Pillar title with numeral
    context.fillStyle = brandGreen;
    context.font = `800 21px ${fontSans}`;
    context.fillText(`0${idx + 1}. ${pillar.title.toUpperCase()}`, col2X, pillarY);

    // Pillar description
    context.fillStyle = "#4A544C";
    context.font = `500 17px ${fontSans}`;
    const descY = drawWrappedText(context, pillar.description, col2X, pillarY + 28, col2W, 26);
    
    // Increment Y
    pillarY = descY + 54;
  });

  // Bottom stamp/accent
  const stampY = Math.max(pillarY, mainY + heroH - 120);
  context.strokeStyle = "rgba(68, 107, 74, 0.08)";
  context.lineWidth = 1.5;
  context.beginPath();
  context.arc(col2X + col2W / 2, stampY + 40, 45, 0, Math.PI * 2);
  context.stroke();
  
  context.save();
  context.textAlign = "center";
  context.fillStyle = "rgba(68, 107, 74, 0.4)";
  context.font = `800 10px ${fontSans}`;
  context.fillText("SUMMERHOUSES", col2X + col2W / 2, stampY + 38);
  context.font = `500 9px ${fontSerif}`;
  context.fillText("BALI", col2X + col2W / 2, stampY + 52);
  context.restore();

  // ═══════════════════════════════════════════
  // FOOTER ACCENT STRIP
  // ═══════════════════════════════════════════
  const footerY = mainY + heroH + 28;

  context.strokeStyle = "rgba(68, 107, 74, 0.08)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(M, footerY);
  context.lineTo(M + cw, footerY);
  context.stroke();

  context.save();
  context.fillStyle = "rgba(68, 107, 74, 0.35)";
  context.font = `700 13px ${fontSans}`;
  const hlText = item.highlights.slice(0, 4).join("  \u00B7  ");
  context.textAlign = "center";
  context.fillText(hlText, W / 2, footerY + 28);
  context.restore();

  drawSheen(context, W, H);
  return canvas.toDataURL("image/png");
}

function createInfoTexture(item: BaliCollectionItem, images: HTMLImageElement[]) {
  const canvas = document.createElement("canvas");
  canvas.width = 2400;
  canvas.height = 3200;
  const context = canvas.getContext("2d");
  if (!context) {
    return "";
  }
  context.scale(2, 2);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  const W = 1200;
  const H = 1600;

  context.fillStyle = "#FAFAF9";
  context.fillRect(0, 0, W, H);

  const wash = context.createRadialGradient(840, 240, 0, 840, 240, 820);
  wash.addColorStop(0, "rgba(68, 107, 74, 0.08)");
  wash.addColorStop(1, "rgba(68, 107, 74, 0)");
  context.fillStyle = wash;
  context.fillRect(0, 0, W, H);

  context.strokeStyle = "rgba(68, 107, 74, 0.22)";
  context.lineWidth = 3;
  context.strokeRect(92, 92, W - 184, H - 184);

  const fontSans = getFontSans();
  const fontSerif = getFontSerif();

  context.fillStyle = "#446B4A";
  context.font = `800 28px ${fontSans}`;
  context.fillText(item.tag.toUpperCase(), 136, 190);

  context.fillStyle = "#446B4A";
  context.font = `500 132px ${fontSerif}`;
  const titleEndY = drawWrappedText(context, item.location, 136, 366, 760, 128);

  context.fillStyle = "rgba(68, 107, 74, 0.85)";
  context.font = `500 35px ${fontSans}`;
  const descEndY = drawWrappedText(context, item.description, 136, titleEndY + 80, 760, 54);

  // Dynamic Spacing Calculation
  const moodY = descEndY + 70;
  context.font = `800 22px ${fontSans}`;
  context.fillStyle = "rgba(68, 107, 74, 0.64)";
  context.fillText("MOOD", 136, moodY);
  
  const moodPillsY = moodY + 24;
  const moodPillsEndY = drawPills(context, item.moods.slice(0, 4), 136, moodPillsY, 720);

  const highlightsY = moodPillsEndY + 54;
  context.fillStyle = "#446B4A";
  context.font = `800 25px ${fontSans}`;
  context.fillText("HIGHLIGHT EXPERIENCES", 136, highlightsY);
  
  context.font = `700 27px ${fontSans}`;
  context.fillStyle = "rgba(68, 107, 74, 0.82)";
  
  const highlightsItems = item.highlights.slice(0, 4);
  highlightsItems.forEach((highlight, index) => {
    const x = 136 + (index % 2) * 410;
    const y = highlightsY + 54 + Math.floor(index / 2) * 56;
    context.fillText(`- ${highlight}`, x, y);
  });
  const highlightsEndY = highlightsY + 54 + Math.ceil(highlightsItems.length / 2) * 56;

  const bestForY = highlightsEndY + 40;
  context.font = `800 25px ${fontSans}`;
  context.fillStyle = "#446B4A";
  context.fillText("BEST FOR", 136, bestForY);
  
  const bestForPillsY = bestForY + 28;
  const bestForPillsEndY = drawPills(context, item.bestFor, 136, bestForPillsY, 560);

  // Draw the Local Vibe & Facts Card in the bottom right corner
  const cardW = 420;
  const cardH = 320;
  const cardX = W - 92 - cardW; // 688
  const cardY = H - 92 - cardH; // 1188

  // Background and border
  context.fillStyle = "rgba(68, 107, 74, 0.045)";
  roundedRect(context, cardX, cardY, cardW, cardH, 24);
  context.fill();
  context.strokeStyle = "rgba(68, 107, 74, 0.22)";
  context.lineWidth = 2;
  context.stroke();

  // Card Header
  context.fillStyle = "#446B4A";
  context.font = `800 24px ${fontSans}`;
  context.fillText("LOCAL PROFILE", cardX + 24, cardY + 44);

  context.strokeStyle = "rgba(68, 107, 74, 0.14)";
  context.beginPath();
  context.moveTo(cardX + 24, cardY + 58);
  context.lineTo(cardX + cardW - 24, cardY + 58);
  context.stroke();

  // Draw local facts in rows
  const facts = item.facts || [];
  facts.slice(0, 3).forEach((fact, idx) => {
    const rowY = cardY + 104 + idx * 72;
    
    // Label
    context.fillStyle = "rgba(68, 107, 74, 0.65)";
    context.font = `800 17px ${fontSans}`;
    context.fillText(fact.label.toUpperCase(), cardX + 24, rowY);

    // Value
    context.fillStyle = "#1E3022";
    context.font = `700 23px ${fontSans}`;
    context.fillText(fact.value, cardX + 142, rowY);

    // Inner divider line (except last row)
    if (idx < 2) {
      context.strokeStyle = "rgba(68, 107, 74, 0.06)";
      context.beginPath();
      context.moveTo(cardX + 24, rowY + 20);
      context.lineTo(cardX + cardW - 24, rowY + 20);
      context.stroke();
    }
  });

  drawSheen(context, W, H);
  return canvas.toDataURL("image/png");
}

function createBackCoverTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2400;
  canvas.height = 3200;
  const context = canvas.getContext("2d");
  if (!context) {
    return "";
  }
  context.scale(2, 2);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  const W = 1200;
  const H = 1600;

  const fontSans = getFontSans();
  const fontSerif = getFontSerif();

  context.fillStyle = "#446B4A";
  context.fillRect(0, 0, W, H);
  context.fillStyle = "rgba(250, 250, 249, 0.08)";
  context.fillRect(86, 86, W - 172, H - 172);

  context.fillStyle = "#FAFAF9";
  context.font = `500 108px ${fontSerif}`;
  drawWrappedText(context, "Find your Bali rhythm.", 120, 650, 760, 118);

  context.fillStyle = "rgba(250, 250, 249, 0.82)";
  context.font = `500 38px ${fontSans}`;
  drawWrappedText(context, "Explore the full villa collection and filter by destination, dates, and guests.", 120, 1030, 820, 56);

  context.fillStyle = "#FAFAF9";
  context.font = `800 34px ${fontSans}`;
  context.fillText("SUMMERHOUSES BALI", 120, 1380);
  drawSheen(context, W, H);

  return canvas.toDataURL("image/png");
}

async function buildBookPages(sourceCollections: BaliCollectionItem[]) {
  const remoteImageSets = await fetchCollectionImageSets();
  const collections = mergeCollectionImages(sourceCollections, remoteImageSets);
  const collectionImages = await Promise.all(collections.map((item) => loadCollectionImages(item)));
  const galleryTextures = collections.map((item, index) => createGalleryTexture(item, collectionImages[index] ?? []));
  const infoTextures = collections.map((item, index) => createInfoTexture(item, collectionImages[index] ?? []));

  return [
    {
      id: "cover",
      front: createCoverTexture(),
      back: galleryTextures[0],
    },
    ...collections.map((item, index) => ({
      id: item.id,
      front: infoTextures[index],
      back: galleryTextures[index + 1] ?? createBackCoverTexture(),
    })),
  ];
}

type PageProps = BookPageData & {
  number: number;
  page: number;
  opened: boolean;
  bookClosed: boolean;
  totalPages: number;
  setPage: (page: number) => void;
};

function Page({ number, front, back, page, opened, bookClosed, totalPages, setPage }: PageProps) {
  const texturePaths = [resolveTexturePath(front), resolveTexturePath(back)];
  const loadedTextures = useTexture(texturePaths);
  const textures = Array.isArray(loadedTextures) ? loadedTextures : [loadedTextures];
  const picture = textures[0];
  const picture2 = textures[1];

  picture.colorSpace = SRGBColorSpace;
  picture2.colorSpace = SRGBColorSpace;
  picture.anisotropy = 8;
  picture2.anisotropy = 8;

  const group = useRef<Group>(null);
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);
  const skinnedMeshRef = useRef<SkinnedMesh>(null);
  const [highlighted, setHighlighted] = useState(false);

  useCursor(highlighted);

  const manualSkinnedMesh = useMemo(() => {
    const bones: Bone[] = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i += 1) {
      const bone = new Bone();
      bones.push(bone);
      bone.position.x = i === 0 ? 0 : SEGMENT_WIDTH;
      if (i > 0) {
        bones[i - 1].add(bone);
      }
    }

    const skeleton = new Skeleton(bones);
    const commonMaterial = {
      metalness: 0.015,
      roughness: 0.68,
      transparent: false,
      depthWrite: true,
      depthTest: true,
    };
    const materials = [
      ...basePageMaterials,
      new MeshStandardMaterial({
        color: "#f7f0e4",
        map: picture,
        emissive: emissiveColor,
        emissiveIntensity: 0,
        ...commonMaterial,
      }),
      new MeshStandardMaterial({
        color: "#f7f0e4",
        map: picture2,
        emissive: emissiveColor,
        emissiveIntensity: 0,
        ...commonMaterial,
      }),
    ];

    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [picture, picture2]);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current || !group.current) {
      return;
    }

    const materials = skinnedMeshRef.current.material as MeshStandardMaterial[];
    const emissiveIntensity = highlighted ? 0.025 : 0;
    materials[4].emissiveIntensity = MathUtils.lerp(materials[4].emissiveIntensity, emissiveIntensity, 0.08);
    materials[5].emissiveIntensity = MathUtils.lerp(materials[5].emissiveIntensity, emissiveIntensity, 0.08);

    if (lastOpened.current !== opened) {
      turnedAt.current = Date.now();
      lastOpened.current = opened;
    }

    let turningTime = Math.min(400, Date.now() - turnedAt.current) / 400;
    turningTime = Math.sin(turningTime * Math.PI);

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      targetRotation += MathUtils.degToRad(number * 0.8);
    }

    const bones = skinnedMeshRef.current.skeleton.bones;
    for (let i = 0; i < bones.length; i += 1) {
      const target = i === 0 ? group.current : bones[i];
      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity = Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;

      let rotationAngle =
        insideCurveStrength * insideCurveIntensity * targetRotation -
        outsideCurveStrength * outsideCurveIntensity * targetRotation +
        turningCurveStrength * turningIntensity * targetRotation;
      let foldRotationAngle = MathUtils.degToRad(Math.sign(targetRotation) * 2);

      if (bookClosed) {
        if (i === 0) {
          rotationAngle = targetRotation;
          foldRotationAngle = 0;
        } else {
          rotationAngle = 0;
          foldRotationAngle = 0;
        }
      }

      easing.dampAngle(target.rotation, "y", rotationAngle, easingFactor, delta);

      const foldIntensity = i > 8 ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime : 0;
      easing.dampAngle(target.rotation, "x", foldRotationAngle * foldIntensity, easingFactorFold, delta);
    }
  });

  return (
    <group
      ref={group}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHighlighted(true);
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        setHighlighted(false);
      }}
      onClick={(event) => {
        event.stopPropagation();
        setPage(opened ? number : Math.min(number + 1, totalPages));
        setHighlighted(false);
      }}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  );
}

function Book({
  page,
  pages,
  setPage,
}: {
  page: number;
  pages: BookPageData[];
  setPage: (page: number) => void;
}) {
  const [delayedPage, setDelayedPage] = useState(page);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const goToPage = () => {
      setDelayedPage((currentPage) => {
        if (page === currentPage) {
          return currentPage;
        }

        timeout = setTimeout(goToPage, Math.abs(page - currentPage) > 2 ? 50 : 150);
        return page > currentPage ? currentPage + 1 : currentPage - 1;
      });
    };

    goToPage();
    return () => clearTimeout(timeout);
  }, [page]);

  return (
    <group rotation-y={-Math.PI / 2}>
      {pages.map((pageData, index) => (
        <Page
          key={pageData.id}
          page={delayedPage}
          number={index}
          opened={delayedPage > index}
          bookClosed={delayedPage === 0 || delayedPage === pages.length}
          totalPages={pages.length}
          setPage={setPage}
          {...pageData}
        />
      ))}
    </group>
  );
}

function BookExperience({
  page,
  pages,
  setPage,
}: {
  page: number;
  pages: BookPageData[];
  setPage: (page: number) => void;
}) {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Smooth mouse parallax tilt for depth
    const targetY = state.pointer.x * 0.16; // Yaw
    const targetX = -state.pointer.y * 0.08; // Pitch
    
    easing.damp(groupRef.current.rotation, "y", targetY, 0.25, delta);
    easing.damp(groupRef.current.rotation, "x", targetX, 0.25, delta);
  });

  return (
    <>
      <group ref={groupRef} scale={1.58}>
        <Book page={page} pages={pages} setPage={setPage} />
      </group>
      <hemisphereLight args={["#fff7ea", "#9f8e7c", 0.48]} />
      <directionalLight
        position={[2.8, 5, 2.8]}
        intensity={0.82}
        castShadow
        shadow-mapSize-width={1536}
        shadow-mapSize-height={1536}
        shadow-bias={-0.00008}
      />
      <spotLight position={[-3.4, 2.2, 4]} intensity={0.26} angle={0.38} penumbra={0.85} />
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.14} />
      </mesh>
      <Html position={[0, -2.0, 0]} center>
        <span className="bali-book-page-count">
          {page === 0 ? "Cover" : page === pages.length ? "Back cover" : `Destination ${page}`}
        </span>
      </Html>
    </>
  );
}

type BaliFlipBookProps = {
  collections?: BaliCollectionItem[];
  page: number;
  setPage: (page: number) => void;
  onTotalPagesDetected?: (total: number) => void;
};

export default function BaliFlipBook({
  collections = baliCollections,
  page,
  setPage,
  onTotalPagesDetected,
}: BaliFlipBookProps) {
  const [pages, setPages] = useState<BookPageData[]>([]);

  useEffect(() => {
    let isMounted = true;

    const initBook = async () => {
      // Wait for premium fonts to load to prevent fallback canvas rendering
      if (typeof window !== "undefined" && "fonts" in document) {
        try {
          await document.fonts.ready;
        } catch (e) {
          console.warn("Failed to wait for fonts to load:", e);
        }
      }

      const builtPages = await buildBookPages(collections);
      if (isMounted) {
        setPages(builtPages);
      }
    };

    initBook();

    return () => {
      isMounted = false;
    };
  }, [collections]);

  useEffect(() => {
    if (pages.length > 0 && onTotalPagesDetected) {
      onTotalPagesDetected(pages.length);
    }
  }, [pages, onTotalPagesDetected]);

  useEffect(() => {
    if (page === 0) {
      return;
    }

    const audio = new Audio(PAGE_FLIP_AUDIO);
    audio.volume = 0.22;
    audio.play().catch(() => {
      // Browsers can block audio until the first trusted user interaction.
    });
  }, [page]);

  return (
    <div className="bali-book-stage">
      <div className="bali-book-canvas-shell">
        {pages.length > 0 ? (
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [-0.18, 0, 5.2], fov: 39 }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          >
            <Suspense fallback={null}>
              <BookExperience page={page} pages={pages} setPage={setPage} />
            </Suspense>
          </Canvas>
        ) : (
          <div className="bali-book-loading-container">
            <div className="bali-book-loading-spinner" />
            <span className="bali-book-loading-text">Preparing Bali Journal...</span>
            <span className="bali-book-loading-subtext">Please wait</span>
          </div>
        )}
      </div>
    </div>
  );
}
