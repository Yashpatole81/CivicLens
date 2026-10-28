/**
 * Demo stand-in for the `classify-issue` Edge Function (PRD AI Spec).
 *
 * It does NOT look at the photo. It matches keywords in the citizen's
 * description, and returns a fallback (manual picker) when nothing matches.
 * The real OpenRouter call replaces this once the backend exists; the
 * return shape stays the same.
 */
import { getCategory } from '@/data/categories';
import type { AiSuggestion, Severity } from '@/types';

const RULES: { category: string; words: string[]; severity: Severity; title: string }[] = [
  { category: 'open_manhole', words: ['manhole', 'gutter cover', 'chamber'], severity: 'critical', title: 'Open manhole' },
  { category: 'electrical_hazard', words: ['wire', 'spark', 'shock', 'transformer box', 'pole'], severity: 'critical', title: 'Electrical hazard' },
  { category: 'road_damage', words: ['pothole', 'road damage', 'crack', 'broken road', 'gaddha'], severity: 'high', title: 'Pothole on road' },
  { category: 'traffic_signal', words: ['signal', 'traffic light', 'zebra', 'sign board'], severity: 'high', title: 'Traffic signal issue' },
  { category: 'footpath', words: ['footpath', 'sidewalk', 'pavement', 'ramp'], severity: 'medium', title: 'Damaged footpath' },
  { category: 'encroachment', words: ['encroach', 'stall', 'hawker', 'illegal shop'], severity: 'medium', title: 'Encroachment' },
  { category: 'drainage', words: ['drain', 'sewage', 'sewer', 'nala', 'nullah'], severity: 'high', title: 'Blocked drain' },
  { category: 'waterlogging', words: ['waterlog', 'flood', 'standing water', 'water on road'], severity: 'high', title: 'Waterlogging on road' },
  { category: 'water_leakage', words: ['leak', 'pipe', 'burst', 'valve'], severity: 'medium', title: 'Water pipe leakage' },
  { category: 'water_supply', words: ['no water', 'dirty water', 'water supply', 'contaminated'], severity: 'high', title: 'Water supply problem' },
  { category: 'streetlight', words: ['streetlight', 'street light', 'lamp', 'dark street'], severity: 'medium', title: 'Streetlight not working' },
  { category: 'power_supply', words: ['power cut', 'electricity', 'no power', 'outage'], severity: 'medium', title: 'Power supply issue' },
  { category: 'garbage', words: ['garbage', 'trash', 'bin', 'kachra', 'waste'], severity: 'medium', title: 'Uncollected garbage' },
  { category: 'illegal_dumping', words: ['debris', 'dumping', 'dumped', 'rubble'], severity: 'medium', title: 'Illegal dumping' },
  { category: 'public_toilet', words: ['toilet', 'urinal', 'washroom'], severity: 'medium', title: 'Public toilet issue' },
  { category: 'mosquito_breeding', words: ['mosquito', 'stagnant', 'dengue'], severity: 'medium', title: 'Mosquito breeding site' },
  { category: 'dead_animal', words: ['dead', 'carcass'], severity: 'high', title: 'Dead animal' },
  { category: 'stray_animals', words: ['stray', 'dog', 'cattle', 'cow', 'monkey'], severity: 'medium', title: 'Stray animals' },
  { category: 'fallen_tree', words: ['tree', 'branch'], severity: 'high', title: 'Fallen tree' },
  { category: 'park_maintenance', words: ['park', 'swing', 'bench', 'playground'], severity: 'low', title: 'Park needs repair' },
];

export const FALLBACK: AiSuggestion = {
  source: 'fallback',
  category: 'other',
  title: 'Reported issue',
  summary: '',
  severity: 'medium',
  observations: [],
  confidence: null,
  needsClarification: false,
};

export async function suggestIssue(description: string): Promise<AiSuggestion> {
  // Simulated network latency so loading states are visible.
  await new Promise((r) => setTimeout(r, 1200));

  const text = description.toLowerCase();
  const rule = RULES.find((r) => r.words.some((w) => text.includes(w)));
  if (!rule) return FALLBACK;

  const category = getCategory(rule.category);
  return {
    source: 'model',
    category: rule.category,
    title: rule.title,
    summary: description.trim(),
    severity: category.severityHint ?? rule.severity,
    observations: [],
    confidence: null, // keyword matching has no real confidence score
    needsClarification: false,
  };
}
