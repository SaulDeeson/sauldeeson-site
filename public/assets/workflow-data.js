export const portals = {
  EU: { domain: "worldoftanks.eu", zone: "Europe/Prague" },
  NA: { domain: "worldoftanks.com", zone: "America/Chicago" },
  APAC: { domain: "worldoftanks.asia", zone: "Asia/Singapore" }
};

export const releaseEmail = {
  date: "2026-09-17T05:00:00Z",
  notes: "Fixed a garage display issue."
};

export const sampleNotes = "FIXES\n* fixed the garage display on wide monitors\n• Improved the post-battle screen\n\nKNOWN ISSUES\n- The event banner may take a moment to load";

export function formatNotes(raw) {
  return raw.trim().split(/\r?\n/).map(line => {
    const trimmed = line.trim();
    const bullet = trimmed.match(/^[•*–-]\s+(\S.*)/);
    if (bullet) {
      const item = bullet[1];
      const punctuation = /[.!?]$/.test(item) ? "" : ".";
      return "• " + item[0].toUpperCase() + item.slice(1) + punctuation;
    }
    if (/^[A-Z][A-Z ]+$/.test(trimmed)) return trimmed[0] + trimmed.slice(1).toLowerCase();
    return trimmed;
  }).join("\n");
}

export const milestones = [
  { editor: "A", day: 14, task: "Localisation handoff" },
  { editor: "B", day: 15, task: "Release article QA" },
  { editor: "A", day: 17, task: "Event copy review" },
  { editor: "C", day: 18, task: "Micropatch draft" },
  { editor: "B", day: 22, task: "Offer setup" }
];
