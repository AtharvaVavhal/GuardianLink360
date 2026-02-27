# 🛡️ GurdianLink360 — Complete Setup Guide

## ⚡ Quick Start (Recommended for Demo)

### Prerequisites
- Node.js v18+
- Python 3.9+
- MongoDB (local or Atlas)
- Twilio account (free trial works)
- Gemini API key (free tier at aistudio.google.com) — optional, falls back to keywords

---

## Step 1 — Clone & Configure Environment

```bash
git clone https://github.com/YOUR_USERNAME/GurdianLink360.git
cd GurdianLink360
```

### Copy and fill all `.env` files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
cp dashboard/.env.example dashboard/.env
cp ml-service/.env.example ml-service/.env
```

**Edit `server/.env`** with your real credentials:
```
MONGODB_URI=mongodb://localhost:27017/gurdianlink360
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
TWILIO_WHATSAPP_NUMBER=+14155238886
JWT_SECRET=your_random_secret_here
```

**Edit `ml-service/.env`:**
```
GEMINI_API_KEY=your_gemini_key   # Leave blank to use keyword fallback
```

---

## Step 2 — Seed the Demo Database

```bash
cd server
npm install
node seed.js
```

This creates:
| Role | Name | Phone |
|------|------|-------|
| Senior | Ramesh Sharma | +91 98765 43210 |
| Guardian | Anil Sharma | +91 99998 88877 |
| Senior | Sunita Patel | +91 87654 32109 |
| Guardian | Priya Patel | +91 91112 22333 |

---

## Step 3 — Start All Services

Open **4 terminals**:

**Terminal 1 — ML Service**
```bash
cd ml-service
pip install -r requirements.txt
python app.py
# Running on http://localhost:5000
```

**Terminal 2 — Backend Server**
```bash
cd server
npm run dev
# Running on http://localhost:5001
```

**Terminal 3 — Senior PWA**
```bash
cd client
npm install
npm start
# Running on http://localhost:3000
```

**Terminal 4 — Guardian Dashboard**
```bash
cd dashboard
npm install
npm start
# Running on http://localhost:3002
```

---

## Step 4 — Open in Browser

| App | URL | Login |
|-----|-----|-------|
| Senior PWA | http://localhost:3000 | +91 98765 43210 |
| Guardian Dashboard | http://localhost:3002 | +91 99998 88877 |
| Backend API | http://localhost:5001 | — |
| ML Service | http://localhost:5000 | — |

---

## 🐳 Docker (One-Command Startup)

If you have Docker installed:

```bash
# Copy and fill your .env variables first (see Step 1)
cp server/.env.example .env   # Docker compose reads root .env

docker-compose up --build
```

Then seed the database:
```bash
docker-compose exec server node seed.js
```

Open:
- Senior: http://localhost:3000
- Guardian: http://localhost:3002

---

## 🎯 Live Demo Flow (Mr. Sharma Scenario)

1. Open **Guardian Dashboard** (http://localhost:3002) → login as Anil Sharma
2. Open **Senior PWA** (http://localhost:3000) on another tab/phone → login as Ramesh Sharma
3. **PANIC**: Senior taps "Hold 2 sec" HELP button → Guardian dashboard flashes red instantly
4. **Verify Caller**: Senior enters "CBI Officer" → system flags as SCAM
5. **Scam Checklist**: Senior answers 5 questions → 3/5 red flags = danger alert sent
6. **BankShield**: Guardian dashboard → manually freeze a transaction
7. Watch alerts appear in real-time on the Guardian dashboard 🎉

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/otp/request` | Request OTP |
| POST | `/api/auth/otp/verify` | Verify OTP + get JWT |
| POST | `/api/auth/register` | Register senior/guardian pair |
| POST | `/api/alert/panic` | Trigger panic alert |
| POST | `/api/alert/verify-caller` | Check if caller is scam |
| POST | `/api/alert/scam-check` | Run 5-question scam checklist |
| POST | `/api/transaction/flag` | Flag suspicious transaction |
| POST | `/api/transaction/approve` | Guardian approves/rejects |
| GET | `/api/dashboard/alerts/:phone` | Guardian's live alert feed |
| GET | `/api/dashboard/incidents/:phone` | Guardian's incident history |
| GET | `/api/dashboard/stats/:phone` | Dashboard statistics |
| POST | `/api/dashboard/resolve/:id` | Mark incident resolved |

---

## ⚠️ Troubleshooting

**OTP not received?**
- Check Twilio credentials in `server/.env`
- Ensure the phone number is registered via `seed.js`
- Twilio free trial only sends to verified numbers

**ML service fails?**
- It automatically falls back to keyword detection — app still works
- Add a valid `GEMINI_API_KEY` to `ml-service/.env` for AI analysis

**Socket.io not connecting?**
- Check `REACT_APP_SOCKET_URL` in `client/.env` and `dashboard/.env`
- Both should point to `http://localhost:5001`

**MongoDB not connecting?**
- Ensure MongoDB is running: `mongod` or use MongoDB Atlas
- Check `MONGODB_URI` in `server/.env`
