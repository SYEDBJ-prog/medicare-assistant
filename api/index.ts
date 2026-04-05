import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Database Connection
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

// ✅ Schema & Model
const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  medicine: { type: String, required: true },
  time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Patient = mongoose.models.patients || mongoose.model('patients', PatientSchema);

// ------------------------------------------
// 🚀 1. TEST ROUTE
// ------------------------------------------
app.get('/api/test', async (req: Request, res: Response) => {
  try {
    await connectDB();
    res.status(200).json({ status: "Success", message: "Master Backend is LIVE! 🚀" });
  } catch (error: any) {
    res.status(500).json({ status: "Error", error: error.message });
  }
});

// ------------------------------------------
// 🚀 2. ADD PATIENT (POST)
// ------------------------------------------
app.post('/api/add-patient', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { name, medicine, time } = req.body;
    if (!name || !medicine || !time) {
      return res.status(400).json({ message: "All fields are required! ⚠️" });
    }
    const newPatient = new Patient({ name, medicine, time });
    await newPatient.save();
    res.status(201).json({ status: "Success", data: newPatient });
  } catch (error: any) {
    res.status(500).json({ message: "Save failed", error: error.message });
  }
});

// ------------------------------------------
// 🚀 3. GET ALL PATIENTS (GET)
// ------------------------------------------
app.get('/api/get-all', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const records = await Patient.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ------------------------------------------
// 🚀 4. SEARCH BY NAME (GET)
// ------------------------------------------
app.get('/api/search/:name', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { name } = req.params;
    // 'i' means case-insensitive search
    const results = await Patient.find({ name: new RegExp(name, 'i') });
    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ message: "Search failed", error: error.message });
  }
});

// ------------------------------------------
// 🚀 5. DELETE PATIENT (DELETE)
// ------------------------------------------
app.delete('/api/delete-patient/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { id } = req.params;
    const deleted = await Patient.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Patient not found" });
    res.status(200).json({ message: "Record deleted successfully! 🗑️" });
  } catch (error: any) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
});

export default app;