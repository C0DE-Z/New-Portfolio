
import Card from "./ui/card"

export default function Projects() {
    return(
        <div className="relative grid grid-rows items-center justify-center p-8 sm:p-20">
            <h1 className="text-[2rem] text-center  sm:text-[3rem] transition-colors mb-8">My Projects</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card 
                  title="This Website!"
                  description="Made with NextJs, Tailwind, and ThreeJS. It's all open source. Check out the source code!"
                  link="https://github.com/C0DE-Z/New-Portfolio"
                  btn = "View Source"
                />
                 <Card 
                  title="Fpv Drones!"
                  description="I Build Fpv Drones in real life, My main build uses a SpeedyBee 405v3 for its stack and some other components."
                  link="./fpv"
                  btn = "Read More"
                />

                <Card 
                  title="My Games"
                  description="I create games for people. Some made on Unity, others on Roblox. Please check out a list of games that i've worked worked on."
                  link="./games"
                  btn = "Explore"
                />
                <Card 
                  title="Hypixel Plus"
                  description="A Minecraft (1.8.9) Forge Mod that aims to save players countless hours of grinding and wasting time, instantly skipping to the good part of Skyblock. "
                  link="https://hypixel-plus.vercel.app"
                  btn="Visit"
                />

                 <Card 
                  title="Quick Note"
                  description="A simple note taking app that allows you to take notes and save them for later. all data is locally stored with cookies! Specifically  built for High Seas from Hack Club"
                  link="https://speedynotes.vercel.app"
                  btn="Visit"
                />

            </div>
        </div>
    )
}