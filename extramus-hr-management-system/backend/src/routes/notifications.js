const express = require('express');
const { query, param, body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const authenticateToken = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Get notifications for current user
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('isRead').optional().isBoolean().withMessage('isRead must be boolean'),
  query('type').optional().isIn(['document_uploaded', 'document_verified', 'document_rejected', 'document_expired', 'bill_due', 'system_announcement', 'housing_update']).withMessage('Invalid notification type')
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
    const { isRead, type } = req.query;

    const where = { userId: req.user.id };
    if (isRead !== undefined) where.isRead = isRead === 'true';
    if (type) where.type = type;

    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          intern: {
            select: {
              internId: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ 
        where: { 
          userId: req.user.id, 
          isRead: false 
        } 
      })
    ]);

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      },
      unreadCount
    });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, [
  param('notificationId').isInt().withMessage('Valid notification ID is required')
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

    const { notificationId } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(notificationId),
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found',
        code: 'NOTIFICATION_NOT_FOUND'
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: parseInt(notificationId) },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      message: 'Notification marked as read',
      notification: updatedNotification
    });
  } catch (error) {
    next(error);
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req, res, next) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      message: 'All notifications marked as read',
      updatedCount: result.count
    });
  } catch (error) {
    next(error);
  }
});

// Send notification to users (admin only)
router.post('/send', authenticateToken, authorize('hr', 'super_admin'), [
  body('userIds').optional().isArray().withMessage('User IDs must be an array'),
  body('userIds.*').optional().isInt().withMessage('Each user ID must be an integer'),
  body('internIds').optional().isArray().withMessage('Intern IDs must be an array'),
  body('internIds.*').optional().isInt().withMessage('Each intern ID must be an integer'),
  body('role').optional().isIn(['intern', 'hr', 'super_admin']).withMessage('Invalid role'),
  body('type').isIn(['document_uploaded', 'document_verified', 'document_rejected', 'document_expired', 'bill_due', 'system_announcement', 'housing_update']).withMessage('Invalid notification type'),
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be less than 255 characters'),
  body('message').trim().isLength({ min: 1 }).withMessage('Message is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('data').optional().isObject().withMessage('Data must be an object')
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

    const { userIds, internIds, role, type, title, message, priority = 'medium', data } = req.body;

    let targetUsers = [];

    // Get users by specific IDs
    if (userIds && userIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        include: {
          internDetails: true
        }
      });
      targetUsers = targetUsers.concat(users);
    }

    // Get users by role
    if (role) {
      const users = await prisma.user.findMany({
        where: { role },
        include: {
          internDetails: true
        }
      });
      targetUsers = targetUsers.concat(users);
    }

    // Get users by intern IDs
    if (internIds && internIds.length > 0) {
      const interns = await prisma.internDetails.findMany({
        where: { internId: { in: internIds } },
        include: {
          user: true
        }
      });
      const users = interns.map(intern => intern.user).filter(Boolean);
      targetUsers = targetUsers.concat(users);
    }

    // Remove duplicates
    const uniqueUsers = targetUsers.reduce((acc, user) => {
      if (!acc.find(u => u.id === user.id)) {
        acc.push(user);
      }
      return acc;
    }, []);

    if (uniqueUsers.length === 0) {
      return res.status(400).json({
        error: 'No target users found',
        code: 'NO_TARGET_USERS'
      });
    }

    // Create notifications
    const notifications = await Promise.all(
      uniqueUsers.map(user => 
        prisma.notification.create({
          data: {
            userId: user.id,
            internId: user.internDetails?.internId || null,
            type,
            title,
            message,
            priority,
            data
          }
        })
      )
    );

    res.status(201).json({
      message: 'Notifications sent successfully',
      sentCount: notifications.length,
      targetUsers: uniqueUsers.map(user => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Delete notification
router.delete('/:notificationId', authenticateToken, [
  param('notificationId').isInt().withMessage('Valid notification ID is required')
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

    const { notificationId } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(notificationId),
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found',
        code: 'NOTIFICATION_NOT_FOUND'
      });
    }

    await prisma.notification.delete({
      where: { id: parseInt(notificationId) }
    });

    res.json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get notification statistics (admin only)
router.get('/stats', authenticateToken, authorize('hr', 'super_admin'), async (req, res, next) => {
  try {
    const stats = await prisma.notification.groupBy({
      by: ['type', 'priority'],
      _count: { type: true },
      orderBy: { type: 'asc' }
    });

    const unreadStats = await prisma.notification.groupBy({
      by: ['type'],
      where: { isRead: false },
      _count: { type: true }
    });

    const recentNotifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            role: true
          }
        },
        intern: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      stats,
      unreadStats,
      recentNotifications
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
