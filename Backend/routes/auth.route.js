import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { emailAddress, password } = req.body;
    console.log('Login attempt for:', emailAddress);
    console.log('Request body:', { emailAddress, password: password ? '********' : undefined });

    if (!emailAddress || !password) {
      console.log('Missing credentials:', { 
        hasEmail: !!emailAddress, 
        hasPassword: !!password 
      });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists using emailAddress field
    const user = await prisma.users.findUnique({
      where: {
        emailAddress: emailAddress
      }
    });

    if (!user) {
      console.log('User not found:', emailAddress);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Found user:', { id: user.id, email: user.emailAddress });
    
    if (!user.password) {
      console.log('User has no password set:', emailAddress);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', validPassword);

    if (!validPassword) {
      console.log('Invalid password for user:', emailAddress);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user.id, email: user.emailAddress },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', emailAddress);
    
    // Update last login time
    await prisma.users.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.emailAddress
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, emailAddress, phoneNumber, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: {
        emailAddress: emailAddress
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.users.create({
      data: {
        name,
        emailAddress,
        phoneNumber: phoneNumber ? parseInt(phoneNumber) : null,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        emailAddress: true
      }
    });

    // Create token
    const token = jwt.sign(
      { userId: user.id, email: user.emailAddress },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, emailAddress, phoneNumber, Password } = req.body;
    console.log('Signup request body:', { 
      name, 
      emailAddress, 
      phoneNumber, 
      hasPassword: !!Password 
    });

    // Validate required fields
    if (!name || !emailAddress || !phoneNumber || !Password) {
      console.log('Missing required fields:', {
        hasName: !!name,
        hasEmail: !!emailAddress,
        hasPhone: !!phoneNumber,
        hasPassword: !!Password
      });
      return res.status(400).json({ 
        message: 'All fields are required: name, emailAddress, phoneNumber, and password' 
      });
    }

    // Convert phoneNumber to integer and validate
    const phoneNumberInt = parseInt(phoneNumber.replace(/\D/g, ''), 10);
    if (isNaN(phoneNumberInt)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Check if user already exists
    console.log('Checking for existing user with email:', emailAddress);
    const existingUser = await prisma.users.findUnique({
      where: { emailAddress }
    });

    if (existingUser) {
      console.log('User already exists with email:', emailAddress);
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Create new user
    console.log('Creating new user with phone:', phoneNumberInt);
    const newUser = await prisma.users.create({
      data: {
        name,
        emailAddress,
        phoneNumber: phoneNumberInt,
        password: hashedPassword
      }
    });

    console.log('User created successfully:', {
      id: newUser.id,
      email: newUser.emailAddress,
      name: newUser.name
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Detailed signup error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    return res.status(500).json({ message: 'Error creating user', details: error.message });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      // Verify token
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // In a real-world application, you might want to:
      // 1. Add the token to a blacklist
      // 2. Clear any server-side sessions
      // 3. Clear any secure cookies

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token route
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No auth header or invalid format:', authHeader);
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1].trim();
    if (!token) {
      console.log('No token found in auth header');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await prisma.users.findUnique({
      where: {
        id: decoded.userId
      },
      select: {
        id: true,
        name: true,
        emailAddress: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default router;
