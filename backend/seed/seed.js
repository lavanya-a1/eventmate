/**
 * EventMate â€" Master Seed Script
 * Run: node seed/seed.js
 *
 * Creates:
 *  â€¢ 1 admin account          (admin@admin.com / admin)
 *  â€¢ 20 regular user accounts  (user1@user1.com / user1 â€¦ user20@user20.com / user20)
 *  â€¢ 25 events                (14 past  +  11 upcoming, 6 categories)
 *  â€¢ 2â€"6 bookings per user    (confirmed for past, mix for upcoming)
 *  â€¢ 1 payment per booking
 *  â€¢ QR codes for confirmed bookings
 *  â€¢ 40+ feedback entries for past-event bookings
 *  â€¢ Notification per booking + broadcasts
 *  â€¢ System log entries
 *
 * All stats shown in the admin dashboard are computed live from this data.
 */

'use strict';

const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const crypto    = require('crypto');
const path      = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// â"€â"€ Models â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const User         = require('../src/models/User');
const Event        = require('../src/models/Event');
const Booking      = require('../src/models/Booking');
const Payment      = require('../src/models/Payment');
const Feedback     = require('../src/models/Feedback');
const Notification = require('../src/models/Notification');
const Log          = require('../src/models/Log');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventmate';

// â"€â"€ Helpers â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const rand        = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick        = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle     = (arr) => [...arr].sort(() => Math.random() - 0.5);
const uid         = () => crypto.randomBytes(12).toString('hex');
const daysAgo     = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const daysFromNow = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };

// â"€â"€ Static data â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const FEEDBACK_COMMENTS = {
  5: [
    "Absolutely phenomenal event! Every detail was perfectly executed.",
    "Best experience I have had this year -- exceeded every expectation.",
    "World-class speakers and flawless organisation. Will come back next year!",
    "Incredible atmosphere, amazing networking opportunities, loved every minute.",
    "Top-notch production quality. The workshops were truly life-changing.",
    "Beautifully organised. I learned so much and made great connections.",
    "Cannot believe how much value was packed into a single event!",
  ],
  4: [
    "Really well put together. A couple of sessions ran slightly long, but overall great.",
    "Excellent content and engaged crowd. Minor parking issues aside, loved it.",
    "Very informative and well organised. Would recommend to colleagues.",
    "Great event overall -- the keynote was outstanding. Food could be better.",
    "Solid programming and good venue. A few technical hiccups but nothing major.",
    "Really enjoyed it. Registration queue was a bit long but everything else was perfect.",
  ],
  3: [
    "Decent event but felt a bit rushed. Content was good if a little basic.",
    "Average experience. Some sessions were brilliant, others disappointing.",
    "Okay overall. The venue was great but the schedule was poorly managed.",
    "Had potential but felt disorganised in parts. Hope they improve next year.",
    "Some interesting talks but too much filler. Worth attending once.",
  ],
  2: [
    "Disappointing. The advertised speakers cancelled and replacements were not great.",
    "Not what I expected based on the description. Poor time management throughout.",
    "The concept was good but execution was lacking. Will not be returning.",
  ],
  1: [
    "Very disappointing experience. Several sessions were cancelled without notice.",
    "Overcrowded and poorly managed. The venue was completely inadequate.",
  ],
};

const EVENTS_DATA = [
  // â"€â"€ TECHNOLOGY (past + upcoming) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  {
    title: 'Global Tech Summit 2025',
    description: 'Three days of keynotes, workshops and deep-dives with engineers from Google, Meta and Stripe. Topics: AI, cloud, DevOps, and platform engineering.',
    location: 'Moscone Center, San Francisco, CA',
    date: daysAgo(120),
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=70',
    price: 299,
    capacity: 500,
  },
  {
    title: 'AI & Machine Learning Conference',
    description: 'Cutting-edge research in LLMs, computer vision and reinforcement learning. Hands-on labs with real datasets. Ideal for ML engineers and data scientists.',
    location: 'Seattle Convention Center, WA',
    date: daysAgo(90),
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=70',
    price: 249,
    capacity: 400,
  },
  {
    title: 'Web3 & Blockchain Expo',
    description: 'Explore decentralised finance, NFTs, smart contracts and the future of the open internet. Panel discussions and live demos.',
    location: 'Javits Center, New York, NY',
    date: daysAgo(60),
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&q=70',
    price: 199,
    capacity: 350,
  },
  {
    title: 'Cloud & DevOps World 2026',
    description: 'The leading conference for cloud architects and DevOps practitioners. Kubernetes, Terraform, observability and SRE best practices.',
    location: 'O\'Reilly Center, Chicago, IL',
    date: daysFromNow(45),
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=70',
    price: 349,
    capacity: 450,
  },
  {
    title: 'CyberSecurity Summit 2026',
    description: 'Stay ahead of emerging threats. Zero-trust architecture, threat intelligence, penetration testing and incident response workshops.',
    location: 'Hyatt Regency, Washington D.C.',
    date: daysFromNow(90),
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=70',
    price: 279,
    capacity: 300,
  },

  // â"€â"€ MUSIC (past + upcoming) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  {
    title: 'Neon Beats Music Festival',
    description: 'A two-day outdoor festival featuring 40+ artists across five stages. Electronic, indie, hip-hop and live fusion. Food village and art installations.',
    location: 'Centennial Park, Atlanta, GA',
    date: daysAgo(100),
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b4a5a21?w=800&q=70',
    price: 149,
    capacity: 3000,
  },
  {
    title: 'Jazz Under the Stars',
    description: 'An intimate evening celebrating classic and contemporary jazz. Award-winning ensembles perform in an open-air amphitheatre under the night sky.',
    location: 'Millennium Park, Chicago, IL',
    date: daysAgo(45),
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=70',
    price: 89,
    capacity: 600,
  },
  {
    title: 'SoundWave 2026 â€" Summer Edition',
    description: 'The biggest summer music festival on the East Coast. 3 stages, 60 acts, camping, wellness zone and gourmet food trucks.',
    location: 'Meadowlands, East Rutherford, NJ',
    date: daysFromNow(65),
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=70',
    price: 179,
    capacity: 5000,
  },
  {
    title: "Classical Echoes - Orchestra Night",
    description: "The city philharmonic performs Beethoven's 5th and Brahms' Symphony No.4. Black-tie optional. Champagne reception included.",
    location: 'Carnegie Hall, New York, NY',
    date: daysFromNow(30),
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=70',
    price: 120,
    capacity: 800,
  },

  // â"€â"€ CULTURAL (past + upcoming) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  {
    title: 'Heritage Arts & Culture Fair',
    description: 'Celebrating diversity through art, cuisine, dance and storytelling. 80+ exhibitors, live performances, and workshops from 30 cultures.',
    location: 'Golden Gate Park, San Francisco, CA',
    date: daysAgo(75),
    category: 'Cultural',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=70',
    price: 25,
    capacity: 2000,
  },
  {
    title: 'International Film & Storytelling Festival',
    description: 'Showcasing 120 films from 45 countries. Q&A sessions with directors, workshops on cinematography and narrative structure.',
    location: 'Sundance Resort, Park City, UT',
    date: daysAgo(55),
    category: 'Cultural',
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=70',
    price: 75,
    capacity: 700,
  },
  {
    title: 'Global Food & Culture Expo 2026',
    description: 'A celebration of world cuisines, traditions and cultural exchange. Master chef demonstrations, tasting pavilions and cultural performances.',
    location: 'Dallas Convention Center, TX',
    date: daysFromNow(50),
    category: 'Cultural',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=70',
    price: 45,
    capacity: 1500,
  },
  {
    title: 'Modern Art Biennale 2026',
    description: 'The premier contemporary art exhibition featuring 200+ artists from 60 countries. Installations, performance art and collector previews.',
    location: 'MoMA, New York, NY',
    date: daysFromNow(120),
    category: 'Cultural',
    image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&q=70',
    price: 60,
    capacity: 1000,
  },

  // â"€â"€ WORKSHOP (past + upcoming) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  {
    title: 'Full-Stack Development Bootcamp',
    description: 'Intensive 2-day hands-on bootcamp. Build a production-ready app using React, Node.js, MongoDB and cloud deployment. All skill levels welcome.',
    location: 'TechHub, Austin, TX',
    date: daysAgo(80),
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=800&q=70',
    price: 199,
    capacity: 80,
  },
  {
    title: 'Digital Marketing Masterclass',
    description: 'From SEO to paid social, learn the complete digital marketing stack. Growth hacking, analytics, content strategy and conversion optimisation.',
    location: 'WeWork, Los Angeles, CA',
    date: daysAgo(40),
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=70',
    price: 149,
    capacity: 60,
  },
  {
    title: 'UX Design Thinking Workshop',
    description: 'Learn human-centred design methodologies. Prototyping, user research, journey mapping and usability testing in a hands-on studio setting.',
    location: 'Design Hub, San Francisco, CA',
    date: daysFromNow(20),
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=70',
    price: 169,
    capacity: 50,
  },
  {
    title: 'Data Science & Analytics Workshop',
    description: 'Practical data science using Python, pandas and scikit-learn. EDA, feature engineering, model building and deployment to production.',
    location: 'Innovation Lab, Boston, MA',
    date: daysFromNow(35),
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=70',
    price: 229,
    capacity: 70,
  },
  {
    title: 'Entrepreneurship & Startup Launchpad',
    description: 'Two days of intensive founder training. Business model canvassing, pitch practice, investor Q&As and legal frameworks for early-stage companies.',
    location: 'Accelerator Hub, Miami, FL',
    date: daysFromNow(75),
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=70',
    price: 249,
    capacity: 90,
  },

  // â"€â"€ SPORTS (past + upcoming) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  {
    title: 'Urban Marathon 2025',
    description: 'A certified 42.2 km city marathon through iconic neighbourhoods. Categories for elite, amateur and first-timers. Medal and finisher t-shirt included.',
    location: 'Downtown Boston, MA',
    date: daysAgo(110),
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=70',
    price: 85,
    capacity: 10000,
  },
  {
    title: 'CrossFit Open Championships',
    description: 'Regional CrossFit qualifier event. Athletes compete across 5 WODs over 2 days. Spectators free. Online streaming available.',
    location: 'Athletics Arena, Denver, CO',
    date: daysAgo(50),
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=70',
    price: 55,
    capacity: 500,
  },
  {
    title: 'Coastal Triathlon Challenge 2026',
    description: 'Olympic-distance triathlon: 1.5 km swim, 40 km cycle, 10 km run. Stunning coastal course. Age-group categories from 18â€"75+.',
    location: 'Virginia Beach, VA',
    date: daysFromNow(55),
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=70',
    price: 110,
    capacity: 800,
  },
  {
    title: 'National E-Sports Tournament',
    description: 'Compete in League of Legends, Valorant and FIFA. Prize pool $50,000. Live broadcast and in-venue spectator experience.',
    location: 'Convention Center, Las Vegas, NV',
    date: daysFromNow(40),
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=70',
    price: 79,
    capacity: 600,
  },

  // â"€â"€ EDUCATION (past + upcoming) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  {
    title: 'EdTech Innovation Summit',
    description: 'Shaping the future of education. E-learning platforms, AI tutors, gamification and outcomes-based learning for K-12 and higher education.',
    location: 'Marriott Hotel, Phoenix, AZ',
    date: daysAgo(95),
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=70',
    price: 159,
    capacity: 400,
  },
  {
    title: 'STEM Fair for Schools 2026',
    description: 'Interactive science, technology, engineering and math showcase for students aged 12â€"18. Live experiments, robotics demos and university talks.',
    location: 'Science Museum, Houston, TX',
    date: daysFromNow(25),
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=70',
    price: 15,
    capacity: 1200,
  },
  {
    title: 'Higher Education Leadership Forum',
    description: 'University presidents, deans and policy makers explore strategic challenges: student success, research funding, diversity and digital transformation.',
    location: 'Georgetown University, Washington D.C.',
    date: daysFromNow(85),
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=70',
    price: 199,
    capacity: 250,
  },
];

// -- Boot -----------------------------------------------------------------------
async function main() {
  console.log('\n  EventMate Seed Script\n' + '-'.repeat(50));
  await mongoose.connect(MONGO_URI);
  console.log('[OK] Connected to MongoDB:', MONGO_URI.replace(/\/\/.*@/, '//***@'));

  // -- 1. Clear all collections ------------------------------------------------
  console.log('\n[1] Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({}),
    Feedback.deleteMany({}),
    Notification.deleteMany({}),
    Log.deleteMany({}),
  ]);
  console.log('    All collections cleared.');

  // -- 2. Create admin ---------------------------------------------------------
  console.log('\n[2] Creating admin account...');
  const adminPassword = await bcrypt.hash('admin', 12);
  const admin = await User.create({
    name: 'EventMate Admin',
    email: 'admin@admin.com',
    password: adminPassword,
    role: 'admin',
    phone: '+1-800-000-0001',
    bio: 'Platform administrator for EventMate.',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Admin&backgroundColor=7c3aed`,
  });
  console.log(`    [OK] admin@admin.com / admin  (id: ${admin._id})`);

  // -- 3. Create 20 regular users ----------------------------------------------
  console.log('\n[3] Creating 20 user accounts...');
  const FIRST_NAMES = ['Alex','Jordan','Morgan','Taylor','Casey','Riley','Jamie','Avery','Quinn','Peyton','Drew','Cameron','Blake','Reese','Sage','Skyler','Dakota','Emerson','Finley','Hayden'];
  const LAST_NAMES  = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Lee','Walker'];

  const userDocs = [];
  for (let i = 1; i <= 20; i++) {
    const slug = `user${i}`;
    const hashed = await bcrypt.hash(slug, 10);
    userDocs.push({
      name: `${FIRST_NAMES[i-1]} ${LAST_NAMES[i-1]}`,
      email: `${slug}@${slug}.com`,
      password: hashed,
      role: 'user',
      phone: `+1-555-${String(1000 + i).padStart(4,'0')}`,
      bio: `Passionate event-goer and community member. Account: ${slug}`,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${FIRST_NAMES[i-1]}%20${LAST_NAMES[i-1]}&backgroundColor=${['7c3aed','4f46e5','0891b2','059669','d97706'][i%5]}`,
    });
  }
  const users = await User.insertMany(userDocs);
  console.log('    [OK] user1@user1.com/user1 ... user20@user20.com/user20');

  // -- 4. Create 25 events -----------------------------------------------------
  console.log('\n[4] Creating 25 events...');
  const eventDocs = EVENTS_DATA.map((e) => ({
    ...e,
    organizer: admin._id,
    status: 'active',
    bookedSeats: 0,
    isDeleted: false,
  }));
  const events = await Event.insertMany(eventDocs);

  const pastEvents    = events.filter(e => e.date < new Date());
  const futureEvents  = events.filter(e => e.date >= new Date());
  console.log(`    [OK] ${events.length} events  (${pastEvents.length} past, ${futureEvents.length} upcoming)`);

  // -- 5. Generate bookings, payments, QR codes --------------------------------
  console.log('\n[5] Generating bookings & payments...');

  const allBookings    = [];
  const bookingPayload = [];   // { booking, payment }
  const userEventMap   = new Set(); // "userId-eventId" to avoid duplicates

  for (const user of users) {
    const bookingCount = rand(2, 6);
    const poolEvents   = shuffle([...pastEvents, ...futureEvents]).slice(0, bookingCount + 4);

    let created = 0;
    for (const event of poolEvents) {
      if (created >= bookingCount) break;

      const key = `${user._id}-${event._id}`;
      if (userEventMap.has(key)) continue;
      userEventMap.add(key);

      // Skip if event is full
      if (event.bookedSeats >= event.capacity) continue;

      const isPast  = event.date < new Date();
      const seats   = rand(1, Math.min(3, event.capacity - event.bookedSeats));
      const amount  = parseFloat((event.price * seats).toFixed(2));

      // Determine statuses
      const bookingStatus  = isPast ? 'confirmed' : (Math.random() > 0.15 ? 'confirmed' : 'pending');
      const paymentStatus  = bookingStatus === 'confirmed' ? 'success' : 'pending';
      const checkedIn      = isPast && bookingStatus === 'confirmed' && Math.random() > 0.35;

      // Generate QR code string (we store the hash, not an actual image)
      const qrCode = bookingStatus === 'confirmed' ? `QR-${uid().toUpperCase()}` : undefined;

      // Back-date createdAt near event date for past events
      const createdAt = isPast
        ? new Date(event.date.getTime() - rand(3, 30) * 24 * 60 * 60 * 1000)
        : new Date(Date.now() - rand(0, 14) * 24 * 60 * 60 * 1000);

      const booking = {
        user:        user._id,
        event:       event._id,
        status:      bookingStatus,
        seats,
        amount,
        qrCode,
        checkedIn,
        checkedInAt: checkedIn ? new Date(event.date.getTime() + rand(0, 60) * 60 * 1000) : undefined,
        createdAt,
        updatedAt:   createdAt,
      };

      // Transaction ID: unique per payment
      const txn = `TXN-${uid().toUpperCase()}`;

      const payment = {
        user:          user._id,
        event:         event._id,
        amount,
        status:        paymentStatus,
        transactionId: txn,
        paymentMethod: pick(['Card', 'UPI', 'Wallet', 'Net Banking', 'Simulation']),
        createdAt,
        updatedAt: createdAt,
      };

      // Increment bookedSeats on the in-memory event object
      event.bookedSeats += seats;

      allBookings.push({ booking, payment, user, event, isPast, bookingStatus });
      created++;
    }
  }

  // Persist bookings (with timestamps bypass)
  const insertedBookings = await Booking.insertMany(
    allBookings.map(b => b.booking),
    { timestamps: false }
  );

  // Link payments to booking IDs and insert
  const paymentDocs = allBookings.map((b, i) => ({
    ...b.payment,
    booking: insertedBookings[i]._id,
  }));
  await Payment.insertMany(paymentDocs, { timestamps: false });

  // Update bookedSeats per event in DB
  const seatMap = {};
  for (const { booking } of allBookings) {
    const id = booking.event.toString();
    seatMap[id] = (seatMap[id] || 0) + booking.seats;
  }
  await Promise.all(
    Object.entries(seatMap).map(([id, seats]) =>
      Event.findByIdAndUpdate(id, { $set: { bookedSeats: seats } })
    )
  );

  console.log(`    [OK] ${insertedBookings.length} bookings created`);
  console.log(`    [OK] ${paymentDocs.length} payments created`);

  // -- 6. Feedback for past confirmed bookings ---------------------------------
  console.log('\n[6] Generating feedback...');

  const feedbackDocs = [];
  const pastConfirmed = allBookings.filter(b => b.isPast && b.bookingStatus === 'confirmed');

  // ~80% of past attendees leave feedback
  for (const b of pastConfirmed) {
    if (Math.random() > 0.80) continue;

    // Weighted rating: 5=30%, 4=35%, 3=20%, 2=10%, 1=5%
    const ratingRoll = Math.random();
    const rating = ratingRoll < 0.30 ? 5 :
                   ratingRoll < 0.65 ? 4 :
                   ratingRoll < 0.85 ? 3 :
                   ratingRoll < 0.95 ? 2 : 1;

    const status = Math.random() > 0.15 ? 'approved' : 'pending';

    feedbackDocs.push({
      user:    b.user._id,
      event:   b.event._id,
      rating,
      comment: pick(FEEDBACK_COMMENTS[rating]),
      status,
      createdAt: new Date(b.event.date.getTime() + rand(1, 10) * 24 * 60 * 60 * 1000),
    });
  }

  // Pad to at least 40 if we are short
  let attempt = 0;
  while (feedbackDocs.length < 40 && attempt < 200) {
    attempt++;
    const b = pick(pastConfirmed);
    if (!b) break;
    const ratingRoll = Math.random();
    const rating = ratingRoll < 0.30 ? 5 : ratingRoll < 0.65 ? 4 : ratingRoll < 0.85 ? 3 : ratingRoll < 0.95 ? 2 : 1;
    feedbackDocs.push({
      user:    b.user._id,
      event:   b.event._id,
      rating,
      comment: pick(FEEDBACK_COMMENTS[rating]),
      status:  'approved',
      createdAt: new Date(b.event.date.getTime() + rand(1, 10) * 24 * 60 * 60 * 1000),
    });
  }

  // Deduplicate user+event combos (one feedback per user per event)
  const seen = new Set();
  const dedupedFeedback = feedbackDocs.filter(f => {
    const key = `${f.user}-${f.event}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  await Feedback.insertMany(dedupedFeedback, { timestamps: false });
  console.log(`    [OK] ${dedupedFeedback.length} feedback entries`);

  // -- 7. Notifications --------------------------------------------------------
  console.log('\n[7] Generating notifications...');

  const notifDocs = [];
  const now = new Date();

  // a) Booking confirmation per confirmed booking
  for (let i = 0; i < insertedBookings.length; i++) {
    const src = allBookings[i];
    if (src.bookingStatus !== 'confirmed') continue;

    notifDocs.push({
      user:    src.user._id,
      title:   'Booking Confirmed',
      message: `Your booking for "${src.event.title}" (${src.booking.seats} seat${src.booking.seats > 1 ? 's' : ''}) is confirmed. Amount paid: $${src.booking.amount}.`,
      type:    'transactional',
      isRead:  src.isPast ? Math.random() > 0.2 : Math.random() > 0.6,
      status:  'sent',
      sentAt:  src.booking.createdAt,
      createdAt: src.booking.createdAt,
    });
  }

  // b) Reminder for upcoming confirmed bookings (events in next 7 days)
  const soon = new Date(); soon.setDate(soon.getDate() + 7);
  for (const { booking, user: u, event: ev, bookingStatus, isPast } of allBookings) {
    if (isPast || bookingStatus !== 'confirmed') continue;
    if (ev.date > soon) continue;
    notifDocs.push({
      user:    u._id,
      title:   `Reminder: "${ev.title}" is coming up!`,
      message: `Don't forget your upcoming event on ${ev.date.toDateString()} at ${ev.location}. Please bring your QR ticket.`,
      type:    'reminder',
      isRead:  false,
      status:  'sent',
      sentAt:  new Date(),
      createdAt: new Date(),
    });
  }

  // c) Platform broadcast to everyone
  const broadcastTitle   = 'Welcome to EventMate 2026!';
  const broadcastMessage = 'Exciting new events have been added across Technology, Music, Sports and more. Explore, book and enjoy - all in one place!';
  for (const u of users) {
    notifDocs.push({
      user:        u._id,
      title:       broadcastTitle,
      message:     broadcastMessage,
      type:        'broadcast',
      isBroadcast: true,
      audience:    'all',
      isRead:      Math.random() > 0.5,
      status:      'sent',
      sentAt:      new Date(now.getTime() - rand(1, 5) * 24 * 60 * 60 * 1000),
      createdAt:   new Date(now.getTime() - rand(1, 5) * 24 * 60 * 60 * 1000),
    });
  }

  // d) Payment receipt transactional
  for (let i = 0; i < insertedBookings.length; i++) {
    const src = allBookings[i];
    if (src.bookingStatus !== 'confirmed' || !src.isPast) continue;

    notifDocs.push({
      user:    src.user._id,
      title:   'Payment Received',
      message: `$${src.booking.amount} received for "${src.event.title}". Transaction ID: ${paymentDocs[i].transactionId}.`,
      type:    'transactional',
      isRead:  true,
      status:  'sent',
      sentAt:  src.booking.createdAt,
      createdAt: src.booking.createdAt,
    });
  }

  await Notification.insertMany(notifDocs, { timestamps: false });
  console.log(`    [OK] ${notifDocs.length} notifications`);

  // -- 8. System logs ----------------------------------------------------------
  console.log('\n[8] Generating system logs...');

  const LOG_MESSAGES = [
    { level: 'info',  module: 'Auth',      message: 'User login successful' },
    { level: 'info',  module: 'Bookings',  message: '[POST] /api/admin/bookings - admin confirmed booking' },
    { level: 'info',  module: 'Events',    message: '[POST] /api/admin/events - New event created' },
    { level: 'info',  module: 'Payments',  message: 'Payment processed successfully via Stripe simulation' },
    { level: 'info',  module: 'QR',        message: 'QR ticket validated successfully' },
    { level: 'warn',  module: 'Auth',      message: 'Failed login attempt - invalid credentials' },
    { level: 'warn',  module: 'Bookings',  message: 'Booking cancellation requested within 24h of event' },
    { level: 'warn',  module: 'Events',    message: 'Event capacity at 90% - threshold reached' },
    { level: 'error', module: 'Payments',  message: 'Payment gateway timeout - retrying transaction' },
    { level: 'error', module: 'Email',     message: 'Failed to send confirmation email - SMTP error' },
    { level: 'debug', module: 'System',    message: 'DB connection pool stats: active=5 idle=15' },
    { level: 'info',  module: 'Users',     message: '[PATCH] /api/admin/users - User role updated' },
    { level: 'info',  module: 'Feedback',  message: 'Feedback entry approved by admin' },
    { level: 'warn',  module: 'Security',  message: 'Rate limit threshold approached from IP 192.168.1.45' },
    { level: 'info',  module: 'Cron',      message: 'Scheduled reminder job executed - 3 reminders sent' },
  ];

  const logDocs = [];
  for (let i = 0; i < 60; i++) {
    const template = pick(LOG_MESSAGES);
    const createdAt = new Date(now.getTime() - rand(0, 30) * 24 * 60 * 60 * 1000);
    logDocs.push({
      ...template,
      userId:    Math.random() > 0.4 ? pick(users)._id : admin._id,
      ip:        `192.168.${rand(1,10)}.${rand(1,254)}`,
      userAgent: pick(['Mozilla/5.0 (Windows NT 10.0; Win64)', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'PostmanRuntime/7.36.0']),
      createdAt,
      updatedAt: createdAt,
    });
  }
  await Log.insertMany(logDocs, { timestamps: false });
  console.log(`    [OK] ${logDocs.length} log entries`);

  // -- 9. Summary --------------------------------------------------------------
  const [
    totalUsers, totalEvents, totalBookings, totalPayments,
    totalFeedback, totalNotifs, totalLogs,
    revenueAgg,
  ] = await Promise.all([
    User.countDocuments(),
    Event.countDocuments(),
    Booking.countDocuments({ status: 'confirmed' }),
    Payment.countDocuments({ status: 'success' }),
    Feedback.countDocuments(),
    Notification.countDocuments(),
    Log.countDocuments(),
    Payment.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);

  console.log('\n' + '='.repeat(50));
  console.log('Seeding complete!\n');
  console.log('  Users:              ', totalUsers, '(1 admin + 20 users)');
  console.log('  Events:             ', totalEvents, `(${pastEvents.length} past + ${futureEvents.length} upcoming)`);
  console.log('  Confirmed bookings: ', totalBookings);
  console.log('  Successful payments:', totalPayments);
  console.log('  Total revenue:      $' + (revenueAgg[0]?.total || 0).toFixed(2));
  console.log('  Feedback entries:   ', totalFeedback);
  console.log('  Notifications:      ', totalNotifs);
  console.log('  Log entries:        ', totalLogs);
  console.log('\n  -- Admin login --');
  console.log('  URL:      http://localhost:5173/login');
  console.log('  Email:    admin@admin.com');
  console.log('  Password: admin');
  console.log('\n  -- Sample user logins --');
  console.log('  user1@user1.com   / user1');
  console.log('  user2@user2.com   / user2');
  console.log('  ...up to...');
  console.log('  user20@user20.com / user20');
  console.log('='.repeat(50) + '\n');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});

