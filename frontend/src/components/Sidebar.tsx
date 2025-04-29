/**
 * Sidebar.tsx
 * Composant de la barre latérale avec navigation
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const location = useLocation();
  const { user, logout } = useAuthContext();

  const menuItems = [
    {
      title: 'Tableau de bord',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/dashboard'
    },
    {
      title: 'Projets',
      icon: <FolderOpen className="h-5 w-5" />,
      path: '/projects'
    },
    {
      title: 'Rapports techniques',
      icon: <FileText className="h-5 w-5" />,
      path: '/rapport-technique'
    }
  ];

  return (
    <div className="h-full bg-gray-50 border-r flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b">
        <img
          src="/assets/Ecriture - Courant (001).png"
          alt="TP Courant Logo"
          className={`${isCollapsed ? 'w-8' : 'w-32'} transition-all duration-300`}
        />
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                {item.icon}
                {!isCollapsed && (
                  <span className="ml-3">{item.title}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Déconnexion */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && (
            <span className="ml-3">Déconnexion</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar; 