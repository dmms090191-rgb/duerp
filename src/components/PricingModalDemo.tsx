import React, { useState } from 'react';
import { Euro, DollarSign } from 'lucide-react';
import PricingModal from './PricingModal';

const PricingModalDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const demoClient = {
    id: 1,
    email: 'client@exemple.com',
    name: 'Jean Dupont'
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Euro className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Grille Tarifaire
            </h1>
            <p className="text-gray-600">
              Consultez nos tarifs et envoyez-les par email à vos clients
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
            >
              <DollarSign className="w-6 h-6" />
              Voir la grille tarifaire
            </button>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Fonctionnalités:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Affichage de 5 tranches tarifaires (1-5, 6-10, 11-15, 16-25, 26-50 salariés)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Prix HT, TTC et paiement en 3x sans frais</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Boutons d'envoi d'email pour chaque tarif</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Interface moderne et responsive</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Client de démonstration</h3>
              <p className="text-sm text-blue-800">
                <strong>Nom:</strong> {demoClient.name}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Email:</strong> {demoClient.email}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Les boutons d'envoi d'email seront actifs avec ce client
              </p>
            </div>
          </div>
        </div>
      </div>

      <PricingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientId={demoClient.id}
        clientEmail={demoClient.email}
        clientName={demoClient.name}
      />
    </div>
  );
};

export default PricingModalDemo;
