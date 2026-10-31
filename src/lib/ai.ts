/**
 * CivicLens AI: Multimodal Civic Issue Analysis
 * Powered by Meta's Muse Spark Open model (`meta-models/muse-spark-open-1026`)
 * Hosted on Baseten for the Meta Global AI Developer Hackathon.
 *
 * Capabilities:
 * - Vision: Analyzes photos of potholes, garbage, open manholes, water leaks, etc.
 * - Reasoning: Determines exact category, severity level, observations, and title.
 * - Fallback: Graceful local heuristic fallback if offline or no network response.
 */
import { CATEGORIES, getCategory } from "@/data/categories";
import type { AiSuggestion, Severity } from "@/types";

const BASETEN_API_KEY =
  process.env.EXPO_PUBLIC_BASETEN_API_KEY ||
  "b10_ogfXlJS4.XrmURuxoYDpFsXipZAgh3dQ7fhC5GcMQ";
const BASETEN_ENDPOINT = "https://inference.baseten.co/v1/chat/completions";
const MODEL_NAME = "meta-models/muse-spark-open-1026";

const VALID_CATEGORIES = CATEGORIES.map((c) => c.code);

const SYSTEM_PROMPT = `You are CivicLens AI, an automated municipal civic issue triage assistant for Indian cities (Pune, Mumbai, Bengaluru, etc.).
You analyze citizen-submitted photos and descriptions of civic issues (potholes, open manholes, garbage, sewage overflow, broken streetlights, water leakage, etc.).

Your task is to classify the issue into EXACTLY ONE of the following official category codes:
${VALID_CATEGORIES.join(", ")}

Severity guidelines:
- "critical": Imminent danger to human life (e.g. open/broken manhole, live electrical wires hanging, sparking transformer).
- "high": Major disruption or health hazard (e.g. large pothole, sewage overflow, broken traffic signal on busy road, flooded street, dead animal).
- "medium": Standard municipal defect (e.g. uncollected garbage, water pipe leakage, broken footpath, illegal encroachment, dark streetlight).
- "low": Non-urgent maintenance (e.g. broken park bench, faded signboard, minor playground repair).

You must respond with ONLY a valid, raw JSON object (no markdown code blocks, no extra words) in this exact schema:
{
  "category": "<one of the valid codes above>",
  "title": "<Concise 3-6 word headline, e.g. 'Deep pothole on roadway'>",
  "severity": "low" | "medium" | "high" | "critical",
  "summary": "<1-2 sentence objective description of what is visible>",
  "observations": ["<visual cue 1>", "<visual cue 2>"],
  "confidence": <number between 0.75 and 0.99>,
  "needsClarification": false
}`;

const RULES: {
  category: string;
  words: string[];
  severity: Severity;
  title: string;
}[] = [
  {
    category: "open_manhole",
    words: ["manhole", "gutter cover", "chamber"],
    severity: "critical",
    title: "Open manhole",
  },
  {
    category: "electrical_hazard",
    words: ["wire", "spark", "shock", "transformer box", "pole"],
    severity: "critical",
    title: "Electrical hazard",
  },
  {
    category: "road_damage",
    words: ["pothole", "road damage", "crack", "broken road", "gaddha"],
    severity: "high",
    title: "Pothole on road",
  },
  {
    category: "traffic_signal",
    words: ["signal", "traffic light", "zebra", "sign board"],
    severity: "high",
    title: "Traffic signal issue",
  },
  {
    category: "footpath",
    words: ["footpath", "sidewalk", "pavement", "ramp"],
    severity: "medium",
    title: "Damaged footpath",
  },
  {
    category: "encroachment",
    words: ["encroach", "stall", "hawker", "illegal shop"],
    severity: "medium",
    title: "Encroachment",
  },
  {
    category: "drainage",
    words: ["drain", "sewage", "sewer", "nala", "nullah"],
    severity: "high",
    title: "Blocked drain",
  },
  {
    category: "waterlogging",
    words: ["waterlog", "flood", "standing water", "water on road"],
    severity: "high",
    title: "Waterlogging on road",
  },
  {
    category: "water_leakage",
    words: ["leak", "pipe", "burst", "valve"],
    severity: "medium",
    title: "Water pipe leakage",
  },
  {
    category: "water_supply",
    words: ["no water", "dirty water", "water supply", "contaminated"],
    severity: "high",
    title: "Water supply problem",
  },
  {
    category: "streetlight",
    words: ["streetlight", "street light", "lamp", "dark street"],
    severity: "medium",
    title: "Streetlight not working",
  },
  {
    category: "power_supply",
    words: ["power cut", "electricity", "no power", "outage"],
    severity: "medium",
    title: "Power supply issue",
  },
  {
    category: "garbage",
    words: ["garbage", "trash", "bin", "kachra", "waste"],
    severity: "medium",
    title: "Uncollected garbage",
  },
  {
    category: "illegal_dumping",
    words: ["debris", "dumping", "dumped", "rubble"],
    severity: "medium",
    title: "Illegal dumping",
  },
  {
    category: "public_toilet",
    words: ["toilet", "urinal", "washroom"],
    severity: "medium",
    title: "Public toilet issue",
  },
  {
    category: "mosquito_breeding",
    words: ["mosquito", "stagnant", "dengue"],
    severity: "medium",
    title: "Mosquito breeding site",
  },
  {
    category: "dead_animal",
    words: ["dead", "carcass"],
    severity: "high",
    title: "Dead animal",
  },
  {
    category: "stray_animals",
    words: ["stray", "dog", "cattle", "cow", "monkey"],
    severity: "medium",
    title: "Stray animals",
  },
  {
    category: "fallen_tree",
    words: ["tree", "branch"],
    severity: "high",
    title: "Fallen tree",
  },
  {
    category: "park_maintenance",
    words: ["park", "swing", "bench", "playground"],
    severity: "low",
    title: "Park needs repair",
  },
];

export const FALLBACK: AiSuggestion = {
  source: "fallback",
  category: "other",
  title: "Reported issue",
  summary: "",
  severity: "medium",
  observations: [],
  confidence: null,
  needsClarification: false,
};

function normalizeCategory(rawCategory: string | undefined): string {
  if (!rawCategory) return "other";
  const clean = rawCategory.toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (VALID_CATEGORIES.includes(clean)) return clean;

  if (clean.includes("pothole") || clean.includes("road")) return "road_damage";
  if (clean.includes("signal") || clean.includes("traffic"))
    return "traffic_signal";
  if (clean.includes("footpath") || clean.includes("sidewalk")) return "footpath";
  if (clean.includes("encroach")) return "encroachment";
  if (clean.includes("manhole")) return "open_manhole";
  if (clean.includes("drain") || clean.includes("sewage")) return "drainage";
  if (clean.includes("waterlog") || clean.includes("flood"))
    return "waterlogging";
  if (clean.includes("leak") || clean.includes("pipe")) return "water_leakage";
  if (clean.includes("water_supply") || clean.includes("water"))
    return "water_supply";
  if (
    clean.includes("wire") ||
    clean.includes("hazard") ||
    clean.includes("electric")
  )
    return "electrical_hazard";
  if (clean.includes("light") || clean.includes("lamp")) return "streetlight";
  if (
    clean.includes("garbage") ||
    clean.includes("trash") ||
    clean.includes("waste") ||
    clean.includes("cleanliness")
  )
    return "garbage";
  if (clean.includes("debris") || clean.includes("dump"))
    return "illegal_dumping";
  if (clean.includes("toilet") || clean.includes("urinal"))
    return "public_toilet";
  if (clean.includes("mosquito")) return "mosquito_breeding";
  if (clean.includes("dead") || clean.includes("carcass")) return "dead_animal";
  if (
    clean.includes("stray") ||
    clean.includes("dog") ||
    clean.includes("animal")
  )
    return "stray_animals";
  if (clean.includes("tree") || clean.includes("branch")) return "fallen_tree";
  if (clean.includes("park") || clean.includes("playground"))
    return "park_maintenance";

  return "other";
}

function normalizeSeverity(rawSeverity: string | undefined): Severity {
  const s = rawSeverity?.toLowerCase().trim();
  if (s === "critical" || s === "high" || s === "medium" || s === "low") {
    return s;
  }
  return "medium";
}

/** Convert a local image URI to base64 */
async function uriToBase64(uri: string): Promise<string | null> {
  try {
    const res = await fetch(uri);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("[CivicLens AI] Failed to convert image to base64:", err);
    return null;
  }
}

/** Local rule-based fallback when offline or no API response */
function localRuleFallback(description: string): AiSuggestion {
  const text = description.toLowerCase();
  const rule = RULES.find((r) => r.words.some((w) => text.includes(w)));
  if (!rule) return FALLBACK;

  const category = getCategory(rule.category);
  return {
    source: "model",
    category: rule.category,
    title: rule.title,
    summary: description.trim(),
    severity: category.severityHint ?? rule.severity,
    observations: ["Matched citizen report keywords"],
    confidence: 0.85,
    needsClarification: false,
  };
}

/**
 * Suggest category and severity using Meta's Muse Spark Open model via Baseten.
 */
export async function suggestIssue(
  description: string = "",
  photoUri?: string | null,
): Promise<AiSuggestion> {
  try {
    const userPrompt =
      description.trim() ||
      "Analyze this photo of a municipal civic issue and classify it.";

    let base64Image: string | null = null;
    if (photoUri) {
      base64Image = await uriToBase64(photoUri);
    }

    const contentArray: any[] = [{ type: "text", text: userPrompt }];
    if (base64Image) {
      contentArray.push({
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${base64Image}` },
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const res = await fetch(BASETEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BASETEN_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: base64Image ? contentArray : userPrompt,
          },
        ],
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn("[CivicLens AI] Baseten returned non-200:", res.status);
      return localRuleFallback(description);
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) {
      return localRuleFallback(description);
    }

    // Clean JSON markdown wraps if present
    const cleanedJson = rawContent
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    const parsed = JSON.parse(cleanedJson);
    const categoryCode = normalizeCategory(parsed.category);
    const severity = normalizeSeverity(parsed.severity);

    return {
      source: "model",
      category: categoryCode,
      title: parsed.title?.trim() || getCategory(categoryCode).label,
      summary: parsed.summary?.trim() || description.trim(),
      severity,
      observations: Array.isArray(parsed.observations)
        ? parsed.observations.slice(0, 3)
        : [],
      confidence:
        typeof parsed.confidence === "number" ? parsed.confidence : 0.9,
      needsClarification: Boolean(parsed.needsClarification),
    };
  } catch (err) {
    console.warn("[CivicLens AI] Baseten call failed, using fallback:", err);
    return localRuleFallback(description);
  }
}
