import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function Myths() {
  const { language, t } = useLanguage();

  const { data: myths, isLoading } = useQuery({
    queryKey: ['myths'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('myths')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            {t('Mit apo E Vërtetë?', 'Myth or Truth?')}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t(
              'Zbulo të vërtetën pas besimeve të zakonshme për shëndetin dhe ushqimin',
              'Discover the truth behind common beliefs about health and nutrition'
            )}
          </p>
        </div>
      </section>

      {/* Myths List */}
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
                </Card>
              ))}
            </div>
          ) : myths && myths.length > 0 ? (
            <div className="space-y-6">
              {myths.map(myth => (
                <Link key={myth.id} to={`/myths/${myth.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {myth.is_true ? (
                              <Badge className="bg-green-500 hover:bg-green-600">
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                {t('E Vërtetë', 'Truth')}
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="h-4 w-4 mr-1" />
                                {t('Mit', 'Myth')}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-2xl">
                            {language === 'sq' ? myth.claim_sq : myth.claim_en}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            <p className="line-clamp-2">
                              {language === 'sq' ? myth.explanation_sq : myth.explanation_en}
                            </p>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {t(
                  'Nuk ka shpjegime në këtë moment. Kontrolloni përsëri së shpejti!',
                  'No explanations at the moment. Check back soon!'
                )}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
