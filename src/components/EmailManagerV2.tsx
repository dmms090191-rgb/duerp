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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border-b sticky top-0 z-10 -mx-6 -mt-6 px-6 pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Emails</h1>
                <p className="text-sm text-gray-600">Les emails s'envoient depuis les fiches clients avec les 3 boutons d'action</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 border-b">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-all border-b-2 ${
                    isActive
                      ? `border-${tab.color}-600 text-${tab.color}-600 bg-${tab.color}-50`
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          {activeTab === 'templates' && <TemplatesManager />}
          {activeTab === 'history' && <EmailHistory />}
        </div>
      </div>
    </div>
  );
};

export default EmailManagerV2;
