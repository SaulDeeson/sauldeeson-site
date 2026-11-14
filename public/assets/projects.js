export const projects = [
  {
    id: "wot-2-4",
    title: "Update 2.4: Overdrive",
    category: "Release campaign",
    video: "wot-2-4.mp4",
    url: "https://worldoftanks.eu/en/news/updates/wot-2-4/",
    summary: "Players could claim a reward on each of the update’s showcase articles. Every page offered another reason to explore the release.",
    contribution: "I built the cross-article reward flow. Each claim awarded a random item from a shared pool through an API, with a check to keep players from receiving the same reward twice.",
    watch: "The claim button and the reward reveal across articles."
  },
  {
    id: "halloween-2026-comic-book",
    title: "Halloween 2026 Comic Book",
    category: "Interactive storytelling",
    video: "halloween-2026-comic-book.mp4",
    url: "https://worldoftanks.eu/en/news/general-news/halloween-2026-comic-book/",
    summary: "A Mirny Halloween comic that players can leaf through in an atmospheric reader.",
    contribution: "I built the comic page and its reader, with physical-feeling page turns and subtle background animation that keeps the focus on the panels.",
    watch: "The page turns and the motion behind the comic."
  },
  {
    id: "update-2-0-rebalance",
    title: "Update 2.0 Vehicle Rebalance",
    category: "Data-heavy interface",
    video: "update-2-0-rebalance.mp4",
    url: "https://worldoftanks.eu/en/news/general-news/update-2-0-rebalance/",
    summary: "Search and filters let players explore hundreds of vehicle rebalances, down to each individual stat and whether it was buffed or nerfed.",
    contribution: "I built the widget so players could jump directly to their own tanks or explore the full set of changes. The release recorded our highest time on page.",
    watch: "Finding a tank and reading its stat changes at a glance."
  },
  {
    id: "road-to-glory-2026",
    title: "Road to Glory",
    category: "Event concept & development",
    video: "road-to-glory-2026.mp4",
    url: "https://worldoftanks.eu/en/news/general-news/road-to-glory-2026/",
    summary: "A World Cup event with two prediction games. Players picked a group for the Round of 16, then backed one of the eight remaining nations to win.",
    contribution: "I led the event concept and built the article interactions. An API credited an in-game token tied to the player’s group or nation, linking their predictions to the event missions.",
    watch: "The football-themed choices and how the interface presents them."
  },
  {
    id: "wot-heat-release",
    title: "World of Tanks: HEAT",
    category: "Cross-promotion",
    video: "wot-heat-release.mp4",
    url: "https://worldoftanks.eu/en/news/general-news/wot-heat-release/",
    summary: "A showcase for Wargaming’s new game that brings HEAT’s visual style onto the World of Tanks portal.",
    contribution: "I built a scroll-driven transition that fades from one screen into the next while the composition stays in place.",
    watch: "How the panels change in place as the player scrolls."
  },
  {
    id: "message-from-beavers-2026",
    title: "A Message From the Beavers",
    category: "Parallax & personalisation",
    video: "message-from-beavers-2026.mp4",
    url: "https://worldoftanks.eu/en/news/general-news/message-from-beavers-2026/",
    summary: "An April Fools’ event with beaver-themed customisations and support for the One More Tree Foundation.",
    contribution: "I built the layered parallax scene and animated bird. An API read each player’s career tree-felling stats so Bobber the beaver could deliver a personalised verdict.",
    watch: "The depth of the layered scene and Bobber’s verdict."
  },
  {
    id: "valentines-day-2026",
    title: "Find Your Tank Match",
    category: "Mini-game & rewards",
    video: "valentines-day-2026.mp4",
    url: "https://worldoftanks.eu/en/news/specials/valentines-day-2026/",
    summary: "A dating-app-inspired mini-game where players answer questions to build a profile, then swipe through tanks to find a match.",
    contribution: "I built the replayable interaction and the API integration that credited consumables based on the nation of a player’s first match during the event.",
    watch: "The profile questions, swipe interaction and match reveal."
  },
  {
    id: "trade-in-september-2026",
    published: false,
    title: "Trade-In: September 2026",
    category: "Interactive calculator",
    video: "trade-in-september-2026.mp4",
    url: "https://worldoftanks.eu/en/news/specials/trade-in-september-2026/",
    summary: "An explainer and calculator for exchanging eligible Premium vehicles. Players can pick a trade-in and a target vehicle to see how the discount affects the gold cost.",
    contribution: "I built the calculator and interactive explainer, including videos that show the in-game steps on hover and an animated background.",
    watch: "The event explainer, the in-game clips and the trade-in calculation."
  },
  {
    id: "summer-festival-2026",
    published: false,
    title: "Summer Festival",
    category: "Mini-game & rotating offers",
    video: "summer-festival-2026.mp4",
    url: "https://worldoftanks.eu/en/news/specials/summer-festival-2026/",
    summary: "A beach setting with an animated wave, a fishing mini-game and offers that rotated every two days. Players could keep one offer available for the rest of the event.",
    contribution: "I built the fishing reward flow. It checked eligibility for one random account reward per day while keeping fishing replayable. The mini-game remains playable after the event.",
    watch: "Casting a line and how the rotating offers are presented."
  }
];
