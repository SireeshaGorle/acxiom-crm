# 🚀 ACXIOMCRM — Enterprise Customer Relationship Management

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v22-green.svg)](https://nodejs.org)
[![React Version](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple.svg)](https://getbootstrap.com)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-teal.svg)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20(Neon)-blue.svg)](https://neon.tech)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **ACXIOMCRM** is a production-oriented, full-stack CRM web application engineered for high-performance sales pipelines, customer lifecycle management, lead qualification & conversion, automated scheduling, team oversight, and real-time executive analytics.

---

## 📑 Table of Contents
1. [Primary Objectives & Overview](#primary-objectives--overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Flow](#architecture--flow)
4. [Core Modules](#core-modules)
5. [User Roles & RBAC Matrix](#user-roles--rbac-matrix)
6. [Demo Credentials](#demo-credentials)
7. [Installation & Local Setup](#installation--local-setup)
8. [Database Migration & Seeding](#database-migration--seeding)
9. [REST API Endpoints Overview](#rest-api-endpoints-overview)
10. [Production Deployment Guide](#production-deployment-guide)
11. [Documentation Links](#documentation-links)

---

## 🎯 Primary Objectives & Overview

ACXIOMCRM provides an end-to-end enterprise CRM solution without bloated microservices or excessive dependencies, adhering to the design principle:
> **SIMPLE TO USE + SIMPLE TO UNDERSTAND + PROFESSIONAL TO REVIEW**

### Key Capabilities:
- **Customer Lifecycle Management**: 360-degree view of accounts, deals, follow-ups, and engagement histories.
- **Lead Generation & Conversion Workflow**: Atomic transition from prospective lead into active Customer Account + Pipeline Opportunity (`CONVERT_LEAD`).
- **Opportunity & Weighted Pipeline Forecasting**: Probability-based revenue calculation: `Weighted Value = Amount × (Probability / 100)`.
- **Scheduled Follow-Ups & Tasks**: Daily agenda tracking with *Overdue*, *Today*, and *Upcoming* filters.
- **Activity Stream**: Audit-logged interaction records (Calls, Emails, Meetings, Tasks).
- **Executive Analytics**: Real Chart.js visualizations (Lead Status Breakdown, Opportunity Pipeline by Stage, Monthly Won Revenue Trend) queried directly from the database.
- **Multi-Role RBAC & Security**: Enforced on both Frontend and Backend with JWT auth, password hashing with bcrypt, account lockout protection (5 failed attempts), and immutable Audit Logging.
- **Exportable Reports**: One-click CSV exports for Sales Pipelines, Lead Conversions, Customer Accounts, and Team Performance.

---

## 🛠 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Bootstrap 5.3, Bootstrap Icons, Chart.js, React-Chartjs-2, Axios, React Router 7 |
| **Backend** | Node.js (v18+ / v22+), Express.js REST API, Helmet, CORS, Morgan, Express Rate Limit |
| **Database & ORM** | PostgreSQL (Neon / Render / Local), Prisma ORM |
| **Security & Auth** | JSON Web Tokens (JWT), bcryptjs password hashing, RBAC middleware, Account Lockout |
| **Testing & Docs** | Postman Collection, GFM Documentation, Node/Browser Verification |
| **Deployment** | Vercel (Frontend), Render (Backend), Neon (Serverless PostgreSQL) |

---

## 🏗 Architecture & Flow

```
[ React SPA Frontend (Vite) ]
          │  ▲
          │  │  HTTPS / Axios REST (Bearer JWT)
          ▼  │
[ Express.js REST API Server ]
     ├── Rate Limiter & Helmet Security
     ├── JWT Authentication Middleware
     ├── Role-Based Access Control (RBAC)
     ├── Controller Layer (Request/Response)
     ├── Service Layer (Business Logic & Audit Logging)
     └── Prisma ORM Client
          │  ▲
          │  │  SQL Queries & Transactions
          ▼  │
[ PostgreSQL Database (Neon / Render) ]
```

---

## 📦 Core Modules

1. **Authentication & Security**: Register, Login, Token verification, Role guard, 15-minute Account Lockout after 5 failed attempts.
2. **Interactive Dashboard**: Real-time KPI summaries and dynamic Chart.js charts.
3. **Customer Management**: Enterprise account directory with codes (`CUST-0001`), communication history, and revenue metrics.
4. **Lead Management & Conversion**: Lead tracking (`LEAD-0001`) with one-click conversion to Customer + Opportunity.
5. **Opportunity Management**: Deals (`OPP-0001`) with stages (Qualification, Proposal, Negotiation, Won, Lost) and weighted pipeline calculations.
6. **Follow-Up Scheduling**: Timeframe filtering (Today, Upcoming, Overdue) and status transitions.
7. **Activity Logging**: Track touchpoints (Call, Meeting, Email, Task) linked to Customers or Leads.
8. **User & Role Administration**: Admin-exclusive control of accounts, activation states, and password resets.
9. **Audit Trail**: Real-time recording of entity changes, security events, and IP addresses with JSON inspection.
10. **Reports & CSV Export**: In-depth sales pipeline and conversion reports with one-click CSV export.

---

## 👥 User Roles & RBAC Matrix

| Role | Customer / Lead / Deals | User Administration | Audit Logs | System Reports |
|---|---|---|---|---|
| **ADMIN** | Full Access (All Records) | Full Control (Create, Edit, Toggle, Reset) | View & Inspect All | Full Access |
| **MANAGER** | Team / All View & Edit | View Only | View Reports Only | Full Access |
| **SALES_EXECUTIVE** | Assigned / Created Records Only | No Access | No Access | Assigned Pipeline |

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Admin** | `admin@acxiomcrm.com` | `Admin@123456` | Full System Administration |
| **Manager** | `manager@acxiomcrm.com` | `Manager@123456` | Team Pipeline & Reports |
| **Sales Exec** | `sales@acxiomcrm.com` | `Sales@123456` | Assigned Leads & Deals |

*(Quick-fill demo buttons are built right into the Login Page for instant evaluator convenience).*

---

## ⚡ Installation & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/acxiomcrm.git
cd acxiomcrm
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
```

Configure your `.env` in `backend/`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
JWT_SECRET=super_secret_jwt_key_acxiom_crm_2026_change_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### 3. Database Migration & Seeding
```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations / push schema
npx prisma db push

# Seed realistic demo data (Users, Customers, Leads, Opportunities, Activities, Audit Logs)
npm run prisma:seed
```

### 4. Start Backend Server
```bash
npm run dev
# Server will run on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### 5. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install

# Create frontend environment file
cp .env.example .env
```

Start the Vite development server:
```bash
npm run dev
# Frontend will run on http://localhost:5173
```

---

## 🌐 Production Deployment Guide

| Component | Recommended Platform | Instructions |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | Set Root Directory to `frontend`, Build Command `npm run build`, Output Directory `dist`, Environment Variable `VITE_API_URL=https://your-backend.onrender.com/api` |
| **Backend** | [Render](https://render.com) | Web Service, Root Directory `backend`, Build Command `npm install && npx prisma generate`, Start Command `node src/server.js`, Set env vars (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`) |
| **Database** | [Neon](https://neon.tech) | Create serverless PostgreSQL instance, copy pooled Connection String into `DATABASE_URL` |

*For complete step-by-step instructions, see [`DEPLOYMENT.md`](file:///d:/Acxiom_Project/DEPLOYMENT.md).*

---

## 📚 Comprehensive Documentation Links

- 📖 [API Documentation](file:///d:/Acxiom_Project/API_DOCUMENTATION.md) — Complete REST endpoints, parameters, and payloads.
- 🗄 [Database Design](file:///d:/Acxiom_Project/DATABASE_DESIGN.md) — Entity relationships, schema, constraints, and indexes.
- 🎓 [Student Project Explanation](file:///d:/Acxiom_Project/PROJECT_EXPLANATION.md) — Plain English project overview and concepts for reviews.
- 🚀 [Deployment Guide](file:///d:/Acxiom_Project/DEPLOYMENT.md) — Step-by-step production setup on Vercel, Render & Neon.
- 🎤 [Project Demo & Guide Q&A](file:///d:/Acxiom_Project/PROJECT_DEMO_GUIDE.md) — 5-minute viva demo flow and top 20 interviewer questions with concise answers.
- 📮 [Postman Collection](file:///d:/Acxiom_Project/ACXIOMCRM_Postman_Collection.json) — Importable JSON for API testing.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
