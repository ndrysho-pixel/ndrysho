import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Briefcase, Heart, HelpCircle } from 'lucide-react';

export default function AuditLogsViewer() {
  const { t } = useLanguage();

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  const getActionBadge = (action: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      CREATE: 'default',
      UPDATE: 'secondary',
      DELETE: 'destructive',
    };
    return <Badge variant={variants[action] || 'default'}>{action}</Badge>;
  };

  const getTableIcon = (tableName: string) => {
    const icons: Record<string, any> = {
      jobs: <Briefcase className="h-4 w-4" />,
      articles: <Heart className="h-4 w-4" />,
      myths: <HelpCircle className="h-4 w-4" />,
    };
    return icons[tableName] || <FileText className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Regjistri i Veprimeve', 'Audit Log')}</CardTitle>
        <CardDescription>
          {t(
            'Historiku i të gjitha veprimeve administrative',
            'History of all administrative actions'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('Data', 'Date')}</TableHead>
                <TableHead>{t('Përdoruesi', 'User')}</TableHead>
                <TableHead>{t('Veprimi', 'Action')}</TableHead>
                <TableHead>{t('Tabela', 'Table')}</TableHead>
                <TableHead>{t('ID e Regjistrimit', 'Record ID')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">{log.user_email}</TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTableIcon(log.table_name)}
                      <span className="capitalize">{log.table_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.record_id?.substring(0, 8)}...
                  </TableCell>
                </TableRow>
              ))}
              {logs?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    {t('Nuk ka regjistrime', 'No logs available')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
