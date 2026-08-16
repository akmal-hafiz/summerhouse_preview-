"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_FOOTER_SETTINGS,
  FOOTER_SETTING_KEYS,
  resolveFooterSettings,
  type FooterSettings,
} from "@/lib/footer-settings";

const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "http://localhost:8000/api";

export function useFooterSettings(): FooterSettings {
  const [settings, setSettings] = useState<FooterSettings>(DEFAULT_FOOTER_SETTINGS);

  useEffect(() => {
    const controller = new AbortController();
    const keys = FOOTER_SETTING_KEYS.join(",");

    fetch(`${CMS_BASE_URL}/v1/cms/settings?keys=${encodeURIComponent(keys)}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.success) setSettings(resolveFooterSettings(data.settings));
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  return settings;
}
