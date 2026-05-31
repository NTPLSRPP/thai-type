import { TestScreen } from "@/components/TestScreen";
import { NavBar } from "@/components/NavBar";

export default function Home() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "8vh 24px" }}>
      <NavBar />
      <h1 style={{ color: "var(--accent)", fontSize: 22, marginBottom: 32 }}>thai-type</h1>
      <TestScreen />
    </main>
  );
}
