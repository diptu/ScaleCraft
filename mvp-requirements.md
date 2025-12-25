# URL Shortener – MVP

This document defines the **Minimum Viable Product (MVP)** requirements for a
URL Shortener service built using **NestJS** and **Supabase (PostgreSQL – Free Tier)**.
The system is intentionally scoped to run **at $0 cost** while remaining
cleanly designed and extensible.

---

## 1. MVP Goals

The MVP must:
- Shorten URLs and redirect users reliably
- Track **basic click analytics**
- Use **Supabase Free Tier** as the only backend dependency
- Be simple to deploy and operate

Non-goals:
- Global multi-region support
- Real-time analytics dashboards
- High availability or fault tolerance
- Internet-scale traffic handling

---

## 2. Target Scale (Supabase Free Tier Safe)

| Metric | Target |
|-----|-----|
| Daily Active Users | ≤ 1,000 |
| Total URLs stored | ≤ 50,000 |
| Redirects / day | ≤ 100,000 |
| Peak RPS | ≤ 20 |
| Data retention | 1 year |

> These limits stay well within Supabase Free Tier quotas
(storage, connections, and compute).

---

## 3. Functional Requirements (MVP Scope)

### 3.1 URL Shortening
- Accept a valid long URL
- Generate a **6–7 character Base62 short code**
- Persist mapping in Supabase Postgres

---

### 3.2 URL Redirection
- Resolve short URLs and redirect using **HTTP 302**
- Handle error cases:
  - Unknown short code → `404`
  - Expired link → `410 Gone`

---

### 3.3 Basic Analytics (Minimal)
- Track:
  - **Total click count per short URL**
- Increment count on every redirect

> Analytics are stored directly in the main table to avoid extra infrastructure.

---

### 3.4 Link Expiration
- Optional expiration timestamp
- Default expiration: **1 year**
- Expired links must not redirect

---

### 3.5 API Endpoints
| Method | Path | Description |
|-----|-----|-----|
| `POST` | `/urls` | Create short URL |
| `GET` | `/:shortCode` | Redirect |
| `GET` | `/urls/:id` | Fetch metadata + analytics |

---

## 4. Non-Functional Requirements (Free-Tier Friendly)

### 4.1 Performance
- Redirect latency: **< 300 ms**
- Acceptable for Supabase Free Tier

---

### 4.2 Availability
- Best-effort uptime
- No HA guarantees

---

### 4.3 Scalability
- Single NestJS instance
- Single Supabase project
- Vertical scaling only

---

### 4.4 Security (Minimal but Correct)
- Validate URL format
- Rate-limit:
  - URL creation
  - Redirect requests
- Prevent trivial abuse (e.g., infinite loops)

---

## 5. Supabase-Specific Design Decisions

### 5.1 Database Access
- Use **Supabase Postgres** as:
  - Primary data store
  - Analytics store
- Access options:
  - Supabase JS client (via service role key)
  - Prisma with Supabase connection string

---

### 5.2 Row Level Security (RLS)
- **Disabled for MVP** (service-role access only)
- Re-enable in post-MVP for user-based ownership

---

### 5.3 Supabase Auth
- **Not used in MVP**
- Public anonymous access only

---

### 5.4 Supabase Edge Functions
- **Not required**
- All logic handled in NestJS

---

## 6. Data Model (Supabase Postgres)

### `urls` table

| Column | Type | Notes |
|-----|-----|-----|
| `id` | `uuid` | Primary key |
| `short_code` | `varchar(8)` | Unique, indexed |
| `long_url` | `text` | Original URL |
| `click_count` | `bigint` | Default `0` |
| `expires_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` | Default `now()` |

**Indexes**
- `UNIQUE (short_code)`
- `INDEX (expires_at)`

---

## 7. Analytics Strategy (Supabase-Friendly)

- Analytics implemented as:
  ```sql
  UPDATE urls
  SET click_count = click_count + 1
  WHERE short_code = $1;


## 8. System Architecture (MVP)

Client
↓
NestJS API (Single Instance)
↓
PostgreSQL (Single Database)


No:
- Redis
- Kafka
- CDN
- Background workers

---

## 9. Technology Stack

| Layer | Tech |
|----|----|
| Backend | NestJS |
| Database | PostgreSQL |
| ORM | Prisma or TypeORM |
| Hosting | Railway / Render / Fly.io |
| DB Hosting | Supabase / Neon / Railway |
| Auth | None (public MVP) |
| Monitoring | Basic logs only |

---

## 10. Deployment Constraints (Free-Tier)

- Single CPU
- ≤ 512MB RAM
- Cold starts acceptable
- Daily compute limits respected

---

## 11. MVP Success Criteria

The MVP is successful if:
- URLs can be shortened and redirected reliably
- Click counts increment correctly
- System runs for **30+ days with $0 cost**
- Codebase is ready for future scaling upgrades

---

## 12. Clear Upgrade Path (Post-MVP)

| MVP Component | Upgrade Path |
|-----|-----|
| Inline click count | Async analytics pipeline |
| Single DB | Read replicas / KV store |
| Single instance | Horizontal scaling |
| No cache | Redis / CDN |
| Simple IDs | KGS or Snowflake IDs |

---

## 13. Summary

This MVP is:
- **Minimal**
- **Cost-aware**
- **Free-tier friendly**
- **Production-structured, not production-scaled**

It proves the core idea **without burning money** and sets up
a clean migration path toward a full internet-scale system.


## 14. 🚀 Local Load Test Plan: URL Shortener

Scenario A— Viral Link (Stress the Replicas)
1. Environment Setup (Local Cluster)

| Component         | Role                  | Local Port |
| ----------------- | --------------------- | ---------- |
| PostgreSQL Node A | Primary (Master)      | 5432       |
| PostgreSQL Node B | Replica 1 (Read-Only) | 5433       |
| PostgreSQL Node C | Replica 2 (Read-Only) | 5434       |
| App Instance      | URL Shortener API     | 8080       |

2. Test Objectives

| Category            | Objective                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| Primary Objective   | Validate the system can handle **10,000 RPS** across replicas (**5,000 RPS each**)                  |
| Secondary Objective | Measure **replication lag** — time for a newly created URL on Master to become readable on Replicas |
| Resiliency          | Verify traffic redistribution if **one Replica fails**                                              |


3. Load Scenarios 
- Scenario A — Write Burst (Stress the Master)

| Attribute    | Details                             |
| ------------ | ----------------------------------- |
| Goal         | Measure performance of URL creation |
| Target       | PostgreSQL Master (5432)            |
| Endpoint     | `POST /shorten`                     |
| Tool         | Apache Benchmark (`ab`) or `k6`     |
| Load Pattern | Burst write traffic                 |

- Scenario B — Viral Link (Stress the Replicas)
| Attribute    | Details                                                      |
| ------------ | ------------------------------------------------------------ |
| Goal         | Simulate massive read traffic                                |
| Target       | Replicas only                                                |
| Endpoint     | `GET /{short_id}`                                            |
| Total Load   | 10,000 RPS                                                   |
| Distribution | 5,000 RPS → Replica 1 (5433)<br>5,000 RPS → Replica 2 (5434) |
| Tool         | `k6`, `wrk`, or `ab`                                         |


4. Monitoring & Mastery Metrics

- Replication Health (Run on Master)

| Metric                  | Purpose                        |
| ----------------------- | ------------------------------ |
| `sent_lsn`              | WAL sent to replica            |
| `replay_lsn`            | WAL replayed by replica        |
| `replication_lag_bytes` | Lag between Master and Replica |


- Read Distribution Verification

| Check                | Expected Behavior                            |
| -------------------- | -------------------------------------------- |
| SELECT query routing | Queries hit ports **5433** and **5434** only |
| Master usage         | No SELECT traffic on **5432**                |
| Tools                | App logs, Pgpool, or DB proxy metrics        |


5. Success Criteria

| Metric          | Target                                           |
| --------------- | ------------------------------------------------ |
| Error Rate      | **0% HTTP 500 errors**                           |
| Throughput      | Sustained **10,000 RPS**                         |
| Latency         | **p95 < 50ms** for redirection                   |
| Replication Lag | **< 100ms** under load                           |
| Resiliency      | System remains operational with one Replica down |


## ✅ Summary

This load test validates:

- Read scalability via replicas

- Write isolation on Master

- Replication correctness under stress

- System behavior during partial failures

- It mirrors real-world viral traffic patterns and confirms whether the architecture is production-ready.

## Include Grafana dashboard metrics