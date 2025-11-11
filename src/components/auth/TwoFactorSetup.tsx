import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Smartphone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TwoFactorSetup() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'enroll' | 'verify'>('enroll');

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setStep('verify');
      
      toast({
        title: t('Sukses!', 'Success!'),
        description: t(
          'Skanoni QR kodin me aplikacionin tuaj të autentifikimit',
          'Scan the QR code with your authenticator app'
        ),
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('Gabim', 'Error'),
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) throw factors.error;

      const totpFactor = factors.data?.totp?.[0];
      if (!totpFactor) throw new Error('No TOTP factor found');

      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: totpFactor.id,
        code: verifyCode,
      });

      if (error) throw error;

      toast({
        title: t('Sukses!', 'Success!'),
        description: t(
          '2FA u aktivizua me sukses',
          '2FA enabled successfully'
        ),
      });
      
      setStep('enroll');
      setQrCode('');
      setSecret('');
      setVerifyCode('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('Gabim', 'Error'),
        description: error.message || t('Kodi është i pavlefshëm', 'Invalid code'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <CardTitle>
            {t('Autentifikim me Dy Faktorë', 'Two-Factor Authentication')}
          </CardTitle>
        </div>
        <CardDescription>
          {t(
            'Shtoni një nivel shtesë sigurie në llogarinë tuaj',
            'Add an extra layer of security to your account'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'enroll' && (
          <>
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                {t(
                  'Do t\'ju duhet një aplikacion autentifikimi si Google Authenticator ose Authy',
                  'You will need an authenticator app like Google Authenticator or Authy'
                )}
              </AlertDescription>
            </Alert>
            <Button onClick={handleEnroll} disabled={loading} className="w-full">
              {loading ? t('Duke u përpunuar...', 'Processing...') : t('Aktivizo 2FA', 'Enable 2FA')}
            </Button>
          </>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-4">
            {qrCode && (
              <div className="flex flex-col items-center space-y-4">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t('Ose fut manualisht kodin:', 'Or enter the code manually:')}
                  </p>
                  <code className="block p-2 bg-muted rounded text-xs break-all">
                    {secret}
                  </code>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="verify-code">
                {t('Kodi i Verifikimit', 'Verification Code')}
              </Label>
              <Input
                id="verify-code"
                type="text"
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t('Duke verifikuar...', 'Verifying...') : t('Verifiko', 'Verify')}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
