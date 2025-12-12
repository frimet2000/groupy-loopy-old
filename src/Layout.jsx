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
    { name: 'Home', icon: Home, label: t('home') },
    { name: 'MyTrips', icon: Map, label: t('myTrips') },
    { name: 'CreateTrip', icon: Plus, label: t('createTrip') },
    { name: 'AIRecommendations', icon: Sparkles, label: t('aiRecommendations') },
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
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <Link key={item.name} to={createPageUrl(item.name)}>
                  <Button
                    variant={isActive(item.name) ? "secondary" : "ghost"}
                    className={`gap-2 ${isActive(item.name) ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative"
                      onClick={() => navigate(createPageUrl('MyTrips'))}
                    >
                      <Bell className="w-5 h-5 text-gray-600" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                        {pendingCount}
                      </Badge>
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10 border-2 border-emerald-100">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-semibold">
                            {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="font-semibold">{user.full_name}</p>
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
                <Button 
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Login
                </Button>
              )}

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side={isRTL ? "right" : "left"} className="w-72">
                  <nav className="flex flex-col gap-2 mt-8">
                    {navItems.map(item => (
                      <Link key={item.name} to={createPageUrl(item.name)} onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant={isActive(item.name) ? "secondary" : "ghost"}
                          className={`w-full justify-start gap-3 h-12 ${isActive(item.name) ? 'bg-emerald-50 text-emerald-700' : ''}`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </Button>
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-50">
        <div className="flex items-center justify-around h-16">
          {navItems.slice(0, 4).map(item => (
            <Link 
              key={item.name} 
              to={createPageUrl(item.name)}
              className={`flex flex-col items-center gap-1 px-3 py-2 ${
                isActive(item.name) ? 'text-emerald-600' : 'text-gray-500'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
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