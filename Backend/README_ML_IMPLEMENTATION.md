# ML-Based Activity Tracking Implementation

This document provides instructions for setting up and using the ML-based activity tracking system.

## Setup Instructions

### 1. Apply Database Migrations

Before running the application, you need to apply the database migrations to create the necessary tables:

```bash
cd Backend
npx prisma migrate dev --name add_ml_models
```

This will create the following tables:
- `user_activity_logs` - Stores detailed user activity data
- `user_preferences` - Stores user preferences for personalized recommendations
- `ml_recommendations` - Stores ML-generated recommendations

### 2. Generate Prisma Client

After applying migrations, generate the Prisma client:

```bash
npx prisma generate
```

### 3. Start the Backend Server

```bash
npm run dev
```

## API Endpoints

The ML activity tracking system exposes the following endpoints:

### Log User Activity
```
POST /api/ml-activity/log
```
Logs user activity for ML processing.

**Request Body:**
```json
{
  "activityType": "study_session",
  "activityId": "activity-uuid",
  "subtopicId": "subtopic-uuid",
  "duration": 300,
  "completionRate": 75,
  "score": null,
  "metadata": {
    "contentLength": 1500,
    "quizAttempted": false
  }
}
```

### Update User Preferences
```
PUT /api/ml-activity/preferences
```
Updates user preferences for ML algorithm.

**Request Body:**
```json
{
  "preferredTopics": ["javascript", "react", "node.js"],
  "preferredTime": "evening",
  "learningStyle": "visual",
  "difficultyLevel": "intermediate"
}
```

### Get Personalized Recommendations
```
GET /api/ml-activity/recommendations
```
Returns personalized activity recommendations based on user behavior.

### Get User Activity Statistics
```
GET /api/ml-activity/stats
```
Returns statistics about user activity patterns.

## Frontend Integration

The ML-based recommendations and statistics are displayed in the ActivityContent component. The system tracks:

1. Study session duration and completion
2. Quiz attempts and performance
3. User preferences and learning patterns

## Troubleshooting

If you encounter issues:

1. Check that all migrations have been applied
2. Ensure the Prisma client has been generated
3. Verify that the authentication middleware is working correctly
4. Check the console for specific error messages