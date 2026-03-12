const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
    const email = 'admin@gmail.com'; // Change this to your preferred admin email
    const password = 'adminPassword123'; // Change this to your preferred admin password
    const name = 'System Admin';

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        let admin = await User.findOne({ email });

        if (admin) {
            console.log('Admin already exists. Updating password...');
            admin.password = password;
            admin.role = 'admin'; // Ensure role is admin
            await admin.save();
            console.log('Admin account updated successfully!');
        } else {
            await User.create({
                name,
                email,
                password,
                role: 'admin'
            });
            console.log('Admin user created successfully!');
        }
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    }
};

createAdmin();
