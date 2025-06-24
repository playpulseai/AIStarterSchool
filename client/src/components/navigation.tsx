import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-card shadow-sm border-b border-gray-200 dark:border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center">
              <i className="fas fa-robot text-white text-sm"></i>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">AIStarter School</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={isActive('/') ? 'nav-link-active' : 'nav-link'}>
              Home
            </Link>
            <Link href="/about" className={isActive('/about') ? 'nav-link-active' : 'nav-link'}>
              About
            </Link>
            <Link href="/features" className={isActive('/features') ? 'nav-link-active' : 'nav-link'}>
              Features
            </Link>
            
            {user ? (
              <>
                <Link href="/dashboard" className={isActive('/dashboard') ? 'nav-link-active' : 'nav-link'}>
                  Dashboard
                </Link>
                <Link href="/lessons" className={isActive('/lessons') ? 'nav-link-active' : 'nav-link'}>
                  Lessons
                </Link>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className={isActive('/login') ? 'nav-link-active' : 'nav-link'}>
                  Login
                </Link>
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-white font-medium">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-card border-t border-gray-200 dark:border-border">
            <div className="px-4 py-3 space-y-3">
              <Link href="/" className="block text-gray-900 dark:text-white font-medium" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="/about" className="block text-gray-600 dark:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
              <Link href="/features" className="block text-gray-600 dark:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                Features
              </Link>
              
              {user ? (
                <>
                  <Link href="/dashboard" className="block text-gray-600 dark:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link href="/lessons" className="block text-gray-600 dark:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                    Lessons
                  </Link>
                  <Link href="/test" className="block text-gray-600 dark:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                    Test
                  </Link>
                  <Link href="/projects" className="block text-gray-600 dark:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                    Projects
                  </Link>
                  <Link href="/profile" className="block text-gray-600 dark:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                    Profile
                  </Link>
                  <Button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} variant="outline" size="sm" className="w-full">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block text-gray-600 dark:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white font-medium" onClick={() => setMobileMenuOpen(false)}>
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
