// MultiStopOSRMRoute.js - OSRM integration with support for multiple waypoints
import React, { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import districts from "../json/districts.json";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Fix Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Create a custom marker icon for waypoints
const waypointIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [15, 24],
  iconAnchor: [7, 24],
  popupAnchor: [1, -24],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [24, 24],
  shadowAnchor: [7, 24],
});

const MultiStopOSRMRoute = ({ waypoints = [], onRouteCalculated }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routeLayer, setRouteLayer] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [error, setError] = useState(null);
  const districtCoordinates = districts;

  // Default values for generating costs
  const costFactors = {
    fuelCostPerKm: 1600, // Rp per km
    tollCostPerKm: 450, // Rp per km (approximate)
    maintenanceCostPerKm: 250, // Rp per km
    driverCostPerDay: 100000, // Rp per day
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const mapInstance = L.map(mapRef.current).setView([-2.5489, 118.0149], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance);

    setMap(mapInstance);

    return () => {
      mapInstance.remove();
    };
  }, []);

  // Fetch route from OSRM API for multiple stops
  const fetchMultiStopRoute = async (waypointList) => {
    if (waypointList.length < 2) {
      setError("Minimal 2 titik diperlukan untuk menghitung rute");
      return null;
    }

    // Convert city names to coordinates
    // const coordinateList = waypointList.map(city => districtCoordinates[city.toLowerCase()]);
    const coordinateList = waypointList.map(
      (city) => districtCoordinates[city]
    );
    if (coordinateList.some((coord) => !coord)) {
      setError("Koordinat tidak ditemukan untuk satu atau lebih lokasi");
      return null;
    }

    try {
      const allPermutations = generateAllPermutations(coordinateList);
      const defaultPosition = allPermutations[0];
      const start = defaultPosition[0];

      let end;
      const endCompares = [];
      for (let i = 0; i < defaultPosition.length; i++) {
        if (i === 0) {
          continue;
        }

        const coordinate = `${start.lng},${start.lat};${defaultPosition[i].lng},${defaultPosition[i].lat}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${coordinate}?overview=full&geometries=polyline&steps=true&annotations=true`;
        const response = await fetch(url);
        const resJson = await response.json();
        setTimeout(() => null, 250);
        endCompares.push({
          data: defaultPosition[i],
          result: resJson,
          distance: resJson?.routes?.[0].distance || -1,
        });
      }

      endCompares.sort((a, b) => b.distance - a.distance);

      end = endCompares[0].data;
      const resultPermutations = allPermutations.filter((ap) => {
        if (
          ap[0].store_code === start.store_code &&
          ap[ap.length - 1].store_code === end.store_code
        ) {
          return true;
        }
        return false;
      });

      const compares = [];
      for (let i = 0; i < resultPermutations.length; i++) {
        const locations = resultPermutations[i];
        const coordinates = locations
          .map((coord) => `${coord.lng},${coord.lat}`)
          .join(";");
        const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=polyline&steps=true&annotations=true`;
        const response = await fetch(url);
        const resJson = await response.json();
        setTimeout(() => null, 250);

        compares.push({
          data: locations,
          result: resJson,
          distance: resJson?.routes?.[0].distance || -1,
        });
      }

      compares.sort((a, b) => a.distance - b.distance);

      if (compares[0]?.result.code !== "Ok") {
        throw new Error(data.message || "Failed to fetch route");
      }

      const optimResult = compares[0];
      const newWayPoints = [];
      const storeCodes = optimResult.data.map((r) => r.store_code);
      for (let i = 0; i < storeCodes.length; i++) {
        if (newWayPoints.length >= optimResult.data.length) {
          break;
        }

        for (const [key, value] of Object.entries(districtCoordinates)) {
          if (value.store_code === storeCodes[i]) {
            newWayPoints.push(key);
            break;
          }
        }
      }

      return { result: optimResult.result, new_waypoints: newWayPoints };
      // return { compares[0].result, new_waypoints: compares[0].data.map((wp) => wp.) };
    } catch (error) {
      console.error("Error fetching route:", error);
      setError("Failed to fetch route. Using fallback method.");
      return null;
    }
  };

  const generateAllPermutations = (arr) => {
    // Base case
    if (arr.length <= 1) {
      return [arr];
    }

    const result = [];

    // For each element in the array
    for (let i = 0; i < arr.length; i++) {
      // Take the current element
      const current = arr[i];

      // Get all permutations of the remaining elements
      const remainingElements = [...arr.slice(0, i), ...arr.slice(i + 1)];
      const remainingPermutations = generateAllPermutations(remainingElements);

      // Add the current element to the front of each permutation of the remaining elements
      for (let j = 0; j < remainingPermutations.length; j++) {
        result.push([current, ...remainingPermutations[j]]);
      }
    }

    return result;
  };

  // Calculate costs based on distance and duration
  const calculateCosts = (distance, duration) => {
    if (!distance) return null;

    const durationHours = duration / 3600; // OSRM provides duration in seconds
    const days = Math.ceil(durationHours / 8); // Assuming 8-hour workday

    const fuelCost = distance * costFactors.fuelCostPerKm;
    const tollCost = distance * costFactors.tollCostPerKm * 0.7; // Assuming 70% of route is toll roads
    const maintenanceCost = distance * costFactors.maintenanceCostPerKm;
    const driverCost = days * costFactors.driverCostPerDay;

    return {
      fuelCost: Math.round(fuelCost),
      tollCost: Math.round(tollCost),
      maintenanceCost: Math.round(maintenanceCost),
      driverCost: Math.round(driverCost),
      totalCost: Math.round(fuelCost + tollCost + maintenanceCost + driverCost),
    };
  };

  // Convert polyline to array of latlng points
  const decodePolyline = (encodedPolyline) => {
    const points = [];
    let index = 0;
    const len = encodedPolyline.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;

      do {
        b = encodedPolyline.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encodedPolyline.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push([lat * 1e-5, lng * 1e-5]);
    }

    return points;
  };

  // Process OSRM steps to app-friendly format
  const processMultiStopOSRMSteps = (route, cityNames) => {
    const steps = [];
    let totalDistance = 0;

    // Add starting step
    steps.push({
      instruction: `Mulai dari ${cityNames[0]}`,
      distance: "0 km",
      icon: "play",
    });

    route.legs.forEach((leg, legIndex) => {
      // Add major waypoint step if this isn't the first leg
      if (legIndex > 0) {
        steps.push({
          instruction: `Tiba di ${cityNames[legIndex]}`,
          distance: `${(totalDistance / 1000).toFixed(1)} km`,
          icon: "location-pin",
        });

        steps.push({
          instruction: `Lanjutkan perjalanan dari ${cityNames[legIndex]}`,
          distance: `${(totalDistance / 1000).toFixed(1)} km`,
          icon: "play",
        });
      }

      // Process all the steps in this leg
      leg.steps.forEach((step, stepIndex) => {
        // Skip very short steps to avoid clutter
        if (
          stepIndex > 0 &&
          step.distance < 1000 &&
          steps.length > 1 &&
          stepIndex < leg.steps.length - 1
        ) {
          totalDistance += step.distance;
          return;
        }

        totalDistance += step.distance;

        const kmDistance = (totalDistance / 1000).toFixed(1);

        // Determine icon based on maneuver
        let icon = "road";
        if (step.maneuver.type === "turn") {
          if (step.maneuver.modifier.includes("right")) {
            icon = "turn-right";
          } else if (step.maneuver.modifier.includes("left")) {
            icon = "turn-left";
          }
        }

        // Only add significant turns and road changes
        if (
          stepIndex === 0 ||
          step.distance > 10000 ||
          step.maneuver.type === "turn" ||
          step.maneuver.type === "roundabout" ||
          step.name !== leg.steps[stepIndex - 1]?.name
        ) {
          // Clean up instruction
          let instruction = step.name
            ? `${step.maneuver.type === "turn" ? "Belok" : "Lanjutkan"} ke ${
                step.name
              }`
            : `${step.maneuver.type === "turn" ? "Belok" : "Lanjutkan"} ${
                step.maneuver.modifier === "straight"
                  ? "lurus"
                  : step.maneuver.modifier
              }`;

          // Add city name to instruction for significant changes
          if (step.distance > 50000) {
            instruction += ` menuju ${cityNames[legIndex + 1]}`;
          }

          steps.push({
            instruction,
            distance: `${kmDistance} km`,
            icon,
          });
        }
      });
    });

    // Add final arrival step
    steps.push({
      instruction: `Tiba di ${cityNames[cityNames.length - 1]}`,
      distance: `${(totalDistance / 1000).toFixed(1)} km`,
      icon: "flag-checkered",
    });

    return {
      steps,
      totalDistance: totalDistance / 1000,
      totalDistanceText: `${(totalDistance / 1000).toFixed(1)} km`,
    };
  };

  // Fallback to generate a more realistic route when OSRM API fails
  const generateFallbackMultiStopRoute = (waypointList) => {
    if (waypointList.length < 2) return null;

    // Convert city names to coordinates
    const coordinateList = waypointList.map(
      (city) => districtCoordinates[city.toLowerCase()]
    );

    if (coordinateList.some((coord) => !coord)) return null;

    // Generate points for each segment
    const allPoints = [];
    let totalDistance = 0;
    let totalDuration = 0;
    const steps = [];

    // Add starting step
    steps.push({
      instruction: `Mulai dari ${waypointList[0]}`,
      distance: "0 km",
      icon: "play",
    });

    // Process each segment
    for (let i = 0; i < coordinateList.length - 1; i++) {
      const startCoord = coordinateList[i];
      const endCoord = coordinateList[i + 1];

      // Calculate direct distance for this segment
      const latDiff = endCoord.lat - startCoord.lat;
      const lngDiff = endCoord.lng - startCoord.lng;
      const directDistance =
        Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111.32; // km

      // Apply winding factor to simulate roads
      const windingFactor = 1.3;
      const segmentDistance = directDistance * windingFactor;
      totalDistance += segmentDistance;

      // Estimate time based on average speed (60 km/h)
      const segmentDuration = segmentDistance * 60; // seconds
      totalDuration += segmentDuration;

      // Generate realistic waypoints with random deviations
      const segmentPoints = [];
      const numPoints = Math.max(10, Math.round(directDistance * 2));

      for (let j = 0; j <= numPoints; j++) {
        const ratio = j / numPoints;

        // Perpendicular deviation to make route look like real roads
        const maxDeviation = directDistance * 0.05; // Max 5% deviation
        const deviation = ((Math.random() - 0.5) * maxDeviation) / 111.32;

        // Perpendicular vector
        const perpLat = -lngDiff * deviation;
        const perpLng = latDiff * deviation;

        segmentPoints.push([
          startCoord.lat + latDiff * ratio + perpLat,
          startCoord.lng + lngDiff * ratio + perpLng,
        ]);
      }

      // Add all points from this segment
      allPoints.push(...segmentPoints);

      // Add step for arrival at intermediate waypoint
      if (i < coordinateList.length - 2) {
        steps.push({
          instruction: `Perjalanan menuju ${waypointList[i + 1]}`,
          distance: `${Math.round(totalDistance)} km`,
          icon: "road",
        });

        steps.push({
          instruction: `Tiba di ${waypointList[i + 1]}`,
          distance: `${Math.round(totalDistance)} km`,
          icon: "location-pin",
        });

        steps.push({
          instruction: `Lanjutkan dari ${waypointList[i + 1]} menuju ${
            waypointList[i + 2]
          }`,
          distance: `${Math.round(totalDistance)} km`,
          icon: "play",
        });
      } else {
        // Last segment
        steps.push({
          instruction: `Perjalanan menuju ${waypointList[i + 1]}`,
          distance: `${Math.round(totalDistance)} km`,
          icon: "road",
        });
      }
    }

    // Add final arrival step
    steps.push({
      instruction: `Tiba di ${waypointList[waypointList.length - 1]}`,
      distance: `${Math.round(totalDistance)} km`,
      icon: "flag-checkered",
    });

    return {
      route: {
        distance: Math.round(totalDistance),
        duration: totalDuration,
        steps,
      },
      points: allPoints,
    };
  };

  // Calculate route when waypoints change
  useEffect(() => {
    if (!map || waypoints.length < 2) return;

    // Clear previous markers and route
    markers.forEach((marker) => marker.remove());
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    setLoading(true);
    setError(null);

    // Fetch route from OSRM API
    const getMultiStopRoute = async () => {
      const { result: routeData, new_waypoints } = await fetchMultiStopRoute(
        waypoints
      );

      let points = [];
      let routeInfo = null;
      let isEstimated = false;

      if (routeData && routeData.routes && routeData.routes.length > 0) {
        // Use the OSRM API response
        const osrmRoute = routeData.routes[0];

        // Decode the polyline
        points = decodePolyline(osrmRoute.geometry);

        // Process the distance and duration
        const totalDistanceKm = Math.round(osrmRoute.distance / 1000);
        const totalDurationSec = osrmRoute.duration;

        const hours = Math.floor(totalDurationSec / 3600);
        const minutes = Math.floor((totalDurationSec % 3600) / 60);
        const durationStr = `${hours} ${hours > 1 ? "hours": "hour"} ${minutes} ${minutes > 1 ? "minutes": "minute"}`;

        // Process detailed steps with city names
        const processedSteps = processMultiStopOSRMSteps(
          osrmRoute,
          new_waypoints
        );

        // Calculate costs
        const costs = calculateCosts(totalDistanceKm, totalDurationSec);

        routeInfo = {
          distance: totalDistanceKm,
          duration: durationStr,
          durationSeconds: totalDurationSec,
          steps: processedSteps.steps,
          costs,
          legs: osrmRoute.legs.map((leg, i) => ({
            from: new_waypoints[i],
            to: new_waypoints[i + 1],
            distance: Math.round(leg.distance / 1000),
            duration: Math.floor(leg.duration / 60),
          })),
        };
      } else {
        // Use fallback method
        const fallback = generateFallbackMultiStopRoute(new_waypoints);
        if (fallback) {
          points = fallback.points;
          routeInfo = fallback.route;

          // Add legs information for the fallback route
          routeInfo.legs = [];
          let cumulativeDistance = 0;

          for (let i = 0; i < new_waypoints.length - 1; i++) {
            const startCoord =
              districtCoordinates[new_waypoints[i].toLowerCase()];
            const endCoord =
              districtCoordinates[new_waypoints[i + 1].toLowerCase()];

            // Calculate direct distance for this segment
            const latDiff = endCoord.lat - startCoord.lat;
            const lngDiff = endCoord.lng - startCoord.lng;
            const directDistance =
              Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111.32; // km

            // Apply winding factor
            const windingFactor = 1.3;
            const segmentDistance = Math.round(directDistance * windingFactor);
            cumulativeDistance += segmentDistance;

            // Estimate time based on average speed (60 km/h)
            const segmentDuration = Math.round((segmentDistance * 60) / 60); // minutes

            routeInfo.legs.push({
              from: new_waypoints[i],
              to: new_waypoints[i + 1],
              distance: segmentDistance,
              duration: segmentDuration,
            });
          }

          isEstimated = true;
        }
      }

      if (points.length > 0) {
        // Create polyline for the route
        const routePolyline = L.polyline(points, {
          color: "#2563eb",
          weight: 5,
          opacity: 0.7,
        }).addTo(map);

        setRouteLayer(routePolyline);

        // Fit map to show the entire route
        map.fitBounds(routePolyline.getBounds(), {
          padding: [50, 50],
          maxZoom: 13,
        });
      }

      setLoading(false);

      if (routeInfo && onRouteCalculated) {
        onRouteCalculated({
          ...routeInfo,
          isEstimated,
          waypoints,
        });
      }

      // Add markers for all waypoints
      const newMarkers = [];
      new_waypoints.forEach((city, index) => {
        const coords = districtCoordinates[city];
        if (!coords) return;

        // Use different markers for start, intermediate, and end points
        const icon =
          index === 0
            ? L.Icon.Default // Start
            : index === new_waypoints.length - 1
            ? L.Icon.Default // End
            : waypointIcon; // Intermediate

        const marker = L.marker([coords.lat, coords.lng])
          .addTo(map)
          .bindPopup(
            `<b>${coords.store_name}</b><br>${
              index === 0
                ? "Start Point"
                : index === new_waypoints.length - 1
                ? "End Point"
                : `Next Stop ${index}`
            }`
          );

        // Open popup for the first marker
        if (index === 0) marker.openPopup();

        newMarkers.push(marker);
      });

      setMarkers(newMarkers);
    };

    getMultiStopRoute();
  }, [waypoints.join(","), map]);

  return (
    <div className="multi-stop-osrm-route-map">
      {loading && (
        <div
          className="loading-overlay"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="loading-spinner"
            style={{
              padding: "10px 20px",
              backgroundColor: "white",
              borderRadius: "4px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            Loading...
          </div>
        </div>
      )}

      {error && (
        <div
          className="error-message"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            padding: "0.75rem",
            borderRadius: "0.375rem",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      <div
        ref={mapRef}
        style={{
          height: "400px",
          width: "100%",
          borderRadius: "0.5rem",
          position: "relative",
        }}
      ></div>
    </div>
  );
};

export default MultiStopOSRMRoute;
