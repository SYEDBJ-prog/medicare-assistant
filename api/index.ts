import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Database Connection (Peshawar Cloud)
const MONGO_URI = "mongodb+srv://SyedZubair:SyEd21212020@cluster0.gngchxs.mongodb.net/medicare?retryWrites=true&w=majority";

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
    throw err;
  }
};

// ✅ Schema: Charo Roles (Patient, Doctor, Lab, Pharmacy) ke liye aik hi Model
const EntrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['patient', 'doctor', 'lab', 'pharmacy'] 
  },
  details: { type: String }, // Medicine name, Specialization, or Test name
  location: { type: String }, // Clinic address, Pharmacy location, or Ward No.
  contact: { type: String },  // Phone number
  createdAt: { type: Date, default: Date.now }
});

const Entry = mongoose.models.entries || mongoose.model('entries', EntrySchema);

// ---------------------------------------------------------
// 🚀 1. TEST ROUTE (Checking if Backend is alive)
// ---------------------------------------------------------
app.get('/api/test', async (req: Request, res: Response) => {
  try {
    await connectDB();
    res.status(200).json({ 
      status: "Success", 
      message: "Medicare Multi-Role Backend is LIVE! 🏥" 
    });
  } catch (error: any) {
    res.status(500).json({ status: "Error", error: error.message });
  }
});

// ---------------------------------------------------------
// 🚀 2. UNIVERSAL ADD (Add Patient, Doctor, Lab, or Pharmacy)
// ---------------------------------------------------------
app.post('/api/add-entry', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { name, role, details, location, contact } = req.body;

    if (!name || !role) {
      return res.status(400).json({ message: "Name and Role are required! ⚠️" });
    }

    const newEntry = new Entry({ name, role, details, location, contact });
    await newEntry.save();

    res.status(201).json({ 
      status: "Success", 
      message: `${role.toUpperCase()} added successfully! ✅`,
      data: newEntry 
    });
  } catch (error: any) {
    res.status(500).json({ message: "Save failed", error: error.message });
  }
});

// ---------------------------------------------------------
// 🚀 3. GET BY ROLE (Filter: e.g., Get only Doctors)
// ---------------------------------------------------------
app.get('/api/get/:role', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { role } = req.params;
    const records = await Entry.find({ role: role }).sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error: any) {
    res.status(500).json({ message: "Fetch failed", error: error.message });
  }
});

// ---------------------------------------------------------
// 🚀 4. SEARCH BY NAME (Universal Search)
// ---------------------------------------------------------
app.get('/api/search/:name', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { name } = req.params;
    const results = await Entry.find({ name: new RegExp(name, 'i') });
    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ message: "Search failed", error: error.message });
  }
});

// ---------------------------------------------------------
// 🚀 5. DELETE RECORD (By ID)
// ---------------------------------------------------------
app.delete('/api/delete/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { id } = req.params;
    const deleted = await Entry.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Record not found" });
    res.status(200).json({ message: "Record deleted successfully! 🗑️" });
  } catch (error: any) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
});

export default app;