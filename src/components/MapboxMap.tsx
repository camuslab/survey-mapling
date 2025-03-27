import { useEffect, useRef, useState } from "react";
import { Location } from "@/utils/surveyStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, X, Plus, Search } from "lucide-react";
import { toast } from "sonner";

// Temporary MapboxGL mock since we're storing this locally for now
// In a real application, you would use the actual mapboxgl library
// and handle token authentication properly
const mockMapboxGL = {
  Map: class MockMap {
    container: HTMLElement;
    style: string;
    center: [number, number];
    zoom: number;
    markers: any[] = [];
    popups: any[] = [];
    eventListeners: Record<string, Function[]> = {};

    constructor(options: any) {
      this.container = options.container;
      this.style = options.style;
      this.center = options.center || [-74.5, 40];
      this.zoom = options.zoom || 9;
      // Simulate map initialization
      setTimeout(() => {
        this.fireEvent('load');
      }, 500);
    }

    on(event: string, callback: Function) {
      if (!this.eventListeners[event]) {
        this.eventListeners[event] = [];
      }
      this.eventListeners[event].push(callback);
      return this;
    }

    off(event: string, callback: Function) {
      if (this.eventListeners[event]) {
        this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
      }
      return this;
    }

    fireEvent(event: string, data?: any) {
      if (this.eventListeners[event]) {
        this.eventListeners[event].forEach(callback => callback(data));
      }
    }

    setCenter(center: [number, number]) {
      this.center = center;
      return this;
    }

    getCenter() {
      return { lng: this.center[0], lat: this.center[1] };
    }

    setZoom(zoom: number) {
      this.zoom = zoom;
      return this;
    }

    getZoom() {
      return this.zoom;
    }

    easeTo(options: any) {
      if (options.center) {
        this.center = [options.center.lng, options.center.lat];
      }
      if (options.zoom) {
        this.zoom = options.zoom;
      }
      return this;
    }

    addControl() {
      // Mock implementation
      return this;
    }

    remove() {
      // Mock implementation
      this.eventListeners = {};
    }
  },

  Marker: class MockMarker {
    element: HTMLElement;
    lngLat: [number, number];
    map: any;
    popup: any;

    constructor() {
      this.element = document.createElement('div');
      this.element.className = 'mapboxgl-marker';
      this.lngLat = [0, 0];
    }

    setLngLat(lngLat: [number, number]) {
      this.lngLat = lngLat;
      return this;
    }

    addTo(map: any) {
      this.map = map;
      map.markers.push(this);
      return this;
    }

    setPopup(popup: any) {
      this.popup = popup;
      return this;
    }

    remove() {
      if (this.map) {
        this.map.markers = this.map.markers.filter((m: any) => m !== this);
      }
    }

    getElement() {
      return this.element;
    }
  },

  Popup: class MockPopup {
    element: HTMLElement;
    lngLat: [number, number];
    map: any;
    offset: number;
    content: string | HTMLElement;

    constructor(options: any = {}) {
      this.element = document.createElement('div');
      this.element.className = 'mapboxgl-popup';
      this.offset = options.offset || 0;
    }

    setLngLat(lngLat: [number, number]) {
      this.lngLat = lngLat;
      return this;
    }

    setHTML(html: string) {
      this.content = html;
      return this;
    }

    setDOMContent(element: HTMLElement) {
      this.content = element;
      return this;
    }

    addTo(map: any) {
      this.map = map;
      map.popups.push(this);
      return this;
    }

    remove() {
      if (this.map) {
        this.map.popups = this.map.popups.filter((p: any) => p !== this);
      }
    }
  },

  NavigationControl: class MockNavigationControl {
    // Mock implementation
  }
};

interface MapboxMapProps {
  locations: Location[];
  onChange: (locations: Location[]) => void;
  onHomeLocationChange?: (coordinates: [number, number]) => void;
  homeCoordinates?: [number, number];
  readOnly?: boolean;
}

const MapboxMap = ({ 
  locations, 
  onChange, 
  onHomeLocationChange,
  homeCoordinates,
  readOnly = false 
}: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [newLocation, setNewLocation] = useState<Partial<Location>>({
    name: '',
    type: 'home',
  });
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Location types with corresponding colors
  const locationTypes = [
    { value: 'home', label: 'Home', color: '#4F46E5' },
    { value: 'work', label: 'Work', color: '#10B981' },
    { value: 'shopping', label: 'Shopping', color: '#F59E0B' },
    { value: 'entertainment', label: 'Entertainment', color: '#EC4899' },
    { value: 'education', label: 'Education', color: '#8B5CF6' },
    { value: 'restaurant', label: 'Restaurant', color: '#EF4444' },
    { value: 'outdoor', label: 'Outdoor', color: '#22C55E' },
    { value: 'other', label: 'Other', color: '#6B7280' },
  ];

  // Get color for location type
  const getColorForType = (type: string): string => {
    return locationTypes.find(t => t.value === type)?.color || '#6B7280';
  };

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // In a real implementation, this would use the actual mapboxgl library with authentication
    map.current = new mockMapboxGL.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: homeCoordinates || [-73.984, 40.7128], // Default to NYC if no homeCoordinates
      zoom: 9,
    });

    // Add navigation controls (zoom in/out)
    map.current.addControl(new mockMapboxGL.NavigationControl(), 'top-right');

    // Set up event listeners
    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Cleanup map on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [homeCoordinates]);

  // Add markers for locations
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Clear existing markers
    if (map.current.markers) {
      map.current.markers.forEach((marker: any) => marker.remove());
    }

    // Add markers for each location
    locations.forEach((location) => {
      const color = getColorForType(location.type);
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'relative';
      el.innerHTML = `
        <div class="absolute top-0 left-0 -mt-8 -ml-3 flex flex-col items-center">
          <div style="background-color: ${color}" class="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div class="mt-1 bg-white px-1.5 py-0.5 rounded text-xs font-medium shadow-sm" style="white-space: nowrap">
            ${location.name}
          </div>
        </div>
      `;

      // Create popup
      const popup = new mockMapboxGL.Popup({ offset: 25 }).setHTML(`
        <div class="p-1">
          <h3 class="font-medium text-sm">${location.name}</h3>
          <p class="text-xs text-muted-foreground">${locationTypes.find(t => t.value === location.type)?.label || 'Location'}</p>
          ${location.frequency ? `<p class="text-xs mt-1">Visit frequency: ${location.frequency}</p>` : ''}
          ${!readOnly ? `<button class="remove-location text-xs text-destructive mt-2" data-id="${location.id}">Remove</button>` : ''}
        </div>
      `);

      // Create and add marker
      const marker = new mockMapboxGL.Marker(el)
        .setLngLat(location.coordinates)
        .setPopup(popup)
        .addTo(map.current);

      // Add click event for popup
      el.addEventListener('click', () => {
        // Close other popups first
        if (map.current.popups) {
          map.current.popups.forEach((p: any) => p.remove());
        }
        popup.addTo(map.current);
      });
    });

    // Add home location if provided
    if (homeCoordinates) {
      const el = document.createElement('div');
      el.className = 'relative';
      el.innerHTML = `
        <div class="absolute top-0 left-0 -mt-8 -ml-3 flex flex-col items-center">
          <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-md animate-pulse-soft">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div class="mt-1 bg-white px-1.5 py-0.5 rounded text-xs font-medium shadow-sm">
            Home
          </div>
        </div>
      `;

      const popup = new mockMapboxGL.Popup({ offset: 25 }).setHTML(`
        <div class="p-1">
          <h3 class="font-medium text-sm">Home Address</h3>
          <p class="text-xs text-muted-foreground">Your primary residence</p>
        </div>
      `);

      const marker = new mockMapboxGL.Marker(el)
        .setLngLat(homeCoordinates)
        .setPopup(popup)
        .addTo(map.current);

      el.addEventListener('click', () => {
        if (map.current.popups) {
          map.current.popups.forEach((p: any) => p.remove());
        }
        popup.addTo(map.current);
      });

      // Center map on home location
      map.current.setCenter(homeCoordinates);
    }

    // Add event listener for the remove button
    document.querySelectorAll('.remove-location').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        if (id) {
          onChange(locations.filter(loc => loc.id !== id));
        }
      });
    });

  }, [locations, mapLoaded, homeCoordinates, readOnly, onChange]);

  // Add new location
  const addNewLocation = () => {
    if (!newLocation.name || !newLocation.type) {
      toast.error("Please provide a name and type for the location");
      return;
    }

    // For mock purposes, generate random coordinates near the home location
    const homeLatitude = homeCoordinates ? homeCoordinates[1] : 40.7128;
    const homeLongitude = homeCoordinates ? homeCoordinates[0] : -73.984;
    
    // Random offset within ~3 miles
    const latOffset = (Math.random() * 0.06) - 0.03;
    const lngOffset = (Math.random() * 0.06) - 0.03;
    
    const newLat = homeLatitude + latOffset;
    const newLng = homeLongitude + lngOffset;

    const location: Location = {
      id: Date.now().toString(),
      name: newLocation.name,
      type: newLocation.type as string,
      coordinates: [newLng, newLat],
      frequency: newLocation.frequency,
    };

    onChange([...locations, location]);
    setNewLocation({ name: '', type: 'home' });
    setIsAddingLocation(false);
    
    toast.success("New location added");
    
    // In a real application, we would use geocoding to find the actual coordinates
    // based on an address input from the user
  };

  // Search location (mock implementation)
  const searchLocation = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    // Mock geocoding - in a real app this would call the Mapbox Geocoding API
    toast.success(`Found location: ${searchQuery}`);
    
    // Generate mock coordinates near the home location
    const homeLatitude = homeCoordinates ? homeCoordinates[1] : 40.7128;
    const homeLongitude = homeCoordinates ? homeCoordinates[0] : -73.984;
    
    const latOffset = (Math.random() * 0.03) - 0.015;
    const lngOffset = (Math.random() * 0.03) - 0.015;
    
    const newLat = homeLatitude + latOffset;
    const newLng = homeLongitude + lngOffset;
    
    // Update the map center to the "found" location
    if (map.current) {
      map.current.setCenter([newLng, newLat]);
      map.current.setZoom(13);
    }
    
    // In a real app, this would:
    // 1. Call the Mapbox Geocoding API
    // 2. Display the results
    // 3. Allow the user to select one
    // 4. Use the selected coordinates for the new location
  };

  // Handle search input key press
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchLocation();
    }
  };

  // Set home location (mock implementation)
  const setHomeLocation = () => {
    if (!mapLoaded || !map.current) return;
    
    // For mock purposes, we'll use Central Park coordinates
    const mockHomeCoordinates: [number, number] = [-73.9665, 40.7812];
    
    if (onHomeLocationChange) {
      onHomeLocationChange(mockHomeCoordinates);
      toast.success("Home location updated");
    }
    
    // In a real app, this would:
    // 1. Allow the user to place a marker or search for their address
    // 2. Use the Mapbox Geocoding API to convert address to coordinates
    // 3. Call onHomeLocationChange with the actual coordinates
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNewLocation();
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <div className="relative flex-grow">
          <Input
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            disabled={readOnly}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={searchLocation}
            disabled={readOnly}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        {!homeCoordinates && !readOnly && (
          <Button type="button" onClick={setHomeLocation} className="whitespace-nowrap">
            <MapPin className="mr-2 h-4 w-4" />
            Set Home Location
          </Button>
        )}
        
        {!readOnly && (
          <Button 
            type="button" 
            onClick={() => setIsAddingLocation(!isAddingLocation)}
            variant={isAddingLocation ? "outline" : "default"}
            className="whitespace-nowrap"
          >
            {isAddingLocation ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Location
              </>
            )}
          </Button>
        )}
      </div>

      {isAddingLocation && !readOnly && (
        <form onSubmit={handleSubmit} className="p-4 border rounded-md bg-background shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="locationName">Location Name</Label>
              <Input
                id="locationName"
                placeholder="e.g. Work, Gym, Favorite Restaurant"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="locationType">Location Type</Label>
              <Select
                value={newLocation.type}
                onValueChange={(value) => setNewLocation({ ...newLocation, type: value })}
              >
                <SelectTrigger id="locationType">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {locationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: type.color }}
                        ></div>
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="frequency">Visit Frequency</Label>
              <Select
                value={newLocation.frequency}
                onValueChange={(value) => setNewLocation({ ...newLocation, frequency: value })}
              >
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="How often do you visit?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="rarely">Rarely</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                Add This Location
              </Button>
            </div>
          </div>
        </form>
      )}

      <div 
        ref={mapContainer} 
        className="w-full h-96 rounded-lg border shadow-sm bg-muted relative overflow-hidden"
      >
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-2 text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
        
        {!homeCoordinates && mapLoaded && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center p-6 rounded-lg max-w-md">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Set Your Home Location</h3>
              <p className="text-muted-foreground mb-4">
                Please set your home location to see places you frequently visit on the map.
              </p>
              {!readOnly && (
                <Button onClick={setHomeLocation}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Set Home Location
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {locations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {locations.map((location) => (
            <div 
              key={location.id}
              className="text-xs py-1 px-2 rounded-full border flex items-center"
              style={{ borderColor: getColorForType(location.type) }}
            >
              <div 
                className="w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: getColorForType(location.type) }}
              ></div>
              <span>{location.name}</span>
              {!readOnly && (
                <button
                  type="button"
                  className="ml-1.5 text-muted-foreground hover:text-destructive focus:outline-none"
                  onClick={() => onChange(locations.filter(loc => loc.id !== location.id))}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {locations.length === 0 && homeCoordinates && !isAddingLocation && !readOnly && (
        <div className="text-center p-4 border border-dashed rounded-md">
          <p className="text-sm text-muted-foreground">
            No locations added yet. Click "Add Location" to mark places you frequently visit.
          </p>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;
