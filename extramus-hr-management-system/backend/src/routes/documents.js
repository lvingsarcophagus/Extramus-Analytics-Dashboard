const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { body, query, param, validationResult } = require('express-validator');
const prisma = require('../config/database');
const authenticateToken = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const upload = require('../config/multer');
const { uploadRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Get documents for current user (intern view)
router.get('/my-documents', authenticateToken, authorize('intern'), async (req, res, next) => {
  try {
    if (!req.user.internDetails) {
      return res.status(404).json({
        error: 'Intern details not found',
        code: 'INTERN_NOT_FOUND'
      });
    }

    const documents = await prisma.internDocument.findMany({
      where: {
        internId: req.user.internDetails.internId,
        isActive: true
      },
      orderBy: { createdAt: 'desc' },
      include: {
        verifications: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    res.json({
      documents: documents.map(doc => ({
        ...doc,
        latestVerification: doc.verifications[0] || null,
        verifications: undefined
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Get documents for specific intern (admin/manager view)
router.get('/intern/:internId', authenticateToken, authorize('hr', 'super_admin'), [
  param('internId').isInt().withMessage('Valid intern ID is required')
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

    const { internId } = req.params;
    const { status, documentType } = req.query;

    // Build where clause
    const where = {
      internId: parseInt(internId),
      isActive: true
    };

    if (status) where.status = status;
    if (documentType) where.documentType = documentType;

    const documents = await prisma.internDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        intern: {
          select: {
            internId: true,
            name: true,
            email: true
          }
        },
        verifications: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    res.json({ documents });
  } catch (error) {
    next(error);
  }
});

// Get all documents (admin view with filters)
router.get('/all', authenticateToken, authorize('hr', 'super_admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'under_review', 'verified', 'rejected', 'expired']),
  query('documentType').optional().isIn(['CV', 'ID_PASSPORT', 'ERASMUS_FORMS', 'INTERNSHIP_AGREEMENT', 'INSURANCE', 'ACCEPTANCE_LETTER', 'LEARNING_AGREEMENT', 'FINAL_REPORT', 'PROFILE_PICTURE', 'OTHER'])
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
    const { status, documentType, search } = req.query;

    // Build where clause
    const where = { isActive: true };
    if (status) where.status = status;
    if (documentType) where.documentType = documentType;

    // Add search functionality
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { intern: { name: { contains: search, mode: 'insensitive' } } },
        { intern: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [documents, totalCount] = await Promise.all([
      prisma.internDocument.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          intern: {
            select: {
              internId: true,
              name: true,
              email: true,
              nationality: true
            }
          },
          verifications: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }),
      prisma.internDocument.count({ where })
    ]);

    res.json({
      documents: documents.map(doc => ({
        ...doc,
        latestVerification: doc.verifications[0] || null,
        verifications: undefined
      })),
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

// Upload document
router.post('/upload', uploadRateLimiter, authenticateToken, authorize('intern'), upload.single('document'), [
  body('documentType').isIn(['CV', 'ID_PASSPORT', 'ERASMUS_FORMS', 'INTERNSHIP_AGREEMENT', 'INSURANCE', 'ACCEPTANCE_LETTER', 'LEARNING_AGREEMENT', 'FINAL_REPORT', 'PROFILE_PICTURE', 'OTHER']).withMessage('Valid document type is required'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
], async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        code: 'NO_FILE'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded file if validation fails
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    if (!req.user.internDetails) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(404).json({
        error: 'Intern details not found',
        code: 'INTERN_NOT_FOUND'
      });
    }

    const { documentType, notes } = req.body;
    const { filename, originalname, path: filePath, size, mimetype } = req.file;

    // Check if document type already exists and is not rejected
    const existingDoc = await prisma.internDocument.findFirst({
      where: {
        internId: req.user.internDetails.internId,
        documentType,
        isActive: true,
        status: { not: 'rejected' }
      }
    });

    if (existingDoc) {
      await fs.unlink(filePath).catch(() => {});
      return res.status(409).json({
        error: `${documentType} already uploaded and pending/verified`,
        code: 'DOCUMENT_EXISTS'
      });
    }

    // Create document record
    const document = await prisma.internDocument.create({
      data: {
        internId: req.user.internDetails.internId,
        documentType,
        fileName: filename,
        originalName: originalname,
        filePath: path.relative(process.cwd(), filePath),
        fileSize: size,
        mimeType: mimetype,
        notes,
        status: 'pending'
      },
      include: {
        intern: {
          select: {
            internId: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create verification record
    await prisma.documentVerification.create({
      data: {
        documentId: document.id,
        internId: req.user.internDetails.internId,
        action: 'upload',
        previousStatus: 'pending',
        newStatus: 'pending',
        comments: notes
      }
    });

    // Create notification for HR
    const hrUsers = await prisma.user.findMany({
      where: { role: { in: ['hr', 'super_admin'] } }
    });

    for (const hrUser of hrUsers) {
      await prisma.notification.create({
        data: {
          userId: hrUser.id,
          internId: req.user.internDetails.internId,
          type: 'document_uploaded',
          title: 'New Document Uploaded',
          message: `${req.user.internDetails.name} uploaded ${documentType}`,
          priority: 'medium',
          data: {
            documentId: document.id,
            documentType,
            internName: req.user.internDetails.name
          }
        }
      });
    }

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    // Clean up file if database operation fails
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
});

// Update document status (verify/reject)
router.put('/:documentId/status', authenticateToken, authorize('hr', 'super_admin'), [
  param('documentId').isInt().withMessage('Valid document ID is required'),
  body('action').isIn(['approve', 'reject', 'request_revision']).withMessage('Valid action is required'),
  body('comments').optional().trim().isLength({ max: 500 }).withMessage('Comments must be less than 500 characters')
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

    const { documentId } = req.params;
    const { action, comments } = req.body;

    // Get document
    const document = await prisma.internDocument.findUnique({
      where: { id: parseInt(documentId) },
      include: {
        intern: {
          include: {
            user: true
          }
        }
      }
    });

    if (!document) {
      return res.status(404).json({
        error: 'Document not found',
        code: 'DOCUMENT_NOT_FOUND'
      });
    }

    // Determine new status
    let newStatus;
    switch (action) {
      case 'approve':
        newStatus = 'verified';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'request_revision':
        newStatus = 'under_review';
        break;
    }

    // Update document
    const updatedDocument = await prisma.internDocument.update({
      where: { id: parseInt(documentId) },
      data: {
        status: newStatus,
        verifiedAt: action === 'approve' ? new Date() : null,
        rejectedAt: action === 'reject' ? new Date() : null,
        rejectionReason: action === 'reject' ? comments : null
      }
    });

    // Create verification record
    await prisma.documentVerification.create({
      data: {
        documentId: parseInt(documentId),
        internId: document.internId,
        verifierId: req.user.id,
        action,
        previousStatus: document.status,
        newStatus,
        comments
      }
    });

    // Create notification for intern
    if (document.intern.user) {
      const notificationTitle = {
        approve: 'Document Approved',
        reject: 'Document Rejected',
        request_revision: 'Document Revision Requested'
      };

      const notificationMessage = {
        approve: `Your ${document.documentType} has been approved`,
        reject: `Your ${document.documentType} has been rejected`,
        request_revision: `Revision requested for your ${document.documentType}`
      };

      await prisma.notification.create({
        data: {
          userId: document.intern.user.id,
          internId: document.internId,
          type: action === 'approve' ? 'document_verified' : 'document_rejected',
          title: notificationTitle[action],
          message: notificationMessage[action],
          priority: action === 'reject' ? 'high' : 'medium',
          data: {
            documentId: document.id,
            documentType: document.documentType,
            action,
            comments
          }
        }
      });
    }

    res.json({
      message: `Document ${action}d successfully`,
      document: updatedDocument
    });
  } catch (error) {
    next(error);
  }
});

// Download document
router.get('/:documentId/download', authenticateToken, [
  param('documentId').isInt().withMessage('Valid document ID is required')
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

    const { documentId } = req.params;

    // Get document
    const document = await prisma.internDocument.findUnique({
      where: { id: parseInt(documentId) },
      include: {
        intern: true
      }
    });

    if (!document) {
      return res.status(404).json({
        error: 'Document not found',
        code: 'DOCUMENT_NOT_FOUND'
      });
    }

    // Check access permissions
    const canAccess = 
      req.user.role === 'super_admin' ||
      req.user.role === 'hr' ||
      (req.user.role === 'intern' && req.user.internDetails?.internId === document.internId);

    if (!canAccess) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Check if file exists
    const filePath = path.resolve(document.filePath);
    
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        error: 'File not found on server',
        code: 'FILE_NOT_FOUND'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimeType);

    // Send file
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
});

// Delete document
router.delete('/:documentId', authenticateToken, [
  param('documentId').isInt().withMessage('Valid document ID is required')
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

    const { documentId } = req.params;

    // Get document
    const document = await prisma.internDocument.findUnique({
      where: { id: parseInt(documentId) }
    });

    if (!document) {
      return res.status(404).json({
        error: 'Document not found',
        code: 'DOCUMENT_NOT_FOUND'
      });
    }

    // Check permissions
    const canDelete = 
      req.user.role === 'super_admin' ||
      req.user.role === 'hr' ||
      (req.user.role === 'intern' && req.user.internDetails?.internId === document.internId && document.status === 'pending');

    if (!canDelete) {
      return res.status(403).json({
        error: 'Cannot delete this document',
        code: 'DELETE_NOT_ALLOWED'
      });
    }

    // Soft delete (mark as inactive)
    await prisma.internDocument.update({
      where: { id: parseInt(documentId) },
      data: { isActive: false }
    });

    // Create verification record
    await prisma.documentVerification.create({
      data: {
        documentId: parseInt(documentId),
        internId: document.internId,
        verifierId: req.user.role !== 'intern' ? req.user.id : null,
        action: 'delete',
        previousStatus: document.status,
        newStatus: document.status,
        comments: 'Document deleted'
      }
    });

    // Optionally delete physical file
    try {
      await fs.unlink(path.resolve(document.filePath));
    } catch (error) {
      console.warn('Could not delete physical file:', error.message);
    }

    res.json({
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get document statistics
router.get('/stats/overview', authenticateToken, authorize('hr', 'super_admin'), async (req, res, next) => {
  try {
    const stats = await prisma.internDocument.groupBy({
      by: ['status'],
      where: { isActive: true },
      _count: { status: true }
    });

    const documentTypeStats = await prisma.internDocument.groupBy({
      by: ['documentType'],
      where: { isActive: true },
      _count: { documentType: true }
    });

    const recentDocuments = await prisma.internDocument.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        intern: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      statusStats: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {}),
      documentTypeStats: documentTypeStats.reduce((acc, stat) => {
        acc[stat.documentType] = stat._count.documentType;
        return acc;
      }, {}),
      recentDocuments
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
