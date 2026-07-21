const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const users = [
  {
    name: process.env.ADMIN_NAME1,
    email: process.env.ADMIN_EMAIL1,
    password: process.env.ADMIN_PASS,
    role: process.env.ADMIN_ROLE
  },
  {
    name: process.env.ADMIN_NAME2,
    email: process.env.ADMIN_EMAIL2,
    password: process.env.ADMIN_PASS,
    role: process.env.ADMIN_ROLE
  }
];

const importData = async () => {
  try {
    await User.deleteMany(); // Clear existing users

    await User.create(users);

    console.log('Data Imported!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
