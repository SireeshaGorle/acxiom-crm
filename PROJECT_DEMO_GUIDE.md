# 🎤 ACXIOMCRM — Project Presentation Flow & Guide Q&A

> This document provides a crisp **5-Minute Live Demo Flow** and the **Top 20 Guide / Viva Questions** with easy-to-memorize, professional answers.

---

## ⏱ 5-Minute Presentation Demo Flow

When presenting ACXIOMCRM to an evaluator, follow this systematic workflow:

### Minute 1: Login & System Overview
- Open the web application at the login page.
- Explain the role-based access model (**Admin**, **Manager**, **Sales Executive**).
- Click the **Admin Demo Login** button to sign in as Alexander Admin.
- Point out the clean Corporate UI and top navbar with active role badge.

### Minute 2: Executive Dashboard & Live Charts
- Showcase the real-time KPI cards (*Total Customers, Pipeline Value, Weighted Forecast, Won Revenue*).
- Explain the **3 Chart.js graphs**:
  1. *Lead Status Breakdown* (Doughnut Chart)
  2. *Opportunity Pipeline Stages* (Bar Chart)
  3. *Monthly Revenue Trend* (Line Chart)
- Emphasize: *"All charts query real PostgreSQL data via Prisma ORM aggregation."*

### Minute 3: Customer & Lead Lifecycle
- Navigate to **Customers**: Show the table with search, status filters, and click into a customer to show linked opportunities and follow-ups.
- Navigate to **Leads**: Click **Add Lead**, create a prospective lead (e.g., *Apex Cloud* with $\$50,000$ estimate).
- Highlight the **Lead Conversion Workflow**: Click **Convert Lead**, fill out the deal name, and convert it.
- Show how the system atomically created both a **Customer Profile** and an **Opportunity Deal**.

### Minute 4: Opportunities, Follow-Ups & Activities
- Navigate to **Opportunities**: Point out the **Weighted Pipeline Value** column (`Amount × Probability / 100`).
- Navigate to **Follow-Ups**: Show the *Today*, *Upcoming*, and *Overdue* filters. Mark a follow-up as completed.
- Navigate to **Reports**: Switch between *Sales Pipeline* and *Lead Conversion* tabs and demonstrate the **CSV Export** button.

### Minute 5: Administration, Audit Logs & Architecture
- Navigate to **Users & Roles**: Show how Admin can create accounts, toggle active status, and reset passwords.
- Navigate to **Audit Logs**: Show the immutable log trail recording the recent lead conversion with IP address and clickable **JSON Change Inspector**.
- Conclude by explaining the production deployment architecture (**Vercel + Render + Neon PostgreSQL**).

---

## 🎯 Top 20 Guide / Interviewer Questions & Answers

### Q1: What is a CRM application?
**Answer**: A Customer Relationship Management (CRM) system is a software platform that organizes and manages all business interactions with customers and sales leads across their entire lifecycle to improve relationships, boost conversions, and forecast revenue.

---

### Q2: Why did you choose React.js for the frontend?
**Answer**: React provides a fast Virtual DOM, modular component architecture, and responsive state management, making it easy to create reusable UI components like modals, tables, and live Chart.js graphs.

---

### Q3: Why did you choose Node.js?
**Answer**: Node.js utilizes an asynchronous, non-blocking event-driven I/O model that excels at processing concurrent REST API requests with high throughput and low latency.

---

### Q4: Why did you choose Express.js?
**Answer**: Express is a minimalist and flexible web framework for Node.js that provides robust routing, middleware pipelines (for CORS, Helmet, rate limiting, and JWT authentication), and clean request handling.

---

### Q5: Why PostgreSQL instead of MongoDB or MySQL?
**Answer**: PostgreSQL is an enterprise-grade relational database offering strict ACID compliance, relational foreign-key integrity, and advanced indexing, which are crucial for financial and business CRM records.

---

### Q6: Why did you use Prisma ORM?
**Answer**: Prisma provides type-safe database queries, declarative schema definitions, automated migrations, and safeguards against SQL injection vulnerabilities without requiring repetitive raw SQL queries.

---

### Q7: What is a REST API?
**Answer**: Representational State Transfer (REST) is an architectural style for web services that uses standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) and stateless JSON payloads to communicate between frontend and backend.

---

### Q8: What is JWT and how does it work?
**Answer**: A JSON Web Token (JWT) is a compact, URL-safe means of representing claims securely between two parties. Upon login, the server signs a token with a secret key containing user ID and role. The client sends this token in the `Authorization: Bearer <token>` header for subsequent requests.

---

### Q9: What is the difference between Authentication and Authorization?
**Answer**:
- **Authentication** verifies *who you are* (e.g., logging in with email and password to verify identity).
- **Authorization** determines *what you are allowed to do* (e.g., checking if an authenticated user has the `ADMIN` role to access audit logs).

---

### Q10: How are user passwords secured in your application?
**Answer**: Passwords are never stored in plain text. They are hashed using **bcryptjs** with a cryptographic salt round of 10. During login, `bcrypt.compare()` compares the hashed value. Passwords are stripped from all API responses and audit logs.

---

### Q11: What is Role-Based Access Control (RBAC)?
**Answer**: RBAC restricts network resources based on the roles assigned to individual users. In AcxiomCRM, backend middleware (`authorizeRoles`) and frontend route guards ensure Sales Executives cannot access Admin-only management endpoints.

---

### Q12: How does the Lead Conversion workflow work?
**Answer**: When a qualified lead is converted, an atomic database transaction creates a new Customer account, creates a corresponding Opportunity deal, marks the Lead status as `CONVERTED`, and re-links existing follow-ups to the new customer profile.

---

### Q13: What is a Sales Opportunity?
**Answer**: An Opportunity is a qualified sales deal in progress associated with an account, tracking the potential revenue amount, expected close date, probability of winning, and current pipeline stage.

---

### Q14: How is Weighted Pipeline calculated?
**Answer**:
$$\text{Weighted Pipeline} = \frac{\text{Amount} \times \text{Probability}}{100}$$
It represents the expected value of an unclosed deal based on its stage probability (e.g., $\$50,000 \times 80\% = \$40,000$).

---

### Q15: Why are Audit Logs important in enterprise applications?
**Answer**: Audit logs provide an immutable, timestamped record of user actions (logins, creations, updates, deletions, conversions) with IP addresses and old/new values, ensuring compliance, security forensics, and accountability.

---

### Q16: How does the React frontend communicate with the backend?
**Answer**: React uses **Axios** to make asynchronous HTTP requests to Express REST API endpoints. An Axios interceptor automatically attaches the JWT token from localStorage to the `Authorization` header.

---

### Q17: How does the backend communicate with PostgreSQL?
**Answer**: The backend uses the **Prisma Client**, which connects to PostgreSQL via a connection pool connection string, translating Javascript queries (`prisma.customer.findMany()`) into optimized SQL statements.

---

### Q18: What security measures did you implement against brute-force attacks?
**Answer**: We implemented endpoint rate limiting using `express-rate-limit` (20 attempts per 15 mins) and an automated **Account Lockout** mechanism in the database that locks a user account for 15 minutes after 5 consecutive failed login attempts.

---

### Q19: How is the application deployed to production?
**Answer**:
- **Frontend**: Deployed on **Vercel** with global CDN distribution.
- **Backend**: Deployed as a web service on **Render**.
- **Database**: Hosted on **Neon Serverless PostgreSQL** with pooled SSL connections.

---

### Q20: How did you validate data in the system?
**Answer**: We applied **dual-layer validation**:
1. *Frontend validation* for instant user feedback (required fields, valid email/phone formats, positive numbers).
2. *Backend validation* in Express services and database schema constraints so that even direct API calls cannot corrupt the database.
