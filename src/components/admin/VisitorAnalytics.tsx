import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Eye, TrendingUp } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

export default function VisitorAnalytics() {
  // Active visitors count
  const { data: activeVisitors, isLoading: loadingActive } = useQuery({
    queryKey: ['active-visitors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_visitors')
        .select('*')
        .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString());
      
      if (error) throw error;
      return data?.length || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

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
    </div>
  );
}