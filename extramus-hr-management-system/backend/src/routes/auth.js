const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { generateToken } = require('../config/jwt');
const prisma = require('../config/database');
const authenticateToken = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Register new user
router.post('/register', [
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['intern', 'hr', 'super_admin']).withMessage('Invalid role')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { fullName, email, password, role = 'intern' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Create intern details if role is intern
    if (role === 'intern') {
      await prisma.internDetails.create({
        data: {
          name: fullName,
          email: email
        }
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', authRateLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        internDetails: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Log session
    await prisma.sessionLog.create({
      data: {
        userId: user.id,
        email: user.email,
        loginTime: new Date(),
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Unknown',
        sessionId: token.substring(0, 32) // First 32 chars of token as session ID
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        internDetails: {
          include: {
            internshipInfo: {
              include: {
                department: true
              }
            },
            documents: {
              where: { isActive: true },
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        internDetails: true
      }
    });

    res.json({
      user
    });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/profile', authenticateToken, [
  body('fullName').optional().trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('nationality').optional().trim().isLength({ min: 2 }).withMessage('Nationality must be at least 2 characters'),
  body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('birthdate').optional().isISO8601().withMessage('Valid date is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { fullName, phone, nationality, gender, birthdate } = req.body;

    // Update user basic info
    const updateData = {};
    if (fullName) updateData.fullName = fullName;

    let updatedUser = req.user;
    if (Object.keys(updateData).length > 0) {
      updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          updatedAt: true
        }
      });
    }

    // Update intern details if user is intern
    if (req.user.role === 'intern' && req.user.internDetails) {
      const internUpdateData = {};
      if (fullName) internUpdateData.name = fullName;
      if (phone) internUpdateData.phone = phone;
      if (nationality) internUpdateData.nationality = nationality;
      if (gender) internUpdateData.gender = gender;
      if (birthdate) internUpdateData.birthdate = new Date(birthdate);

      if (Object.keys(internUpdateData).length > 0) {
        await prisma.internDetails.update({
          where: { internId: req.user.internDetails.internId },
          data: internUpdateData
        });
      }
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Current password is incorrect',
        code: 'INVALID_PASSWORD'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Logout (invalidate session - for audit purposes)
router.post('/logout', authenticateToken, async (req, res, next) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just log the logout event
    
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
