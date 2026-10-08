# 🎓 ACXIOMCRM — Student-Friendly Project Explanation Guide

> **Welcome to the ACXIOMCRM Project Explanation Guide!**  
> This guide is specially prepared in clear, structured, and easy-to-understand language so any student can explain this project confidently to their project guide, external evaluator, or job interviewer.

---

## 1. What is AcxiomCRM?
**AcxiomCRM** is a web-based **Customer Relationship Management (CRM)** application designed to help businesses organize, track, and manage their interactions with existing customers and prospective sales leads from the first point of contact to closing lucrative deals.

---

## 2. Why Did We Build It?
Businesses struggle when sales data is scattered across spreadsheets, paper notes, and disjointed emails.  
We built AcxiomCRM to provide:
1. **A Single Centralized Source of Truth**: All customer records, contact numbers, emails, and notes in one place.
2. **Smooth Lead-to-Deal Conversion**: A structured pipeline to convert prospective inquiries into active customers and revenue deals without losing critical information.
3. **Transparent Sales Forecasting**: Accurate revenue projections using weighted probability algorithms (`Amount × Probability / 100`).
4. **Accountability & Compliance**: An automated system audit trail that logs who did what, when, and from which IP address.

---

## 3. Who Uses It? (User Roles Explained)

| Role | Who they are | What they do in the system |
|---|---|---|
| **Admin** | System Administrator / IT Head | Manages users, activates/deactivates accounts, resets passwords, views security audit logs, and oversees the entire CRM. |
| **Manager** | Sales Director / Team Lead | Monitors team-wide deals, examines performance reports, assigns leads to reps, and analyzes pipeline revenue trends. |
| **Sales Executive** | Field Representative / Sales Rep | Works on their assigned leads, calls customers, schedules follow-ups, creates deals, and moves opportunities through qualification stages to "Won". |

---

## 4. System Architecture: How It Works Under The Hood

```
[ User in Browser ] 
        │
        ▼
[ React Frontend (Port 5173 / Vercel) ]
        │  Sends HTTP Request with Bearer JWT Header
        ▼
[ Express.js REST API Server (Port 5000 / Render) ]
   ├── Step 1: Security & Rate Limiting (Helmet, express-rate-limit)
   ├── Step 2: Authentication Middleware (Verifies JWT signature & user status)
   ├── Step 3: Authorization Middleware (Checks if User Role is allowed)
   ├── Step 4: Controller Layer (Validates input data)
   ├── Step 5: Service Layer (Runs business rules & calls Audit Logger)
   └── Step 6: Prisma ORM (Translates Javascript to optimized SQL queries)
        │
        ▼
[ PostgreSQL Database (Neon Serverless) ]
```

---

## 5. Main Modules Explained

### 📊 Module 1: Dashboard & Analytics
- **What it does**: Provides executive KPI cards (Total Customers, Total Leads, Open Pipeline Value, Weighted Forecast, Won Revenue).
- **Interactive Charts**:
  1. *Lead Status Breakdown* (Doughnut Chart): Visualizes lead qualification health.
  2. *Opportunity Pipeline* (Bar Chart): Shows deal volume and values across stages.
  3. *Monthly Won Sales* (Line Chart): Displays historical closed revenue trend over the past 6 months.
- **Key Feature**: All charts query live database aggregations (no hardcoded numbers).

---

### 🏢 Module 2: Customer Management
- **What it does**: Stores business profiles (Customer Code, Company Name, Contact Name, Email, Phone, Address, Status).
- **Features**: Search by any field, filter by Active/Inactive, view full interaction histories (Deals, Follow-ups, Activities).

---

### 🎯 Module 3: Lead Management & Lead Conversion
- **What it does**: Captures new prospective clients from Website inquiries, Referrals, Cold Calls, and Exhibitions.
- **The Conversion Workflow**:
  - When a lead is marked `QUALIFIED`, clicking **Convert Lead** launches an atomic transaction.
  - The system automatically creates a **Customer Account** + creates a **Pipeline Opportunity** + marks the Lead as `CONVERTED`.
  - Re-links all prior follow-ups and meetings to the new customer account.

---

### 💰 Module 4: Opportunity Management & Weighted Pipeline
- **What it does**: Tracks potential sales deals through 5 standard stages:
  1. `QUALIFICATION` (10% probability)
  2. `PROPOSAL` (40% probability)
  3. `NEGOTIATION` (75% probability)
  4. `WON` (100% closed revenue)
  5. `LOST` (0% closed lost)
- **Business Rule Calculation**:
  $$\text{Weighted Pipeline} = \frac{\text{Amount} \times \text{Probability}}{100}$$
  *Example*: A $\$100,000$ deal in Negotiation ($75\%$) yields $\$75,000$ in weighted forecast.

---

### 📅 Module 5: Follow-Up Scheduling
- **What it does**: Helps sales reps never miss a call or meeting.
- **Tabs**: *Today's Schedule*, *Upcoming Tasks*, and *Overdue Tasks* (highlights missed follow-ups in red).

---

### 📞 Module 6: Activity History
- **What it does**: A chronological diary of every interaction (Phone Call, Email, Meeting, Task) logged by team members.

---

### 👥 Module 7: User & Role Administration (Admin Only)
- **What it does**: Allows system administrators to add team members, assign roles (Admin, Manager, Sales Exec), deactivate employees who leave the company, and reset temporary passwords.

---

### 🛡 Module 8: Security Audit Logs (Admin Only)
- **What it does**: An immutable compliance log that records every critical system event:
  - Logins, Failed logins, Logouts
  - Lead conversions
  - Customer/Deal creations and updates
  - Stores Old Value vs New Value JSON payloads with IP address and timestamp.

---

### 📈 Module 9: Reports & CSV Export
- **What it does**: Generates tabular reports for Sales Pipelines, Conversion Ratios by Channel Source, Customer Directories, and Team Performance with one-click **CSV Download**.

---

## 6. How Authentication & Security Work

1. **Password Protection**: Passwords are never saved in plain text. They are hashed using **bcryptjs** with a salt round of 10.
2. **Stateless JWT Tokens**: When a user logs in successfully, the backend creates a signed **JSON Web Token (JWT)** containing `{ userId, email, role }` signed with a secret key.
3. **Account Lockout Mechanism**: If someone inputs an incorrect password 5 times in a row, the account is automatically locked for 15 minutes to prevent brute-force attacks.
4. **Backend Role Enforcement (RBAC)**: Even if someone tries to call the API directly using Postman, backend middleware (`authorizeRoles('ADMIN')`) blocks unauthorized requests with a `403 Forbidden` response.

---

## 7. Technology Stack Justification (Why We Chose Them)

- **Why React.js?** Fast virtual DOM, modular component architecture, and responsive state management.
- **Why Node.js & Express.js?** Lightweight, asynchronous event-driven I/O, ideal for JSON REST APIs.
- **Why PostgreSQL?** Enterprise-grade ACID compliance, reliable relational integrity, and rock-solid indexing.
- **Why Prisma ORM?** Type-safe database queries, automated database migrations, and clean schema definitions without raw SQL vulnerabilities.
- **Why Bootstrap 5?** Clean, professional corporate design system that is 100% responsive across mobile, tablet, and desktop without bloated CSS frameworks.
