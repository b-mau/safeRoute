import React, { useState, useEffect } from "react";
import { 
  GoogleMap, 
  LoadScript, 
  Autocomplete, 
  DirectionsService, 
  DirectionsRenderer 
} from "@react-google-maps/api";

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;


const containerStyle = {
  width: "100%",
  height: "80vh",
};

const center = {
  lat: 51.5167,
  lng: -0.1278,
};

const paddington = {
  lat: 51.5151,   
  lng: -0.1764,
};

const paddingtonName = "Paddington Station, London, UK";

function App() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [startLatLng, setStartLatLng] = useState(null);
  const [endLatLng, setEndLatLng] = useState(null);
  const [directions, setDirections] = useState(null);
  const [leg1Directions, setLeg1Directions] = useState(null);
  const [leg2Directions, setLeg2Directions] = useState(null);
  const [crimeData, setCrimeData] = useState(null);
  const [startAutocomplete, setStartAutocomplete] = useState(null);
  const [endAutocomplete, setEndAutocomplete] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch the most recent crime in London
  useEffect(() => {
    fetchCrimeData();
  }, []);

  const handleDirections = () => {
    if (!startLatLng || !endLatLng) {
      alert("Please select both start and destination locations");
      return;
    }

    setIsCalculating(true);
    
    // First leg: Start to Paddington
    const leg1 = {
      origin: startLatLng,
      destination: paddington,
      travelMode: "TRANSIT",
    };
    
    setLeg1Directions(leg1);
  };

  const fetchCrimeData = () => {
    fetch(`https://data.police.uk/api/crimes-street/all-crime?lat=51.5074&lng=-0.1278`)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          setCrimeData(data[0]); // Get the most recent crime
        }
      })
      .catch(error => console.error("Error fetching crime data: ", error));
  };

  // Combine both route segments into a single path for display
  const combinedDirections = React.useMemo(() => {
    if (leg1Directions && leg2Directions) {
      // This is just for display purposes - we're showing both legs together
      return leg2Directions;
    }
    return null;
  }, [leg1Directions, leg2Directions]);

  return (
    <LoadScript googleMapsApiKey={GOOGLE_API_KEY} libraries={["places"]}>
      {/* Crime Report Section (Top-Right) */}
      <div style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        width: "300px",
        padding: "15px",
        backgroundColor: "#f8f9fa",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        borderRadius: "5px",
        zIndex: 1
      }}>
        <h3 style={{ margin: "0 0 10px 0" }}>🔴 Latest Crime in London</h3>
        {crimeData ? (
          <p><strong>{crimeData.category.replace(/-/g, " ")}</strong> - {crimeData.location.street.name}</p>
        ) : (
          <p>Loading latest crime...</p>
        )}
      </div>

      {/* Main UI */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px" }}>
        <h2 style={{ fontSize: "2rem" }}>SafeRoute</h2>

        {/* Start Location Input */}
        <Autocomplete
          onLoad={(autocomplete) => setStartAutocomplete(autocomplete)}
          onPlaceChanged={() => {
            if (startAutocomplete) {
              const place = startAutocomplete.getPlace();
              if (place.geometry && place.geometry.location) {
                setStart(place.formatted_address || place.name);
                setStartLatLng({
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                });
              }
            }
          }}
        >
          <input 
            type="text" 
            placeholder="Start location" 
            style={{ width: "300px", padding: "10px", margin: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </Autocomplete>

        {/* Destination Input */}
        <Autocomplete
          onLoad={(autocomplete) => setEndAutocomplete(autocomplete)}
          onPlaceChanged={() => {
            if (endAutocomplete) {
              const place = endAutocomplete.getPlace();
              if (place.geometry && place.geometry.location) {
                setEnd(place.formatted_address || place.name);
                setEndLatLng({
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                });
              }
            }
          }}
        >
          <input 
            type="text" 
            placeholder="Destination" 
            style={{ width: "300px", padding: "10px", margin: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </Autocomplete>

        <button 
          onClick={handleDirections} 
          disabled={isCalculating}
          style={{ 
            padding: "10px 20px", 
            marginTop: "10px", 
            fontSize: "1rem", 
            cursor: isCalculating ? "not-allowed" : "pointer", 
            backgroundColor: isCalculating ? "#cccccc" : "#007bff", 
            color: "#fff", 
            border: "none", 
            borderRadius: "5px" 
          }}
        >
          {isCalculating ? "Calculating..." : "Find Route"}
        </button>
      </div>

      {/* Map Section */}
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        {/* First leg - Start to Paddington */}
        {leg1Directions && (
          <DirectionsService
            options={leg1Directions}
            callback={(result, status) => {
              if (status === "OK") {
                setLeg1Directions(result);
                
                // Second leg: Paddington to Destination
                const leg2 = {
                  origin: paddington,
                  destination: endLatLng,
                  travelMode: "TRANSIT",
                };
                setLeg2Directions(leg2);
              } else {
                console.error("First leg directions request failed due to " + status);
                alert("Could not find a route to Paddington. Please try different locations.");
                setIsCalculating(false);
              }
            }}
          />
        )}

        {/* Second leg - Paddington to Destination */}
        {leg2Directions && leg2Directions !== leg1Directions && (
          <DirectionsService
            options={leg2Directions}
            callback={(result, status) => {
              if (status === "OK") {
                setLeg2Directions(result);
                setIsCalculating(false);
              } else {
                console.error("Second leg directions request failed due to " + status);
                alert("Could not find a route from Paddington to destination. Please try different locations.");
                setIsCalculating(false);
              }
            }}
          />
        )}

        {/* Render leg 1 */}
        {leg1Directions && leg1Directions.routes && (
          <DirectionsRenderer
            options={{
              directions: leg1Directions,
              markerOptions: { visible: false },
              polylineOptions: { strokeColor: '#007bff' }
            }}
          />
        )}

        {/* Render leg 2 */}
        {leg2Directions && leg2Directions.routes && leg2Directions !== leg1Directions && (
          <DirectionsRenderer
            options={{
              directions: leg2Directions,
              markerOptions: { visible: false },
              polylineOptions: { strokeColor: '#ff6347' }
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default App;