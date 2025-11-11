import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

export default function MythDetail() {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const { data: myth, isLoading } = useQuery({
    queryKey: ['myth', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('myths')
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
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!myth) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-muted-foreground">
          {t('Shpjegimi nuk u gjet', 'Explanation not found')}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/myths')}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('Kthehu te mitet', 'Back to myths')}
        </Button>

        <article className="space-y-6">
          <div>
            <div className="mb-4">
              {myth.is_true ? (
                <Badge className="bg-green-500 hover:bg-green-600 text-lg px-4 py-1">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  {t('E Vërtetë', 'Truth')}
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-lg px-4 py-1">
                  <XCircle className="h-5 w-5 mr-2" />
                  {t('Mit', 'Myth')}
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl font-bold mb-6">
              {language === 'sq' ? myth.claim_sq : myth.claim_en}
            </h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2>{t('Shpjegimi Shkencor', 'Scientific Explanation')}</h2>
            <div className="whitespace-pre-wrap">
              {language === 'sq' ? myth.explanation_sq : myth.explanation_en}
            </div>

            {myth.scientific_references && (
              <div className="mt-8 pt-6 border-t">
                <h3>{t('Referenca Shkencore', 'Scientific References')}</h3>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {myth.scientific_references}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
