import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './GuardSidebar.css';

const GuardSidebar = ({ sidebarOpen, setSidebarOpen, isActivePath }) => {
  const menuItems = [
    {
      path: '/guard/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      label: 'Dashboard'
    },
    {
      path: '/guard/workers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      label: 'Workers'
    },
    {
      path: '/guard/visitors',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      label: 'Visitors'
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-slate-950 border-r border-slate-900/60 z-50 transition-all duration-300 ${
        sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-900">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className={`ml-3 text-white font-semibold text-[15px] tracking-tight transition-opacity duration-200 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'
          }`}>
            Nivas Gate
          </span>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 h-[calc(100vh-140px)] overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 group ${
                    isActivePath(item.path) 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <span className={`transition-transform duration-250 ${isActivePath(item.path) ? '' : 'group-hover:scale-105'}`}>
                    {item.icon}
                  </span>
                  <span className={`text-[13px] font-semibold tracking-wide transition-opacity duration-200 ${
                    sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-slate-900 transition-opacity duration-200 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'
        }`}>
          <div className="flex items-center gap-3 text-slate-500 text-xs">
            <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold tracking-wider">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default GuardSidebar;
