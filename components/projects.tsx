import { useEffect, useState } from "react";
import Card from "./ui/card";
import { GitHubRepoFetcher } from '@c0dez/github-repo-fetcher';

interface GitHubRepo {
    name: string;
    description: string | null;
    html_url: string;
    readmeImage?: string;
}

export default function Projects() {
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const fetcher = new GitHubRepoFetcher();
                const repositories = await fetcher.getReposWithReadme('C0DE-Z');
                
                const filteredRepos = repositories
                    .filter(repo => !['New-Portfolio', 'hypixel-plus.github.io'].includes(repo.name))
                    .map(repo => ({
                        name: repo.name,
                        description: repo.description,
                        html_url: repo.html_url,
                        readmeImage: undefined // Add if you implement readme image fetching
                    }));
                setRepos(filteredRepos);
            } catch (error) {
                console.error('Error fetching repositories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRepos();
    }, []);

    const displayedRepos = showAll ? repos : repos.slice(0, 3);

    return(
        <div className="relative grid grid-rows items-center justify-center p-8 sm:p-20">
            <h1 className="text-[2rem] text-center sm:text-[3rem] transition-colors mb-8">My Projects</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Static cards */}
                <Card 
                    title="This Website!"
                    description="Made with NextJs, Tailwind, and ThreeJS. It's all open source. Check out the source code!"
                    link="https://github.com/C0DE-Z/New-Portfolio"
                    btn="View Source"
                    badge="Featured"
                />
                <Card 
                    title="Fpv Drones!"
                    description="I Build Fpv Drones in real life, My main build uses a SpeedyBee 405v3 for its stack and some other components."
                    link="./fpv"
                    btn="Read More"
                    badge="Hardware"
                />
                <Card 
                    title="My Games"
                    description="I create games for people. Some made on Unity, others on Roblox. Please check out a list of games that i've worked worked on."
                    link="./games"
                    btn="Explore"
                    badge="Games"
                />
                <Card 
                    title="Hypixel Plus"
                    description="A Minecraft (1.8.9) Forge Mod that aims to save players countless hours of grinding and wasting time, instantly skipping to the good part of Skyblock. "
                    link="https://hypixel-plus.vercel.app"
                    btn="Visit"
                    badge="Mod"
                />
                <Card 
                    title="Quick Note"
                    description="A simple note taking app that allows you to take notes and save them for later. all data is locally stored with cookies! Specifically built for High Seas from Hack Club"
                    link="https://speedynotes.vercel.app"
                    btn="Visit"
                    badge="Web App"
                />

                {/* GitHub repos */}
                {!loading && displayedRepos.map((repo, index) => (
                    <Card 
                        key={index}
                        title={repo.name}
                        description={repo.description || "No description available"}
                        link={repo.html_url}
                        btn="View on GitHub"
                        badge="GitHub"
                        tooltipText="This project was automatically pulled from my GitHub profile"
                    />
                ))}
            </div>

            {repos.length > 3 && (
                <button 
                    onClick={() => setShowAll(!showAll)}
                    className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    {showAll ? 'Show Less' : 'Show More Projects'}
                </button>
            )}
        </div>
    )
}