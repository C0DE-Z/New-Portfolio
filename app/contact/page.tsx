import { WipeReveal, WipeLink } from "@/app/components/wipe";

export const metadata = { title: "Code-Z | Contact" };

export default function Contact() {
  return (
    <main className="screen">
      <WipeReveal />
      <div className="center list contact">
        <p className="prompt">social</p>
        <ul>
          <li>
            <a href="mailto:C0DEZ3Y@gmail.com">C0DEZ3Y@gmail.com</a>
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

        </ul>
        <WipeLink href="/" className="back">
          &lt; back
        </WipeLink>
      </div>
    </main>
  );
}
