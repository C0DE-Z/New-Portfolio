"use client"
import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";

export default function CodePage() {
    const [input, setInput] = useState("");
    const [terminalLines, setTerminalLines] = useState<string[]>([
        "Terminal Session Started [v1.0.4]",
        "System: Active",
        "Type 'help' to see list of available commands.",
        ""
    ]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom of terminal
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [terminalLines]);

    // Keep focus on input
    const focusInput = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    useEffect(() => {
        focusInput();
    }, []);

    const addLines = (lines: string[]) => {
        setTerminalLines(prev => [...prev, ...lines]);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (commandHistory.length === 0) return;
            const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
            setHistoryIndex(newIndex);
            setInput(commandHistory[newIndex]);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex === -1) return;
            if (historyIndex === commandHistory.length - 1) {
                setHistoryIndex(-1);
                setInput("");
            } else {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            }
        }
    };

    const executeCommand = async (cmdString: string) => {
        const trimmed = cmdString.trim();
        if (!trimmed) return;

        // Save command to history
        setCommandHistory(prev => [...prev.filter(c => c !== trimmed), trimmed]);
        setHistoryIndex(-1);

        addLines([`$ ${trimmed}`]);

        const parts = trimmed.split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        switch (command) {
            case "help":
                addLines([
                    "Available Commands:",
                    "  help             Show this reference guide",
                    "  about            Print bio and overview of Nicholas",
                    "  skills           Print technical skill matrices",
                    "  drone            Print FPV telemetry and hangar specs",
                    "  access <code>    Authenticate and redirect to secure stash",
                    "  clear            Clear terminal display buffers"
                ]);
                break;
            case "about":
                addLines([
                    "Nicholas | Software Engineer & Robotics Developer",
                    "--------------------------------------------------",
                    "Location: Ontario, Canada",
                    "Interests: Full-Stack Engineering, Controls Systems (FRC), FPV Drone Design",
                    "Focus: Creating robust Web applications, debugging embedded electronics,",
                    "       and writing clean, low-latency control software.",
                    "Attending high school, active member of FRC Controls Team 4308."
                ]);
                break;
            case "skills":
                addLines([
                    "Technical Skill Matrix",
                    "--------------------------------------------------",
                    "Languages:      TypeScript, JavaScript, Python, Java, HTML/CSS",
                    "Frameworks:     Next.js, React, Node.js, Tailwind CSS",
                    "Robotics/Emb:   WPILib (FRC), Inverse Kinematics, Arduino",
                    "Dev Tools:      Docker, VS Code, Git/GitHub, Blender, Figma",
                    "Flight Systems: Betaflight, ExpressLRS, Analog VTX setups"
                ]);
                break;
            case "drone":
                addLines([
                    "FPV Quadcopter Telemetry: 5\" Freebird Freestyle",
                    "--------------------------------------------------",
                    "Frame:          TBS Source One V5 (Carbon Fiber)",
                    "Flight Controller/ESC: SpeedyBee F405 V3 Stack",
                    "Motors:         T-MOTOR Velox V3.0 (2207 - 1950KV)",
                    "Protocol:       ExpressLRS (ELRS) 2.4GHz Link",
                    "FPV Feed:       Analog VTX w/ BetaFPV VR03 Ground Recorder",
                    "Props:          Gemfan Hurricane 51466 Tri-blades",
                    "Battery:        4S / 6S LiPo (Voltage: ~15.2V - 22.8V)",
                    "Status:         Disarmed (Calibrated & Standby)"
                ]);
                break;
            case "clear":
                setTerminalLines([]);
                break;
            case "access":
            case "login":
                if (args.length === 0) {
                    addLines(["Error: Access code required. Usage: access <code>"]);
                    break;
                }
                const code = args.join(" ");
                setLoading(true);
                addLines(["Authenticating credentials..."]);

                try {
                    const res = await fetch("/api/stash", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: code })
                    });

                    if (res.redirected) {
                        addLines(["Success: Access granted. Redirecting..."]);
                        setTimeout(() => {
                            window.location.href = res.url;
                        }, 1000);
                        return;
                    }

                    if (!res.ok) {
                        addLines(["Access Denied: Invalid credentials."]);
                    }
                } catch {
                    addLines(["Network Error: Connection failed."]);
                } finally {
                    setLoading(false);
                }
                break;
            default:
                addLines([`Command not found: '${command}'. Type 'help' for assistance.`]);
                break;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        const cmd = input;
        setInput("");
        executeCommand(cmd);
    };

    return (
        <main className="min-h-screen bg-[#080808] text-neutral-300 font-mono flex flex-col relative">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-4 pt-24 pb-12 z-10 w-full max-w-4xl mx-auto">
                <div 
                    onClick={focusInput}
                    className="w-full flex-1 min-h-[450px] bg-[#0c0c0c] border border-neutral-800 rounded-lg flex flex-col overflow-hidden shadow-2xl cursor-text"
                >
                    {/* Terminal Window Title Bar */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-900 bg-[#0f0f0f] select-none">
                        <div className="flex space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                            <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                            <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                        </div>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-sans">developer_terminal</span>
                        <div className="w-12"></div>
                    </div>

                    {/* Terminal Window Content Buffer */}
                    <div 
                        ref={containerRef}
                        className="flex-1 p-6 overflow-y-auto space-y-1 text-sm leading-relaxed max-h-[500px]"
                    >
                        {terminalLines.map((line, idx) => (
                            <div key={idx} className="whitespace-pre-wrap">
                                {line}
                            </div>
                        ))}
                    </div>

                    {/* Terminal Prompt Bar */}
                    <form 
                        onSubmit={handleSubmit}
                        className="flex items-center px-6 py-4 border-t border-neutral-900 bg-[#0a0a0a]"
                    >
                        <span className="text-neutral-500 mr-2 select-none">$</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-grow bg-transparent text-neutral-200 border-none outline-none focus:ring-0 p-0 text-sm"
                            placeholder={loading ? "System processing..." : "Type command..."}
                            disabled={loading}
                            autoComplete="off"
                            spellCheck="false"
                            autoFocus
                        />
                    </form>
                </div>
            </div>
        </main>
    );
}
