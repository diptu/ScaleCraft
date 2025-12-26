---
title: URL Shortener
sidebar_position: 1
---

## Table of Contents

1. [Introduction](#introduction)
2. [What Are We Building?](#what-are-we-building)
3. [MVP Scope & Assumptions](#mvp-scope--assumptions)
4. [Input Parameters](#input-parameters)
5. [Capacity Planning Approach](#capacity-planning-approach)
6. [System Capacity Calculations](#system-capacity-calculations)
7. [Conclusion](#conclusion)

<!-- 7. [Peak Traffic & Safety Margins](#peak-traffic--safety-margins)
8. [Storage Growth & Retention Analysis](#storage-growth--retention-analysis)
9. [Network Payload Considerations](#network-payload-considerations)
10. [Supabase Free Tier Validation](#supabase-free-tier-validation)
11. [Final Health Check Summary](#final-health-check-summary)
12. [Key Takeaways](#key-takeaways) -->

## Introduction {#introduction}

- Most MVPs fail not because of bad code, but because of unchecked assumptions.

- Teams often jump straight into implementation—choosing frameworks, writing APIs, and deploying services—without answering a fundamental question:

- Can this system survive real usage within our constraints?

### This documentation takes a different approach.

- Instead of guessing, we use simple, repeatable math to validate system feasibility before writing production code. Every number in this guide is derived from clear assumptions and verified against Supabase Free Tier limits, ensuring that the MVP remains:

    - Cost-free

    - Predictable

    - Scalable by design

## 📘 Version 1 — System Requirements & Capacity Planning

Before writing a single line of backend code, we must prove—mathematically—that our system can survive real usage.

This document explains how to translate business requirements into hard system limits using simple formulas.
We will design our MVP assuming Supabase Free Tier constraints.

---
## 🎯 What Are We Building? {#what-are-we-building}

- We are designing an MVP backend system (e.g., URL shortener / CRUD-heavy API) with:

- Read-heavy traffic

- Short data retention

- Strict database limits

- Small but realistic user base

- Our goal is not guessing, but capacity validation

## 🧱 MVP Scope & Assumptions {#mvp-scope--assumptions}

| Constraint                 | Reason                |
| -------------------------- | --------------------- |
| Supabase Free Tier         | Cost-free MVP         |
| PostgreSQL                 | Supabase default      |
| Single DB instance         | No horizontal scaling |
| Stateless API              | Easy scaling later    |
| Soft deletes / TTL cleanup | Retention control     |

## 📊 Input Parameters {#input-parameters}

| Parameter               | Unit         | Description                 | Value      |
| ----------------------- | ------------ | --------------------------- | ---------- |
| Writes_per_Day          | requests/day | New records created per day | **5,000**  |
| Read_Write_Ratio        | number       | Reads per write             | **10**     |
| Retention_Days          | days         | Data lifetime               | **30**     |
| Avg_Record_Size_Bytes   | bytes        | DB row size (incl. index)   | **1,200**  |
| Avg_Payload_Size_Bytes  | bytes        | API request payload         | **500**    |
| DB_Storage_GB           | GB           | Available DB storage        | **0.5 GB** |
| DB_Max_RPS              | req/sec      | Max sustainable DB RPS      | **5**      |
| Peak_Traffic_Multiplier | x            | Traffic spike factor        | **5×**     |
| Base_Users              | count        | Active users                | **10,000** |

## 📐 System Capacity Calculations {#system-capacity-calculations}

| Step | Metric                     | Formula                                  | Substitution            | Result          | Status  |
| ---: | -------------------------- | ---------------------------------------- | ----------------------- | --------------- | ------- |
|    1 | Reads per Day              | `Writes_per_Day × Read_Write_Ratio`      | `5,000 × 10`            | **50,000**      | —       |
|    2 | Total DB Requests / Day    | `Writes + Reads`                         | `5,000 + 50,000`        | **55,000**      | —       |
|    3 | Average RPS                | `Total_Requests / 86,400`                | `55,000 / 86,400`       | **0.64 RPS**    | ✅       |
|    4 | Peak RPS                   | `Average_RPS × Peak_Traffic_Multiplier`  | `0.64 × 5`              | **3.2 RPS**     | ✅ ≤ 5   |
|    5 | Daily Storage (Bytes)      | `Writes_per_Day × Avg_Record_Size_Bytes` | `5,000 × 1,200`         | **6,000,000 B** | —       |
|    6 | Daily Storage (MB)         | `Bytes / 1,048,576`                      | `6,000,000 / 1,048,576` | **5.72 MB**     | —       |
|    7 | Retained Storage (30 days) | `Daily_Storage × Retention_Days`         | `5.72 × 30`             | **171.6 MB**    | —       |
|    8 | Retained Storage (GB)      | `MB / 1024`                              | `171.6 / 1024`          | **0.17 GB**     | ✅ ≤ 0.5 |
|    9 | Daily Network Payload      | `Total_Requests × Avg_Payload_Size`      | `55,000 × 500`          | **27.5 MB/day** | —       |
|   10 | DB Capacity Check          | `Peak_RPS ≤ DB_Max_RPS`                  | `3.2 ≤ 5`               | **PASS**        | ✅       |

## 🎉 Conclusion {#conclusion}

This MVP comfortably fits inside Supabase Free Tier because:

- Controlled writes

- Read-heavy but bounded

- Aggressive retention

- No burst traffic beyond limits
