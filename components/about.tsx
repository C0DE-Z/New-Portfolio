import { useEffect, useState } from "react";
import { GitHubRepoFetcher } from '@c0dez/github-repo-fetcher';
import { 
    FaJs, FaReact, FaPython, FaJava, FaNodeJs, FaHtml5, 
    FaGithub, FaFigma, FaServer, FaTerminal, FaCode
} from 'react-icons/fa';
import { 
    SiTypescript, SiNextdotjs, 
    SiIntellijidea, SiBlender, SiTailwindcss, SiDocker
} from 'react-icons/si';

interface GithubStats {
    totalStars?: number;
    contributions?: number;
    languages?: Record<string, number>;
    public_repos?: number;
    followers?: number;
    following?: number;
    // ...other fields as needed
}

export default function About() {
    const [githubStats, setGithubStats] = useState<GithubStats>({});
    const [linesOfCode, setLinesOfCode] = useState<number | null>(null);

    useEffect(() => {
        const fetchLangsAndStats = async () => {
            try {
                const fetcher = new GitHubRepoFetcher();
                const stats = await fetcher.getUserStats('C0DE-Z');
                // Languages
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const sortedLangs = Object.entries(stats.languages || {})
                    .sort((a, b) => b[1] - a[1])
                    .map(([lang]) => lang)
                    .slice(0, 6);
                setGithubStats(stats);

                const totalBytes = Object.values(stats.languages || {}).reduce((a, b) => a + (typeof b === "number" ? b : 0), 0);
                setLinesOfCode(Math.round(totalBytes / 50));
            } catch (e) {
                console.log(e);
            }
        };
        fetchLangsAndStats();
    }, []);

    // Function to get icon for each tech
    const getTechIcon = (tech: string) => {
        switch(tech.toLowerCase()) {
            case 'javascript': return <FaJs className="text-yellow-300" />;
            case 'typescript': return <SiTypescript className="text-blue-400" />;
            case 'python': return <FaPython className="text-green-400" />;
            case 'react': return <FaReact className="text-blue-400" />;
            case 'nextjs': return <SiNextdotjs className="text-white" />;
            case 'nodejs': return <FaNodeJs className="text-green-500" />;
            case 'java': return <FaJava className="text-red-400" />;
            case 'html/css': return <FaHtml5 className="text-orange-400" />;
            case 'tailwind': return <SiTailwindcss className="text-cyan-400" />;
            case 'docker': return <SiDocker className="text-blue-500" />;
            default: return <FaCode />;
        }
    };

    return (
        <section className="w-full py-16 px-4 sm:px-12 flex flex-col items-center bg-transparent">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-2 tracking-tight">
                About Me
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-8 mx-auto" />
            <div className="max-w-5xl w-full flex flex-col md:flex-row gap-10 md:gap-20 items-center justify-center">
                {/* Left: Intro */}
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4">
                    <div className="flex items-center gap-2 text-lg text-blue-400 font-semibold">
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="inline-block"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="currentColor"/></svg>
                        Canada
                    </div>
                    <h3 className="text-2xl font-semibold text-neutral-100">
                        Hey, I&apos;m Nicholas
                    </h3>
                    <p className="text-lg text-neutral-300">
                        Full-Stack Web Developer &amp; Robotics Enthusiast
                    </p>
                    <p className="text-base text-neutral-400 max-w-md">
                        I build modern web apps, experiment with robotics, and fly FPV drones. I&apos;m passionate about technology, open source, and creative problem solving. Always learning, always building.
                    </p>
                    
                    {/* GitHub Stats */}
                    <div className="mt-6 flex flex-wrap gap-4 justify-center md:justify-start">
                        {typeof linesOfCode === "number" && (
                            <div className="bg-blue-900/40 px-4 py-2 rounded-lg text-blue-200 text-xs font-semibold flex flex-col items-center">
                                <span className="text-lg font-bold">{linesOfCode.toLocaleString()}</span>
                                <span className="uppercase tracking-widest">Lines of Code</span>
                            </div>
                        )}
                        {githubStats.totalStars !== undefined && (
                            <div className="bg-yellow-900/40 px-4 py-2 rounded-lg text-yellow-200 text-xs font-semibold flex flex-col items-center">
                                <span className="text-lg font-bold">{githubStats.totalStars.toLocaleString()}</span>
                                <span className="uppercase tracking-widest">Stars</span>
                            </div>
                        )}
                        {githubStats.public_repos !== undefined && (
                            <div className="bg-purple-900/40 px-4 py-2 rounded-lg text-purple-200 text-xs font-semibold flex flex-col items-center">
                                <span className="text-lg font-bold">{githubStats.public_repos}</span>
                                <span className="uppercase tracking-widest">Repos</span>
                            </div>
                        )}
                        {githubStats.followers !== undefined && (
                            <div className="bg-green-900/40 px-4 py-2 rounded-lg text-green-200 text-xs font-semibold flex flex-col items-center">
                                <span className="text-lg font-bold">{githubStats.followers}</span>
                                <span className="uppercase tracking-widest">Followers</span>
                            </div>
                        )}
                        {githubStats.following !== undefined && (
                            <div className="bg-pink-900/40 px-4 py-2 rounded-lg text-pink-200 text-xs font-semibold flex flex-col items-center">
                                <span className="text-lg font-bold">{githubStats.following}</span>
                                <span className="uppercase tracking-widest">Following</span>
                            </div>
                        )}
                        {githubStats.contributions !== undefined && (
                            <div className="bg-blue-800/40 px-4 py-2 rounded-lg text-blue-100 text-xs font-semibold flex flex-col items-center">
                                <span className="text-lg font-bold">{githubStats.contributions.toLocaleString()}</span>
                                <span className="uppercase tracking-widest">Contributions</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Right: Skills & Interests */}
                <div className="flex-1 flex flex-col items-center md:items-start gap-6">
                    {/* Programming Languages */}
                    <div>
                        <span className="text-sm uppercase tracking-widest text-blue-400 font-semibold mb-2 flex items-center gap-2">
                            <FaCode className="text-blue-400" /> Programming Languages
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-3 py-1 rounded-full bg-blue-700/20 text-yellow-300 text-xs font-semibold flex items-center gap-1.5">
                                {getTechIcon('javascript')} JavaScript
                            </span>
                            <span className="px-3 py-1 rounded-full bg-blue-700/20 text-blue-300 text-xs font-semibold flex items-center gap-1.5">
                                {getTechIcon('typescript')} TypeScript
                            </span>
                            <span className="px-3 py-1 rounded-full bg-green-700/20 text-green-200 text-xs font-semibold flex items-center gap-1.5">
                                {getTechIcon('python')} Python
                            </span>
                            <span className="px-3 py-1 rounded-full bg-red-700/20 text-red-200 text-xs font-semibold flex items-center gap-1.5">
                                {getTechIcon('java')} Java
                            </span>
                            <span className="px-3 py-1 rounded-full bg-orange-700/20 text-orange-200 text-xs font-semibold flex items-center gap-1.5">
                                {getTechIcon('html/css')} HTML/CSS
                            </span>
                        </div>
                    </div>
                    
                    {/* Frameworks & Tools */}
                    <div>
                        <span className="text-sm uppercase tracking-widest text-blue-400 font-semibold mb-2 flex items-center gap-2">
                            <FaServer className="text-blue-400" /> Frameworks &amp; Libraries
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-3 py-1 rounded-full bg-purple-700/20 text-purple-200 text-xs font-semibold flex items-center gap-1.5">
                                {getTechIcon('react')} React
                            </span>
                            <span className="px-3 py-1 rounded-full bg-gray-700/30 text-gray-200 text-xs font-semibold flex items-center gap-1.5">
                                {getTechIcon('nextjs')} Next.js
                            </span>
                            <span className="px-3 py-1 rounded-full bg-lime-700/20 text-lime-200 text-xs font-semibold flex items-center gap-1.5">
                                {getTechIcon('nodejs')} Node.js
                            </span>
                            <span className="px-3 py-1 rounded-full bg-cyan-700/20 text-cyan-200 text-xs font-semibold flex items-center gap-1.5">
                                {getTechIcon('tailwind')} Tailwind
                            </span>
                        </div>
                    </div>
                    
                    {/* Development Tools */}
                    <div>
                        <span className="text-sm uppercase tracking-widest text-blue-400 font-semibold mb-2 flex items-center gap-2">
                            <FaTerminal className="text-blue-400" /> Dev Tools
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-3 py-1 rounded-full bg-blue-700/20 text-blue-200 text-xs font-semibold flex items-center gap-1.5">
                                <a className="text-blue-400" /> VS Code
                            </span>
                            <span className="px-3 py-1 rounded-full bg-purple-700/20 text-purple-200 text-xs font-semibold flex items-center gap-1.5">
                                <SiIntellijidea className="text-purple-300" /> IntelliJ
                            </span>
                            <span className="px-3 py-1 rounded-full bg-gray-700/30 text-gray-200 text-xs font-semibold flex items-center gap-1.5">
                                <FaGithub className="text-white" /> GitHub
                            </span>
                            <span className="px-3 py-1 rounded-full bg-blue-700/20 text-blue-200 text-xs font-semibold flex items-center gap-1.5">
                                {getTechIcon('docker')} Docker
                            </span>
                            <span className="px-3 py-1 rounded-full bg-pink-700/20 text-pink-200 text-xs font-semibold flex items-center gap-1.5">
                                <FaFigma className="text-pink-300" /> Figma
                            </span>
                            <span className="px-3 py-1 rounded-full bg-orange-700/20 text-orange-200 text-xs font-semibold flex items-center gap-1.5">
                                <SiBlender className="text-orange-300" /> Blender
                            </span>
                        </div>
                    </div>
                    
                    {/* Interests */}
                    <div>
                        <span className="text-sm uppercase tracking-widest text-blue-400 font-semibold mb-2">Interests</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-2 py-1 rounded bg-neutral-800/70 text-xs text-neutral-200">Robotics</span>
                            <span className="px-2 py-1 rounded bg-neutral-800/70 text-xs text-neutral-200">FPV Drones</span>
                            <span className="px-2 py-1 rounded bg-neutral-800/70 text-xs text-neutral-200">Open Source</span>
                            <span className="px-2 py-1 rounded bg-neutral-800/70 text-xs text-neutral-200">UI/UX</span>
                        </div>
                    </div>
                    
                    {/* GitHub Languages */}
                    
                    
                </div>
            </div>
            <div className="mt-10 text-center text-lg text-blue-400 font-medium">
                Let&apos;s build something amazing together!
            </div>
        </section>
    )
}
