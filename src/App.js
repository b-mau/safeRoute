import React, { useState, useEffect } from "react";
import { 
  GoogleMap, 
  LoadScript, 
  Autocomplete, 
  DirectionsService, 
  DirectionsRenderer 
} from "@react-google-maps/api";

const GOOGLE_API_KEY = "AIzaSyDY09nSw6QIi5iT7q60WhGGBag1BEux_bQ"; 

const containerStyle = {
  width: "100%",
  height: "80vh",
};

const center = {
  lat: 51.5074,
  lng: -0.1278,
};

function App() {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [directions, setDirections] = useState(null);
  const [crimeData, setCrimeData] = useState(null);
  const [startAutocomplete, setStartAutocomplete] = useState(null);
  const [endAutocomplete, setEndAutocomplete] = useState(null);

  // Fetch the most recent crime in London
  useEffect(() => {
    fetchCrimeData();
  }, []);

  const handleDirections = () => {
    if (!start || !end) return;

    setDirections({
      origin: start,
      destination: end,
      travelMode: "TRANSIT", // Options: "DRIVING", "WALKING", "BICYCLING", "TRANSIT"
    });
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
        borderRadius: "5px"
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
                setStart(place.geometry.location);
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
                setEnd(place.geometry.location);
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
          style={{ padding: "10px 20px", marginTop: "10px", fontSize: "1rem", cursor: "pointer", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px" }}
        >
          Find Route
        </button>
      </div>

      {/* Map Section */}
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        {directions && (
          <DirectionsService
            options={directions}
            callback={(result, status) => {
              if (status === "OK") {
                setDirections(result);
              } else {
                console.error("Directions request failed due to " + status);
              }
            }}
          />
        )}

        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </LoadScript>
  );
}

export default App;
