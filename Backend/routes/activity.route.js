import express from 'express';
import prisma from '../lib/prisma.js';
import {
  createActivity,
  deleteActivity,
} from "./controllers/activities.controller.js";


const router = express.Router();

// Get all activities
router.get('/', async (req, res) => {
    try {
        const activities = await prisma.activities.findMany({
            include: {
                subtopics: {
                    orderBy: {
                        order: 'asc'
                    },
                    select: {
                        id: true,
                        title: true,
                        order: true
                    }
                },
                activity_members: {
                    where: {
                        user_id: req.user?.id
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        
        const result = activities.map(activity => ({
            id: activity.id,
            title: activity.title,
            description: activity.description,
            subtopics: activity.subtopics,
            totalSubtopics: activity.subtopics.length,
            isJoined: activity.activity_members.length > 0,
            progress: activity.activity_members[0]?.progress || 0
        }));
        
        res.json(result);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create an activity
router.post('/', createActivity);
router.delete("/:id",deleteActivity);

// Get single activity with subtopics
router.get('/:id', async (req, res) => {
    try {
        const activity = await prisma.activities.findUnique({
            where: {
                id: req.params.id
            },
            include: {
                subtopics: {
                    orderBy: {
                        order: 'asc'
                    }
                },
                activity_members: {
                    where: {
                        user_id: req.user?.id
                    }
                }
            }
        });

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        // Get completion status for each subtopic
        const completions = await prisma.subtopicCompletion.findMany({
            where: {
                user_id: req.user?.id,
                subtopic: {
                    activity_id: activity.id
                }
            }
        });

        const completedSubtopicIds = new Set(completions.map(c => c.subtopic_id));

        const result = {
            id: activity.id,
            title: activity.title,
            description: activity.description,
            subtopics: activity.subtopics.map(st => ({
                id: st.id,
                title: st.title,
                content: st.content,
                order: st.order,
                isCompleted: completedSubtopicIds.has(st.id)
            })),
            progress: activity.activity_members[0]?.progress || 0
        };

        res.json(result);
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get subtopic details
router.get('/:activityId/subtopics/:subtopicId', async (req, res) => {
    try {
        console.log('Fetching subtopic:', {
            activityId: req.params.activityId,
            subtopicId: req.params.subtopicId
        });

        const subtopic = await prisma.subtopics.findFirst({
            where: {
                id: req.params.subtopicId,
                activity_id: req.params.activityId
            }
        });

        console.log('Found subtopic:', subtopic);

        if (!subtopic) {
            return res.status(404).json({ message: 'Subtopic not found' });
        }

        // Check if the subtopic is completed by the user
        let isCompleted = false;
        if (req.user?.id) {
            const completion = await prisma.subtopicCompletion.findUnique({
                where: {
                    user_id_subtopic_id: {
                        user_id: req.user.id,
                        subtopic_id: subtopic.id
                    }
                }
            });
            isCompleted = !!completion;
        }

        const result = {
            ...subtopic,
            isCompleted
        };

        res.json(result);
    } catch (error) {
        console.error('Error fetching subtopic:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// Backend/routes/activity.route.js
router.get('/:id/subtopics', async (req, res) => {
  try {
    const subtopics = await prisma.subtopic.findMany({
      where: {
        activityId: req.params.id
      },
      select: {
        id: true,
        title: true,
        content: true,
        exercise_question: true,
        exercise_answer: true,
        isCompleted: true
      }
    });
    res.json(subtopics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get quiz questions for a subtopic
router.get('/subtopics/:subtopicId/quiz', async (req, res) => {
    try {
        console.log('Quiz request received, user:', req.user);
        
        if (!req.user) {
            console.log('No user found in request');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const { subtopicId } = req.params;
        console.log('Fetching quiz questions for subtopic:', subtopicId);

        // First check if the subtopic exists
        const subtopic = await prisma.subtopics.findUnique({
            where: {
                id: subtopicId
            }
        });

        if (!subtopic) {
            console.log('Subtopic not found:', subtopicId);
            return res.status(404).json({ message: 'Subtopic not found' });
        }

        console.log('Found subtopic:', subtopic);

        const quizQuestions = await prisma.quizQuestion.findMany({
            where: {
                subtopic_id: subtopicId
            },
            select: {
                id: true,
                question: true,
                choices: true,
                correctAnswer: true
            }
        });

        console.log('Found quiz questions:', quizQuestions.length);
        res.json(quizQuestions);
    } catch (error) {
        console.error('Error fetching quiz questions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark subtopic as complete
router.post('/subtopics/:subtopicId/complete', async (req, res) => {
    try {
        console.log('Mark complete request received, user:', req.user);
        
        if (!req.user || !req.user.id) {
            console.log('No user found in request');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const userId = parseInt(req.user.id);
        if (isNaN(userId)) {
            console.error('Invalid user ID:', req.user.id);
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const subtopicId = req.params.subtopicId;
        console.log('Marking subtopic as complete:', subtopicId, 'for user:', userId);

        // First check if the user exists
        const user = await prisma.users.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) {
            console.error('User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        const subtopic = await prisma.subtopics.findUnique({
            where: {
                id: subtopicId
            },
            include: {
                activity: {
                    include: {
                        subtopics: true
                    }
                }
            }
        });

        if (!subtopic) {
            console.log('Subtopic not found:', subtopicId);
            return res.status(404).json({ message: 'Subtopic not found' });
        }

        console.log('Found subtopic:', subtopic.id, 'in activity:', subtopic.activity_id);

        // Create or update completion record
        const completion = await prisma.subtopicCompletion.upsert({
            where: {
                user_id_subtopic_id: {
                    user_id: userId,
                    subtopic_id: subtopicId
                }
            },
            create: {
                user_id: userId,
                subtopic_id: subtopicId
            },
            update: {}
        });

        console.log('Updated completion record:', completion);

        // Calculate new progress
        const totalSubtopics = subtopic.activity.subtopics.length;
        const completedSubtopics = await prisma.subtopicCompletion.count({
            where: {
                user_id: userId,
                subtopic: {
                    activity_id: subtopic.activity_id
                }
            }
        });

        const progress = Math.round((completedSubtopics / totalSubtopics) * 100);
        console.log('Calculated progress:', progress, '% (', completedSubtopics, '/', totalSubtopics, ')');

        // Update activity member progress
        const activityMember = await prisma.activityMember.upsert({
            where: {
                activity_id_user_id: {
                    activity_id: subtopic.activity_id,
                    user_id: userId
                }
            },
            create: {
                activity_id: subtopic.activity_id,
                user_id: userId,
                progress
            },
            update: {
                progress
            }
        });

        console.log('Updated activity member:', activityMember);

        res.json({ 
            message: 'Subtopic marked as complete',
            progress,
            completion,
            activityMember
        });
    } catch (error) {
        console.error('Error marking subtopic as complete:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
