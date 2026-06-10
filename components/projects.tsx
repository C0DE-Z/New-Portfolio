import { useEffect, useState } from "react";
import Card from "./ui/card";
import { motion } from "framer-motion";

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  readmeImage?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Projects() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch('https://api.github.com/users/C0DE-Z/repos');
        if (!response.ok) {
          throw new Error(`GitHub API responded with ${response.status}`);
        }
        const data = await response.json();
        const filteredRepos = data
          .filter((repo: GitHubRepo) => !['New-Portfolio', 'hypixel-plus.github.io', 'Absolutelib'].includes(repo.name))
          .map((repo: GitHubRepo) => ({
            name: repo.name,
            description: repo.description,
            html_url: repo.html_url,
            readmeImage: undefined,
          }));
        setRepos(filteredRepos);
      } catch (error) {
        console.error('Error fetching repositories:', error);
        setErrorMessage('Failed to load repositories. Please try again later.');
        setRepos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, []);

  const displayedRepos = showAll ? repos : repos.slice(0, 6);


  return (
    <div className="relative flex flex-col items-center justify-center p-8 sm:p-20 gap-16">
      <div className="w-full max-w-7xl">
        <div className="text-center mb-16">
          <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase block mb-2">Portfolio Showcase</span>
          <h2 className="text-[2.5rem] sm:text-[3.5rem] font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-300">
            Projects &amp; Open Source
          </h2>
        </div>

        <motion.div
          layout
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {/* Static Projects */}
          <motion.div variants={item}>
            <Card
              title="AbsoluteLib V2"
              description="A custom Java utility and controls library for FRC Team 4308. Features a multi-joint Inverse Kinematics (IK) solver, unified motor/encoder wrappers, and physics-accurate simulation support."
              link="https://github.com/Team4308/absolutelib"
              btn="View Source"
              badge="Robotics"
            />
          </motion.div>
          <motion.div variants={item}>
            <Card
              title="This Website!"
              description="My personal developer portfolio. Built with Next.js, Tailwind CSS, Three.js, and Framer Motion, featuring 3D visualization, interactive CLI, and mini-games."
              link="https://github.com/C0DE-Z/New-Portfolio"
              btn="View Source"
              badge="Web App"
            />
          </motion.div>
          <motion.div variants={item}>
            <Card
              title="Hypixel Plus"
              description="A Minecraft (1.8.9) Forge Mod that aims to save players countless hours of grinding and wasting time, instantly skipping to the good part of Skyblock."
              link="https://hypixel-plus.vercel.app"
              btn="Visit"
              badge="Mod"
            />
          </motion.div>
          <motion.div variants={item}>
            <Card
              title="Fpv Drones!"
              description="I build FPV drones in real life. My main build uses a SpeedyBee F405 V3 stack along with high-performance custom components."
              link="./fpv"
              btn="Read More"
              badge="Hardware"
            />
          </motion.div>
          <motion.div variants={item}>
            <Card
              title="My Games"
              description="A showcase of various games I have designed and programmed using the Unity engine and Roblox platform."
              link="./games"
              btn="Explore"
              badge="Games"
            />
          </motion.div>
          <motion.div variants={item}>
            <Card
              title="Quick Note"
              description="A simple local-storage note taking web application built for the Hack Club High Seas event."
              link="https://speedynotes.vercel.app"
              btn="Visit"
              badge="Web App"
            />
          </motion.div>

          {/* Dynamic GitHub Repos */}
          {!loading && displayedRepos.map((repo, index) => (
            <motion.div key={index} variants={item} layout>
              <Card
                title={repo.name}
                description={repo.description || "No description available"}
                link={repo.html_url}
                btn="View on GitHub"
                badge="GitHub"
                tooltipText="This project was automatically pulled from my GitHub profile"
              />
            </motion.div>
          ))}
        </motion.div>

        {repos.length > 0 && (
          <div className="flex justify-center mt-12 relative z-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3 bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800/80 text-white rounded-full transition-all duration-300 shadow-lg flex items-center gap-2 cursor-pointer font-mono text-xs uppercase tracking-wider"
            >
              {showAll ? 'Show Less' : 'Show GitHub Repositories'}
            </button>
          </div>
        )}
        {errorMessage && (
          <p className="text-red-500 mt-4 text-center">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}