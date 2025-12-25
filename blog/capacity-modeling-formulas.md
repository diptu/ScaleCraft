# Deterministic Capacity Modeling for System Design

To master system design, you must move beyond intuition and apply
**deterministic, math-driven capacity models**.  
This document defines a **reusable formula set** for estimating infrastructure
requirements for a **URL Shortener** or any **CRUD-heavy distributed system**.

---

## 1. Core Input Variables

| Symbol | Description | Unit |
|------|------------|------|
| `W_day` | Number of write operations per day | requests/day |
| `R:W` | Read-to-write ratio | dimensionless |
| `Y` | Data retention period | years |
| `S_rec` | Average record size (including metadata) | bytes |
| `D` | Days per year | 365 |
| `S` | Seconds per day | 86,400 |

---

## 2. Throughput Estimation (Requests Per Second)

Throughput determines:
- Number of application instances
- Database connection pools
- Load balancer capacity

---

### 2.1 Write Throughput

**Write Requests Per Second**

\[
W_{rps} = \frac{W_{day}}{S}
\]

> For production sizing, multiply by **2×–3×** to account for peak traffic bursts.

---

### 2.2 Read Throughput

Reads are derived from the read-to-write ratio:

\[
R_{rps} = W_{rps} \times \frac{R}{W}
\]

---

### 2.3 Total System Throughput

\[
T_{rps} = W_{rps} + R_{rps}
\]

---

## 3. Storage & Capacity Estimation

Storage modeling determines:
- Disk requirements
- Sharding strategy
- Backup & replication costs

---

### 3.1 Total Records Stored

\[
O_{total} = W_{day} \times D \times Y
\]

---

### 3.2 Total Persistent Storage

\[
S_{total} = O_{total} \times S_{rec}
\]

> **Best Practice:**  
> Add **20–30% overhead** for:
> - Indexes
> - WAL / transaction logs
> - Metadata

---

## 4. Network Bandwidth Estimation

Bandwidth impacts:
- Load balancer selection
- Cloud egress costs
- CDN necessity

---

### 4.1 Incoming Traffic (Ingress)

\[
Ingress = W_{rps} \times S_{rec}
\]

---

### 4.2 Outgoing Traffic (Egress)

\[
Egress = R_{rps} \times S_{rec}
\]

---

## 5. Cache Memory Estimation

Using the **Pareto Principle (80/20 rule)**:
- ~20% of data accounts for ~80% of reads
- We cache **20% of daily read traffic**

---

### 5.1 Daily Read Volume

\[
R_{day} = W_{day} \times \frac{R}{W}
\]

---

### 5.2 Cache Memory Requirement

\[
M_{cache} = R_{day} \times 0.20 \times S_{rec}
\]

> This determines **RAM size** for Redis / Memcached / in-process caches.

---

## 6. Quick Reference Summary

| Metric | Formula | Purpose |
|-----|-----|-----|
| Write RPS | \( W_{day} / 86,400 \) | DB write capacity |
| Read RPS | \( W_{rps} \times (R/W) \) | Cache & replica sizing |
| Total RPS | \( W_{rps} + R_{rps} \) | Load balancer sizing |
| Total Records | \( W_{day} \times 365 \times Y \) | Sharding decision |
| Total Storage | \( Records \times S_{rec} \) | Disk planning |
| Cache Size | \( R_{day} \times 0.2 \times S_{rec} \) | RAM sizing |

---

## 7. Worked Example

### Given:
- \( W_{day} = 1,000,000 \) writes/day
- \( R:W = 100:1 \)
- \( Y = 5 \) years
- \( S_{rec} = 500 \) bytes

---

### 7.1 Total Records

\[
O_{total} = 1M \times 365 \times 5 = 1.825B \text{ records}
\]

---

### 7.2 Total Storage

\[
S_{total} = 1.825B \times 500 \approx 912 \text{ GB}
\]

---

### 7.3 Read Throughput

\[
W_{rps} = \frac{1,000,000}{86,400} \approx 11.57
\]

\[
R_{rps} = 11.57 \times 100 \approx 1,157 \text{ requests/sec}
\]

---

### 7.4 Cache Memory Requirement

\[
R_{day} = 1M \times 100 = 100M
\]

\[
M_{cache} = 100M \times 0.2 \times 500 \approx 10 \text{ GB RAM}
\]

---

## 8. Key Takeaway

> **System design is math, not guesswork.**  
If you can:
- Define inputs
- Apply deterministic formulas
- Explain trade-offs

You can design **any scalable system**—not just a URL shortener.

---




