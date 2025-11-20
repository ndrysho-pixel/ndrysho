import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Eye, TrendingUp, Monitor, Smartphone, Tablet } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { parseUserAgent } from '@/utils/deviceParser';
import { useEffect } from 'react';

export default function VisitorAnalytics() {
  // Fetch active visitors with details (last 5 minutes)
  const { data: activeVisitorsData, isLoading: loadingActive, refetch: refetchVisitors } = useQuery({
    queryKey: ['active-visitors-details'],
    queryFn: async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('active_visitors')
        .select('*')
        .gte('last_seen', fiveMinutesAgo)
        .order('last_seen', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  // Set up real-time subscription for visitor updates
  useEffect(() => {
    const channel = supabase
      .channel('active-visitors-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_visitors'
        },
        () => {
          refetchVisitors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchVisitors]);

  const activeVisitors = activeVisitorsData?.length || 0;

  // Visitor trends over last 7 days
  const { data: visitorTrends, isLoading: loadingTrends } = useQuery({
    queryKey: ['visitor-trends'],
    queryFn: async () => {
      const sevenDaysAgo = subDays(new Date(), 7);
      const { data, error } = await supabase
        .from('page_views')
        .select('visited_at')
        .gte('visited_at', sevenDaysAgo.toISOString());
      
      if (error) throw error;

      // Group by day
      const grouped = data?.reduce((acc: any, view: any) => {
        const day = format(startOfDay(new Date(view.visited_at)), 'MMM dd');
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(grouped || {}).map(([day, count]) => ({
        day,
        visits: count,
      }));
    },
  });

  // Peak hours analysis
  const { data: peakHours, isLoading: loadingPeakHours } = useQuery({
    queryKey: ['peak-hours'],
    queryFn: async () => {
      const yesterday = subDays(new Date(), 1);
      const { data, error } = await supabase
        .from('page_views')
        .select('visited_at')
        .gte('visited_at', yesterday.toISOString());
      
      if (error) throw error;

      // Group by hour
      const grouped = data?.reduce((acc: any, view: any) => {
        const hour = new Date(view.visited_at).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {});

      return Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        visits: grouped?.[i] || 0,
      }));
    },
  });

  // Most visited pages
  const { data: topPages, isLoading: loadingTopPages } = useQuery({
    queryKey: ['top-pages'],
    queryFn: async () => {
      const sevenDaysAgo = subDays(new Date(), 7);
      const { data, error } = await supabase
        .from('page_views')
        .select('page_path')
        .gte('visited_at', sevenDaysAgo.toISOString());
      
      if (error) throw error;

      // Group by page path
      const grouped = data?.reduce((acc: any, view: any) => {
        acc[view.page_path] = (acc[view.page_path] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(grouped || {})
        .map(([path, count]) => ({ path, visits: count }))
        .sort((a: any, b: any) => b.visits - a.visits)
        .slice(0, 10);
    },
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingActive ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{activeVisitors}</div>
            )}
            <p className="text-xs text-muted-foreground">Right now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views (7d)</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingTrends ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {visitorTrends?.reduce((sum, day) => sum + (day.visits as number), 0) || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trending</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingTopPages ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-sm font-medium truncate">
                {topPages?.[0]?.path || 'No data'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Most visited page</p>
          </CardContent>
        </Card>
      </div>

      {/* Visitor Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Visitor Trends</CardTitle>
          <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTrends ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visitorTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="visits" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Peak Hours Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Hours</CardTitle>
          <CardDescription>Last 24 hours activity</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPeakHours ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visits" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Most Visited Pages</CardTitle>
          <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTopPages ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="space-y-2">
              {topPages?.map((page: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm font-medium truncate flex-1">{page.path}</span>
                  <span className="text-sm text-muted-foreground ml-4">{page.visits} views</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Active Visitors */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Live Active Visitors ({activeVisitors})
          </CardTitle>
          <CardDescription>Real-time visitor tracking with device and location information</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingActive ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : activeVisitorsData && activeVisitorsData.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activeVisitorsData.map((visitor) => {
                const deviceInfo = parseUserAgent(visitor.user_agent || '');
                const getDeviceIcon = () => {
                  if (deviceInfo.deviceType === 'mobile') return <Smartphone className="h-4 w-4" />;
                  if (deviceInfo.deviceType === 'tablet') return <Tablet className="h-4 w-4" />;
                  return <Monitor className="h-4 w-4" />;
                };

                return (
                  <div 
                    key={visitor.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getDeviceIcon()}
                            {deviceInfo.device}
                          </Badge>
                          <Badge variant="secondary">
                            {deviceInfo.browser} {deviceInfo.browserVersion}
                          </Badge>
                          <Badge variant="secondary">
                            {deviceInfo.os}
                          </Badge>
                          {visitor.ip_address && (
                            <Badge variant="outline">
                              IP: {visitor.ip_address}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm space-y-1">
                          <p className="font-medium text-foreground">
                            Current Page: <span className="text-primary">{visitor.page_path}</span>
                          </p>
                          {visitor.referrer && (
                            <p className="text-muted-foreground text-xs">
                              Referred from: {new URL(visitor.referrer).hostname}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Last active: {format(new Date(visitor.last_seen), 'HH:mm:ss')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-muted-foreground">Live</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No active visitors at the moment
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}