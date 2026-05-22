import React from 'react';
import { BookOpen, BarChart3, Search, User, Camera, FileText, AlertCircle, PenLine } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { path: '/', label: '首页', icon: BookOpen },
    { path: '/error-collection', label: '错题', icon: Camera },
    { path: '/paper-practice', label: '精练', icon: FileText },
    { path: '/grammar-weakness', label: '语法', icon: AlertCircle },
    { path: '/grammar-practice', label: '刷题', icon: PenLine },
    { path: '/statistics', label: '统计', icon: BarChart3 },
    { path: '/vocabulary', label: '词库', icon: Search },
    { path: '/students', label: '我的', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 md:hidden z-40 px-2 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = window.location.pathname === item.path;
          return (
            <a
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-yellow-500 bg-yellow-50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;