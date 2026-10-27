import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, ChevronDown, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen }) => {
  const { selectedLocation, setSelectedLocationId, locationsList } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4 px-4 sm:px-8 bg-transparent">
      {/* Title & Subtitle + Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
          aria-label="Open Navigation"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Rainwater Harvesting Monitoring System
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5 tracking-wide">
            Predict &bull; Plan &bull; Harvest &bull; Conserve
          </p>
        </div>
      </div>

      {/* Selectors on Right */}
      <div className="flex items-center gap-3 self-start md:self-auto">
        {/* Location Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 text-slate-800 text-sm font-semibold transition-all duration-200"
          >
            <MapPin className="w-4 h-4 text-blue-600 fill-blue-100" />
            <span>
              {selectedLocation.name}, {selectedLocation.state}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Location
              </div>
              {locationsList.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocationId(loc.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between hover:bg-blue-50 transition-colors ${
                    selectedLocation.id === loc.id
                      ? 'font-bold text-blue-600 bg-blue-50/60'
                      : 'text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    {loc.name}, {loc.state}
                  </span>
                  {selectedLocation.id === loc.id && (
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Selector Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-800 text-sm font-semibold">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>12 Nov 2024</span>
        </div>
      </div>
    </header>
  );
};
