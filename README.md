# 🛒 Smart Retail Inventory Anomaly Detection System

A full-stack inventory management platform that automatically detects unusual sales patterns, raises alerts, and gives store teams analytics and downloadable PDF reports, with role-based access for different staff levels.

**Live demo:** https://smart-retail-seven.vercel.app
**API docs (Swagger):** https://smart-retail-api-je8r.onrender.com/docs

> ⏳ The backend runs on a free hosting tier, so the **first request after a period of inactivity can take about a minute** to wake the server up. After that it responds normally.

---

## ✨ Features

- **Authentication and roles:** JWT-based login and signup with role-based access (Admin, Manager, Inventory Staff).
- **Product, sales and inventory management:** create and track products, record sales, monitor stock levels.
- **Automated anomaly detection:** a background scheduler runs every hour, compares each product's peak sales against its average, and flags sales spikes.
- **Alerts:** every detected anomaly creates an alert that staff can review.
- **Analytics dashboard:** sales and inventory insights, with ML-based analysis using scikit-learn.
- **PDF reports:** download Sales, Inventory and Anomalies reports generated with ReportLab.
- **Notification support:** email (fastapi-mail) and SMS/WhatsApp (Twilio) integrations.
- **UI extras:** dark mode, multi-language support, responsive layout.

## 🧠 How anomaly detection works

1. APScheduler triggers the detection job every hour.
2. For each product, the job computes the average and the maximum sale quantity.
3. If the maximum is more than **2× the average**, a `sales_spike` anomaly with `HIGH` severity is created, along with an alert.
4. Products that already have an open spike anomaly are skipped, so duplicates are not created on every run.

## 🧰 Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Axios, React Router |
| Backend | FastAPI, SQLAlchemy, Pydantic, python-jose (JWT), Passlib + bcrypt |
| Database | PostgreSQL (Neon) in production, SQLite for local development |
| Scheduling | APScheduler |
| ML and reports | scikit-learn, NumPy, ReportLab |
| Integrations | Twilio, fastapi-mail |
| Deployment | Vercel (frontend), Render (backend), Neon (database) |

## 🏗️ Architecture

```
React (Vercel)  ──HTTPS──▶  FastAPI (Render)  ──SQLAlchemy──▶  PostgreSQL (Neon)
                                  │
                                  └── APScheduler (hourly anomaly detection)
```

## 📁 Project structure

```
clg-project/
├── backend/
│   ├── app/
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routes/        # auth, products, sales, inventory, alerts, anomalies, users, analytics, reports
│   │   ├── services/      # report generator, notifications
│   │   ├── security/      # JWT and password handling
│   │   ├── database.py
│   │   └── main.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/           # Axios instance
    │   ├── components/
    │   └── pages/         # Dashboard, Products, Sales, Anomalies, Alerts, Analytics, Reports, ...
    ├── vercel.json
    └── package.json
```

## 🚀 Run locally

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=sqlite:///./retail.db
SECRET_KEY=change-this-to-a-long-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:5173

# Optional integrations
MAIL_USERNAME=
MAIL_PASSWORD=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_WHATSAPP_NUMBER=
```

Start the server:

```bash
uvicorn app.main:app --reload
```

API docs will be available at http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

The app opens at http://localhost:5173

## ☁️ Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Root directory `frontend`, env var `VITE_API_URL` pointing to the backend |
| Backend | Render (free) | Root directory `backend`, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, Python 3.10.11 |
| Database | Neon (PostgreSQL) | Connection string supplied through `DATABASE_URL` |

Important settings:
- `CORS_ORIGINS` on the backend must contain the exact frontend URL, without a trailing slash.
- All secrets live in environment variables, never in the repository.
- `frontend/vercel.json` rewrites all routes to `index.html` so React Router works on page refresh.

## 🔐 Security notes

- Passwords are hashed with bcrypt.
- Protected endpoints require a JWT bearer token.
- API keys, database credentials and mail/SMS credentials are loaded from environment variables via `.env`.

## 📸 Screenshots

<!-- Add screenshots to docs/screenshots/ and uncomment:
![Dashboard](docs/screenshots/dashboard.png)
![Anomalies](docs/screenshots/anomalies.png)
![Reports](docs/screenshots/reports.png)
-->

## 🗺️ Roadmap

- Email delivery for scheduled reports
- More detection rules (stock-out risk, unusual returns)
- Automated tests and CI

## 👩‍💻 Author

**Anamika Kumari**
B.Tech Computer Science Engineering, Dumka Engineering College

[GitHub](https://github.com/Anamikakumari2005) · [LinkedIn](https://linkedin.com/in/anamika-kumari-102103263)
