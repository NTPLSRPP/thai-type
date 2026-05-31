import { TestScreen } from "@/components/TestScreen";

export default function Home() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "10vh 24px" }}>
      <h1 style={{ color: "var(--accent)", fontSize: 22, marginBottom: 40 }}>thai-type</h1>
      <TestScreen />
    </main>
  );
}
