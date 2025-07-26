import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Navigation, Clock, MapPin } from "lucide-react";

interface LocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Host Hampton's location
const HOST_HAMPTON_LOCATION = {
  lat: 40.8676,
  lng: -72.6501,
  address: "295 Hampton Rd, Southampton, NY 11968"
};

export function LocationDialog({ isOpen, onClose }: LocationDialogProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [travelInfo, setTravelInfo] = useState<{ duration: string; distance: string } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || !window.google) return;

    const initializeMap = () => {
      if (!mapRef.current) return;

      // Initialize map centered on Host Hampton
      const mapInstance = new google.maps.Map(mapRef.current, {
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
      new google.maps.Marker({
        position: HOST_HAMPTON_LOCATION,
        map: mapInstance,
        title: "Host Hampton",
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#EC4899" stroke="white" stroke-width="4"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        }
      });

      // Initialize directions service and renderer
      const directionsServiceInstance = new google.maps.DirectionsService();
      const directionsRendererInstance = new google.maps.DirectionsRenderer({
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
        const autocompleteInstance = new google.maps.places.Autocomplete(searchInputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' }
        });

        autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance.getPlace();
          if (place.geometry && place.formatted_address) {
            setSelectedAddress(place.formatted_address);
            calculateRoute(place.geometry.location!, directionsServiceInstance, directionsRendererInstance);
          }
        });

        setAutocomplete(autocompleteInstance);
      }

      setMap(mapInstance);
      setDirectionsService(directionsServiceInstance);
      setDirectionsRenderer(directionsRendererInstance);
    };

    // Small delay to ensure the dialog is fully rendered
    const timer = setTimeout(initializeMap, 100);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const calculateRoute = (
    destination: google.maps.LatLng,
    directionsService: google.maps.DirectionsService,
    directionsRenderer: google.maps.DirectionsRenderer
  ) => {
    const request: google.maps.DirectionsRequest = {
      origin: HOST_HAMPTON_LOCATION,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
      if (status === 'OK' && result) {
        directionsRenderer.setDirections(result);
        
        const route = result.routes[0];
        const leg = route.legs[0];
        
        setTravelInfo({
          duration: leg.duration?.text || '',
          distance: leg.distance?.text || ''
        });
      }
    });
  };

  const clearRoute = () => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] } as google.maps.DirectionsResult);
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
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Find Host Hampton</h2>
              <p className="text-sm text-gray-600">Get directions to our studio</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2 h-auto rounded-full hover:bg-gray-100"
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
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {travelInfo.distance}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {travelInfo.duration}
                  </span>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Driving time from {selectedAddress}
              </p>
            </div>
          )}

          {/* Map */}
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-xl border-2 border-gray-200 bg-gray-100"
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Need help planning your route? Call us at (631) 998-9325
            </p>
            <Button
              onClick={onClose}
              className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}