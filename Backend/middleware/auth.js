import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No auth header or invalid format:', authHeader);
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1].trim();
  
  if (!token) {
    console.log('No token found in auth header');
    req.user = null;
    return next();
  }

  try {
    console.log('Attempting to verify token:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Token verified successfully:', decoded);
    
    // Map userId to id for consistency
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      isAdmin: decoded.isAdmin
    };
    
    console.log('Set user in request:', req.user);
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    req.user = null;
    next();
  }
};

// Strict authentication middleware that requires a valid token
export const requireAuth = (req, res, next) => {
  console.log("Auth Middleware Triggered on Route:", req.originalUrl);
  console.log("Auth Headers:", req.headers);

  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No auth header or invalid format:", authHeader);
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.split(" ")[1].trim();

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
    };

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(403).json({ message: "Authentication failed" });
  }
};
