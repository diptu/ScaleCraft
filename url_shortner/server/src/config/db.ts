import 'dotenv/config';
import mongoose from 'mongoose';
const DB_CONNECTION = async () => {
    try {
        const uri = process.env.DB_URI;
        if (!uri) {
            throw new Error("DB_URI is not defined in environment variables");
        }

        await mongoose.connect(uri, {
            dbName: 'url_shortner', // Explicitly set the DB name here
        });

        console.log('Successfully connected to MongoDB Atlas');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

export default DB_CONNECTION;