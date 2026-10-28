/**
 * Demo data for the frontend-only phase. Timestamps are relative to "now" so
 * SLA / overdue states stay realistic whenever the app is opened.
 * Replaced by Supabase queries later.
 */
import type { Complaint, HistoryEntry, Status } from "@/types";

const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 3600_000).toISOString();

function history(
  createdH: number,
  steps: [Status, number, string?][],
): HistoryEntry[] {
  return [
    { status: "submitted", at: hoursAgo(createdH) },
    ...steps.map(([status, h, update]) => ({
      status,
      at: hoursAgo(h),
      update,
    })),
  ];
}

export const DEMO_USER = {
  fullName: "Aarav Kulkarni",
  email: "aarav.k@example.com",
  country: "IN",
  state: "IN-MH",
  city: "Pune",
  cityId: "pune",
};

export const SEED_COMPLAINTS: Complaint[] = [
  {
    id: "c142",
    reference: "CL-2026-000142",
    title: "Large pothole near bus stop",
    description:
      "Big pothole near the bus stop. Two-wheelers keep swerving around it.",
    category: "road_damage",
    aiCategory: "road_damage",
    severity: "high",
    status: "in_progress",
    department: "Roads & Engineering",
    city: "Pune",
    address: "Near Shivajinagar Bus Stop, FC Road",
    locality: "Shivajinagar",
    latitude: 18.52043,
    longitude: 73.85674,
    accuracyM: 6,
    photoUri: null,
    createdAt: hoursAgo(26),
    internalNote: "Used 2 bags of cold mix. Recheck after next rain. Crew B.",
    history: history(26, [
      ["assigned", 26],
      ["under_review", 22],
      ["in_progress", 2, "Crew scheduled to fill the pothole today."],
    ]),
    isDemo: true,
  },
  {
    id: "c131",
    reference: "CL-2026-000131",
    title: "Sewage overflowing in lane 4",
    category: "drainage",
    severity: "high",
    status: "under_review",
    department: "Drainage & Sewerage",
    city: "Pune",
    address: "Lane 4, ITI Road",
    locality: "Aundh",
    latitude: 18.5603,
    longitude: 73.8077,
    accuracyM: 9,
    photoUri: null,
    createdAt: hoursAgo(40),
    history: history(40, [
      ["assigned", 40],
      ["under_review", 30],
    ]),
    isDemo: true,
  },
  {
    id: "c118",
    reference: "CL-2026-000118",
    title: "Streetlight off on FC Road",
    category: "streetlight",
    severity: "medium",
    status: "assigned",
    department: "Street Lighting & Electrical",
    city: "Pune",
    address: "Opp. Fergusson College Gate, FC Road",
    locality: "Deccan",
    latitude: 18.5236,
    longitude: 73.8412,
    accuracyM: 12,
    photoUri: null,
    createdAt: hoursAgo(50),
    history: history(50, [["assigned", 50]]),
    isDemo: true,
  },
  {
    id: "c097",
    reference: "CL-2026-000097",
    title: "Garbage pile near market",
    category: "garbage",
    severity: "medium",
    status: "resolved",
    department: "Solid Waste Management",
    city: "Pune",
    address: "Behind Mandai Market",
    locality: "Shukrawar Peth",
    latitude: 18.5122,
    longitude: 73.8559,
    accuracyM: 8,
    photoUri: null,
    createdAt: hoursAgo(130),
    resolvedAt: hoursAgo(80),
    resolutionNote: "Garbage cleared and area sanitised. Extra bin placed.",
    history: history(130, [
      ["assigned", 130],
      ["under_review", 120],
      ["in_progress", 100, "Collection van assigned for tomorrow morning."],
      ["resolved", 80, "Garbage cleared and area sanitised. Extra bin placed."],
    ]),
    isDemo: true,
  },
  // Rows below are other citizens' complaints. They only appear on the
  // municipal dashboard, never in "My complaints".
  {
    id: "c088",
    reference: "CL-2026-000088",
    title: "Open manhole outside school",
    category: "open_manhole",
    severity: "critical",
    status: "in_progress",
    department: "Drainage & Sewerage",
    city: "Pune",
    address: "Outside Kothrud Municipal School",
    locality: "Kothrud",
    latitude: 18.5074,
    longitude: 73.8077,
    photoUri: null,
    createdAt: hoursAgo(30),
    history: history(30, [
      ["assigned", 30],
      ["under_review", 28],
      ["in_progress", 20, "Barricade placed. Cover replacement ordered."],
    ]),
    isDemo: true,
  },
  {
    id: "c101",
    reference: "CL-2026-000101",
    title: "Hanging live wire on pole",
    category: "electrical_hazard",
    severity: "critical",
    status: "under_review",
    department: "Street Lighting & Electrical",
    city: "Pune",
    address: "Magarpatta Road",
    locality: "Hadapsar",
    latitude: 18.5089,
    longitude: 73.926,
    photoUri: null,
    createdAt: hoursAgo(26),
    history: history(26, [
      ["assigned", 26],
      ["under_review", 24],
    ]),
    isDemo: true,
  },
  {
    id: "c147",
    reference: "CL-2026-000147",
    title: "Stray cattle on main road",
    category: "stray_animals",
    severity: "medium",
    status: "submitted",
    department: "Animal Control",
    city: "Pune",
    address: "Baner Road, near Balewadi Phata",
    locality: "Baner",
    latitude: 18.559,
    longitude: 73.7868,
    photoUri: null,
    createdAt: hoursAgo(3),
    history: history(3, []),
    isDemo: true,
  },
];

/** IDs of seeded complaints that belong to the demo citizen. */
export const DEMO_USER_COMPLAINT_IDS = ["c142", "c131", "c118", "c097"];

/* ------------------------------------------------------------------ */
/* Extra demo rows (other citizens) so dashboard analytics have data. */
/* ------------------------------------------------------------------ */

type Row = [
  id: string,
  title: string,
  category: string,
  severity: Complaint["severity"],
  department: string,
  locality: string,
  createdH: number,
  status: Status,
  resolvedH?: number,
  note?: string,
];

const ROWS: Row[] = [
  [
    "c051",
    "Deep pothole on Paud Road",
    "road_damage",
    "high",
    "Roads & Engineering",
    "Kothrud",
    300,
    "resolved",
    250,
    "Patched with hot mix.",
  ],
  [
    "c055",
    "Drain choked near temple",
    "drainage",
    "high",
    "Drainage & Sewerage",
    "Kasba Peth",
    280,
    "resolved",
    190,
    "Drain desilted.",
  ],
  [
    "c060",
    "Garbage not collected for 3 days",
    "garbage",
    "medium",
    "Solid Waste Management",
    "Hadapsar",
    250,
    "resolved",
    230,
    "Collection route restored.",
  ],
  [
    "c063",
    "Streetlight flickering",
    "streetlight",
    "low",
    "Street Lighting & Electrical",
    "Viman Nagar",
    230,
    "closed",
    160,
    "Lamp replaced.",
  ],
  [
    "c067",
    "Water pipe burst near school",
    "water_leakage",
    "high",
    "Water Supply",
    "Warje",
    210,
    "resolved",
    200,
    "Pipeline section replaced.",
  ],
  [
    "c070",
    "Fallen tree blocking lane",
    "fallen_tree",
    "high",
    "Garden & Tree Department",
    "Model Colony",
    190,
    "resolved",
    182,
    "Tree cleared.",
  ],
  [
    "c072",
    "Signal stuck on red",
    "traffic_signal",
    "high",
    "Traffic",
    "Swargate",
    170,
    "resolved",
    150,
    "Controller reset.",
  ],
  [
    "c075",
    "Construction debris dumped",
    "illegal_dumping",
    "medium",
    "Solid Waste Management",
    "Wakad",
    150,
    "resolved",
    60,
    "Debris removed; fine issued.",
  ],
  [
    "c078",
    "Waterlogging after rain",
    "waterlogging",
    "high",
    "Drainage & Sewerage",
    "Sinhagad Road",
    140,
    "resolved",
    120,
    "Inlet cleared.",
  ],
  [
    "c081",
    "Broken footpath tiles",
    "footpath",
    "low",
    "Public Works & Encroachment",
    "Camp",
    120,
    "in_progress",
  ],
  [
    "c084",
    "Mosquito breeding in open plot",
    "mosquito_breeding",
    "medium",
    "Public Health & Sanitation",
    "Aundh",
    100,
    "under_review",
  ],
  [
    "c090",
    "Hawkers blocking footpath",
    "encroachment",
    "medium",
    "Public Works & Encroachment",
    "Laxmi Road",
    80,
    "rejected",
    70,
    "Licensed market area; not an encroachment.",
  ],
  [
    "c093",
    "Public toilet locked",
    "public_toilet",
    "medium",
    "Public Health & Sanitation",
    "Deccan",
    60,
    "in_progress",
  ],
  [
    "c105",
    "Pothole near flyover",
    "road_damage",
    "medium",
    "Roads & Engineering",
    "Katraj",
    40,
    "assigned",
  ],
  [
    "c110",
    "Overflowing bin at bus stand",
    "garbage",
    "medium",
    "Solid Waste Management",
    "Shivajinagar",
    20,
    "under_review",
  ],
  [
    "c120",
    "Something leaking from a wall",
    "other",
    "low",
    "General Municipal Review",
    "Wakad",
    10,
    "submitted",
  ],
];

export const MORE_COMPLAINTS: Complaint[] = ROWS.map(
  ([
    id,
    title,
    category,
    severity,
    department,
    locality,
    createdH,
    status,
    resolvedH,
    note,
  ]) => {
    const steps: [Status, number, string?][] = [["assigned", createdH]];
    if (status !== "submitted" && status !== "assigned")
      steps.push(["under_review", createdH - 4]);
    if (["in_progress", "resolved", "closed"].includes(status))
      steps.push(["in_progress", createdH - 8]);
    if (status === "resolved" || status === "closed")
      steps.push(["resolved", resolvedH!, note]);
    if (status === "closed") steps.push(["closed", resolvedH! - 1]);
    if (status === "rejected") steps.push(["rejected", resolvedH!, note]);
    if (status === "submitted") steps.length = 0;
    return {
      id,
      reference: `CL-2026-000${id.slice(1)}`,
      title,
      category,
      severity,
      status,
      department,
      city: "Pune",
      address: `${locality} area`,
      locality,
      latitude: 18.52 + (Number(id.slice(1)) % 7) * 0.01,
      longitude: 73.85 + (Number(id.slice(1)) % 5) * 0.01,
      photoUri: null,
      createdAt: hoursAgo(createdH),
      resolvedAt:
        status === "resolved" || status === "closed"
          ? hoursAgo(resolvedH!)
          : undefined,
      resolutionNote:
        status === "resolved" || status === "closed" ? note : undefined,
      rejectionReason: status === "rejected" ? note : undefined,
      history: history(createdH, steps),
      isDemo: true,
    };
  },
);

export type StaffRole = "citizen" | "officer" | "admin";

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  department?: string;
};

/** Demo accounts for the Users & roles page. */
export const DEMO_STAFF: StaffUser[] = [
  {
    id: "u1",
    name: "Meera Deshpande",
    email: "meera.d@example.com",
    role: "admin",
  },
  {
    id: "u2",
    name: "Rohan Patil",
    email: "rohan.p@example.com",
    role: "officer",
    department: "Roads & Engineering",
  },
  {
    id: "u3",
    name: "Sneha Joshi",
    email: "sneha.j@example.com",
    role: "officer",
    department: "Drainage & Sewerage",
  },
  {
    id: "u4",
    name: "Imran Shaikh",
    email: "imran.s@example.com",
    role: "officer",
    department: "Street Lighting & Electrical",
  },
  {
    id: "u5",
    name: "Kavya Nair",
    email: "kavya.n@example.com",
    role: "officer",
    department: "Solid Waste Management",
  },
  {
    id: "u6",
    name: "Aarav Kulkarni",
    email: "aarav.k@example.com",
    role: "citizen",
  },
  {
    id: "u7",
    name: "Priya Sharma",
    email: "priya.s@example.com",
    role: "citizen",
  },
];
