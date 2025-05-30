import { PrismaClient } from "@prisma/client";

const prisma= new PrismaClient();

// Fetch Activity Feed
export const activity =async (req, res)=>{
    try {
         const activities = await prisma.activity.find()
            .sort({ weight: -1, timestamp: -1 })
            .limit(20);
        res.status(200).json(activities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// // Create Activity
export const createActivity = async (req, res) => {
  try {
    const { title, description, subtopics } = req.body;
    const userId = req.user.id;
    console.log("Creating new activity for user:", userId);

    const newActivity = await prisma.activities.create({
      data: {
        title,
        description,
        // created_at,
        subtopics: {
          create: subtopics.map((subtopic) => ({
            title: subtopic.title,
            content: subtopic.content,
          })),
        },
        // include: {
        //   subtopics: true,
        // },
      },
    });

    console.log("New activity created:", newActivity);
    res.status(201).json(newActivity);
  } catch (err) {
    console.error("Error creating activity:", err);
    res
      .status(500)
      .json({ message: "Failed to create activity", error: err.message });
  }
};

export const deleteActivity = async (req, res) => {
  const activityId = req.params.id;
  const userId = req.user.id;

  try {
    const activity = await prisma.activities.findUnique({
      where: { id: activityId },
    });
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    console.log("Activity created_by:", activity.created_by);
    console.log("Current user ID:", userId);

    // If created_by is null, allow deletion (temporary solution)
    if (activity.created_by !== null && activity.created_by !== userId) {
      return res.status(403).json({
        message: "You do not have permission to delete this activity",
      });
    }

    await prisma.activities.delete({
      where: { id: activityId },
    });
    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Error deleting activity:", error);
    res
      .status(500)
      .json({ message: "Failed to delete activity", error: error.message });
  }
};