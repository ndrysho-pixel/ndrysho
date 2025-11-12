import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type ContentType = 'articles' | 'jobs' | 'myths';

export const useContentViews = (contentType: ContentType, contentId: string | undefined) => {
  useEffect(() => {
    if (!contentId) return;

    const incrementViews = async () => {
      try {
        // Get current views
        const { data: current } = await supabase
          .from(contentType)
          .select('views')
          .eq('id', contentId)
          .single();

        if (current) {
          // Increment views
          await supabase
            .from(contentType)
            .update({ views: (current.views || 0) + 1 })
            .eq('id', contentId);
        }
      } catch (error) {
        console.error('Error incrementing views:', error);
      }
    };

    incrementViews();
  }, [contentId, contentType]);
};