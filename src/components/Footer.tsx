import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ContactModal from './ContactModal';

export default function Footer() {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="text-gray-300 py-8 sm:py-12" style={{ backgroundColor: '#0f1729' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <h3 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">CABINET FPE</h3>
            <p className="text-xs sm:text-sm leading-relaxed">
              Le cabinet FPE a pour but d'accompagner les entreprises dans leurs obligations sociales et en sécurité.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">DUERP</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => handleNavigate('/quest-ce-que-duerp')}
                  className="hover:text-white transition-colors text-left w-full"
                >
                  Qu'est-ce que le DUERP
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('/quest-ce-que-penibilite')}
                  className="hover:text-white transition-colors text-left w-full"
                >
                  Qu'est-ce que la pénibilité
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('/accompagnement')}
                  className="hover:text-white transition-colors text-left w-full"
                >
                  Accompagnements
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">MES DROITS</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handleNavigate('/cotisations-atmp')}
                  className="hover:text-white transition-colors text-left w-full"
                >
                  Cotisations AT/MP
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('/cotisations-atmp#section2')}
                  className="hover:text-white transition-colors text-left w-full"
                >
                  Majoration Forfaitaires
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('/prise-en-charge-opco')}
                  className="hover:text-white transition-colors text-left w-full"
                >
                  Prise En Charge OPCO
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">LIENS UTILES</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="hover:text-white transition-colors text-left w-full"
                >
                  Contactez-nous
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Conditions Générales
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Mentions légales
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Protection RGPD
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>© MydoctoBusiness - Tous droits réservés Cabinet FPE</p>
        </div>
      </div>

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </footer>
  );
}
