import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LanguageProvider, useLanguage } from './components/LanguageContext';
import LanguageSwitcher from './components/ui/LanguageSwitcher';
import PermissionsRequest from './components/notifications/PermissionsRequest';
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
  Bell
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

function LayoutContent({ children, currentPageName }) {
  const { t, isRTL } = useLanguage();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const navItems = [
    { name: 'Home', icon: Home, label: t('home'), color: 'text-emerald-600' },
    { name: 'MyTrips', icon: Map, label: t('myTrips'), color: 'text-blue-600' },
    { name: 'CreateTrip', icon: Plus, label: t('createTrip'), color: 'text-purple-600' },
    { name: 'AIRecommendations', icon: Sparkles, label: t('aiRecommendations'), color: 'text-indigo-600' },
  ];

  const isActive = (pageName) => currentPageName === pageName;

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
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent hidden sm:block">
                TripMate
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map(item => (
                <Link key={item.name} to={createPageUrl(item.name)}>
                  <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={isActive(item.name) ? "secondary" : "ghost"}
                      className={`gap-2 transition-all duration-300 ${
                        isActive(item.name) 
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-semibold shadow-sm' 
                          : 'text-gray-600 hover:text-emerald-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50'
                      }`}
                    >
                      <div className={`p-1 rounded-lg ${isActive(item.name) ? 'bg-emerald-100' : ''}`}>
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      {item.label}
                    </Button>
                  </motion.div>
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              
              {user ? (
                <>
                  {/* Pending Requests Notification */}
                  {pendingCount > 0 && (
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative hover:bg-red-50 transition-all duration-300"
                        onClick={() => navigate(createPageUrl('MyTrips'))}
                      >
                        <div className="p-1.5 bg-red-100 rounded-lg">
                          <Bell className="w-5 h-5 text-red-600" />
                        </div>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold shadow-lg">
                            {pendingCount}
                          </Badge>
                        </motion.div>
                      </Button>
                    </motion.div>
                  )}

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
                        Login
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

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 safe-area-inset-bottom z-50 shadow-2xl">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.slice(0, 4).map(item => (
            <Link 
              key={item.name} 
              to={createPageUrl(item.name)}
              className="relative flex-1"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                  isActive(item.name) 
                    ? 'text-emerald-600 bg-gradient-to-br from-emerald-50 to-teal-50' 
                    : 'text-gray-500 hover:text-emerald-600'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all ${
                  isActive(item.name) ? 'bg-emerald-100' : ''
                }`}>
                  <item.icon className={`w-5 h-5 ${isActive(item.name) ? item.color : ''}`} />
                </div>
                <span className={`text-xs font-medium ${isActive(item.name) ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
                {isActive(item.name) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-16" />

      {/* Permissions Request Dialog */}
      {user && <PermissionsRequest />}
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <LayoutContent currentPageName={currentPageName}>
        {children}
      </LayoutContent>
    </LanguageProvider>
  );
}