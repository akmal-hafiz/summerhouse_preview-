"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { stayFromParams, villaHref } from "@/lib/promo-param";

/**
 * A link to another villa that carries the stay currently in this page's URL. The villa calendar writes the dates
 * the guest picks into the URL, so a guest who found villa A full and picked other dates takes those to villa B.
 */
export default function StayLink({ villaId, promo, children }: { villaId: string | number; promo: string; children: ReactNode }) {
  const params = useSearchParams();
  return <Link href={villaHref(villaId, promo, stayFromParams(Object.fromEntries(params)))}>{children}</Link>;
}
