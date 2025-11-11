import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'sq' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (sq: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('sq');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'sq' ? 'en' : 'sq');
  };

  const t = (sq: string, en: string) => {
    return language === 'sq' ? sq : en;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
