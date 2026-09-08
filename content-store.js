(function () {
  const key = 'farouk-portfolio-content-v1';

  const defaults = {
    work: [
      {
        id: 'x-analytics',
        category: 'social',
        type: 'social strategy & engagement',
        title: 'building a presence on x',
        description: 'reply systems, thread playbooks, and community conversations grounded in web3 culture.',
        image: 'analytics.png',
        imageAlt: 'x analytics screenshot showing 9.8 million impressions and 206.5 thousand engagements',
        metrics: ['9.8m impressions', '206.5k engagements'],
        note: 'historical totals from my archived x analytics screenshot.',
        link: 'analytics.png',
        cta: 'see the analytics'
      },
      {
        id: '0xppl-thread',
        category: 'writing',
        type: 'product storytelling',
        title: 'making web3 feel human',
        description: 'a thread about 0xppl, written around the everyday experience of using the product.',
        art: 'warm',
        artCopy: 'less noise.\nmore narrative.',
        link: 'https://x.com/faroukobayanju/status/2020595099495772489',
        cta: 'read the thread'
      },
      {
        id: 'shfl-report',
        category: 'data',
        type: 'onchain intelligence',
        title: 'shfl onchain report',
        description: 'a deep dive into protocol metrics, user behaviour, and liquidity — turning blockchain data into a story stakeholders can use.',
        image: 'onchain.png',
        imageAlt: 'shfl onchain report research visual',
        tags: 'dune analytics · research · storytelling',
        link: 'onchain.png',
        cta: 'view report preview'
      },
      {
        id: 'brand-social',
        category: 'social',
        type: 'brand & community',
        title: 'showing up with intention',
        description: 'social presence for haikeystweet, community growth and engagement for suidom, and social strategy for taxcoin.',
        art: 'brand',
        artCopy: 'haikeystweet\nsuidom\ntaxcoin',
        link: '#experience',
        cta: 'explore my experience'
      },
      {
        id: 'defi-agents',
        category: 'writing',
        type: 'research-led writing',
        title: 'why agents matter in defi',
        description: 'exploring the gap between open financial systems and the experience of actually using them.',
        art: 'ink',
        artCopy: 'big ideas.\nclear words.',
        link: 'https://x.com/faroukobayanju/status/1984878224233336985',
        cta: 'read the thread'
      },
      {
        id: 'ghostwriting',
        category: 'writing',
        type: 'founder & kol ghostwriting',
        title: 'a voice worth following',
        description: 'threads, positioning, and narratives for 0xtulkas0 and 0xbreyn — built around the person behind the account.',
        art: 'lined',
        artCopy: 'your ideas.\nyour voice.\nmy words.',
        link: 'https://t.me/faroukobayanju',
        cta: 'talk about ghostwriting'
      }
    ],
    experience: [
      {
        id: 'social-manager',
        role: 'social media manager',
        company: 'haikeystweet · suidom · taxcoin',
        period: '2024 – present',
        summary: 'managing social presence, shaping brand narratives, and building engagement across web3 communities.',
        details: 'social presence management for haikeystweet.\ncommunity growth and engagement strategy for suidom on sui.\nsocial strategy and community management for taxcoin.\nreply systems and content positioning for founders and kols.'
      },
      {
        id: 'ghostwriter',
        role: 'ghostwriter',
        company: '0xtulkas0 & 0xbreyn',
        period: '2025 – present',
        summary: 'writing x threads and developing voice, positioning, and narrative strategies for web3 personal brands.',
        details: 'researching topics, shaping ideas into threads, and tailoring each piece to the account’s voice and audience.'
      },
      {
        id: 'analyst',
        role: 'onchain analyst',
        company: 'freelance',
        period: '2023 – present',
        summary: 'using dune analytics to turn blockchain datasets into ecosystem insights across sei, solana, sui, and ton.',
        details: 'protocol metrics, user behaviour, and liquidity research, including the shfl onchain report. the same research discipline informs my content work.'
      }
    ],
    projects: [
      {
        id: 'meme-nft',
        title: 'meme to nft',
        description: 'a sei network experiment turning memes into nfts. internet culture, made onchain.',
        image: 'justmemeit.jpeg',
        imageAlt: 'meme to nft application on sei',
        link: 'justmemeit.jpeg',
        cta: 'view project preview'
      },
      {
        id: 'injective-api',
        title: 'injective developer api',
        description: 'a unified api for orderbooks, market analytics, trade feeds, and wallet portfolios.',
        image: 'endpoint.jpeg',
        imageAlt: 'injective developer api project',
        link: 'https://github.com/0xZorak/shadowAPI',
        cta: 'view on github'
      }
    ]
  };

  const clone = value => JSON.parse(JSON.stringify(value));

  function getData() {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved && Array.isArray(saved.work) && Array.isArray(saved.experience) && Array.isArray(saved.projects)) return saved;
    } catch (_) {}
    return clone(defaults);
  }

  function saveData(data) {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('portfolio-data-changed'));
  }

  function resetData() {
    localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent('portfolio-data-changed'));
    return clone(defaults);
  }

  function importData(text) {
    const data = JSON.parse(text);
    if (!data || !Array.isArray(data.work) || !Array.isArray(data.experience) || !Array.isArray(data.projects)) {
      throw new Error('that file is not a valid portfolio export.');
    }
    saveData(data);
    return data;
  }

  function makeId(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }

  window.PortfolioStore = { defaults: clone(defaults), getData, saveData, resetData, importData, makeId };
}());
