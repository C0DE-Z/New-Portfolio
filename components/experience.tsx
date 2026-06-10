"use client"
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaExternalLinkAlt, FaCode, FaCogs, FaUsers } from "react-icons/fa";

interface RoboticsRole {
    title: string;
    date: string;
    description: string;
    highlight: string;
    icon: React.ReactNode;
}

const ROLES: RoboticsRole[] = [
    {
        title: "Controls Lead",
        date: "May 2025 - Present",
        description: "Leading the team's controls and software efforts, including developing robot algorithms, testing shooter and motion systems, integrating sensors, and supporting junior members. Collaborate with design and mechanical teams.",
        highlight: "Waterloo Regional 2026",
        icon: <FaCogs />
    },
    {
        title: "Development Controls Lead",
        date: "Aug 2025 - Nov 2025",
        description: "Led a team of Grade 9 and 10 students in building a robot from scratch. Designed and implemented the electrical layout and contributed to programming, while mentoring team members throughout the build process.",
        highlight: "STEMLEY Cup 2025",
        icon: <FaUsers />
    },
    {
        title: "Controls Member",
        date: "Oct 2024 - Nov 2025",
        description: "Collaborated on electrical wiring, diagnostic hardware testing, and logic programming for regional competition robots.",
        highlight: "FRC Team Member",
        icon: <FaRobot />
    }
];

interface LibModule {
    id: string;
    name: string;
    title: string;
    description: string;
    highlights: string[];
    codeSnippet: string;
}

const ABSOLUTELIB_MODULES: LibModule[] = [
    {
        id: "subsystems",
        name: "Subsystems & IK",
        title: "Robot Subsystems & Inverse Kinematics",
        description: "Modular framework designed for robot components including arms, pivots, and elevators. Implements custom multi-DOF inverse kinematics (IK) solvers for arm path coordination.",
        highlights: [
            "Arm: Multi-joint arm controls with built-in Inverse Kinematics solver.",
            "Pivot & Elevator: High-precision single-joint rotational & linear controllers.",
            "EndEffector: Unified base configurations for claws, intakes, and grippers."
        ],
        codeSnippet: `// Inverse Kinematics (IK) Solver & Subsystem Wrapper
public class ArmSubsystem extends SubsystemBase {
  private final ArmDynamics dynamics;
  private final DoubleJointedArmSim simulation;

  public ArmSubsystem() {
    this.dynamics = new ArmDynamics(ArmConstants.lengths);
    this.simulation = new DoubleJointedArmSim(...);
  }

  public void setTargetPosition(Vector2 target) {
    var angles = dynamics.solveIK(target);
    leftJoint.setAngle(angles.theta1);
    rightJoint.setAngle(angles.theta2);
  }
}`
    },
    {
        id: "trajectories",
        name: "Trajectories",
        title: "Ballistic Trajectories & Coprocessor Offloading",
        description: "Complete ballistic calculations and dynamic trajectory planning for the 2026 Season. Offloads pathfinding and target calculations onto coprocessors via TCP and NetworkTables v4 (NT4).",
        highlights: [
            "Coprocessor Wrappers: Fast and reliable TCP and NT4 packet streaming.",
            "Ballistic Calculation: Dynamic calculation of shooter hood and speed variables.",
            "Offline Tables: Support for loading precomputed trajectories from JSON."
        ],
        codeSnippet: `// Coprocessor Trajectory Client
public class TrajectoryClient {
  private final NetworkTableEntry targetEntry;
  private final Socket tcpSocket;

  public TrajectoryClient(String address, int port) {
    this.tcpSocket = new Socket(address, port);
    var inst = NetworkTableInstance.getDefault();
    this.targetEntry = inst.getTable("Coprocessor").getEntry("target");
  }

  public Trajectory solveTarget(Pose2d currentRobotPose) {
    // Send state over TCP to offload pathfinding
    sendStatePacket(currentRobotPose);
    return receiveTrajectoryPacket();
  }
}`
    },
    {
        id: "simulation",
        name: "Simulation",
        title: "Identical Real-Hardware & Simulation Execution",
        description: "Guarantees matching physics behavior between actual robots and simulator runs. Implements wrappers that dynamically mock motor and encoder inputs under a simulation context.",
        highlights: [
            "ArmSimulation: Full multi-DOF mathematical joint simulation.",
            "Elevator & Pivot Simulation: Physics-based linear/rotational joint modeling.",
            "AdvantageKit Logging: Enables replayable simulation states."
        ],
        codeSnippet: `// Unified Simulation / Hardware Interface
public class MotorWrapper {
  private final CANSparkMax spark;
  private final ElevatorSim simElevator;

  public void setVoltage(double voltage) {
    if (Robot.isReal()) {
      spark.setVoltage(voltage);
    } else {
      simElevator.setInput(voltage);
      simElevator.update(0.020); // 20ms WPILib loop
    }
  }
}`
    },
    {
        id: "abstraction",
        name: "Abstraction",
        title: "Unified Motor & Encoder Interface",
        description: "Wraps diverse vendor motor controllers (TalonFX/Phoenix6, TalonSRX/Phoenix5, SparkMax/REVLib) and feedback encoders (CANCoder, analog sensors) under a single, generic API.",
        highlights: [
            "MotorWrapper: Single API for TalonFX, TalonSRX, and SparkMax motors.",
            "EncoderWrapper: Standard interface for CANCoder, duty cycle, and built-in sensors.",
            "Vendor Independence: Simple switching of physical motors with zero logic changes."
        ],
        codeSnippet: `// Motor API Unification
public interface MotorWrapper {
  void setPercentOutput(double percent);
  double getPositionRotations();
  double getVelocityRPM();
  void follow(MotorWrapper master);
}`
    },
    {
        id: "math",
        name: "Controls Math",
        title: "CRT Solvers & Turret Anti-Windup Math",
        description: "Advanced controls math solving FRC-specific challenges, including turret cable wrap limits and multi-turn encoder absolute position resolution.",
        highlights: [
            "ChineseRemainderSolver: Solves multi-modulus alignment problems.",
            "Turret Anti-Windup: Shortest-path rotation within mechanical limits.",
            "Vector Math: Lightweight 2D/3D coordinate transformations."
        ],
        codeSnippet: `// Turret Cable Wrap Anti-Windup Solver
public class TurretWrapSolver {
  public static double calculateTarget(double targetRad, double currentRad) {
    double delta = Math.IEEEremainder(targetRad - currentRad, 2 * Math.PI);
    double result = currentRad + delta;
    // Keep target within cable wrap boundary limits (-270 to +270 deg)
    if (result < TurretConstants.MIN_LIMIT) return result + 2 * Math.PI;
    if (result > TurretConstants.MAX_LIMIT) return result - 2 * Math.PI;
    return result;
  }
}`
    }
];

export default function Experience() {
    const [activeTab, setActiveTab] = useState<string>("subsystems");
    const activeModule = ABSOLUTELIB_MODULES.find(m => m.id === activeTab) || ABSOLUTELIB_MODULES[0];

    return (
        <div className="relative flex flex-col items-center justify-center p-8 sm:p-20">
            <div className="w-full max-w-5xl">
                
                {/* Section Title */}
                <div className="text-center mb-16">
                    <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase block mb-2">Systems Engineering</span>
                    <h2 className="text-[2.5rem] sm:text-[3.5rem] font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-300">
                        Robotics &amp; Control Systems
                    </h2>
                </div>

                <div className="flex flex-col gap-8">
                    {/* Interactive AbsoluteLib Inspector Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-6 md:p-8 flex flex-col gap-6"
                    >
                        {/* Header Details */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-neutral-800 text-neutral-300 rounded-lg text-xl">
                                    <FaCode />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs uppercase tracking-wider text-neutral-500 font-mono">FRC Control Library</span>
                                    <h3 className="text-xl font-bold text-neutral-100">AbsoluteLib V2</h3>
                                </div>
                            </div>
                            
                            <a
                                href="https://github.com/Team4308/absolutelib"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-850 hover:bg-neutral-800 text-xs font-mono text-neutral-300 rounded-lg transition-colors border border-neutral-800/80"
                            >
                                View Repository <FaExternalLinkAlt className="text-[10px]" />
                            </a>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-neutral-400 leading-relaxed max-w-3xl">
                            Architected and implemented the core Java control library utilized by **FRC Team 4308: Absolute Robotics** to streamline robot subsystems, kinematics, and simulation.
                        </p>

                        {/* Interactive Modules Tabs Selector */}
                        <div className="flex border-b border-neutral-850 overflow-x-auto scrollbar-none gap-2 pb-px">
                            {ABSOLUTELIB_MODULES.map(mod => (
                                <button
                                    key={mod.id}
                                    onClick={() => setActiveTab(mod.id)}
                                    className={`px-4 py-2 text-xs font-mono border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                                        activeTab === mod.id
                                            ? "border-neutral-200 text-neutral-100 font-semibold"
                                            : "border-transparent text-neutral-500 hover:text-neutral-300"
                                    }`}
                                >
                                    {mod.name}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content Area */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col lg:flex-row gap-6 justify-between items-stretch"
                            >
                                {/* Left Side: Details */}
                                <div className="flex-1 flex flex-col gap-4">
                                    <h4 className="text-base font-bold text-neutral-200">{activeModule.title}</h4>
                                    <p className="text-xs text-neutral-400 leading-relaxed">{activeModule.description}</p>
                                    
                                    <div className="flex flex-col gap-2 bg-neutral-950/40 border border-neutral-850 p-4 rounded-lg text-xs font-mono">
                                        <div className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold border-b border-neutral-900 pb-1.5 mb-1.5">Key Subcomponents</div>
                                        {activeModule.highlights.map((highlight, index) => (
                                            <div key={index} className="flex items-start gap-2">
                                                <span className="text-neutral-400 font-bold">&#8250;</span>
                                                <span className="text-neutral-300">{highlight}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Side: Code Viewer */}
                                <div className="flex-1 bg-neutral-950 border border-neutral-850 rounded-lg overflow-hidden flex flex-col min-h-[200px] max-h-[350px]">
                                    <div className="bg-neutral-900 px-4 py-2 border-b border-neutral-850 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                                        <span>AbsoluteLib // {activeModule.name}.java</span>
                                        <span className="text-neutral-600">read-only</span>
                                    </div>
                                    <div className="p-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-neutral-300 select-text scrollbar-thin scrollbar-thumb-neutral-800">
                                        <pre className="whitespace-pre">{activeModule.codeSnippet}</pre>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                    {/* FRC Roles Timeline Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {ROLES.map((role, idx) => (
                            <motion.div
                                key={role.title}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.1 }}
                                className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-5 flex flex-col gap-4 hover:border-neutral-700/80 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-neutral-900 text-neutral-400 rounded-lg text-base border border-neutral-850">
                                        {role.icon}
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-sm font-bold text-neutral-200">{role.title}</h4>
                                        <span className="text-[10px] font-mono text-neutral-500">{role.date}</span>
                                    </div>
                                </div>

                                <p className="text-xs text-neutral-400 leading-relaxed flex-grow">
                                    {role.description}
                                </p>

                                <div className="border-t border-neutral-850 pt-3 flex items-center justify-between font-mono text-[9px]">
                                    <span className="text-neutral-500 uppercase">Spotlight:</span>
                                    <span className="text-neutral-300 font-semibold">{role.highlight}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
