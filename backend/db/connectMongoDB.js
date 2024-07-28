import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    const conn = mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${(await conn).connection.host}`);
  } catch (error) {
    console.error(`Error connecting to: ${error.message}`);
    process.exit(1);
  }
};

export default connectMongoDB;
