/**
 * India Locations Catalog: State -> City -> Ward
 * Used for registration, complaint triage, and municipal routing.
 */

export type IndianState = { id: string; name: string };

export type City = {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
};

export type Ward = {
  id: string;
  cityId: string;
  wardNumber: number;
  name: string;
};

export const PHONE_PREFIX = "+91";

export const STATES: IndianState[] = [
  { id: "MH", name: "Maharashtra" },
  { id: "KA", name: "Karnataka" },
  { id: "DL", name: "Delhi" },
  { id: "TG", name: "Telangana" },
  { id: "TN", name: "Tamil Nadu" },
  { id: "GJ", name: "Gujarat" },
  { id: "UP", name: "Uttar Pradesh" },
  { id: "WB", name: "West Bengal" },
  { id: "RJ", name: "Rajasthan" },
  { id: "MP", name: "Madhya Pradesh" },
  { id: "KL", name: "Kerala" },
  { id: "PB", name: "Punjab" },
  { id: "HR", name: "Haryana" },
  { id: "BR", name: "Bihar" },
  { id: "AP", name: "Andhra Pradesh" },
  { id: "OR", name: "Odisha" },
];

export const CITIES: City[] = [
  {
    id: "pune",
    name: "Pune",
    state: "Maharashtra",
    latitude: 18.5204,
    longitude: 73.8567,
  },
  {
    id: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    latitude: 19.076,
    longitude: 72.8777,
  },
  {
    id: "nagpur",
    name: "Nagpur",
    state: "Maharashtra",
    latitude: 21.1458,
    longitude: 79.0882,
  },
  {
    id: "nashik",
    name: "Nashik",
    state: "Maharashtra",
    latitude: 19.9975,
    longitude: 73.7898,
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    state: "Karnataka",
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    id: "mysuru",
    name: "Mysuru",
    state: "Karnataka",
    latitude: 12.2958,
    longitude: 76.6394,
  },
  {
    id: "new-delhi",
    name: "New Delhi",
    state: "Delhi",
    latitude: 28.6139,
    longitude: 77.209,
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    state: "Telangana",
    latitude: 17.385,
    longitude: 78.4867,
  },
  {
    id: "chennai",
    name: "Chennai",
    state: "Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    state: "Gujarat",
    latitude: 23.0225,
    longitude: 72.5714,
  },
  {
    id: "surat",
    name: "Surat",
    state: "Gujarat",
    latitude: 21.1702,
    longitude: 72.8311,
  },
  {
    id: "lucknow",
    name: "Lucknow",
    state: "Uttar Pradesh",
    latitude: 26.8467,
    longitude: 80.9462,
  },
  {
    id: "noida",
    name: "Noida",
    state: "Uttar Pradesh",
    latitude: 28.5355,
    longitude: 77.391,
  },
  {
    id: "kolkata",
    name: "Kolkata",
    state: "West Bengal",
    latitude: 22.5726,
    longitude: 88.3639,
  },
  {
    id: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    latitude: 26.9124,
    longitude: 75.7873,
  },
];

export const WARDS: Ward[] = [
  // Pune (PMC Administrative Wards)
  { id: "w-pune-1", cityId: "pune", wardNumber: 1, name: "Aundh - Baner" },
  { id: "w-pune-2", cityId: "pune", wardNumber: 2, name: "Shivajinagar - Ghole Road" },
  { id: "w-pune-3", cityId: "pune", wardNumber: 3, name: "Kothrud - Bavdhan" },
  { id: "w-pune-4", cityId: "pune", wardNumber: 4, name: "Kasba - Vishrambaug Wada" },
  { id: "w-pune-5", cityId: "pune", wardNumber: 5, name: "Bhavani Peth" },
  { id: "w-pune-6", cityId: "pune", wardNumber: 6, name: "Bibvewadi" },
  { id: "w-pune-7", cityId: "pune", wardNumber: 7, name: "Dhankawadi - Sahakarnagar" },
  { id: "w-pune-8", cityId: "pune", wardNumber: 8, name: "Hadapsar - Mundhwa" },
  { id: "w-pune-9", cityId: "pune", wardNumber: 9, name: "Wadgaon Sheri - Kalyani Nagar" },
  { id: "w-pune-10", cityId: "pune", wardNumber: 10, name: "Yerwada - Dhanori" },

  // Mumbai (BMC Wards)
  { id: "w-mum-1", cityId: "mumbai", wardNumber: 1, name: "Ward A (Colaba, Fort, Nariman Point)" },
  { id: "w-mum-2", cityId: "mumbai", wardNumber: 2, name: "Ward D (Malabar Hill, Grant Road)" },
  { id: "w-mum-3", cityId: "mumbai", wardNumber: 3, name: "Ward GS (Worli, Lower Parel)" },
  { id: "w-mum-4", cityId: "mumbai", wardNumber: 4, name: "Ward HE (Bandra East, Khar)" },
  { id: "w-mum-5", cityId: "mumbai", wardNumber: 5, name: "Ward HW (Bandra West, Santacruz)" },
  { id: "w-mum-6", cityId: "mumbai", wardNumber: 6, name: "Ward KW (Andheri West, Juhu, Versova)" },
  { id: "w-mum-7", cityId: "mumbai", wardNumber: 7, name: "Ward KE (Andheri East, Vile Parle)" },

  // Bengaluru (BBMP Wards)
  { id: "w-blr-1", cityId: "bengaluru", wardNumber: 1, name: "Yelahanka" },
  { id: "w-blr-2", cityId: "bengaluru", wardNumber: 2, name: "Malleshwaram" },
  { id: "w-blr-3", cityId: "bengaluru", wardNumber: 3, name: "Shivajinagar" },
  { id: "w-blr-4", cityId: "bengaluru", wardNumber: 4, name: "Indiranagar" },
  { id: "w-blr-5", cityId: "bengaluru", wardNumber: 5, name: "Koramangala - BTM" },
  { id: "w-blr-6", cityId: "bengaluru", wardNumber: 6, name: "Jayanagar" },

  // Delhi (MCD Zones/Wards)
  { id: "w-del-1", cityId: "new-delhi", wardNumber: 1, name: "Rohini Zone" },
  { id: "w-del-2", cityId: "new-delhi", wardNumber: 2, name: "Civil Lines" },
  { id: "w-del-3", cityId: "new-delhi", wardNumber: 3, name: "Karol Bagh" },
  { id: "w-del-4", cityId: "new-delhi", wardNumber: 4, name: "Central / Connaught Place" },
  { id: "w-del-5", cityId: "new-delhi", wardNumber: 5, name: "South Delhi" },
];

export function getCitiesByState(stateName: string): City[] {
  return CITIES.filter((c) => c.state.toLowerCase() === stateName.toLowerCase());
}

export function getWardsForCity(cityId: string): Ward[] {
  return WARDS.filter((w) => w.cityId === cityId);
}
