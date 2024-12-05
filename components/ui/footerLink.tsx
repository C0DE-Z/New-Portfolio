import { IconType } from "react-icons";

export default function FooterLink({ href, icon: Icon, text }: { href: string; icon: IconType; text: string }) {
    return (
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href={href}
        target=""
        rel=""
      >
        <Icon className="text-lg" />
        {text}
      </a>
    );
  }
  