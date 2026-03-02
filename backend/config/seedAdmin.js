const User = require('../models/User');
const dotenv = require('dotenv');
const connectDB = require('../config/db');

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });

        if (adminExists) {
            console.log('Admin already exists');
        } else {
            const admin = await User.create({
                name: 'System Admin',
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                role: 'admin',
            });

            if (admin) {
                console.log('Admin user created successfully');
            }
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    } finally {
        process.exit();
    }
};

seedAdmin();
