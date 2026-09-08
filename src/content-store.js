const STORAGE_KEY = "farouk-portfolio-content-v1";

export const DEFAULT_DATA = {
  about: {
    name: "farouk obayanju",
    role: "vibecoder • data analyst • social media manager",
    intro: "i work in the overlap:",
    introStrong: "small useful software, clean data, and social ideas people actually want to pass around.",
    bullets: [
      "i prototype tools when a spreadsheet is no longer enough — quick, practical builds that remove the boring part.",
      "i turn messy numbers into a clear read on what happened, why it happened, and what to try next.",
      "i shape social strategy and write for the timeline without sanding every sentence into brand-speak.",
      "web3 native, internet-raised, and always paying attention to the reply section."
    ],
    signature: "build it. measure it. say it properly.",
    photo: "farouk.jpg",
    photoAlt: "farouk obayanju"
  },
  work: [
    { id: "x-analytics", category: "social", type: "social strategy & engagement", title: "building a presence on x", description: "reply systems, thread playbooks, and community conversations grounded in web3 culture.", image: "analytics.png", imageAlt: "x analytics screenshot showing 9.8 million impressions and 206.5 thousand engagements", metrics: ["9.8m impressions", "206.5k engagements"], note: "historical totals from my archived x analytics screenshot.", link: "analytics.png", cta: "see the analytics" },
    { id: "0xppl-thread", category: "writing", type: "product storytelling", title: "making web3 feel human", description: "a thread about 0xppl, written around the everyday experience of using the product.", art: "warm", artCopy: "less noise.\nmore narrative.", link: "https://x.com/faroukobayanju/status/2020595099495772489", cta: "read the thread" },
    { id: "shfl-report", category: "data", type: "onchain intelligence", title: "shfl onchain report", description: "a deep dive into protocol metrics, user behaviour, and liquidity — turning blockchain data into a story stakeholders can use.", image: "onchain.png", imageAlt: "shfl onchain report research visual", tags: "dune analytics · research · storytelling", link: "onchain.png", cta: "view report preview" },
    { id: "brand-social", category: "social", type: "brand & community", title: "showing up with intention", description: "social presence for haikeystweet, community growth and engagement for suidom, and social strategy for taxcoin.", art: "brand", artCopy: "haikeystweet\nsuidom\ntaxcoin", link: "#experience", cta: "explore my experience" },
    { id: "defi-agents", category: "writing", type: "research-led writing", title: "why agents matter in defi", description: "exploring the gap between open financial systems and the experience of actually using them.", art: "ink", artCopy: "big ideas.\nclear words.", link: "https://x.com/faroukobayanju/status/1984878224233336985", cta: "read the thread" },
    { id: "ghostwriting", category: "writing", type: "founder & kol ghostwriting", title: "a voice worth following", description: "threads, positioning, and narratives for 0xtulkas0 and 0xbreyn — built around the person behind the account.", art: "lined", artCopy: "your ideas.\nyour voice.\nmy words.", link: "https://t.me/faroukobayanju", cta: "talk about ghostwriting" }
  ],
  experience: [
    { id: "social-manager", role: "social media manager", company: "haikeystweet · suidom · taxcoin", period: "2024 – present", summary: "managing social presence, shaping brand narratives, and building engagement across web3 communities.", details: "social presence management for haikeystweet.\ncommunity growth and engagement strategy for suidom on sui.\nsocial strategy and community management for taxcoin.\nreply systems and content positioning for founders and kols." },
    { id: "ghostwriter", role: "ghostwriter", company: "0xtulkas0 & 0xbreyn", period: "2025 – present", summary: "writing x threads and developing voice, positioning, and narrative strategies for web3 personal brands.", details: "researching topics, shaping ideas into threads, and tailoring each piece to the account’s voice and audience." },
    { id: "analyst", role: "onchain analyst", company: "freelance", period: "2023 – present", summary: "using dune analytics to turn blockchain datasets into ecosystem insights across sei, solana, sui, and ton.", details: "protocol metrics, user behaviour, and liquidity research, including the shfl onchain report. the same research discipline informs my content work." }
  ],
  projects: [
    { id: "meme-nft", title: "meme to nft", description: "a sei network experiment turning memes into nfts. internet culture, made onchain.", image: "justmemeit.jpeg", imageAlt: "meme to nft application on sei", link: "justmemeit.jpeg", cta: "view project preview" },
    { id: "injective-api", title: "injective developer api", description: "a unified api for orderbooks, market analytics, trade feeds, and wallet portfolios.", image: "endpoint.jpeg", imageAlt: "injective developer api project", link: "https://github.com/0xZorak/shadowAPI", cta: "view on github" }
  ]
};

const clone = (value) => JSON.parse(JSON.stringify(value));

function normalize(value = {}) {
  const about = value.about && typeof value.about === "object" ? value.about : {};
  return {
    about: {
      ...clone(DEFAULT_DATA.about),
      ...about,
      bullets: Array.isArray(about.bullets) ? about.bullets.filter(Boolean) : clone(DEFAULT_DATA.about.bullets)
    },
    work: Array.isArray(value.work) ? value.work : clone(DEFAULT_DATA.work),
    experience: Array.isArray(value.experience) ? value.experience : clone(DEFAULT_DATA.experience),
    projects: Array.isArray(value.projects) ? value.projects : clone(DEFAULT_DATA.projects)
  };
}

export function getData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? normalize(JSON.parse(stored)) : clone(DEFAULT_DATA);
  } catch {
    return clone(DEFAULT_DATA);
  }
}

export function saveData(data) {
  const next = normalize(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("portfolio-content-updated", { detail: next }));
  return next;
}

export function resetData() {
  return saveData(clone(DEFAULT_DATA));
}

export function importData(value) {
  if (!value || typeof value !== "object") throw new Error("That file does not contain portfolio data.");
  return saveData(value);
}

export function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function loadData() {
  try {
    const response = await fetch("/api/content", { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error("hosted content is unavailable");
    return normalize(await response.json());
  } catch {
    return getData();
  }
}

export async function persistData(data, password = "") {
  const next = normalize(data);
  try {
    const response = await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${password}` },
      body: JSON.stringify(next)
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || "the hosted content could not be saved.");
    }
    return saveData(normalize(await response.json()));
  } catch (error) {
    if (["localhost", "127.0.0.1"].includes(location.hostname)) return saveData(next);
    throw error;
  }
}
