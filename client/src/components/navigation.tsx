import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { AccessCodeModal } from './access-code-modal';

export function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accessCodeModalOpen, setAccessCodeModalOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
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
            <Link href="/gallery" className={isActive('/gallery') ? 'nav-link-active' : 'nav-link'}>
              Gallery
            </Link>
            
            <Button 
              onClick={() => setAccessCodeModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white"
              size="sm"
            >
              Access Demo
            </Button>
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
              <Link href="/gallery" className="block text-gray-600 dark:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                Gallery
              </Link>
              
              <Button 
                onClick={() => { 
                  setAccessCodeModalOpen(true); 
                  setMobileMenuOpen(false); 
                }}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
              >
                Access Demo
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <AccessCodeModal 
        isOpen={accessCodeModalOpen} 
        onClose={() => setAccessCodeModalOpen(false)}
        onSuccess={() => setHasAccess(true)}
      />
    </nav>
  );
}
