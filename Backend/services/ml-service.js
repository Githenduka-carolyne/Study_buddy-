/**
 * ML Service for activity tracking and recommendations
 *
 * This service implements basic ML algorithms for:
 * 1. Content-based filtering
 * 2. Collaborative filtering
 * 3. Activity pattern recognition
 * 4. Next activity prediction
 */

// Calculate similarity between an activity and user preferences
export function calculateSimilarity(activity, preferredTopics) {
  // Simple implementation - in a real system, this would use NLP or embeddings
  const activityKeywords = [
    activity.title.toLowerCase(),
    activity.description.toLowerCase(),
    ...(activity.subtopics ? activity.subtopics.map((st) => st.title.toLowerCase()) : []),
  ]
    .join(" ")
    .split(/\W+/);

  // Count how many preferred topics appear in the activity keywords
  let matchCount = 0;
  for (const topic of preferredTopics) {
    if (
      activityKeywords.some((keyword) => keyword.includes(topic.toLowerCase()))
    ) {
      matchCount++;
    }
  }

  // Calculate similarity score (0-1)
  return preferredTopics.length > 0 ? matchCount / preferredTopics.length : 0;
}

// Predict next activities based on user's activity history
export function predictNextActivity(activityLogs, allActivities) {
  // This is a simplified implementation
  // In a real system, this would use a trained ML model (e.g., sequential recommendation)

  if (activityLogs.length === 0 || allActivities.length === 0) {
    return [];
  }

  const recommendations = [];

  // Get the most recent activity
  const mostRecentLog = activityLogs[0];

  // Find activities that are similar to the most recent one
  // or are logical next steps
  for (const activity of allActivities) {
    // Skip if this is the same activity
    if (activity.id === mostRecentLog.activityId) {
      continue;
    }

    // Calculate a simple relevance score
    let score = 0;
    let reason = "";

    // If the activity is part of the same topic/category
    if (activity.title && mostRecentLog.activityType && activity.title.includes(mostRecentLog.activityType)) {
      score += 0.3;
      reason = "Related to your recent activity";
    }

    // If the user has high completion rates in similar activities
    const similarActivityLogs = activityLogs.filter(
      (log) => log.activityType && activity.title && log.activityType === activity.title.split(" ")[0]
    );

    if (similarActivityLogs.length > 0) {
      const avgCompletionRate =
        similarActivityLogs.reduce(
          (sum, log) => sum + (log.completionRate || 0),
          0
        ) / similarActivityLogs.length;

      if (avgCompletionRate > 0.7) {
        score += 0.2;
        reason += reason
          ? " and you perform well in similar activities"
          : "You perform well in similar activities";
      }
    }

    // If the activity hasn't been started yet
    if (!activityLogs.some((log) => log.activityId === activity.id)) {
      score += 0.1;
      reason += reason
        ? " and you haven't tried this yet"
        : "You haven't tried this yet";
    }

    // Only include if score is significant
    if (score > 0.2) {
      recommendations.push({
        activityId: activity.id,
        subtopicId: activity.subtopics && activity.subtopics.length > 0 ? activity.subtopics[0].id : null, // Recommend first subtopic
        score,
        reason,
      });
    }
  }

  // Sort by score (highest first) and take top 3
  return recommendations.sort((a, b) => b.score - a.score).slice(0, 3);
}

// Analyze user activity patterns
export function analyzeActivityPatterns(activityLogs) {
  if (activityLogs.length < 5) {
    return {
      preferredTime: null,
      averageDuration: null,
      mostFrequentType: null,
      patterns: [],
    };
  }

  // Determine preferred time of day
  const hourCounts = {};
  for (const log of activityLogs) {
    const hour = new Date(log.startTime).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  }

  const preferredHour = Object.entries(hourCounts).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  let preferredTime;
  if (preferredHour >= 5 && preferredHour < 12) {
    preferredTime = "morning";
  } else if (preferredHour >= 12 && preferredHour < 17) {
    preferredTime = "afternoon";
  } else if (preferredHour >= 17 && preferredHour < 21) {
    preferredTime = "evening";
  } else {
    preferredTime = "night";
  }

  // Calculate average duration
  const durations = activityLogs
    .filter((log) => log.duration)
    .map((log) => log.duration);

  const averageDuration =
    durations.length > 0
      ? durations.reduce((sum, duration) => sum + duration, 0) /
        durations.length
      : null;

  // Determine most frequent activity type
  const typeCounts = {};
  for (const log of activityLogs) {
    typeCounts[log.activityType] = (typeCounts[log.activityType] || 0) + 1;
  }

  const mostFrequentType = Object.entries(typeCounts).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  // Identify patterns (simplified)
  const patterns = [];

  // Check for consistency in timing
  const timeConsistency = Object.values(hourCounts).some(
    (count) => count > activityLogs.length * 0.4
  );

  if (timeConsistency) {
    patterns.push({
      type: "time_consistency",
      description: `You tend to study during the ${preferredTime}`,
    });
  }

  // Check for activity type preference
  const typePreference = Object.values(typeCounts).some(
    (count) => count > activityLogs.length * 0.5
  );

  if (typePreference) {
    patterns.push({
      type: "type_preference",
      description: `You prefer ${mostFrequentType} activities`,
    });
  }

  return {
    preferredTime,
    averageDuration,
    mostFrequentType,
    patterns,
  };
}

// Generate personalized learning path
export function generateLearningPath(user, completedSubtopics, allActivities) {
  // This would be a more complex ML algorithm in a real implementation
  // For now, we'll implement a simple rule-based approach

  // Get all subtopics from all activities
  const allSubtopics = allActivities.flatMap((activity) =>
    activity.subtopics.map((subtopic) => ({
      ...subtopic,
      activityId: activity.id,
      activityTitle: activity.title,
    }))
  );

  // Filter out completed subtopics
  const completedIds = new Set(completedSubtopics.map((cs) => cs.subtopic_id));
  const incompleteSubtopics = allSubtopics.filter(
    (subtopic) => !completedIds.has(subtopic.id)
  );

  // Sort by a simple relevance score
  const scoredSubtopics = incompleteSubtopics.map((subtopic) => {
    let score = 0;

    // If part of an activity the user has already started
    if (
      completedSubtopics.some(
        (cs) =>
          allSubtopics.find((s) => s.id === cs.subtopic_id)?.activityId ===
          subtopic.activityId
      )
    ) {
      score += 0.5;
    }

    // If it's an introductory subtopic (usually at the beginning of an activity)
    if (subtopic.order === 1) {
      score += 0.3;
    }

    return {
      ...subtopic,
      score,
    };
  });

  // Sort by score and create a learning path
  const learningPath = scoredSubtopics
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((subtopic, index) => ({
      step: index + 1,
      subtopicId: subtopic.id,
      activityId: subtopic.activityId,
      title: subtopic.title,
      activityTitle: subtopic.activityTitle,
    }));

  return learningPath;
}
