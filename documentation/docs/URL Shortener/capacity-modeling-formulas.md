---
title: Capacity Modeling
sidebar_position: 2
---

# Capacity Modeling

This document provides a **deterministic, formula-driven capacity model**
for a **URL Shortener MVP**, designed with **Supabase Free Tier constraints**
in mind.  
The same approach applies to any **CRUD-heavy, read-dominant system**.

---

## 1. Core Assumptions (Inputs)

| Parameter | Description | Value |
|--------|------------|------|
| Writes per day | New URLs created per day | 5,000 |
| Read : Write ratio | Reads generated per write | 10 : 1 |
| Retention | Data retention period | 30 days |
| Avg record size | DB row size incl. metadata | 1,200 bytes |
| Avg payload size | API/network payload | 500 bytes |
| DB storage limit | Supabase free tier | 0.5 GB |
| DB max RPS | Sustainable DB requests/sec | 5 |
| Peak multiplier | Traffic spike factor | 5× |
| Base users | Registered users | 10,000 |

---

## 2. Capacity Modeling Formula Reference

| Category     | Metric                 | Formula                                                      | Calculated Value        | Notes                   |
| ------------ | ---------------------- | ------------------------------------------------------------ | ----------------------- | ----------------------- |
| Throughput   | Write Throughput (RPS) | `Writes_per_Day / 86,400`                                    | **0.058 RPS**           | Baseline write load     |
| Throughput   | Read Throughput (RPS)  | `Write_RPS × Read_Write_Ratio`                               | **0.58 RPS**            | Read-heavy traffic      |
| Throughput   | Peak Throughput (RPS)  | `(Write_RPS + Read_RPS) × Peak_Traffic_Multiplier`           | **3.18 RPS**            | Used for DB sizing      |
| Storage      | Total Records Stored   | `Writes_per_Day × Retention_Days`                            | **150,000 records**     | 30-day retention        |
| Storage      | Total Storage Required | `Total_Records × Avg_Record_Size_Bytes`                      | **180 MB (~0.17 GB)**   | Excludes index overhead |
| Network      | Ingress Traffic / Day  | `Writes_per_Day × Avg_Payload_Size_Bytes`                    | **2.5 MB/day**          | Write API traffic       |
| Network      | Egress Traffic / Day   | `Writes_per_Day × Read_Write_Ratio × Avg_Payload_Size_Bytes` | **25 MB/day**           | Redirect responses      |
| Cache        | Daily Read Volume      | `Writes_per_Day × Read_Write_Ratio`                          | **50,000 reads/day**    | Cache candidate set     |
| Cache        | Cache Memory Size      | `0.2 × Daily_Reads × Avg_Record_Size_Bytes`                  | **12 MB RAM**           | 80/20 hot data          |
| Health Check | DB Throughput Limit    | `Peak_RPS ≤ DB_Max_RPS`                                      | **✅ Pass (3.18 ≤ 5)**   | Safe on free tier       |
| Health Check | DB Storage Limit       | `Total_Storage_GB ≤ DB_Storage_GB`                           | **✅ Pass (0.17 ≤ 0.5)** | Headroom available      |
