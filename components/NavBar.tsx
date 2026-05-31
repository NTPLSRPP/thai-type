import Link from "next/link";

export function NavBar() {
  return (
    <nav style={{ display: "flex", gap: 20, marginBottom: 32, fontSize: 14 }}>
      <Link href="/" style={{ color: "var(--text)", textDecoration: "none" }}>
        test
      </Link>
      <Link href="/lessons" style={{ color: "var(--text)", textDecoration: "none" }}>
        lessons
      </Link>
      <Link href="/themes" style={{ color: "var(--text)", textDecoration: "none" }}>
        themes
      </Link>
      <Link href="/stats" style={{ color: "var(--text)", textDecoration: "none" }}>
        stats
      </Link>
    </nav>
  );
}
