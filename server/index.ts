import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// 🛠️ MONGODB CONNECTION
// Yaad rakhein: Apna asli Connection String yahan dalna hai
const MONGO_URI = "mongodb+srv://SyedZubair:SyEd21212020@cluster0.mongodb.net/medicare?retryWrites=true&w=majority";
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ GLOBAL DATABASE: Connected Successfully!"))
  .catch((err) => console.log("❌ DATABASE ERROR:", err));

// 📝 SCHEMA (Worldwide Structure)
const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  medicine: { type: String, required: true },
  formula: { type: String },         // Generic formula (e.g. Paracetamol)
  time: { type: String, required: true },
  country: { type: String, default: "Global" }, // User ki location track karne ke liye
  status: { type: String, default: "Active" },
  createdAt: { type: Date, default: Date.now }
});

const PatientModel = mongoose.model('patients', PatientSchema);

// 🚀 ROUTES

// 1. Test Route (Browser mein check karne ke liye)
app.get('/test', (req: Request, res: Response) => {
  res.send("<h1>Medicare Global Backend is LIVE! 🌍</h1><p>Zubair bhai, connection fit hai!</p>");
});

// 2. Add New Record (Mobile App se data yahan ayega)
app.post('/add-patient', async (req: Request, res: Response) => {
  try {
    const { name, medicine, formula, time, country } = req.body;
    
    const newRecord = new PatientModel({
      name,
      medicine,
      formula,
      time,
      country
    });

    await newRecord.save();
    console.log(`📢 Record Saved: ${medicine} for ${name}`);
    res.status(200).json({ message: "Record Synchronized Successfully! ✅" });
  } catch (error) {
    console.error("❌ Save Error:", error);
    res.status(500).json({ message: "Server Error: Could not save data." });
  }
});

// 3. Get All Records (History dekhne ke liye)
app.get('/get-all', async (req: Request, res: Response) => {
  try {
    const records = await PatientModel.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching records" });
  }
});

// 🌍 SERVER START
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  🚀 ==========================================
  🌍 MEDICARE GLOBAL BACKEND RUNNING
  📍 Port: ${PORT}
  🔗 Host: 0.0.0.0 (Network Accessible)
  ==========================================
  `);
});