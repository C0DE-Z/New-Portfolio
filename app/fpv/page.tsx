import React from 'react';
import './FpvPage.css'; // Assuming you have a CSS file for styling
// ...existing code...

const FpvPage = () => {
    return (
        <div className="fpv-page">
            <h1>FPV Page</h1>
            <div className="drone-display">
                <h2>My Drones</h2>
                <ul>
                    <li>
                        <img src="/images/fpv-quad.jpg" alt="5 FPV Quad" />
                        <span>5&quot; FPV Quad</span>
                    </li>
                    <li>
                        <img src="/images/meteor-75.jpg" alt="Meteor 75 Whoop" />
                        <span>Meteor 75 Whoop</span>
                    </li>
                    <li>
                        <img src="/images/dji-mini-2.jpg" alt="DJI Mini 2" />
                        <span>DJI Mini 2</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default FpvPage;

