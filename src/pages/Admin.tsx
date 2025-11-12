import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Briefcase, Heart, HelpCircle, LogOut, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JobsManager from '@/components/admin/JobsManager';
import ArticlesManager from '@/components/admin/ArticlesManager';
import MythsManager from '@/components/admin/MythsManager';
import AuditLogsViewer from '@/components/admin/AuditLogsViewer';
import VisitorAnalytics from '@/components/admin/VisitorAnalytics';
import { useToast } from '@/hooks/use-toast';

export default function Admin() {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user has admin role
  const { data: userRole, isLoading: roleLoading } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!roleLoading && user && !userRole) {
      navigate('/');
    }
  }, [userRole, roleLoading, user, navigate]);

  if (loading || roleLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: t('U shkëputët', 'Logged out'),
      description: t('Jeni shkëputur me sukses', 'Successfully logged out'),
    });
    navigate('/auth');
  };

  if (!userRole) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertDescription>
            {t(
              'Ju nuk keni qasje admin. Ju lutemi kontaktoni administratorët.',
              'You do not have admin access. Please contact administrators.'
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">
            {t('Paneli i Administratorit', 'Admin Dashboard')}
          </h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            {t('Dil', 'Logout')}
          </Button>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('Analitikë', 'Analytics')}
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              {t('Punë', 'Jobs')}
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {t('Artikuj', 'Articles')}
            </TabsTrigger>
            <TabsTrigger value="myths" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              {t('Mite', 'Myths')}
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('Regjistri', 'Audit Log')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <VisitorAnalytics />
          </TabsContent>

          <TabsContent value="jobs">
            <JobsManager />
          </TabsContent>

          <TabsContent value="articles">
            <ArticlesManager />
          </TabsContent>

          <TabsContent value="myths">
            <MythsManager />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogsViewer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
