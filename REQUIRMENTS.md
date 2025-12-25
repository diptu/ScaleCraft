# URL Shortener

This document defines the **functional and non-functional requirements** for a
**globally distributed, Bitly-like URL shortening service** designed to support
**internet-scale traffic (1B+ daily redirects)** with sub-50ms latency.

---

## 1. Functional Requirements

### 1.1 URL Shortening
- Generate a **globally unique short alias** for any valid long URL.
- Aliases may be:
  - **Random** (Base62 encoded)
  - **Deterministic** (hash-based, optional)
- Alias length: **6–8 characters** to balance:
  - Key space size
  - URL readability
  - Collision avoidance

---

### 1.2 URL Redirection
- Resolve short URLs to long URLs with **high-speed redirection**.
- Use **HTTP 302 (Found)**:
  - Allows destination URLs to change
  - Prevents aggressive browser caching issues
- Redirect path must be **read-only and stateless**.

---

### 1.3 Link Analytics
The system must track usage metrics **without impacting redirect latency**.

#### Required Analytics
- **Total click count per short URL**
<!-- - **Time-based aggregation**
  - Clicks per minute/hour/day
- **Click-through rate (CTR)** for links under campaigns -->

#### Optional Analytics
- Geo-location (country-level)
- Device type (mobile / desktop)
- Browser & OS (derived from User-Agent)

> Analytics must be **eventually consistent** and processed asynchronously.

---

### 1.4 Link Lifecycle Management
- Support **automatic expiration (TTL)** for short URLs.
- Expired URLs:
  - Do not redirect
  - Are eventually purged or recycled
- Ownership metadata is required for:
  - Link deletion
  - Analytics access
  - Abuse handling

---

### 1.5 API & Platform Support
- REST APIs for:
  - URL creation
  - Metadata retrieval
  - Analytics queries
- Support API keys & rate limiting for programmatic access.

---

## 2. Non-Functional Requirements

### 2.1 Latency
- **P99 redirect latency < 50 ms**
- Achieved through:
  - CDN edge caching
  - Multi-layer in-memory caches
- Analytics must **never block** the redirect path.

---

### 2.2 Availability
- **Redirect Path Availability: 99.99%**
- Redirect service follows **AP (Availability + Partition tolerance)** in CAP.
- Temporary inconsistency in analytics is acceptable.

---

### 2.3 Scalability
- Must support:
  - **100M Daily Active Users (DAU)**
  - **1B redirects/day**
- Horizontal scaling is mandatory for:
  - Redirect service
  - Analytics ingestion
  - Cache layers

---

### 2.4 Throughput
- **Average Traffic**
  - ~11,500 requests/sec (1B / day)
- **Peak Traffic (Viral Events)**
  - 10× burst capacity
  - **115,000+ RPS**
- No single component should be a bottleneck.

---

### 2.5 Durability
- Persist **5B lifetime short URLs**.
- Data must survive:
  - Node failures
  - AZ-level outages
- Analytics raw events may be **short-lived**, but aggregates must be durable.

---

### 2.6 Security & Abuse Prevention
- Short URLs must be:
  - High-entropy
  - Non-sequential
- Prevent:
  - URL enumeration
  - Automated scraping
- Enforce:
  - Rate limits
  - Bloom-filter-based early rejection
  - Abuse detection at gateway level

---

## 3. Capacity Estimation

### 3.1 URL Storage

| Metric | Value |
|-----|-----|
| Total lifetime URLs | 5 Billion |
| Avg size per record | ~500 bytes |
| **Total storage** | **~2.5 TB** |

Includes:
- Short URL
- Long URL (up to 2KB)
- TTL
- Owner metadata
- Indexing overhead

---

### 3.2 Redirect Traffic

| Metric | Value |
|-----|-----|
| Daily redirects | 1 Billion |
| Avg RPS | ~11,574 |
| Peak RPS (10×) | **115,000+** |

---

### 3.3 Analytics Event Volume
- **1 analytics event per redirect**
- ~1B events/day
- Strategy:
  - Raw events retained briefly (7–30 days)
  - Long-term storage uses **aggregated counters**

---

## 4. Architectural Implications from Requirements

### Read Path (Critical)
- CDN → L1 Cache → L2 Cache → KV Store
- Optimized for:
  - Zero locks
  - No cross-service calls
  - Minimal serialization

### Write Path (Isolated)
- URL creation & metadata handled separately
- No contention with redirect traffic

### Analytics Path (Async)
- Event-based (Kafka / Pulsar)
- Batch aggregation
- Eventual consistency

---

## 5. Success Metrics (SLOs)

| Metric | Target |
|-----|-----|
| P99 Redirect Latency | < 50 ms |
| Cache Hit Ratio (L1+L2) | > 90% |
| Redirect Error Rate | < 0.1% |
| Analytics Processing Lag | < 1 minute |
| Redirect Availability | 99.99% |

---

## 6. Summary

This system is designed to be:
- **Read-optimized**
- **Globally distributed**
- **Cache-first**
- **Event-driven for analytics**
- **Resilient under viral traffic spikes**

The requirements intentionally separate **correctness-critical redirects**
from **eventually consistent analytics** to guarantee performance at scale.

