# 📘 ACXIOMCRM REST API Documentation

This document describes all RESTful API endpoints exposed by the **ACXIOMCRM** backend server.

---

## 🔐 Authentication & Headers

All protected endpoints require a standard Bearer Token in the `Authorization` header:

```http
Authorization: Bearer <jwt_token_here>
Content-Type: application/json
```

### Standard Response Envelope

#### Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

#### Paginated Success Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

#### Error Response (`400`, `401`, `403`, `404`, `409`, `500`)
```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": [ "Detailed validation errors if applicable" ]
}
```

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 User Login
- **Endpoint**: `POST /api/auth/login`
- **Rate Limit**: 20 requests per 15 mins per IP
- **Request Body**:
```json
{
  "email": "admin@acxiomcrm.com",
  "password": "Admin@123456"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@acxiomcrm.com",
      "firstName": "Alexander",
      "lastName": "Admin",
      "phone": "+1 555-0101",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.2 User Registration
- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
```json
{
  "email": "newuser@acxiomcrm.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1 555-0199",
  "roleId": 3
}
```
- **Response `201 Created`**

### 1.3 User Logout
- **Endpoint**: `POST /api/auth/logout`
- **Auth Required**: Yes
- **Response `200 OK`**

### 1.4 Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Auth Required**: Yes
- **Response `200 OK`**

---

## 2. Dashboard Analytics (`/api/dashboard`)

### 2.1 Get Executive Dashboard Metrics
- **Endpoint**: `GET /api/dashboard`
- **Auth Required**: Yes
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalCustomers": 12,
      "totalLeads": 12,
      "openLeadsCount": 8,
      "totalOpportunities": 7,
      "openOpportunitiesCount": 4,
      "wonOpportunitiesCount": 2,
      "lostOpportunitiesCount": 1,
      "pendingFollowUpsCount": 6,
      "totalPipelineValue": 455000,
      "weightedPipelineValue": 287250,
      "totalWonRevenue": 370000
    },
    "charts": {
      "leadStatus": {
        "labels": ["NEW", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "CONVERTED", "LOST"],
        "data": [3, 3, 3, 1, 1, 1]
      },
      "opportunityPipeline": {
        "labels": ["QUALIFICATION", "PROPOSAL", "NEGOTIATION", "WON", "LOST"],
        "counts": [1, 1, 2, 2, 1],
        "amounts": [95000, 180000, 180000, 370000, 60000]
      },
      "monthlySales": {
        "labels": ["May 26", "Jun 26", "Jul 26", "Aug 26", "Sep 26", "Oct 26"],
        "data": [0, 0, 0, 0, 120000, 250000]
      }
    },
    "recentActivities": [ ... ],
    "upcomingFollowUps": [ ... ]
  }
}
```

---

## 3. Customer Management (`/api/customers`)

### 3.1 List Customers
- **Endpoint**: `GET /api/customers`
- **Query Params**:
  - `page` (integer, default: 1)
  - `limit` (integer, default: 10)
  - `search` (string, searches name, company, email, phone, customerCode)
  - `status` (string, `ACTIVE` | `INACTIVE`)
- **Response `200 OK`**: Paginated customer array.

### 3.2 Get Customer By ID
- **Endpoint**: `GET /api/customers/:id`
- **Response `200 OK`**: Customer details with nested opportunities, follow-ups, activities, and converted leads.

### 3.3 Create Customer
- **Endpoint**: `POST /api/customers`
- **Request Body**:
```json
{
  "name": "Robert Vance",
  "email": "robert@vancerefrigeration.com",
  "phone": "+1 212-555-0190",
  "companyName": "Vance Refrigeration",
  "address": "123 Cold Storage Ave",
  "city": "New York",
  "state": "NY",
  "status": "ACTIVE",
  "assignedToId": 3
}
```
- **Response `201 Created`**

### 3.4 Update Customer
- **Endpoint**: `PUT /api/customers/:id`
- **Request Body**: Partial or full fields.
- **Response `200 OK`**

### 3.5 Delete Customer
- **Endpoint**: `DELETE /api/customers/:id`
- **RBAC**: ADMIN, MANAGER only
- **Response `200 OK`**

---

## 4. Lead Management (`/api/leads`)

### 4.1 List Leads
- **Endpoint**: `GET /api/leads`
- **Query Params**: `page`, `limit`, `search`, `status`, `source`

### 4.2 Create Lead
- **Endpoint**: `POST /api/leads`
- **Request Body**:
```json
{
  "name": "Vikram Mehta",
  "email": "vikram@apexcloud.in",
  "phone": "+1 408-555-0123",
  "companyName": "Apex Cloud India",
  "source": "WEBSITE",
  "status": "QUALIFIED",
  "estimatedValue": 48000,
  "notes": "Interested in CRM enterprise migration",
  "assignedToId": 3
}
```

### 4.3 Convert Lead to Opportunity
- **Endpoint**: `POST /api/leads/:id/convert`
- **Request Body**:
```json
{
  "opportunityName": "Apex Cloud ERP Migration Deal",
  "amount": 48000,
  "stage": "QUALIFICATION",
  "probability": 25,
  "expectedCloseDate": "2026-11-15",
  "notes": "Converted from website lead inquiry"
}
```
- **Response `200 OK`**: Returns newly created `{ customer, opportunity, lead }` atomically.

---

## 5. Opportunity Management (`/api/opportunities`)

### 5.1 List Opportunities
- **Endpoint**: `GET /api/opportunities`
- **Query Params**: `page`, `limit`, `search`, `stage`, `status`

### 5.2 Create Opportunity
- **Endpoint**: `POST /api/opportunities`
- **Request Body**:
```json
{
  "name": "Wayne Enterprises City Defense Portal",
  "customerId": 5,
  "amount": 250000,
  "stage": "NEGOTIATION",
  "probability": 75,
  "expectedCloseDate": "2026-12-31",
  "status": "OPEN",
  "notes": "Contract under final review",
  "assignedToId": 4
}
```

---

## 6. Follow-Up Tasks (`/api/followups`)

### 6.1 List Follow-Ups
- **Endpoint**: `GET /api/followups`
- **Query Params**:
  - `filterTime`: `today` | `upcoming` | `overdue`
  - `type`: `CALL` | `MEETING` | `EMAIL` | `TASK`
  - `status`: `PLANNED` | `COMPLETED` | `MISSED` | `CANCELLED`

### 6.2 Schedule Follow-Up
- **Endpoint**: `POST /api/followups`
- **Request Body**:
```json
{
  "customerId": 1,
  "followUpDate": "2026-10-15T14:30:00Z",
  "type": "MEETING",
  "remarks": "Product walkthrough demo",
  "status": "PLANNED",
  "assignedToId": 3
}
```

---

## 7. Activities (`/api/activities`)

- `GET /api/activities`: List logged touchpoints.
- `POST /api/activities`: Log a call, email, demo, or meeting.
- `PUT /api/activities/:id`: Update activity note.
- `DELETE /api/activities/:id`: Remove activity record.

---

## 8. Reports (`/api/reports`)

- `GET /api/reports/pipeline`: Weighted sales pipeline summary and details.
- `GET /api/reports/conversion`: Conversion rate by channel source.
- `GET /api/reports/customers`: Customer database report.
- `GET /api/reports/leads`: Lead pipeline status report.
- `GET /api/reports/opportunities`: Deals and closed revenue report.
- `GET /api/reports/user-activity` (Admin/Manager): Sales rep activity report.
- `GET /api/reports/audit` (Admin): System audit trail report.

---

## 9. User Administration (`/api/users`) — Admin Only

- `GET /api/users`: List team members.
- `GET /api/users/roles`: List available roles.
- `POST /api/users`: Create a new user with role.
- `PUT /api/users/:id`: Edit user details.
- `PATCH /api/users/:id/toggle-status`: Activate/Deactivate account.
- `POST /api/users/:id/reset-password`: Set temporary password & unlock account.

---

## 10. Audit Logs (`/api/audit-logs`) — Admin Only

- `GET /api/audit-logs`: Query immutable security and entity modification logs with old/new value payloads.
