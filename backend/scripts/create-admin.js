/**
 * create-admin.js  —  run: node scripts/create-admin.js
 * Creates (or resets) the default admin account for EventMate.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventmate';

const ADMIN = {
  name: 'EventMate Admin',
  email: 'admin@eventmate.io',
  password: 'Admin@1234',
  role: 'admin',
};

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    const hashed = await bcrypt.hash(ADMIN.password, 12);

    const admin = await User.findOneAndUpdate(
      { email: ADMIN.email },
      { name: ADMIN.name, email: ADMIN.email, password: hashed, role: 'admin', isBlocked: false },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('\n✅ Admin account ready:');
    console.log('   Email   :', ADMIN.email);
    console.log('   Password:', ADMIN.password);
    console.log('   Role    :', admin.role);
    console.log('   ID      :', admin._id.toString());
    console.log('\n   Login at: POST /api/auth/login');
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected');
  }
})();
