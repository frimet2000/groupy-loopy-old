import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LanguageProvider, useLanguage } from './components/LanguageContext';
import LanguageSwitcher from './components/ui/LanguageSwitcher';
import PermissionsRequest from './components/notifications/PermissionsRequest';
import NotificationBell from './components/notifications/NotificationBell';
import LanguageSelection from './components/LanguageSelection';
import CookieConsent from './components/legal/CookieConsent';
import AccessibilityButton from './components/accessibility/AccessibilityButton';
import InstallPrompt from './components/pwa/InstallPrompt';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
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
  Mail } from
'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

function LayoutContent({ children, currentPageName }) {
  const { t, isRTL, setLanguage, language } = useLanguage();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLanguageSelection, setShowLanguageSelection] = useState(false);
  const navigate = useNavigate();

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

        // Check if user needs to complete onboarding
        if (userData && !userData.profile_completed && currentPageName !== 'Onboarding') {
          navigate(createPageUrl('Onboarding'));
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

  // Fetch pending requests count for organized trips
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['pendingRequests', user?.email],
    queryFn: async () => {
      if (!user?.email) return 0;
      const trips = await base44.entities.Trip.filter({
        organizer_email: user.email,
        status: 'open'
      });
      return trips.reduce((total, trip) =>
      total + (trip.pending_requests?.length || 0), 0
      );
    },
    enabled: !!user?.email,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const navItems = [
  { name: 'Home', icon: Home, label: t('home'), color: 'text-emerald-600' },
  { name: 'MyTrips', icon: Map, label: t('myTrips'), color: 'text-blue-600' },
  { name: 'CreateTrip', icon: Plus, label: t('createTrip'), color: 'text-purple-600' },
  { name: 'AIRecommendations', icon: Sparkles, label: t('aiRecommendations'), color: 'text-indigo-600' },
  { name: 'Community', icon: Users, label: language === 'he' ? 'קהילה' : language === 'ru' ? 'Сообщество' : language === 'es' ? 'Comunidad' : language === 'fr' ? 'Communauté' : language === 'de' ? 'Gemeinschaft' : language === 'it' ? 'Comunità' : 'Community', color: 'text-pink-600' },
  { name: 'Inbox', icon: Mail, label: language === 'he' ? 'הודעות' : language === 'ru' ? 'Сообщения' : language === 'es' ? 'Mensajes' : language === 'fr' ? 'Messages' : language === 'de' ? 'Nachrichten' : language === 'it' ? 'Messaggi' : 'Messages', color: 'text-amber-600' },
  { name: 'Settings', icon: SettingsIcon, label: language === 'he' ? 'הגדרות' : language === 'ru' ? 'Настройки' : language === 'es' ? 'Configuración' : language === 'fr' ? 'Paramètres' : language === 'de' ? 'Einstellungen' : language === 'it' ? 'Impostazioni' : 'Settings', color: 'text-gray-600' }];


  const isActive = (pageName) => currentPageName === pageName;

  if (showLanguageSelection) {
    return <LanguageSelection onLanguageSelect={handleLanguageSelect} />;
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Desktop Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow">
                <Mountain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent hidden sm:block">The Groupy Loopy

              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) =>
              <Link key={item.name} to={createPageUrl(item.name)}>
                  <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                    <Button
                    variant={isActive(item.name) ? "secondary" : "ghost"}
                    className={`gap-2 transition-all duration-300 ${
                    isActive(item.name) ?
                    'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-semibold shadow-sm' :
                    'text-gray-600 hover:text-emerald-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50'}`
                    }>

                      <div className={`p-1 rounded-lg ${isActive(item.name) ? 'bg-emerald-100' : ''}`}>
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      {item.label}
                    </Button>
                  </motion.div>
                </Link>
              )}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {user && <NotificationBell userEmail={user.email} />}
              <LanguageSwitcher />
              
              {user ?
              <>
                  {/* Pending Requests Notification */}
                  {pendingCount > 0 &&
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Link to={createPageUrl('MyTrips')}>
                        <Button
                      variant="ghost"
                      size="icon"
                      className="relative hover:bg-red-50 transition-all duration-300">

                          <div className="p-1.5 bg-red-100 rounded-lg">
                            <Bell className="w-5 h-5 text-red-600" />
                          </div>
                          <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}>

                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold shadow-lg">
                              {pendingCount}
                            </Badge>
                          </motion.div>
                        </Button>
                      </Link>
                    </motion.div>
                }

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10 border-2 border-emerald-100">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-semibold">
                            {(user.first_name?.charAt(0) || user.full_name?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="font-semibold">
                        {user.first_name && user.last_name ?
                        `${user.first_name} ${user.last_name}` :
                        user.full_name}
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
                  </> :

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300">

                        {language === 'he' ? 'התחבר' : language === 'ru' ? 'Войти' : language === 'es' ? 'Iniciar sesión' : language === 'fr' ? 'Connexion' : language === 'de' ? 'Anmelden' : language === 'it' ? 'Accedi' : 'Login'}
                      </Button>
                    </motion.div>
              }

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
                    {navItems.map((item) =>
                    <Link key={item.name} to={createPageUrl(item.name)} onClick={() => setMobileMenuOpen(false)}>
                        <motion.div whileHover={{ x: isRTL ? -5 : 5 }} whileTap={{ scale: 0.98 }}>
                          <Button
                          variant={isActive(item.name) ? "secondary" : "ghost"}
                          className={`w-full justify-start gap-3 h-12 transition-all duration-300 ${
                          isActive(item.name) ?
                          'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-semibold shadow-sm' :
                          'hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50'}`
                          }>

                            <div className={`p-1.5 rounded-lg ${isActive(item.name) ? 'bg-emerald-100' : ''}`}>
                              <item.icon className={`w-5 h-5 ${item.color}`} />
                            </div>
                            {item.label}
                          </Button>
                        </motion.div>
                      </Link>
                    )}
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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col gap-6">
            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to={createPageUrl('PrivacyPolicy')}>
                <Button variant="link" className="gap-2 text-gray-600 hover:text-emerald-600">
                  <Shield className="w-4 h-4" />
                  {language === 'he' ? 'מדיניות פרטיות' : language === 'ru' ? 'Политика конфиденциальности' : language === 'es' ? 'Política de privacidad' : language === 'fr' ? 'Politique de confidentialité' : language === 'de' ? 'Datenschutzrichtlinie' : language === 'it' ? 'Informativa sulla privacy' : 'Privacy Policy'}
                </Button>
              </Link>
              <span className="text-gray-300">|</span>
              <Link to={createPageUrl('TermsOfUse')}>
                <Button variant="link" className="gap-2 text-gray-600 hover:text-emerald-600">
                  <FileText className="w-4 h-4" />
                  {language === 'he' ? 'תקנון ותנאי שימוש' : language === 'ru' ? 'Условия использования' : language === 'es' ? 'Términos de uso' : language === 'fr' ? 'Conditions d\'utilisation' : language === 'de' ? 'Nutzungsbedingungen' : language === 'it' ? 'Termini di utilizzo' : 'Terms of Use'}
                </Button>
              </Link>
              <span className="text-gray-300">|</span>
              <Link to={createPageUrl('AccessibilityStatement')}>
                <Button variant="link" className="gap-2 text-gray-600 hover:text-emerald-600">
                  <Users className="w-4 h-4" />
                  {language === 'he' ? 'הצהרת נגישות' : language === 'ru' ? 'Доступность' : language === 'es' ? 'Accesibilidad' : language === 'fr' ? 'Accessibilité' : language === 'de' ? 'Barrierefreiheit' : language === 'it' ? 'Accessibilità' : 'Accessibility'}
                </Button>
              </Link>
              <span className="text-gray-300">|</span>
              <Link to={createPageUrl('TermsOfService')}>
                <Button variant="link" className="gap-2 text-gray-600 hover:text-emerald-600">
                  <AlertTriangle className="w-4 h-4" />
                  {language === 'he' ? 'מדיניות אחריות' : language === 'ru' ? 'Политика ответственности' : language === 'es' ? 'Política de responsabilidad' : language === 'fr' ? 'Politique de responsabilité' : language === 'de' ? 'Haftungsrichtlinie' : language === 'it' ? 'Politica di responsabilità' : 'Liability Policy'}
                </Button>
              </Link>
              <span className="text-gray-300">|</span>
              <Link to={createPageUrl('AboutUs')}>
                <Button variant="link" className="gap-2 text-gray-600 hover:text-emerald-600">
                  <Building2 className="w-4 h-4" />
                  {language === 'he' ? 'אודותינו' : language === 'ru' ? 'О нас' : language === 'es' ? 'Sobre nosotros' : language === 'fr' ? 'À propos' : language === 'de' ? 'Über uns' : language === 'it' ? 'Chi siamo' : 'About Us'}
                </Button>
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-center text-sm text-gray-500">
              © 2025 The Group Loop. {language === 'he' ? 'כל הזכויות שמורות' : language === 'ru' ? 'Все права защищены' : language === 'es' ? 'Todos los derechos reservados' : language === 'fr' ? 'Tous droits réservés' : language === 'de' ? 'Alle Rechte vorbehalten' : language === 'it' ? 'Tutti i diritti riservati' : 'All rights reserved'}
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 safe-area-inset-bottom z-50 shadow-2xl">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.slice(0, 4).map((item, idx) =>
          <Link
            key={item.name}
            to={createPageUrl(item.name)}
            className="relative flex-1">

              <motion.div
              whileTap={{ scale: 0.9 }}
              whileHover={{ y: -2 }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${
              isActive(item.name) ?
              'text-emerald-600 bg-gradient-to-br from-emerald-50 to-teal-50' :
              'text-gray-500 hover:text-emerald-600'}`
              }>

                <motion.div
                className={`p-1.5 rounded-lg transition-all relative ${
                isActive(item.name) ? 'bg-emerald-100' : ''}`
                }
                animate={isActive(item.name) ? {
                  boxShadow: ['0 0 0 0 rgba(16,185,129,0.4)', '0 0 0 8px rgba(16,185,129,0)']
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}>

                  <item.icon className={`w-5 h-5 ${isActive(item.name) ? item.color : ''}`} />
                </motion.div>
                <span className={`text-xs font-medium text-center ${isActive(item.name) ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
                {isActive(item.name) &&
              <motion.div
                layoutId="activeTab"
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg"
                transition={{ type: "spring", stiffness: 380, damping: 30 }} />

              }
              </motion.div>
            </Link>
          )}
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-16" />

      {/* Permissions Request Dialog */}
      {user && <PermissionsRequest />}

      {/* Cookie Consent Banner */}
      <CookieConsent />

      {/* Accessibility Button */}
      <AccessibilityButton />

      {/* PWA Install Prompt */}
      <InstallPrompt />
      </div>);

}

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <LayoutContent currentPageName={currentPageName}>
        {children}
      </LayoutContent>
    </LanguageProvider>);

}