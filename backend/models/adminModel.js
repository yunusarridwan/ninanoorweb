import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  telpn: {
    type: String, 
    required: true,
    unique: true,
    match: [/^\+?[0-9\s\-]{7,15}$/, 'Please fill a valid phone number (e.g., +628123456789 or 08123456789)']
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin',
    required: true
  },
}, {
  timestamps: true
});

const adminModel = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

export default adminModel;
