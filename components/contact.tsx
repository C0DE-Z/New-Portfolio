import { useState } from "react";
import { motion } from "framer-motion";
import { FaDiscord, FaGithub, FaEnvelope, FaCopy, FaCheck, FaExternalLinkAlt } from "react-icons/fa";

interface ContactCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    link?: string;
    color: string;
}

function ContactCard({ icon, title, value, link, color }: ContactCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="relative group p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 w-full max-w-sm"
        >
            <div className={`absolute top-0 left-0 w-full h-1 rounded-t-2xl bg-gradient-to-r ${color} opacity-50 group-hover:opacity-100 transition-opacity`} />
            
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/5 text-2xl ${color.replace('from-', 'text-').split(' ')[0]}`}>
                    {icon}
                </div>
                {link && (
                    <a 
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                    >
                        <FaExternalLinkAlt className="text-sm" />
                    </a>
                )}
            </div>

            <h3 className="text-lg font-semibold mb-1 text-foreground">{title}</h3>
            
            <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-black/20 border border-white/5 group-hover:border-white/10 transition-colors">
                <code className="text-sm font-mono text-muted-foreground truncate">
                    {value}
                </code>
                <button
                    onClick={handleCopy}
                    className="p-2 rounded-md hover:bg-white/10 text-muted-foreground hover:text-white transition-colors relative"
                    title="Copy to clipboard"
                >
                    {copied ? <FaCheck className="text-green-400" /> : <FaCopy />}
                </button>
            </div>
        </motion.div>
    );
}

export default function Contact() {
    return (
        <div className="relative flex flex-col items-center justify-center p-8 sm:p-20">
            <div className="w-full max-w-5xl">
                <div className="text-center mb-16">
                    <h1 className="text-[2.5rem] sm:text-[3.5rem] font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-300">
                        Get In Touch
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Feel free to reach out! I&apos;m always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
                    <ContactCard 
                        icon={<FaDiscord />}
                        title="Discord"
                        value="Codezey"
                        color="from-indigo-500 to-blue-500"
                    />
                    <ContactCard 
                        icon={<FaEnvelope />}
                        title="Email"
                        value="C0DEz3Y@gmail.com"
                        link="mailto:C0DEz3Y@gmail.com"
                        color="from-red-500 to-pink-500"
                    />
                    <ContactCard 
                        icon={<FaGithub />}
                        title="GitHub"
                        value="C0DE-Z"
                        link="https://github.com/C0DE-Z"
                        color="from-gray-500 to-slate-500"
                    />
                </div>
            </div>
        </div>
    );
}
