import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function HealthDetail() {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
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
        <Skeleton className="h-80 w-full mb-8" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-muted-foreground">
          {t('Artikulli nuk u gjet', 'Article not found')}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/health')}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('Kthehu te artikujt', 'Back to articles')}
        </Button>

        <article className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-4">
              {language === 'sq' ? article.title_sq : article.title_en}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(article.published_at), 'dd MMMM yyyy')}</span>
              <span>•</span>
              <span>{language === 'sq' ? article.category_sq : article.category_en}</span>
            </div>
          </div>

          {article.image_url && (
            <img 
              src={article.image_url} 
              alt={language === 'sq' ? article.title_sq : article.title_en}
              className="w-full h-96 object-cover rounded-lg"
            />
          )}

          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap">
              {language === 'sq' ? article.content_sq : article.content_en}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
