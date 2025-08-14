import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection (local Compass)
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blogsphere", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected (Local)"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// Schemas
const NewsletterSchema = new mongoose.Schema({
  email: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Newsletter = mongoose.model("Newsletter", NewsletterSchema);
const Contact = mongoose.model("Contact", ContactSchema);

// Static serve
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.post("/api/newsletter", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email is required" });
    await Newsletter.create({ email });
    res.json({ message: "Subscription successful ✅" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }
    await Contact.create({ name, email, subject, message });
    res.json({ message: "Message sent successfully ✅" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
