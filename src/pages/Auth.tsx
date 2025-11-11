import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

// Enhanced email validation with domain check
const emailSchema = z.string()
  .email()
  .refine((email) => {
    const domain = email.split('@')[1];
    const validDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
    // Check if it has a valid TLD and not suspicious patterns
    return domain && domain.includes('.') && !domain.includes('..');
  }, { message: 'Please use a valid email from a recognized provider' });

const passwordSchema = z.string().min(6);

export default function Auth() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // Validate email format
      emailSchema.parse(email);
      passwordSchema.parse(password);

      // Check if rate limited
      const { data: rateLimited, error: rateLimitError } = await supabase
        .rpc('is_rate_limited', { user_email: email.trim().toLowerCase() });

      if (rateLimitError) {
        console.error('Rate limit check error:', rateLimitError);
      }

      if (rateLimited) {
        toast({
          variant: 'destructive',
          title: t('Shumë përpjekje', 'Too Many Attempts'),
          description: t(
            'Ju keni bërë shumë përpjekje të dështuara. Ju lutemi provoni përsëri pas 15 minutash.',
            'Too many failed attempts. Please try again after 15 minutes.'
          ),
        });
        setLoading(false);
        return;
      }

      // Attempt login
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      // Log the attempt
      await supabase.from('login_attempts').insert({
        email: email.trim().toLowerCase(),
        success: !error,
      });

      if (error) throw error;

      toast({
        title: t('Sukses!', 'Success!'),
        description: t('Jeni identifikuar me sukses', 'Successfully logged in'),
      });
      
      navigate('/cms-0x9f3b');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('Gabim', 'Error'),
        description: error.message || t('Kredencialet janë të gabuara', 'Invalid credentials'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">
            {t('Paneli i Administratorit', 'Admin Panel')}
          </CardTitle>
          <CardDescription>
            {t('Identifikohu për të vazhduar', 'Login to continue')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                {t('Fjalëkalimi', 'Password')}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('Duke u identifikuar...', 'Logging in...') : t('Hyr', 'Login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
