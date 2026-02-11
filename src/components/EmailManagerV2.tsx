import React, { useState } from 'react';
import { Mail, Clock } from 'lucide-react';
import TemplatesManager from './TemplatesManager';
import EmailHistory from './EmailHistory';

const EmailManagerV2: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'history'>('templates');

  const tabs = [
    { id: 'templates', label: 'Templates', icon: Mail, color: 'blue' },
    { id: 'history', label: 'Historique', icon: Clock, color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1c2e] via-[#1a2847] to-[#0f1c2e] p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-2xl shadow-2xl border-2 border-white/10 backdrop-blur-2xl overflow-hidden">
          <div className="relative bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
            <div className="relative flex items-center gap-2 sm:gap-3 md:gap-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center ring-2 sm:ring-4 ring-white/30 shadow-lg">
                <Mail className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-white drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-0.5 sm:mb-1 drop-shadow-lg tracking-tight">
                  Gestion des Emails
                </h1>
                <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium">
                  Les emails s'envoient depuis les fiches clients avec les 3 boutons d'action
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 border-b-2 border-white/10 bg-[#1a2847]/50 px-4 sm:px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-medium transition-all border-b-2 ${
                    isActive
                      ? 'border-blue-400 text-white bg-[#1a2847]/70'
                      : 'border-transparent text-white/70 hover:text-white hover:bg-[#1a2847]/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-4 sm:p-6 bg-gradient-to-b from-[#1a2847]/80 to-[#2d4578]/60 backdrop-blur-xl">
            {activeTab === 'templates' && <TemplatesManager />}
            {activeTab === 'history' && <EmailHistory />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailManagerV2;
