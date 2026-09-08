const ADJECTIVES = [
  "Silent", "Quiet", "Hidden", "Blue", "Silver", "Calm", "Midnight", "Unknown",
  "Gentle", "Mystic", "Shadow", "Crystal", "Golden", "Cosmic", "Ancient", "Swift",
  "Bright", "Dark", "Soft", "Wild", "Free", "Lone", "Deep", "Clear", "Bold",
  "Cool", "Warm", "Light", "Storm", "Rain", "Snow", "Cloud", "Star", "Moon",
  "Ocean", "River", "Forest", "Mountain", "Desert", "Valley", "Sky", "Wind",
  "Leafy", "Nova", "Echo", "Pixel", "Neon", "Velvet", "Iron", "Copper", "Jade",
];

const NOUNS = [
  "Otter", "Comet", "Fox", "Wave", "Cloud", "Panda", "Tiger", "Orbit",
  "Wolf", "Moon", "Falcon", "River", "Hawk", "Bear", "Owl", "Lynx",
  "Raven", "Eagle", "Dolphin", "Whale", "Phoenix", "Dragon", "Unicorn", "Spirit",
  "Dream", "Shadow", "Echo", "Spark", "Flame", "Frost", "Mist", "Breeze",
  "Peak", "Cove", "Glade", "Meadow", "Canyon", "Isle", "Reef", "Dune",
  "Nova", "Quasar", "Nebula", "Asteroid", "Meteor", "Galaxy", "Cosmos", "Horizon",
  "Rider", "Wanderer", "Seeker", "Voyager", "Explorer", "Guardian", "Keeper", "Pathfinder",
];

export function generateAnonymousNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${adj}${noun}_${num}`;
}

export function isValidNickname(nickname: string): boolean {
  const pattern = /^[A-Z][a-z]+[A-Z][a-z]+_\d{3,4}$/;
  if (!pattern.test(nickname)) return false;
  const lower = nickname.toLowerCase();
  const blocked = ["admin", "moderator", "support", "official", "sirbax", "null", "undefined"];
  return !blocked.some((b) => lower.includes(b));
}

/** Human-style illustrated person avatar (DiceBear adventurer). */
export function generateDefaultAvatar(seed: string): string {
  const encoded = encodeURIComponent(seed);
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encoded}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}
