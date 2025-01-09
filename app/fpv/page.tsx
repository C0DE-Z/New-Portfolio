"use client"
import React from 'react';
import GridBackground from "../../components/ui/grid-backround";

const FpvPage = () => {
    return (
        <>
            <h1 className="text-5xl font-bold text-center mt-8">Drones</h1>

            <div className=" text-white min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-10">My Arsenal</h1>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <li className="flex flex-col items-center">
                        <img className="w-48 h-auto rounded-lg shadow-lg" src="/images/fpv-quad.jpg" alt="5 FPV Quad" />
                        <span className="mt-4 text-xl">5&quot; FPV Quad</span>
                         <span className="mt-4 text-base">5&quot; Parts: Speedybee405v3, Foxxer Razer Mini, Tbs source one v5, SpeedyBeetx800, Elrs, Stinger. </span>
                    </li>
                    <li className="flex flex-col items-center">
                        <img className="w-48 h-auto rounded-lg shadow-lg" src="/images/meteor-75.jpg" alt="Meteor 75 Whoop" />
                        <span className="mt-4 text-xl">Meteor 75 Whoop</span>
                    </li>
                    <li className="flex flex-col items-center">
                        <img className="w-48 h-auto rounded-lg shadow-lg" src="/images/dji-mini-2.jpg" alt="DJI Mini 2" />
                        <span className="mt-4 text-xl">DJI Mini 2</span>
                    </li>
                </ul>
                <h1 className="text-4xl mt-10 font-bold mb-8">Tools and Equipment</h1>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <li className="flex flex-col items-center">
                        <span className="mt-4 text-xl">Radio / Controller </span>
                        <span className="mt-4 text-l">Radio Master Zorro </span>
                    </li>
                    <li className="flex flex-col items-center">
                        <span className="mt-4 text-xl">Goggles</span>
                        <span className="mt-4 text-l">BetaFpv Vr03</span>
                    </li>
                    <li className="flex flex-col items-center">
                    <span className="mt-4 text-xl">Prefered Fc Software </span>
                        <span className="mt-4 text-l">Betaflight</span>
                    </li>
                </ul>
            </div>

            <GridBackground />
        </>
    );
};

export default FpvPage;

