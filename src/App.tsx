import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KPICardsRow } from './components/KPICardsRow';
import { DashboardView } from './components/views/DashboardView';
import { ForecastView } from './components/views/ForecastView';
import { CalculatorView } from './components/views/CalculatorView';
import { StorageUsageView } from './components/views/StorageUsageView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { RecommendationsView } from './components/views/RecommendationsView';
import { SettingsView } from './components/views/SettingsView';
import { CheckCircle } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, toastMessage } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#edf2f8] flex text-slate-800 font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Left Vertical Dark Navy Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all duration-300">
        <Header setMobileOpen={setMobileOpen} />

        <main className="flex-1 mt-2">
          {activeView === 'dashboard' && (
            <>
              <KPICardsRow />
              <div className="mt-6">
                <DashboardView />
              </div>
            </>
          )}

          {activeView === 'forecast' && <ForecastView />}
          {activeView === 'calculator' && <CalculatorView />}
          {activeView === 'storage' && <StorageUsageView />}
          {activeView === 'analytics' && <AnalyticsView />}
          {activeView === 'recommendations' && <RecommendationsView />}
          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
