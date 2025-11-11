import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Briefcase, ExternalLink, ArrowLeft } from 'lucide-react';

export default function JobDetail() {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-muted-foreground">
          {t('Puna nuk u gjet', 'Job not found')}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/jobs')}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('Kthehu te punët', 'Back to jobs')}
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {language === 'sq' ? job.position_sq : job.position_en}
            </h1>
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                <span className="text-lg">{job.business_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">
                  {language === 'sq' ? job.location_sq : job.location_en}
                </span>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2>{t('Përshkrimi i Punës', 'Job Description')}</h2>
            <p className="whitespace-pre-wrap">
              {language === 'sq' ? job.description_sq : job.description_en}
            </p>
          </div>

          {job.application_link && (
            <div className="pt-6 border-t">
              <Button asChild size="lg">
                <a href={job.application_link} target="_blank" rel="noopener noreferrer">
                  {t('Apliko për këtë pozicion', 'Apply for this position')}
                  <ExternalLink className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
