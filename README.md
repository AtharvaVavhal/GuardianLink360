# 🛡️ GurdianLink360
### Real-Time Digital Arrest Prevention Ecosystem for Senior Citizens

![Hackathon](https://img.shields.io/badge/Hackathon-2024-blue?style=for-the-badge)
![Topic](https://img.shields.io/badge/Topic-26007-red?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Python-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge)

---

## 🚨 The Problem

> *In 2024, India lost **₹11,000 crore** to Digital Arrest scams. A retired schoolteacher in Pune lost ₹8 lakh in 47 minutes — kept on a video call, told she was under "Digital Arrest", while her son sat 3 kilometers away, completely unaware.*

Senior citizens in India are increasingly targeted by sophisticated cyber-fraud where fraudsters **impersonate law enforcement officials**, using psychological manipulation and fear to coerce elderly victims into transferring life savings.

### 5 Critical Gaps (Official Problem Statement)
| # | Gap |
|---|---|
| 1 | Absence of real-time intervention for prolonged suspicious video/voice calls |
| 2 | Lack of elderly-friendly immediate Panic or Verification mechanisms |
| 3 | Limited awareness about procedural realities of law enforcement |
| 4 | Absence of Guardian-Link systems to alert family during high-stress interactions |
| 5 | Slow response from banking systems once a transfer is initiated under duress |

> **GurdianLink360 addresses all 5 gaps — not just one.**

---

## 💡 Our Solution

GurdianLink360 is a **3-component proactive security ecosystem** — the first system that detects a Digital Arrest scam *while it is happening*, alerts the family in real time, and freezes the bank transfer *before it leaves the account*.

```
┌─────────────────────────────────────────────────────────────┐
│                    GurdianLink360 Ecosystem                  │
│                                                             │
│  🔴 SeniorShield PWA  →  📊 GuardianLink Dashboard         │
│       (Elderly)              (Family)                       │
│           │                      │                          │
│           └──────────┬───────────┘                          │
│                      ↓                                      │
│              🏦 BankShield API                              │
│                 (Banking Layer)                             │
└─────────────────────────────────────────────────────────────┘
```

### 🔴 Component 1 — SeniorShield PWA *(For Elderly)*
A ultra-simple Progressive Web App designed specifically for senior citizens.
- **Big Red PANIC Button** — one tap sends instant alert to family + logs incident
- **Verify Caller** — checks if caller is genuine government/police officer
- **Am I Being Scammed?** — 5-question checklist that detects scam patterns
- **Awareness Quiz** — gamified training with real India-based scam scenarios
- Works on **any smartphone browser** — no app install required

### 📊 Component 2 — GuardianLink Dashboard *(For Family)*
Real-time family monitoring dashboard for instant intervention.
- **Live stress indicator** — flags unusually long/suspicious calls instantly
- **Multi-channel alerts** — SMS + WhatsApp + in-app simultaneously via Twilio
- **One-click emergency join** — guardian can interrupt the scam call immediately
- **Full incident log** — complete history of all scam attempts and alerts

### 🏦 Component 3 — BankShield API *(Banking Layer)*
Simulated banking intervention that stops fraudulent transfers.
- **Transaction flagging** — detects transfers initiated during active suspicious calls
- **30-minute cooling period** — auto-triggered for large transfers above ₹10,000
- **Family co-authorization** — guardian approval required for flagged transactions
- **Bank manager alert** — real-time dashboard for banking officials

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js + Tailwind CSS | Senior PWA + Guardian Dashboard |
| PWA | Web App Manifest + Service Worker | Offline support, installable |
| Real-time | Socket.io | Live alert pipeline |
| Backend | Node.js + Express.js | REST API server |
| Database | MongoDB + Mongoose | Users, alerts, incident logs |
| Notifications | Twilio SMS + WhatsApp API | Multi-channel guardian alerts |
| AI/NLP | Python Flask + OpenAI API | Scam keyword detection |
| Auth | Firebase Auth | OTP-based login for seniors |
| Hosting | Vercel (Frontend) + Render (Backend) | Live deployment |

---

## 📁 Project Structure

```
GurdianLink360/
├── client/                          # React PWA — Senior App + Guardian Dashboard
│   ├── public/
│   │   ├── manifest.json            # PWA configuration
│   │   └── icons/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PanicButton.jsx      # Big red PANIC button
│   │   │   ├── VerifyCaller.jsx     # Caller verification UI
│   │   │   ├── ScamChecklist.jsx    # 5-question scam detector
│   │   │   └── AwarenessQuiz.jsx    # Gamified awareness training
│   │   ├── pages/
│   │   │   ├── SeniorHome.jsx       # Senior-facing interface
│   │   │   └── GuardianDashboard.jsx # Family monitoring dashboard
│   │   ├── socket.js                # Socket.io client config
│   │   └── App.jsx
│   ├── package.json
│   └── .env.example
│
├── server/                          # Node.js Backend — Core Engine
│   ├── routes/
│   │   ├── alert.js                 # PANIC + alert endpoints
│   │   ├── auth.js                  # Registration + login
│   │   ├── transaction.js           # BankShield flagging
│   │   └── dashboard.js             # Guardian dashboard feed
│   ├── models/
│   │   ├── User.js                  # Senior + Guardian schema
│   │   ├── Alert.js                 # Alert event schema
│   │   └── Incident.js              # Full incident log schema
│   ├── controllers/
│   │   ├── alertController.js       # Alert business logic
│   │   └── twilioController.js      # SMS + WhatsApp dispatch
│   ├── socket/
│   │   └── socketHandler.js         # Real-time event handlers
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── index.js                     # Server entry point
│   ├── package.json
│   └── .env.example
│
├── ml-service/                      # Python Flask — AI Scam Detection
│   ├── app.py                       # Flask entry point
│   ├── scam_detector.py             # NLP keyword + pattern detection
│   ├── bank_shield.py               # Transaction risk scoring
│   ├── requirements.txt
│   └── .env.example
│
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Python 3.9+
- MongoDB Atlas account
- Twilio account (free trial works)
- OpenAI API key

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/GurdianLink360.git
cd GurdianLink360
```

### 2. Setup Backend Server
```bash
cd server
npm install
cp .env.example .env
# Fill in your credentials in .env
npm run dev
```

### 3. Setup Frontend Client
```bash
cd client
npm install
cp .env.example .env
npm start
```

### 4. Setup ML Service
```bash
cd ml-service
pip install -r requirements.txt
cp .env.example .env
python app.py
```

### 5. Open the App
```
Senior PWA:          http://localhost:3000/senior
Guardian Dashboard:  http://localhost:3000/guardian
Backend API:         http://localhost:5000/api
ML Service:          http://localhost:8000
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register senior + guardian pair |
| POST | `/api/alert/panic` | Trigger PANIC button alert |
| POST | `/api/alert/verify-caller` | Verify caller identity |
| GET | `/api/incidents/:userId` | Fetch incident history |
| POST | `/api/transaction/flag` | Flag suspicious transaction |
| GET | `/api/dashboard/live` | Guardian live dashboard feed |

---

## ⚙️ Environment Variables

### `/server/.env.example`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/gurdianlink360
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
OPENAI_API_KEY=your_openai_key
CLIENT_URL=http://localhost:3000
```

### `/client/.env.example`
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=your_firebase_key
```

---

## 🌿 Branch Strategy

```
main                   ← stable, demo-ready always
└── dev                ← integration branch
    ├── p1-senior-pwa       ← Senior PWA + UI/UX
    ├── p2-guardian-dash    ← Guardian Dashboard
    ├── p3-backend          ← Server + Socket.io + Twilio
    └── p4-ml-service       ← Scam Detection + BankShield
```

---

## 🎯 Live Demo Flow

Our demo tells the story of **Mr. Sharma, 68**, receiving a Digital Arrest scam call:

1. 🔴 Mr. Sharma opens SeniorShield PWA on his phone
2. 📞 Scammer calls — call duration timer starts on Guardian Dashboard
3. 🚨 Mr. Sharma taps **PANIC Button** — dashboard flashes red instantly
4. 📱 Guardian receives **SMS + WhatsApp** alert simultaneously (live Twilio demo)
5. ✅ Mr. Sharma taps **Verify Caller** — system shows *"NO SUCH OFFICER EXISTS"*
6. 💰 Scammer demands transfer — **BankShield flags transaction + cooling begins**
7. 👨‍👩‍👦 Guardian co-authorization required — transfer cannot proceed
8. 📊 Incident logged — ₹3.2 lakh saved

---

## 👥 Team

| Member | Role | Responsibilities |
|---|---|---|
| P1 | Frontend Lead | SeniorShield PWA + UI/UX Design System |
| P2 | Frontend Dev | GuardianLink Dashboard + Charts |
| P3 | Backend Lead | Node.js + Socket.io + Twilio + MongoDB |
| P4 | AI/ML Dev | Scam Detection NLP + BankShield API |

---

## 📊 Impact

| Metric | Value |
|---|---|
| India's 2024 digital arrest losses | ₹11,000 crore |
| Victims who are senior citizens | 67% |
| Average loss per victim | ₹3.2 lakh |
| Target addressable population | 10 crore+ senior citizens |
| Deployment requirement | Smartphone + browser only |
| Hardware needed | None |

---

## 🏆 Hackathon

- **Event:** [Hackathon Name]
- **Topic ID:** 26007 — Digital Arrest Prevention for Senior Citizens
- **Track:** Healthcare / Cybersecurity
- **Team Size:** 4 Members

---

## 📄 License

This project was built for hackathon purposes. All rights reserved by the GurdianLink360 team.

---

<p align="center">
  <b>Built with ❤️ to protect every Indian senior citizen.</b><br/>
  <i>"You are not building an app. You are building a shield."</i>
</p>
