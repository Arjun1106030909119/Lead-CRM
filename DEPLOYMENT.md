# Deployment Guide

This guide walks you through deploying the Lead CRM application:

- **Database** → MongoDB Atlas (free M0 tier)
- **Backend** → Render (free Web Service)
- **Frontend** → Vercel (free Hobby plan)

---

## Step 1: MongoDB Atlas — Database

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign up / log in.
2. Click **Create** → choose **M0 Free** tier → pick a cloud provider & region closest to your users.
3. Set a **username** and **password** for your database user (save these).
4. Under **Network Access**, click **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) *(for Render's dynamic IPs)*.
5. Go to **Database** → **Connect** → **Drivers** → copy the connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>`, `<password>`, and append your DB name:
   ```
   mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/lead-crm?retryWrites=true&w=majority
   ```
   > Save this URI — you will use it as `MONGO_URI` in Render.

---

## Step 2: Render — Backend API

1. Push your code to **GitHub** (the whole `assessment_digital_heroes` repo).
2. Go to [https://render.com](https://render.com) and sign up with GitHub.
3. Click **New** → **Web Service** → connect your GitHub repo.
4. Configure the service:
   | Setting | Value |
   |---------|-------|
   | **Name** | `lead-crm-api` (or your choice) |
   | **Root Directory** | `server` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Plan** | Free |

5. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | *(your Atlas connection string)* |
   | `JWT_SECRET` | *(a long random string, e.g., run `openssl rand -hex 32`)* |
   | `NODE_ENV` | `production` |
   | `CLIENT_URL` | *(your Vercel URL — add after Step 3)* |

6. Click **Create Web Service**. Render will build and deploy.
7. Copy your Render service URL: `https://lead-crm-api.onrender.com`

> **Note:** Free Render services spin down after 15 minutes of inactivity. The first request after a cold start may take ~30 seconds.

---

## Step 3: Vercel — Frontend

1. Go to [https://vercel.com](https://vercel.com) and sign up with GitHub.
2. Click **Add New Project** → import your GitHub repo.
3. Configure the project:
   | Setting | Value |
   |---------|-------|
   | **Root Directory** | `client` |
   | **Framework Preset** | Vite |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

4. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | `https://lead-crm-api.onrender.com/api` |

5. Click **Deploy**. Vercel will build and deploy.
6. Copy your Vercel URL: `https://lead-crm-xyz.vercel.app`

---

## Step 4: Update CORS on Render

1. Go back to your Render service → **Environment** tab.
2. Set `CLIENT_URL` = `https://lead-crm-xyz.vercel.app` (your actual Vercel URL).
3. Render will auto-redeploy with the updated CORS setting.

---

## Step 5: Seed Demo Users (Optional)

To create demo accounts, run this against your production database using [MongoDB Atlas Data Explorer](https://www.mongodb.com/docs/atlas/atlas-ui/documents/) or a local script pointed at your Atlas `MONGO_URI`:

> Or simply register via the `/register` endpoint and manually promote a user to `ADMIN` role in Atlas's Data Explorer by editing their document.

---

## Checklist

- [ ] MongoDB Atlas cluster created with correct IP whitelist
- [ ] Render service deployed with all env vars set
- [ ] Vercel project deployed with `VITE_API_BASE_URL` set
- [ ] Render `CLIENT_URL` updated to Vercel URL
- [ ] Test login, lead creation, and dashboard in production
