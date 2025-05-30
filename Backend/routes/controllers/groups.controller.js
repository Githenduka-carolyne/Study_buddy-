import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// group creation
export const creategroup = async (req, res) => {
try {
    const { name, description, host } = req.body;
    const newGroup = await prisma.groups.create({
      data: {
        name:name, 
        description:description,
        host:host,
        members: [host]},
      });
     res.status(201).json({ message: "Group created successfully", newGroup });
} catch (error) {
    console.error(error);
     res.status(500).json({ error: error.message });
}
};

// join group
export const joingroup = async (req, res) => {
  const { groupId, userId } = req.body;
  try {
    // Find the group and include members
    const group = await prisma.groups.findUnique({
      where: { id: parseInt(groupId) },
      include: { members: true },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is already a member
    const isMember = group.members.some((member) => member.id === userId);

    if (isMember) {
      return res
        .status(400)
        .json({ message: "Already a member of this group" });
    }

    // Add user to group
    await prisma.groupMember.create({
      data: {
        user_id: userId,
        group_id: groupId,
        role: "member",
      },
    });

    // After user joins, fetch all messages for the group
    const messages = await prisma.groupMessage.findMany({
      where: { groupId: parseInt(groupId) },
      include: { user: true },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    res.status(200).json({
      message: "Joined group successfully",
      messages: messages, // Return the messages so the user can see them
    });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ error: error.message });
  }
};



export const getgroup = async(req, res)=>{
    try {
        const group= await prisma.groups.findMany();
        res.json({success:true, group: group})
    } catch (error) {
        console.error(e);
         res.status(500).json({ success: false, message: e.message });
    }
}

export const deletegroup = async(req, res)=>{
    try {
        const{id}=req.params;
        const deletegroup =await prisma.groups.delete({
            where:{id:parseInt(id)},
        });
        res.json({success: true, groups :{...deletegroup}});
    } catch (error) {
        console.error(e);
        res.status(500).json({ success: false, message: e.message });
    }
}

export const getgroupById =async (req, res)=>{
    try {
        const{id} =req.params;
        const groups =await prisma.groups.findUnique({
            where: {id: parseInt(id)},
        });
        if (!groups) {
          return res
            .status(404)
            .json({ success: false, message: "group not found" });
        }

        res.json({ success: true, menu: food });
    } catch (error) {
        console.error(e);
        res.status(500).json({ success: false, message: e.message });
    }
}
// Get messages for a group
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Ensure valid groupId
    if (isNaN(parseInt(groupId))) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    // Fetch messages for the group
    const messages = await prisma.groupMessage.findMany({
      where: { groupId: parseInt(groupId) },
      include: { user: true },
      orderBy: { createdAt: "asc" }, // Ensure messages are sorted by creation date (oldest first)
      take: 50, // Limit to 50 messages, you can adjust this as needed
    });

    if (!messages) {
      return res.status(404).json({ error: "No messages found" });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching group messages:", error);
    res.status(500).json({ error: "Failed to fetch group messages" });
  }
};


// Send a message to a group
export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;

    // Ensure the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Create the message in the database
    const message = await prisma.groupMessage.create({
      data: {
        content,
        groupId: parseInt(groupId),
        userId: req.user.id, // Ensure the user sending the message is included
      },
    });

    // Return the message as response
    res.status(200).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};
