import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
const profilePicsDir = path.join(uploadsDir, 'profile-pictures');

async function ensureDirectoryExists(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Initialize directories
ensureDirectoryExists(profilePicsDir);

export const uploadProfilePicture = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const userId = req.user.id;
    const file = req.file;

    // Generate unique filename
    const filename = `${userId}-${Date.now()}.jpg`;
    const filepath = path.join(profilePicsDir, filename);

    // Process image with sharp
    await sharp(file.buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(filepath);

    // Generate public URL
    const profilePicture = `/uploads/profile-pictures/${filename}`;

    // Update user profile in database
    const user = await prisma.users.update({
      where: { id: userId },
      data: { profilePicture },
    });

    // Delete old profile picture if exists
    if (user.profilePicture && !user.profilePicture.startsWith('http')) {
      const oldFilepath = path.join(process.cwd(), user.profilePicture);
      try {
        await fs.unlink(oldFilepath);
      } catch (error) {
        console.error('Error deleting old profile picture:', error);
      }
    }

    res.json({
      success: true,
      profilePicture,
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
    });
  }
};

export const removeProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete profile picture file if it's not a social media URL
    if (user.profilePicture && !user.profilePicture.startsWith('http')) {
      const filepath = path.join(process.cwd(), user.profilePicture);
      try {
        await fs.unlink(filepath);
      } catch (error) {
        console.error('Error deleting profile picture:', error);
      }
    }

    // Update user in database
    await prisma.users.update({
      where: { id: userId },
      data: { profilePicture: null },
    });

    res.json({
      success: true,
      message: 'Profile picture removed successfully',
    });
  } catch (error) {
    console.error('Remove profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove profile picture',
    });
  }
};
