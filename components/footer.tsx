import { FaGithub, FaInfoCircle, FaProjectDiagram } from "react-icons/fa";
import FooterLink from "./ui/footerLink";
export default function Footer() {
  return (
    <footer>
        <footer className="flex gap-6 flex-wrap items-center justify-center pb-[4.5rem]">
              <FooterLink href="#about" icon={FaInfoCircle} text="About" />
              <FooterLink href="#projects" icon={FaProjectDiagram} text="Projects" />
              <FooterLink href="https://github.com/C0DE-Zs" icon={FaGithub} text="Source Code" />
        </footer>
    </footer>
  );
}