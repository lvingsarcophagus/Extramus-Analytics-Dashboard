import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Database, HelpCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DatabaseDiagnostics {
  databaseConnection: boolean;
  systemInfo: {
    currentTime?: string;
    version?: string;
    user?: string;
    database?: string;
  };
  tablesInfo: {
    existingTables?: string[];
    [key: string]: any;
  };
  permissionIssues: Array<{
    table: string;
    error: string;
  }>;
  missingTables: string[];
  suggestedFixes: Array<{
    issue: string;
    solution: string;
  }>;
  alternativeTables?: string[];
}

export function DatabaseStatusPanel() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [diagnostics, setDiagnostics] = useState<DatabaseDiagnostics | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const checkDatabaseStatus = async () => {
    setIsLoading(true);
    
    try {
      // Basic status check
      const statusRes = await fetch('/api/database-status');
      const statusData = await statusRes.json();
      setIsConnected(statusData.available);
      
      // Extended diagnostics if connected
      if (statusData.available) {
        try {
          const diagnosticsRes = await fetch('/api/db-diagnostics');
          const diagnosticsData = await diagnosticsRes.json();
          setDiagnostics(diagnosticsData);
        } catch (error) {
          console.error('Failed to fetch diagnostics:', error);
        }
      }
    } catch (error) {
      console.error('Failed to check database status:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </CardTitle>
          {!isLoading && (
            <Badge variant={isConnected ? "default" : "destructive"} className={isConnected ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <>
            <div className="text-sm space-y-2">
              {isConnected ? (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p>Database connection successful</p>
                    {diagnostics && (
                      <p className="text-muted-foreground text-xs">
                        {diagnostics.systemInfo.database} | {diagnostics.systemInfo.user}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  <div>
                    <p>Database connection failed</p>
                    <p className="text-muted-foreground text-xs">
                      Using fallback sample data
                    </p>
                  </div>
                </div>
              )}
              
              {diagnostics?.permissionIssues && diagnostics.permissionIssues.length > 0 && (
                <div className="flex items-start gap-2 mt-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <p>Permission issues detected</p>
                    <p className="text-muted-foreground text-xs">
                      {diagnostics.permissionIssues.length} table{diagnostics.permissionIssues.length !== 1 && 's'} with permission errors
                    </p>
                  </div>
                </div>
              )}
              
              {diagnostics?.missingTables && diagnostics.missingTables.length > 0 && (
                <div className="flex items-start gap-2 mt-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <p>Missing tables detected</p>
                    <p className="text-muted-foreground text-xs">
                      {diagnostics.missingTables.length} missing table{diagnostics.missingTables.length !== 1 && 's'}
                    </p>
                  </div>
                </div>
              )}
              
              {lastChecked && (
                <p className="text-muted-foreground text-xs mt-2">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        <Button variant="outline" size="sm" onClick={checkDatabaseStatus} disabled={isLoading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <Dialog open={showHelp} onOpenChange={setShowHelp}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <HelpCircle className="h-3.5 w-3.5 mr-1" />
              Help
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Database Troubleshooting</DialogTitle>
              <DialogDescription>
                Solutions for common database issues
              </DialogDescription>
            </DialogHeader>
            
            {diagnostics?.suggestedFixes && diagnostics.suggestedFixes.length > 0 ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/30">
                  <h3 className="font-semibold mb-2">Detected Issues</h3>
                  <ul className="space-y-3">
                    {diagnostics.suggestedFixes.map((fix, index) => (
                      <li key={index} className="space-y-1">
                        <p className="font-medium">{fix.issue}</p>
                        <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
                          {fix.solution}
                        </pre>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {diagnostics?.permissionIssues && diagnostics.permissionIssues.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Permission Errors</h3>
                    <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
                      {diagnostics.permissionIssues.map(issue => 
                        `${issue.table}: ${issue.error}`
                      ).join('\n')}
                    </pre>
                    <p className="text-sm mt-2">
                      You can grant the necessary permissions with:
                    </p>
                    <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
{`-- Connect as database superuser first
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${diagnostics.systemInfo.user || 'your_user'};
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${diagnostics.systemInfo.user || 'your_user'};
`}
                    </pre>
                  </div>
                )}
                
                {diagnostics?.missingTables && diagnostics.missingTables.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Missing Tables</h3>
                    <p className="text-sm">
                      The following tables are missing from the database:
                    </p>
                    <ul className="list-disc list-inside text-sm">
                      {diagnostics.missingTables.map(table => (
                        <li key={table}>{table}</li>
                      ))}
                    </ul>
                    <p className="text-sm mt-2">
                      See DATABASE_PERMISSIONS_GUIDE.md for table schemas.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p>No specific issues detected. If you're still experiencing problems, please check:</p>
                <ul className="list-disc list-inside text-left mt-2">
                  <li>Database connection settings in .env.local</li>
                  <li>Database server is running</li>
                  <li>Network connectivity to database server</li>
                  <li>User permissions in PostgreSQL</li>
                </ul>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHelp(false)}>
                Close
              </Button>
              <Button variant="default" onClick={() => window.open('/DATABASE_PERMISSIONS_GUIDE.md', '_blank')}>
                Open Guide
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
