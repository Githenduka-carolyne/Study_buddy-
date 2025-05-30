import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      emailAddress: user.emailAddress,
      profilePicture: user.profilePicture
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30m' }
  );
};

// Helper function to find or create user
const findOrCreateUser = async (userData) => {
  try {
    const existingUser = await prisma.users.findFirst({
      where: { emailAddress: userData.emailAddress },
    });

    if (existingUser) {
      // Update profile picture if it has changed
      if (userData.profilePicture && existingUser.profilePicture !== userData.profilePicture) {
        return await prisma.users.update({
          where: { id: existingUser.id },
          data: { profilePicture: userData.profilePicture },
        });
      }
      return existingUser;
    }

    return await prisma.users.create({
      data: {
        ...userData,
        password: '', // Social login users don't have passwords
        phoneNumber: '', // Default value for social login users
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to process user data');
  }
};

// Google Auth Handler
export async function handleGoogleAuth(req, res) {
  try {
    const { credential } = req.body;
    
    // Verify the Google token
    const response = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + credential);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error('Failed to verify Google token');
    }

    // Create or find user
    const user = await findOrCreateUser({
      name: data.name,
      emailAddress: data.email,
      profilePicture: data.picture,
      authProvider: 'GOOGLE',
    });

    // Generate JWT token
    const token = generateToken(user);

    res.json({ token, user });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

// GitHub Auth Handler
export function handleGitHubAuth(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`
  );
}

// GitHub Callback Handler
export async function handleGitHubCallback(req, res) {
  try {
    const { code } = req.query;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    // Exchange code for access token
    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      throw new Error('Failed to get access token');
    }

    // Get user data from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    // Get user email from GitHub
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const emails = await emailsResponse.json();
    const primaryEmail = emails.find(email => email.primary)?.email;

    if (!primaryEmail) {
      throw new Error('No primary email found');
    }

    // Create or find user
    const user = await findOrCreateUser({
      name: userData.name || userData.login,
      emailAddress: primaryEmail,
      profilePicture: userData.avatar_url,
      authProvider: 'GITHUB',
    });

    // Generate JWT token
    const token = generateToken(user);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
  } catch (error) {
    console.error('GitHub auth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}?error=Authentication failed`);
  }
}
