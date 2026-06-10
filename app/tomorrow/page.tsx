"use client"
import React, { useState, useEffect, useRef } from "react";

interface Choice {
    text: string;
    consequence: string;
    companyHealthImpact: number;
    personalHealthImpact: number;
    trustImpact: number;
}

interface Scenario {
    title: string;
    description: string;
    choices: Choice[];
    asciiArt: string;
}

const ART_ELEVATOR = `+=====+
|  | |  |
|  | |  |
+=====+`;

const ART_SILENCE = `  
   .-----.
 /  . .  \\
|   ___   |
 \\_______/`;

const ART_WAGON = `  _______
 /|_||_|_\`.__
(   _    _   )
 \`-(_)--(_)-'`;

const ART_AVATAR = `+-----+
| o-o |
|  |  |
+-----+`;

const ART_CHILD = ` 
_____
( o.o )
 \\\\_~_/
[ LUDO ]
 
`;

const ART_OVERLOAD = ` [ !!! ]
+-------+
|=======|
+-------+`;

const ART_GLITCH = `+-------+
| *&%#@ |
| @#$*! |
+-------+`;

const ART_VOID = ` ( . . )
(  ...  )
 ( ... )`;

const ART_COG = `  _--_
 /    \\\\
(  O   )
 \\\\____/`;

const ART_BUG = ` \\\\ | /
 -O-O-
 / | \\\\
[BUG_SYSTEM]`;

const ART_LETTER = `+---------+
| /     \\\\ |
|  /   \\\\  |
+---------+`;

const ART_LEG = ``;

const ART_TROPHY = ``;

const ART_NETWORK = `[PC]   [PC]
 \\\\_____/
   ||`;

const ART_MIC = `.---.
|###|
 | |
 [=]`;

const ART_RECYCLE = ` /---
| <-> |
 \\\\___/`;

const ART_BOOTH = ` _________
/  BOOTH  \\\\
|_________|`;

const ART_COIN = ` .---.
/  $  \\\\
\\\\  $  /
 '---'`;

const ART_CLINIC = `   _|
 _|_|_
   |_|
[CLINIC]`;

const ART_HOURGLASS = `  /---
 (  X  )
  \\\\___/
[CRUNCH]`;

const SCENARIOS: Scenario[] = [
    {
        title: "THE ELEVATOR",
        description: "The office elevator is broken. Your phantom foot pain is agonizing. Do you force yourself to climb the stairs to show the dev team strength, or work from home and let studio morale drop?",
        asciiArt: ART_ELEVATOR,
        choices: [
            {
                text: "Force yourself to climb the stairs to show strength to the dev team.",
                consequence: "You dragged yourself up the steps. Your physical fatigue is severe and your leg is throbbing, but the team saw you lead by example.",
                companyHealthImpact: 15,
                personalHealthImpact: -25,
                trustImpact: -10
            },
            {
                text: "Work from home and let studio morale drop.",
                consequence: "You isolated yourself at home. The staff feels unguided and rumors of the studio's end circulate, but you spared your body.",
                companyHealthImpact: -20,
                personalHealthImpact: 15,
                trustImpact: 10
            }
        ]
    },
    {
        title: "THE SILENCE",
        description: "Sadie hasn't answered texts in a month, but you can see she logs into 'Mapleworld'. Do you force a real-world intervention at her apartment, or start quietly coding a secret expansion ('Pioneers') just for her?",
        asciiArt: ART_SILENCE,
        choices: [
            {
                text: "Force a real-world intervention at her apartment.",
                consequence: "You knocked on her door. She refused to open it. Her real-world walls grew thicker. The intrusion damaged her trust.",
                companyHealthImpact: 5,
                personalHealthImpact: -10,
                trustImpact: -20
            },
            {
                text: "Start quietly coding a secret expansion ('Pioneers') just for her.",
                consequence: "You spent nights in the editor. You are sublimating your grief into the code. The bridge is under construction.",
                companyHealthImpact: -15,
                personalHealthImpact: -10,
                trustImpact: 15
            }
        ]
    },
    {
        title: "CODING PIONEERS",
        description: "You are designing the rules for the Pioneers expansion. Do you make it a harsh, realistic survival game, or a gentle sandbox where nobody actually dies (repressing the trauma)?",
        asciiArt: ART_WAGON,
        choices: [
            {
                text: "Make it a harsh, realistic survival game where resources are scarce.",
                consequence: "The mechanics are brutal. Death is permanent. It matches your reality, but Sadie finds it oppressive.",
                companyHealthImpact: 10,
                personalHealthImpact: -10,
                trustImpact: -10
            },
            {
                text: "Make it a gentle sandbox where nobody actually dies.",
                consequence: "You repressed the trauma. You made a peaceful, safe sandbox. Sadie finds comfort in it.",
                companyHealthImpact: -10,
                personalHealthImpact: 10,
                trustImpact: 15
            }
        ]
    },
    {
        title: "THE AVATAR",
        description: "You need an in-game identity to talk to Sadie. Do you play as the fake NPC 'Dr. Edna Daedalus' to bypass her real-world walls, or do you try to subtly act like yourself?",
        asciiArt: ART_AVATAR,
        choices: [
            {
                text: "Play as the fake NPC 'Dr. Edna Daedalus' to bypass her real-world walls.",
                consequence: "You bypassed her blocks as Edna. You entered her digital sanctuary under false pretenses.",
                companyHealthImpact: -10,
                personalHealthImpact: -10,
                trustImpact: 20
            },
            {
                text: "Try to subtly act like yourself, dropping code syntax she knows.",
                consequence: "You dropped hints. She recognized your syntax immediately and logged off, severing the link early.",
                companyHealthImpact: 10,
                personalHealthImpact: 10,
                trustImpact: -25
            }
        ]
    },
    {
        title: "THE VIRTUAL CHILD",
        description: "Inside the game, Sadie wants to spend hours raising a virtual child named Ludo with Dr. Daedalus. Do you indulge this complete detachment from reality, or steer the chat toward the real world?",
        asciiArt: ART_CHILD,
        choices: [
            {
                text: "Indulge this complete detachment from reality to keep her connected.",
                consequence: "You spent hours in the virtual nursery. Sadie is engaged, but Unfair Games' operations are left unattended.",
                companyHealthImpact: -20,
                personalHealthImpact: -15,
                trustImpact: 20
            },
            {
                text: "Steer the chat toward the real world and her physical isolation.",
                consequence: "You mentioned the physical world. She went silent for three days. You broke the magic circle.",
                companyHealthImpact: 15,
                personalHealthImpact: 10,
                trustImpact: -20
            }
        ]
    },
    {
        title: "SYSTEM OVERLOAD",
        description: "You are spending 10 hours a day roleplaying in Pioneers and Unfair Games is bleeding money. Do you hire a sub-director to run the company, or cut back your hours in the game with Sadie?",
        asciiArt: ART_OVERLOAD,
        choices: [
            {
                text: "Hire a sub-director to run the company, surrendering control.",
                consequence: "You delegated operations. Company books stabilized, but you feel like you have surrendered Marx's legacy.",
                companyHealthImpact: 25,
                personalHealthImpact: 15,
                trustImpact: -10
            },
            {
                text: "Cut back your hours in the game with Sadie.",
                consequence: "You logged off. Company details were addressed, but Sadie noticed your absence in Pioneers.",
                companyHealthImpact: -15,
                personalHealthImpact: -10,
                trustImpact: -15
            }
        ]
    },
    {
        title: "THE GLITCH",
        description: "A bug in the backend exposes your IP. Sadie realizes Dr. Daedalus is actually you. Do you desperately defend your actions as the only way to save her, or immediately apologize and nuke the server data?",
        asciiArt: ART_GLITCH,
        choices: [
            {
                text: "Desperately defend your actions as the only way to save her.",
                consequence: "You defended the deception. She viewed it as gaslighting and manipulation. The rift widens.",
                companyHealthImpact: 10,
                personalHealthImpact: -15,
                trustImpact: -30
            },
            {
                text: "Immediately apologize and nuke the server data.",
                consequence: "You erased the database. The world you built is gone. She is left in silence, but respects the choice.",
                companyHealthImpact: -20,
                personalHealthImpact: -10,
                trustImpact: 15
            }
        ]
    },
    {
        title: "THE VOID",
        description: "She cut you off entirely. The studio is surviving, but you are hollow. Do you keep trying to send her real-world letters, or fully embrace the sublimation and just code until you go numb?",
        asciiArt: ART_VOID,
        choices: [
            {
                text: "Keep trying to send her real-world letters.",
                consequence: "You sent letters. They remained unopened. Your obsession is exhausting, but it keeps the connection alive.",
                companyHealthImpact: -15,
                personalHealthImpact: -15,
                trustImpact: 15
            },
            {
                text: "Fully embrace the sublimation and just code until you go numb.",
                consequence: "You coded in isolation. Unfair Games released a patch. Your mind is quiet, but she is drifting away.",
                companyHealthImpact: 20,
                personalHealthImpact: -20,
                trustImpact: -20
            }
        ]
    },
    {
        title: "THE ENGINE SECRET",
        description: "Professor Dov contacts you. He asks if he should finally tell Sadie that you secretly gave her your proprietary game engine years ago. Do you let him tell her, or force him to keep it secret so she doesn't feel indebted?",
        asciiArt: ART_COG,
        choices: [
            {
                text: "Let Dov tell her, breaking her illusion that you are selfish.",
                consequence: "Dov told her. The truth is out. She realized you protected her career from the shadows. The debt is heavy.",
                companyHealthImpact: -10,
                personalHealthImpact: -10,
                trustImpact: 30
            },
            {
                text: "Force Dov to keep it a secret so she doesn't feel indebted.",
                consequence: "The secret is locked. She continues to believe you are selfish, but she remains free of obligation.",
                companyHealthImpact: 15,
                personalHealthImpact: 10,
                trustImpact: -15
            }
        ]
    },
    {
        title: "THE BUG REPORT",
        description: "A critical game-breaking glitch is reported in 'Pioneers' that breaks Sadie's custom assets. Do you patch it immediately without telling her, or leave it for her to fix herself?",
        asciiArt: ART_BUG,
        choices: [
            {
                text: "Patch it immediately without telling her.",
                consequence: "You patched the glitch. The assets are safe, but you bypassed her autonomy to protect her.",
                companyHealthImpact: 15,
                personalHealthImpact: -15,
                trustImpact: 5
            },
            {
                text: "Leave it for her to fix herself.",
                consequence: "You left it alone. She struggled with the code but resolved it, maintaining her independence.",
                companyHealthImpact: -10,
                personalHealthImpact: 10,
                trustImpact: 15
            }
        ]
    },
    {
        title: "THE FAN LETTER",
        description: "A player sends a deeply moving letter about how your games helped them handle a massive real-world trauma. Do you read it to the dev team to boost morale, or trash it because it triggers your own repressed grief?",
        asciiArt: ART_LETTER,
        choices: [
            {
                text: "Read it to the dev team to boost morale.",
                consequence: "You read the letter. The team's spirits rose, but the raw description of grief triggered your own symptoms.",
                companyHealthImpact: 20,
                personalHealthImpact: -20,
                trustImpact: -5
            },
            {
                text: "Trash it because it triggers your own repressed grief.",
                consequence: "You discarded the letter. You protected your mental state, but the developers missed a morale boost.",
                companyHealthImpact: -15,
                personalHealthImpact: 15,
                trustImpact: 5
            }
        ]
    },
    {
        title: "THE BROKEN PROSTHETIC",
        description: "Your physical condition worsens rapidly, and your doctor demands an immediate, multi-day consultation. Do you skip the appointment to finish a backend server migration, or go to the hospital and leave the studio unguided?",
        asciiArt: ART_LEG,
        choices: [
            {
                text: "Skip the appointment to finish a backend server migration.",
                consequence: "You skipped it. The migration succeeded and servers are stable, but your leg pain is severe.",
                companyHealthImpact: 20,
                personalHealthImpact: -30,
                trustImpact: -5
            },
            {
                text: "Go to the hospital and leave the studio unguided.",
                consequence: "You checked into the clinic. You addressed your leg health, but dev operations faltered in your absence.",
                companyHealthImpact: -25,
                personalHealthImpact: 20,
                trustImpact: 10
            }
        ]
    },
    {
        title: "THE AWARD CEREMONY",
        description: "Unfair Games is being honored with an industry legacy award. Do you attend alone and accept the applause as the sole face of the company, or decline the invitation entirely because the original team is fractured?",
        asciiArt: ART_TROPHY,
        choices: [
            {
                text: "Attend alone and accept the applause as the sole face of the company.",
                consequence: "You attended the event. The PR was highly beneficial, but standing on stage alone felt like a betrayal.",
                companyHealthImpact: 25,
                personalHealthImpact: -15,
                trustImpact: -20
            },
            {
                text: "Decline the invitation entirely because the original team is fractured.",
                consequence: "You declined the award. The studio missed a major marketing window, but you respected the original team.",
                companyHealthImpact: -20,
                personalHealthImpact: 15,
                trustImpact: 15
            }
        ]
    },
    {
        title: "THE ALTERNATE SERVER",
        description: "A group of players has hosted an illegal, modified version of 'Pioneers' that removes all the survival mechanics. Do you issue a copyright strike to protect your IP, or let them play in their safe space?",
        asciiArt: ART_NETWORK,
        choices: [
            {
                text: "Issue a copyright strike to protect your IP.",
                consequence: "You struck the server. You protected your legal assets, but angered the dedicated modding community.",
                companyHealthImpact: 15,
                personalHealthImpact: -10,
                trustImpact: -15
            },
            {
                text: "Let them play in their safe space.",
                consequence: "You allowed the server to stand. The community is happy, but legal control of the code is compromised.",
                companyHealthImpact: -15,
                personalHealthImpact: 10,
                trustImpact: 15
            }
        ]
    },
    {
        title: "THE INTERVIEW",
        description: "A major gaming magazine wants an interview about the history of Unfair Games. Do you lean into your 'lone genius' persona to build PR, or insist on sharing the credit with Sadie even though she isn't speaking to you?",
        asciiArt: ART_MIC,
        choices: [
            {
                text: "Lean into your 'lone genius' persona to build PR.",
                consequence: "You accepted the spotlight. Investors are pleased, but the narrative erases Sadie's contribution.",
                companyHealthImpact: 20,
                personalHealthImpact: -10,
                trustImpact: -25
            },
            {
                text: "Insist on sharing the credit with Sadie even though she isn't speaking to you.",
                consequence: "You shared credit. The press found the statement puzzling, but you kept her contribution alive.",
                companyHealthImpact: -10,
                personalHealthImpact: 10,
                trustImpact: 20
            }
        ]
    },
    {
        title: "THE CODE REFACTOR",
        description: "The legacy codebase from 'Both Sides' is a tangled mess and slowing down new updates. Do you rewrite it from scratch, erasing the history you built together, or patch it up to preserve the original keystrokes?",
        asciiArt: ART_RECYCLE,
        choices: [
            {
                text: "Rewrite it from scratch, erasing the history you built together.",
                consequence: "You refactored the engine. Development speed has tripled, but you feel like you deleted a piece of your past.",
                companyHealthImpact: 25,
                personalHealthImpact: -15,
                trustImpact: -15
            },
            {
                text: "Patch it up to preserve the original keystrokes.",
                consequence: "You left the original scripts. The code is slow and buggy, but you preserved the history.",
                companyHealthImpact: -15,
                personalHealthImpact: 10,
                trustImpact: 15
            }
        ]
    },
    {
        title: "THE CONVENTION",
        description: "E3 is approaching. Do you book a massive booth to prove Unfair Games is thriving, or skip it entirely because you cannot face the crowds and the inevitable questions about Sadie's absence?",
        asciiArt: ART_BOOTH,
        choices: [
            {
                text: "Book a massive booth to prove Unfair Games is thriving.",
                consequence: "You booked the booth. The marketing was successful, but the physical stress left you exhausted.",
                companyHealthImpact: 25,
                personalHealthImpact: -25,
                trustImpact: -10
            },
            {
                text: "Skip it entirely because you cannot face the crowds and questions about Sadie.",
                consequence: "You skipped the convention. The studio was criticized for silence, but you protected your energy.",
                companyHealthImpact: -20,
                personalHealthImpact: 15,
                trustImpact: 15
            }
        ]
    },
    {
        title: "THE MONETIZATION",
        description: "The dev team wants to add 'pay-to-win' microtransactions to Mapleworld to boost revenue. Do you veto it to protect the game's artistic integrity, or approve it to keep the company financially afloat?",
        asciiArt: ART_COIN,
        choices: [
            {
                text: "Veto it to protect the game's artistic integrity.",
                consequence: "You vetoed the microtransactions. The players praise your integrity, but cash flow remains tight.",
                companyHealthImpact: -15,
                personalHealthImpact: 10,
                trustImpact: 15
            },
            {
                text: "Approve it to keep the company financially afloat.",
                consequence: "You approved the shop. The company secured cash, but the original community feels betrayed.",
                companyHealthImpact: 25,
                personalHealthImpact: -10,
                trustImpact: -15
            }
        ]
    },
    {
        title: "THE MEDICAL BILL",
        description: "Your surgeries are mounting in cost and your personal accounts are drained. Do you quietly siphon funds from the studio's emergency reserves, or take a high-interest personal loan to keep the company's books clean?",
        asciiArt: ART_CLINIC,
        choices: [
            {
                text: "Quietly siphon funds from the studio's emergency reserves.",
                consequence: "You covered your bills. You reduced your constant physical stress, but compromised the studio's buffer.",
                companyHealthImpact: -25,
                personalHealthImpact: 20,
                trustImpact: -10
            },
            {
                text: "Take a high-interest personal loan to keep the company's books clean.",
                consequence: "You took the loan. The company accounts are intact, but you are under severe financial strain.",
                companyHealthImpact: 15,
                personalHealthImpact: -20,
                trustImpact: 10
            }
        ]
    },
    {
        title: "THE STUDIO CULTURE",
        description: "The deadline for the new expansion is looming, and the dev team is exhausted. Do you enforce a mandatory 80-hour crunch week to hit the release date, or delay the game and face the wrath of the investors?",
        asciiArt: ART_HOURGLASS,
        choices: [
            {
                text: "Enforce a mandatory 80-hour crunch week to hit the release date.",
                consequence: "The game shipped on time. Revenue is secured, but developer burnout is critical.",
                companyHealthImpact: 20,
                personalHealthImpact: -25,
                trustImpact: -10
            },
            {
                text: "Delay the game and face the wrath of the investors.",
                consequence: "You delayed the expansion. Morale remains high, but investors are threatening legal actions.",
                companyHealthImpact: -20,
                personalHealthImpact: 15,
                trustImpact: 15
            }
        ]
    }
];

export default function TomorrowGame() {
    const [gameState, setGameState] = useState<"backstory" | "playing" | "consequence" | "won">("backstory");
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [companyHealth, setCompanyHealth] = useState<number>(50);
    const [personalHealth, setPersonalHealth] = useState<number>(50);
    const [sadieTrust, setSadieTrust] = useState<number>(50);
    
    // Scenarios log for the active question
    const [randomScenarios, setRandomScenarios] = useState<Scenario[]>([]);
    const [lastConsequence, setLastConsequence] = useState<{
        consequence: string;
        coHealthImpact: number;
        perHealthImpact: number;
        trustImpact: number;
    } | null>(null);
    const [inputValue, setInputValue] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Initial shuffle of 10 random scenarios
    useEffect(() => {
        const shuffled = [...SCENARIOS]
            .sort(() => Math.random() - 0.5)
            .slice(0, 10);
        setRandomScenarios(shuffled);
    }, []);

    // Autofocus input on mount and state changes
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [gameState, currentStep]);

    const handleGlobalClick = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            return;
        }
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const startTrail = () => {
        setGameState("playing");
    };

    const handleAction = (choiceIndex: number) => {
        if (gameState !== "playing") return;

        const sc = randomScenarios[currentStep];
        const selectedChoice = sc.choices[choiceIndex];

        // Store last consequence details
        setLastConsequence({
            consequence: selectedChoice.consequence,
            coHealthImpact: selectedChoice.companyHealthImpact,
            perHealthImpact: selectedChoice.personalHealthImpact,
            trustImpact: selectedChoice.trustImpact
        });

        // Calculate metrics (can drop below 0)
        setCompanyHealth((prev) => prev + selectedChoice.companyHealthImpact);
        setPersonalHealth((prev) => prev + selectedChoice.personalHealthImpact);
        setSadieTrust((prev) => prev + selectedChoice.trustImpact);

        setGameState("consequence");
    };

    const handleContinue = () => {
        const nextStep = currentStep + 1;
        if (nextStep < randomScenarios.length) {
            setCurrentStep(nextStep);
            setGameState("playing");
        } else {
            setGameState("won");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const val = inputValue.trim();
            setInputValue("");

            if (gameState === "backstory") {
                startTrail();
                return;
            }

            if (gameState === "consequence") {
                handleContinue();
                return;
            }

            if (gameState === "playing") {
                if (val === "1") {
                    handleAction(0);
                } else if (val === "2") {
                    handleAction(1);
                }
            }
        }
    };

    const drawProgressBar = (value: number) => {
        const cappedVal = Math.max(0, Math.min(100, value));
        const totalBlocks = 10;
        const filled = Math.round((cappedVal / 100) * totalBlocks);
        const empty = totalBlocks - filled;
        return `[${"█".repeat(filled)}${"-".repeat(empty)}] ${value}`;
    };

    const activeScenario = randomScenarios[currentStep];

    return (
        <main 
            onClick={handleGlobalClick}
            className="w-screen h-screen bg-black text-neutral-300 flex flex-col font-mono relative overflow-hidden select-none cursor-default"
        >
            
            {/* Head */}
            <div className="bg-black px-4 py-3 border-b border-neutral-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 select-none text-xs font-bold uppercase tracking-wider">
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-neutral-300 text-xs">
                    {gameState !== "backstory" ? (
                        <>
                            <div className="flex items-center gap-1">
                                <span>COMPANY HEALTH:</span>
                                <span>{drawProgressBar(companyHealth)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span>PERSONAL HEALTH:</span>
                                <span>{drawProgressBar(personalHealth)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span> SADIES TRUST:</span>
                                <span>{drawProgressBar(sadieTrust)}</span>
                            </div>
                        </>
                    ) : (
                        <span></span>
                    )}
                </div>

                <div className="flex items-center gap-3 text-[10px] self-end sm:self-auto text-neutral-500">
                    <span>AN UNFAIR GAME</span>
                </div>
            </div>

            {/* Main  */}
            <div className="flex-grow flex items-center justify-center p-4 md:p-6 bg-black border-b border-neutral-700 overflow-y-auto">
                <div className="w-full max-w-xl text-center select-text">
                    
                    {gameState === "backstory" && (
                        /* Title  */
                        <div className="flex flex-col gap-8">
                            <div className="border border-white p-6 bg-black">
                                <h1 className="text-xl md:text-2xl font-bold tracking-widest text-white uppercase">
                                    AN UNFAIR GAME
                                </h1>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <button
                                    onClick={startTrail}
                                    className="px-6 py-2 border border-white text-white text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all cursor-pointer rounded"
                                >
                                    Press to Begin
                                </button>
                                <span className="text-[10px] text-neutral-500 font-mono">
                                    (Or press Enter to start)
                                </span>
                            </div>
                        </div>
                    )}

                    {gameState === "playing" && activeScenario && (
                        /* Current */
                        <div className="flex flex-col gap-6 text-center items-center">
                            <h2 className="text-white font-bold pb-2 text-base md:text-lg uppercase tracking-wider border-b border-neutral-800 w-full max-w-md mx-auto">
                                {activeScenario.title}
                            </h2>
                            {activeScenario.asciiArt && (
                                <pre className="text-neutral-400 font-mono text-xs md:text-sm leading-tight whitespace-pre my-1 select-none">
                                    {activeScenario.asciiArt}
                                </pre>
                            )}
                            <p className="text-neutral-300 leading-relaxed text-sm md:text-base max-w-lg mx-auto">
                                {activeScenario.description}
                            </p>
                            <div className="flex flex-col items-center gap-3 mt-2">
                                <div className="text-neutral-300 text-sm max-w-md">
                                    1. {activeScenario.choices[0].text}
                                </div>
                                <div className="text-neutral-300 text-sm max-w-md">
                                    2. {activeScenario.choices[1].text}
                                </div>
                                <div className="text-white font-bold text-xs uppercase tracking-wider mt-4">
                                    What is your choice?
                                </div>
                            </div>
                        </div>
                    )}

                    {gameState === "consequence" && lastConsequence && (
                        /* Consequence */
                        <div className="flex flex-col gap-6 text-center items-center">
                            <h2 className="text-white font-bold pb-2 text-base md:text-lg uppercase tracking-wider border-b border-neutral-800 w-full max-w-md mx-auto">
                                OUTCOME
                            </h2>
                            <p className="text-neutral-300 italic leading-relaxed text-sm md:text-base max-w-lg mx-auto">
                                {lastConsequence.consequence}
                            </p>
                            <div className="bg-neutral-900 border border-neutral-800 p-4 font-mono text-xs text-neutral-400 mt-2 flex flex-col gap-2 w-full max-w-sm rounded">
                                <div>
                                    COMPANY HEALTH: {lastConsequence.coHealthImpact >= 0 ? `+${lastConsequence.coHealthImpact}` : lastConsequence.coHealthImpact}
                                </div>
                                <div>
                                    PERSONAL HEALTH: {lastConsequence.perHealthImpact >= 0 ? `+${lastConsequence.perHealthImpact}` : lastConsequence.perHealthImpact}
                                </div>
                                <div>
                                    SADIES TRUST: {lastConsequence.trustImpact >= 0 ? `+${lastConsequence.trustImpact}` : lastConsequence.trustImpact}
                                </div>
    
                            </div>
                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={handleContinue}
                                    className="px-6 py-2 border border-white text-white text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all cursor-pointer rounded"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {gameState === "won" && (
                        /* Win Screen */
                        <div className="flex flex-col gap-6 items-center">
                            <div className="border border-white p-4 font-bold text-white text-sm w-full max-w-xs">
                                FINAL SCORE: {((companyHealth + personalHealth + sadieTrust) / 10).toFixed(1)} / 30.0
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Command Prompt Bar */}
            <div className="bg-black px-4 py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 select-none">
                
                {/* Prompt Line */}
                <div className="flex items-center gap-2 flex-grow text-sm">
                    <span className="text-white font-bold">&gt;</span>
                    {gameState !== "won" ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                gameState === "backstory"
                                    ? "Press Enter to start..."
                                    : gameState === "playing"
                                    ? "What is your choice? [1] or [2]..."
                                    : "Press Enter to continue..."
                            }
                            className="flex-grow bg-transparent border-none outline-none focus:ring-0 p-0 text-white font-mono pl-1"
                        />
                    ) : (
                        <span className="text-neutral-500 italic pl-1">
                            Simulation concluded.
                        </span>
                    )}
                </div>

                {/* Mobile Friendly Direct Click Buttons */}
                {gameState === "playing" && (
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => handleAction(0)}
                            className="flex-1 sm:flex-initial px-5 py-1.5 border border-white bg-black text-white text-xs tracking-wider uppercase hover:bg-white hover:text-black transition-colors cursor-pointer text-center rounded animate-pulse"
                        >
                            1
                        </button>
                        <button
                            onClick={() => handleAction(1)}
                            className="flex-1 sm:flex-initial px-5 py-1.5 border border-white bg-black text-white text-xs tracking-wider uppercase hover:bg-white hover:text-black transition-colors cursor-pointer text-center rounded animate-pulse"
                        >
                            2
                        </button>
                    </div>
                )}
                {gameState === "consequence" && (
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleContinue}
                            className="w-full sm:w-auto px-6 py-1.5 border border-white bg-black text-white text-xs tracking-wider uppercase hover:bg-white hover:text-black transition-colors cursor-pointer text-center rounded"
                        >
                            Continue
                        </button>
                    </div>
                )}
            </div>

        </main>
    );
}
