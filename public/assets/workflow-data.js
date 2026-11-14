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
  { owner: "Project manager", day: 14, task: "Send to Localization" },
  { owner: "Editor B", day: 15, task: "Finalization" },
  { owner: "Editor A", day: 17, task: "Copywriting" },
  { owner: "Editor C", day: 18, task: "CMS Preparation" },
  { owner: "Editor B", day: 22, task: "Finalization" }
];

export const toolDescriptions = {
  "article-transfer": [
    "We usually built an article on the European portal first. North America and Asia-Pacific had separate content systems and media libraries, so the European export still pointed at asset IDs and links that the other portals couldn’t use. An editor had to rebuild the layout and widgets, copy the content and select each asset again in both CMSs.",
    "I built a Python tool that took the European export and produced an import-ready file for the destination. It searched the destination media library by filename, reused matching assets or automatically uploaded missing ones to that CMS, then rewrote the IDs and portal links while preserving the layout and widgets. It also surfaced placeholders and character limits so editors could flag those fields for localisation."
  ],
  micropatch: [
    "Each weekly micropatch needed an article in Europe, North America and Asia-Pacific. Editors pulled the release date, time and patch notes from an email, then set up the same article in several places with small regional differences.",
    "I first built a Python tool that filled HTML templates and prepared them for import. That brought setup from around 30 minutes to 10. I then built a Chrome extension that reads the release email, fills the regional templates and imports the drafts into their respective CMSs in about a minute. Editors still review each draft and decide when to publish."
  ],
  "patch-notes": [
    "Internal patch notes arrive as working copy. Before putting them into an article, editors had to make headings, bullet styles and punctuation consistent by hand.",
    "I built an internal webpage where an editor can paste the source notes, check the formatted copy beside them and copy the result into the article. That makes another small step of each release predictable, whoever is preparing it."
  ],
  "milestone-planning": [
    "Our publishing tasks in Targetprocess had milestones such as Copywriting, CMS Preparation and Finalization. The project manager owned the handoff to Localization. When planning the day, I needed to see which open milestones had slipped, which should be completed today and what was coming up across several articles.",
    "I wrote a Python tool that read open milestones from Targetprocess and grouped them against the review date. I could filter by assignee before a teammate’s absence to see what needed cover, or compare upcoming work before giving someone another task."
  ],
  "jira-workflow": [
    "A publishing task moves from In Progress to For Review before it’s ready for Localization. An open review can hold up the project manager and the localisation team, especially when nobody knows who’s waiting on whom.",
    "I configured Jira rules to remind the reviewer when a decision was due and route the issue once they responded. A request for changes sends it back to In Progress. A completed review moves it to Localization, where the project manager coordinates the handoff."
  ],
  "support-setup": [
    "A campaign is often accompanied by smaller promotional entries, such as portal cards and in-client placements in Wargaming Game Center. Setting up a batch meant taking campaign details from Confluence and localised titles from Excel, then entering them across several CMS panels. Each placement needed copy in around 20 languages, so five placements could mean 100 combinations of placement and language.",
    "I built a Chrome extension that brings both sources into one form. It matches the localised copy to each placement and flags missing fields before publication. The same batch can supply the event calendar, featured offer and banner on the portal, plus the hero and minor banners in Wargaming Game Center. A setup that took about 30 minutes now takes about 10, with less repeated data entry."
  ]
};

export const languagesPerSupport = 20;

export const supportPlacements = [
  { title: "Event calendar", destination: "Portal", locale: "EN", copy: "Summer Festival" },
  { title: "Featured offer", destination: "Portal", locale: "PL", copy: "Letnia oferta" },
  { title: "Banner", destination: "Portal", locale: "DE", copy: "Sommerfestival" },
  { title: "Hero banner", destination: "WGC", locale: "EN", copy: "Summer Festival" },
  { title: "Minor banner", destination: "WGC", locale: "PL", copy: "Letni festiwal" }
];
