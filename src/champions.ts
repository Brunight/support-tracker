export type Champion = { name: string; id: string };

// `id` is the Data Dragon key used in image URLs.
const names = [
  "Alistar", "Bard", "Blitzcrank", "Brand", "Braum", "Janna", "Karma", "Leona", "Lulu", "Lux",
  "Maokai", "Milio", "Morgana", "Nami", "Nautilus", "Neeko", "Pantheon", "Poppy",
  "Pyke", "Rakan", "Rell", "Renata Glasc", "Senna", "Seraphine", "Sona", "Soraka",
  "Swain", "Tahm Kench", "Taric", "Thresh", "Vel'Koz", "Xerath", "Yuumi", "Zilean", "Zyra",
];

const ID_OVERRIDES: Record<string, string> = {
  "Renata Glasc": "Renata",
  "Tahm Kench": "TahmKench",
  "Vel'Koz": "Velkoz",
};

// Champions already played before the tracker existed.
export const ALREADY_PLAYED = ["Alistar", "Braum", "Nami", "Pyke", "Thresh"];

export const CHAMPIONS: Champion[] = names.map((name) => ({
  name,
  id: ID_OVERRIDES[name] ?? name,
}));

const FALLBACK_VERSION = "16.21.1";

export async function fetchLatestVersion(): Promise<string> {
  try {
    const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    const versions = (await res.json()) as string[];
    return versions[0] ?? FALLBACK_VERSION;
  } catch {
    return FALLBACK_VERSION;
  }
}

export { FALLBACK_VERSION };

export const iconUrl = (version: string, id: string) =>
  `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${id}.png`;
