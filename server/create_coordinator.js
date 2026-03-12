const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const createCoordinator = async () => {
    // Usage: node create_coordinator.js <email> <password> <name>
    const email = process.argv[2];
    const password = process.argv[3] || 'password123';
    const name = process.argv[4] || 'Club Coordinator';

    if (!email) {
        console.log('Error: Please provide an email.');
        console.log('Usage: node create_coordinator.js email password name');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        let user = await User.findOne({ email });

        if (user) {
            console.log('User exists. Updating to Coordinator role and setting password...');
            user.password = password;
            user.role = 'coordinator';
            await user.save();
            console.log('Coordinator account updated successfully!');
        } else {
            await User.create({
                name,
                email,
                password,
                role: 'coordinator'
            });
            console.log('Coordinator user created successfully!');
        }

        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

createCoordinator();
