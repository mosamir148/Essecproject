const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/essec_projects';

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get admin details from command line arguments
    const args = process.argv.slice(2);
    if (args.length < 3) {
      console.log('Usage: node createAdmin.js <email> <password> <name>');
      console.log('Example: node createAdmin.js admin@example.com password123 "Admin Name"');
      process.exit(1);
    }

    const [email, password, name] = args;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log(`Admin with email ${email} already exists!`);
      process.exit(1);
    }

    // Create new admin
    const admin = new Admin({ "email": "admin@essec.edu", "password": "admin123", "name": "Admin" });
    await admin.save();

    console.log('✅ Admin created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Name: ${name}`);
    console.log('\nYou can now login at http://localhost:3001/admin/login');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();

