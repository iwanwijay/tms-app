// App.js - With Multi-Stop Route Planning
import React, { useState } from "react";
import "./App.css";
import MultiStopOSRMRoute from "./components/map";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faBell,
  faUser,
  faPlus,
  faTruckLoading,
  faClock,
  faDollarSign,
  faPlay,
  faRoad,
  faArrowsTurnRight,
  // faArrowLeft,
  faFlagCheckered,
  faShip,
  faEye,
  faEdit,
  faPhone,
  faCalendar,
  faArrowUp,
  faArrowDown,
  faInfoCircle,
  faLocationDot,
  faTimes,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import districts from "./districts.json";
import Search from "./components/search";
import WaypointTracking from "./components/waypointTracking";

function App() {
  const [waypoints, setWaypoints] = useState([""]);
  const [showRouteResults, setShowRouteResults] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [routeDetails, setRouteDetails] = useState(null);
  const [vehicleType, setVehicleType] = useState("CDD");
  const [loading, setLoading] = useState(false);

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

  const calculateRoute = () => {
    // Filter out any empty waypoints
    const filteredWaypoints = waypoints.filter((wp) => wp);

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

  const handleRowClick = (id) => {
    // In a real application, this would open detailed view
    console.log("Row clicked:", id);
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
    <div className="app">
      <header>
        <div className="container">
          <nav>
            <div className="logo">
              <FontAwesomeIcon icon={faTruck} className="logo-icon" />
              <span>TMS</span>
            </div>
            <div className="nav-links">
              <a href="#" className="active">
                Dashboard
              </a>
              <a href="#">Pengiriman</a>
              <a href="#">Kendaraan</a>
              <a href="#">Pengemudi</a>
              <a href="#">Rute</a>
              <a href="#">Laporan</a>
              <a href="#">Pengaturan</a>
            </div>
            <div className="user-menu">
              <button className="secondary">
                <FontAwesomeIcon icon={faBell} />
              </button>
              <button>
                <FontAwesomeIcon icon={faUser} />
                Admin
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="container dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <button>
            <FontAwesomeIcon icon={faPlus} />
            Pengiriman Baru
          </button>
        </div>

        <div className="cards">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Pengiriman Aktif</div>
              <div
                className="card-icon"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <FontAwesomeIcon icon={faTruckLoading} />
              </div>
            </div>
            <div className="card-content">
              <div className="card-value">42</div>
            </div>
            <div className="card-footer">
              <span className="card-trend-up">
                <FontAwesomeIcon icon={faArrowUp} />
                8%
              </span>
              <span>vs minggu lalu</span>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Kendaraan Tersedia</div>
              <div
                className="card-icon"
                style={{ backgroundColor: "var(--success)" }}
              >
                <FontAwesomeIcon icon={faTruck} />
              </div>
            </div>
            <div className="card-content">
              <div className="card-value">24</div>
            </div>
            <div className="card-footer">
              <span className="card-trend-down">
                <FontAwesomeIcon icon={faArrowDown} />
                3%
              </span>
              <span>vs minggu lalu</span>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Pengiriman Tepat Waktu</div>
              <div
                className="card-icon"
                style={{ backgroundColor: "var(--warning)" }}
              >
                <FontAwesomeIcon icon={faClock} />
              </div>
            </div>
            <div className="card-content">
              <div className="card-value">94%</div>
            </div>
            <div className="card-footer">
              <span className="card-trend-up">
                <FontAwesomeIcon icon={faArrowUp} />
                2%
              </span>
              <span>vs bulan lalu</span>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Pendapatan Bulanan</div>
              <div
                className="card-icon"
                style={{ backgroundColor: "var(--secondary)" }}
              >
                <FontAwesomeIcon icon={faDollarSign} />
              </div>
            </div>
            <div className="card-content">
              <div className="card-value">Rp87,5 Jt</div>
            </div>
            <div className="card-footer">
              <span className="card-trend-up">
                <FontAwesomeIcon icon={faArrowUp} />
                12%
              </span>
              <span>vs bulan lalu</span>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Route Calculation</h2>
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
                >
                  <div style={{ flex: 1 }}>
                    <label
                      htmlFor={`waypoint-${index}`}
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      {index === 0
                        ? "Start point"
                        : index === waypoints.length - 1
                        ? "End point"
                        : `Stop ${index}`}
                    </label>

                    <div>
                      <div style={{ marginBottom: "1rem" }}>
                        <Search
                          id={`waypoint-${index}`}
                          options={mappingDistricts}
                          placeholder="Select district..."
                          onChange={(e) => updateWaypoint(index, e.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Remove button - only show for intermediate waypoints when there are more than 2 waypoints */}
                  {waypoints.length > 2 &&
                    index > 0 &&
                    index < waypoints.length - 1 && (
                      <button
                        className="remove-waypoint"
                        onClick={() => removeWaypoint(index)}
                        style={{
                          backgroundColor: "transparent",
                          color: "var(--danger)",
                          border: "1px solid var(--danger)",
                          borderRadius: "0.25rem",
                          padding: "0.5rem 0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    )}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                onClick={addWaypoint}
                className="secondary"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <FontAwesomeIcon icon={faPlus} />
                Add stop
              </button>

              <button
                onClick={calculateRoute}
                disabled={loading}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                {loading ? "Loading..." : "Calculate Route"}
              </button>
            </div>
          </div>

          <div
            className="vehicle-type-selector"
            style={{ marginBottom: "1rem" }}
          >
            <label style={{ marginRight: "1rem" }}>Vehicle type:</label>
            <label style={{ marginRight: "1rem" }}>
              <input
                type="radio"
                value="CDD"
                checked={vehicleType === "CDD"}
                onChange={() => setVehicleType("CDD")}
                style={{ marginRight: "0.5rem" }}
              />
              CDD
            </label>
            <label>
              <input
                type="radio"
                value="CDE"
                checked={vehicleType === "CDE"}
                onChange={() => setVehicleType("CDE")}
                style={{ marginRight: "0.5rem" }}
              />
              CDE
            </label>
          </div>

          <div style={{ position: "relative" }}>
            {/* Multi-Stop OSRM Integration */}
            <MultiStopOSRMRoute
              waypoints={showRouteResults ? waypoints.filter((wp) => wp) : []}
              onRouteCalculated={handleRouteCalculated}
            />
            {routeDetails && <WaypointTracking waypoints={routeDetails.mappedWaypoints} />}
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
                  Ringkasan Rute
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem 2rem",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                      Total Jarak
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
                      {routeDetails.distance} km
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                      Waktu Tempuh
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
                      {routeDetails.duration}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                      Total Biaya
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
                      Rp {formatRupiah(routeDetails.costs?.totalCost || 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Leg-by-leg breakdown */}
              {routeDetails.legs && (
                <div className="route-legs" style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ marginBottom: "0.75rem", fontWeight: "bold" }}>
                    Detail Perjalanan
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
                          <div>Jarak: {leg.distance} km</div>
                          <div>
                            Waktu: {Math.floor(leg.duration / 60)} jam{" "}
                            {leg.duration % 60} menit
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                className="cost-breakdown"
                style={{
                  marginTop: "1.5rem",
                  backgroundColor: "var(--light)",
                  padding: "1rem",
                  borderRadius: "0.375rem",
                }}
              >
                <h4 style={{ marginBottom: "0.75rem" }}>Rincian Biaya:</h4>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>Biaya Bahan Bakar:</span>
                  <span>
                    Rp. {formatRupiah(routeDetails.costs?.fuelCost || 0)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>Biaya Tol:</span>
                  <span>
                    Rp. {formatRupiah(routeDetails.costs?.tollCost || 0)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>Biaya Perawatan:</span>
                  <span>
                    Rp. {formatRupiah(routeDetails.costs?.maintenanceCost || 0)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>Biaya Pengemudi:</span>
                  <span>
                    Rp. {formatRupiah(routeDetails.costs?.driverCost || 0)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "0.75rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid var(--border)",
                    fontWeight: "bold",
                  }}
                >
                  <span>Total Biaya:</span>
                  <span>
                    Rp. {formatRupiah(routeDetails.costs?.totalCost || 0)}
                  </span>
                </div>
              </div>

              {routeDetails.steps && (
                <div className="route-details">
                  <h3 style={{ marginTop: "1.5rem", marginBottom: "0.75rem" }}>
                    Petunjuk Rute:
                  </h3>
                  {routeDetails.steps.map((step, index) => (
                    <div className="route-step" key={index}>
                      <div className="route-step-icon">
                        <FontAwesomeIcon icon={getStepIcon(step)} />
                      </div>
                      <div className="route-step-instruction">
                        {step.instruction}
                      </div>
                      <div className="route-step-distance">{step.distance}</div>
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}
              >
                <button>
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  Cetak Rute
                </button>
                <button className="secondary">
                  <FontAwesomeIcon icon={faPhone} className="mr-2" />
                  Kirim ke Pengemudi
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Pengiriman Terakhir</h2>
            <button className="secondary">Lihat Semua</button>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID Pelacakan</th>
                <th>Asal</th>
                <th>Tujuan</th>
                <th>Pelanggan</th>
                <th>Status</th>
                <th>Est. Pengiriman</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {shipmentData.map((shipment) => (
                <tr
                  key={shipment.id}
                  onClick={() => handleRowClick(shipment.id)}
                >
                  <td>{shipment.id}</td>
                  <td>{shipment.origin}</td>
                  <td>{shipment.destination}</td>
                  <td>{shipment.customer}</td>
                  <td>
                    <span className={`status status-${shipment.statusClass}`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td>{shipment.estimatedDelivery}</td>
                  <td>
                    <button className="action-btn">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="action-btn">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Ketersediaan Pengemudi</h2>
            <button className="secondary">Kelola Pengemudi</button>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID Pengemudi</th>
                <th>Nama</th>
                <th>Kendaraan</th>
                <th>Lokasi</th>
                <th>Status</th>
                <th>Tersedia Berikutnya</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {driverData.map((driver) => (
                <tr key={driver.id} onClick={() => handleRowClick(driver.id)}>
                  <td>{driver.id}</td>
                  <td>{driver.name}</td>
                  <td>{driver.vehicle}</td>
                  <td>{driver.location}</td>
                  <td>
                    <span className={`status status-${driver.statusClass}`}>
                      {driver.status}
                    </span>
                  </td>
                  <td>{driver.nextAvailable}</td>
                  <td>
                    <button className="action-btn">
                      <FontAwesomeIcon icon={faPhone} />
                    </button>
                    <button className="action-btn">
                      <FontAwesomeIcon icon={faCalendar} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12 py-6">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <FontAwesomeIcon icon={faTruck} className="text-primary mr-2" />
            <span className="text-lg font-semibold text-primary">
              Transport Management System
            </span>
          </div>
          <div className="text-slate-500 text-sm">
            &copy; 2025 Transport Management System.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sample data for shipments
const shipmentData = [
  {
    id: "#TMS-5842",
    origin: "Jakarta",
    destination: "Jakarta",
    customer: "Sociolla Gandaria City",
    status: "Dalam Perjalanan",
    statusClass: "in-transit",
    estimatedDelivery: "26 Feb 2025",
  },
  {
    id: "#TMS-5841",
    origin: "Jakarta",
    destination: "Jakarta",
    customer: "Sociolla Grand Indonesia",
    status: "Terkirim",
    statusClass: "delivered",
    estimatedDelivery: "25 Feb 2025",
  },
  {
    id: "#TMS-5840",
    origin: "Jakarta",
    destination: "Jakarta",
    customer: "Sociolla Lippo Mall Puri",
    status: "Menunggu",
    statusClass: "pending",
    estimatedDelivery: "27 Feb 2025",
  },
  {
    id: "#TMS-5839",
    origin: "Jakarta",
    destination: "Jakarta",
    customer: "Sociolla Kelapa Gading",
    status: "Dalam Perjalanan",
    statusClass: "in-transit",
    estimatedDelivery: "26 Feb 2025",
  }
];

// Sample data for drivers
const driverData = [
  {
    id: "#D-342",
    name: "Budi Santoso",
    vehicle: "CDD #T-102",
    location: "Jakarta",
    status: "Bertugas",
    statusClass: "in-transit",
    nextAvailable: "27 Feb 2025",
  },
  {
    id: "#D-285",
    name: "Siti Rahma",
    vehicle: "CDE #V-054",
    location: "Jakarta",
    status: "Tersedia",
    statusClass: "delivered",
    nextAvailable: "Sekarang",
  },
  {
    id: "#D-198",
    name: "Agus Wijaya",
    vehicle: "CDD #T-088",
    location: "Jakarta",
    status: "Tidak Bertugas",
    statusClass: "pending",
    nextAvailable: "26 Feb 2025",
  },
  {
    id: "#D-421",
    name: "Dewi Lestari",
    vehicle: "CDE #V-032",
    location: "Jakarta",
    status: "Bertugas",
    statusClass: "in-transit",
    nextAvailable: "28 Feb 2025",
  },
  {
    id: "#D-367",
    name: "Rudi Hermawan",
    vehicle: "CDD #T-115",
    location: "Jakarta",
    status: "Tersedia",
    statusClass: "delivered",
    nextAvailable: "Sekarang",
  },
];

export default App;
