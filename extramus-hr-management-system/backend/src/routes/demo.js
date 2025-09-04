// Demo data for testing without database connection
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Demo users for testing
const demoUsers = [
  {
    id: 1,
    fullName: 'John Doe',
    email: 'intern@example.com',
    password: 'password123', // Plain text for demo
    role: 'intern',
    department: 'Engineering',
    nationality: 'Turkish',
    internshipStartDate: '2024-01-15',
    internshipEndDate: '2024-07-15'
  },
  {
    id: 2,
    fullName: 'Jane Smith',
    email: 'hr@example.com',
    password: 'password123', // Plain text for demo
    role: 'hr',
    department: 'Human Resources',
    nationality: 'American'
  },
  {
    id: 3,
    fullName: 'Admin User',
    email: 'admin@example.com',
    password: 'password123', // Plain text for demo
    role: 'super_admin',
    department: 'Administration',
    nationality: 'Turkish'
  }
];

// Demo documents
const demoDocuments = [
  {
    id: 1,
    internId: 1,
    documentType: 'passport',
    filename: 'passport.pdf',
    originalName: 'passport.pdf',
    mimeType: 'application/pdf',
    size: 1024000,
    status: 'verified',
    uploadDate: '2024-08-20T10:00:00Z',
    verificationDate: '2024-08-21T14:30:00Z',
    verifiedBy: 2,
    comments: 'Document verified successfully'
  },
  {
    id: 2,
    internId: 1,
    documentType: 'cv',
    filename: 'cv.pdf',
    originalName: 'cv.pdf',
    mimeType: 'application/pdf',
    size: 512000,
    status: 'pending',
    uploadDate: '2024-08-25T09:15:00Z'
  }
];

// Demo analytics data
const demoAnalytics = {
  totalDocuments: 2,
  verifiedDocuments: 1,
  pendingDocuments: 1,
  rejectedDocuments: 0,
  totalInterns: 1,
  completionRate: 50,
  byDepartment: {
    'Engineering': 2,
    'Marketing': 0,
    'Sales': 0
  },
  byNationality: {
    'Turkish': 2,
    'Foreign': 0
  },
  recentActivity: [
    {
      action: 'Document uploaded',
      user: 'John Doe',
      document: 'CV',
      timestamp: '2024-08-25T09:15:00Z'
    },
    {
      action: 'Document verified',
      user: 'Jane Smith',
      document: 'Passport',
      timestamp: '2024-08-21T14:30:00Z'
    }
  ]
};

// Authentication
router.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = demoUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Simple password check for demo
    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/users/me', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    const user = demoUsers.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Dashboard analytics
router.get('/analytics/dashboard', (req, res) => {
  res.json(demoAnalytics);
});

// Get documents
router.get('/documents', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    let documents = demoDocuments;

    // Filter by user role
    if (decoded.role === 'intern') {
      documents = documents.filter(doc => doc.internId === decoded.userId);
    }

    res.json({ documents, total: documents.length });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Upload document (demo)
router.post('/documents/upload', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    
    // Simulate successful upload
    const newDocument = {
      id: Date.now(),
      internId: decoded.userId,
      documentType: 'demo',
      filename: 'demo-file.pdf',
      originalName: 'demo-file.pdf',
      mimeType: 'application/pdf',
      size: 1024000,
      status: 'pending',
      uploadDate: new Date().toISOString()
    };

    res.json({ 
      message: 'Document uploaded successfully (demo mode)',
      document: newDocument
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
