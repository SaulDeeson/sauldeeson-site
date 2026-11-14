export const projects = [
  {
    id: "wot-2-4",
    title: "Update 2.4: Overdrive",
    category: "Release campaign",
    video: "wot-2-4.mp4",
    url: "https://worldoftanks.eu/en/news/updates/wot-2-4/",
    paragraphs: [
      "I built a set of showcase pages to help players explore Update 2.4. Each article covered a different part of the release and included a button to claim an in-game reward. That gave players a reason to come back for the next article as the campaign rolled out.",
      "I connected the pages to a reward API. Each claim drew a random item from a shared pool and credited it to the player’s account. The draw excluded rewards that player had already received, so visiting another article meant getting something different."
    ]
  },
  {
    id: "halloween-2026-comic-book",
    title: "Halloween 2026 Comic Book",
    category: "Interactive storytelling",
    video: "halloween-2026-comic-book.mp4",
    url: "https://worldoftanks.eu/en/news/general-news/halloween-2026-comic-book/",
    paragraphs: [
      "I built the page and comic reader for the Mirny Halloween event. I wanted the reader to feel like opening a comic book, so I gave the pages a physical turn and let readers move through the story at their own pace.",
      "Subtle background animation sets the scene around the book. Keeping the motion outside the panels let me carry the event’s atmosphere into the page while leaving the artwork and dialogue easy to follow."
    ]
  },
  {
    id: "update-2-0-rebalance",
    title: "Update 2.0 Vehicle Rebalance",
    category: "Data-heavy interface",
    video: "update-2-0-rebalance.mp4",
    url: "https://worldoftanks.eu/en/news/general-news/update-2-0-rebalance/",
    paragraphs: [
      "Update 2.0 changed hundreds of vehicles. I built the rebalance page around a searchable, filterable catalogue so players could look up the tanks they owned or browse the changes across the game.",
      "The widget lists every stat that changed for a vehicle and shows which stats improved and which were reduced. A player could go from the full list to the details for a single tank in the same interface. The release recorded our highest time on page."
    ]
  },
  {
    id: "road-to-glory-2026",
    title: "Road to Glory",
    category: "Event concept & development",
    video: "road-to-glory-2026.mp4",
    url: "https://worldoftanks.eu/en/news/general-news/road-to-glory-2026/",
    paragraphs: [
      "I led the concept and built the page for a two-stage World Cup event. Players first picked a group they thought would send a team to the Round of 16. Later, they came back to choose the winner from the eight countries still in the tournament.",
      "I designed the football-themed interactions around those two moments. An API I integrated credited a token for the chosen group or nation to the player’s account, linking the prediction they made on the website to the missions they played in World of Tanks."
    ]
  },
  {
    id: "wot-heat-release",
    title: "World of Tanks: HEAT",
    category: "Cross-promotion",
    video: "wot-heat-release.mp4",
    url: "https://worldoftanks.eu/en/news/general-news/wot-heat-release/",
    paragraphs: [
      "I built a cross-promotion page to introduce World of Tanks players to Wargaming’s new game, HEAT. The page had to feel at home on the World of Tanks portal while giving HEAT space to establish its own visual identity.",
      "Scrolling advances through a sequence of screens. Each screen fades into the next within the same composition. That let me pace the introduction and show each part of the game as a distinct moment."
    ]
  },
  {
    id: "message-from-beavers-2026",
    title: "A Message From the Beavers",
    category: "Parallax & personalisation",
    video: "message-from-beavers-2026.mp4",
    url: "https://worldoftanks.eu/en/news/general-news/message-from-beavers-2026/",
    paragraphs: [
      "For an April Fools’ event supporting the One More Tree Foundation, I built a page for the beaver-themed customisations and a message from Bobber the beaver. The scene uses foreground and background layers that move at different speeds as you scroll, with an animated bird adding movement.",
      "I also integrated an API that looks up how many trees a player has knocked over across their World of Tanks career. Bobber then delivers a verdict based on that number, turning a running joke into a personal moment for the player."
    ]
  },
  {
    id: "valentines-day-2026",
    title: "Find Your Tank Match",
    category: "Mini-game & rewards",
    video: "valentines-day-2026.mp4",
    url: "https://worldoftanks.eu/en/news/specials/valentines-day-2026/",
    paragraphs: [
      "I built a Valentine’s Day page around a dating-app-inspired mini-game. Players answered questions to build a profile, then swiped through tanks to find a match. They could replay the game to try different answers and see who they matched with next.",
      "During the event, the nation of a player’s first match determined the in-game consumables they received. I integrated the API that credited those items to their account, so the reward felt connected to the match they’d just made."
    ]
  },
  {
    id: "trade-in-september-2026",
    published: false,
    title: "Trade-In: September 2026",
    category: "Interactive calculator",
    video: "trade-in-september-2026.mp4",
    url: "https://worldoftanks.eu/en/news/specials/trade-in-september-2026/",
    paragraphs: [
      "I built a Trade-In page that takes players from understanding the exchange rules to working out what an eligible Premium vehicle would cost them. The explainer uses short in-game clips to demonstrate the steps, with an animated background around the article.",
      "The calculator lets players choose the vehicle they want to trade and the one they want to receive. It shows how the value of the trade-in changes the final gold price before they make a decision in the game."
    ]
  },
  {
    id: "summer-festival-2026",
    published: false,
    title: "Summer Festival",
    category: "Mini-game & rotating offers",
    video: "summer-festival-2026.mp4",
    url: "https://worldoftanks.eu/en/news/specials/summer-festival-2026/",
    paragraphs: [
      "I built a beach-themed event page with an animated wave, a fishing mini-game and offers that changed every two days. Players could save one offer and keep it available for the rest of the event.",
      "During the event, a catch could earn a player one random in-game reward per day. I built the API flow to check whether the player had already claimed that day and credit the reward when eligible. Fishing stays playable after a claim and after the event itself."
    ]
  }
];
