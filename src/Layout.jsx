import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LanguageProvider, useLanguage } from './components/LanguageContext';
import { GoogleMapsProvider } from './components/maps/GoogleMapsProvider';
import LanguageSwitcher from './components/ui/LanguageSwitcher';
import PermissionsRequest from './components/notifications/PermissionsRequest';
import NotificationBell from './components/notifications/NotificationBell';
import NotificationPermissionRequest from './components/notifications/NotificationPermissionRequest';
import MessageListener from './components/notifications/MessageListener';
import LanguageSelection from './components/LanguageSelection';
import CookieConsent from './components/legal/CookieConsent';
import AccessibilityButton from './components/accessibility/AccessibilityButton';
import InstallPrompt from './components/pwa/InstallPrompt';
import ServiceWorkerRegistration from './components/pwa/ServiceWorkerRegistration';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
        Home, 
        Map, 
        Plus, 
        Sparkles, 
        User, 
        LogOut, 
        Menu,
        Mountain,
        Bell,
        Users,
        FileText,
        Shield,
        AlertTriangle,
        Building2,
        Settings as SettingsIcon,
        Mail,
        MessageSquare,
        Share2,
        BookOpen,
        CloudSun,
        BarChart3
      } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

function LayoutContent({ children, currentPageName }) {
  const { t, isRTL, setLanguage, language } = useLanguage();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLanguageSelection, setShowLanguageSelection] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Add Facebook domain verification meta tag
    const metaTag = document.createElement('meta');
    metaTag.name = 'facebook-domain-verification';
    metaTag.content = 'u7wujwd6860x2d554lgdr2kycajfrs';
    document.head.appendChild(metaTag);

    return () => {
      document.head.removeChild(metaTag);
    };
  }, []);

  // SEO meta tags (dynamic per page + language)
  useEffect(() => {
    const url = window.location.origin + window.location.pathname;
    const image = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693c3ab4048a1e3a31fffd66/413fc3893_Gemini_Generated_Image_me8dl1me8dl1me8d.png';

    const titles = {
      he: {
        default: 'Groupy Loopy — מצאו שותפים לטיול',
        Home: 'Groupy Loopy — מצאו שותפים לטיול',
        MyTrips: 'הטיולים שלי — Groupy Loopy',
        CreateTrip: 'צור טיול — Groupy Loopy',
        Dashboard: 'לוח מחוונים — Groupy Loopy'
      },
      en: {
        default: 'Groupy Loopy — Find Trip Partners',
        Home: 'Groupy Loopy — Find Trip Partners',
        MyTrips: 'My Trips — Groupy Loopy',
        CreateTrip: 'Create Trip — Groupy Loopy',
        Dashboard: 'Dashboard — Groupy Loopy'
      },
      ru: {
        default: 'Groupy Loopy — найдите попутчиков',
        Home: 'Groupy Loopy — найдите попутчиков',
        MyTrips: 'Мои поездки — Groupy Loopy',
        CreateTrip: 'Создать поездку — Groupy Loopy',
        Dashboard: 'Панель — Groupy Loopy'
      },
      es: {
        default: 'Groupy Loopy — Encuentra compañeros de viaje',
        Home: 'Groupy Loopy — Encuentra compañeros de viaje',
        MyTrips: 'Mis viajes — Groupy Loopy',
        CreateTrip: 'Crear viaje — Groupy Loopy',
        Dashboard: 'Panel — Groupy Loopy'
      },
      fr: {
        default: 'Groupy Loopy — Trouvez des partenaires de voyage',
        Home: 'Groupy Loopy — Trouvez des partenaires de voyage',
        MyTrips: 'Mes voyages — Groupy Loopy',
        CreateTrip: 'Créer un voyage — Groupy Loopy',
        Dashboard: 'Tableau de bord — Groupy Loopy'
      },
      de: {
        default: 'Groupy Loopy — Reisebegleiter finden',
        Home: 'Groupy Loopy — Reisebegleiter finden',
        MyTrips: 'Meine Reisen — Groupy Loopy',
        CreateTrip: 'Reise erstellen — Groupy Loopy',
        Dashboard: 'Dashboard — Groupy Loopy'
      },
      it: {
        default: 'Groupy Loopy — Trova compagni di viaggio',
        Home: 'Groupy Loopy — Trova compagni di viaggio',
        MyTrips: 'I miei viaggi — Groupy Loopy',
        CreateTrip: 'Crea viaggio — Groupy Loopy',
        Dashboard: 'Dashboard — Groupy Loopy'
      }
    };

    const descriptions = {
      he: 'פלטפורמה חינמית לחיבור מטיילים, יצירה והצטרפות לטיולים, מסלולים וקבוצות — אחריות ובטיחות אישית.',
      en: 'A free platform to connect hikers, create and join trips and routes — personal safety and responsibility first.',
      ru: 'Бесплатная платформа для связи туристов, создания и присоединения к поездкам — ваша безопасность и ответственность.',
      es: 'Plataforma gratuita para conectar excursionistas, crear y unirse a viajes — seguridad y responsabilidad personal.',
      fr: 'Plateforme gratuite pour connecter des randonneurs, créer et rejoindre des sorties — sécurité et responsabilité.',
      de: 'Kostenlose Plattform, um Wanderer zu verbinden, Touren zu erstellen und beizutreten — Sicherheit und Verantwortung.',
      it: 'Piattaforma gratuita per connettere escursionisti, creare e unirsi a viaggi — sicurezza e responsabilità personali.'
    };

    const title = (titles[language]?.[currentPageName]) || (titles[language]?.default) || titles.en.default;
    const description = descriptions[language] || descriptions.en;

    const upsertMeta = (name, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const upsertProperty = (property, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Title
    document.title = title;
    // Basic
    upsertMeta('description', description);
    upsertMeta('robots', 'index,follow');
    // Open Graph
    upsertProperty('og:title', title);
    upsertProperty('og:description', description);
    upsertProperty('og:image', image);
    upsertProperty('og:url', url);
    upsertProperty('og:type', 'website');
    upsertProperty('og:site_name', 'Groupy Loopy');
    // Twitter
    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', title);
    upsertMeta('twitter:description', description);
    upsertMeta('twitter:image', image);
    // Canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }, [currentPageName, language]);

  const { data: unreadMessages = [] } = useQuery({
    queryKey: ['unreadMessagesCount', user?.email],
    queryFn: () => base44.entities.Message.filter({ recipient_email: user.email, read: false }),
    enabled: !!user?.email,
    refetchInterval: 5000,
  });
  const unreadCount = unreadMessages.length;

  useEffect(() => {
    // Check if language has been selected
    const languageSelected = localStorage.getItem('language_selected');
    if (!languageSelected) {
      setShowLanguageSelection(true);
      return;
    }

    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);

        if (userData) {
          // Onboarding + Legal Gate (combined)
          if ((!userData.terms_accepted || !userData.profile_completed) && currentPageName !== 'Onboarding') {
            navigate(createPageUrl('Onboarding'));
            return;
          }
        }
      } catch (e) {
        console.log('Not logged in');
      }
    };
    fetchUser();
  }, [currentPageName]);

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setShowLanguageSelection(false);
  };



  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const allNavItems = [
        { name: 'Home', icon: Home, label: t('home'), color: 'text-emerald-600' },
        { name: 'Dashboard', icon: BarChart3, label: language === 'he' ? 'לוח מחוונים' : language === 'ru' ? 'Панель' : language === 'es' ? 'Panel' : language === 'fr' ? 'Tableau' : language === 'de' ? 'Dashboard' : language === 'it' ? 'Dashboard' : 'Dashboard', color: 'text-cyan-600' },
        { name: 'MyTrips', icon: Map, label: t('myTrips'), color: 'text-blue-600' },
        { name: 'CreateTrip', icon: Plus, label: t('createTrip'), color: 'text-purple-600' },
        { name: 'Weather', icon: CloudSun, label: language === 'he' ? 'מזג אוויר' : language === 'ru' ? 'Погода' : language === 'es' ? 'Clima' : language === 'fr' ? 'Météo' : language === 'de' ? 'Wetter' : language === 'it' ? 'Meteo' : 'Weather', color: 'text-sky-500' },
        { name: 'TravelJournal', icon: BookOpen, label: language === 'he' ? 'יומן מסע' : language === 'ru' ? 'Дневник' : language === 'es' ? 'Diario' : language === 'fr' ? 'Journal' : language === 'de' ? 'Tagebuch' : language === 'it' ? 'Diario' : 'Journal', color: 'text-rose-600' },
        { name: 'AIRecommendations', icon: Sparkles, label: t('aiRecommendations'), color: 'text-indigo-600' },
        { name: 'Community', icon: Users, label: language === 'he' ? 'קהילה' : language === 'ru' ? 'Сообщество' : language === 'es' ? 'Comunidad' : language === 'fr' ? 'Communauté' : language === 'de' ? 'Gemeinschaft' : language === 'it' ? 'Comunità' : 'Community', color: 'text-pink-600' },
        { name: 'Inbox', icon: Mail, label: language === 'he' ? 'הודעות' : language === 'ru' ? 'Сообщения' : language === 'es' ? 'Mensajes' : language === 'fr' ? 'Messages' : language === 'de' ? 'Nachrichten' : language === 'it' ? 'Messaggi' : 'Messages', color: 'text-amber-600' },
        { name: 'Feedback', icon: MessageSquare, label: language === 'he' ? 'משוב' : language === 'ru' ? 'Отзывы' : language === 'es' ? 'Comentarios' : language === 'fr' ? 'Retour' : language === 'de' ? 'Feedback' : language === 'it' ? 'Feedback' : 'Feedback', color: 'text-indigo-600' },
        { name: 'Settings', icon: SettingsIcon, label: language === 'he' ? 'הגדרות' : language === 'ru' ? 'Настройки' : language === 'es' ? 'Configuración' : language === 'fr' ? 'Paramètres' : language === 'de' ? 'Einstellungen' : language === 'it' ? 'Impostazioni' : 'Settings', color: 'text-gray-600' },
      ];

  const navItems = user?.role === 'admin' 
    ? allNavItems 
    : allNavItems.filter(item => item.name !== 'Community');

  const isActive = (pageName) => currentPageName === pageName;

  if (showLanguageSelection) {
    return <LanguageSelection onLanguageSelect={handleLanguageSelect} />;
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Desktop Header */}
      <header className="bg-gradient-to-r from-white via-emerald-50/30 to-white backdrop-blur-xl border-b-2 border-emerald-200/50 sticky top-0 z-50 shadow-lg shadow-emerald-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center group">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693c3ab4048a1e3a31fffd66/532a53f9c_.png"
                alt="Groupy Loopy"
                className="h-12 w-auto transition-all group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map(item => (
                <Link key={item.name} to={createPageUrl(item.name)}>
                  <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={isActive(item.name) ? "secondary" : "ghost"}
                      className={`gap-2 transition-all duration-300 relative overflow-hidden ${
                        isActive(item.name) 
                          ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white font-bold shadow-xl shadow-emerald-500/40 border-2 border-emerald-400/50' 
                          : 'text-gray-600 hover:text-emerald-700 hover:bg-gradient-to-br hover:from-emerald-50/80 hover:to-teal-50/80 hover:shadow-lg hover:shadow-emerald-200/50 hover:border hover:border-emerald-200'
                      }`}
                    >
                      {isActive(item.name) && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                      <div className={`relative p-1.5 rounded-lg ${isActive(item.name) ? 'bg-white/20 shadow-inner' : ''}`}>
                        <item.icon className={`w-4 h-4 ${isActive(item.name) ? 'text-white drop-shadow' : item.color}`} />
                      </div>
                      <span className="relative">
                        {item.label}
                        {item.name === 'Inbox' && unreadCount > 0 && (
                          <span className="absolute -top-2 -right-3 h-2.5 w-2.5 bg-red-500 rounded-full shadow" />
                        )}
                      </span>
                    </Button>
                  </motion.div>
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {user && <NotificationBell userEmail={user.email} />}
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-emerald-50"
                onClick={async () => {
                  const shareUrl = window.location.origin;
                  const shareText = language === 'he' 
                    ? 'הצטרף אליי ל-Groupy Loopy - הפלטפורמה לארגון טיולים קבוצתיים!' 
                    : language === 'ru' 
                    ? 'Присоединяйтесь ко мне в Groupy Loopy - платформе для организации групповых поездок!'
                    : language === 'es'
                    ? '¡Únete a mí en Groupy Loopy - la plataforma para organizar viajes grupales!'
                    : language === 'fr'
                    ? 'Rejoignez-moi sur Groupy Loopy - la plateforme pour organiser des voyages de groupe!'
                    : language === 'de'
                    ? 'Tritt mir bei Groupy Loopy bei - der Plattform für Gruppenreisen!'
                    : language === 'it'
                    ? 'Unisciti a me su Groupy Loopy - la piattaforma per organizzare viaggi di gruppo!'
                    : 'Join me on Groupy Loopy - the platform for organizing group trips!';
                  
                  try {
                    if (navigator.share) {
                      await navigator.share({
                        title: 'Groupy Loopy',
                        text: shareText,
                        url: shareUrl
                      });
                    } else {
                      await navigator.clipboard.writeText(shareUrl);
                      toast.success(language === 'he' ? 'הקישור הועתק' : 'Link copied');
                    }
                  } catch (err) {
                    if (err.name !== 'AbortError') {
                      await navigator.clipboard.writeText(shareUrl);
                      toast.success(language === 'he' ? 'הקישור הועתק' : 'Link copied');
                    }
                  }
                }}
                title={language === 'he' ? 'שתף עם חברים' : language === 'ru' ? 'Поделиться' : language === 'es' ? 'Compartir' : language === 'fr' ? 'Partager' : language === 'de' ? 'Teilen' : language === 'it' ? 'Condividi' : 'Share with Friends'}
              >
                <Share2 className="w-5 h-5 text-emerald-600" />
              </Button>
              <LanguageSwitcher />
              <AccessibilityButton />

              {user ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10 border-2 border-emerald-100">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-semibold">
                            {(() => {
                              const firstName = typeof user.first_name === 'string' ? user.first_name : '';
                              const fullName = typeof user.full_name === 'string' ? user.full_name : '';
                              const email = typeof user.email === 'string' ? user.email : '';
                              return (firstName.charAt(0) || fullName.charAt(0) || email.charAt(0) || 'U').toUpperCase();
                            })()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="font-semibold">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : user.full_name}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(createPageUrl('Profile'))}>
                      <User className="w-4 h-4 mr-2" />
                      {t('profile')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                  </DropdownMenu>
                  </>
                  ) : (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        onClick={() => base44.auth.redirectToLogin()}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {language === 'he' ? 'התחבר' : language === 'ru' ? 'Войти' : language === 'es' ? 'Iniciar sesión' : language === 'fr' ? 'Connexion' : language === 'de' ? 'Anmelden' : language === 'it' ? 'Accedi' : 'Login'}
                      </Button>
                    </motion.div>
                  )}

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="ghost" size="icon" className="hover:bg-emerald-50">
                      <div className="p-1 rounded-lg">
                        <Menu className="w-5 h-5 text-gray-700" />
                      </div>
                    </Button>
                  </motion.div>
                </SheetTrigger>
                <SheetContent side={isRTL ? "right" : "left"} className="w-72 bg-gradient-to-b from-white to-gray-50">
                  <nav className="flex flex-col gap-2 mt-8">
                    {navItems.map(item => (
                      <Link key={item.name} to={createPageUrl(item.name)} onClick={() => setMobileMenuOpen(false)}>
                        <motion.div whileHover={{ x: isRTL ? -5 : 5 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant={isActive(item.name) ? "secondary" : "ghost"}
                            className={`w-full justify-start gap-3 h-12 transition-all duration-300 ${
                              isActive(item.name) 
                                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-semibold shadow-sm' 
                                : 'hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg ${isActive(item.name) ? 'bg-emerald-100' : ''}`}>
                              <item.icon className={`w-5 h-5 ${item.color}`} />
                            </div>
                            {item.label}
                          </Button>
                        </motion.div>
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>

      {/* Footer - Only on Home page */}
      {currentPageName === 'Home' && (
        <footer className="bg-white border-t-2 border-gray-200/80 py-10 md:py-14 mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm md:text-base text-gray-600 whitespace-nowrap overflow-x-auto">
              <span>© 2025 Groupy Loopy</span>
              <span>•</span>
              <Link to={createPageUrl('PrivacyPolicy')} className="hover:text-emerald-600">
                {language === 'he' ? 'פרטיות' : 'Privacy'}
              </Link>
              <span>•</span>
              <Link to={createPageUrl('TermsOfUse')} className="hover:text-emerald-600">
                {language === 'he' ? 'תנאים' : 'Terms'}
              </Link>
              <span>•</span>
              <Link to={createPageUrl('AccessibilityStatement')} className="hover:text-emerald-600">
                {language === 'he' ? 'נגישות' : 'Accessibility'}
              </Link>
              <span>•</span>
              <Link to={createPageUrl('AboutUs')} className="hover:text-emerald-600">
                {language === 'he' ? 'אודות' : 'About'}
              </Link>
            </div>
          </div>
        </footer>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-xl border-t-2 border-gray-200 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
        <div className="flex items-center justify-around h-20 px-2">
          {[navItems[0], navItems.find(item => item.name === 'CreateTrip'), navItems[2]].filter(Boolean).map((item, idx) => (
            <Link 
              key={item.name} 
              to={createPageUrl(item.name)}
              className="relative flex-1 touch-manipulation"
            >
              <motion.div
                whileTap={{ scale: 0.92 }}
                className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-2xl transition-all duration-300 min-h-[64px] ${
                  isActive(item.name) 
                    ? 'text-emerald-600 bg-gradient-to-br from-emerald-50 to-teal-50' 
                    : 'text-gray-500 active:text-emerald-600'
                }`}
              >
                <motion.div 
                  className={`p-2 rounded-xl transition-all relative ${
                    isActive(item.name) ? 'bg-emerald-100 shadow-sm' : ''
                  }`}
                  animate={isActive(item.name) ? {
                    boxShadow: ['0 0 0 0 rgba(16,185,129,0.4)', '0 0 0 8px rgba(16,185,129,0)']
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <item.icon className={`w-6 h-6 ${isActive(item.name) ? item.color : ''}`} />
                </motion.div>
                <span className={`text-xs font-semibold text-center leading-tight ${isActive(item.name) ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
                {isActive(item.name) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          ))}
          
          {/* Accessibility Button in Mobile Nav */}
          <AccessibilityButton isMobileNav={true} />
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-20" style={{ height: 'calc(80px + env(safe-area-inset-bottom))' }} />

      {/* Permissions Request Dialog */}
      {user && <PermissionsRequest />}

      {/* First-time Notification Permission Request */}
      <NotificationPermissionRequest />

      {/* Cookie Consent Banner */}
      <CookieConsent />

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Service Worker Registration */}
      <ServiceWorkerRegistration />

      {/* Message Listener for in-app toasts */}
      <MessageListener />
      </div>
      );
      }

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <GoogleMapsProvider>
        <LayoutContent currentPageName={currentPageName}>
          {children}
        </LayoutContent>
      </GoogleMapsProvider>
    </LanguageProvider>
  );
}