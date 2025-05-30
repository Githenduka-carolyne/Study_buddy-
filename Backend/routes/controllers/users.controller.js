import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// user signup
export const createUser = async (req, res) => {
  try {
    const { name, emailAddress, phoneNumber, Password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: { emailAddress },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email address is already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(Password, 10);
    const parsedPhone = parseInt(phoneNumber);

    // Create new user
    const newUser = await prisma.users.create({
      data: {
        name,
        emailAddress,
        phoneNumber: parsedPhone,
        Password: hashedPassword,
      },
    });

    // Return success without password
    res.status(201).json({ 
      success: true, 
      message: "Account created successfully",
      user: { 
        id: newUser.id,
        name: newUser.name,
        emailAddress: newUser.emailAddress,
        phoneNumber: newUser.phoneNumber
      } 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create account. Please try again." 
    });
  }
};

// user login
export const loginUser = async (req, res) => {
  try {
    const { emailAddress, Password } = req.body;

    const user = await prisma.users.findFirst({
      where: { emailAddress },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const passwordMatch = await bcrypt.compare(Password, user.Password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const payload = {
      id: user.id,
      name: user.name,
      emailAddress: user.emailAddress,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        emailAddress: user.emailAddress
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: "An error occurred during login. Please try again." 
    });
  }
};
