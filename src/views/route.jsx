import React, { useState, useEffect } from "react";
import {
  faPlay,
  faRoad,
  faArrowsTurnRight,
  faFlagCheckered,
  faShip,
  faInfoCircle,
  faLocationDot,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Map from "../components/map";
import Modal from "../components/modal";
import WaypointTracking from "../components/waypointTracking";
import districts from "../json/districts.json";
import { useSearchParams } from "react-router-dom";
import planners from "../json/planners.json";

const RouteDelivery = () => {
  const planners_data = planners;
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("id");

  const [waypoints, setWaypoints] = useState([""]);
  const [showRouteResults, setShowRouteResults] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [routeDetails, setRouteDetails] = useState(null);
  const [vehicleType, setVehicleType] = useState("CDD");
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const indonesianCities = Object.entries(districts)
    .filter(([_, value]) => value.store_code && value.store_name)
    .map(([key, value]) => ({
      name: key,
      store_code: value.store_code,
      store_name: value.store_name,
    }));
  const mappingDistricts = indonesianCities.map((d) => ({
    ...d,
    label: d.name,
    value: d.name,
  }));

  useEffect(() => {
    if (planners_data[planId]) {
      if (
        planners_data?.[planId]?.[0]?.waypoints &&
        Array.isArray(planners_data[planId][0].waypoints) &&
        planners_data[planId][0].waypoints.length
      ) {
        calculateRoute(planners_data[planId][0].waypoints);
      }
    }
  }, [planId]);

  // Add another waypoint field
  const addWaypoint = () => {
    setWaypoints([...waypoints, ""]);
  };

  // Remove a waypoint
  const removeWaypoint = (index) => {
    // Don't remove if there are only 2 waypoints
    if (waypoints.length <= 2) return;

    const newWaypoints = [...waypoints];
    newWaypoints.splice(index, 1);
    setWaypoints(newWaypoints);
  };

  // Update a waypoint value
  const updateWaypoint = (index, value) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = value;
    setWaypoints(newWaypoints);
  };

  const calculateRoute = (wps) => {
    setWaypoints(wps);
    // Filter out any empty waypoints
    const filteredWaypoints = wps.filter((wp) => wp);

    if (filteredWaypoints.length < 2) {
      alert("Pilih minimal 2 lokasi untuk menghitung rute.");
      return;
    }

    // Check for duplicates next to each other
    for (let i = 0; i < filteredWaypoints.length - 1; i++) {
      if (filteredWaypoints[i] === filteredWaypoints[i + 1]) {
        alert("Cannot use same route!");
        return;
      }
    }

    setLoading(true);
    setShowRouteResults(true);
    setWaypoints(filteredWaypoints); // Update state with filtered waypoints
  };

  const handleRouteCalculated = (routeData) => {
    setLoading(false);

    if (routeData) {
      // Adjust costs based on vehicle type
      const costMultiplier = vehicleType === "CDD" ? 1 : 0.75;
      const adjustedCosts = {
        ...routeData.costs,
        fuelCost: Math.round(routeData.costs.fuelCost * costMultiplier),
        maintenanceCost: Math.round(
          routeData.costs.maintenanceCost * costMultiplier
        ),
        tollCost: Math.round(routeData.costs.tollCost * costMultiplier),
        totalCost: Math.round(
          routeData.costs.fuelCost * costMultiplier +
            routeData.costs.maintenanceCost * costMultiplier +
            routeData.costs.tollCost * costMultiplier +
            routeData.costs.driverCost
        ),
      };

      const mappedWaypoints = routeData.waypoints.map((waypoint) => districts[waypoint] || {});
      setRouteDetails({
        ...routeData,
        costs: adjustedCosts,
        mappedWaypoints: mappedWaypoints,
      });
      setShowRouteResults(false);
      setShowDetails(true);
    }
  };

  // Function to get icon for route step instructions
  const getStepIcon = (step) => {
    if (step.icon === "play") return faPlay;
    if (step.icon === "road") return faRoad;
    if (step.icon === "turn-right") return faArrowsTurnRight;
    // if (step.icon === 'turn-left') return faArrowLeft;
    if (step.icon === "flag-checkered") return faFlagCheckered;
    if (step.icon === "ship") return faShip;
    if (step.icon === "location-pin") return faMapMarkerAlt;
    return faRoad; // Default icon
  };

  // Helper function to format currency
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID").format(number);
  };

  return (
    <main className="container dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Route Delivery</h1>
      </div>

      <div className="section">
        <div className="section-header" style={{ marginBottom: 0 }}>
          <h2 className="section-title">Plan {Number(planId) + 1}</h2>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <div className="multi-stop-form">
            {waypoints.map((waypoint, index) => (
              <div
                key={index}
                className="waypoint-row"
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              ></div>
            ))}
          </div>
        </div>

        <div
          className="vehicle-type-selector"
          style={{
            marginBottom: "1rem",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <label style={{ fontSize: "1.1rem", marginRight: "1rem" }}>
            Vehicle type: <b>{planners_data[planId][0]["vehicle"]}</b>
          </label>
          <button
            className="secondary"
            disabled={!Boolean(routeDetails?.legs)}
            onClick={() => setOpenModal(true)}
          >
            See detail
          </button>
        </div>

        <div style={{ position: "relative" }}>
          <Map
            waypoints={showRouteResults ? waypoints.filter((wp) => wp) : []}
            onRouteCalculated={handleRouteCalculated}
          />
        </div>

        {(showRouteResults || showDetails) && routeDetails && (
          <div id="route-results" className="route-results">
            {routeDetails.isEstimated && (
              <div
                className="route-estimated-note"
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                  color: "var(--warning)",
                  padding: "0.75rem",
                  borderRadius: "0.375rem",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                <span>
                  Rute ini diperkirakan. Data rute yang tepat mungkin tidak
                  tersedia untuk lokasi yang dipilih.
                </span>
              </div>
            )}

            <div
              className="route-summary"
              style={{
                backgroundColor: "var(--primary)",
                color: "white",
                padding: "1rem",
                borderRadius: "0.375rem",
                marginBottom: "1.5rem",
              }}
            >
              <h3
                style={{
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                  fontSize: "1.125rem",
                }}
              >
                Route Summary
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem 2rem",
                  justifyContent: "center"
                }}
              >
                <div>
                  <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                    Total Distance
                  </div>
                  <div style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
                    {routeDetails.distance} km
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                    Shipping Time
                  </div>
                  <div style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
                    {routeDetails.duration}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                    Total Price
                  </div>
                  <div style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
                    {/* Rp {formatRupiah(routeDetails.costs?.totalCost || 0)} */}
                    {planners_data[planId][0]["total_price_text"]}
                  </div>
                </div>
              </div>
            </div>
            {routeDetails ? <WaypointTracking waypoints={routeDetails.mappedWaypoints} /> : <></>}
          </div>
        )}
      </div>

      {routeDetails?.legs ? (
        <Modal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          title={"Detail"}
        >
          <div className="section">
            {routeDetails.legs && (
              <div className="route-legs" style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ marginBottom: "0.75rem", fontWeight: "bold" }}>
                  Route Detail
                </h3>
                <div
                  className="legs-container"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {routeDetails.legs.map((leg, index) => (
                    <div
                      key={index}
                      className="leg-item"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "0.375rem",
                        padding: "0.75rem",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faLocationDot}
                          style={{ color: "var(--primary)" }}
                        />
                        <span style={{ fontWeight: "bold" }}>
                        {routeDetails.mappedWaypoints[index].store_name} ke {routeDetails.mappedWaypoints[index + 1].store_name}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "2rem",
                          color: "var(--secondary)",
                          fontSize: "0.875rem",
                        }}
                      >
                        <div>Distance: {leg.distance} km</div>
                        <div>
                          Time: {Math.floor(leg.duration / 60)} hour{" "}
                          {leg.duration % 60} minutes
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {routeDetails.steps && (
              <div className="route-details">
                <h3 style={{ marginTop: "1.5rem", marginBottom: "0.75rem" }}>
                  Route Path:
                </h3>
                {routeDetails.steps.map((step, index) => (
                  <div className="route-step" key={index}>
                    <div className="route-step-icon">
                      <FontAwesomeIcon icon={getStepIcon(step)} />
                    </div>
                    <div className="route-step-instruction" style={{ textAlign: 'left' }}>
                      {step.instruction}
                    </div>
                    <div className="route-step-distance">{step.distance}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      ) : (
        <></>
      )}
    </main>
  );
};

export default RouteDelivery;
