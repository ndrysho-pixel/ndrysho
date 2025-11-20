import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const SESSION_ID_KEY = 'visitor_session_id';
const PAGE_VIEWS_KEY = 'tracked_page_views';
const VIEW_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const getSessionId = () => {
  return localStorage.getItem(SESSION_ID_KEY) || '';
};

const hasRecentlyViewed = (pagePath: string): boolean => {
  try {
    const trackedViews = localStorage.getItem(PAGE_VIEWS_KEY);
    if (!trackedViews) return false;

    const views = JSON.parse(trackedViews);
    const lastViewed = views[pagePath];

    if (!lastViewed) return false;

    // Check if viewed within the last 24 hours
    return Date.now() - lastViewed < VIEW_DURATION;
  } catch {
    return false;
  }
};

const markPageAsViewed = (pagePath: string) => {
  try {
    const trackedViews = localStorage.getItem(PAGE_VIEWS_KEY);
    const views = trackedViews ? JSON.parse(trackedViews) : {};
    
    views[pagePath] = Date.now();
    localStorage.setItem(PAGE_VIEWS_KEY, JSON.stringify(views));
  } catch (error) {
    console.error('Error marking page as viewed:', error);
  }
};

export const usePageViewTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const pagePath = location.pathname;

    // Skip if already viewed recently
    if (hasRecentlyViewed(pagePath)) {
      return;
    }

    const trackPageView = async () => {
      try {
        const sessionId = getSessionId();
        const referrer = document.referrer || null;
        const userAgent = navigator.userAgent;

        await supabase
          .from('page_views')
          .insert({
            session_id: sessionId,
            page_path: pagePath,
            referrer: referrer,
            user_agent: userAgent,
          });

        // Mark as viewed after successful tracking
        markPageAsViewed(pagePath);
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname]);

  return null;
};