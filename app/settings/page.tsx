"use client";
import { useEffect, useState } from "react";
import { Page } from "@/components/Page";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useSettings } from "@/stores/settingsStore";

export default function SettingsPage() {
  // Hydrate persisted settings, then gate reads behind `mounted` so the first
  // client render matches the SSR HTML (DEFAULT_SETTINGS). Mirrors ChapterList.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    useSettings.getState().reload();
    setMounted(true);
  }, []);

  return (
    <Page>
      <div data-testid="settings-page">
        <h1 style={{ color: "var(--accent)", fontSize: 22, marginBottom: 24 }}>settings</h1>
        <SettingsPanel mounted={mounted} />
      </div>
    </Page>
  );
}
