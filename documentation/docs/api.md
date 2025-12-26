---
id: api
title: API Specification
sidebar_position: 2
---
<img src="/img/api_spec.png" alt="API Spec" width="400"  height="300"  />
# 🔌 API Specification

This document defines the **public REST API** for the URL Shortener system.

The API is designed to be:
- **Simple**
- **Stateless**
- **Backward compatible**
- **Easy to extend**

---

## 1. API Design Principles

- RESTful endpoints
- JSON request/response format
- Stateless requests
- Versioned APIs
- Predictable error handling
- Rate-limited by default

---

## 2. Base URL & Versioning


Versioning is handled via:
- URL prefix (`/v1`)
- Backward-compatible changes within a version

Breaking changes require a new version.

---

## 3. Authentication (MVP)

**MVP Mode**
- No authentication
- Public anonymous access

**Post-MVP**
- API keys
- User-based ownership
- Rate limits per API key

---

## 4. URL Shortening API

### 4.1 Create Short URL

**Endpoint**

POST V1/urls


**Request Body**
```json
{
  "long_url": "https://example.com/some/very/long/path",
  "expires_at": "2026-01-01T00:00:00Z"
}
```
**Success Response**

```json
{
  "id": "b2a1c9c6-9a5d-4e6b-9fdd-1d8f6e7a9f20",
  "short_code": "aZ3xP9",
  "short_url": "https://sho.rt/aZ3xP9",
  "long_url": "https://example.com/some/very/long/path",
  "expires_at": "2026-01-01T00:00:00Z",
  "created_at": "2025-01-01T12:00:00Z"
}

```
**Error Response**
```json
"status":400,
"msg":"Invalid URL format"

```
### Common Status Codes:

- 400 Bad Request: Invalid URL format or schema.

- 401 Unauthorized: Missing or invalid API Key (Post-MVP).

- 404 Not Found: Short code does not exist.

- 410 Gone: Short link has expired.

- 500 Internal Server Error: Unexpected upstream failure.

### 4.2. URL Redirection API
```pgsql
GET /{short_code}
```

**Success Response**
```pgsql
HTTP/1.1 302 Found
Location: https://example.com/some/very/long/path
```

```pgsql
GET /v1/urls/{id}
```
**Success Response**
```json
{
  "id": "b2a1c9c6-9a5d-4e6b-9fdd-1d8f6e7a9f20",
  "short_code": "aZ3xP9",
  "long_url": "https://example.com/some/very/long/path",
  "click_count": 12842,
  "expires_at": "2026-01-01T00:00:00Z",
  "created_at": "2025-01-01T12:00:00Z"
}

```

## 5. Rate Limiting

| Endpoint            | Limit       |
| ------------------- | ----------- |
| `POST /urls`        | 10 req/min  |
| `GET /{short_code}` | 100 req/sec |
| Metadata endpoints  | 60 req/min  |

### 5.1 Error Response Format
```json
{
  "error": {
    "code": "URL_EXPIRED",
    "message": "The requested short URL has expired."
  }
}
```