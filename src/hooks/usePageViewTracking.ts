import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const SESSION_ID_KEY = 'visitor_session_id';

const getSessionId = () => {
  return localStorage.getItem(SESSION_ID_KEY) || '';
};

export const usePageViewTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const sessionId = getSessionId();
        const pagePath = location.pathname;
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
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname]);

  return null;
};