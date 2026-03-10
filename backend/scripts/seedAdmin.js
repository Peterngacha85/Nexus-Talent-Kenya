const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@nexustalent.co.ke';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Nexus2024';

        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log(`Admin user (${adminEmail}) already exists`);
            process.exit(0);
        }

        const adminUser = new User({
            name: 'System Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            isActive: true
        });

        // The User model has a pre-save hook to hash the password
        await adminUser.save();
        console.log('Admin user seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
