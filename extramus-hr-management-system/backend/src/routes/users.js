const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const prisma = require('../config/database');
const authenticateToken = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, authorize('super_admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['intern', 'hr', 'super_admin']).withMessage('Invalid role'),
  query('search').optional().trim().isLength({ min: 1 }).withMessage('Search term required')
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { role, search } = req.query;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          internDetails: {
            select: {
              internId: true,
              name: true,
              nationality: true,
              phone: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:userId', authenticateToken, authorize('hr', 'super_admin'), [
  param('userId').isInt().withMessage('Valid user ID is required')
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

    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        internDetails: {
          include: {
            internshipInfo: {
              include: {
                department: true
              }
            },
            documents: {
              where: { isActive: true }
            },
            occupants: {
              include: {
                room: {
                  include: {
                    apartment: true
                  }
                }
              }
            }
          }
        },
        sessionLogs: {
          orderBy: { loginTime: 'desc' },
          take: 5
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update user role (super admin only)
router.put('/:userId/role', authenticateToken, authorize('super_admin'), [
  param('userId').isInt().withMessage('Valid user ID is required'),
  body('role').isIn(['intern', 'hr', 'super_admin']).withMessage('Valid role is required')
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

    const { userId } = req.params;
    const { role } = req.body;

    // Prevent changing own role
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        error: 'Cannot change your own role',
        code: 'CANNOT_CHANGE_OWN_ROLE'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// Get user session logs
router.get('/:userId/sessions', authenticateToken, authorize('super_admin'), [
  param('userId').isInt().withMessage('Valid user ID is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
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

    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [sessions, totalCount] = await Promise.all([
      prisma.sessionLog.findMany({
        where: { userId: parseInt(userId) },
        skip: offset,
        take: limit,
        orderBy: { loginTime: 'desc' }
      }),
      prisma.sessionLog.count({ where: { userId: parseInt(userId) } })
    ]);

    res.json({
      sessions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// Deactivate user (super admin only)
router.delete('/:userId', authenticateToken, authorize('super_admin'), [
  param('userId').isInt().withMessage('Valid user ID is required')
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

    const { userId } = req.params;

    // Prevent deleting own account
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        error: 'Cannot delete your own account',
        code: 'CANNOT_DELETE_OWN_ACCOUNT'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // For security, we don't actually delete the user, just deactivate
    // In a real application, you might want to implement soft delete
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        email: `${user.email}.deactivated.${Date.now()}`,
        fullName: `${user.fullName} (Deactivated)`
      }
    });

    res.json({
      message: 'User deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
