import mongoose from "mongoose";

const connectDB = async () => {
    await mongoose.connect(`mongodb+srv://piyushtiwari_db_user:${process.env.DB_PASSWORD}@cluster0.bzuashx.mongodb.net/`);
};

export default connectDB;
