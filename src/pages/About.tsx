import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <section className="py-16 px-4">
        <div className="container max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              {t('Rreth Ndrysho', 'About Ndrysho')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t(
                'Një platformë e krijuar për të rinjtë që duan të ndryshojnë',
                'A platform created for young people who want to change'
              )}
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <p>
              {t(
                'Ndrysho është një platformë e krijuar për të rinjtë që duan të ndërtojnë një version më të fortë, më të shëndetshëm dhe më të sigurt të vetvetes. Ne besojmë që ndryshimi i vërtetë fillon me hapa të vegjël: si mendon, si ushqehesh, si kërkon mundësi dhe si zgjedh të ecësh përpara.',
                'Ndrysho is a platform created for young people who want to build a stronger, healthier, and more confident version of themselves. We believe that real change begins with small steps: how you think, how you eat, how you search for opportunities, and how you choose to move forward.'
              )}
            </p>

            <p>
              {t(
                'Këtu do të gjesh mundësi pune, udhëzime praktike për mirëqenie dhe qartësi të bazuar në shkencë për mitet e shëndetit. Qëllimi i platformës është të të ndihmojë të rritesh — personalisht, profesionalisht dhe fizikisht.',
                'Here, you will find job opportunities, practical wellness guidance, and science-based clarity on health myths. The purpose of the platform is to help you grow — personally, professionally, and physically.'
              )}
            </p>

            <div className="bg-primary/5 p-8 rounded-lg my-8">
              <p className="text-lg font-medium text-center">
                {t(
                  'Nëse je këtu, do të thotë që je gati për të ndryshuar. Dhe ne jemi këtu për të ecur atë udhëtim me ty.',
                  'If you are here, it means you are ready to change. And we are here to walk that journey with you.'
                )}
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                {t('Çfarë ofrojmë?', 'What do we offer?')}
              </h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-primary">
                    {t('Mundësi Pune', 'Job Opportunities')}
                  </h3>
                  <p>
                    {t(
                      'Pozicione pune të përzgjedhura të përshtatshme për të rinj, përfshirë punë remote dhe entry-level.',
                      'Curated job positions suitable for young people, including remote and entry-level work.'
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-accent">
                    {t('Shëndet & Ushqim', 'Health & Nutrition')}
                  </h3>
                  <p>
                    {t(
                      'Udhëzime praktike dhe të bazuara në shkencë për ndërtimin e një stili jetese më të shëndetshëm.',
                      'Practical, science-based guidance for building a healthier lifestyle.'
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-primary">
                    {t('Mit apo E Vërtetë?', 'Myth or Truth?')}
                  </h3>
                  <p>
                    {t(
                      'Shpjegime shkencore që konfirmojnë ose hedhin poshtë besime të zakonshme rreth ushqimit dhe shëndetit.',
                      'Scientific explanations that confirm or debunk common beliefs about food and health.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-8">
            <Button asChild size="lg">
              <Link to="/jobs">
                {t('Fillo këtu', 'Start here')}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
