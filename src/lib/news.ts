export type NewsArticle = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string; // ISO date
  source?: string;
  content: string[]; // paragraphs
};

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    slug: "solana-meme-coin-pvp-pumpfun",
    title: "Solana Meme Coin Traders Protest Rising PvP Tactics on Pump.fun",
    summary:
      "Community debates fair launches as sniping tools and copycat tokens intensify competition across Solana memecoins.",
    publishedAt: new Date().toISOString(),
    source: "DegenHub Newsdesk",
    content: [
      "Traders on X criticized the increasing player‑versus‑player dynamics in Solana's meme coin ecosystem, where sniping bots and rapid copycat launches make it harder for retail participants to compete.",
      "A post by uxento co‑founder Nuotrix warning about tools that may advantage larger players sparked backlash, with critics arguing that such tooling is already shaping launch meta across platforms like pump.fun.",
      "The KitKat token frenzy became a flashpoint as multiple copycats launched within minutes of each other. Order‑flow bots and pre‑liquidity routing briefly overwhelmed manual traders, widening spreads and increasing failed transactions.",
      "Developers and creators debated potential mitigations: time‑boxed warm‑ups before bonding curves open, randomized listing windows, and better disclosure of holder concentration at launch. Advocates say these guardrails could reduce extractive behavior without limiting permissionless access.",
      "On‑chain data over the past week shows shorter median token lifetimes and higher first‑hour volatility compared with earlier months, suggesting tighter competitive windows as automation intensifies.",
      "For retail participants, veteran builders recommend conservative sizing during first minutes, verifying mint authorities and freeze permissions, and waiting for early liquidity stabilization before chasing breakouts.",
    ],
  },
  {
    slug: "rug-pulls-surge-2025",
    title: "Rug Pulls Surge to Multi‑Year Highs; Calls Grow for Better Safeguards",
    summary:
      "On‑chain analytics show an uptick in liquidity‑removal scams across small‑cap tokens, prompting renewed focus on due diligence and tooling.",
    publishedAt: new Date().toISOString(),
    source: "DegenHub Research",
    content: [
      "Rug‑pull incidents have climbed to their highest levels in recent cycles, according to multiple community dashboards tracking token lifecycles and liquidity events.",
      "Analysts cite a mix of rapid token‑factory tooling, low launch costs, and aggressive social amplification as drivers behind the increase. Many tokens exhibit similar patterns: concentrated ownership at launch, opaque team wallets, and permissions allowing liquidity withdrawal or trading halts.",
      "Independent reviewers recommend practical safeguards: time‑locked liquidity, multi‑sig treasury controls, and where appropriate, renounced authorities on upgradeable contracts. Bonding‑curve projects benefit from transparent fee schedules and immutable parameters disclosed at launch.",
      "For everyday traders, due‑diligence steps include verifying creator history, checking mint and freeze authorities, confirming liquidity lock duration, and monitoring holder concentration and top‑10 wallet behavior during first hours.",
      "Tooling is improving as well: scanners flag repeat deployers, while wallet overlays highlight risky permissions before swaps finalize. Education remains the final mile—new entrants continue to over‑index on social buzz over verifiable token mechanics.",
      "Community‑run lists and reporting channels have helped surface repeat patterns quickly, but users are urged to rely on on‑chain facts rather than screenshots or unverifiable claims before allocating capital.",
    ],
  },
  {
    slug: "solana-tps-record-breaking-performance",
    title: "Solana Shatters Transaction Records: 10,000+ TPS Sustained During Meme Coin Frenzy",
    summary:
      "Network handles unprecedented volume as validator upgrades and Firedancer integration show promising results during latest ecosystem surge.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    source: "DegenHub Network Analysis",
    content: [
      "Solana processed over 10,000 transactions per second during yesterday's peak trading hours, marking one of its highest sustained throughput periods to date. The surge coincided with renewed interest in meme tokens and several high-profile launches on pump.fun.",
      "Network validators reported minimal congestion and low failed transaction rates, a stark contrast to performance challenges seen in previous bull cycles. The improvement is largely attributed to ongoing Firedancer integration work and optimized block propagation.",
      "Independent analytics platforms tracked average confirmation times under 400ms during the busiest windows, with over 99.5% of transactions finalizing within two blocks. Developer sentiment has improved significantly, with builders reporting fewer timeout issues and more predictable execution environments.",
      "Infrastructure providers noted increased demand for dedicated RPC endpoints, with premium services maintaining sub-200ms latencies even during peak loads. The ecosystem's resilience during stress tests has drawn attention from institutional observers previously skeptical of blockchain scalability claims.",
      "Looking ahead, the Firedancer client's gradual rollout promises further gains, with testnet benchmarks suggesting potential for 20,000+ TPS under ideal conditions. However, engineers caution that real-world performance depends on validator adoption rates and continued network decentralization.",
      "For traders and builders, the enhanced throughput means more opportunities to participate in rapid-fire token launches without facing the transaction failures that plagued earlier cycles. The improvement in reliability has already attracted new protocol developers considering Solana for high-frequency DeFi applications.",
    ],
  },
  {
    slug: "jupiter-a6-aggregator-upgrade",
    title: "Jupiter A6 Upgrade Goes Live: Enhanced Routing and Lower Gas Fees",
    summary:
      "Major DEX aggregator rolls out latest iteration with improved cross-DEX routing, MEV protection, and optimized gas calculations for Solana traders.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    source: "DegenHub DeFi Watch",
    content: [
      "Jupiter, Solana's leading decentralized exchange aggregator, launched its A6 upgrade yesterday, bringing significant improvements to routing efficiency and user experience. The update includes enhanced pathfinding algorithms that can split large orders across multiple DEXs for better pricing.",
      "Early users report average savings of 2-5% on swap costs compared to direct DEX interactions, with the improvements most noticeable on larger trades exceeding $10,000. The new routing engine considers real-time liquidity, MEV protection mechanisms, and estimated transaction fees to optimize execution.",
      "Notable features include advanced limit order functionality, improved slippage protection, and integration with newer Solana DEX protocols that gained traction over recent months. The upgrade also introduces better error handling and transaction simulation to reduce failed swaps.",
      "Developer documentation has been expanded to support more complex routing scenarios, enabling advanced traders and bots to leverage Jupiter's infrastructure for sophisticated strategies. The aggregator now supports over 15 different DEX protocols on Solana, including Orca, Raydium, and emerging players.",
      "Community feedback has been largely positive, with some power users noting minor interface changes that may require brief adjustment periods. The Jupiter team has committed to maintaining backward compatibility for existing integrations while encouraging migration to new API endpoints.",
      "Analysts predict the upgrade could capture additional market share from direct DEX interactions, especially as users become more cost-conscious in volatile market conditions. The improved routing may also reduce overall MEV extraction across Solana's DeFi ecosystem.",
    ],
  },
  {
    slug: "phantom-wallet-new-features-2025",
    title: "Phantom Wallet Unveils Social Recovery and Enhanced Security Features",
    summary:
      "Popular Solana wallet adds multi-sig support, social recovery options, and hardware wallet integrations to improve user safety and accessibility.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    source: "DegenHub Product Updates",
    content: [
      "Phantom, Solana's most widely used browser and mobile wallet, announced a major security update today introducing social recovery mechanisms, multi-signature wallet support, and expanded hardware wallet compatibility.",
      "The social recovery feature allows users to designate trusted contacts who can help restore access to a wallet if the seed phrase is lost. Security experts emphasize that this requires careful trust relationships, as recovery contacts gain significant power over funds. Phantom has implemented a 7-day time-lock delay and multiple verification steps to mitigate risks.",
      "Multi-signature support enables users to require approvals from multiple devices or accounts before executing large transactions, a feature long requested by power users and institutional clients. The implementation supports flexible configurations, allowing users to set threshold requirements like '3 of 5 signatures' for different transaction types.",
      "Hardware wallet integrations now include Ledger and Trezor support with streamlined pairing processes. Users report significantly faster setup times compared to previous implementations, though some note minor compatibility issues with older hardware models that should be addressed in coming patches.",
      "Privacy-focused users have raised questions about social recovery's trust model, but Phantom emphasizes that all recovery operations occur on-chain with full transparency. The team has also published detailed documentation explaining security assumptions and best practices for configuring recovery options.",
      "The update positions Phantom more competitively against enterprise wallet solutions while maintaining its reputation for user-friendly design. Early adoption metrics show strong interest in multi-sig features, particularly among users managing larger portfolios or sharing wallets with teams.",
    ],
  },
  {
    slug: "bonk-surge-community-growth",
    title: "BONK Token Surges 40% as Community Engagement Hits All-Time High",
    summary:
      "Meme coin sees renewed momentum driven by ecosystem integrations, increased utility, and viral social media campaigns boosting adoption.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    source: "DegenHub Market Watch",
    content: [
      "BONK, Solana's community-driven meme token, experienced a dramatic 40% price surge over the past 24 hours as trading volume spiked to levels not seen since its initial viral moment. The rally coincides with several positive ecosystem developments and renewed community enthusiasm.",
      "Major exchanges have expanded BONK trading pairs and staking opportunities, while payment processors and gaming platforms have integrated the token for in-app purchases. The increased utility has attracted both retail traders and speculative capital seeking exposure to Solana's meme coin sector.",
      "Community-driven initiatives have gained traction, with BONK holders organizing governance proposals and funding development projects. Several DeFi protocols now accept BONK for fees and rewards, creating additional demand sinks beyond pure speculation.",
      "Social media analytics show engagement metrics at record highs, with mentions and discussion volume exceeding previous peaks. The meme coin's community has developed a distinct culture that resonates with younger crypto adopters, driving organic growth through user-generated content.",
      "However, volatility remains extreme—traders should expect sharp reversals and high risk. Technical analysis suggests potential resistance levels ahead, while on-chain metrics indicate some profit-taking by early holders. The token's long-term sustainability will depend on continued ecosystem integration and community maintenance.",
      "Regulatory observers note that meme coins continue operating in a gray area, with unclear guidance on token classification and trading rules. Participants should exercise caution and only allocate capital they can afford to lose, as the asset class remains highly speculative.",
    ],
  },
  {
    slug: "solana-staking-rewards-adjustment",
    title: "Solana Validator Rewards Shift as Network Maturity Affects Inflation Schedule",
    summary:
      "Annualized staking yields decrease slightly as protocol adjusts inflation schedule, prompting some delegators to re-evaluate validator selections and diversification strategies.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    source: "DegenHub Staking Report",
    content: [
      "Solana's staking rewards have decreased from approximately 8.5% to around 7.2% annualized returns, reflecting the network's transition to a lower inflation phase. The adjustment follows the protocol's predefined inflation schedule, which gradually reduces issuance over time.",
      "Current validators report stable operations with high uptime metrics, though some smaller operators express concerns about profitability as rewards compress. The change has led some delegators to seek validators offering commission rebates or loyalty programs to offset declining base yields.",
      "Market analysts note that Solana's staking yield remains competitive compared to other proof-of-stake networks, though Ethereum's staking rewards have also compressed in recent months. The relative attractiveness depends on individual risk tolerance and expectations for SOL price appreciation.",
      "Liquid staking protocols have gained attention as an alternative, offering tokenized staking derivatives that maintain liquidity while earning rewards. However, these solutions introduce additional smart contract risk and may trade at slight discounts to underlying SOL value.",
      "Long-term holders generally welcome the reduced inflation, as lower issuance can be supportive for token value if demand growth outpaces new supply. The declining rewards also incentivize more efficient validator operations and may contribute to network decentralization as operations consolidate.",
      "For stakers considering their options, experts recommend reviewing validator performance metrics, commission rates, and the operator's track record before delegating. While chasing highest yields can be tempting, reliability and security should be prioritized over marginal return differences.",
    ],
  },
  {
    slug: "raydium-v4-liquidity-innovation",
    title: "Raydium V4 Introduces Concentrated Liquidity Pools for Solana DeFi",
    summary:
      "Major DEX upgrade brings Uniswap V3-style concentrated liquidity to Solana, enabling more capital-efficient trading pairs and potentially higher yields for liquidity providers.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    source: "DegenHub DeFi Watch",
    content: [
      "Raydium, one of Solana's largest decentralized exchanges, launched V4 this week with concentrated liquidity pools that allow liquidity providers to focus capital within specific price ranges. The upgrade promises significant improvements in capital efficiency and trading depth.",
      "Early data shows that concentrated pools can generate 2-3x higher fee income for LPs compared to traditional uniform liquidity distributions, though this comes with added complexity and risk. LPs must actively manage their positions as prices move outside their ranges, requiring more sophisticated strategies.",
      "The upgrade addresses a long-standing limitation on Solana, where liquidity was often spread inefficiently across wide price ranges. Concentrated liquidity should reduce slippage for traders while enabling better price discovery, especially for volatile assets like meme coins.",
      "Developers have integrated automated position management tools to help LPs optimize their ranges, though manual management remains possible for advanced users. Some third-party protocols already offer yield-optimization services that automatically rebalance LP positions based on market conditions.",
      "Initial adoption has been strong, with over $50M migrated to V4 pools within the first 48 hours. However, some users report a steeper learning curve compared to the simpler V2 interface, suggesting that educational resources and better UX could accelerate broader adoption.",
      "Competing DEXs are monitoring V4's performance closely, with several announcing plans for similar upgrades. The innovation could reshape liquidity dynamics across Solana's DeFi ecosystem, potentially concentrating trading activity on platforms that offer the best capital efficiency.",
    ],
  },
  {
    slug: "crypto-regulatory-clarity-2025",
    title: "New Regulatory Guidelines Provide Clarity for Solana DeFi Protocols",
    summary:
      "Regulatory bodies issue updated guidance on DeFi compliance, with implications for token issuers, DEX operators, and users across decentralized ecosystems.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
    source: "DegenHub Regulatory Update",
    content: [
      "Financial regulatory authorities released updated guidelines this week addressing decentralized finance protocols, providing long-awaited clarity on compliance requirements for DEX operators, token issuers, and liquidity providers.",
      "The guidance distinguishes between fully decentralized protocols with no controlling entity and those with centralized components, applying different regulatory frameworks accordingly. Fully decentralized systems face fewer compliance obligations, while protocols with governance tokens or development teams may need to register or comply with securities laws.",
      "Token issuers launching on platforms like pump.fun receive clearer guidance on disclosure requirements and marketing restrictions. The rules emphasize that developers cannot make unsubstantiated claims about token utility or expected returns, with penalties for misleading promotional activities.",
      "DEX aggregators and trading platforms must implement enhanced KYC/AML procedures for certain transaction sizes, though thresholds remain high enough that most retail activity is unaffected. The requirements focus on institutional flows and large transactions that could involve money laundering risks.",
      "Legal experts note that the guidelines represent progress but leave room for interpretation. Many edge cases around governance token distribution, automated market makers, and cross-border operations remain ambiguous. Regulatory clarity is likely to evolve through enforcement actions and court precedents over coming months.",
      "For builders and users, the guidance provides some certainty for planning, though compliance costs may rise for projects with centralized components. Some protocols are exploring governance changes to increase decentralization and reduce regulatory exposure, while others are preparing to meet new requirements head-on.",
    ],
  },
  {
    slug: "solana-mobile-saga-resurgence",
    title: "Solana Mobile Saga Sees Resurgence as Web3 Phone Adoption Grows",
    summary:
      "After initial slow sales, Solana's crypto-focused mobile device gains momentum as new apps and integrations make it more attractive to Web3 users.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    source: "DegenHub Tech Watch",
    content: [
      "The Solana Mobile Saga, initially launched to muted reception, has experienced a significant uptick in demand following improved app ecosystem development and renewed marketing efforts. The device's unique features, including a built-in hardware wallet and native Web3 integration, are resonating with crypto power users.",
      "Early adopters praise the seamless experience for signing transactions, managing NFTs, and interacting with Solana dApps directly from mobile. The device's seed storage in a secure enclave eliminates the need for external hardware wallets while maintaining strong security guarantees.",
      "Developer interest has increased as Solana Labs provides better tooling and incentives for mobile-optimized dApps. Several popular protocols have released mobile-first interfaces that leverage the Saga's unique capabilities, including NFC payments and integrated crypto trading.",
      "However, the device faces challenges in broader market adoption. The premium price point and niche use case limit appeal beyond crypto enthusiasts, and battery life concerns during intensive blockchain interactions remain an issue for some users.",
      "The Saga 2 development rumors have circulated, with potential improvements focusing on price reduction, extended battery life, and expanded compatibility with other blockchain networks. Whether a second generation materializes depends on sales momentum and ecosystem developer commitment.",
      "For current users, the device offers the most seamless mobile Web3 experience available, though it requires some technical comfort with crypto concepts. As the ecosystem matures and more applications launch mobile versions, the value proposition should strengthen further.",
    ],
  },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function getArticleBySlug(slug: string): NewsArticle | undefined {
  const normalized = decodeURIComponent(slug).toLowerCase();
  return (
    NEWS_ARTICLES.find((a) => a.slug.toLowerCase() === normalized) ||
    NEWS_ARTICLES.find((a) => slugify(a.title) === normalized)
  );
}


