export interface CampusLocation {
  id: string;
  name: string;
  category: "hostel" | "cafeteria" | "academic" | "facility";
  lat: number;
  lng: number;
  description: string;
  popular?: boolean;
}

// Redeemer's University Campus (Ede, Osun State) GPS Map Data
// Centered around Lat 7.7337, Lng 4.4372
export const CAMPUS_LOCATIONS: Record<string, CampusLocation> = {
  "Main Hostel Prophet Moses": {
    id: "loc_moses",
    name: "Main Hostel Prophet Moses",
    category: "hostel",
    lat: 7.7315,
    lng: 4.4330,
    description: "Central male undergraduate hall & student commons",
    popular: true,
  },
  "Engineering Hostel (Male)": {
    id: "loc_eng_male",
    name: "Engineering Hostel (Male)",
    category: "hostel",
    lat: 7.7322,
    lng: 4.4318,
    description: "West student residential sector",
    popular: true,
  },
  "Queen Esther Hall": {
    id: "loc_esther",
    name: "Queen Esther Hall",
    category: "hostel",
    lat: 7.7305,
    lng: 4.4342,
    description: "Female undergraduate hall of residence",
    popular: true,
  },
  "Numbers Hostel": {
    id: "loc_numbers",
    name: "Numbers Hostel",
    category: "hostel",
    lat: 7.7310,
    lng: 4.4355,
    description: "South campus undergraduate housing",
  },
  "Engineering Hostel (Female)": {
    id: "loc_eng_female",
    name: "Engineering Hostel (Female)",
    category: "hostel",
    lat: 7.7328,
    lng: 4.4325,
    description: "Southwest residence quad",
  },
  "Postgraduate Quarters": {
    id: "loc_pg",
    name: "Postgraduate Quarters",
    category: "hostel",
    lat: 7.7360,
    lng: 4.4335,
    description: "Postgraduate scholars & researcher lodge",
  },
  "Prophet Moses Extension": {
    id: "loc_moses_ext",
    name: "Prophet Moses Extension",
    category: "hostel",
    lat: 7.7318,
    lng: 4.4338,
    description: "East wing extension for Moses Hall",
  },
  "Manna Palace": {
    id: "loc_manna",
    name: "Manna Palace",
    category: "cafeteria",
    lat: 7.7340,
    lng: 4.4365,
    description: "Main campus dining cafeteria & food court",
    popular: true,
  },
  "New Era": {
    id: "loc_new_era",
    name: "New Era",
    category: "cafeteria",
    lat: 7.7348,
    lng: 4.4370,
    description: "Student lounge, bakery & grill hub",
  },
  "Foodmart": {
    id: "loc_foodmart",
    name: "Foodmart",
    category: "cafeteria",
    lat: 7.7335,
    lng: 4.4375,
    description: "Convenience store, fast food & refreshments",
  },
  "Auditorium": {
    id: "loc_auditorium",
    name: "Auditorium",
    category: "academic",
    lat: 7.7352,
    lng: 4.4385,
    description: "RUN Grand Convocation & Worship Auditorium",
    popular: true,
  },
  "LR": {
    id: "loc_lr",
    name: "LR",
    category: "academic",
    lat: 7.7345,
    lng: 4.4390,
    description: "Lecture Rooms & Faculty Classrooms Complex",
  },
  "ICT LAB": {
    id: "loc_ict",
    name: "ICT LAB",
    category: "academic",
    lat: 7.7350,
    lng: 4.4402,
    description: "Computing, Software Engineering & AI Center",
    popular: true,
  },
  "Library Block": {
    id: "loc_library",
    name: "Library Block",
    category: "academic",
    lat: 7.7362,
    lng: 4.4380,
    description: "University Central E-Library & Research Archives",
    popular: true,
  },
  "School Clinic": {
    id: "loc_clinic",
    name: "School Clinic",
    category: "facility",
    lat: 7.7330,
    lng: 4.4395,
    description: "Redeemer's University Health Services & Ambulance Bay",
    popular: true,
  },
  "Main Gate / Visitor Entrance": {
    id: "loc_main_gate",
    name: "Main Gate / Visitor Entrance",
    category: "facility",
    lat: 7.7375,
    lng: 4.4420,
    description: "Main campus security checkpoint & commercial shuttle park",
    popular: true,
  },
  "Staff Quarters": {
    id: "loc_staff",
    name: "Staff Quarters",
    category: "facility",
    lat: 7.7380,
    lng: 4.4360,
    description: "Faculty & administrative residential sector",
  },
};

export const RUN_CAMPUS_CENTER = {
  lat: 7.7337,
  lng: 4.4372,
  name: "Redeemer's University, Ede",
};

/**
 * Calculates straight line distance in meters between two lat/lng points using Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Formats meters into human-readable distance (e.g. "350 m" or "1.4 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.max(10, Math.round(meters))} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Retrieves the coordinates for a given campus location name, or defaults to campus center
 */
export function getLocationCoordinates(name: string): { lat: number; lng: number } {
  const found = CAMPUS_LOCATIONS[name];
  if (found) {
    return { lat: found.lat, lng: found.lng };
  }
  // Try partial match
  const key = Object.keys(CAMPUS_LOCATIONS).find((k) =>
    k.toLowerCase().includes(name.toLowerCase())
  );
  if (key && CAMPUS_LOCATIONS[key]) {
    return { lat: CAMPUS_LOCATIONS[key].lat, lng: CAMPUS_LOCATIONS[key].lng };
  }
  return { lat: RUN_CAMPUS_CENTER.lat, lng: RUN_CAMPUS_CENTER.lng };
}

/**
 * Generates an interpolated route path with intermediate waypoints
 */
export function generateCampusRoute(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  steps: number = 20
): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Add subtle curvature to simulate campus road grid
    const curve = Math.sin(t * Math.PI) * 0.0006;
    points.push({
      lat: start.lat + (end.lat - start.lat) * t + curve * 0.3,
      lng: start.lng + (end.lng - start.lng) * t + curve,
    });
  }
  return points;
}
