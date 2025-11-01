# 🚀 Performance Optimization Guide

## Current Optimizations ✅

### 1. **Database Indexes** (Already Implemented)
- ✅ Posts: `userId`, `createdAt`, `(createdAt, likesCount)`
- ✅ Likes/Reposts/Downvotes: `postId`, `userId`
- ✅ Users: `username`, `walletAddress`
- ✅ Follows: `followerId`, `followingId`
- ✅ Notifications: `userId`, `read`
- ✅ Conversations: `participantAId`, `participantBId`

### 2. **Query Optimizations** (Already Implemented)
- ✅ Suggestions: Limited to 30 candidates + batch queries
- ✅ Top Traders: Limited to 200 users
- ✅ Hashtag filtering: Capped at 200 posts
- ✅ Conversations: Limited to 100
- ✅ All paginated endpoints use proper `take` limits

### 3. **Next.js Config** (Already Implemented)
- ✅ Gzip compression enabled
- ✅ Image optimization (AVIF/WebP)
- ✅ Tree-shaking for `lucide-react` and `@solana/web3.js`
- ✅ Standalone output mode for production
- ✅ Image caching (60s TTL)
- ✅ Optimized device sizes

### 4. **Client-Side Caching** (Already Implemented)
- ✅ localStorage caching for messages
- ✅ localStorage caching for home feed
- ✅ localStorage caching for Coal stories
- ✅ localStorage caching for "Who to Follow"

## Additional Upgrades (Optional)

### Tier 1: Quick Wins (Easy, High Impact)

#### A. **Database Connection Pooling**
If using Railway/Supabase, they likely already pool connections. You can verify by checking your database dashboard.

**Estimated Impact:** 20-30% faster queries

---

#### B. **Vercel KV / Redis Caching** (Recommended for 500+ users)
Add server-side caching for expensive queries:

**Install:**
```bash
npm install @vercel/kv
# OR for self-hosted Redis
npm install redis ioredis
```

**Example implementation:**
```typescript
// lib/cache.ts
import { kv } from '@vercel/kv';

export async function getCachedTrending() {
  const cached = await kv.get('trending:hashtags');
  if (cached) return cached;
  
  const data = await fetchTrending();
  await kv.set('trending:hashtags', data, { ex: 300 }); // 5 min cache
  return data;
}
```

**Best for caching:**
- Trending hashtags (5 min cache)
- Top Coal posts (2 min cache)
- User suggestions (30 min cache)
- Top traders (5 min cache)

**Estimated Impact:** 80-90% faster for cached queries

---

#### C. **Database Query Optimization**
Update your `DATABASE_URL` to use a connection pooler:

**Railway/Supabase:**
```env
# Use connection pooling (different from regular URL)
DATABASE_URL="postgresql://user:pass@proxy.host:5432/db?pgbouncer=true"
```

**Neon:**
```env
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require"
# Neon auto-pools
```

**Estimated Impact:** 15-25% reduction in connection overhead

---

### Tier 2: Advanced Optimizations (Medium Complexity)

#### D. **Prisma Accelerate** (Offers Free Tier)
Add Prisma's managed cache and connection pooling:

**Install:**
```bash
npm install @prisma/extension-accelerate
```

**Setup:**
```typescript
// lib/prisma.ts
import { AccelerateExtension } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(
  AccelerateExtension({
    cacheStrategy: { mode: 'cache-first', ttl: 60 }
  })
);
```

**Cost:** Free tier available, then paid
**Estimated Impact:** 40-50% faster queries for cached data

---

#### E. **Static Generation for Trending Pages**
Pre-render trending/leaderboard pages:

```typescript
// app/trending/page.tsx
export const revalidate = 300; // Revalidate every 5 minutes

export default async function TrendingPage() {
  const data = await fetchTrending(); // Runs at build time
  // ...
}
```

**Estimated Impact:** 90% faster first load

---

#### F. **Image CDN**
Use an image CDN like Cloudinary or Imgix:

```typescript
// next.config.ts
images: {
  loader: 'cloudinary',
  path: 'https://res.cloudinary.com/yourcloudname/image/upload/'
}
```

**Estimated Impact:** 50-70% faster image loading

---

### Tier 3: Enterprise Scaling (Complex, For 1000+ Users)

#### G. **Database Read Replicas**
Split reads/writes for heavy traffic:

```typescript
// lib/prisma.ts
const readDb = new PrismaClient({ datasources: { db: { url: READ_REPLICA_URL }}});
const writeDb = new PrismaClient({ datasources: { db: { url: WRITE_PRIMARY_URL }}});
```

**Cost:** +$50-200/month
**Estimated Impact:** 2-3x throughput

---

#### H. **Edge Caching with Cloudflare**
Use Cloudflare Workers for edge caching:

```typescript
// Middleware or API route
import { CacheStorage, Cache } from '@cloudflare/workers-types';

const cache = await caches.open('trending');
const cached = await cache.match(request);
if (cached) return cached;

const response = await fetchData();
cache.put(request, response.clone());
return response;
```

**Estimated Impact:** 95% faster for edge users

---

#### I. **Upgrade Database Instance**
If using Railway/Supabase, upgrade to higher tier:
- More CPU/RAM
- Better connection pooling
- Faster I/O

**Cost:** +$20-100/month
**Estimated Impact:** 30-50% faster queries

---

## Performance Targets

### Current (After Our Optimizations)
| User Count | Expected Response Time | Status |
|------------|----------------------|--------|
| 100 users  | 150-300ms            | ✅ Excellent |
| 500 users  | 300-500ms            | ✅ Good |
| 1000 users | 500-800ms            | ✅ Acceptable |
| 5000+ users | 1-2s | ⚠️ Needs caching |

### With Tier 1 Upgrades (Redis + Better Pooling)
| User Count | Expected Response Time | Status |
|------------|----------------------|--------|
| 500 users  | 100-200ms            | ✅ Excellent |
| 1000 users | 200-300ms            | ✅ Excellent |
| 5000+ users | 300-500ms | ✅ Good |

### With All Upgrades
| User Count | Expected Response Time | Status |
|------------|----------------------|--------|
| 1000 users | 50-150ms             | ✅ Excellent |
| 5000+ users | 150-300ms | ✅ Excellent |
| 10000+ users | 200-400ms | ✅ Excellent |

---

## Quick Performance Checklist

- [x] Database indexes on foreign keys and common queries
- [x] Query limits to prevent full table scans
- [x] Next.js compression and image optimization
- [x] Client-side caching (localStorage)
- [ ] **Server-side caching (Redis/Vercel KV)** ← Next recommended
- [ ] Database connection pooling configured
- [ ] Static generation where possible
- [ ] Edge caching (Cloudflare)
- [ ] Read replicas (if needed)
- [ ] Upgraded database instance

---

## Monitoring Performance

Add performance monitoring:

```bash
npm install @vercel/analytics
```

Then in your app:
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

This gives you:
- Real User Monitoring (RUM)
- Core Web Vitals
- Page load times
- API response times

---

## Budget Estimates

| Optimization | Monthly Cost | Impact | Recommended For |
|-------------|--------------|---------|-----------------|
| Current setup | $0 extra | Good for 500 users | ✅ Default |
| Vercel KV (Hobby) | $0 | Good for 1000 users | ✅ Recommended |
| Redis (Railway) | $7 | Good for 2000 users | ✅ Recommended |
| Prisma Accelerate | $0-20 | Good for 3000 users | Optional |
| Database upgrade | $20-50 | Good for 5000 users | If needed |
| Read replicas | $50-200 | Good for 10000+ | Enterprise |
| Cloudflare Pro | $20 | Edge caching | Optional |

**My recommendation:** Start with Vercel KV (free) or Railway Redis ($7/month) for the biggest impact.

---

## Need Help?

If performance degrades as you scale:
1. Check Vercel Analytics for slow pages
2. Check Railway/Supabase dashboard for DB performance
3. Monitor API response times in logs
4. Consider adding caching layer (Tier 1)
5. Consider upgrading database (Tier 2)

The current setup should handle **500-1000 users comfortably** with the optimizations we've implemented! 🚀

