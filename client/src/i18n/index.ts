import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar traduções
import ptBR from './locales/pt-BR.json';
import ptPT from './locales/pt-PT.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import de from './locales/de.json';

// Recursos de tradução
const resources = {
  'pt-BR': { translation: ptBR },
  'pt-PT': { translation: ptPT },
  'en': { translation: en },
  'es': { translation: es },
  'fr': { translation: fr },
  'it': { translation: it },
  'de': { translation: de },
};

// Lista de idiomas disponíveis
export const languages = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Português (Portugal)', flag: '🇵🇹' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

// Inicializar i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    defaultNS: 'translation',
    
    // Detecção de idioma
    detection: {
      // Ordem de detecção
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache no localStorage
      caches: ['localStorage'],
      // Nome da chave no localStorage
      lookupLocalStorage: 'i18nextLng',
    },
    
    interpolation: {
      escapeValue: false, // React já faz escape
    },
    
    // Debug apenas em desenvolvimento
    debug: import.meta.env.DEV,
  });

export default i18n;
