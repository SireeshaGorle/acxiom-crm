# 🚀 ACXIOMCRM — Production Deployment Guide

This guide provides step-by-step instructions to deploy **ACXIOMCRM** to production using:
- **Frontend**: [Vercel](https://vercel.com)
- **Backend**: [Render](https://render.com)
- **Database**: [Neon PostgreSQL](https://neon.tech)

---

## 🏗 Production Architecture

```
[ User Browser ]
       │
       ▼ (HTTPS)
[ Vercel (React Frontend) ]
       │
       ▼ (HTTPS REST with JWT)
[ Render (Node / Express Server) ]
       │
       ▼ (Prisma Client / SSL Pooled Connection)
[ Neon (PostgreSQL Serverless DB) ]
```

---

## Step 1: Deploy Database on Neon PostgreSQL

1. Sign in to [Neon.tech](https://neon.tech).
2. Click **Create Project**, name it `acxiomcrm-db`, and choose your nearest region.
3. In the Neon Dashboard, copy the **Pooled Connection String**:
   ```
   postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Keep this connection string ready for Step 2.

---

## Step 2: Deploy Backend API on Render

1. Sign in to [Render.com](https://render.com).
2. Click **New +** &rarr; **Web Service**.
3. Connect your GitHub repository containing ACXIOMCRM.
4. Configure the Web Service settings:
   - **Name**: `acxiomcrm-api`
   - **Region**: Same region as your Neon database (e.g., US East / Oregon / Frankfurt).
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push && npm run prisma:seed`
   - **Start Command**: `node src/server.js`
   - **Plan**: Free (or Starter)

5. Add the **Environment Variables** in Render:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` (or leave default Render port) |
   | `DATABASE_URL` | `postgresql://neondb_owner:...@...neon.tech/neondb?sslmode=require` |
   | `JWT_SECRET` | `generate_a_strong_64_character_random_secret_string` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `FRONTEND_URL` | `https://your-app-name.vercel.app` *(update after Step 3)* |

6. Click **Deploy Web Service**.
7. Once deployed, note down your live Backend URL:  
   `https://acxiomcrm-api.onrender.com`
   - Test Health Check: `https://acxiomcrm-api.onrender.com/api/health` &rarr; `{"success": true, "message": "ACXIOMCRM API is up and running"}`

---

## Step 3: Deploy Frontend on Vercel

1. Sign in to [Vercel.com](https://vercel.com).
2. Click **Add New...** &rarr; **Project**.
3. Import your GitHub repository.
4. Configure Project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add **Environment Variable**:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://acxiomcrm-api.onrender.com/api` |

6. Click **Deploy**.
7. Once finished, Vercel will provide your production URL:  
   `https://acxiomcrm.vercel.app`

8. **Final Step**: Go back to Render Environment Variables and set `FRONTEND_URL=https://acxiomcrm.vercel.app` to ensure secure CORS configuration.

---

## ✅ Deployment Verification Checklist

- [ ] Database connection established on startup.
- [ ] Prisma migrations and seed data loaded successfully.
- [ ] HTTPS enabled automatically across all domains.
- [ ] Admin login verified (`admin@acxiomcrm.com`).
- [ ] Manager login verified (`manager@acxiomcrm.com`).
- [ ] Sales Executive login verified (`sales@acxiomcrm.com`).
- [ ] Customer creation, listing, edit, and deletion tested.
- [ ] Lead creation and Lead Conversion tested.
- [ ] Opportunity pipeline and weighted calculation verified.
- [ ] Follow-ups and activities logged.
- [ ] Live Chart.js graphs rendering from live database queries.
- [ ] Audit logs recording all transactions.
- [ ] CSV report download tested.
