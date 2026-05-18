
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Book, FileText, BarChart3, Menu, X } from 'lucide-react';

const Navbar: React.FC = () =&gt; {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/daily', icon: Book, label: '每日默写' },
    { path: '/vocabulary', icon: FileText, label: '词汇管理' },
    { path: '/papers', icon: FileText, label: '试卷中心' },
    { path: '/statistics', icon: BarChart3, label: '数据统计' },
  ];

  return (
    &lt;nav className="bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-lg"&gt;
      &lt;div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"&gt;
        &lt;div className="flex items-center justify-between h-16"&gt;
          &lt;div className="flex items-center"&gt;
            &lt;Link to="/" className="text-xl font-bold"&gt;
              📚 小学英语默写工具
            &lt;/Link&gt;
          &lt;/div&gt;

          &lt;div className="hidden md:block"&gt;
            &lt;div className="ml-10 flex items-baseline space-x-4"&gt;
              {navItems.map((item) =&gt; {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  &lt;Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  &gt;
                    &lt;Icon size={18} /&gt;
                    {item.label}
                  &lt;/Link&gt;
                );
              })}
            &lt;/div&gt;
          &lt;/div&gt;

          &lt;div className="md:hidden"&gt;
            &lt;button
              onClick={() =&gt; setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-white/80"
            &gt;
              {mobileMenuOpen ? &lt;X size={24} /&gt; : &lt;Menu size={24} /&gt;}
            &lt;/button&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      {mobileMenuOpen &amp;&amp; (
        &lt;div className="md:hidden bg-orange-600"&gt;
          &lt;div className="px-2 pt-2 pb-3 space-y-1 sm:px-3"&gt;
            {navItems.map((item) =&gt; {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                &lt;Link
                  key={item.path}
                  to={item.path}
                  onClick={() =&gt; setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                &gt;
                  &lt;Icon size={18} /&gt;
                  {item.label}
                &lt;/Link&gt;
              );
            })}
          &lt;/div&gt;
        &lt;/div&gt;
      )}
    &lt;/nav&gt;
  );
};

export default Navbar;
