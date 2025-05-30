import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Get all study groups
router.get('/', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const groups = await prisma.study_group.findMany({
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
                _count: {
                    select: { members: true }
                }
            }
        });

        res.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get("/user", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userGroups = await prisma.groupMember.findMany({
      where: { user_id: req.user.id },
      include: {
        group: {
          include: {
            creator: { select: { id: true, name: true, emailAddress: true } },
            _count: { select: { members: true } },
          },
        },
      },
    });

    res.json(userGroups.map((member) => member.group));
  } catch (error) {
    console.error("Error fetching user groups:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a single study group by ID
router.get("/:groupId", async (req, res) => {
  try {
    console.log("Raw groupId from params:", req.params.groupId); // Log the raw input

    const groupId = Number(req.params.groupId);
    console.log("Parsed groupId:", groupId); // Log the parsed number

    if (isNaN(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    const group = await prisma.study_group.findUnique({
      where: { id: groupId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            emailAddress: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                emailAddress: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Create a new study group
router.post('/', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Group name is required' });
        }

        const group = await prisma.study_group.create({
            data: {
                name,
                description,
                created_by: parseInt(req.user.id),
                members: {
                    create: {
                        user_id: parseInt(req.user.id),
                        role: 'admin'
                    }
                }
            },
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
                }
            }
        });

        res.status(201).json(group);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Join a study group
router.post('/:groupId/join', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const groupId = parseInt(req.params.groupId, 10);
        const userId = parseInt(req.user.id, 10);

        // Check if group exists
        const group = await prisma.study_group.findUnique({
            where: { id: groupId },
            include: { members: true }
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is already a member
        const existingMember = await prisma.groupMember.findUnique({
            where: {
                user_id_group_id: {
                    user_id: userId,
                    group_id: groupId
                }
            }
        });

        if (existingMember) {
            return res.status(400).json({ message: 'Already a member of this group' });
        }

        // Add user to group
        const member = await prisma.groupMember.create({
            data: {
                user_id: userId,
                group_id: groupId,
                role: 'member'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        emailAddress: true
                    }
                },
                group: true
            }
        });

        res.json(member);
    } catch (error) {
        console.error('Error joining group:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Leave a study group
router.post('/:groupId/leave', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const groupId = Number(req.params.groupId);
        const userId = Number(req.user.id);

        console.log(`Raw groupId: ${req.params.groupId}`); // Debugging log
        console.log(`Parsed groupId: ${groupId}, Type: ${typeof groupId}`); 
        
        if (!groupId || isNaN(groupId) || isNaN(userId)) {
            return res.status(400).json({ message: "Invalid group ID or user ID" });
        }

        // Check if user is a member
        const member = await prisma.groupMember.findUnique({
            where: {
                user_id_group_id: {
                    user_id: userId,
                    group_id: groupId
                }
            },
            include: {
                group: true
            }
        });

        if (!member) {
            return res.status(404).json({ message: 'Not a member of this group' });
        }

        // Don't allow the creator to leave
        if (member.group.created_by === userId) {
            return res.status(400).json({ message: 'Group creator cannot leave the group' });
        }

        // Remove user from group
        await prisma.groupMember.delete({
            where: {
                user_id_group_id: {
                    user_id: userId,
                    group_id: groupId
                }
            }
        });

        res.json({ message: 'Successfully left the group' });
    } catch (error) {
        console.error('Error leaving group:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Check membership status
router.get('/:groupId/membership-status', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const groupId = parseInt(req.params.groupId, 10);
        const userId = parseInt(req.user.id, 10);

        // Check if user is a member of the group
        const member = await prisma.groupMember.findUnique({
            where: {
                user_id_group_id: {
                    user_id: userId,
                    group_id: groupId,
                },
            },
        });

        if (member) {
            return res.json({ isMember: true });
        } else {
            return res.json({ isMember: false });
        }
    } catch (error) {
        console.error('Error checking membership status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get messages for a group
router.get("/:groupId/messages", async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId, 10);

    // Ensure valid groupId
    if (isNaN(groupId)) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    // Fetch messages for the group
    const messages = await prisma.groupMessage.findMany({
      where: { groupId: groupId },
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
});


// Send a message to a group
router.post("/:groupId/messages", async (req, res) => {
  const { content } = req.body;
  const { groupId } = req.params;

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Message content is required" });
  }

  try {
    const newMessage = await prisma.groupMessage.create({
      data: {
        content,
        groupId: parseInt(groupId, 10),
        userId: req.user.id, // Ensure the correct user ID is associated
      },
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});


export default router;