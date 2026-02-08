
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - High limit for base64 image payloads (25MB to be safe for uncompressed flows)
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// MongoDB Connection - Strictly using environment variable
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error('❌ FATAL: MONGO_URL is not defined in the environment variables.');
  process.exit(1);
}

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas Cloud');
    seedAdmin();
  })
  .catch(err => {
    // Log minimal error to prevent string leakage in logs
    console.error('❌ MongoDB Connection Error. Check your environment configuration.');
  });

// --- Database Schemas ---

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  role: String,
  adminRole: String,
  avatar: String,
  bookmarks: [String],
  isEmailVerified: Boolean
}, { timestamps: true });

const CAProfileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: String,
  type: String,
  name: String,
  firmName: String,
  icaiRegistrationNumber: String,
  professionalQualification: String,
  experienceYears: Number,
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  specializations: [String],
  city: String,
  state: String,
  pincode: String,
  isVerified: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  verificationStatus: String,
  adminFeedback: String,
  languages: [String],
  about: String,
  pricingRange: String,
  avatar: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [78.4867, 17.3850] } // [lon, lat]
  }
}, { timestamps: true });

CAProfileSchema.index({ location: '2dsphere' });

const MessageSchema = new mongoose.Schema({
  id: String,
  senderId: String,
  senderName: String,
  receiverId: String,
  caProfileId: String,
  subject: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const ReviewSchema = new mongoose.Schema({
  id: String,
  caId: String,
  clientId: String,
  clientName: String,
  rating: Number,
  comment: String,
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Profile = mongoose.model('Profile', CAProfileSchema);
const Message = mongoose.model('Message', MessageSchema);
const Review = mongoose.model('Review', ReviewSchema);

// --- Admin Seeder ---
async function seedAdmin() {
  const adminEmail = 'adminme@gmail.com';
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    const admin = new User({
      id: 'admin-001',
      name: 'Super Admin',
      email: adminEmail,
      phone: '0000000000',
      role: 'ADMIN',
      adminRole: 'SUPER',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminManish',
      isEmailVerified: true
    });
    await admin.save();
    console.log('👑 Super Admin seeded to MongoDB');
  }
}

// --- API Routes ---

app.get('/health', (req, res) => res.json({ 
  status: 'ok', 
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
}));

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/users', async (req, res) => {
  try {
    const { id, email } = req.body;
    const user = await User.findOneAndUpdate(
      { $or: [{ id }, { email }] },
      req.body,
      { upsert: true, new: true }
    );
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/users/:id', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/profiles', async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.json(profiles);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/profiles/:id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ id: req.params.id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/profiles', async (req, res) => {
  try {
    const { id } = req.body;
    const profile = await Profile.findOneAndUpdate({ id }, req.body, { upsert: true, new: true });
    res.json(profile);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/profiles/:id', async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(profile);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/messages/:userId', async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.params.userId }, { receiverId: req.params.userId }]
    }).sort({ timestamp: -1 });
    res.json(messages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/messages', async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.json(message);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/messages/read', async (req, res) => {
  try {
    const { userId, contactId } = req.body;
    await Message.updateMany(
      { receiverId: userId, senderId: contactId },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/reviews/:caId', async (req, res) => {
  try {
    const reviews = await Review.find({ caId: req.params.caId });
    res.json(reviews);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/nearby', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'Coordinates missing' });
    
    const profiles = await Profile.find({
      verificationStatus: 'verified',
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lon), parseFloat(lat)] },
          $maxDistance: 100000 
        }
      }
    });
    res.json(profiles);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.use((req, res) => res.status(404).json({ error: 'API Route Not Found' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server active on http://0.0.0.0:${PORT}`);
});
