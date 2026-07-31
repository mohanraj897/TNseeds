const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;

  try {
    // Try connecting to the configured URI first
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`⚠️  Local MongoDB unavailable. Starting in-memory MongoDB...`);

    // Spin up in-memory MongoDB
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();

    await mongoose.connect(uri);
    console.log(`✅ In-Memory MongoDB running at: ${uri}`);
    console.log(`📝 Note: Data will reset on server restart. Install MongoDB for persistence.\n`);

    // Auto-seed demo data for in-memory mode
    await seedDemoData();
  }
};

async function seedDemoData() {
  const User = require('../models/User');
  const Seed = require('../models/Seed');

  const exists = await User.countDocuments();
  if (exists > 0) return;

  console.log('🌱 Seeding demo data into in-memory MongoDB...');

  const dealers = await User.create([
    {
      name: 'Ramesh Agromart',
      email: 'dealer@demo.com',
      password: 'demo123',
      role: 'dealer',
      phone: '+91 98765 43210',
      storeName: 'Ramesh Agromart',
      location: { type: 'Point', coordinates: [73.8567, 18.5204], city: 'Pune', state: 'Maharashtra' }
    },
    {
      name: 'Kisaan Seeds Pvt Ltd',
      email: 'kisaan@demo.com',
      password: 'demo123',
      role: 'dealer',
      phone: '+91 94523 11234',
      storeName: 'Kisaan Seeds Pvt Ltd',
      location: { type: 'Point', coordinates: [72.8777, 19.0760], city: 'Mumbai', state: 'Maharashtra' }
    }
  ]);

  await User.create({
    name: 'Suresh Patil',
    email: 'farmer@demo.com',
    password: 'demo123',
    role: 'farmer',
    phone: '+91 87654 32109',
    location: { type: 'Point', coordinates: [73.7898, 18.6298], city: 'Pune', state: 'Maharashtra' }
  });

  const seedsData = [
    { name: 'Pusa Basmati 1121',  cropType: 'Rice',       variety: 'Long Grain',     brand: 'IARI',     quantity: 500,  unit: 'kg',      price: 85,   season: 'Kharif',      description: 'Premium aromatic basmati variety with excellent yield' },
    { name: 'HD-2967 Wheat',      cropType: 'Wheat',      variety: 'Semi-Dwarf',     brand: 'IARI',     quantity: 1200, unit: 'kg',      price: 55,   season: 'Rabi',        description: 'High yielding rust resistant variety' },
    { name: 'NK-6240 Maize',      cropType: 'Corn',       variety: 'Hybrid',         brand: 'Syngenta', quantity: 80,   unit: 'bags',    price: 1200, season: 'Kharif',      description: 'High yield hybrid with good disease resistance' },
    { name: 'JS-335 Soybean',     cropType: 'Soybean',    variety: 'Early Maturing', brand: 'Local',    quantity: 300,  unit: 'kg',      price: 72,   season: 'Kharif',      description: 'Popular variety with 95–100 day maturity' },
    { name: 'Bunny BT Cotton',    cropType: 'Cotton',     variety: 'Bt Hybrid',      brand: 'Mahyco',   quantity: 50,   unit: 'packets', price: 950,  season: 'Kharif',      description: 'Bollworm resistant Bt cotton hybrid' },
    { name: 'Pusa Mustard 25',    cropType: 'Mustard',    variety: 'Yellow Sarson',  brand: 'IARI',     quantity: 200,  unit: 'kg',      price: 110,  season: 'Rabi',        description: 'High oil content mustard variety' },
    { name: 'KBSH-44 Sunflower',  cropType: 'Sunflower',  variety: 'Hybrid',         brand: 'Karnal',   quantity: 40,   unit: 'kg',      price: 260,  season: 'Zaid',        description: 'High yielding hybrid sunflower seeds' },
    { name: 'GG-20 Groundnut',    cropType: 'Groundnut',  variety: 'Spanish Type',   brand: 'NRCG',     quantity: 400,  unit: 'kg',      price: 95,   season: 'Kharif',      description: 'Drought tolerant with good shelling %' },
    { name: 'Pusa Millet 986',    cropType: 'Millet',     variety: 'Pearl Millet',   brand: 'IARI',     quantity: 150,  unit: 'kg',      price: 48,   season: 'Kharif',      description: 'Early maturing millet variety' },
    { name: 'Tomato Arka Vikas',  cropType: 'Vegetables', variety: 'Determinate',    brand: 'IIHR',     quantity: 20,   unit: 'packets', price: 180,  season: 'All Season',  description: 'Tolerant to leaf curl virus disease' },
    { name: 'Chilli NS-1701',     cropType: 'Spices',     variety: 'Hybrid',         brand: 'Namdhari', quantity: 30,   unit: 'packets', price: 450,  season: 'All Season',  description: 'High pungency chilli with excellent yield' },
    { name: 'Brinjal Arka Nidhi', cropType: 'Vegetables', variety: 'Long Green',     brand: 'IIHR',     quantity: 15,   unit: 'packets', price: 120,  season: 'All Season',  description: 'Suitable for year-round cultivation' },
  ];

  const docs = seedsData.map((s, i) => ({
    ...s,
    isAvailable: true,
    dealer: dealers[i % dealers.length]._id,
    location: {
      type: 'Point',
      coordinates: dealers[i % dealers.length].location.coordinates,
      city:  dealers[i % dealers.length].location.city,
      state: dealers[i % dealers.length].location.state
    }
  }));

  await Seed.create(docs);
  console.log(`✅ Demo data ready — ${docs.length} seeds seeded`);
  console.log(`   📧 Dealer: dealer@demo.com  / demo123`);
  console.log(`   📧 Farmer: farmer@demo.com  / demo123\n`);
}

module.exports = connectDB;
