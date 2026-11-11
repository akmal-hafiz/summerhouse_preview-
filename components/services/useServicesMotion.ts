"use client";
import type { RefObject } from "react";
import { useSectionChoreography } from "@/hooks/useSectionChoreography";
export function useServicesMotion(root: RefObject<HTMLDivElement | null>) { useSectionChoreography(root, "services"); }
