"use client"
import { FaGithub, FaArrowDown } from "react-icons/fa";
import GridBackground from "./ui/grid-background";
import TextEffect from "./ui/textEffect";
import { SiLeetcode } from "react-icons/si";
import Scene from "./Scene";
import { motion } from "framer-motion";

interface HeroProps {
    onLoadComplete?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onLoadComplete }) => {
    return (
        <div className="relative min-h-screen flex flex-col justify-center overflow-hidden">
            <GridBackground />
            
            <div className="relative flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 pt-28 md:pt-0 pb-16 gap-12 z-10">
                {/* Left: Headline & Bio Info */}
                <header className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4 max-w-xl">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-100">
                        Hello I&apos;m
                    </h1>
                    <TextEffect title="Nicholas " desired="Code-Z" subtitle="" />

                    <p className="text-sm sm:text-base font-mono text-neutral-400 mt-2">
                        Full Stack Web-Developer &amp; Robotics Enthusiast.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-4 justify-center md:justify-start">
                        <a
                            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-neutral-200 text-neutral-900 gap-2 hover:bg-neutral-300 text-sm sm:text-base h-11 px-6 font-medium"
                            href="https://github.com/C0DE-Z"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FaGithub className="text-lg" />
                            Github
                        </a>
                        
                        <a
                            className="rounded-full border border-solid border-neutral-800 transition-colors flex items-center justify-center bg-neutral-900/60 text-neutral-300 gap-2 hover:bg-neutral-800 hover:border-neutral-750 text-sm sm:text-base h-11 px-6 font-medium"
                            href="https://leetcode.com/C0DE-Z"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <SiLeetcode className="text-lg" />
                            LeetCode
                        </a>
                    </div>
                </header>

                {/* Right: Responsive 3D Scene View */}
                <main className="flex-1 w-full h-[40vh] md:h-[65vh] relative flex items-center justify-center bg-transparent">
                    <Scene onLoadComplete={onLoadComplete} />
                </main>
            </div>

            {/* Scroll Indicator */}
            <motion.div 
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                <FaArrowDown className="text-xl text-neutral-500" />
            </motion.div>
        </div>
    );
};

export default Hero;