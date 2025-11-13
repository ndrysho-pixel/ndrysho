import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type ContentType = 'articles' | 'jobs' | 'myths';

export const useContentViews = (contentType: ContentType, contentId: string | undefined) => {
  useEffect(() => {
    if (!contentId) return;

    const incrementViews = async () => {
      try {
        // Use security definer functions to increment views for all visitors
        if (contentType === 'articles') {
          await supabase.rpc('increment_article_views', { article_id: contentId });
        } else if (contentType === 'jobs') {
          await supabase.rpc('increment_job_views', { job_id: contentId });
        } else if (contentType === 'myths') {
          await supabase.rpc('increment_myth_views', { myth_id: contentId });
        }
      } catch (error) {
        console.error('Error incrementing views:', error);
      }
    };

    incrementViews();
  }, [contentId, contentType]);
};