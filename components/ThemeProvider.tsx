"use client";
import { useEffect, useState } from "react";
import { useTheme } from "@/stores/themeStore";
import { useSettings } from "@/stores/settingsStore";
import { applyTheme } from "@/lib/theme/apply";
import { getImage } from "@/lib/storage/imageStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const activeTheme = useTheme((s) => s.activeTheme);
  const activeId = useTheme((s) => s.activeId);
  const customs = useTheme((s) => s.customs);
  const theme = activeTheme();
  const [bgUrl, setBgUrl] = useState<string | null>(null);

  // Hydrate persisted theme/customs + settings after mount so the first render matches SSR HTML.
  useEffect(() => {
    useTheme.getState().reload();
    useSettings.getState().reload();
  }, []);

  useEffect(() => {
    if (theme) applyTheme(theme, document.documentElement);
  }, [theme, activeId, customs]);

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    const ref = theme?.background?.imageRef;
    if (ref) {
      getImage(ref).then((blob) => {
        if (cancelled || !blob || typeof URL.createObjectURL !== "function") return;
        url = URL.createObjectURL(blob);
        setBgUrl(url);
      });
    } else {
      setBgUrl(null);
    }
    return () => {
      cancelled = true;
      if (url && typeof URL.revokeObjectURL === "function") URL.revokeObjectURL(url);
    };
  }, [theme?.background?.imageRef, activeId]);

  const bg = theme?.background;
  return (
    <>
      {bgUrl && bg && (
        <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: -1 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${bgUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: `blur(${bg.blur}px)`,
              transform: "scale(1.1)",
            }}
          />
          <div
            style={{ position: "absolute", inset: 0, background: "var(--bg)", opacity: bg.overlayOpacity }}
          />
        </div>
      )}
      {children}
    </>
  );
}
