import { WipeReveal, WipeLink } from "@/app/components/wipe";

export const metadata = {
  title: "Code-Z | Contact",
  description: "Contact Code-Z and find public profiles.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <main className="screen">
      <WipeReveal />
      <div className="center list contact">
        <h1 className="prompt">social</h1>
        <ul>
          <li>
            <a href="mailto:C0DEZ3Y@gmail.com">email</a>
          </li>
          <li>
            <a href="https://github.com/C0DE-Z" target="_blank" rel="noopener noreferrer">
              github
            </a>
          </li>
          <li>
            <a href="https://leetcode.com/u/C0DE-Z/" target="_blank" rel="noopener noreferrer">
              leetcode
            </a>
          </li>
                <li>
            <a href="https://discord.com/users/333616865781743616" target="_blank" rel="noopener noreferrer">
              discord
            </a>
          </li>
          
        </ul>
        <WipeLink href="/" className="back">
          &lt; back
        </WipeLink>
      </div>
    </main>
  );
}
