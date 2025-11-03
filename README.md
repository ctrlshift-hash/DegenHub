# DegenHub

A crypto degen social media platform built with Next.js 14, featuring dual authentication, community channels, voice chat, and SOL tipping functionality.

**Website**: https://www.degenhub.io/  
**X (Twitter)**: https://x.com/DegenHub_io

## IMPORTANT: Production/Deployment Notes
- You **must** use a CLOUD DATABASE (PlanetScale, Supabase, Neon/Postgres, etc). Do not use local SQLite or a local Postgres instance for deployments like Vercel!
- Update your `prisma/schema.prisma` to:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```
- Set the env var `DATABASE_URL` to your chosen cloud DB connection string before running migrations.

### Example (PlanetScale):
1. Deploy a DB via PlanetScale.
2. Copy your connection string and set it in Vercel/your `.env`:
   `DATABASE_URL="postgresql://..."`
3. Run:
   ```bash
   npx prisma migrate deploy # or npx prisma db push
   npx prisma generate
   ```

## Features

### Dual Authentication System
- **Solana Wallet Login**: Connect with Phantom, Solflare, and other Solana wallets
- **Email/Username Signup**: Traditional authentication for casual users
- **Verified Badges**: Both wallet and email users receive verified status

### Social Feed
- Create posts with text and images
- Like, comment, and repost functionality
- Real-time feed updates
- Token tagging system ($SOL, $BONK style)
- Mobile-responsive design

### User Profiles
- **Wallet Users**: Display wallet address, portfolio value, verified badge
- **Email Users**: Full profile functionality with verified badge
- Bio, profile pictures, followers/following
- Post history and engagement stats

### Channels
- Create and join community channels
- Share posts within channel discussions
- Channel-specific feed and engagement

### Tipping System
- Tip SOL directly to posts and users
- Wallet users only
- Transaction signature tracking
- Tip leaderboards

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Blockchain**: Solana Web3.js, Wallet Adapter
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth for email, Solana wallet adapter
- **Real-time**: Socket.io for live updates
- **UI**: Custom components with dark mode

## Getting Started

**Live Website**: Visit [https://www.degenhub.io/](https://www.degenhub.io/) to use DegenHub.

**For Developers**: The instructions below are for setting up a local development environment.

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Solana wallet (Phantom/Solflare)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd degenhub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/degenhub"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   NEXT_PUBLIC_SOLANA_NETWORK="devnet"
   NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) (local development only)

## Project Structure

```
degenhub/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── profile/           # User profile pages
│   │   ├── channels/          # Community channels
│   │   └── settings/          # User settings
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── layout/            # Layout components
│   │   ├── posts/             # Post-related components
│   │   └── ui/                # Reusable UI components
│   ├── contexts/              # React contexts
│   ├── lib/                   # Utility functions
│   └── styles/                # Global styles
├── prisma/                    # Database schema and migrations
└── public/                    # Static assets
```

## Design System

### Colors
- **Primary**: Degen Purple (#8B5CF6)
- **Secondary**: Degen Pink (#EC4899)
- **Accent**: Degen Blue (#3B82F6)
- **Success**: Degen Green (#10B981)
- **Warning**: Degen Orange (#F59E0B)

### Dark Mode
- Default dark theme optimized for crypto users
- High contrast for readability
- Glowing effects for premium features

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio
- `npx prisma migrate dev` - Run database migrations

## Database Schema

### Core Tables
- **Users**: User accounts (wallet/email)
- **Posts**: Social media posts
- **Comments**: Post comments
- **Likes/Reposts**: Engagement data
- **Follows**: User relationships
- **Tips**: SOL tipping transactions
- **Channels**: Community channels and discussions

## Security Features

- Wallet signature verification
- Token balance validation
- Rate limiting on posts
- Input sanitization
- CSRF protection

## Roadmap

### Phase 1 (MVP)
- [x] Dual authentication system (wallet and email)
- [x] Basic social feed
- [x] Post creation and interactions (likes, comments, reposts)
- [x] User profiles with verified badges
- [x] Dark mode UI
- [x] Community channels (create, join, leave, channel posts)
- [x] Voice chat (VC) - Create your own rooms
- [x] Voice chat host controls (delete rooms, kick users, mute, co-host management)
- [x] Voice chat room management (close/open, edit settings, speaker mode)
- [x] Jeet Leaderboard
- [x] Top Traders Leaderboard
- [x] Trending hashtags
- [x] Direct messaging system
- [x] Notifications system
- [x] Follow/unfollow users
- [x] Search functionality
- [x] Real-time user count display
- [x] Username availability validation
- [x] SOL tipping functionality
- [x] Real-time updates with Socket.io

### Phase 2 (Coming Soon)
- [ ] Token-gated channel access (exclusive channels requiring token holdings)
- [ ] Top Jeet Leaderboard with real-time updates
- [ ] Top Traders Leaderboard with real-time updates
- [ ] Advanced token tagging and discovery
- [ ] Mobile app
- [ ] Voice chat improvements (enhanced moderation, recording playback)

### Phase 3 (Future)
- [ ] NFT integration (display collections, PFP verification)
- [ ] DeFi portfolio tracking and PnL analytics
- [ ] Cross-chain support (Ethereum, Base, etc.)
- [ ] Advanced analytics dashboard for users
- [ ] API for third-party integrations
- [ ] Notification system improvements (email/push notifications)
- [ ] Multi-language support
- [ ] Content moderation and reporting tools
- [ ] Creator monetization features
- [ ] Token launch tools and integrations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Solana Foundation for the amazing blockchain
- Next.js team for the excellent framework
- Prisma team for the great ORM
- All the open-source contributors

---

Built for the crypto degen community