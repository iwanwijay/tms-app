import React, { useState } from "react";
import "./waypointTracking.css";

const WaypointTracking = ({ waypoints }) => {
    const plannedRoute = waypoints;
    const [actualRoute, setActualRoute] = useState([]);

    const handleCheckpoint = () => {
        if (actualRoute.length < plannedRoute.length) {
            setActualRoute([...actualRoute, plannedRoute[actualRoute.length]]);
        }
    };

    return (
        <div className="container">
            {/* Planned Route */}
            <h2>Planned Route</h2>
            <div className="route">
                {waypoints.map((waypoint, index) => (
                    <div key={index} className="step">
                        <div className="circle">{waypoint.store_code}</div>
                        {index < plannedRoute.length - 1 && <span className="arrow">→</span>}
                    </div>
                ))}
            </div>

            {/* Actual Route */}
            <h2>Actual Route</h2>
            <div className="route">
                {waypoints.map((waypoint, index) => (
                    <div key={index} className="step">
                        {actualRoute.includes(waypoint) ? (
                            <>
                                <div className="circle completed">{waypoint.store_code}</div>
                                {index < plannedRoute.length - 1 && <span className="arrow">→</span>}
                            </>
                        ) : (
                            <>
                                <div className="no-circle hidden"></div>
                                {index < plannedRoute.length - 1 && <span className="no-arrow">→</span>}
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <button onClick={handleCheckpoint} className="submit-btn">
                Submit Checkpoint
            </button>
        </div>
    );
};

export default WaypointTracking;
