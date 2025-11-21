import { useEffect, useRef, useState } from 'react';
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

interface GeoLocation {
  ip: string | null;
  country: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
}

const getVisitorGeoLocation = async (): Promise<GeoLocation> => {
  try {
    // First get IP from our edge function
    const { data: ipData, error: ipError } = await supabase.functions.invoke('get-visitor-ip');
    if (ipError) throw ipError;
    
    const ip = ipData?.ip;
    if (!ip) return { ip: null, country: null, city: null, latitude: null, longitude: null };

    // Then get geolocation data from ipapi.co (free tier: 1000 requests/day)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) throw new Error('Failed to fetch geolocation');
    
    const geoData = await response.json();
    
    return {
      ip,
      country: geoData.country_name || null,
      city: geoData.city || null,
      latitude: geoData.latitude || null,
      longitude: geoData.longitude || null,
    };
  } catch (error) {
    console.error('Error getting geolocation:', error);
    return { ip: null, country: null, city: null, latitude: null, longitude: null };
  }
};

export const useVisitorTracking = () => {
  const location = useLocation();
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string>(getOrCreateSessionId());
  const [geoLocation, setGeoLocation] = useState<GeoLocation>({
    ip: null,
    country: null,
    city: null,
    latitude: null,
    longitude: null,
  });

  // Get geolocation data once on mount
  useEffect(() => {
    getVisitorGeoLocation().then(setGeoLocation);
  }, []);

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
            ip_address: geoLocation.ip,
            country: geoLocation.country,
            city: geoLocation.city,
            latitude: geoLocation.latitude,
            longitude: geoLocation.longitude,
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
  }, [location.pathname, geoLocation]);

  return null;
};
