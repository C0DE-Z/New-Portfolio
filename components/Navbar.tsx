"use client"
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaHome, FaUser, FaCode, FaEnvelope, FaRobot } from "react-icons/fa";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { name: "Home", link: "/#hero", icon: <FaHome /> },
  { name: "About", link: "/#about", icon: <FaUser /> },
  { name: "Robotics", link: "/#experience", icon: <FaRobot /> },
  { name: "Projects", link: "/#projects", icon: <FaCode /> },
  { name: "Contact", link: "/#contact", icon: <FaEnvelope /> },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll("section[id]").forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    if (pathname === "/") {
      e.preventDefault();
      const hash = link.replace("/", "");
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", hash);
      }
    }
  };

  return (
    <motion.div 
      initial={{ y: -100, x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="fixed top-6 left-1/2 z-50"
    >
      <nav className="flex gap-2 px-4 py-2 rounded-full bg-gray-900/50 backdrop-blur-md border border-gray-800 shadow-lg">
        {navItems.map((item) => {
          const isActive = pathname === "/" && activeSection === item.link.replace("/#", "");
          
          return (
            <Link
              key={item.name}
              href={item.link}
              className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive
                  ? "text-white bg-white/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              onClick={(e) => handleNavClick(e, item.link)}
            >
              <span className="text-lg sm:text-base">{item.icon}</span>
              <span className="hidden sm:block">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </motion.div>
  );
}
