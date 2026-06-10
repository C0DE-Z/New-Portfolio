"use client"
import React, { useState } from 'react';
import Navbar from "../../components/Navbar";
import GridBackground from "../../components/ui/grid-background";
import FpvModelViewer from "../../components/FpvModelViewer";
import { FaSlidersH, FaCube } from "react-icons/fa";

interface DroneComponent {
    id: string;
    name: string;
    type: string;
    spec: string;
    description: string;
}

const DRONE_COMPONENTS: DroneComponent[] = [
    {
        id: "frame",
        name: "TBS Source One V5",
        type: "Frame",
        spec: "5\" Carbon Fiber, 5mm arms",
        description: "Classic open-source freestyle frame built for extreme durability and crashes. Spacious layout with central balance."
    },
    {
        id: "stack",
        name: "SpeedyBee F405 V3",
        type: "Flight Stack",
        spec: "F405 Flight Controller + 50A 4-in-1 ESC",
        description: "Equipped with Bluetooth for configuration in the field via phone. Robust power delivery and filtering."
    },
    {
        id: "motors",
        name: "T-MOTOR Velox V3.0 2207",
        type: "Motors",
        spec: "1950KV Brushless Motors",
        description: "Responsive brushless motors optimized for 4S-6S freestyle flight. High efficiency and durable bell design."
    },
    {
        id: "camera",
        name: "Foxeer Razer Mini 3",
        type: "FPV Camera",
        spec: "1200TVL Analog, 1.8mm Lens",
        description: "Ultra low-latency camera with natural color balance and good light handling transition from shade to sun."
    },
    {
        id: "vtx",
        name: "SpeedyBee VTX w/ Stinger",
        type: "Video Transmitter",
        spec: "5.8GHz Analog, Switchable Power",
        description: "Transmits real-time analog video up to 800mW. Paired with a circular polarized antenna to reduce interference."
    },
    {
        id: "receiver",
        name: "ExpressLRS (ELRS) 2.4G",
        type: "RC Receiver",
        spec: "2.4GHz Serial RX, T-Antenna",
        description: "High-performance open-source control link. Offers extreme range and low latency packet rates."
    }
];

const PRESET_PROP_COLORS = [
    { name: "Cyan", value: "#06b6d4" },
    { name: "Red", value: "#ef4444" },
    { name: "Yellow", value: "#eab308" },
    { name: "Gray", value: "#737373" }
];

const PRESET_FRAME_COLORS = [
    { name: "Charcoal", value: "#262626" },
    { name: "Steel", value: "#525252" },
    { name: "Blue", value: "#1d4ed8" },
    { name: "Dark Red", value: "#991b1b" }
];

export default function FpvPage() {
    const [selectedComponent, setSelectedComponent] = useState<DroneComponent>(DRONE_COMPONENTS[0]);
    const [propColor, setPropColor] = useState("#06b6d4");
    const [frameColor, setFrameColor] = useState("#262626");
    const [armed, setArmed] = useState(false);
    
    // Telemetry mock state
    const [telemetry, setTelemetry] = useState({ yaw: 0, pitch: 0, roll: 0 });

    const handleTelemetryUpdate = (yaw: number, pitch: number, roll: number) => {
        setTelemetry({ yaw, pitch, roll });
    };

    return (
        <main className="min-h-screen bg-[#080808] text-neutral-300 font-sans flex flex-col relative overflow-x-hidden">
            <Navbar />
            <GridBackground />

            <div className="flex-1 max-w-7xl w-full mx-auto px-4 pt-28 pb-16 z-10 flex flex-col gap-12">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-100 mb-2">FPV Hangar</h1>
                    <p className="text-neutral-400 text-sm max-w-xl">
                        Interactive component teardown and specs checklist for the 5-inch freestyle drone.
                    </p>
                </div>

                {/* Interactive Split Viewer Container */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Left: Components List & Info */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-5 flex flex-col gap-4">
                            <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold font-mono">Build Components</span>
                            <div className="flex flex-col gap-2">
                                {DRONE_COMPONENTS.map((comp) => {
                                    const isSelected = comp.id === selectedComponent.id;
                                    return (
                                        <button
                                            key={comp.id}
                                            onClick={() => setSelectedComponent(comp)}
                                            className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all duration-200 flex items-center justify-between ${
                                                isSelected
                                                    ? "bg-neutral-800/60 border-neutral-700 text-neutral-100"
                                                    : "bg-transparent border-neutral-850/50 text-neutral-400 hover:border-neutral-800 hover:text-neutral-300"
                                            }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">{comp.name}</span>
                                                <span className="text-xs text-neutral-500 mt-0.5">{comp.type}</span>
                                            </div>
                                            {isSelected && <FaCube className="text-neutral-500 text-xs" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Selected Component Description */}
                        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-6 flex flex-col gap-3 flex-grow min-h-[160px]">
                            <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
                                <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold font-mono">
                                    {selectedComponent.type} Specs
                                </span>
                                <span className="text-xs font-mono text-neutral-400">{selectedComponent.spec}</span>
                            </div>
                            <h3 className="text-lg font-bold text-neutral-100">{selectedComponent.name}</h3>
                            <p className="text-sm text-neutral-400 leading-relaxed">{selectedComponent.description}</p>
                        </div>
                    </div>

                    {/* Right: 3D Scene View & HUD Overlay */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <div className="relative bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden min-h-[400px] lg:min-h-[500px] flex-grow flex items-center justify-center">
                            <FpvModelViewer 
                                propColor={propColor}
                                frameColor={frameColor}
                                armed={armed}
                                onTelemetryUpdate={handleTelemetryUpdate}
                            />

                            {/* Telemetry HUD Overlay */}
                            <div className="absolute top-4 left-4 font-mono text-[10px] text-neutral-400 bg-neutral-950/70 border border-neutral-900 px-3 py-2.5 rounded flex flex-col gap-1 pointer-events-none select-none min-w-[120px]">
                                <div className="text-[9px] uppercase tracking-wider text-neutral-500 border-b border-neutral-900 pb-1 mb-1 font-sans font-semibold">Telemetry Feed</div>
                                <div className="flex justify-between">
                                    <span>STATUS:</span>
                                    <span className={armed ? "text-red-500 animate-pulse font-bold" : "text-neutral-500 font-bold"}>
                                        {armed ? "ARMED" : "DISARMED"}
                                    </span>
                                </div>
                                <div className="flex justify-between"><span>YAW:</span><span>{telemetry.yaw}°</span></div>
                                <div className="flex justify-between"><span>PITCH:</span><span>{telemetry.pitch}°</span></div>
                                <div className="flex justify-between"><span>ROLL:</span><span>{telemetry.roll}°</span></div>
                                <div className="flex justify-between"><span>CELLS:</span><span>4S LiPo</span></div>
                                <div className="flex justify-between"><span>VOLTS:</span><span>{armed ? "15.1V" : "15.3V"}</span></div>
                                <div className="flex justify-between"><span>RSSI:</span><span>{armed ? "-45dBm" : "-30dBm"}</span></div>
                            </div>

                            {/* Arm/Disarm HUD Panel */}
                            <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-neutral-950/80 border border-neutral-900 px-4 py-2.5 rounded-lg">
                                <span className="text-xs font-mono font-medium text-neutral-400 select-none">ARM MOTORS</span>
                                <button
                                    onClick={() => setArmed(!armed)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                                        armed ? "bg-red-900/60 border border-red-700/80" : "bg-neutral-800 border border-neutral-700"
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded-full transition-transform duration-200 ${
                                        armed ? "translate-x-6 bg-red-400" : "translate-x-0 bg-neutral-400"
                                    }`} />
                                </button>
                            </div>
                        </div>

                        {/* Customizer Presets Controls Panel */}
                        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Propeller Color Selector */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 font-semibold font-mono">
                                    <FaSlidersH /> Propeller Color
                                </div>
                                <div className="flex gap-2">
                                    {PRESET_PROP_COLORS.map(c => (
                                        <button
                                            key={c.value}
                                            onClick={() => setPropColor(c.value)}
                                            style={{ backgroundColor: c.value }}
                                            className={`w-7 h-7 rounded-full border-2 transition-transform ${
                                                propColor === c.value ? "border-white scale-110" : "border-transparent hover:scale-105"
                                            }`}
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Frame Accent Color Selector */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 font-semibold font-mono">
                                    <FaSlidersH /> Frame Carbon
                                </div>
                                <div className="flex gap-2">
                                    {PRESET_FRAME_COLORS.map(c => (
                                        <button
                                            key={c.value}
                                            onClick={() => setFrameColor(c.value)}
                                            style={{ backgroundColor: c.value }}
                                            className={`w-7 h-7 rounded-full border-2 transition-transform ${
                                                frameColor === c.value ? "border-white scale-110" : "border-transparent hover:scale-105"
                                            }`}
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fleet Overview Section */}
                <section className="mt-8">
                    <h2 className="text-2xl font-bold tracking-tight text-neutral-100 mb-6 border-b border-neutral-900 pb-2">The Fleet Hangar</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                        <div className="bg-neutral-900/50 border border-neutral-800/80 p-5 rounded-xl flex gap-5 items-start hover:border-neutral-700/80 transition-colors">
                            <img className="w-32 h-24 object-cover rounded-lg shadow border border-neutral-800 bg-neutral-950" src="/imgs/metor75pro.jpg" alt="Meteor 75 Whoop" />
                            <div className="flex flex-col gap-1.5">
                                <h3 className="text-lg font-bold text-neutral-100">Meteor 75 Pro</h3>
                                <span className="text-xs font-mono text-neutral-500 uppercase">Indoor Whoop</span>
                                <p className="text-xs text-neutral-400 leading-relaxed mt-1">A micro quadcopter with ducted blades. Excellent for flying in tight rooms and safe indoor obstacle practice.</p>
                            </div>
                        </div>
                        <div className="bg-neutral-900/50 border border-neutral-800/80 p-5 rounded-xl flex gap-5 items-start hover:border-neutral-700/80 transition-colors">
                            <img className="w-32 h-24 object-cover rounded-lg shadow border border-neutral-800 bg-neutral-950" src="/imgs/MINI-2.jpeg" alt="DJI Mini 2" />
                            <div className="flex flex-col gap-1.5">
                                <h3 className="text-lg font-bold text-neutral-100">DJI Mini 2</h3>
                                <span className="text-xs font-mono text-neutral-500 uppercase">Cinematic Photography</span>
                                <p className="text-xs text-neutral-400 leading-relaxed mt-1">Sub-240g drone utilized for high-resolution aerial photography, video compilation, and site reconnaissance.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Ground Station Section */}
                <section>
                    <h2 className="text-2xl font-bold tracking-tight text-neutral-100 mb-6 border-b border-neutral-900 pb-2">Ground Station & Hardware Tools</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/80 hover:border-neutral-750 transition-colors">
                            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-2">Radio Controller</span>
                            <h3 className="text-base font-semibold text-neutral-200">RadioMaster Zorro</h3>
                            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">Gamepad form factor, equipped with 2.4GHz internal ExpressLRS RF module and hall sensor gimbals.</p>
                        </div>
                        <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/80 hover:border-neutral-750 transition-colors">
                            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-2">FPV Goggles</span>
                            <h3 className="text-base font-semibold text-neutral-200">BetaFPV VR03</h3>
                            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">Analog box goggles with circular antennas and integrated DVR recording module for emergency blackbox lookups.</p>
                        </div>
                        <div className="bg-neutral-900/40 p-6 rounded-xl border border-neutral-800/80 hover:border-neutral-750 transition-colors">
                            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-2">Calibration Tools</span>
                            <h3 className="text-base font-semibold text-neutral-200">Betaflight Configurator</h3>
                            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">Desktop serial client software used to adjust quad PID loops, sensor alignment, filters, and custom OSD layers.</p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};
