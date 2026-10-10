import { WipeReveal, WipeLink } from "../wipe";

const projects = [
  { name: "absolute lib", href: "https://github.com/Team4308/absolutelib" },
  { name: "z", href: "https://github.com/C0DE-Z/Z" },
  { name: "ecstasis", href: "https://github.com/C0DE-Z/Ecstasis" },
];

export const metadata = { title: "Code-Z | Projects" };

export default function Projects() {
  return (
    <main className="screen">
      <WipeReveal />
      <div className="center list">
        <p className="prompt">things</p>
        <ul>
          {projects.map((p) => (
            <li key={p.name}>
              <a href={p.href} target="_blank" rel="noopener noreferrer">
                {p.name}
              </a>
            </li>
          ))}
        </ul>
        <a className="button" href="https://github.com/C0DE-Z" target="_blank" rel="noopener noreferrer">
          github
        </a>
        <WipeLink href="/" className="back">
          &lt; back
        </WipeLink>
      </div>
    </main>
  );
}
