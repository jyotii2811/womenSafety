const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: 'admin@womensafety.com' });
  if (existing) {
    console.log('Admin already exists!');
    console.log('Email   : admin@womensafety.com');
    console.log('Password: Admin@123');
    process.exit();
  }

  await User.create({
    name: 'Super Admin',
    email: 'admin@womensafety.com',
    password: 'Admin@123',
    role: 'admin',
    phone: '9999999999',
  });

  console.log('✅ Admin created successfully!');
  console.log('Email   : admin@womensafety.com');
  console.log('Password: Admin@123');
  process.exit();
};

createAdmin().catch((err) => { console.error(err); process.exit(1); });
