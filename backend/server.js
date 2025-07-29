const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './linkedin_profiles.db',
  logging: false
});

// LinkedIn Profile Model
const LinkedInProfile = sequelize.define('LinkedInProfile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  about: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  followerCount: {
    type: DataTypes.STRING,
    allowNull: true
  },
  connectionCount: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Initialize database
const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    await sequelize.sync({ force: false });
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Routes
// GET all profiles
app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await LinkedInProfile.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({
      success: true,
      data: profiles,
      count: profiles.length
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profiles',
      error: error.message
    });
  }
});

// POST new profile
app.post('/api/profiles', async (req, res) => {
  try {
    const {
      name,
      url,
      about,
      bio,
      location,
      followerCount,
      connectionCount
    } = req.body;

    // Validate required fields
    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: 'Name and URL are required fields'
      });
    }

    // Check if profile already exists
    const existingProfile = await LinkedInProfile.findOne({ where: { url } });
    if (existingProfile) {
      // Update existing profile
      await existingProfile.update({
        name,
        about,
        bio,
        location,
        followerCount,
        connectionCount
      });
      
      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: existingProfile
      });
    }

    // Create new profile
    const newProfile = await LinkedInProfile.create({
      name,
      url,
      about,
      bio,
      location,
      followerCount,
      connectionCount
    });

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: newProfile
    });

  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating profile',
      error: error.message
    });
  }
});

// GET profile by ID
app.get('/api/profiles/:id', async (req, res) => {
  try {
    const profile = await LinkedInProfile.findByPk(req.params.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// DELETE profile
app.delete('/api/profiles/:id', async (req, res) => {
  try {
    const profile = await LinkedInProfile.findByPk(req.params.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    await profile.destroy();
    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting profile',
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    app: 'LinkedIn Scraper API',
    time: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API endpoints:`);
    console.log(`- GET  /api/profiles      - Get all profiles`);
    console.log(`- POST /api/profiles      - Create new profile`);
    console.log(`- GET  /api/profiles/:id  - Get profile by ID`);
    console.log(`- DELETE /api/profiles/:id - Delete profile`);
    console.log(`- GET  /health            - Health check`);
  });
};

startServer();