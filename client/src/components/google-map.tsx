import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface GoogleMapProps {
  address?: string;
  className?: string;
}

export default function GoogleMap({ 
  address = "295 Montauk Hwy, Speonk, NY 11972", 
  className = "w-full h-full min-h-[400px]" 
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
          throw new Error("Google Maps API key not found");
        }

        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["places"],
        });

        const { Map } = await loader.importLibrary("maps") as google.maps.MapsLibrary;
        const { AdvancedMarkerElement } = await loader.importLibrary("marker") as google.maps.MarkerLibrary;

        if (!mapRef.current) return;

        // Host Hampton location coordinates
        const hostHamptonLocation = { lat: 40.8242, lng: -72.7014 };

        const map = new Map(mapRef.current, {
          zoom: 13,
          center: hostHamptonLocation,
          mapId: "host-hampton-map",
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        // Create a custom marker
        const marker = new AdvancedMarkerElement({
          map,
          position: hostHamptonLocation,
          title: "Host Hampton - 295 Montauk Hwy, Speonk, NY 11972",
        });

        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: bold;">Host Hampton</h3>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">295 Montauk Hwy<br>Speonk, NY 11972</p>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">📞 (631) 998-9325</p>
              <p style="margin: 0; color: #6b7280; font-size: 12px;">Children's party planning & venue</p>
            </div>
          `,
        });

        // Show info window when marker is clicked
        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        // Open info window by default
        infoWindow.open(map, marker);

        setIsLoading(false);
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setError("Failed to load map. Please try again later.");
        setIsLoading(false);
      }
    };

    initMap();
  }, [address]);

  if (error) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center`}>
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Unavailable</h3>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative rounded-lg overflow-hidden`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}