/**
 * seed.js — GurdianLink360 Demo Data Seeder
 * Run: node seed.js
 * Creates Mr. Sharma (senior) + Anil Sharma (guardian) for the live demo
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gurdianlink360';

// ── User Schema (inline so we don't need to import) ──────────────────────────
const userSchema = new mongoose.Schema({
  name:               { type: String, required: true },
  phone:              { type: String, required: true, unique: true },
  role:               { type: String, enum: ['senior', 'guardian'], required: true },
  guardianPhone:      { type: String, default: null },
  linkedSeniorPhone:  { type: String, default: null },
  createdAt:          { type: Date, default: Date.now },
});
const User = mongoose.model('User', userSchema);

// ── Demo Users ────────────────────────────────────────────────────────────────
const DEMO_USERS = [
  {
    name: 'Ramesh Sharma',
    phone: '+919876543210',          // Senior login phone
    role: 'senior',
    guardianPhone: '+919999888877',  // Linked to Anil Sharma
    linkedSeniorPhone: null,
  },
  {
    name: 'Anil Sharma',
    phone: '+919999888877',          // Guardian login phone
    role: 'guardian',
    guardianPhone: null,
    linkedSeniorPhone: '+919876543210',
  },
  {
    name: 'Sunita Patel',
    phone: '+918765432109',          // Second senior for demo variety
    role: 'senior',
    guardianPhone: '+919111222333',
    linkedSeniorPhone: null,
  },
  {
    name: 'Priya Patel',
    phone: '+919111222333',          // Second guardian
    role: 'guardian',
    guardianPhone: null,
    linkedSeniorPhone: '+918765432109',
  },
];

async function seed() {
  console.log('\n🌱 GurdianLink360 — Database Seeder\n');
  console.log(`📡 Connecting to: ${MONGODB_URI}\n`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    let created = 0;
    let skipped = 0;

    for (const userData of DEMO_USERS) {
      const existing = await User.findOne({ phone: userData.phone });

      if (existing) {
        console.log(`⏭  Skipped (already exists): ${userData.name} (${userData.phone})`);
        skipped++;
      } else {
        await User.create(userData);
        console.log(`✅ Created ${userData.role.toUpperCase()}: ${userData.name} (${userData.phone})`);
        created++;
      }
    }

    console.log(`\n📊 Summary: ${created} created, ${skipped} skipped\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯  DEMO LOGIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👴  Senior PWA     → Phone: +91 98765 43210');
    console.log('👨  Guardian Dash  → Phone: +91 99998 88877');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👴  Senior 2       → Phone: +91 87654 32109');
    console.log('👩  Guardian 2     → Phone: +91 91112 22333');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 Use any of the above numbers to request OTP and log in.\n');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB.\n');
  }
}

seed();
