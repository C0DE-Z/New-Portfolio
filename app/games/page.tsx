"use client"
import { motion } from "framer-motion";
import Card from "../../components/ui/card";
import GridBackground from "../../components/ui/grid-background";
import Navbar from "../../components/Navbar";
import Footer from "../../components/footer";

export default function Games() {
    const games = [
        {
            title: "Loaf Game",
            description: "A Roblox game about the famous cat model Dingus (Maxwell). Race against other players in this chaotic fun experience. Developed with Morning Dove Development team.",
            link: "https://www.roblox.com",
            btn: "Play Now",
            badge: "Roblox"
        },
        {
            title: "Untitled Soccer Game",
            description: "A casual Roblox soccer game created with friends for pure fun and chaos.",
            link: "https://www.roblox.com",
            btn: "Play Now",
            badge: "Roblox"
        },
        {
            title: "Free-Runner",
            description: "An open-city movement game made in Unity. Created in just one week for a game jam, featuring parkour mechanics.",
            link: "https://github.com/C0DE-Z",
            btn: "View Project",
            badge: "Unity"
        },
        {
            title: "Pixel Racer",
            description: "A retro-style 2D racing game developed in Unity. Created as a final project in one week.",
            link: "https://github.com/C0DE-Z",
            btn: "View Source",
            badge: "Unity"
        }
    ];

    return (
        <main className="min-h-screen bg-background relative overflow-hidden flex flex-col font-sans">
            <Navbar />
            <GridBackground />
            
            <section className="pt-28 pb-12 px-4 flex flex-col items-center text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center gap-2"
                >
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-100">Game Library</h1>
                    <p className="text-neutral-400 text-sm max-w-md">
                        Explore various games developed for desktop, web, and Roblox platforms.
                    </p>
                </motion.div>
            </section>

            {/* Display Games Grid */}
            <section className="flex-grow px-4 sm:px-8 lg:px-16 pb-20 z-10 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl w-full mx-auto"
                >
                    {games.map((game, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                            <Card 
                                title={game.title}
                                description={game.description}
                                link={game.link}
                                btn={game.btn}
                                badge={game.badge}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            <div className="z-10 relative">
                <Footer />
            </div>
        </main>
    );
}