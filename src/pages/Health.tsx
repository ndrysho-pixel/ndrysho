import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import heroHealth from '@/assets/hero-health.jpg';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function Health() {
  const { language, t } = useLanguage();

  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[300px] overflow-hidden">
        <img 
          src={heroHealth} 
          alt="Health and nutrition" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="relative container h-full flex flex-col justify-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('Shëndet & Ushqim', 'Health & Nutrition')}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            {t(
              'Udhëzime praktike për një jetë më të shëndetshme',
              'Practical guidance for a healthier life'
            )}
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 px-4">
        <div className="container max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(article => (
                <Link key={article.id} to={`/health/${article.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow overflow-hidden">
                    {article.image_url && (
                      <img 
                        src={article.image_url} 
                        alt={language === 'sq' ? article.title_sq : article.title_en}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">
                        {language === 'sq' ? article.title_sq : article.title_en}
                      </CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(article.published_at), 'dd/MM/yyyy')}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {language === 'sq' ? article.content_sq.substring(0, 150) : article.content_en.substring(0, 150)}...
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {t(
                  'Nuk ka artikuj në këtë moment. Kontrolloni përsëri së shpejti!',
                  'No articles at the moment. Check back soon!'
                )}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
