import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Instagram, Facebook } from 'lucide-react';

export default function Contact() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              {t('Na Kontaktoni', 'Contact Us')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t(
                'Jemi këtu për të dëgjuar nga ju',
                'We are here to hear from you'
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  {t('Email', 'Email')}
                </CardTitle>
                <CardDescription>
                  {t(
                    'Na dërgoni email për pyetje ose për të postuar punë',
                    'Send us an email for questions or to post jobs'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <a href="mailto:ndysho6@gmail.com">
                    ndysho6@gmail.com
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="h-5 w-5 text-primary" />
                  Instagram
                </CardTitle>
                <CardDescription>
                  {t(
                    'Na ndiqni për përditësime dhe përmbajtje',
                    'Follow us for updates and content'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <a href="https://www.instagram.com/ndrysho_portal/?utm_source=qr&igsh=" target="_blank" rel="noopener noreferrer">
                    @ndrysho_portal
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Facebook className="h-5 w-5 text-primary" />
                  Facebook
                </CardTitle>
                <CardDescription>
                  {t(
                    'Bashkohuni me komunitetin tonë',
                    'Join our community'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <a href="https://facebook.com/ndrysho" target="_blank" rel="noopener noreferrer">
                    Ndrysho
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="bg-accent/10 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">
              {t('Për Bizneset', 'For Businesses')}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t(
                'Nëse jeni biznes dhe dëshironi të postoni një mundësi pune në platformën tonë, ju lutemi na kontaktoni përmes email ose mediave sociale. Ne do të shqyrtojmë pozicionin tuaj dhe do ta shtojmë në platformë nëse përputhet me kriteret tona.',
                'If you are a business and would like to post a job opportunity on our platform, please contact us via email or social media. We will review your position and add it to the platform if it meets our criteria.'
              )}
            </p>
            <Button asChild>
              <a href="mailto:ndysho6@gmail.com?subject=Job Posting Request">
                {t('Postoni një Punë', 'Post a Job')}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}