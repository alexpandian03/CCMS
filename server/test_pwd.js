const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'p@gmail.com' });

        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        console.log('User found:', user.email);
        console.log('Role:', user.role);
        console.log('Hashed Password in DB:', user.password);

        // Test with a random wrong password
        const wrongPwd = 'someRandomPassword123';
        const isMatchWrong = await bcrypt.compare(wrongPwd, user.password);
        console.log(`Test with WRONG password "${wrongPwd}": Match = ${isMatchWrong}`);

        // Test with the empty string?
        const emptyMatch = await bcrypt.compare('', user.password);
        console.log(`Test with EMPTY password: Match = ${emptyMatch}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verify();
