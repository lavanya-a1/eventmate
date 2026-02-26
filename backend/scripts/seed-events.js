/**
 * seed-events.js  —  run: node scripts/seed-events.js
 * Creates a seed organizer account (if needed) and inserts 24 realistic events.
 * Safe to re-run: deletes old seeded events first.
 */
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const path     = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Event = require('../src/models/Event');
const User  = require('../src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventmate';

// ── helpers ──────────────────────────────────────────────────────────────────
const future = (daysFromNow, hour = 10) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hour, 0, 0, 0);
    return d;
};

// ── seed data ─────────────────────────────────────────────────────────────────
const EVENTS = [
    // Technology
    {
        title: 'Global Tech Summit 2026',
        description: 'Join 500+ engineers, founders and CTOs for three days of talks, workshops and networking. Explore AI, cloud computing, DevOps and the future of software development. Keynotes by leaders from Google, Meta and Stripe.',
        location: 'Moscone Center, San Francisco, CA',
        date: future(30, 9),
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=70',
        price: 299,
        capacity: 500,
        bookedSeats: 312,
    },
    {
        title: 'AI & Machine Learning Conference',
        description: 'A deep-dive into cutting-edge research in large language models, computer vision and reinforcement learning. Hands-on labs included. Ideal for ML engineers and data scientists.',
        location: 'ExCeL London, UK',
        date: future(45, 10),
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=70',
        price: 199,
        capacity: 350,
        bookedSeats: 210,
    },
    {
        title: 'Web Dev Workshop: React & Next.js',
        description: 'Full-day hands-on workshop covering React 19, Next.js 15 App Router, server components and modern deployment strategies. Bring your laptop!',
        location: 'TechHub, Austin, TX',
        date: future(18, 9),
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1587620962725-abab19836100?w=800&q=70',
        price: 79,
        capacity: 60,
        bookedSeats: 55,
    },
    {
        title: 'Cybersecurity Summit 2026',
        description: 'Explore the latest threats, zero-trust architectures and real-world incident response strategies with security experts from Fortune 500 companies and government agencies.',
        location: 'Washington D.C., USA',
        date: future(60, 8),
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=70',
        price: 149,
        capacity: 200,
        bookedSeats: 88,
    },
    {
        title: 'Women in Tech Networking Evening',
        description: 'Monthly networking event celebrating women in technology. Hear from inspiring speakers, connect with mentors and discover new opportunities in a welcoming space.',
        location: 'Google Campus, New York, NY',
        date: future(9, 18),
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=70',
        price: 0,
        capacity: 120,
        bookedSeats: 98,
    },
    {
        title: 'Startup Pitch Night',
        description: "Eight hand-picked early-stage startups pitch live to a panel of VCs and angel investors. Audience votes for the people's choice prize. Networking drinks after.",
        location: 'Campus London, UK',
        date: future(5, 17),
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=70',
        price: 25,
        capacity: 180,
        bookedSeats: 162,
    },

    // Education
    {
        title: 'Future of Learning Summit',
        description: 'Educators, edtech founders and policy makers come together to shape education. Sessions on personalised learning, AI tutors and modern curriculum design.',
        location: 'Harvard Kennedy School, Boston, MA',
        date: future(22, 9),
        category: 'Education',
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=70',
        price: 0,
        capacity: 300,
        bookedSeats: 178,
    },
    {
        title: 'Public Speaking Masterclass',
        description: 'Transform your communication skills with world-class coaches. Learn storytelling frameworks, body language secrets and how to command any room from 10 to 10,000 people.',
        location: 'The Grand Hall, Chicago, IL',
        date: future(14, 10),
        category: 'Education',
        image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=70',
        price: 49,
        capacity: 100,
        bookedSeats: 67,
    },
    {
        title: 'Data Science Bootcamp',
        description: 'Intensive two-day bootcamp covering Python, pandas, matplotlib, scikit-learn and building your first ML pipeline. All skill levels welcome.',
        location: 'Online (Live Stream)',
        date: future(10, 9),
        category: 'Education',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=70',
        price: 99,
        capacity: 150,
        bookedSeats: 143,
    },

    // Entertainment
    {
        title: 'Neon Nights Music Festival',
        description: 'Three stages, 30 artists, one unforgettable weekend. Featuring indie, electronic and hip-hop acts from around the globe. Food trucks, art installations and late-night sets.',
        location: 'Zilker Park, Austin, TX',
        date: future(50, 16),
        category: 'Entertainment',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=70',
        price: 129,
        capacity: 5000,
        bookedSeats: 3420,
    },
    {
        title: 'Stand-Up Comedy Night',
        description: 'An evening of laughs featuring five headline comedians and two surprise special guests. Doors open at 7 PM, show starts at 8 PM. Dinner and drinks available.',
        location: 'The Comedy Store, Los Angeles, CA',
        date: future(8, 19),
        category: 'Entertainment',
        image: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=800&q=70',
        price: 45,
        capacity: 200,
        bookedSeats: 190,
    },
    {
        title: 'Symphony Under the Stars',
        description: 'The city philharmonic performs Beethoven, Mozart and Tchaikovsky under the open sky. Bring a blanket and picnic. Free admission, first-come first-served seating.',
        location: 'Millennium Park, Chicago, IL',
        date: future(35, 20),
        category: 'Entertainment',
        image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=70',
        price: 0,
        capacity: 2000,
        bookedSeats: 650,
    },

    // Arts
    {
        title: 'Urban Photography Workshop',
        description: 'Spend a full day with professional photographers shooting the city. Learn composition, lighting and post-processing. All camera levels welcome.',
        location: 'Brooklyn, New York, NY',
        date: future(12, 7),
        category: 'Arts',
        image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=70',
        price: 89,
        capacity: 25,
        bookedSeats: 18,
    },
    {
        title: 'Modern Art Exhibition Opening',
        description: 'Opening night gala for a new contemporary art exhibition featuring 40 works by emerging artists from 12 countries. Includes wine reception and artist Q&A.',
        location: 'MoMA, New York, NY',
        date: future(7, 18),
        category: 'Arts',
        image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&q=70',
        price: 35,
        capacity: 150,
        bookedSeats: 120,
    },
    {
        title: 'Watercolour Painting Class',
        description: 'A relaxing Sunday afternoon learning the fundamentals of watercolour painting. All materials provided. No experience necessary.',
        location: 'The Art Loft, Seattle, WA',
        date: future(20, 13),
        category: 'Arts',
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=70',
        price: 55,
        capacity: 20,
        bookedSeats: 14,
    },

    // Marketing
    {
        title: 'Growth Marketing Summit',
        description: 'Learn the exact growth playbooks used by Airbnb, Uber and Slack to acquire millions of users. Talks on SEO, paid acquisition, lifecycle marketing and product-led growth.',
        location: 'The Javits Center, New York, NY',
        date: future(40, 9),
        category: 'Marketing',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=70',
        price: 179,
        capacity: 400,
        bookedSeats: 231,
    },
    {
        title: 'Social Media Masterclass 2026',
        description: 'Master short-form video, brand storytelling and community building across TikTok, Instagram and YouTube. Live account audits, Q&A and template library included.',
        location: 'Online (Live Stream)',
        date: future(16, 14),
        category: 'Marketing',
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=70',
        price: 0,
        capacity: 1000,
        bookedSeats: 784,
    },
    {
        title: 'Content Creator Meetup',
        description: 'Casual in-person meetup for YouTubers, podcasters, bloggers and newsletter writers. Share experiences, collab ideas and build your creative network over drinks.',
        location: 'WeWork, San Francisco, CA',
        date: future(6, 18),
        category: 'Marketing',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=70',
        price: 0,
        capacity: 80,
        bookedSeats: 72,
    },

    // Sports
    {
        title: 'City Marathon 2026',
        description: 'The annual city marathon with 5K, 10K, half and full marathon categories. Scenic route through downtown, finisher medals, live band checkpoints and recovery expo.',
        location: 'Central Park, New York, NY',
        date: future(55, 7),
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&q=70',
        price: 65,
        capacity: 10000,
        bookedSeats: 7820,
    },
    {
        title: 'CrossFit Open Qualifier',
        description: 'Regional qualifier for the CrossFit Open. Compete across three workouts judged by certified coaches. Spectators welcome free of charge. Register your team or go individual.',
        location: 'Iron Fitness Center, Miami, FL',
        date: future(28, 8),
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=70',
        price: 40,
        capacity: 300,
        bookedSeats: 145,
    },
    {
        title: 'Weekend Yoga Retreat',
        description: 'Two days of sunrise yoga, meditation, breathwork and sound healing at a mountain resort. All levels welcome. Accommodation, organic meals and workshops included.',
        location: 'Blue Ridge Mountains, NC',
        date: future(42, 6),
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=70',
        price: 249,
        capacity: 40,
        bookedSeats: 29,
    },

    // Health
    {
        title: 'Mental Health & Wellness Expo',
        description: 'A full day of talks, workshops and exhibitors focused on mental health, stress management, sleep science and workplace wellbeing. Free therapy taster sessions available.',
        location: 'Excel Center, London, UK',
        date: future(25, 9),
        category: 'Health',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=70',
        price: 0,
        capacity: 600,
        bookedSeats: 421,
    },
    {
        title: 'Nutrition & Longevity Summit',
        description: 'Science-backed talks from leading nutritionists, doctors and biohackers on diet, fasting, sleep and supplementation for a longer, healthier life.',
        location: 'Marriott Marquis, San Diego, CA',
        date: future(38, 9),
        category: 'Health',
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=70',
        price: 120,
        capacity: 250,
        bookedSeats: 187,
    },
    {
        title: 'First Aid & CPR Certification',
        description: 'AHA-certified full-day first aid and CPR training. Includes AED use and choking response. Certificate issued on completion. Perfect for teams, parents and caregivers.',
        location: 'Community Health Center, Dallas, TX',
        date: future(15, 8),
        category: 'Health',
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=70',
        price: 60,
        capacity: 30,
        bookedSeats: 24,
    },
];

// ── main ──────────────────────────────────────────────────────────────────────
const seed = async () => {
    try {
        console.log('Connecting to', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('Connected.\n');

        // 1. Get or create the seeder organizer account
        let organizer = await User.findOne({ email: 'organizer@eventmate.dev' });
        if (!organizer) {
            const hashed = await bcrypt.hash('Organizer@123', 10);
            organizer = await User.create({
                name: 'EventMate Organizer',
                email: 'organizer@eventmate.dev',
                password: hashed,
                role: 'organizer',
            });
            console.log('Created organizer account:', organizer.email);
        } else {
            console.log('Using existing organizer:', organizer.email);
        }

        // 2. Wipe all old seeded events
        const { deletedCount } = await Event.deleteMany({ organizer: organizer._id });
        console.log(`Removed ${deletedCount} old seeded events.`);

        // 3. Insert fresh events
        const docs = EVENTS.map(e => ({ ...e, organizer: organizer._id }));
        const inserted = await Event.insertMany(docs);
        console.log(`\n✅  Inserted ${inserted.length} events:\n`);

        const counts = {};
        inserted.forEach(e => { counts[e.category] = (counts[e.category] || 0) + 1; });
        Object.entries(counts).forEach(([cat, n]) => {
            console.log(`   ${cat.padEnd(16)} ${n} events`);
        });

        console.log('\nOrganizer credentials:');
        console.log('  Email   : organizer@eventmate.dev');
        console.log('  Password: Organizer@123\n');

        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    }
};

seed();


