import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';

interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'intern' | 'hr' | 'super_admin';
  department?: string;
  nationality?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLoginAt?: string;
  documentsCount: number;
  verifiedDocuments: number;
  pendingDocuments: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    role: 'intern' as User['role'],
    department: '',
    nationality: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    // Check if user has permission to access user management (only super_admin)
    if (user && user.role !== 'super_admin') {
      router.push('/dashboard');
      return;
    }

    if (user) {
      fetchUsers();
    }
  }, [user, authLoading, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Demo users data
      const demoUsers: User[] = [
        {
          id: 1,
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          role: 'intern',
          department: 'Engineering',
          nationality: 'USA',
          status: 'active',
          createdAt: '2024-01-10T08:00:00Z',
          lastLoginAt: '2024-01-28T15:30:00Z',
          documentsCount: 5,
          verifiedDocuments: 3,
          pendingDocuments: 2
        },
        {
          id: 2,
          fullName: 'Jane Smith',
          email: 'jane.smith@example.com',
          role: 'intern',
          department: 'Marketing',
          nationality: 'Canada',
          status: 'active',
          createdAt: '2024-01-12T09:15:00Z',
          lastLoginAt: '2024-01-27T11:45:00Z',
          documentsCount: 4,
          verifiedDocuments: 4,
          pendingDocuments: 0
        },
        {
          id: 3,
          fullName: 'Mike Wilson',
          email: 'mike.wilson@example.com',
          role: 'hr',
          department: 'Human Resources',
          nationality: 'UK',
          status: 'active',
          createdAt: '2024-01-05T07:30:00Z',
          lastLoginAt: '2024-01-28T16:20:00Z',
          documentsCount: 0,
          verifiedDocuments: 0,
          pendingDocuments: 0
        },
        {
          id: 4,
          fullName: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          role: 'intern',
          department: 'Operations',
          nationality: 'Australia',
          status: 'pending',
          createdAt: '2024-01-25T14:20:00Z',
          documentsCount: 2,
          verifiedDocuments: 0,
          pendingDocuments: 2
        },
        {
          id: 5,
          fullName: 'Alex Brown',
          email: 'alex.brown@example.com',
          role: 'intern',
          department: 'Finance',
          nationality: 'Germany',
          status: 'inactive',
          createdAt: '2024-01-20T10:00:00Z',
          lastLoginAt: '2024-01-25T09:30:00Z',
          documentsCount: 3,
          verifiedDocuments: 1,
          pendingDocuments: 2
        },
        {
          id: 6,
          fullName: 'Emma Davis',
          email: 'emma.davis@example.com',
          role: 'hr',
          department: 'Human Resources',
          nationality: 'France',
          status: 'active',
          createdAt: '2024-01-08T12:00:00Z',
          lastLoginAt: '2024-01-28T10:15:00Z',
          documentsCount: 0,
          verifiedDocuments: 0,
          pendingDocuments: 0
        }
      ];

      setUsers(demoUsers);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: User['status']) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    const statusLabels = {
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  const getRoleBadge = (role: User['role']) => {
    const roleStyles = {
      intern: 'bg-blue-100 text-blue-800',
      hr: 'bg-purple-100 text-purple-800',
      super_admin: 'bg-red-100 text-red-800'
    };

    const roleLabels = {
      intern: 'Intern',
      hr: 'HR Manager',
      super_admin: 'Super Admin'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleStyles[role]}`}>
        {roleLabels[role]}
      </span>
    );
  };

  const handleStatusChange = async (userId: number, newStatus: User['status']) => {
    // Simulate API call
    alert(`User ${userId} status changed to ${newStatus}`);
    
    // Update local state
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: newStatus }
        : u
    ));
  };

  const handleCreateUser = async () => {
    if (!newUser.fullName || !newUser.email) {
      alert('Please fill in all required fields');
      return;
    }

    // Simulate API call
    const createdUser: User = {
      id: Date.now(),
      ...newUser,
      status: 'pending',
      createdAt: new Date().toISOString(),
      documentsCount: 0,
      verifiedDocuments: 0,
      pendingDocuments: 0
    };

    setUsers([...users, createdUser]);
    setNewUser({
      fullName: '',
      email: '',
      role: 'intern',
      department: '',
      nationality: ''
    });
    setShowCreateModal(false);
    alert('User created successfully!');
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    if (action === 'activate') {
      setUsers(users.map(u => 
        selectedUsers.includes(u.id) 
          ? { ...u, status: 'active' }
          : u
      ));
    } else if (action === 'deactivate') {
      setUsers(users.map(u => 
        selectedUsers.includes(u.id) 
          ? { ...u, status: 'inactive' }
          : u
      ));
    }

    setSelectedUsers([]);
    alert(`Bulk action "${action}" applied to ${selectedUsers.length} users`);
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length 
        ? [] 
        : filteredUsers.map(u => u.id)
    );
  };

  const filteredUsers = users.filter(u => {
    const roleMatch = filterRole === 'all' || u.role === filterRole;
    const statusMatch = filterStatus === 'all' || u.status === filterStatus;
    const departmentMatch = filterDepartment === 'all' || u.department === filterDepartment;
    return roleMatch && statusMatch && departmentMatch;
  });

  const departments = Array.from(new Set(users.map(u => u.department).filter(Boolean) as string[]));

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'super_admin') {
    return null;
  }

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">
              Manage system users and their permissions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Add New User
            </button>
          </div>
        </div>

        {/* Filters and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stats Cards */}
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'intern').length}
              </div>
              <div className="text-sm text-gray-600">Interns</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {users.filter(u => u.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Role
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="input"
                >
                  <option value="all">All Roles</option>
                  <option value="intern">Intern</option>
                  <option value="hr">HR Manager</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Department
                </label>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="input"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  disabled={selectedUsers.length === 0}
                  className="btn-success flex-1 text-sm disabled:opacity-50"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  disabled={selectedUsers.length === 0}
                  className="btn-danger flex-1 text-sm disabled:opacity-50"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Users Table */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Users ({filteredUsers.length})
              </h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={toggleSelectAll}
                  className="mr-2 rounded"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="table-header-cell">User</th>
                  <th className="table-header-cell">Role</th>
                  <th className="table-header-cell">Department</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Documents</th>
                  <th className="table-header-cell">Last Login</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="table-row">
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          {user.nationality}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="table-cell text-sm text-gray-900">
                      {user.department || '-'}
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="table-cell">
                      <div className="text-sm">
                        <div className="text-gray-900">{user.documentsCount} total</div>
                        <div className="text-green-600">{user.verifiedDocuments} verified</div>
                        <div className="text-yellow-600">{user.pendingDocuments} pending</div>
                      </div>
                    </td>
                    <td className="table-cell text-sm text-gray-900">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <select
                          value={user.status}
                          onChange={(e) => handleStatusChange(user.id, e.target.value as User['status'])}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                        </select>
                        <button
                          onClick={() => alert(`Viewing user: ${user.fullName}`)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                    className="input"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="input"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value as User['role']})}
                    className="input"
                  >
                    <option value="intern">Intern</option>
                    <option value="hr">HR Manager</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    className="input"
                    placeholder="Enter department"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={newUser.nationality}
                    onChange={(e) => setNewUser({...newUser, nationality: e.target.value})}
                    className="input"
                    placeholder="Enter nationality"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  className="btn-primary"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
