import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun, BookOpenCheck } from 'lucide-react';

const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const location = useLocation();
  
  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);
  
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/study-assistant', label: 'Study Assistant' },
    { path: '/pdf-summary', label: 'PDF Summary' },
    { path: '/flashcards', label: 'Flashcards' },
  ];
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpenCheck size={28} />
              <span className="text-xl font-bold">StudyBuddy</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full hover:bg-primary-600 transition-colors"
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              
              <nav className="hidden md:flex space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`hover:text-white/80 transition-colors ${
                      isActive(link.path) ? 'font-bold border-b-2 border-white' : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              
              <button
                className="md:hidden p-2 rounded-md hover:bg-primary-600 transition-colors"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 py-2 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block py-2 px-4 rounded-md ${
                    isActive(link.path) 
                      ? 'bg-primary-800 font-bold' 
                      : 'hover:bg-primary-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-primary-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BookOpenCheck size={20} />
              <span className="font-semibold">StudyBuddy</span>
            </div>
            <div className="text-sm text-white/70">
              © {new Date().getFullYear()} StudyBuddy. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;