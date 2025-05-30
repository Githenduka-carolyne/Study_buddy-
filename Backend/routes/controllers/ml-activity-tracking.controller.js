import { PrismaClient } from "@prisma/client";
import { calculateSimilarity, predictNextActivity } from "../../services/ml-service.js";

const prisma = new PrismaClient();

// Log user activity for ML processing
export const logUserActivity = async (req, res) => {
  try {
    const { activityType, activityId, subtopicId, duration, completionRate, score, metadata } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!activityType) {
      return res.status(400).json({ message: "Activity type is required" });
    }

    // Create activity log
    const activityLog = await prisma.userActivityLog.create({
      data: {
        userId,
        activityType,
        activityId,
        subtopicId,
        duration,
        completionRate,
        score,
        startTime: new Date(),
        endTime: duration ? new Date(Date.now() + duration * 1000) : null,
        metadata: metadata || {}
      }
    });

    // Generate recommendations based on this new activity
    await generateRecommendations(userId);

    res.status(201).json({
      message: "Activity logged successfully",
      activityLog
    });
  } catch (error) {
    console.error("Error logging user activity:", error);
    res.status(500).json({ message: "Failed to log activity", error: error.message });
  }
};

// Update user preferences for ML algorithm
export const updateUserPreferences = async (req, res) => {
  try {
    const { preferredTopics, preferredTime, learningStyle, difficultyLevel } = req.body;
    const userId = req.user.id;

    const preferences = await prisma.userPreference.upsert({
      where: {
        userId
      },
      update: {
        preferredTopics: preferredTopics || undefined,
        preferredTime: preferredTime || undefined,
        learningStyle: learningStyle || undefined,
        difficultyLevel: difficultyLevel || undefined
      },
      create: {
        userId,
        preferredTopics: preferredTopics || [],
        preferredTime,
        learningStyle,
        difficultyLevel
      }
    });

    // Regenerate recommendations based on new preferences
    await generateRecommendations(userId);

    res.status(200).json({
      message: "Preferences updated successfully",
      preferences
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    res.status(500).json({ message: "Failed to update preferences", error: error.message });
  }
};

// Get personalized recommendations for a user
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get the latest recommendations
    const recommendations = await prisma.mLRecommendation.findMany({
      where: {
        userId
      },
      orderBy: {
        score: 'desc'
      },
      take: 5
    });

    // If no recommendations exist, generate them
    if (recommendations.length === 0) {
      await generateRecommendations(userId);
      
      // Fetch the newly generated recommendations
      const newRecommendations = await prisma.mLRecommendation.findMany({
        where: {
          userId
        },
        orderBy: {
          score: 'desc'
        },
        take: 5
      });
      
      return res.status(200).json(newRecommendations);
    }
    
    res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error getting recommendations:", error);
    res.status(500).json({ message: "Failed to get recommendations", error: error.message });
  }
};

// Get user activity statistics
export const getUserActivityStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get activity counts by type
    const activityCounts = await prisma.userActivityLog.groupBy({
      by: ['activityType'],
      where: {
        userId
      },
      _count: {
        id: true
      }
    });
    
    // Get total time spent on activities
    const totalTimeSpent = await prisma.userActivityLog.aggregate({
      where: {
        userId,
        duration: {
          not: null
        }
      },
      _sum: {
        duration: true
      }
    });
    
    // Get average completion rate
    const avgCompletionRate = await prisma.userActivityLog.aggregate({
      where: {
        userId,
        completionRate: {
          not: null
        }
      },
      _avg: {
        completionRate: true
      }
    });
    
    // Get activity trend over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activityTrend = await prisma.userActivityLog.groupBy({
      by: ['startTime'],
      where: {
        userId,
        startTime: {
          gte: sevenDaysAgo
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });
    
    res.status(200).json({
      activityCounts: activityCounts || [],
      totalTimeSpent: totalTimeSpent && totalTimeSpent._sum ? totalTimeSpent._sum.duration || 0 : 0,
      avgCompletionRate: avgCompletionRate && avgCompletionRate._avg ? avgCompletionRate._avg.completionRate || 0 : 0,
      activityTrend: activityTrend || []
    });
  } catch (error) {
    console.error("Error getting user activity stats:", error);
    res.status(500).json({ message: "Failed to get activity statistics", error: error.message });
  }
};

// Helper function to generate recommendations using ML algorithms
async function generateRecommendations(userId) {
  try {
    // Clear existing recommendations
    await prisma.mLRecommendation.deleteMany({
      where: {
        userId
      }
    });
    
    // Get user activity logs
    const activityLogs = await prisma.userActivityLog.findMany({
      where: {
        userId
      },
      orderBy: {
        startTime: 'desc'
      },
      take: 50 // Consider last 50 activities
    });
    
    // Get user preferences
    const preferences = await prisma.userPreference.findUnique({
      where: {
        userId
      }
    });
    
    // Get completed subtopics
    const completedSubtopics = await prisma.subtopicCompletion.findMany({
      where: {
        user_id: userId
      },
      include: {
        subtopic: true
      }
    });
    
    // Get all activities
    const allActivities = await prisma.activities.findMany({
      include: {
        subtopics: true
      }
    });
    
    // Simple recommendation algorithm (placeholder for actual ML)
    // In a real implementation, this would use a trained ML model
    
    const recommendations = [];
    
    // 1. Recommend next topics based on completion patterns
    const nextTopicRecommendations = predictNextActivity(activityLogs, allActivities);
    recommendations.push(...nextTopicRecommendations.map(rec => ({
      userId,
      activityId: rec.activityId,
      subtopicId: rec.subtopicId,
      recommendationType: "next_topic",
      score: rec.score,
      reason: rec.reason
    })));
    
    // 2. Recommend similar content based on user preferences
    if (preferences && preferences.preferredTopics && preferences.preferredTopics.length > 0) {
      try {
        const similarContentRecs = allActivities
          .filter(activity => !activityLogs.some(log => log.activityId === activity.id))
          .map(activity => {
            try {
              const similarityScore = calculateSimilarity(activity, preferences.preferredTopics);
              return {
                userId,
                activityId: activity.id,
                recommendationType: "similar_content",
                score: similarityScore,
                reason: `Based on your interest in ${preferences.preferredTopics.join(', ')}`
              };
            } catch (error) {
              console.error("Error calculating similarity for activity:", activity.id, error);
              return null;
            }
          })
          .filter(rec => rec && rec.score > 0.5) // Only include high similarity scores and filter out nulls
          .slice(0, 3); // Top 3 similar content recommendations

        recommendations.push(...similarContentRecs);
      } catch (error) {
        console.error("Error generating similar content recommendations:", error);
      }
    }
    
    // 3. Group suggestions based on learning patterns
    // This would typically use collaborative filtering in a real ML implementation
    
    // Save all recommendations to the database
    if (recommendations.length > 0) {
      try {
        // Ensure all recommendations have the required fields
        const validRecommendations = recommendations.filter(rec =>
          rec && rec.userId && rec.recommendationType && typeof rec.score === 'number'
        );

        if (validRecommendations.length > 0) {
          await prisma.mLRecommendation.createMany({
            data: validRecommendations
          });
        }
      } catch (error) {
        console.error("Error saving recommendations to database:", error);
      }
    }
    
    return recommendations;
  } catch (error) {
    console.error("Error generating recommendations:", error);
    throw error;
  }
}