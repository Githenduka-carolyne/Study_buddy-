import express from 'express';
import {
  logUserActivity,
  updateUserPreferences,
  getRecommendations,
  getUserActivityStats
} from './controllers/ml-activity-tracking.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Log user activity
router.post('/log', logUserActivity);

// Update user preferences
router.put('/preferences', updateUserPreferences);

// Get personalized recommendations
router.get('/recommendations', getRecommendations);

// Get user activity statistics
router.get('/stats', getUserActivityStats);

export default router;