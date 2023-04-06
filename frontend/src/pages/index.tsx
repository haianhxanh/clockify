import { Inter } from "next/font/google";
import Dashboard from "./dashboard";
import Projects from "./projects/Projects";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main>
      <Dashboard />
    </main>
  );
}
