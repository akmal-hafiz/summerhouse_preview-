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

  items.forEach((item) => {
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
    context.font = "800 22px Arial";
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
  canvas.width = 1200;
  canvas.height = 1600;
  const context = canvas.getContext("2d");
  if (!context) {
    return "";
  }

  context.fillStyle = "#FAFAF9";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgba(68, 107, 74, 0.08)");
  gradient.addColorStop(0.52, "rgba(250, 250, 249, 0)");
  gradient.addColorStop(1, "rgba(68, 107, 74, 0.14)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "rgba(68, 107, 74, 0.22)";
  context.lineWidth = 3;
  context.strokeRect(78, 78, canvas.width - 156, canvas.height - 156);

  context.fillStyle = "#446B4A";
  context.font = "700 38px Arial";
  context.fillText("SUMMERHOUSES", 120, 180);

  context.fillStyle = "#446B4A";
  context.font = "500 122px Georgia";
  drawWrappedText(context, "Bali Destination Guide", 120, 570, 820, 132);

  context.fillStyle = "rgba(68, 107, 74, 0.82)";
  context.font = "500 38px Arial";
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
  context.font = "700 34px Arial";
  context.fillText("EXPLORE BALI", 170, 1398);
  drawSheen(context, canvas.width, canvas.height);

  return canvas.toDataURL("image/png");
}

function createGalleryTexture(item: BaliCollectionItem, images: HTMLImageElement[]) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1600;
  const context = canvas.getContext("2d");
  if (!context) {
    return "";
  }

  const imageSet = images.length > 0 ? images : [];
  const brandGreen = "#446B4A";
  const offWhite = "#FAFAF9";
  const M = 72;
  const G = 16;
  const cw = canvas.width - M * 2;
  const R = 20;

  // ─── Page background ───
  context.fillStyle = offWhite;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle diagonal texture for premium print feel
  context.save();
  context.strokeStyle = "rgba(68, 107, 74, 0.022)";
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
  context.font = "800 18px Arial";
  const brandLabel = "SUMMERHOUSES";
  context.fillText(brandLabel, M, M + 22);

  const brandW = context.measureText(brandLabel).width;
  context.beginPath();
  context.arc(M + brandW + 16, M + 17, 3, 0, Math.PI * 2);
  context.fill();

  context.font = "500 18px Arial";
  context.fillStyle = "rgba(68, 107, 74, 0.55)";
  context.fillText("BALI COLLECTION", M + brandW + 30, M + 22);

  context.save();
  context.font = "800 18px Arial";
  context.fillStyle = "rgba(68, 107, 74, 0.28)";
  context.textAlign = "right";
  const collIdx = baliCollections.indexOf(item);
  context.fillText(`NO. ${String(collIdx + 1 > 0 ? collIdx + 1 : 1).padStart(2, "0")}`, M + cw, M + 22);
  context.restore();

  context.strokeStyle = "rgba(68, 107, 74, 0.1)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(M, M + 42);
  context.lineTo(M + cw, M + 42);
  context.stroke();

  // ═══════════════════════════════════════════
  // ROW 1 — Hero Image (60%) + Stats Card (40%)
  // ═══════════════════════════════════════════
  const r1Y = M + 58;
  const r1H = 480;
  const r1LW = 636;
  const r1RW = cw - r1LW - G;

  // ── Hero Image Card (Left) ──
  if (imageSet[0]) {
    context.fillStyle = "rgba(0, 0, 0, 0.045)";
    roundedRect(context, M + 5, r1Y + 5, r1LW, r1H, R);
    context.fill();

    drawImageCover(context, imageSet[0], M, r1Y, r1LW, r1H, R);

    // Multi-layer gradient overlay for text legibility
    const grad = context.createLinearGradient(M, r1Y + r1H * 0.35, M, r1Y + r1H);
    grad.addColorStop(0, "rgba(30, 48, 34, 0)");
    grad.addColorStop(0.55, "rgba(30, 48, 34, 0.28)");
    grad.addColorStop(1, "rgba(30, 48, 34, 0.78)");
    context.fillStyle = grad;
    context.save();
    roundedRect(context, M, r1Y, r1LW, r1H, R);
    context.clip();
    context.fillRect(M, r1Y, r1LW, r1H);
    context.restore();

    // Top vignette for pill badge
    const topGrad = context.createLinearGradient(M, r1Y, M, r1Y + 90);
    topGrad.addColorStop(0, "rgba(30, 48, 34, 0.22)");
    topGrad.addColorStop(1, "rgba(30, 48, 34, 0)");
    context.fillStyle = topGrad;
    context.save();
    roundedRect(context, M, r1Y, r1LW, r1H, R);
    context.clip();
    context.fillRect(M, r1Y, r1LW, 90);
    context.restore();

    // "FEATURED DESTINATION" pill badge
    const pillLabel = "FEATURED DESTINATION";
    context.font = "800 13px Arial";
    const pillW = context.measureText(pillLabel).width + 28;
    context.fillStyle = "rgba(250, 250, 249, 0.16)";
    roundedRect(context, M + 24, r1Y + 22, pillW, 30, 15);
    context.fill();
    context.strokeStyle = "rgba(250, 250, 249, 0.28)";
    context.lineWidth = 1;
    context.stroke();
    context.fillStyle = offWhite;
    context.fillText(pillLabel, M + 38, r1Y + 42);

    // Location name at bottom
    context.fillStyle = offWhite;
    context.font = "500 52px Georgia";
    context.fillText(item.location, M + 28, r1Y + r1H - 52);

    // Tag below location
    context.fillStyle = "rgba(250, 250, 249, 0.65)";
    context.font = "800 15px Arial";
    context.fillText(item.tag.toUpperCase(), M + 30, r1Y + r1H - 24);

    // Inner framing border
    context.strokeStyle = "rgba(250, 250, 249, 0.06)";
    context.lineWidth = 1;
    roundedRect(context, M + 10, r1Y + 10, r1LW - 20, r1H - 20, R - 4);
    context.stroke();
  } else {
    context.fillStyle = "rgba(68, 107, 74, 0.04)";
    roundedRect(context, M, r1Y, r1LW, r1H, R);
    context.fill();
  }

  // ── Stats Card (Right, solid green) ──
  const sX = M + r1LW + G;

  context.fillStyle = "rgba(0, 0, 0, 0.05)";
  roundedRect(context, sX + 5, r1Y + 5, r1RW, r1H, R);
  context.fill();

  context.fillStyle = brandGreen;
  roundedRect(context, sX, r1Y, r1RW, r1H, R);
  context.fill();

  // Dot pattern decoration (top-right corner)
  for (let dr = 0; dr < 5; dr++) {
    for (let dc = 0; dc < 5; dc++) {
      context.fillStyle = "rgba(250, 250, 249, 0.06)";
      context.beginPath();
      context.arc(sX + r1RW - 28 - dc * 16, r1Y + 28 + dr * 16, 2.5, 0, Math.PI * 2);
      context.fill();
    }
  }

  // L-shaped corner accent (top-left)
  context.strokeStyle = "rgba(250, 250, 249, 0.12)";
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(sX + 24, r1Y + 24);
  context.lineTo(sX + 24, r1Y + 52);
  context.stroke();
  context.beginPath();
  context.moveTo(sX + 24, r1Y + 24);
  context.lineTo(sX + 52, r1Y + 24);
  context.stroke();

  // "THE DESTINATION" label
  context.fillStyle = "rgba(250, 250, 249, 0.45)";
  context.font = "800 13px Arial";
  context.fillText("THE DESTINATION", sX + 32, r1Y + 80);

  // Location name
  context.fillStyle = offWhite;
  context.font = "500 36px Georgia";
  drawWrappedText(context, item.location.toUpperCase(), sX + 32, r1Y + 128, r1RW - 64, 42);

  // Divider line
  context.strokeStyle = "rgba(250, 250, 249, 0.14)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(sX + 32, r1Y + 186);
  context.lineTo(sX + r1RW - 32, r1Y + 186);
  context.stroke();

  // Villa count (large)
  context.fillStyle = offWhite;
  context.font = "800 60px Arial";
  context.fillText(item.villaCount, sX + 32, r1Y + 262);

  // "CURATED VILLAS" subtitle
  context.fillStyle = "rgba(250, 250, 249, 0.55)";
  context.font = "700 16px Arial";
  context.fillText("CURATED VILLAS", sX + 32, r1Y + 294);

  // Price
  context.fillStyle = offWhite;
  context.font = "700 20px Arial";
  context.fillText(item.price, sX + 32, r1Y + 340);

  // "PREMIUM SELECTION" label + rating dots
  context.fillStyle = "rgba(250, 250, 249, 0.4)";
  context.font = "800 12px Arial";
  context.fillText("PREMIUM SELECTION", sX + 32, r1Y + r1H - 62);

  for (let i = 0; i < 5; i++) {
    context.fillStyle = i < 4 ? offWhite : "rgba(250, 250, 249, 0.18)";
    context.beginPath();
    context.arc(sX + 38 + i * 22, r1Y + r1H - 36, 6, 0, Math.PI * 2);
    context.fill();
  }

  // Compass decoration (bottom-right)
  context.strokeStyle = "rgba(250, 250, 249, 0.09)";
  context.lineWidth = 1.5;
  context.beginPath();
  context.arc(sX + r1RW - 52, r1Y + r1H - 52, 26, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.moveTo(sX + r1RW - 52, r1Y + r1H - 78);
  context.lineTo(sX + r1RW - 52, r1Y + r1H - 26);
  context.stroke();
  context.beginPath();
  context.moveTo(sX + r1RW - 78, r1Y + r1H - 52);
  context.lineTo(sX + r1RW - 26, r1Y + r1H - 52);
  context.stroke();

  // ═══════════════════════════════════════════
  // ROW 2 — Image 2 (32%) + Image 3 (68%)
  // ═══════════════════════════════════════════
  const r2Y = r1Y + r1H + G;
  const r2H = 380;
  const r2LW = 338;
  const r2RW = cw - r2LW - G;

  // ── Image 2 Card (Left, portrait) ──
  if (imageSet[1]) {
    context.fillStyle = "rgba(0, 0, 0, 0.04)";
    roundedRect(context, M + 4, r2Y + 4, r2LW, r2H, R);
    context.fill();

    drawImageCover(context, imageSet[1], M, r2Y, r2LW, r2H, R);

    // Bottom gradient
    const g2 = context.createLinearGradient(M, r2Y + r2H * 0.55, M, r2Y + r2H);
    g2.addColorStop(0, "rgba(30, 48, 34, 0)");
    g2.addColorStop(1, "rgba(30, 48, 34, 0.5)");
    context.fillStyle = g2;
    context.save();
    roundedRect(context, M, r2Y, r2LW, r2H, R);
    context.clip();
    context.fillRect(M, r2Y, r2LW, r2H);
    context.restore();

    // Number badge bottom-left
    context.fillStyle = "rgba(250, 250, 249, 0.14)";
    roundedRect(context, M + 16, r2Y + r2H - 46, 44, 30, 15);
    context.fill();
    context.fillStyle = offWhite;
    context.font = "800 13px Arial";
    context.fillText("02", M + 28, r2Y + r2H - 26);
  } else {
    context.fillStyle = "rgba(68, 107, 74, 0.035)";
    roundedRect(context, M, r2Y, r2LW, r2H, R);
    context.fill();
    context.strokeStyle = "rgba(68, 107, 74, 0.08)";
    context.lineWidth = 1;
    context.stroke();
  }

  // ── Image 3 Card (Right, landscape, larger) ──
  const i3X = M + r2LW + G;
  if (imageSet[2]) {
    context.fillStyle = "rgba(0, 0, 0, 0.04)";
    roundedRect(context, i3X + 4, r2Y + 4, r2RW, r2H, R);
    context.fill();

    drawImageCover(context, imageSet[2], i3X, r2Y, r2RW, r2H, R);

    // Subtle gradient overlay
    const g3 = context.createLinearGradient(i3X, r2Y + r2H * 0.6, i3X, r2Y + r2H);
    g3.addColorStop(0, "rgba(30, 48, 34, 0)");
    g3.addColorStop(1, "rgba(30, 48, 34, 0.38)");
    context.fillStyle = g3;
    context.save();
    roundedRect(context, i3X, r2Y, r2RW, r2H, R);
    context.clip();
    context.fillRect(i3X, r2Y, r2RW, r2H);
    context.restore();

    // "GALLERY VIEW" badge top-right
    const gvLabel = "GALLERY VIEW";
    context.font = "800 12px Arial";
    const gvW = context.measureText(gvLabel).width + 24;
    context.fillStyle = "rgba(250, 250, 249, 0.14)";
    roundedRect(context, i3X + r2RW - gvW - 16, r2Y + 16, gvW, 28, 14);
    context.fill();
    context.fillStyle = offWhite;
    context.fillText(gvLabel, i3X + r2RW - gvW - 4, r2Y + 35);

    // Location label at bottom-left
    context.fillStyle = "rgba(250, 250, 249, 0.85)";
    context.font = "500 28px Georgia";
    context.fillText(item.location, i3X + 24, r2Y + r2H - 24);
  } else {
    context.fillStyle = "rgba(68, 107, 74, 0.035)";
    roundedRect(context, i3X, r2Y, r2RW, r2H, R);
    context.fill();
    context.strokeStyle = "rgba(68, 107, 74, 0.08)";
    context.lineWidth = 1;
    context.stroke();
  }

  // ═══════════════════════════════════════════
  // ROW 3 — Atmosphere Card (60%) + Image 4 (40%)
  // ═══════════════════════════════════════════
  const r3Y = r2Y + r2H + G;
  const r3H = 368;
  const r3LW = 636;
  const r3RW = cw - r3LW - G;

  // ── Atmosphere Card (Left) ──
  context.fillStyle = "rgba(0, 0, 0, 0.025)";
  roundedRect(context, M + 4, r3Y + 4, r3LW, r3H, R);
  context.fill();

  context.fillStyle = "rgba(68, 107, 74, 0.03)";
  roundedRect(context, M, r3Y, r3LW, r3H, R);
  context.fill();
  context.strokeStyle = "rgba(68, 107, 74, 0.10)";
  context.lineWidth = 1.5;
  context.stroke();

  // L-shaped corner accents
  context.strokeStyle = "rgba(68, 107, 74, 0.14)";
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(M + r3LW - 38, r3Y + 16);
  context.lineTo(M + r3LW - 16, r3Y + 16);
  context.lineTo(M + r3LW - 16, r3Y + 38);
  context.stroke();
  context.beginPath();
  context.moveTo(M + 16, r3Y + r3H - 38);
  context.lineTo(M + 16, r3Y + r3H - 16);
  context.lineTo(M + 38, r3Y + r3H - 16);
  context.stroke();

  // Header
  context.fillStyle = brandGreen;
  context.font = "800 15px Arial";
  context.fillText("ATMOSPHERE & VIBES", M + 32, r3Y + 42);

  // Line under header
  context.strokeStyle = "rgba(68, 107, 74, 0.08)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(M + 32, r3Y + 56);
  context.lineTo(M + r3LW - 32, r3Y + 56);
  context.stroke();

  // Mood items in two columns
  const moods = item.moods.slice(0, 6);
  const moodColW = (r3LW - 96) / 2;
  moods.forEach((mood, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const mx = M + 42 + col * moodColW;
    const my = r3Y + 100 + row * 68;

    context.fillStyle = brandGreen;
    context.beginPath();
    context.arc(mx, my - 5, 5, 0, Math.PI * 2);
    context.fill();

    context.font = "800 19px Arial";
    context.fillStyle = brandGreen;
    context.fillText(mood.toUpperCase(), mx + 18, my);

    context.strokeStyle = "rgba(68, 107, 74, 0.05)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(mx + 18, my + 14);
    context.lineTo(mx + moodColW - 24, my + 14);
    context.stroke();
  });

  // ── Image 4 Card (Right) ──
  const i4X = M + r3LW + G;
  const i4Src = imageSet[3] ?? imageSet[0] ?? null;
  if (i4Src) {
    context.fillStyle = "rgba(0, 0, 0, 0.04)";
    roundedRect(context, i4X + 4, r3Y + 4, r3RW, r3H, R);
    context.fill();

    drawImageCover(context, i4Src, i4X, r3Y, r3RW, r3H, R);

    // Gradient overlay at bottom
    const g4 = context.createLinearGradient(i4X, r3Y + r3H * 0.5, i4X, r3Y + r3H);
    g4.addColorStop(0, "rgba(30, 48, 34, 0)");
    g4.addColorStop(1, "rgba(30, 48, 34, 0.55)");
    context.fillStyle = g4;
    context.save();
    roundedRect(context, i4X, r3Y, r3RW, r3H, R);
    context.clip();
    context.fillRect(i4X, r3Y, r3RW, r3H);
    context.restore();

    // "EXPLORE" label at bottom
    context.fillStyle = offWhite;
    context.font = "800 14px Arial";
    context.fillText("EXPLORE", i4X + 20, r3Y + r3H - 22);

    // Draw clean vector arrow manually to prevent emoji translation on mobile/OS
    const textWidth = context.measureText("EXPLORE").width;
    const arrowX = i4X + 20 + textWidth + 8;
    const arrowY = r3Y + r3H - 27; // Center line of text
    context.strokeStyle = offWhite;
    context.lineWidth = 2.5;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(arrowX, arrowY);
    context.lineTo(arrowX + 8, arrowY);
    context.lineTo(arrowX + 5, arrowY - 3);
    context.moveTo(arrowX + 8, arrowY);
    context.lineTo(arrowX + 5, arrowY + 3);
    context.stroke();
  } else {
    context.fillStyle = "rgba(68, 107, 74, 0.035)";
    roundedRect(context, i4X, r3Y, r3RW, r3H, R);
    context.fill();
    context.strokeStyle = "rgba(68, 107, 74, 0.08)";
    context.lineWidth = 1;
    context.stroke();
  }

  // ═══════════════════════════════════════════
  // FOOTER ACCENT STRIP
  // ═══════════════════════════════════════════
  const footerY = r3Y + r3H + G + 12;

  context.strokeStyle = "rgba(68, 107, 74, 0.08)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(M, footerY);
  context.lineTo(M + cw, footerY);
  context.stroke();

  context.save();
  context.fillStyle = "rgba(68, 107, 74, 0.35)";
  context.font = "700 13px Arial";
  const hlText = item.highlights.slice(0, 3).join("  \u00B7  ");
  context.textAlign = "center";
  context.fillText(hlText, canvas.width / 2, footerY + 28);
  context.restore();

  drawSheen(context, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

function createInfoTexture(item: BaliCollectionItem, images: HTMLImageElement[]) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1600;
  const context = canvas.getContext("2d");
  if (!context) {
    return "";
  }

  context.fillStyle = "#FAFAF9";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const wash = context.createRadialGradient(840, 240, 0, 840, 240, 820);
  wash.addColorStop(0, "rgba(68, 107, 74, 0.08)");
  wash.addColorStop(1, "rgba(68, 107, 74, 0)");
  context.fillStyle = wash;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "rgba(68, 107, 74, 0.22)";
  context.lineWidth = 3;
  context.strokeRect(92, 92, canvas.width - 184, canvas.height - 184);

  context.fillStyle = "#446B4A";
  context.font = "800 28px Arial";
  context.fillText(item.tag.toUpperCase(), 136, 190);

  context.fillStyle = "#446B4A";
  context.font = "500 132px Georgia";
  const titleEndY = drawWrappedText(context, item.location, 136, 366, 760, 128);

  context.fillStyle = "rgba(68, 107, 74, 0.85)";
  context.font = "500 35px Arial";
  drawWrappedText(context, item.description, 136, titleEndY + 100, 760, 54);

  context.font = "800 22px Arial";
  context.fillStyle = "rgba(68, 107, 74, 0.64)";
  context.fillText("MOOD", 136, 842);
  drawPills(context, item.moods.slice(0, 4), 136, 866, 720);

  context.fillStyle = "#446B4A";
  context.font = "800 25px Arial";
  context.fillText("HIGHLIGHT EXPERIENCES", 136, 1046);
  context.font = "700 27px Arial";
  context.fillStyle = "rgba(68, 107, 74, 0.82)";
  item.highlights.slice(0, 4).forEach((highlight, index) => {
    const x = 136 + (index % 2) * 410;
    const y = 1106 + Math.floor(index / 2) * 60;
    context.fillText(`- ${highlight}`, x, y);
  });

  context.font = "800 25px Arial";
  context.fillStyle = "#446B4A";
  context.fillText("BEST FOR", 136, 1268);
  drawPills(context, item.bestFor, 136, 1298, 560);

  context.fillStyle = "rgba(68, 107, 74, 0.08)";
  roundedRect(context, 690, 1286, 296, 150, 30);
  context.fill();
  context.fillStyle = "#446B4A";
  context.font = "800 30px Arial";
  context.fillText(item.villaCount, 724, 1350);
  context.font = "700 24px Arial";
  context.fillStyle = "rgba(68, 107, 74, 0.78)";
  context.fillText(item.price, 724, 1398);

  context.fillStyle = "#446B4A";
  roundedRect(context, 690, 1460, 318, 76, 38);
  context.fill();

  context.fillStyle = "#FAFAF9";
  context.font = "800 23px Arial";
  context.fillText("EXPLORE VILLAS", 744, 1507);
  drawSheen(context, canvas.width, canvas.height);

  return canvas.toDataURL("image/png");
}

function createBackCoverTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1600;
  const context = canvas.getContext("2d");
  if (!context) {
    return "";
  }

  context.fillStyle = "#446B4A";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(250, 250, 249, 0.08)";
  context.fillRect(86, 86, canvas.width - 172, canvas.height - 172);

  context.fillStyle = "#FAFAF9";
  context.font = "500 108px Georgia";
  drawWrappedText(context, "Find your Bali rhythm.", 120, 650, 760, 118);

  context.fillStyle = "rgba(250, 250, 249, 0.82)";
  context.font = "500 38px Arial";
  drawWrappedText(context, "Explore the full villa collection and filter by destination, dates, and guests.", 120, 1030, 820, 56);

  context.fillStyle = "#FAFAF9";
  context.font = "800 34px Arial";
  context.fillText("SUMMERHOUSES BALI", 120, 1380);
  drawSheen(context, canvas.width, canvas.height);

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
  picture.anisotropy = 4;
  picture2.anisotropy = 4;

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
  return (
    <>
      <group rotation-x={0} scale={1.58}>
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
};

export default function BaliFlipBook({ collections = baliCollections }: BaliFlipBookProps) {
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState<BookPageData[]>([]);
  const activeCollection = collections[Math.max(0, Math.min(collections.length - 1, page - 1))] ?? collections[0];

  useEffect(() => {
    let isMounted = true;

    buildBookPages(collections)
      .then((builtPages) => {
        if (isMounted) {
          setPages(builtPages);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPages([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [collections]);

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
            dpr={[1, 1.5]}
            camera={{ position: [-0.18, 0, 5.2], fov: 39 }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          >
            <Suspense fallback={null}>
              <BookExperience page={page} pages={pages} setPage={setPage} />
            </Suspense>
          </Canvas>
        ) : (
          <div className="bali-book-loading">Preparing private Bali journal...</div>
        )}
      </div>

      <div className="bali-book-controls" aria-label="Bali collection book controls">
        <Link className="bali-book-cta" href={activeCollection.href}>
          {activeCollection.cta}
        </Link>
      </div>
    </div>
  );
}
