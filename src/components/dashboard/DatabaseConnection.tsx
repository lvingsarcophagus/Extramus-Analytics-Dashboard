"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DatabaseStatus {
  connected: boolean;
  message: string;
  timestamp?: string;
  tables?: Array<{ table_name: string }>;
  database_info?: {
    database_name: string;
    current_user: string;
    version: string;
  };
}

export function DatabaseConnection() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Connection test error:', error);
      setStatus({
        connected: false,
        message: 'Failed to test connection'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/interns');
      const data = await response.json();
      setStatus(prev => ({
        ...prev,
        connected: data.success,
        message: data.message,
        tables: data.tables,
        database_info: data.database_info
      } as DatabaseStatus));
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (status?.connected) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status?.connected === false) return <XCircle className="h-4 w-4 text-red-600" />;
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  };

  const getStatusVariant = () => {
    if (status?.connected) return "default";
    if (status?.connected === false) return "destructive";
    return "secondary";
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          PostgreSQL Database Connection
        </CardTitle>
        <CardDescription>
          Connection status to AWS RDS PostgreSQL instance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={getStatusVariant()}>
              {status?.connected ? 'Connected' : status?.connected === false ? 'Disconnected' : 'Unknown'}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testConnection}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Test Connection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTables}
              disabled={loading || !status?.connected}
            >
              <Database className="h-4 w-4 mr-2" />
              Show Tables
            </Button>
          </div>
        </div>

        {status?.message && (
          <div className="text-sm text-muted-foreground">
            <strong>Status:</strong> {status.message}
          </div>
        )}

        {status?.timestamp && (
          <div className="text-xs text-muted-foreground">
            Last checked: {new Date(status.timestamp).toLocaleString()}
          </div>
        )}

        {status?.database_info && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="text-sm font-medium">Database</div>
              <div className="text-sm text-muted-foreground">{status.database_info.database_name}</div>
            </div>
            <div>
              <div className="text-sm font-medium">User</div>
              <div className="text-sm text-muted-foreground">{status.database_info.current_user}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Version</div>
              <div className="text-sm text-muted-foreground">{status.database_info.version.split(' ')[0]}</div>
            </div>
          </div>
        )}

        {status?.tables && status.tables.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Available Tables ({status.tables.length}):</div>
            <div className="flex flex-wrap gap-1">
              {status.tables.map((table, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {table.table_name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground border-t pt-2">
          <strong>Host:</strong> ec2-13-49-23-125.eu-north-1.compute.amazonaws.com:5432
        </div>
      </CardContent>
    </Card>
  );
}
