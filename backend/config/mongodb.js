import mongoose from "mongoose";

const connectDB = async ()=>{
    try{
        // Establish connection
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✔ Mongodb Connected")
    }catch(err){
        console.error('X Database connection failed', err.message)
    }
}

export default connectDB