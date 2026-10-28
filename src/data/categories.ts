/**
 * Category catalog (PRD DB §3.0c). Frontend copy for now; later loaded from the
 * `categories` table so new categories need no app release.
 */
import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

import type { Severity } from '@/types';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type GroupCode = 'roads' | 'water' | 'power' | 'clean' | 'trees' | 'other';

export type CategoryGroup = {
  code: GroupCode;
  label: string;
  shortLabel: string;
  icon: IconName;
  tint: string;
  bg: string;
};

export type Category = {
  code: string;
  label: string;
  examples: string;
  group: GroupCode;
  department: string;
  severityHint?: Severity;
};

export const GROUPS: CategoryGroup[] = [
  { code: 'roads', label: 'Roads & Traffic', shortLabel: 'Roads & Traffic', icon: 'car-outline', tint: '#4B4A44', bg: '#ECEAE4' },
  { code: 'water', label: 'Water & Drainage', shortLabel: 'Water & Drainage', icon: 'water-outline', tint: '#1C5F86', bg: '#E1EEF6' },
  { code: 'power', label: 'Electricity & Lighting', shortLabel: 'Electricity', icon: 'flash-outline', tint: '#8A5A00', bg: '#FFF1CF' },
  { code: 'clean', label: 'Cleanliness & Health', shortLabel: 'Cleanliness', icon: 'trash-outline', tint: '#16624A', bg: '#E6F2EA' },
  { code: 'trees', label: 'Parks & Trees', shortLabel: 'Parks & Trees', icon: 'leaf-outline', tint: '#3F6B1F', bg: '#E8F1DC' },
  { code: 'other', label: 'Other', shortLabel: 'Other', icon: 'ellipsis-horizontal-circle-outline', tint: '#5B3E96', bg: '#EFECF4' },
];

export const CATEGORIES: Category[] = [
  { code: 'road_damage', label: 'Potholes & road damage', examples: 'Potholes, broken or sunken road', group: 'roads', department: 'Roads & Engineering' },
  { code: 'traffic_signal', label: 'Traffic signals & signs', examples: 'Signal not working, missing sign, faded zebra crossing', group: 'roads', department: 'Traffic' },
  { code: 'footpath', label: 'Broken or blocked footpath', examples: 'Broken tiles, missing ramp, blocked walkway', group: 'roads', department: 'Public Works & Encroachment' },
  { code: 'encroachment', label: 'Encroachment', examples: 'Illegal stalls or structures on road/footpath', group: 'roads', department: 'Public Works & Encroachment' },

  { code: 'drainage', label: 'Blocked drain / sewage overflow', examples: 'Choked drain, sewage on road', group: 'water', department: 'Drainage & Sewerage' },
  { code: 'open_manhole', label: 'Open or broken manhole', examples: 'Missing or broken cover', group: 'water', department: 'Drainage & Sewerage', severityHint: 'critical' },
  { code: 'waterlogging', label: 'Waterlogging / flooding', examples: 'Water standing on road after rain', group: 'water', department: 'Drainage & Sewerage' },
  { code: 'water_leakage', label: 'Water pipe leakage', examples: 'Burst pipeline, leaking valve', group: 'water', department: 'Water Supply' },
  { code: 'water_supply', label: 'No / dirty water supply', examples: 'No water, contaminated water', group: 'water', department: 'Water Supply' },

  { code: 'streetlight', label: 'Streetlight not working', examples: 'Dark, flickering, or broken streetlight', group: 'power', department: 'Street Lighting & Electrical' },
  { code: 'electrical_hazard', label: 'Electrical hazard', examples: 'Hanging or exposed wires, damaged pole', group: 'power', department: 'Street Lighting & Electrical', severityHint: 'critical' },
  { code: 'power_supply', label: 'Power supply issue', examples: 'Area power cut, transformer problem', group: 'power', department: 'Street Lighting & Electrical' },

  { code: 'garbage', label: 'Garbage & overflowing bins', examples: 'Uncollected garbage, overflowing bin', group: 'clean', department: 'Solid Waste Management' },
  { code: 'illegal_dumping', label: 'Illegal dumping / debris', examples: 'Construction debris, dumped waste', group: 'clean', department: 'Solid Waste Management' },
  { code: 'public_toilet', label: 'Public toilet issue', examples: 'Dirty, broken, or locked public toilet', group: 'clean', department: 'Public Health & Sanitation' },
  { code: 'mosquito_breeding', label: 'Stagnant water / mosquito breeding', examples: 'Stagnant water in plots, tyres, containers', group: 'clean', department: 'Public Health & Sanitation' },
  { code: 'dead_animal', label: 'Dead animal', examples: 'Carcass on road or in public place', group: 'clean', department: 'Public Health & Sanitation' },
  { code: 'stray_animals', label: 'Stray animals', examples: 'Stray dogs or cattle causing trouble', group: 'clean', department: 'Animal Control' },

  { code: 'fallen_tree', label: 'Fallen or dangerous tree', examples: 'Fallen tree, hanging branch', group: 'trees', department: 'Garden & Tree Department', severityHint: 'high' },
  { code: 'park_maintenance', label: 'Park / playground damage', examples: 'Broken bench or swing, unmaintained park', group: 'trees', department: 'Garden & Tree Department' },

  { code: 'other', label: 'Other / not sure', examples: 'Anything else', group: 'other', department: 'General Municipal Review' },
];

export function getCategory(code: string): Category {
  return CATEGORIES.find((c) => c.code === code) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function getGroup(code: GroupCode): CategoryGroup {
  return GROUPS.find((g) => g.code === code) ?? GROUPS[GROUPS.length - 1];
}
