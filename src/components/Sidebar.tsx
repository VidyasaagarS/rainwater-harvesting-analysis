import React from 'react';
import {
  LayoutDashboard,
  CloudRain,
  Calculator,
  Database,
  BarChart3,
  ShieldCheck,
  Settings,
  Droplet,
  Leaf,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ViewMode } from '../types';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeView, setActiveView } = useApp();

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'forecast', label: 'Rainfall Forecast', icon: <CloudRain className="w-5 h-5" /> },
    { id: 'calculator', label: 'Water Calculator', icon: <Calculator className="w-5 h-5" /> },
    { id: 'storage', label: 'Storage & Usage', icon: <Database className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'recommendations', label: 'Recommendations', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleNavClick = (id: ViewMode) => {
    setActiveView(id);
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-[#0a1120] text-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } shadow-2xl border-r border-slate-800`}
    >
      {/* Top Header Logo */}
      <div>
        <div className="p-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-[#0a1120] rounded-full flex items-center justify-center relative">
                <Droplet className="w-5 h-5 text-blue-400 fill-blue-400/30" />
                <Leaf className="w-3 h-3 text-emerald-400 absolute -top-0.5 -right-0.5 fill-emerald-400" />
              </div>
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight text-white leading-tight">
                RainWater
              </div>
              <div className="text-xs font-medium text-slate-400 tracking-wide">
                Harvesting System
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          {setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold translate-x-1'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Illustration & Branding */}
      <div className="p-4 m-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0d1b36] border border-slate-800/80 relative overflow-hidden">
        <div className="w-full h-28 relative mb-2 flex items-center justify-center">
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <path
              d="M 30 35 Q 30 20 45 20 Q 55 10 75 20 Q 90 15 95 30 Q 110 30 105 45 Q 105 55 90 55 L 35 55 Q 25 55 30 35 Z"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="1"
              opacity="0.8"
            />
            <path
              d="M 110 25 Q 110 15 120 15 Q 130 8 145 15 Q 155 10 160 22 Q 170 22 168 35 L 115 35 Z"
              fill="#334155"
              opacity="0.6"
            />

            <line x1="45" y1="60" x2="40" y2="72" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="65" y1="60" x2="60" y2="72" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="85" y1="60" x2="80" y2="72" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />

            <path d="M 20 75 L 70 45 L 120 75 Z" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            <rect x="30" y="75" width="80" height="40" fill="#1e293b" />
            <rect x="40" y="85" width="20" height="20" fill="#38bdf8" opacity="0.3" rx="2" />

            <path d="M 118 73 L 135 73 L 135 95 L 145 95" fill="none" stroke="#64748b" strokeWidth="2.5" />

            <rect x="145" y="70" width="40" height="45" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
            <ellipse cx="165" cy="70" rx="20" ry="5" fill="#0369a1" />
            <ellipse cx="165" cy="115" rx="20" ry="5" fill="#075985" />
            <rect x="150" y="85" width="30" height="25" fill="#38bdf8" opacity="0.6" rx="2" />
            
            <circle cx="130" cy="110" r="8" fill="#10b981" />
            <circle cx="123" cy="112" r="6" fill="#059669" />
          </svg>
        </div>

        <div className="text-left z-10 relative">
          <div className="text-white font-extrabold text-base leading-snug">
            Save Rain
          </div>
          <div className="text-cyan-400 font-extrabold text-base leading-snug">
            Save Tomorrow
          </div>
        </div>
      </div>
    </aside>
  );
};
