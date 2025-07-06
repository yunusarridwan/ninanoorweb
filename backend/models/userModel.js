import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  
  telpn: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  
  items: { 
    type: mongoose.Schema.Types.Mixed, // Memungkinkan penyimpanan objek dengan struktur fleksibel
    default: {} // Default-nya adalah objek kosong
  },
  
}, {
  timestamps: true 
});

const userModel = mongoose.models.User || mongoose.model('User', userSchema); 

export default userModel;
