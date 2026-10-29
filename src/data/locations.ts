/**
 * India Locations Catalog: State -> City -> Ward
 * Official administrative wards for Pune (PMC), PCMC, Mumbai (BMC), and Bengaluru (BBMP).
 * Sources: OpenCity.in, DataMeet Municipal Spatial Data & Municipal Corporation Portals.
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
  officeAddress?: string;
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
    id: "pcmc",
    name: "Pimpri-Chinchwad (PCMC)",
    state: "Maharashtra",
    latitude: 18.6298,
    longitude: 73.7997,
  },
  {
    id: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    latitude: 19.076,
    longitude: 72.8777,
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    state: "Karnataka",
    latitude: 12.9716,
    longitude: 77.5946,
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
];

export const WARDS: Ward[] = [
  // ==========================================
  // PUNE (PMC - 15 Administrative Wards)
  // ==========================================
  { id: "w-pune-1", cityId: "pune", wardNumber: 1, name: "Aundh - Baner", officeAddress: "Aundh Ward Office, Near Ambedkar Chowk, Aundh, Pune" },
  { id: "w-pune-2", cityId: "pune", wardNumber: 2, name: "Shivajinagar - Ghole Road", officeAddress: "Ghole Road Ward Office, Near Modern College, Pune" },
  { id: "w-pune-3", cityId: "pune", wardNumber: 3, name: "Kothrud - Bavdhan", officeAddress: "Kothrud Ward Office, Near Ashish Garden, DP Road, Pune" },
  { id: "w-pune-4", cityId: "pune", wardNumber: 4, name: "Warje - Karvenagar", officeAddress: "Warje Ward Office, Near Mai Mangeshkar Hospital, Pune" },
  { id: "w-pune-5", cityId: "pune", wardNumber: 5, name: "Dhole Patil Road", officeAddress: "Dhole Patil Road Ward Office, Near General Post Office, Pune" },
  { id: "w-pune-6", cityId: "pune", wardNumber: 6, name: "Yerwada - Kalas - Dhanori", officeAddress: "Yerwada Ward Office, Nagar Road, Yerwada, Pune" },
  { id: "w-pune-7", cityId: "pune", wardNumber: 7, name: "Nagar Road - Vadgaon Sheri", officeAddress: "Vadgaon Sheri Ward Office, Near Somnath Nagar, Pune" },
  { id: "w-pune-8", cityId: "pune", wardNumber: 8, name: "Bhavani Peth", officeAddress: "Bhavani Peth Ward Office, General Arunkumar Vaidya Stadium, Pune" },
  { id: "w-pune-9", cityId: "pune", wardNumber: 9, name: "Kasba - Vishrambaug Wada", officeAddress: "Vishrambaug Wada Ward Office, Sadashiv Peth, Pune" },
  { id: "w-pune-10", cityId: "pune", wardNumber: 10, name: "Sinhagad Road (Tilak Road)", officeAddress: "Sinhagad Road Ward Office, Dandekar Bridge, Pune" },
  { id: "w-pune-11", cityId: "pune", wardNumber: 11, name: "Bibwewadi", officeAddress: "Bibwewadi Ward Office, Utsav Hall, Pune" },
  { id: "w-pune-12", cityId: "pune", wardNumber: 12, name: "Dhankawadi - Sahakarnagar", officeAddress: "Dhankawadi Ward Office, Near Katraj Lake, Pune" },
  { id: "w-pune-13", cityId: "pune", wardNumber: 13, name: "Hadapsar - Mundhwa", officeAddress: "Hadapsar Ward Office, Gadital, Pune" },
  { id: "w-pune-14", cityId: "pune", wardNumber: 14, name: "Wanowrie - Ramtekdi", officeAddress: "Wanowrie Ward Office, Near Kedari Petrol Pump, Pune" },
  { id: "w-pune-15", cityId: "pune", wardNumber: 15, name: "Kondhwa - Yewalewadi", officeAddress: "Kondhwa Ward Office, Near Jyoti Chowk, Kondhwa, Pune" },

  // ==========================================
  // PIMPRI-CHINCHWAD (PCMC - 8 Administrative Zones A to H)
  // ==========================================
  { id: "w-pcmc-1", cityId: "pcmc", wardNumber: 1, name: "Ward A (Nigdi, Pradhikaran, Akurdi)", officeAddress: "Zone A Office, Tilak Chowk, Nigdi, PCMC" },
  { id: "w-pcmc-2", cityId: "pcmc", wardNumber: 2, name: "Ward B (Chinchwad, Thergaon, Keshavnagar)", officeAddress: "Zone B Office, Chaphekar Chowk, Chinchwad, PCMC" },
  { id: "w-pcmc-3", cityId: "pcmc", wardNumber: 3, name: "Ward C (Bhosari, Indrayaninagar, Dighi)", officeAddress: "Zone C Office, Gavli Matha, Bhosari, PCMC" },
  { id: "w-pcmc-4", cityId: "pcmc", wardNumber: 4, name: "Ward D (Wakad, Pimple Saudagar, Punawale, Tathawade)", officeAddress: "Zone D Office, Rahatani, PCMC" },
  { id: "w-pcmc-5", cityId: "pcmc", wardNumber: 5, name: "Ward E (Moshi, Chikhali, Charholi, Dudulgaon)", officeAddress: "Zone E Office, Moshi Toll Naka, PCMC" },
  { id: "w-pcmc-6", cityId: "pcmc", wardNumber: 6, name: "Ward F (Yamunanagar, Rupeenagar, Talawade IT Park)", officeAddress: "Zone F Office, Rupeenagar, PCMC" },
  { id: "w-pcmc-7", cityId: "pcmc", wardNumber: 7, name: "Ward G (Pimpri, Nehrunagar, Kharalwadi, Morwadi)", officeAddress: "Zone G Office, Deluxe Chowk, Pimpri, PCMC" },
  { id: "w-pcmc-8", cityId: "pcmc", wardNumber: 8, name: "Ward H (Sangvi, Dapodi, Pimple Gurav, Kasarwadi)", officeAddress: "Zone H Office, Old Sangvi, PCMC" },

  // ==========================================
  // MUMBAI (BMC - 24 Official Administrative Wards)
  // ==========================================
  { id: "w-mum-1", cityId: "mumbai", wardNumber: 1, name: "Ward A (Colaba, Fort, Nariman Point, Churchgate)", officeAddress: "134 E, SBS Road, Fort, Mumbai" },
  { id: "w-mum-2", cityId: "mumbai", wardNumber: 2, name: "Ward B (Sandhurst Road, Dongri, Masjid Bunder)", officeAddress: "121, Ramchandra Bhatt Marg, Babula Tank, Mumbai" },
  { id: "w-mum-3", cityId: "mumbai", wardNumber: 3, name: "Ward C (Marine Lines, Charni Road, Bhuleshwar)", officeAddress: "76, Shrikant Palekar Marg, Chandanwadi, Mumbai" },
  { id: "w-mum-4", cityId: "mumbai", wardNumber: 4, name: "Ward D (Malabar Hill, Grant Road, Walkeshwar)", officeAddress: "Jobanputra Compound, Nana Chowk, Grant Road, Mumbai" },
  { id: "w-mum-5", cityId: "mumbai", wardNumber: 5, name: "Ward E (Byculla, Mazgaon, Mumbai Central)", officeAddress: "10, Shaikh Hafizuddin Marg, Byculla West, Mumbai" },
  { id: "w-mum-6", cityId: "mumbai", wardNumber: 6, name: "Ward F/North (Matunga, Sion, Wadala)", officeAddress: "Plot 96, Bhau Daji Road, Matunga, Mumbai" },
  { id: "w-mum-7", cityId: "mumbai", wardNumber: 7, name: "Ward F/South (Parel, Sewri, Naigaon)", officeAddress: "Jagatguru Sant Tukaram Maharaj Marg, Parel, Mumbai" },
  { id: "w-mum-8", cityId: "mumbai", wardNumber: 8, name: "Ward G/North (Dharavi, Dadar, Mahim)", officeAddress: "Harishchandra Yelve Marg, Dadar West, Mumbai" },
  { id: "w-mum-9", cityId: "mumbai", wardNumber: 9, name: "Ward G/South (Worli, Lower Parel, Prabhadevi)", officeAddress: "N.M. Joshi Marg, Elphinstone West, Mumbai" },
  { id: "w-mum-10", cityId: "mumbai", wardNumber: 10, name: "Ward H/East (Bandra East, Khar East, Santacruz East)", officeAddress: "TPS 5, Prabhat Colony, Santacruz East, Mumbai" },
  { id: "w-mum-11", cityId: "mumbai", wardNumber: 11, name: "Ward H/West (Bandra West, Khar West, Santacruz West)", officeAddress: "Saint Martin Road, Bandra West, Mumbai" },
  { id: "w-mum-12", cityId: "mumbai", wardNumber: 12, name: "Ward K/East (Andheri East, Jogeshwari East, Vile Parle East)", officeAddress: "Gundavali, Azad Road, Andheri East, Mumbai" },
  { id: "w-mum-13", cityId: "mumbai", wardNumber: 13, name: "Ward K/West (Andheri West, Juhu, Versova, Vile Parle West)", officeAddress: "Paliram Path, Near Andheri Station, Andheri West, Mumbai" },
  { id: "w-mum-14", cityId: "mumbai", wardNumber: 14, name: "Ward L (Kurla, Sakinaka, Chandivali, Chunabhatti)", officeAddress: "LBS Marg, Near Kurla Bus Depot, Kurla West, Mumbai" },
  { id: "w-mum-15", cityId: "mumbai", wardNumber: 15, name: "Ward M/East (Govandi, Mankhurd, Shivaji Nagar)", officeAddress: "Deonar Colony, Govandi, Mumbai" },
  { id: "w-mum-16", cityId: "mumbai", wardNumber: 16, name: "Ward M/West (Chembur, Tilak Nagar, Mahul)", officeAddress: "Sharadbhau Acharya Marg, Chembur, Mumbai" },
  { id: "w-mum-17", cityId: "mumbai", wardNumber: 17, name: "Ward N (Ghatkopar, Vidyavihar, Pant Nagar)", officeAddress: "Jawahar Road, Ghatkopar East, Mumbai" },
  { id: "w-mum-18", cityId: "mumbai", wardNumber: 18, name: "Ward P/North (Malad, Marve, Manori, Madh)", officeAddress: "Liberty Garden, Malad West, Mumbai" },
  { id: "w-mum-19", cityId: "mumbai", wardNumber: 19, name: "Ward P/South (Goregaon West, Goregaon East)", officeAddress: "S.V. Road, Near Goregaon Flyover, Goregaon West, Mumbai" },
  { id: "w-mum-20", cityId: "mumbai", wardNumber: 20, name: "Ward R/Central (Borivali, Gorai, Eksar)", officeAddress: "Chandavarkar Road, Borivali West, Mumbai" },
  { id: "w-mum-21", cityId: "mumbai", wardNumber: 21, name: "Ward R/North (Dahisar, Mandapeshwar)", officeAddress: "Rangnath Keskar Marg, Dahisar West, Mumbai" },
  { id: "w-mum-22", cityId: "mumbai", wardNumber: 22, name: "Ward R/South (Kandivali, Charkop, Poisar)", officeAddress: "M.G. Cross Road 2, Kandivali West, Mumbai" },
  { id: "w-mum-23", cityId: "mumbai", wardNumber: 23, name: "Ward S (Bhandup, Powai, Kanjurmarg, Vikhroli)", officeAddress: "LBS Marg, Near Mangatram Petrol Pump, Bhandup West, Mumbai" },
  { id: "w-mum-24", cityId: "mumbai", wardNumber: 24, name: "Ward T (Mulund, Nahur)", officeAddress: "Lala Devidayal Marg, Mulund West, Mumbai" },

  // ==========================================
  // BENGALURU (BBMP - 14 Administrative Zones / Key Ward Clusters)
  // ==========================================
  { id: "w-blr-1", cityId: "bengaluru", wardNumber: 1, name: "East Zone: Shivajinagar, Bharathinagar, Halasuru", officeAddress: "BBMP East Zone Office, Mayo Hall, Bengaluru" },
  { id: "w-blr-2", cityId: "bengaluru", wardNumber: 2, name: "East Zone: Pulakeshinagar, Frazer Town, Cox Town", officeAddress: "BBMP Office, Davis Road, Bengaluru" },
  { id: "w-blr-3", cityId: "bengaluru", wardNumber: 3, name: "West Zone: Malleshwaram, Vyalikaval, Sadashivanagar", officeAddress: "BBMP West Office, Malleshwaram, Bengaluru" },
  { id: "w-blr-4", cityId: "bengaluru", wardNumber: 4, name: "West Zone: Rajajinagar, Basaveshwaranagar", officeAddress: "BBMP Office, Rajajinagar 2nd Block, Bengaluru" },
  { id: "w-blr-5", cityId: "bengaluru", wardNumber: 5, name: "South Zone: Jayanagar, JP Nagar, Basavanagudi", officeAddress: "BBMP South Office, 9th Cross, Jayanagar 2nd Block, Bengaluru" },
  { id: "w-blr-6", cityId: "bengaluru", wardNumber: 6, name: "South Zone: BTM Layout, Padmanabhanagar, Banashankari", officeAddress: "BBMP Office, BTM 2nd Stage, Bengaluru" },
  { id: "w-blr-7", cityId: "bengaluru", wardNumber: 7, name: "Mahadevapura Zone: Whitefield, Bellandur, Marathahalli", officeAddress: "BBMP Mahadevapura Office, RHB Colony, Bengaluru" },
  { id: "w-blr-8", cityId: "bengaluru", wardNumber: 8, name: "Mahadevapura Zone: Hoodi, KR Puram, Kadugodi", officeAddress: "BBMP Office, Devasandra Main Road, Bengaluru" },
  { id: "w-blr-9", cityId: "bengaluru", wardNumber: 9, name: "Bommanahalli Zone: Koramangala, HSR Layout, Bommanahalli", officeAddress: "BBMP Bommanahalli Office, Begur Main Road, Bengaluru" },
  { id: "w-blr-10", cityId: "bengaluru", wardNumber: 10, name: "Bommanahalli Zone: Begur, Bilekahalli, Arakere", officeAddress: "BBMP Office, Bannerghatta Road, Bengaluru" },
  { id: "w-blr-11", cityId: "bengaluru", wardNumber: 11, name: "Yelahanka Zone: Yelahanka New Town, Byatarayanapura", officeAddress: "BBMP Yelahanka Office, Byatarayanapura, Bengaluru" },
  { id: "w-blr-12", cityId: "bengaluru", wardNumber: 12, name: "Yelahanka Zone: Hebbal, Vidyaranyapura, Thanisandra", officeAddress: "BBMP Office, Hebbal Kempapura, Bengaluru" },
  { id: "w-blr-13", cityId: "bengaluru", wardNumber: 13, name: "Rajarajeshwari Nagar Zone: RR Nagar, Kengeri", officeAddress: "BBMP RR Nagar Office, Ideal Homes Twp, Bengaluru" },
  { id: "w-blr-14", cityId: "bengaluru", wardNumber: 14, name: "Dasarahalli Zone: Peenya Industrial Area, T Dasarahalli", officeAddress: "BBMP Dasarahalli Office, MEI Colony, Bengaluru" },
];

export function getCitiesByState(stateName: string): City[] {
  return CITIES.filter((c) => c.state.toLowerCase() === stateName.toLowerCase());
}

export function getWardsForCity(cityId: string): Ward[] {
  return WARDS.filter((w) => w.cityId === cityId);
}
