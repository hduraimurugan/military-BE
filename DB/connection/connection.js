import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config()

// MongoDB Environment Variables
const dbUserName = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const dbCluster = process.env.DB_CLUSTER;

const cloudURL = `mongodb+srv://${dbUserName}:${dbPassword}@${dbCluster}/${dbName}?retryWrites=true&w=majority`;

const connectDB = async () => {
    await mongoose.connect(cloudURL, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
    });
}
export default connectDB

