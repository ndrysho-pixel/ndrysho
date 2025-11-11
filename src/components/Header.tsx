import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import logoSymbol from '@/assets/logo-symbol.png';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-xl">
          <img src={logoSymbol} alt="Ndrysho" className="h-8 w-8" />
          <span className="text-primary">Ndrysho</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/jobs" className="text-sm font-medium hover:text-primary">
            {t('Punë', 'Jobs')}
          </Link>
          <Link to="/health" className="text-sm font-medium hover:text-primary">
            {t('Shëndet', 'Health')}
          </Link>
          <Link to="/myths" className="text-sm font-medium hover:text-primary">
            {t('Mit apo E Vërtetë?', 'Myth or Truth?')}
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-primary">
            {t('Rreth Nesh', 'About')}
          </Link>
          <Link to="/contact" className="text-sm font-medium hover:text-primary">
            {t('Kontakt', 'Contact')}
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="font-medium"
          >
            {language === 'sq' ? 'ENG' : 'SHQ'}
          </Button>

          {user && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
              >
                {t('Admin', 'Admin')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                {t('Dil', 'Logout')}
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container flex flex-col gap-4 py-4 px-4">
            <Link 
              to="/jobs" 
              className="text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('Punë', 'Jobs')}
            </Link>
            <Link 
              to="/health" 
              className="text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('Shëndet', 'Health')}
            </Link>
            <Link 
              to="/myths" 
              className="text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('Mit apo E Vërtetë?', 'Myth or Truth?')}
            </Link>
            <Link 
              to="/about" 
              className="text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('Rreth Nesh', 'About')}
            </Link>
            <Link 
              to="/contact" 
              className="text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('Kontakt', 'Contact')}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="justify-start"
            >
              {language === 'sq' ? 'Switch to English' : 'Kalo në Shqip'}
            </Button>
            {user && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigate('/admin');
                    setIsMenuOpen(false);
                  }}
                >
                  {t('Admin', 'Admin')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  {t('Dil', 'Logout')}
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
