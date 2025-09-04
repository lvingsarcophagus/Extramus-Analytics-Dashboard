const express = require('express');
const { query, validationResult } = require('express-validator');
const prisma = require('../config/database');
const authenticateToken = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Document analytics
router.get('/documents', authenticateToken, authorize('hr', 'super_admin'), [
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  query('departmentId').optional().isInt().withMessage('Valid department ID is required')
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

    const { startDate, endDate, departmentId } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Build where clause
    const where = { isActive: true };
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }

    // Add department filter if specified
    if (departmentId) {
      where.intern = {
        internshipInfo: {
          some: {
            departmentId: parseInt(departmentId)
          }
        }
      };
    }

    // Get document statistics
    const [
      statusStats,
      typeStats,
      dailyUploads,
      verificationTimes,
      completionRates
    ] = await Promise.all([
      // Documents by status
      prisma.internDocument.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      }),

      // Documents by type
      prisma.internDocument.groupBy({
        by: ['documentType'],
        where,
        _count: { documentType: true }
      }),

      // Daily uploads (last 30 days)
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM intern_documents 
        WHERE is_active = true
          AND created_at >= NOW() - INTERVAL '30 days'
          ${departmentId ? `AND intern_id IN (
            SELECT intern_id FROM internship_info WHERE department_id = ${departmentId}
          )` : ''}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `,

      // Average verification times
      prisma.internDocument.findMany({
        where: {
          ...where,
          status: 'verified',
          verifiedAt: { not: null }
        },
        select: {
          createdAt: true,
          verifiedAt: true,
          documentType: true
        }
      }),

      // Completion rates by intern
      prisma.internDetails.findMany({
        where: departmentId ? {
          internshipInfo: {
            some: {
              departmentId: parseInt(departmentId)
            }
          }
        } : {},
        include: {
          documents: {
            where: { isActive: true }
          },
          internshipInfo: {
            include: {
              department: true
            }
          }
        }
      })
    ]);

    // Calculate verification times by document type
    const verificationTimesByType = verificationTimes.reduce((acc, doc) => {
      const timeDiff = doc.verifiedAt.getTime() - doc.createdAt.getTime();
      const hours = timeDiff / (1000 * 60 * 60);
      
      if (!acc[doc.documentType]) {
        acc[doc.documentType] = [];
      }
      acc[doc.documentType].push(hours);
      return acc;
    }, {});

    const avgVerificationTimes = Object.entries(verificationTimesByType).map(([type, times]) => ({
      documentType: type,
      avgHours: times.reduce((sum, time) => sum + time, 0) / times.length,
      count: times.length
    }));

    // Calculate completion rates
    const requiredDocTypes = ['CV', 'ID_PASSPORT', 'ERASMUS_FORMS', 'INTERNSHIP_AGREEMENT'];
    const completionAnalysis = completionRates.map(intern => {
      const uploadedTypes = intern.documents.map(doc => doc.documentType);
      const completedRequired = requiredDocTypes.filter(type => uploadedTypes.includes(type));
      const completionRate = (completedRequired.length / requiredDocTypes.length) * 100;
      
      return {
        internId: intern.internId,
        name: intern.name,
        department: intern.internshipInfo[0]?.department?.departmentName || 'No Department',
        totalDocuments: intern.documents.length,
        requiredCompleted: completedRequired.length,
        completionRate: Math.round(completionRate)
      };
    });

    res.json({
      summary: {
        totalDocuments: statusStats.reduce((sum, stat) => sum + stat._count.status, 0),
        verifiedDocuments: statusStats.find(s => s.status === 'verified')?._count.status || 0,
        pendingDocuments: statusStats.find(s => s.status === 'pending')?._count.status || 0,
        rejectedDocuments: statusStats.find(s => s.status === 'rejected')?._count.status || 0
      },
      statusStats: statusStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {}),
      typeStats: typeStats.reduce((acc, stat) => {
        acc[stat.documentType] = stat._count.documentType;
        return acc;
      }, {}),
      dailyUploads: dailyUploads.map(day => ({
        date: day.date,
        count: parseInt(day.count)
      })),
      avgVerificationTimes,
      completionAnalysis: completionAnalysis.sort((a, b) => a.completionRate - b.completionRate)
    });
  } catch (error) {
    next(error);
  }
});

// Intern analytics
router.get('/interns', authenticateToken, authorize('hr', 'super_admin'), [
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required')
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

    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const where = {};
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }

    const [
      nationalityStats,
      genderStats,
      departmentStats,
      internshipStatusStats,
      monthlyRegistrations
    ] = await Promise.all([
      // Interns by nationality
      prisma.internDetails.groupBy({
        by: ['nationality'],
        where,
        _count: { nationality: true }
      }),

      // Interns by gender
      prisma.internDetails.groupBy({
        by: ['gender'],
        where,
        _count: { gender: true }
      }),

      // Interns by department
      prisma.internshipInfo.groupBy({
        by: ['departmentId'],
        where: Object.keys(dateFilter).length > 0 ? {
          intern: { createdAt: dateFilter }
        } : {},
        _count: { departmentId: true },
        include: {
          department: true
        }
      }),

      // Internship status distribution
      prisma.internshipInfo.groupBy({
        by: ['status'],
        where: Object.keys(dateFilter).length > 0 ? {
          intern: { createdAt: dateFilter }
        } : {},
        _count: { status: true }
      }),

      // Monthly registrations (last 12 months)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as count
        FROM intern_details 
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `
    ]);

    // Get department names
    const departments = await prisma.department.findMany();
    const departmentMap = departments.reduce((acc, dept) => {
      acc[dept.id] = dept.departmentName;
      return acc;
    }, {});

    res.json({
      summary: {
        totalInterns: await prisma.internDetails.count({ where }),
        activeInternships: internshipStatusStats.find(s => s.status === 'Active')?._count.status || 0,
        completedInternships: internshipStatusStats.find(s => s.status === 'Completed')?._count.status || 0
      },
      nationalityStats: nationalityStats
        .filter(stat => stat.nationality)
        .reduce((acc, stat) => {
          acc[stat.nationality] = stat._count.nationality;
          return acc;
        }, {}),
      genderStats: genderStats
        .filter(stat => stat.gender)
        .reduce((acc, stat) => {
          acc[stat.gender] = stat._count.gender;
          return acc;
        }, {}),
      departmentStats: departmentStats
        .filter(stat => stat.departmentId)
        .reduce((acc, stat) => {
          acc[departmentMap[stat.departmentId] || 'Unknown'] = stat._count.departmentId;
          return acc;
        }, {}),
      internshipStatusStats: internshipStatusStats
        .filter(stat => stat.status)
        .reduce((acc, stat) => {
          acc[stat.status] = stat._count.status;
          return acc;
        }, {}),
      monthlyRegistrations: monthlyRegistrations.map(month => ({
        month: month.month,
        count: parseInt(month.count)
      }))
    });
  } catch (error) {
    next(error);
  }
});

// System analytics
router.get('/system', authenticateToken, authorize('super_admin'), async (req, res, next) => {
  try {
    const [
      userStats,
      sessionStats,
      notificationStats,
      systemHealth
    ] = await Promise.all([
      // User statistics
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }),

      // Recent session activity (last 7 days)
      prisma.$queryRaw`
        SELECT 
          DATE(login_time) as date,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(*) as total_sessions
        FROM session_logs 
        WHERE login_time >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(login_time)
        ORDER BY date DESC
      `,

      // Notification statistics
      prisma.notification.groupBy({
        by: ['type', 'isRead'],
        _count: { type: true }
      }),

      // System health metrics
      Promise.all([
        prisma.internDocument.count({ where: { isActive: true } }),
        prisma.internDetails.count(),
        prisma.user.count(),
        prisma.notification.count({ where: { isRead: false } })
      ])
    ]);

    res.json({
      userStats: userStats.reduce((acc, stat) => {
        acc[stat.role] = stat._count.role;
        return acc;
      }, {}),
      sessionActivity: sessionStats.map(session => ({
        date: session.date,
        uniqueUsers: parseInt(session.unique_users),
        totalSessions: parseInt(session.total_sessions)
      })),
      notificationStats: {
        byType: notificationStats.reduce((acc, stat) => {
          if (!acc[stat.type]) acc[stat.type] = { total: 0, read: 0, unread: 0 };
          acc[stat.type].total += stat._count.type;
          if (stat.isRead) {
            acc[stat.type].read += stat._count.type;
          } else {
            acc[stat.type].unread += stat._count.type;
          }
          return acc;
        }, {})
      },
      systemHealth: {
        totalDocuments: systemHealth[0],
        totalInterns: systemHealth[1],
        totalUsers: systemHealth[2],
        unreadNotifications: systemHealth[3]
      }
    });
  } catch (error) {
    next(error);
  }
});

// Export analytics data
router.get('/export', authenticateToken, authorize('hr', 'super_admin'), [
  query('type').isIn(['documents', 'interns', 'users']).withMessage('Valid export type is required'),
  query('format').optional().isIn(['json', 'csv']).withMessage('Invalid format'),
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required')
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

    const { type, format = 'json', startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    let data;

    switch (type) {
      case 'documents':
        data = await prisma.internDocument.findMany({
          where: {
            isActive: true,
            ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
          },
          include: {
            intern: {
              select: {
                name: true,
                email: true,
                nationality: true
              }
            }
          }
        });
        break;

      case 'interns':
        data = await prisma.internDetails.findMany({
          where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
          include: {
            internshipInfo: {
              include: {
                department: true
              }
            },
            documents: {
              where: { isActive: true }
            }
          }
        });
        break;

      case 'users':
        if (req.user.role !== 'super_admin') {
          return res.status(403).json({
            error: 'Super admin access required',
            code: 'INSUFFICIENT_PERMISSIONS'
          });
        }
        data = await prisma.user.findMany({
          where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            createdAt: true,
            internDetails: {
              select: {
                nationality: true,
                gender: true
              }
            }
          }
        });
        break;
    }

    if (format === 'csv') {
      // For CSV export, you would typically use a library like json2csv
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${new Date().toISOString().split('T')[0]}.csv"`);
      
      // Simple CSV conversion (in production, use proper CSV library)
      const csvHeaders = Object.keys(data[0] || {}).join(',');
      const csvRows = data.map(row => Object.values(row).join(','));
      const csv = [csvHeaders, ...csvRows].join('\n');
      
      res.send(csv);
    } else {
      res.json({
        type,
        exportedAt: new Date().toISOString(),
        count: data.length,
        data
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
