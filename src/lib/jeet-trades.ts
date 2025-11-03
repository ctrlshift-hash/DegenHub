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
  mostJeeted?: string[]; // token symbols/names (1-3)
  pnlSol: number; // total realized/unrealized loss in SOL (negative = loss)
  pnlUsd: number; // same in USD (negative = loss)
  worstTrades: JeetTrade[];
};

// Seed with examples; you can send me real wallets/trades to add here.
export const JEET_PROFILES: JeetProfile[] = [
  // Placeholder entries for requested names. Wallets and trades can be filled later.
  { wallet: "CkPFGv2Wv1vwdWjtXioEgb8jhZQfs3eVZez3QCetu7xD", name: "Lynk", pfpUrl: "https://pbs.twimg.com/profile_images/1848910264051052546/Mu18BSYv_400x400.jpg", description: "Buys tops so often he's on first-name basis with resistance.", jeetScore: 0, badges: [], roastTopQuote: "", mostJeeted: [], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "CRVidEDtEUTYZisCxBZkpELzhQc9eauMLR3FWg74tReL", name: "Frankdegods", pfpUrl: "https://pbs.twimg.com/profile_images/1875856094003712000/uPMXWOrl_400x400.jpg", description: "Turned \"community call\" into \"community exit liquidity\" in 12 minutes.", jeetScore: 0, badges: [], roastTopQuote: "", mostJeeted: [], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "3kebnKw7cPdSkLRfiMEALyZJGZ4wdiSRvmoN4rD1yPzV", name: "Bastille", pfpUrl: "https://pbs.twimg.com/profile_images/1984890156629868544/oTSGjVuN_400x400.jpg", description: "Stormed the charts, forgot the stop-loss.", jeetScore: 0, badges: [], roastTopQuote: "", mostJeeted: [], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "As7HjL7dzzvbRbaD3WCun47robib2kmAKRXMvjHkSMB5", name: "Otta", pfpUrl: "https://pbs.twimg.com/profile_images/1970659942404104192/jtl76tJU_400x400.jpg", description: "Always early… to the dump party.", jeetScore: 0, badges: [], roastTopQuote: "", mostJeeted: ["Fapcoin"], pnlSol: 0, pnlUsd: 0, worstTrades: [
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
  { wallet: "4YzpSZpxDdjNf3unjkCtdWEsz2FL5mok7e5XQaDNqry8", name: "Xunle", pfpUrl: "https://pbs.twimg.com/profile_images/1968676518835695616/vJgbiLIi_400x400.png", description: "Catches every wick. Unfortunately, the down ones.", jeetScore: 0, badges: [], roastTopQuote: "", mostJeeted: [], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "87rRdssFiTJKY4MGARa4G5vQ31hmR7MxSmhzeaJ5AAxJ", name: "Dior", pfpUrl: "https://pbs.twimg.com/profile_images/1949585515969200128/7YriU7Jw_400x400.jpg", description: "Luxury entries, thrift-store exits.", jeetScore: 0, badges: [], roastTopQuote: "", mostJeeted: [], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR", name: "Casino", pfpUrl: "https://pbs.twimg.com/profile_images/1938817754917679104/ysUWGQMM_400x400.jpg", description: "All-in on red; chart printed green. Again.", jeetScore: 0, badges: [], roastTopQuote: "", mostJeeted: [], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "AVAZvHLR2PcWpDf8BXY4rVxNHYRBytycHkcB5z5QNXYm", name: "Ansem", pfpUrl: "https://pbs.twimg.com/profile_images/1961642107187109888/o0B468ZS_400x400.jpg", description: "Alpha so strong he fades himself.", jeetScore: 0, badges: [], roastTopQuote: "", mostJeeted: [], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "GM7Hrz2bDq33ezMtL6KGidSWZXMWgZ6qBuugkb5H8NvN", name: "Beaver", pfpUrl: "https://pbs.twimg.com/profile_images/1975840318403555328/54Si5vCU_400x400.jpg", description: "Builds dams. Can't dam the sell button.", jeetScore: 0, badges: [], roastTopQuote: "", mostJeeted: [], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "55v67959rYazE8cTef9Vrfi1tN4fKiK37TVVzxzYDcfd", name: "James Wynn", pfpUrl: "https://pbs.twimg.com/profile_images/1982272016615981056/tZAJ2f8i_400x400.jpg", description: "Last name lies.", jeetScore: 0, badges: [], roastTopQuote: "", mostJeeted: [], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "", name: "Infinity Gainz", pfpUrl: "https://pbs.twimg.com/profile_images/1981112565905207296/Jxzfw9Xj_400x400.jpg", description: "Infinite conviction, finite balance.", jeetScore: 0, badges: [], roastTopQuote: "", mostJeeted: [], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "", name: "Professor Crypto", pfpUrl: "https://pbs.twimg.com/profile_images/1976071073863962624/5l8trevT_400x400.jpg", description: "Tenure in TA, minor in coping.", jeetScore: 0, badges: [], roastTopQuote: "", mostJeeted: [], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "4hHDEvTuhFRBebxYsDvmQXgRjHnp4Yk4pwSmmo1aU3PP", name: "ThreadGuy", pfpUrl: "https://pbs.twimg.com/profile_images/1920651894982066176/ssOaEU8k_400x400.jpg", description: "Writes 20 tweets, buys 20% higher.", jeetScore: 0, badges: [], roastTopQuote: "", mostJeeted: [], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "5AyJw1VNDgTho2chipbVmuGqTuX1fCvVkLneChQkQrw8", name: "Bolivian", pfpUrl: "https://pbs.twimg.com/profile_images/1978186925354692608/rf7VRfFn_400x400.jpg", description: "HODLer until the first 2% candle.", jeetScore: 0, badges: [], roastTopQuote: "", mostJeeted: [], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
  { wallet: "gkNNf4NwkR61B1QKBFtELe6TVZFhYRaC2LbVkoNyCkB", name: "Prada", pfpUrl: "https://pbs.twimg.com/profile_images/1886923196319817728/IEwxPWpI_400x400.jpg", description: "Designer bags, rugged straps.", jeetScore: 0, badges: [], roastTopQuote: "", mostJeeted: [], pnlSol: 0, pnlUsd: 0, worstTrades: [] },
];

export function getAllJeetTrades(): JeetTrade[] {
  return JEET_PROFILES.flatMap((e) => e.worstTrades);
}

export function getJeetProfiles(): JeetProfile[] {
  return JEET_PROFILES;
}


