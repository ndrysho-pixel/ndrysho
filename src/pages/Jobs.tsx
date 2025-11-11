import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Briefcase, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroJobs from '@/assets/hero-jobs.jpg';

export default function Jobs() {
  const { language, t } = useLanguage();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('posted_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[300px] overflow-hidden">
        <img 
          src={heroJobs} 
          alt="Career opportunities" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="relative container h-full flex flex-col justify-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('Mundësi Pune', 'Job Opportunities')}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            {t(
              'Zbulo mundësi pune të përzgjedhura për të rinj',
              'Discover curated job opportunities for young professionals'
            )}
          </p>
        </div>
      </section>

      {/* Jobs List */}
      <section className="py-12 px-4">
        <div className="container max-w-5xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="space-y-6">
              {jobs.map(job => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-2xl">
                          {language === 'sq' ? job.position_sq : job.position_en}
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            {job.business_name}
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{language === 'sq' ? job.location_sq : job.location_en}</span>
                    </div>
                    <p className="text-sm line-clamp-3">
                      {language === 'sq' ? job.description_sq : job.description_en}
                    </p>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button asChild>
                      <Link to={`/jobs/${job.id}`}>
                        {t('Shiko Detajet', 'View Details')}
                      </Link>
                    </Button>
                    {job.application_link && (
                      <Button asChild variant="outline">
                        <a href={job.application_link} target="_blank" rel="noopener noreferrer">
                          {t('Apliko', 'Apply')}
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {t(
                  'Nuk ka mundësi pune në këtë moment. Kontrolloni përsëri së shpejti!',
                  'No job opportunities at the moment. Check back soon!'
                )}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
