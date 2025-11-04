export type JeetTrade = {
  wallet: string;
  tokenMint: string;
  tokenSymbol?: string;
  side: "buy" | "sell";
  qty: number; // token quantity
  priceUsd: number; // execution price in USD
  valueUsd: number; // qty * priceUsd
  timestamp: string; // ISO
  note?: string;
  txUrl?: string;
  tokenUrl?: string;
};

export type JeetEntry = {
  wallet: string;
  worstTrades: JeetTrade[];
};

export type JeetProfile = {
  wallet: string;
  name: string;
  pfpUrl: string;
  description?: string;
  jeetScore?: number;
  badges?: string[];
  roastTopQuote?: string;
  roasts?: string[]; // Array of roast strings
  predictions?: string[]; // Array of prediction strings
  mostJeeted?: Array<{ name: string; url: string }>; // token symbols/names with trade URLs
  pnlSol: number; // total realized/unrealized loss in SOL (negative = loss)
  pnlUsd: number; // same in USD (negative = loss)
  worstTrades: JeetTrade[];
};

// Seed with examples; you can send me real wallets/trades to add here.
export const JEET_PROFILES: JeetProfile[] = [
  // Placeholder entries for requested names. Wallets and trades can be filled later.
  { wallet: "CkPFGv2Wv1vwdWjtXioEgb8jhZQfs3eVZez3QCetu7xD", name: "Lynk", pfpUrl: "https://pbs.twimg.com/profile_images/1848910264051052546/Mu18BSYv_400x400.jpg", description: "Buys tops so often he's on first-name basis with resistance.", jeetScore: 95, badges: [], roastTopQuote: "Lynk bought the top so fast, I think he was aiming for it.", roasts: [
    "Lynk bought the top so fast, I think he was aiming for it.",
    "This guy's stop-loss is actually a 'continue losing' button.",
    "Lynk's entries are so precise, they should be in a museum... of bad trades."
  ], predictions: [
    "Will buy the next pump.fun scam within 5 minutes of launch",
    "Guaranteed to exit at the worst possible time",
    "Will catch every red wick like it's a Pokemon"
  ], mostJeeted: [
    { name: "Tepe", url: "https://trade.padre.gg/trade/solana/75xa1Y3YnqdTezziJ4aG3op2d75HP2GYioMH3Y84pump" },
    { name: "hitcoin", url: "https://trade.padre.gg/trade/solana/G7wXMPRMzKTyzVJxtbvpma1sGukhjNZxHYcnDscqpump" },
    { name: "metoo", url: "https://trade.padre.gg/trade/solana/xukmYA1pxAZUjGjUARQjUAzCJBoBwCt16iFqMarpump" }
  ], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "CRVidEDtEUTYZisCxBZkpELzhQc9eauMLR3FWg74tReL", name: "Frankdegods", pfpUrl: "https://pbs.twimg.com/profile_images/1875856094003712000/uPMXWOrl_400x400.jpg", description: "Turned \"community call\" into \"community exit liquidity\" in 12 minutes.", jeetScore: 88, badges: [], roastTopQuote: "Frankdegods said 'trust me bro' right before the dump. I trusted.", roasts: [
    "Frankdegods said 'trust me bro' right before the dump. I trusted.",
    "Turned 'community call' into 'community exit liquidity' in 12 minutes.",
    "Frank's alpha calls are so strong, they fade themselves."
  ], predictions: [
    "Will dump on his community within 15 minutes of calling",
    "Next alpha call will be a rug pull",
    "Will ask for money and block followers"
  ], mostJeeted: [
    { name: "MLG", url: "https://axiom.trade/meme/F4HDXnULqjSbWcL5VwEUcpjueQop3gDteusSqaXBEyW4?chain=sol" },
    { name: "hMUSTSTOPM", url: "https://axiom.trade/meme/Hy6qZy6JKogFLecDLtQFZphkt9UaM4jNG7h9GC2SqZaT?chain=sol" },
    { name: "VINE", url: "https://axiom.trade/meme/58fzJMbX5PatnfJPqWWsqkVFPRKptkbb5r2vCw4Qq3z9?chain=sol" }
  ], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "3kebnKw7cPdSkLRfiMEALyZJGZ4wdiSRvmoN4rD1yPzV", name: "Bastille", pfpUrl: "https://pbs.twimg.com/profile_images/1984890156629868544/oTSGjVuN_400x400.jpg", description: "Stormed the charts, forgot the stop-loss.", jeetScore: 82, badges: [], roastTopQuote: "Stormed the charts, forgot the stop-loss.", roasts: [
    "Stormed the charts, forgot the stop-loss.",
    "Bastille's revolution was successful... in losing money.",
    "Took 'liberté, égalité, fraternité' to mean 'liberty to lose, equality in losses, brotherhood of bagholders'."
  ], predictions: [
    "Will launch a token and forget to set stop-loss",
    "Next trade will be a historical loss",
    "Will storm another chart and get rekt"
  ], mostJeeted: [
    { name: "Spotlight", url: "https://trade.padre.gg/trade/solana/HfPXryJcby5h6uxGVs6vVFJTcmGpPTnRRdMGManUpump" },
    { name: "Fepe", url: "https://trade.padre.gg/trade/solana/EMQqGrUpaF1yK821BEoeGsUZwAPTT1NgJz5d1yFspump" },
    { name: "Sorcerer", url: "https://trade.padre.gg/trade/solana/H7XwEcsyvVULxttTsK3eQvi7iArkJ7rcPGFNL74HZ3zS" },
    { name: "Penguin", url: "https://trade.padre.gg/trade/solana/Ew2qFTPxR962cV3jgtLm7HFC1eFkV7TDUP7fWJVjjups" }
  ], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "As7HjL7dzzvbRbaD3WCun47robib2kmAKRXMvjHkSMB5", name: "Otta", pfpUrl: "https://pbs.twimg.com/profile_images/1970659942404104192/jtl76tJU_400x400.jpg", description: "Always early… to the dump party.", jeetScore: 90, badges: [], roastTopQuote: "Otta was early to the party... the going away party.", roasts: [
    "Otta was early to the party... the going away party.",
    "Always early to the dump, never early to the pump.",
    "Otta's timing is so bad, he bought Bitcoin at $69k... twice."
  ], predictions: [
    "Will be early to the next dump",
    "Will buy before the pump, sell after the dump",
    "Next jeet will be legendary"
  ], mostJeeted: [
    { name: "froge", url: "https://trade.padre.gg/trade/solana/GVFJbBNZubBv1XqsBmakWKkCZsMEDnRZ55vXQSgMRCpd" },
    { name: "XP", url: "https://trade.padre.gg/trade/solana/AmrBEwh3kjB12sth73k549qkJ4AGtbPebf3v7Tsvpump" },
    { name: "MODRIC", url: "https://trade.padre.gg/trade/solana/F5qFr17LeunQk5ikRM9hseSi2bbZYXYRum8zaTegtrnd" },
    { name: "FAFO", url: "https://trade.padre.gg/trade/solana/7Mz6gDP1B1Zpn1ZCJ57i1RPdsYwCB5b9uzSic9XZVYAU" }
  ], pnlSol: 0, pnlUsd: 0, worstTrades: [
    {
      wallet: "As7HjL7dzzvbRbaD3WCun47robib2kmAKRXMvjHkSMB5",
      tokenMint: "27dAPsyL9vxaLonk4uqnLKE1F9zUSvvHsoYj436opump",
      tokenSymbol: "Fapcoin",
      side: "sell",
      qty: 0,
      priceUsd: 0,
      valueUsd: 0,
      timestamp: new Date().toISOString(),
      note: "Most jeeted coin",
      tokenUrl: "https://trade.padre.gg/trade/solana/27dAPsyL9vxaLonk4uqnLKE1F9zUSvvHsoYj436opump"
    }
  ] },
  { wallet: "4YzpSZpxDdjNf3unjkCtdWEsz2FL5mok7e5XQaDNqry8", name: "Xunle", pfpUrl: "https://pbs.twimg.com/profile_images/1968676518835695616/vJgbiLIi_400x400.png", description: "Catches every wick. Unfortunately, the down ones.", jeetScore: 93, badges: [], roastTopQuote: "Xunle catches wicks. All of them. Especially the red ones.", roasts: [
    "Xunle catches wicks. All of them. Especially the red ones.",
    "Catches every wick. Unfortunately, the down ones.",
    "Xunle's trading strategy: catch falling knives... with his face."
  ], predictions: [
    "Will catch the next red wick perfectly",
    "Will buy every dip... until it keeps dipping",
    "Next trade will be a wick catch masterpiece"
  ], mostJeeted: [
    { name: "Unfazed", url: "https://trade.padre.gg/trade/solana/EE2KUa4ALGKHsZR13VGu1dy6QeQbTSNQbmiSEfMYpump" },
    { name: "SACRED", url: "https://trade.padre.gg/trade/solana/7BR6YQupV2STMYpVwCmSpxCfgEfvJvACj1QXUrNYRAUD" },
    { name: "SORACLE", url: "https://trade.padre.gg/trade/solana/E9qT2T2YHfD67X7VKXZ7PWGnhaZ1nYdEBGbx9xbKpump" },
    { name: "REFOREST", url: "https://trade.padre.gg/trade/solana/2DrmcanbbDgoE9pCdvZcxPJNwERvWUxyXBioARJJr39H" }
  ], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "87rRdssFiTJKY4MGARa4G5vQ31hmR7MxSmhzeaJ5AAxJ", name: "Dior", pfpUrl: "https://pbs.twimg.com/profile_images/1949585515969200128/7YriU7Jw_400x400.jpg", description: "Luxury entries, thrift-store exits.", jeetScore: 85, badges: [], roastTopQuote: "Dior's entries are designer, exits are from Wish.com.", roasts: [
    "Dior's entries are designer, exits are from Wish.com.",
    "Luxury entries, thrift-store exits.",
    "Spends like Dior, trades like a thrift store."
  ], predictions: [
    "Will enter with style, exit with losses",
    "Next trade will be designer quality entry, dollar store exit",
    "Will buy the top with luxury, sell the bottom for pennies"
  ], mostJeeted: [
    { name: "TBC", url: "https://trade.padre.gg/trade/solana/8yScHH9ViYzfB2rXj7VpEAKHp1GZVu1YKYsK9P6epump" },
    { name: "OUTAGE", url: "https://trade.padre.gg/trade/solana/7q6zpR136947HVwNFwwWwy2nUT8qXPwbVAUENjiQpump" },
    { name: "Goblin", url: "https://trade.padre.gg/trade/solana/GfpuU8x2N4C6zWC8PSdBHisfFEey56vEmntwiFEKpump" },
    { name: "Bonded", url: "https://trade.padre.gg/trade/solana/RTE9UZD2jnUzqEZxt2wyjZCWLDPvDR8oVb1kAn3pump" }
  ], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR", name: "Casino", pfpUrl: "https://pbs.twimg.com/profile_images/1938817754917679104/ysUWGQMM_400x400.jpg", description: "All-in on red; chart printed green. Again.", jeetScore: 91, badges: [], roastTopQuote: "Casino went all-in and the house always wins. He IS the house.", roasts: [
    "Casino went all-in and the house always wins. He IS the house.",
    "All-in on red; chart printed green. Again.",
    "Casino's strategy: all-in, all-out, all-lost."
  ], predictions: [
    "Will go all-in on the wrong color again",
    "Next bet will be the house's favorite",
    "Will double down and lose double"
  ], mostJeeted: [
    { name: "Penny", url: "https://trade.padre.gg/trade/solana/BTjuy5LGNoayKbby7zAFSmJqaPYf2queWrhQ9n9mpump" },
    { name: "PAYPER", url: "https://trade.padre.gg/trade/solana/4BwTM7JvCXnMHPoxfPBoNjxYSbQpVQUMPtK5KNGppump" },
    { name: "SIAMESE", url: "https://trade.padre.gg/trade/solana/GsNYtdEzWHU493nJKL7CXXgyH8pZ4uya3w5osTpTzYaf" },
    { name: "ALEX", url: "https://trade.padre.gg/trade/solana/BRzCSNgp5ZxHp3j4Uq3uMghLMTPHXKToefz2PZ6Xpump" }
  ], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "AVAZvHLR2PcWpDf8BXY4rVxNHYRBytycHkcB5z5QNXYm", name: "Ansem", pfpUrl: "https://pbs.twimg.com/profile_images/1961642107187109888/o0B468ZS_400x400.jpg", description: "Alpha so strong he fades himself.", jeetScore: 87, badges: [], roastTopQuote: "Ansem asked me for money and blocked me.", roasts: [
    "Ansem asked me for money and blocked me.",
    "Alpha so strong he fades himself.",
    "Ansem's alpha calls are so powerful, they reverse the entire market."
  ], predictions: [
    "Will call alpha and fade himself",
    "Next alpha will be so strong it dumps",
    "Will ask for money and block followers"
  ], mostJeeted: [
    { name: "Gropper", url: "https://trade.padre.gg/trade/solana/G6ZmHLZpLQAJRXK1kkJYhqasHH8mzbyfVEfWLjWypump" },
    { name: "SACHO", url: "https://trade.padre.gg/trade/solana/91act8ejuXSvR1qEahRjziCPyupDMnUqcm5NL3NDpump" },
    { name: "X402", url: "https://trade.padre.gg/trade/solana/6H8uyJYrPVcra6Fi7iWh29DXSm8KctzhHRyXmPwKpump" }
  ], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "GM7Hrz2bDq33ezMtL6KGidSWZXMWgZ6qBuugkb5H8NvN", name: "Beaver", pfpUrl: "https://pbs.twimg.com/profile_images/1975840318403555328/54Si5vCU_400x400.jpg", description: "Builds dams. Can't dam the sell button.", jeetScore: 89, badges: [], roastTopQuote: "Beaver's stop-loss is actually a 'continue losing' button.", roasts: [
    "Beaver's stop-loss is actually a 'continue losing' button.",
    "Builds dams. Can't dam the sell button.",
    "Beaver builds dams to hold water, but can't hold his bags."
  ], predictions: [
    "Will build a dam but can't stop the sell pressure",
    "Next trade will be a dam failure",
    "Will try to hold but the sell button calls"
  ], mostJeeted: [
    { name: "SKINS", url: "https://trade.padre.gg/trade/solana/FzfV7kjzMg8eNMnMWF5RVXQRLHeww6dZoG5Ehsuipump" },
    { name: "SPAWN", url: "https://trade.padre.gg/trade/solana/kNesN31SJqvyryfoUdUiwmPiPMwjB8ssarREpw1pump" },
    { name: "CLUELY", url: "https://trade.padre.gg/trade/solana/12R4xTtTbXiGBZ3QSaGN8agiawXQHsC3qpAkJ4VRmBLV" },
    { name: "POLYBADDIE", url: "https://trade.padre.gg/trade/solana/Dx6zPZoshT8n4EAY1M6iJETrekrzuqJGEzgLAg7XneXo" }
  ], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "55v67959rYazE8cTef9Vrfi1tN4fKiK37TVVzxzYDcfd", name: "James Wynn", pfpUrl: "https://pbs.twimg.com/profile_images/1982272016615981056/tZAJ2f8i_400x400.jpg", description: "Last name lies.", jeetScore: 84, badges: [], roastTopQuote: "James Wynn's name is ironic. Very ironic.", roasts: [
    "James Wynn's name is ironic. Very ironic.",
    "Last name lies.",
    "James Wynn's trading makes his last name a joke."
  ], predictions: [
    "Will keep losing despite his name",
    "Next trade will be another ironic loss",
    "Will prove his name wrong again"
  ], mostJeeted: [
    { name: "Bitcoin", url: "" },
    { name: "Moonpig", url: "https://axiom.trade/meme/F8R9okKt8PvygkZ6bCimxELYb2kUn9E3FDdugfeRUYJw?chain=sol" }
  ], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "", name: "Infinity Gainz", pfpUrl: "https://pbs.twimg.com/profile_images/1981112565905207296/Jxzfw9Xj_400x400.jpg", description: "Infinite conviction, finite balance.", jeetScore: 0, badges: [], roastTopQuote: "", mostJeeted: [], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "", name: "Professor Crypto", pfpUrl: "https://pbs.twimg.com/profile_images/1976071073863962624/5l8trevT_400x400.jpg", description: "Tenure in TA, minor in coping.", jeetScore: 0, badges: [], roastTopQuote: "", mostJeeted: [], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "4hHDEvTuhFRBebxYsDvmQXgRjHnp4Yk4pwSmmo1aU3PP", name: "ThreadGuy", pfpUrl: "https://pbs.twimg.com/profile_images/1920651894982066176/ssOaEU8k_400x400.jpg", description: "Writes 20 tweets, buys 20% higher.", jeetScore: 86, badges: [], roastTopQuote: "Writes 20 tweets, buys 20% higher.", roasts: [
    "Writes 20 tweets, buys 20% higher.",
    "ThreadGuy's threads are longer than his holding periods.",
    "Writes essays about crypto, buys at the top."
  ], predictions: [
    "Will write a thread and buy 20% higher",
    "Next thread will be about a coin he buys at the top",
    "Will tweet about it, then buy it at the worst time"
  ], mostJeeted: [
    { name: "Frank", url: "" }
  ], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "5AyJw1VNDgTho2chipbVmuGqTuX1fCvVkLneChQkQrw8", name: "Bolivian", pfpUrl: "https://pbs.twimg.com/profile_images/1978186925354692608/rf7VRfFn_400x400.jpg", description: "HODLer until the first 2% candle.", jeetScore: 92, badges: [], roastTopQuote: "HODLer until the first 2% candle.", roasts: [
    "HODLer until the first 2% candle.",
    "Bolivian's HODL strategy: hold until the first red candle.",
    "Claims to HODL, sells at the first dip."
  ], predictions: [
    "Will HODL until the first 2% red candle",
    "Next trade will be a HODL that lasts 5 minutes",
    "Will sell at the first sign of trouble"
  ], mostJeeted: [
    { name: "Fortnoy", url: "https://axiom.trade/meme/9oti45bUgYz1S8QPnYmyzE1H2kHQWepMVxnmeMSCUn2o?chain=sol" },
    { name: "RUNNER", url: "https://axiom.trade/meme/6XXEYtP1DMvGrpjbpRBnQuNYYsyiJY2E5WfckzL5iLmk?chain=sol" },
    { name: "DSTH", url: "https://axiom.trade/meme/Dhw4gRLfp4rpAncn6imsLtm9jeD41aWEVWtFvycB966a?chain=sol" }
  ], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "gkNNf4NwkR61B1QKBFtELe6TVZFhYRaC2LbVkoNyCkB", name: "Prada", pfpUrl: "https://pbs.twimg.com/profile_images/1886923196319817728/IEwxPWpI_400x400.jpg", description: "Designer bags, rugged straps.", jeetScore: 83, badges: [], roastTopQuote: "Designer bags, rugged straps.", roasts: [
    "Designer bags, rugged straps.",
    "Prada's trading style: luxury entry, rugged exit.",
    "Spends like Prada, trades like a thrift store."
  ], predictions: [
    "Will enter with style, exit like a rug pull",
    "Next trade will be designer quality, rugged results",
    "Will buy expensive, sell cheap"
  ], mostJeeted: [
    { name: "$michi", url: "https://axiom.trade/meme/GH8Ers4yzKR3UKDvgVu8cqJfGzU4cU62mTeg9bcJ7ug6?chain=sol" },
    { name: "SIGMA", url: "https://axiom.trade/meme/424kbbJyt6VkSn7GeKT9Vh5yetuTR1sbeyoya2nmBJpw?chain=sol" },
    { name: "YETI", url: "https://axiom.trade/meme/4YNzWNydnwBMATeQj4CEE8mGoN1w8EmmKe1ijX9A1W3A?chain=sol" }
  ], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
];

export function getAllJeetTrades(): JeetTrade[] {
  return JEET_PROFILES.flatMap((e) => e.worstTrades);
}

export function getJeetProfiles(): JeetProfile[] {
  return JEET_PROFILES;
}


