from geopy.distance import geodesic
import geopandas as gpd
import os

# Use raw string (r"") or double backslashes in file path
geojson_file = r"C:\Users\bertr\Desktop\journey-planner\Lower_layer_Super_Output_Areas_December_2021_Boundaries_EW_BGC_V5_7778343082333364197.geojson"

if os.path.exists(geojson_file):
    print("File exists!")
else:
    print("File NOT found! Check the file path.")

class LSOADistanceCalculator:
    def __init__(self, geojson_path):  # Corrected __init__ method
        """
        Initialize with the LSOA boundary GeoJSON file.
        :param geojson_path: Path to the LSOA GeoJSON file.
        """
        self.lsoa_data = gpd.read_file(geojson_path)

    def get_lat_long(self, lsoa_code):
        """
        Get latitude and longitude of the given LSOA code.
        :param lsoa_code: LSOA code (e.g., 'E01000001')
        :return: (latitude, longitude) tuple or None if not found
        """
        lsoa_entry = self.lsoa_data[self.lsoa_data["LSOA11CD"] == lsoa_code]

        if not lsoa_entry.empty:
            centroid = lsoa_entry.geometry.centroid.iloc[0]
            return centroid.y, centroid.x  # Latitude, Longitude
        else:
            return None

    def get_distance(self, lsoa_code1, lsoa_code2):
        """
        Calculate the geodesic distance between two LSOA codes.
        :param lsoa_code1: First LSOA code
        :param lsoa_code2: Second LSOA code
        :return: Distance in kilometers or None if not found
        """
        coords1 = self.get_lat_long(lsoa_code1)
        coords2 = self.get_lat_long(lsoa_code2)

        if coords1 and coords2:
            return geodesic(coords1, coords2).kilometers
        else:
            return None

if __name__ == "__main__":  
    lsoa1 = "E01000001"  
    lsoa2 = "E01000002"  

    calculator = LSOADistanceCalculator(geojson_file)
    distance = calculator.get_distance(lsoa1, lsoa2)

    if distance is not None:
        print(f"Distance: {distance:.2f} km")
    else:
        print("One or both LSOA codes not found!")
