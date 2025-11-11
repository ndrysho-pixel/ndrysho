import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Briefcase, Heart, HelpCircle } from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 -z-10" />
        <div className="container max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {t(
              'Ndrysho jetën tënde, hap pas hapi',
              'Change your life, step by step'
            )}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t(
              'Platforma për të rinjtë që duan të ndërtojnë një version më të fortë, më të shëndetshëm dhe më të sigurt të vetvetes.',
              'A platform for young people who want to build a stronger, healthier, and more confident version of themselves.'
            )}
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link to="/jobs">{t('Shfleto Punët', 'Browse Jobs')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">{t('Mëso Më Shumë', 'Learn More')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Jobs Card */}
            <Link to="/jobs" className="group">
              <div className="bg-card rounded-lg p-8 shadow-sm hover:shadow-md border transition-all h-full">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  {t('Punë & Mundësi', 'Jobs & Opportunities')}
                </h3>
                <p className="text-muted-foreground">
                  {t(
                    'Mundësi pune të përzgjedhura për të rinj, përfshirë pozicione remote dhe entry-level.',
                    'Curated job opportunities for young people, including remote and entry-level positions.'
                  )}
                </p>
              </div>
            </Link>

            {/* Health Card */}
            <Link to="/health" className="group">
              <div className="bg-card rounded-lg p-8 shadow-sm hover:shadow-md border transition-all h-full">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  {t('Shëndet & Ushqim', 'Health & Nutrition')}
                </h3>
                <p className="text-muted-foreground">
                  {t(
                    'Udhëzime praktike dhe shkencore për ndërtimin e një stili jetese më të shëndetshëm.',
                    'Practical, science-based guidance for building a healthier lifestyle.'
                  )}
                </p>
              </div>
            </Link>

            {/* Myths Card */}
            <Link to="/myths" className="group">
              <div className="bg-card rounded-lg p-8 shadow-sm hover:shadow-md border transition-all h-full">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  {t('Mit apo E Vërtetë?', 'Myth or Truth?')}
                </h3>
                <p className="text-muted-foreground">
                  {t(
                    'Shpjegime shkencore që konfirmojnë ose hedhin poshtë besime të zakonshme për ushqimin dhe shëndetin.',
                    'Scientific explanations that confirm or debunk common beliefs about food and health.'
                  )}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            {t('Gati për të ndryshuar?', 'Ready to change?')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t(
              'Nëse je këtu, do të thotë se je i gatshëm për të ndryshuar. Dhe ne jemi këtu për të ecur atë udhëtim me ty.',
              'If you are here, it means you are ready to change. And we are here to walk that journey with you.'
            )}
          </p>
          <Button asChild size="lg">
            <Link to="/jobs">{t('Fillo Tani', 'Start Now')}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
