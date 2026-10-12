import Scramble from "./scramble";
import { WipeLink, WipeReveal } from "./wipe";

export default function Home() {
  return (
    <main className="screen">
      <WipeReveal />
      <div className="center rounded">
        <h1>Hey, I&apos;m <Scramble base="Code-Z" alt="Nick" /></h1>
        <nav className="links">
          <WipeLink href="/projects">things</WipeLink>
          <WipeLink href="/contact">social</WipeLink>
          <WipeLink href="/code">words</WipeLink>
        </nav>
      </div>
    </main>
  );
}


