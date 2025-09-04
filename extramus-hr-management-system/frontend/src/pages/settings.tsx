import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

interface SystemSettings {
  general: {
    siteName: string;
    supportEmail: string;
    maxFileSize: number;
    allowedFileTypes: string[];
    autoVerification: boolean;
    emailNotifications: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
    maxLoginAttempts: number;
  };
  document: {
    retentionPeriod: number;
    requiredDocuments: string[];
    verificationDeadline: number;
    allowResubmission: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    reminderFrequency: number;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    // Check if user has permission to access settings
    if (user && !['hr', 'super_admin'].includes(user.role)) {
      router.push('/dashboard');
      return;
    }

    if (user) {
      fetchSettings();
    }
  }, [user, authLoading, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Demo settings data
      const demoSettings: SystemSettings = {
        general: {
          siteName: 'Extramus HR Document Management',
          supportEmail: 'support@extramus.com',
          maxFileSize: 10, // MB
          allowedFileTypes: ['PDF', 'JPG', 'PNG', 'DOC', 'DOCX'],
          autoVerification: false,
          emailNotifications: true
        },
        security: {
          sessionTimeout: 60, // minutes
          passwordMinLength: 8,
          requireTwoFactor: false,
          maxLoginAttempts: 5
        },
        document: {
          retentionPeriod: 24, // months
          requiredDocuments: ['Passport', 'Diploma', 'Transcript', 'Visa', 'Insurance'],
          verificationDeadline: 7, // days
          allowResubmission: true
        },
        notifications: {
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          reminderFrequency: 3 // days
        }
      };

      setSettings(demoSettings);
      setError('');
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError('');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    });
  };

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'document', name: 'Documents', icon: '📄' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' }
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user || !['hr', 'super_admin'].includes(user.role)) {
    return null;
  }

  if (error && !settings) {
    return (
      <Layout user={user}>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button onClick={fetchSettings} className="btn-primary">
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-1">
              Configure system preferences and security settings
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {successMessage && (
              <div className="text-green-600 text-sm">{successMessage}</div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="card">
              {/* General Settings */}
              {activeTab === 'general' && settings && (
                <div>
                  <div className="card-header">
                    <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
                    <p className="text-sm text-gray-500">Basic system configuration</p>
                  </div>
                  <div className="card-body space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={settings.general.siteName}
                        onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Support Email
                      </label>
                      <input
                        type="email"
                        value={settings.general.supportEmail}
                        onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum File Size (MB)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={settings.general.maxFileSize}
                        onChange={(e) => updateSetting('general', 'maxFileSize', parseInt(e.target.value))}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allowed File Types
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['PDF', 'JPG', 'PNG', 'DOC', 'DOCX', 'XLS', 'XLSX'].map((type) => (
                          <label key={type} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.general.allowedFileTypes.includes(type)}
                              onChange={(e) => {
                                const types = e.target.checked
                                  ? [...settings.general.allowedFileTypes, type]
                                  : settings.general.allowedFileTypes.filter(t => t !== type);
                                updateSetting('general', 'allowedFileTypes', types);
                              }}
                              className="mr-2 rounded"
                            />
                            <span className="text-sm">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.general.autoVerification}
                        onChange={(e) => updateSetting('general', 'autoVerification', e.target.checked)}
                        className="mr-3 rounded"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-700">Auto Verification</div>
                        <div className="text-sm text-gray-500">Automatically verify documents that pass validation</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.general.emailNotifications}
                        onChange={(e) => updateSetting('general', 'emailNotifications', e.target.checked)}
                        className="mr-3 rounded"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-700">Email Notifications</div>
                        <div className="text-sm text-gray-500">Send email notifications to users</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && settings && (
                <div>
                  <div className="card-header">
                    <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                    <p className="text-sm text-gray-500">Authentication and security configuration</p>
                  </div>
                  <div className="card-body space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        min="15"
                        max="480"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Password Length
                      </label>
                      <input
                        type="number"
                        min="6"
                        max="20"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Login Attempts
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="10"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                        className="input"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.requireTwoFactor}
                        onChange={(e) => updateSetting('security', 'requireTwoFactor', e.target.checked)}
                        className="mr-3 rounded"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-700">Require Two-Factor Authentication</div>
                        <div className="text-sm text-gray-500">Enforce 2FA for all users</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Settings */}
              {activeTab === 'document' && settings && (
                <div>
                  <div className="card-header">
                    <h3 className="text-lg font-medium text-gray-900">Document Settings</h3>
                    <p className="text-sm text-gray-500">Document management configuration</p>
                  </div>
                  <div className="card-body space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document Retention Period (months)
                      </label>
                      <input
                        type="number"
                        min="12"
                        max="84"
                        value={settings.document.retentionPeriod}
                        onChange={(e) => updateSetting('document', 'retentionPeriod', parseInt(e.target.value))}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Deadline (days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={settings.document.verificationDeadline}
                        onChange={(e) => updateSetting('document', 'verificationDeadline', parseInt(e.target.value))}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Required Documents
                      </label>
                      <div className="space-y-2">
                        {['Passport', 'Diploma', 'Transcript', 'Visa', 'Insurance', 'CV', 'Cover Letter'].map((doc) => (
                          <label key={doc} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.document.requiredDocuments.includes(doc)}
                              onChange={(e) => {
                                const docs = e.target.checked
                                  ? [...settings.document.requiredDocuments, doc]
                                  : settings.document.requiredDocuments.filter(d => d !== doc);
                                updateSetting('document', 'requiredDocuments', docs);
                              }}
                              className="mr-2 rounded"
                            />
                            <span className="text-sm">{doc}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.document.allowResubmission}
                        onChange={(e) => updateSetting('document', 'allowResubmission', e.target.checked)}
                        className="mr-3 rounded"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-700">Allow Resubmission</div>
                        <div className="text-sm text-gray-500">Allow users to resubmit rejected documents</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && settings && (
                <div>
                  <div className="card-header">
                    <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
                    <p className="text-sm text-gray-500">Configure how users receive notifications</p>
                  </div>
                  <div className="card-body space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reminder Frequency (days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="14"
                        value={settings.notifications.reminderFrequency}
                        onChange={(e) => updateSetting('notifications', 'reminderFrequency', parseInt(e.target.value))}
                        className="input"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailEnabled}
                          onChange={(e) => updateSetting('notifications', 'emailEnabled', e.target.checked)}
                          className="mr-3 rounded"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-700">Email Notifications</div>
                          <div className="text-sm text-gray-500">Send notifications via email</div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.smsEnabled}
                          onChange={(e) => updateSetting('notifications', 'smsEnabled', e.target.checked)}
                          className="mr-3 rounded"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-700">SMS Notifications</div>
                          <div className="text-sm text-gray-500">Send notifications via SMS</div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notifications.pushEnabled}
                          onChange={(e) => updateSetting('notifications', 'pushEnabled', e.target.checked)}
                          className="mr-3 rounded"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-700">Push Notifications</div>
                          <div className="text-sm text-gray-500">Send browser push notifications</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
