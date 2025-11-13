import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type ContentType = 'articles' | 'jobs' | 'myths';

const VIEWED_CONTENT_KEY = 'viewed_content';
const VIEW_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const hasRecentlyViewed = (contentType: ContentType, contentId: string): boolean => {
  try {
    const viewedContent = localStorage.getItem(VIEWED_CONTENT_KEY);
    if (!viewedContent) return false;

    const viewed = JSON.parse(viewedContent);
    const key = `${contentType}:${contentId}`;
    const lastViewed = viewed[key];

    if (!lastViewed) return false;

    // Check if viewed within the last 24 hours
    return Date.now() - lastViewed < VIEW_DURATION;
  } catch {
    return false;
  }
};

const markAsViewed = (contentType: ContentType, contentId: string) => {
  try {
    const viewedContent = localStorage.getItem(VIEWED_CONTENT_KEY);
    const viewed = viewedContent ? JSON.parse(viewedContent) : {};
    
    viewed[`${contentType}:${contentId}`] = Date.now();
    localStorage.setItem(VIEWED_CONTENT_KEY, JSON.stringify(viewed));
  } catch (error) {
    console.error('Error marking content as viewed:', error);
  }
};

export const useContentViews = (contentType: ContentType, contentId: string | undefined) => {
  useEffect(() => {
    if (!contentId) return;

    // Skip if already viewed recently
    if (hasRecentlyViewed(contentType, contentId)) {
      return;
    }

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

        // Mark as viewed after successful increment
        markAsViewed(contentType, contentId);
      } catch (error) {
        console.error('Error incrementing views:', error);
      }
    };

    incrementViews();
  }, [contentId, contentType]);
};