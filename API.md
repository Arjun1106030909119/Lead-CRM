# API Documentation

Base URL (local): `http://localhost:5000/api`  
Base URL (production): `https://your-render-app.onrender.com/api`

---

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST `/auth/register`

Register a new user. Default role is `MEMBER`.

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response `201`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "MEMBER"
  }
}
```

---

### POST `/auth/login`

Authenticate an existing user.

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "MEMBER"
  }
}
```

---

## Leads Endpoints

> All require authentication. `DELETE` and assign require `ADMIN` role.

### GET `/leads`

Get all leads with optional search, filter, sort, and pagination.

**Query parameters:**

| Parameter  | Type   | Description |
|------------|--------|-------------|
| `search`   | string | Search by name, email, or company |
| `status`   | string | Filter by status (`NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL_SENT`, `WON`, `LOST`) |
| `assignedTo` | string | Filter by assigned user ID |
| `sortBy`   | string | Field to sort by (e.g., `createdAt`, `name`) |
| `order`    | string | `asc` or `desc` (default: `desc`) |
| `page`     | number | Page number (default: `1`) |
| `limit`    | number | Items per page (default: `10`) |

**Response `200`:**
```json
{
  "leads": [ ... ],
  "total": 42,
  "page": 1,
  "totalPages": 5
}
```

---

### POST `/leads`

Create a new lead. The authenticated user becomes `createdBy`.

**Request body:**
```json
{
  "name": "Acme Corp Lead",
  "email": "lead@acme.com",
  "phone": "+1-555-0100",
  "company": "Acme Corp",
  "status": "NEW",
  "assignedTo": "64abc456..."
}
```

**Response `201`:**
```json
{
  "_id": "64def789...",
  "name": "Acme Corp Lead",
  "email": "lead@acme.com",
  "phone": "+1-555-0100",
  "company": "Acme Corp",
  "status": "NEW",
  "assignedTo": { "_id": "...", "name": "..." },
  "createdBy": { "_id": "...", "name": "..." },
  "activityLog": [ ... ],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### GET `/leads/:id`

Get a single lead by ID.

**Response `200`:** Full lead object with populated `assignedTo`, `createdBy`, and `activityLog`.

---

### PUT `/leads/:id`

Update a lead. Triggers an activity log entry for changed fields.

**Request body:** Any subset of lead fields.

**Response `200`:** Updated lead object.

---

### DELETE `/leads/:id`

Delete a lead. **Admin only.**

**Response `200`:**
```json
{ "message": "Lead deleted" }
```

---

### PATCH `/leads/:id/assign`

Assign a lead to a user. **Admin only.**

**Request body:**
```json
{ "assignedTo": "64abc456..." }
```

**Response `200`:** Updated lead object.

---

## Notes Endpoints

### GET `/leads/:leadId/notes`

Get all notes for a lead.

**Response `200`:**
```json
[
  {
    "_id": "64ghi012...",
    "content": "Called and left voicemail",
    "lead": "64def789...",
    "createdBy": { "_id": "...", "name": "..." },
    "createdAt": "2024-01-02T10:00:00.000Z"
  }
]
```

---

### POST `/leads/:leadId/notes`

Add a note to a lead.

**Request body:**
```json
{ "content": "Sent proposal via email" }
```

**Response `201`:** Created note object.

---

### DELETE `/notes/:id`

Delete a note by ID. **Admin only.**

**Response `200`:**
```json
{ "message": "Note deleted" }
```

---

## Dashboard Endpoint

### GET `/dashboard`

Get summary statistics for the dashboard.

**Response `200`:**
```json
{
  "totalLeads": 42,
  "leadsByStatus": {
    "NEW": 12,
    "CONTACTED": 8,
    "QUALIFIED": 7,
    "PROPOSAL_SENT": 5,
    "WON": 6,
    "LOST": 4
  },
  "recentActivity": [ ... ]
}
```

---

## Users Endpoint

### GET `/users`

Get all users (for lead assignment dropdowns).

**Response `200`:**
```json
[
  { "_id": "...", "name": "Alice", "email": "alice@example.com", "role": "ADMIN" },
  { "_id": "...", "name": "Bob", "email": "bob@example.com", "role": "MEMBER" }
]
```

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Human-readable error description"
}
```

| Status | Meaning |
|--------|---------|
| `400` | Bad Request — validation failed |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — insufficient role |
| `404` | Not Found |
| `500` | Internal Server Error |
