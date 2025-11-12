import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

const HEARTBEAT_INTERVAL = 60000; // Update every 60 seconds
const SESSION_ID_KEY = 'visitor_session_id';

const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

export const useVisitorTracking = () => {
  const location = useLocation();
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string>(getOrCreateSessionId());

  useEffect(() => {
    const sessionId = sessionIdRef.current;
    const pagePath = location.pathname;
    const userAgent = navigator.userAgent;
    const referrer = document.referrer || null;

    // Insert or update visitor record
    const trackVisit = async () => {
      try {
        // Try to insert new visitor record
        const { error: insertError } = await supabase
          .from('active_visitors')
          .insert({
            session_id: sessionId,
            page_path: pagePath,
            user_agent: userAgent,
            referrer: referrer,
            last_seen: new Date().toISOString(),
          });

        // If insert fails due to duplicate session_id, update instead
        if (insertError && insertError.code === '23505') {
          await supabase
            .from('active_visitors')
            .update({
              page_path: pagePath,
              last_seen: new Date().toISOString(),
            })
            .eq('session_id', sessionId);
        }
      } catch (error) {
        console.error('Error tracking visitor:', error);
      }
    };

    // Initial track
    trackVisit();

    // Update last_seen timestamp periodically (heartbeat)
    const updateHeartbeat = async () => {
      try {
        await supabase
          .from('active_visitors')
          .update({
            page_path: pagePath,
            last_seen: new Date().toISOString(),
          })
          .eq('session_id', sessionId);
      } catch (error) {
        console.error('Error updating heartbeat:', error);
      }
    };

    // Set up heartbeat interval
    heartbeatRef.current = setInterval(updateHeartbeat, HEARTBEAT_INTERVAL);

    // Cleanup on unmount or route change
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [location.pathname]);

  return null;
};
