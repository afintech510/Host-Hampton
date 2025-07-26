import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Navigation, Clock, MapPin } from "lucide-react";
import { Loader } from "@googlemaps/js-api-loader";

interface LocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Host Hampton's location
const HOST_HAMPTON_LOCATION = {
  lat: 40.8242,
  lng: -72.7014,
  address: "295 Montauk Hwy, Speonk, NY 11972"
};

export function LocationDialog({ isOpen, onClose }: LocationDialogProps) {
  const [map, setMap] = useState<any>(null);
  const [directionsService, setDirectionsService] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [autocomplete, setAutocomplete] = useState<any>(null);
  const [travelInfo, setTravelInfo] = useState<{ duration: string; distance: string } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const initializeMap = async () => {
    if (!mapRef.current) return;
    
    try {
      setIsLoading(true);
      
      if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
        throw new Error("Google Maps API key not found");
      }

      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["places", "geometry"],
      });

      const { Map } = await loader.importLibrary("maps") as any;
      const { Marker } = await loader.importLibrary("marker") as any;
      const { DirectionsService, DirectionsRenderer } = await loader.importLibrary("routes") as any;
      const { Autocomplete } = await loader.importLibrary("places") as any;

      // Initialize map centered on Host Hampton
      const mapInstance = new Map(mapRef.current, {
        center: HOST_HAMPTON_LOCATION,
        zoom: 13,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      // Add marker for Host Hampton
      new Marker({
        position: HOST_HAMPTON_LOCATION,
        map: mapInstance,
        title: "Host Hampton",
      });

      // Initialize directions service and renderer
      const directionsServiceInstance = new DirectionsService();
      const directionsRendererInstance = new DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#EC4899",
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });
      
      directionsRendererInstance.setMap(mapInstance);

      // Initialize autocomplete for search input
      if (searchInputRef.current) {
        const autocompleteInstance = new Autocomplete(searchInputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' }
        });

        autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance.getPlace();
          if (place.geometry && place.geometry.location) {
            calculateRoute(place.geometry.location);
            setSelectedAddress(place.formatted_address || "");
          }
        });

        setAutocomplete(autocompleteInstance);
      }

      setMap(mapInstance);
      setDirectionsService(directionsServiceInstance);
      setDirectionsRenderer(directionsRendererInstance);
      setIsLoading(false);
      
    } catch (error) {
      console.error("Error initializing map:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    initializeMap();
  }, [isOpen]);

  const calculateRoute = (destination: any) => {
    if (!directionsService || !directionsRenderer) return;

    directionsService.route(
      {
        origin: HOST_HAMPTON_LOCATION,
        destination: destination,
        travelMode: 'DRIVING',
      },
      (result: any, status: any) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
          
          const route = result.routes[0];
          const leg = route.legs[0];
          
          setTravelInfo({
            duration: leg.duration.text,
            distance: leg.distance.text
          });
        } else {
          console.error('Directions request failed due to ' + status);
        }
      }
    );
  };

  const clearRoute = () => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] });
    }
    setTravelInfo(null);
    setSelectedAddress("");
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Find Host Hampton
          </h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2 h-auto min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Address Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Enter your address to get directions:
            </label>
            <div className="flex space-x-2">
              <Input
                ref={searchInputRef}
                placeholder="Enter your address..."
                className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-pink-300"
              />
              {selectedAddress && (
                <Button
                  onClick={clearRoute}
                  variant="outline"
                  className="px-4 py-3 rounded-xl"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Host Hampton Address */}
          <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-pink-800">Host Hampton Studio</h3>
                <p className="text-pink-700">{HOST_HAMPTON_LOCATION.address}</p>
                <p className="text-sm text-pink-600 mt-1">
                  Phone: (631) 998-9325 • Hours: By Appointment Only
                </p>
              </div>
            </div>
          </div>

          {/* Travel Info */}
          {travelInfo && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-4 text-blue-800">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4" />
                  <span className="font-medium">{travelInfo.distance}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{travelInfo.duration}</span>
                </div>
              </div>
            </div>
          )}

          {/* Map Container */}
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-gray-100 rounded-xl flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-pink-300 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            )}
            <div
              ref={mapRef}
              className="w-full h-96 rounded-xl border border-gray-200"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="bg-pink-300 hover:bg-pink-400 text-white px-6 py-2 rounded-xl"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}