import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Heart, Briefcase, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';

type TrendingItem = {
  id: string;
  type: 'articles' | 'jobs' | 'myths';
  title: string;
  views: number;
};

export default function TrendingContent() {
  const { t, language } = useLanguage();

  const { data: trendingData, isLoading } = useQuery({
    queryKey: ['trendingContent'],
    queryFn: async () => {
      // Get page views from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: pageViews, error } = await supabase
        .from('page_views')
        .select('page_path')
        .gte('visited_at', sevenDaysAgo.toISOString());

      if (error) throw error;

      // Count views per content
      const viewCounts = new Map<string, { type: string; id: string; count: number }>();

      pageViews.forEach((view) => {
        const path = view.page_path;
        let match;

        if ((match = path.match(/^\/health\/([a-f0-9-]+)$/))) {
          const key = `articles:${match[1]}`;
          const current = viewCounts.get(key) || { type: 'articles', id: match[1], count: 0 };
          viewCounts.set(key, { ...current, count: current.count + 1 });
        } else if ((match = path.match(/^\/jobs\/([a-f0-9-]+)$/))) {
          const key = `jobs:${match[1]}`;
          const current = viewCounts.get(key) || { type: 'jobs', id: match[1], count: 0 };
          viewCounts.set(key, { ...current, count: current.count + 1 });
        } else if ((match = path.match(/^\/myths\/([a-f0-9-]+)$/))) {
          const key = `myths:${match[1]}`;
          const current = viewCounts.get(key) || { type: 'myths', id: match[1], count: 0 };
          viewCounts.set(key, { ...current, count: current.count + 1 });
        }
      });

      // Sort by view count and get top items
      const sortedItems = Array.from(viewCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Fetch content details
      const trending: TrendingItem[] = [];

      for (const item of sortedItems) {
        if (item.type === 'articles') {
          const { data } = await supabase
            .from('articles')
            .select('id, title_sq, title_en')
            .eq('id', item.id)
            .maybeSingle();

          if (data) {
            trending.push({
              id: data.id,
              type: 'articles',
              title: language === 'sq' ? data.title_sq : data.title_en,
              views: item.count,
            });
          }
        } else if (item.type === 'jobs') {
          const { data } = await supabase
            .from('jobs')
            .select('id, position_sq, position_en, business_name')
            .eq('id', item.id)
            .maybeSingle();

          if (data) {
            trending.push({
              id: data.id,
              type: 'jobs',
              title: `${language === 'sq' ? data.position_sq : data.position_en} - ${data.business_name}`,
              views: item.count,
            });
          }
        } else if (item.type === 'myths') {
          const { data } = await supabase
            .from('myths')
            .select('id, claim_sq, claim_en')
            .eq('id', item.id)
            .maybeSingle();

          if (data) {
            trending.push({
              id: data.id,
              type: 'myths',
              title: language === 'sq' ? data.claim_sq : data.claim_en,
              views: item.count,
            });
          }
        }
      }

      return trending;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'articles':
        return <Heart className="h-4 w-4" />;
      case 'jobs':
        return <Briefcase className="h-4 w-4" />;
      case 'myths':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'articles':
        return t('Artikull', 'Article');
      case 'jobs':
        return t('Punë', 'Job');
      case 'myths':
        return t('Mit', 'Myth');
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t('Përmbajtje në Trend (7 Ditët e Fundit)', 'Trending Content (Last 7 Days)')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !trendingData || trendingData.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {t('Nuk ka të dhëna për momentin', 'No data available yet')}
          </p>
        ) : (
          <div className="space-y-3">
            {trendingData.map((item, index) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                  {index + 1}
                </div>
                <div className="flex-shrink-0">{getIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {getTypeLabel(item.type)}
                  </Badge>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg font-bold text-primary">{item.views}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('shikime', 'views')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
