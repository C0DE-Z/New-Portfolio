"use client"
import { useState, useEffect } from "react";

export default function CodePage() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [terminalLines, setTerminalLines] = useState<string[]>([
        "$ ./access_system",
        "TERMINAL v3.4.2 - SECURE ACCESS MODULE",
        "[ SYSTEM READY ]",
    ]);

    // Type-writer effect for the terminal
    useEffect(() => {
        const timer = setTimeout(() => {
            setTerminalLines(prev => [...prev, "$ Waiting for authorization code..."]);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const addTerminalLine = (line: string) => {
        setTerminalLines(prev => [...prev, line]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        // Add terminal line effects
        addTerminalLine(`$ Authenticating: ${code.replace(/./g, '*')}`);
        addTerminalLine("$ Running validation checks...");
        
        try {
            const res = await fetch("/api/stash", {  // Changed from "/api/stash/route" to "/api/stash"
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: code })
            });
            
            console.log("Response status:", res.status);
            console.log("Response redirected:", res.redirected);
            console.log("Response URL:", res.url);
            
            if (res.redirected) {
                addTerminalLine("$ Authentication successful");
                addTerminalLine("$ Granting access...");
                setTimeout(() => {
                    window.location.href = res.url;
                }, 1500);
                return;
            }
            
            // Handle error responses
            if (!res.ok) {
                addTerminalLine("$ Authentication failed");
                addTerminalLine("$ Access denied");
                
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await res.json();
                    setError(errorData.error || "Invalid code.");
                } else {
                    setError("Invalid code.");
                }
            }
        } catch (error) {
            addTerminalLine("$ Connection error");
            console.error("Network error:", error);
            setError("Network error.");
        }
        
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center p-4 overflow-hidden">
            {/* Matrix-like background effect */}
            <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
                <div className="matrix-rain" />
            </div>
            
            {/* Terminal window */}
            <div className="w-full max-w-2xl border border-green-500 rounded-md bg-black bg-opacity-80 backdrop-blur-sm overflow-hidden shadow-[0_0_20px_rgba(0,255,0,0.3)]">
                {/* Terminal header */}
                <div className="flex items-center px-4 py-2 bg-black border-b border-green-800">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="mx-auto text-xs text-center text-green-400 tracking-widest">SECURE-ACCESS-TERMINAL</div>
                </div>
                
                {/* Terminal body */}
                <div className="p-6 bg-black bg-opacity-80">
                    {/* Terminal output */}
                    <div className="mb-8 text-sm">
                        {terminalLines.map((line, index) => (
                            <div key={index} className="mb-1 typing-animation">
                                {line}
                            </div>
                        ))}
                    </div>
                    
                    {/* Input form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center">
                            <span className="text-green-400 mr-2">$</span>
                            <input
                                type="text"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                className="flex-1 bg-transparent border-b border-green-500 text-green-400 px-2 py-1 focus:outline-none focus:border-green-300 tracking-wider"
                                placeholder="Enter access code"
                                autoFocus
                                disabled={loading}
                                spellCheck="false"
                                autoComplete="off"
                            />
                        </div>
                        
                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full border border-green-500 hover:bg-green-500 hover:bg-opacity-20 transition-all duration-300 text-green-400 py-2 px-4 tracking-widest"
                            >
                                {loading ? 'PROCESSING...' : 'AUTHENTICATE'}
                            </button>
                            
                            {error && (
                                <div className="text-red-500 text-sm text-center animate-pulse">
                                    {error}
                                </div>
                            )}
                        </div>
                    </form>
                    
                    {/* Terminal footer */}
                    <div className="mt-6 pt-4 border-t border-green-900 text-xs text-green-700 flex justify-between">
                        <span>[SYS:ACTIVE]</span>
                        <span>|SECURE|</span>
                        <span className="animate-pulse">[STANDBY]</span>
                    </div>
                </div>
            </div>
            
            {/* CSS for matrix rain effect */}
            <style jsx>{`
                .matrix-rain {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(0deg, 
                        rgba(0, 255, 0, 0.1) 25%, 
                        rgba(0, 0, 0, 0) 100%),
                        repeating-linear-gradient(0deg, transparent 0px, 
                        rgba(0, 255, 0, 0.05) 1px, transparent 2px, 
                        transparent 20px);
                    animation: scroll 10s linear infinite;
                }

                @keyframes scroll {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 1000px; }
                }
                
                .typing-animation {
                    overflow: hidden;
                    border-right: 2px solid transparent;
                    white-space: nowrap;
                    animation: typing 0.5s steps(30, end);
                }
                
                @keyframes typing {
                    from { width: 0 }
                    to { width: 100% }
                }
            `}</style>
        </div>
    );
}
