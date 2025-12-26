---
sidebar_position: 1
---

<img src="/img/scale-craft.png" alt="ScaleCraft Logo" width="400"  height="400" />

# 📌 System Requirements

This document specifies the **functional** and **non-functional** requirements for a **large-scale URL Shortener system** designed to operate under **extreme traffic volumes**, **strict latency constraints**, and **global usage patterns**.

The requirements explicitly separate:
- **Correctness-critical paths** (redirects)
- **Eventually consistent paths** (analytics, metadata)

This separation is fundamental to achieving performance at scale.

---

## 1. Functional Requirements

### 1.1 URL Shortening

The system must generate a **globally unique short alias** for any valid long URL.

**Alias properties**
- Length: **6–8 characters**
- Character set: **Base62** (`[0-9a-zA-Z]`)
- High entropy
- Non-sequential

**Generation strategies**
- **Random** (preferred for security and distribution)
- **Deterministic** (hash-based, optional for idempotency use cases)

The chosen strategy must:
- Minimize collision probability
- Support horizontal scalability
- Avoid centralized locking

---

### 1.2 URL Redirection

The system must resolve short URLs to their corresponding long URLs with **extremely low latency**.

**Redirect path characteristics**
- **Read-only**
- **Stateless**
- **Lock-free**
- Free of cross-service dependencies

**Redirect behavior**
- Successful resolution → HTTP redirect
- Invalid or unknown short code → client error
- Expired link → terminal response (no redirect)

The redirect path is the **most performance-critical path** in the system.

---

### 1.3 Link Analytics

Analytics collection must **never impact redirect latency**.

#### Required Analytics
- **Total click count per short URL**

#### Optional Analytics
- Country-level geo location
- Device category (mobile / desktop)
- Browser and OS (derived from User-Agent)

**Consistency model**
- Analytics are **eventually consistent**
- Data is collected and processed **asynchronously**

> Redirect correctness always takes precedence over analytics accuracy.

---

### 1.4 Link Lifecycle Management

The system must support **automatic link expiration** using a Time-To-Live (TTL) mechanism.

**Expiration behavior**
- Expired links must not redirect
- Expired records are eventually:
  - Deleted
  - Archived
  - Recycled

**Optional ownership metadata**
- Enables:
  - Link deletion
  - Analytics access control
  - Abuse mitigation

---

### 1.5 API & Platform Support

The system must expose APIs for:
- URL creation
- URL resolution metadata
- Analytics queries

**API requirements**
- REST-based
- Versioned
- Rate-limited
- Backward compatible

---

## 2. Non-Functional Requirements

### 2.1 Latency

**Redirect latency SLO**
- **P99 < 50 ms**

Achieved through:
- CDN edge caching
- Multi-layer in-memory caches
- Optimized serialization and network hops

Analytics processing must **never block or slow down** redirects.

---

### 2.2 Availability

**Availability target**
- Redirect path: **99.99%**

**CAP tradeoff**
- Redirect service prioritizes **Availability + Partition Tolerance (AP)**
- Temporary analytics inconsistency is acceptable

The system must degrade gracefully under partial failures.

---

### 2.3 Scalability

The system must support:
- **100M Daily Active Users (DAU)**
- **1B redirects per day**

**Horizontal scalability is mandatory** for:
- Redirect services
- Cache layers
- Analytics ingestion pipelines

No component should require vertical scaling to handle normal growth.

---

### 2.4 Throughput

**Average traffic**
- ~11,500 requests per second

**Peak traffic (viral events)**
- 10× burst capacity
- **115,000+ RPS**

The system must tolerate sudden traffic spikes without cascading failures.

---

### 2.5 Durability

The system must persist:
- **5B lifetime short URLs**

Durability guarantees:
- Data survives individual node failures
- Data survives Availability Zone outages

**Analytics data**
- Raw events may be short-lived
- Aggregated metrics must be durable

---

### 2.6 Security & Abuse Prevention (Optional but Recommended)

Short URLs must be:
- High entropy
- Non-predictable
- Non-enumerable

The system should defend against:
- Automated scraping
- URL enumeration
- Abuse and spam campaigns

Mitigation mechanisms include:
- Rate limiting
- Bloom-filter–based early rejection
- Gateway-level abuse detection

---

## 3. Design Principles Derived from Requirements

From the above requirements, the system must be:

- **Read-optimized**
- **Cache-first**
- **Stateless at the edge**
- **Event-driven for analytics**
- **Resilient under viral traffic spikes**

Correctness-critical paths are intentionally isolated from
eventually consistent subsystems to guarantee predictable performance at scale.
