import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import logoSymbol from '@/assets/logo-symbol.png';
import { Instagram, Facebook, Mail } from 'lucide-react';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-secondary/30 mt-auto">
      <div className="container py-12 px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoSymbol} alt="Ndrysho" className="h-8 w-8" />
              <span className="font-semibold text-xl text-primary">Ndrysho</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t(
                'Platforma për zhvillim personal dhe profesional',
                'Platform for personal and professional development'
              )}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('Navigimi', 'Navigation')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/jobs" className="text-muted-foreground hover:text-primary">
                  {t('Punë', 'Jobs')}
                </Link>
              </li>
              <li>
                <Link to="/health" className="text-muted-foreground hover:text-primary">
                  {t('Shëndet', 'Health')}
                </Link>
              </li>
              <li>
                <Link to="/myths" className="text-muted-foreground hover:text-primary">
                  {t('Mite', 'Myths')}
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold mb-4">{t('Info', 'Info')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary">
                  {t('Rreth Nesh', 'About Us')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary">
                  {t('Kontakt', 'Contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">{t('Na Ndiqni', 'Follow Us')}</h3>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/ndrysho_portal?utm_source=qr&igsh="
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com/ndrysho"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="mailto:ndysho6@gmail.com"
                className="text-muted-foreground hover:text-primary"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Ndrysho. {t('Të gjitha të drejtat e rezervuara.', 'All rights reserved.')}</p>
        </div>
      </div>
    </footer>
  );
};
