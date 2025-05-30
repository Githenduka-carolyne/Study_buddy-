import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const validateInfo = async (req, res, next) => {
  try {
    const { name, emailAddress, phoneNumber, Password } =
      req.body;
    const parsedPhone = parseInt(phoneNumber);
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Name required" });
    if (!emailAddress)
      return res
        .status(400)
        .json({ success: false, message: "Email Address required" });
    if (!phoneNumber)
      return res
        .status(400)
        .json({ success: false, message: "Phone Number required" });
    if (!Password)
      return res
        .status(400)
        .json({ success: false, message: "Password required" });

    const existingUser = await prisma.users.findFirst({
      where: { emailAddress: emailAddress },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email address.",
      });
    }

    const existingphoneNumber = await prisma.users.findFirst({
      where: { phoneNumber: parsedPhone },
    });

    if (existingphoneNumber) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this phone number.",
      });
    }

    next();
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const isAdmin = async (req, res, next) => {
  console.log("Checking if user is admin. User:", req.user);

  try {
    // Step 1: Check if the user is authenticated (token is valid)
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Step 2: Fetch the user from the database using userId from the token
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
    });

    console.log("Fetched user from DB:", user); // Log fetched user data

    // Step 3: Check if the user exists in the database
    if (!user) {
      console.log("User not found in DB. Token userId might be incorrect.");
      return res.status(404).json({ message: "User not found" });
    }

    // Step 4: Compare token's isAdmin with the user's actual isAdmin in DB.
    // If token says user is admin, override the isAdmin value from DB to match.
    if (req.user.isAdmin !== true) {
      console.log("Admin check failed. User is not admin:", user);
      return res.status(403).json({ message: "Admin access required" });
    }

    // Step 5: If user is admin, pass to the next middleware/route handler
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { isAdmin };

