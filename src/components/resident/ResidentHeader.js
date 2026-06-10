import React, { useState } from 'react';
import NotificationDropdown from '../NotificationDropdown';
import './ResidentHeader.css';

const ResidentHeader = ({ user, handleLogout, sidebarOpen, setSidebarOpen }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 bg-white/70 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100/80 transition-colors lg:hidden"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-slate-100/80 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden md:block">
            <h1 className="text-sm font-bold text-slate-800 tracking-tight">Resident Portal</h1>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Welcome back, {user?.name?.split(' ')[0] || 'Resident'}</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <NotificationDropdown />
          
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-100/80 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm shadow-indigo-500/20">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'R'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[13px] font-bold text-slate-700 leading-tight">{user?.name || 'Resident'}</p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Flat {user?.flatNumber || 'N/A'}</p>
              </div>
              <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-250 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100/80 py-2.5 z-50 animate-slide-up">
                  <div className="px-4 py-3 border-b border-slate-100/80">
                    <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{user?.email}</p>
                    <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-1.5">Flat {user?.flatNumber}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-[calc(100%-16px)] mx-2 mt-2 px-3 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ResidentHeader;
