/**
 * Country → State/UT → City data for the sign-up picker.
 * Small frontend seed; the full list moves to Supabase later.
 */
export type Country = { code: string; name: string; phonePrefix: string };
export type StateRegion = { id: string; country: string; name: string };
export type City = { id: string; state: string; name: string };

export const COUNTRIES: Country[] = [
  { code: 'IN', name: 'India', phonePrefix: '+91' },
  { code: 'SE', name: 'Sweden', phonePrefix: '+46' },
];

export const STATES: StateRegion[] = [
  { id: 'IN-AP', country: 'IN', name: 'Andhra Pradesh' },
  { id: 'IN-AS', country: 'IN', name: 'Assam' },
  { id: 'IN-BR', country: 'IN', name: 'Bihar' },
  { id: 'IN-CH', country: 'IN', name: 'Chandigarh' },
  { id: 'IN-CT', country: 'IN', name: 'Chhattisgarh' },
  { id: 'IN-DL', country: 'IN', name: 'Delhi' },
  { id: 'IN-GA', country: 'IN', name: 'Goa' },
  { id: 'IN-GJ', country: 'IN', name: 'Gujarat' },
  { id: 'IN-HR', country: 'IN', name: 'Haryana' },
  { id: 'IN-JH', country: 'IN', name: 'Jharkhand' },
  { id: 'IN-KA', country: 'IN', name: 'Karnataka' },
  { id: 'IN-KL', country: 'IN', name: 'Kerala' },
  { id: 'IN-MP', country: 'IN', name: 'Madhya Pradesh' },
  { id: 'IN-MH', country: 'IN', name: 'Maharashtra' },
  { id: 'IN-OR', country: 'IN', name: 'Odisha' },
  { id: 'IN-PB', country: 'IN', name: 'Punjab' },
  { id: 'IN-RJ', country: 'IN', name: 'Rajasthan' },
  { id: 'IN-TN', country: 'IN', name: 'Tamil Nadu' },
  { id: 'IN-TG', country: 'IN', name: 'Telangana' },
  { id: 'IN-UP', country: 'IN', name: 'Uttar Pradesh' },
  { id: 'IN-UT', country: 'IN', name: 'Uttarakhand' },
  { id: 'IN-WB', country: 'IN', name: 'West Bengal' },
  { id: 'SE-AB', country: 'SE', name: 'Stockholm County' },
];

export const CITIES: City[] = [
  { id: 'visakhapatnam', state: 'IN-AP', name: 'Visakhapatnam' },
  { id: 'vijayawada', state: 'IN-AP', name: 'Vijayawada' },
  { id: 'guwahati', state: 'IN-AS', name: 'Guwahati' },
  { id: 'patna', state: 'IN-BR', name: 'Patna' },
  { id: 'chandigarh', state: 'IN-CH', name: 'Chandigarh' },
  { id: 'raipur', state: 'IN-CT', name: 'Raipur' },
  { id: 'new-delhi', state: 'IN-DL', name: 'New Delhi' },
  { id: 'panaji', state: 'IN-GA', name: 'Panaji' },
  { id: 'ahmedabad', state: 'IN-GJ', name: 'Ahmedabad' },
  { id: 'surat', state: 'IN-GJ', name: 'Surat' },
  { id: 'vadodara', state: 'IN-GJ', name: 'Vadodara' },
  { id: 'gurugram', state: 'IN-HR', name: 'Gurugram' },
  { id: 'faridabad', state: 'IN-HR', name: 'Faridabad' },
  { id: 'ranchi', state: 'IN-JH', name: 'Ranchi' },
  { id: 'bengaluru', state: 'IN-KA', name: 'Bengaluru' },
  { id: 'mysuru', state: 'IN-KA', name: 'Mysuru' },
  { id: 'kochi', state: 'IN-KL', name: 'Kochi' },
  { id: 'thiruvananthapuram', state: 'IN-KL', name: 'Thiruvananthapuram' },
  { id: 'bhopal', state: 'IN-MP', name: 'Bhopal' },
  { id: 'indore', state: 'IN-MP', name: 'Indore' },
  { id: 'mumbai', state: 'IN-MH', name: 'Mumbai' },
  { id: 'pune', state: 'IN-MH', name: 'Pune' },
  { id: 'nagpur', state: 'IN-MH', name: 'Nagpur' },
  { id: 'nashik', state: 'IN-MH', name: 'Nashik' },
  { id: 'thane', state: 'IN-MH', name: 'Thane' },
  { id: 'bhubaneswar', state: 'IN-OR', name: 'Bhubaneswar' },
  { id: 'ludhiana', state: 'IN-PB', name: 'Ludhiana' },
  { id: 'amritsar', state: 'IN-PB', name: 'Amritsar' },
  { id: 'jaipur', state: 'IN-RJ', name: 'Jaipur' },
  { id: 'jodhpur', state: 'IN-RJ', name: 'Jodhpur' },
  { id: 'chennai', state: 'IN-TN', name: 'Chennai' },
  { id: 'coimbatore', state: 'IN-TN', name: 'Coimbatore' },
  { id: 'hyderabad', state: 'IN-TG', name: 'Hyderabad' },
  { id: 'lucknow', state: 'IN-UP', name: 'Lucknow' },
  { id: 'kanpur', state: 'IN-UP', name: 'Kanpur' },
  { id: 'noida', state: 'IN-UP', name: 'Noida' },
  { id: 'dehradun', state: 'IN-UT', name: 'Dehradun' },
  { id: 'kolkata', state: 'IN-WB', name: 'Kolkata' },
  { id: 'stockholm', state: 'SE-AB', name: 'Stockholm' },
];
