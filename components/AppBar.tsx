"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: { href: string; label: string }[] = [
  { href: "/", label: "test" },
  { href: "/lessons", label: "lessons" },
  { href: "/themes", label: "themes" },
  { href: "/stats", label: "stats" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppBar() {
  const pathname = usePathname() ?? "/";
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-6)",
        paddingBottom: "var(--space-4)",
        marginBottom: "var(--space-8)",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <Link href="/" aria-label="thai-type home" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 2 }}>
        <span style={{ fontWeight: 700, fontSize: 18, color: "var(--text-typed)", letterSpacing: -0.3 }}>thai</span>
        <span style={{ fontWeight: 700, fontSize: 18, color: "var(--accent)", letterSpacing: -0.3 }}>type</span>
      </Link>

      <nav aria-label="Primary" style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="nav-link"
              data-active={active ? "true" : "false"}
            >
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/settings"
          aria-label="settings"
          aria-current={isActive(pathname, "/settings") ? "page" : undefined}
          className="nav-link nav-icon"
          data-active={isActive(pathname, "/settings") ? "true" : "false"}
        >
          {/* gear icon (inline SVG, not emoji) */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
      </nav>
    </header>
  );
}
