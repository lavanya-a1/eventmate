const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Event = require('../src/models/Event');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventmate';
// Using the ID found earlier
const ORGANIZER_ID = '699c4c75ac2163aab43056cd5';

const seedEvents = async () => {
    try {
        console.log('Using MONGO_URI:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Check if we already have upcoming events
        const now = new Date();
        const upcomingCount = await Event.countDocuments({ date: { $gt: now } });
        console.log('Current upcoming events count:', upcomingCount);

        if (upcomingCount === 0) {
            console.log('No upcoming events found. Seeding new data...');

            const events = [
                {
                    title: 'Global Tech Summit 2026',
                    description: 'A gathering of the worlds most innovative minds in technology.',
                    location: 'San Francisco, CA',
                    date: new Date('2026-06-15T10:00:00Z'),
                    category: 'Technology',
                    capacity: 500,
                    organizer: ORGANIZER_ID
                },
                {
                    title: 'Future of AI Workshop',
                    description: 'Hands-on workshop on the latest AI frameworks and tools.',
                    location: 'Remote',
                    date: new Date('2026-07-20T15:00:00Z'),
                    category: 'Education',
                    capacity: 200,
                    organizer: ORGANIZER_ID
                },
                {
                    title: 'Music & Arts Festival',
                    description: 'Celebrating local and international artists and musicians.',
                    location: 'Austin, TX',
                    date: new Date('2026-08-05T12:00:00Z'),
                    category: 'Entertainment',
                    capacity: 1000,
                    organizer: ORGANIZER_ID
                },
                {
                    title: 'Photography Workshop',
                    description: 'Master the art of visual storytelling with professional photographers.',
                    location: 'Downtown Studio',
                    date: new Date('2026-09-12T10:00:00Z'),
                    category: 'Arts',
                    capacity: 50,
                    organizer: ORGANIZER_ID
                },
                {
                    title: 'Web Dev Conference 2025',
                    description: 'Exploring the latest trends in web development.',
                    location: 'New York, NY',
                    date: new Date('2025-11-10T09:00:00Z'), // Past event
                    category: 'Technology',
                    capacity: 300,
                    bookedSeats: 300,
                    organizer: ORGANIZER_ID
                },
                {
                    title: 'Digital Marketing Expo 2025',
                    description: 'Learn the latest strategies in digital marketing.',
                    location: 'London, UK',
                    date: new Date('2025-10-15T10:00:00Z'), // Past event
                    category: 'Marketing',
                    capacity: 250,
                    bookedSeats: 250,
                    organizer: ORGANIZER_ID
                }
            ];

            await Event.insertMany(events);
            console.log('Successfully seeded events!');
        } else {
            console.log('Upcoming events already exist. Skipping seed.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding events:', error);
        process.exit(1);
    }
};

seedEvents();
