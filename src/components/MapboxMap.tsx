
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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Location types with corresponding colors
  const locationTypes = [
    { value: 'home', label: '집', color: '#4F46E5' },
    { value: 'work', label: '직장', color: '#10B981' },
    { value: 'shopping', label: '쇼핑', color: '#F59E0B' },
    { value: 'entertainment', label: '엔터테인먼트', color: '#EC4899' },
    { value: 'education', label: '교육', color: '#8B5CF6' },
    { value: 'restaurant', label: '식당', color: '#EF4444' },
    { value: 'outdoor', label: '야외', color: '#22C55E' },
    { value: 'other', label: '기타', color: '#6B7280' },
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
      toast.error("장소명과 유형을 입력해주세요");
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
    
    toast.success("새 위치가 추가되었습니다");
  };

  // Geocoding API - Search for location
  const searchLocation = async () => {
    if (!searchQuery.trim()) {
      toast.error("검색어를 입력해주세요");
      return;
    }

    setIsSearching(true);
    
    try {
      // In a real implementation, you would use Mapbox Geocoding API
      // Example API endpoint: https://api.mapbox.com/geocoding/v5/mapbox.places/{search_text}.json?access_token={your_access_token}
      
      // For now, we'll mock the geocoding response
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay
      
      const mockResults = [
        {
          id: "1",
          place_name: `${searchQuery} - 결과 1`,
          center: [
            homeCoordinates ? homeCoordinates[0] + (Math.random() * 0.02 - 0.01) : -73.98 + (Math.random() * 0.02 - 0.01),
            homeCoordinates ? homeCoordinates[1] + (Math.random() * 0.02 - 0.01) : 40.71 + (Math.random() * 0.02 - 0.01)
          ]
        },
        {
          id: "2",
          place_name: `${searchQuery} - 결과 2`,
          center: [
            homeCoordinates ? homeCoordinates[0] + (Math.random() * 0.02 - 0.01) : -73.99 + (Math.random() * 0.02 - 0.01),
            homeCoordinates ? homeCoordinates[1] + (Math.random() * 0.02 - 0.01) : 40.72 + (Math.random() * 0.02 - 0.01)
          ]
        },
        {
          id: "3",
          place_name: `${searchQuery} - 결과 3`,
          center: [
            homeCoordinates ? homeCoordinates[0] + (Math.random() * 0.02 - 0.01) : -74.00 + (Math.random() * 0.02 - 0.01),
            homeCoordinates ? homeCoordinates[1] + (Math.random() * 0.02 - 0.01) : 40.73 + (Math.random() * 0.02 - 0.01)
          ]
        }
      ];
      
      setSearchResults(mockResults);
      
      // Zoom to fit all results
      if (map.current && mockResults.length > 0) {
        // In a real implementation, we would use map.fitBounds
        // For now, just center on the first result
        const firstResult = mockResults[0];
        map.current.setCenter(firstResult.center);
        map.current.setZoom(13);
      }
      
      toast.success(`'${searchQuery}'에 대한 검색결과 ${mockResults.length}개를 찾았습니다`);
    } catch (error) {
      console.error("Error searching for location:", error);
      toast.error("위치 검색 중 오류가 발생했습니다");
    } finally {
      setIsSearching(false);
    }
  };

  // Select a search result
  const selectSearchResult = (result: any) => {
    // Set the map view to the selected result
    if (map.current) {
      map.current.setCenter(result.center);
      map.current.setZoom(15);
    }
    
    // If adding a location, prefill the location name
    if (isAddingLocation) {
      setNewLocation(prev => ({
        ...prev,
        name: result.place_name.split(' - ')[0], // Remove the "- 결과 X" part
      }));
    } else {
      // If not already adding a location, start adding one
      setIsAddingLocation(true);
      setNewLocation({
        name: result.place_name.split(' - ')[0],
        type: 'other',
      });
    }
    
    // Clear search results
    setSearchResults([]);
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
      toast.success("집 위치가 업데이트되었습니다");
    }
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
            placeholder="위치 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            disabled={readOnly || isSearching}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={searchLocation}
            disabled={readOnly || isSearching || !searchQuery.trim()}
          >
            {isSearching ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {!homeCoordinates && !readOnly && (
          <Button type="button" onClick={setHomeLocation} className="whitespace-nowrap">
            <MapPin className="mr-2 h-4 w-4" />
            집 위치 설정
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
                취소
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                위치 추가
              </>
            )}
          </Button>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && !readOnly && (
        <div className="p-3 border rounded-md bg-background shadow-sm max-h-60 overflow-y-auto">
          <h3 className="text-sm font-medium mb-2">검색 결과</h3>
          <ul className="space-y-2">
            {searchResults.map((result) => (
              <li key={result.id}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => selectSearchResult(result)}
                >
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{result.place_name}</span>
                  </div>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isAddingLocation && !readOnly && (
        <form onSubmit={handleSubmit} className="p-4 border rounded-md bg-background shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="locationName">위치 이름</Label>
              <Input
                id="locationName"
                placeholder="예: 직장, 체육관, 좋아하는 식당"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="locationType">위치 유형</Label>
              <Select
                value={newLocation.type}
                onValueChange={(value) => setNewLocation({ ...newLocation, type: value })}
              >
                <SelectTrigger id="locationType">
                  <SelectValue placeholder="유형 선택" />
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
              <Label htmlFor="frequency">방문 빈도</Label>
              <Select
                value={newLocation.frequency}
                onValueChange={(value) => setNewLocation({ ...newLocation, frequency: value })}
              >
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="얼마나 자주 방문하시나요?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">매일</SelectItem>
                  <SelectItem value="weekly">매주</SelectItem>
                  <SelectItem value="monthly">매월</SelectItem>
                  <SelectItem value="rarely">드물게</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                위치 추가하기
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
              <p className="mt-2 text-sm text-muted-foreground">지도 로딩 중...</p>
            </div>
          </div>
        )}
        
        {!homeCoordinates && mapLoaded && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center p-6 rounded-lg max-w-md">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">집 위치를 설정하세요</h3>
              <p className="text-muted-foreground mb-4">
                지도에서 자주 방문하는 장소를 보려면 먼저 집 위치를 설정해주세요.
              </p>
              {!readOnly && (
                <Button onClick={setHomeLocation}>
                  <MapPin className="mr-2 h-4 w-4" />
                  집 위치 설정
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
            아직 추가된 위치가 없습니다. "위치 추가" 버튼을 클릭하여 자주 방문하는 장소를 표시하세요.
          </p>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;
