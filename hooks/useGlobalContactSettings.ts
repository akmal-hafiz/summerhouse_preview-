"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_GLOBAL_CONTACT,
  GLOBAL_CONTACT_KEYS,
  resolveGlobalContactSettings,
  type GlobalContactSettings,
} from "@/lib/contact-settings";

const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "http://localhost:8000/api";

export function useGlobalContactSettings(): GlobalContactSettings {
  const [settings, setSettings] = useState<GlobalContactSettings>(DEFAULT_GLOBAL_CONTACT);

  useEffect(() => {
    const controller = new AbortController();
    const keys = [...GLOBAL_CONTACT_KEYS, "contact.email"].join(",");

    fetch(`${CMS_BASE_URL}/v1/cms/settings?keys=${encodeURIComponent(keys)}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.success) setSettings(resolveGlobalContactSettings(data.settings));
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  return settings;
}
