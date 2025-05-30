import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateToken } from "../middleware/auth.js";
import { isAdmin } from '../middleware/middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Protect routes that require an admin
// router.use(isAdmin);

// Protected route
router.get("/protected-route", (req, res) => {
  res.json({ message: "You are an admin!" });
});

// Get dashboard data
router.get("/dashboard",authenticateToken,isAdmin, async (req, res) => {
  try {
    // Get total users
    const totalUsers = await prisma.users.count();

    // Get total groups
    const totalGroups = await prisma.study_group.count();

    // Get total activities
    const totalActivities = await prisma.activities.count();

    // Get recent logins
    const recentLogins = await prisma.users.findMany({
      where: {
        lastLogin: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        emailAddress: true,
        lastLogin: true,
      },
      orderBy: {
        lastLogin: "desc",
      },
      take: 10,
    });

    // Get recent activities (system events)
    const recentActivities = [
      // This would typically come from an activity log table
      // For now, we'll return placeholder data
      {
        id: 1,
        type: "login",
        user: "John Doe",
        description: "User logged in",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        id: 2,
        type: "group",
        user: "Jane Smith",
        description: 'Created new group "Study Group A"',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: 3,
        type: "activity",
        user: "Bob Johnson",
        description: 'Completed activity "Introduction to React"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
      },
    ];

    // Get active users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeToday = await prisma.users.count({
      where: {
        lastLogin: {
          gte: today,
        },
      },
    });

    res.json({
      totalUsers,
      totalGroups,
      totalActivities,
      activeToday,
      recentLogins,
      recentActivities,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get users with pagination and search
router.get("/users", authenticateToken, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { emailAddress: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [users, totalUsers] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          id: true,
          name: true,
          emailAddress: true,
          createdAt: true,
          lastLogin: true,
          isActive: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.users.count({ where }),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users,
      totalPages,
      currentPage: page,
      totalUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    await prisma.users.delete({
      where: { id: userId }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status (active/inactive)
router.patch('/users/:id/status', async (req, res) => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user status
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { isActive }
    });

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        isActive: updatedUser.isActive
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get groups with pagination and search
router.get("/groups", authenticateToken, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [groups, totalGroups] = await Promise.all([
      prisma.study_group.findMany({
        where,
        include: {
          creator: {
            select: {
              name: true,
            },
          },
          members: {
            select: {
              id: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.study_group.count({ where }),
    ]);

    const formattedGroups = groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      createdAt: group.created_at,
      createdBy: group.creator.name,
      memberCount: group.members.length,
    }));

    const totalPages = Math.ceil(totalGroups / limit);

    res.json({
      groups: formattedGroups,
      totalPages,
      currentPage: page,
      totalGroups,
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get group details
router.get('/groups/:id', async (req, res) => {
  try {
    const groupId = parseInt(req.params.id);

    const group = await prisma.study_group.findUnique({
      where: { id: groupId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            emailAddress: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                emailAddress: true
              }
            }
          }
        },
        messages: {
          select: {
            id: true,
            content: true,
            created_At: true,
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          },
          take: 10
        }
      }
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Format the response
    const formattedGroup = {
      id: group.id,
      name: group.name,
      description: group.description,
      createdAt: group.created_at,
      createdBy: group.creator.name,
      members: group.members.map(member => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.emailAddress,
        role: member.role
      })),
      messageCount: group.messages.length,
      lastActive: group.messages.length > 0 ? group.messages[0].createdAt : group.created_at
    };

    res.json(formattedGroup);
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete group
router.delete('/groups/:id', async (req, res) => {
  try {
    const groupId = parseInt(req.params.id);

    // Check if group exists
    const group = await prisma.study_group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Delete group
    await prisma.study_group.delete({
      where: { id: groupId }
    });

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get activities with pagination and search
router.get("/activities", authenticateToken, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [activities, totalActivities] = await Promise.all([
      prisma.activities.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
            },
          },
          subtopics: {
            select: {
              id: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.activities.count({ where }),
    ]);

    const formattedActivities = activities.map((activity) => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      type: activity.type,
      createdAt: activity.created_at,
      createdBy: activity.user?.name|| "Unknown",
      subtopicCount: activity.subtopics.length,
    }));

    const totalPages = Math.ceil(totalActivities / limit);

    res.json({
      activities: formattedActivities,
      totalPages,
      currentPage: page,
      totalActivities,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get activity details
router.get('/activities/:id', async (req, res) => {
  try {
    const activityId = req.params.id;

    const activity = await prisma.activities.findUnique({
      where: { id: activityId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            emailAddress: true
          }
        },
        subtopics: {
          select: {
            id: true,
            title: true,
            content: true,
            order: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        activity_members: {
          select: {
            user_id: true,
            progress: true
          }
        }
      }
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Calculate completion stats
    const participantCount = activity.activity_members.length;
    const completedCount = activity.activity_members.filter(member => member.progress === 100).length;
    const completionRate = participantCount > 0 ? Math.round((completedCount / participantCount) * 100) : 0;

    // Format the response
    const formattedActivity = {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      type: activity.type,
      createdAt: activity.created_at,
      createdBy: activity.user?.name || 'Unknown',
      subtopics: activity.subtopics,
      participantCount,
      completionRate
    };

    res.json(formattedActivity);
  } catch (error) {
    console.error('Error fetching activity details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete activity
router.delete('/activities/:id', async (req, res) => {
  try {
    const activityId = req.params.id;

    // Check if activity exists
    const activity = await prisma.activities.findUnique({
      where: { id: activityId }
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Delete activity
    await prisma.activities.delete({
      where: { id: activityId }
    });

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analytics data
router.get("/analytics", authenticateToken, isAdmin, async (req, res) => {
  try {
    const timeRange = req.query.timeRange || "month";

    // Calculate date ranges
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get user stats
    const totalUsers = await prisma.users.count();

    const newUsersThisMonth = await prisma.users.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeUsersToday = await prisma.users.count({
      where: {
        lastLogin: {
          gte: today,
        },
      },
    });

    // Get activity stats
    const totalActivities = await prisma.activities.count();

    // This is a placeholder - in a real system, you'd have a way to track completed activities
    const completedActivities = Math.floor(totalActivities * 0.7);
    const averageCompletionRate = 75; // Placeholder value

    // Get group stats
    const totalGroups = await prisma.study_group.count();

    // Placeholder values - in a real system, you'd calculate these from actual data
    const activeGroups = Math.floor(totalGroups * 0.8);
    const averageGroupSize = 5;
    const messageCount = 1250;

    // Time stats (placeholders)
    const averageSessionDuration = 25; // minutes
    const userRetention = 68; // percentage

    // Peak usage times (placeholder)
    const peakUsageTimes = [45, 60, 75, 80, 65, 40, 30]; // percentage by day of week

    // User growth over time (placeholder)
    const userGrowth = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 5 + i);
      return {
        month: date.toLocaleString("default", { month: "short" }),
        users: totalUsers - Math.floor(totalUsers * 0.1 * (5 - i)),
      };
    });

    // Activity types distribution (placeholder)
    const activityTypes = [
      { type: "Quiz", count: Math.floor(totalActivities * 0.4) },
      { type: "Assignment", count: Math.floor(totalActivities * 0.3) },
      { type: "Study Session", count: Math.floor(totalActivities * 0.2) },
      { type: "Group Discussion", count: Math.floor(totalActivities * 0.1) },
    ];

    res.json({
      userStats: {
        totalUsers,
        newUsersThisMonth,
        activeUsersToday,
        userGrowth,
      },
      activityStats: {
        totalActivities,
        completedActivities,
        averageCompletionRate,
        activityTypes,
      },
      groupStats: {
        totalGroups,
        activeGroups,
        averageGroupSize,
        messageCount,
      },
      timeStats: {
        averageSessionDuration,
        peakUsageTimes,
        userRetention,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get system settings
router.get("/settings", authenticateToken, isAdmin, async (req, res) => {
  try {
    // In a real application, these would be stored in the database
    // For now, we'll return default values
    const settings = {
      general: {
        siteName: "Learning Platform",
        siteDescription:
          "A collaborative learning platform for students and educators",
        contactEmail: "admin@example.com",
        maxUploadSize: 5,
      },
      security: {
        passwordMinLength: 8,
        requireSpecialChars: true,
        sessionTimeout: 60,
        maxLoginAttempts: 5,
      },
      notifications: {
        enableEmailNotifications: true,
        adminAlertEmails: "admin@example.com",
        notifyOnNewUser: true,
        notifyOnNewGroup: true,
      },
      maintenance: {
        enableMaintenanceMode: false,
        maintenanceMessage:
          "The site is currently undergoing scheduled maintenance. Please check back later.",
        allowAdminAccess: true,
      },
    };

    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update system settings
router.put('/settings', async (req, res) => {
  try {
    const settings = req.body;
    
    // Validate settings
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Invalid settings data' });
    }
    
    // In a real application, you would save these to the database
    // For now, we'll just return success
    
    res.json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
