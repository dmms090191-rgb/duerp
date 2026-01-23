import { useNavigate } from 'react-router-dom';
import { Phone, Mail, ChevronDown, LogIn } from 'lucide-react';
import { useState, useRef } from 'react';
import ContactModal from './ContactModal';

interface UnifiedHeaderProps {
  currentPage?: 'accueil' | 'duerp' | 'droits' | 'officiel';
  onLoginClick?: () => void;
}

export default function UnifiedHeader({ currentPage, onLoginClick }: UnifiedHeaderProps) {
  const navigate = useNavigate();
  const [showDuerpMenu, setShowDuerpMenu] = useState(false);
  const [showDroitsMenu, setShowDroitsMenu] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const duerpMenuRef = useRef<HTMLDivElement>(null);
  const droitsMenuRef = useRef<HTMLDivElement>(null);
  const duerpTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const droitsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDuerpMouseEnter = () => {
    if (duerpTimeoutRef.current) {
      clearTimeout(duerpTimeoutRef.current);
    }
    setShowDuerpMenu(true);
  };

  const handleDuerpMouseLeave = () => {
    duerpTimeoutRef.current = setTimeout(() => {
      setShowDuerpMenu(false);
    }, 300);
  };

  const handleDroitsMouseEnter = () => {
    if (droitsTimeoutRef.current) {
      clearTimeout(droitsTimeoutRef.current);
    }
    setShowDroitsMenu(true);
  };

  const handleDroitsMouseLeave = () => {
    droitsTimeoutRef.current = setTimeout(() => {
      setShowDroitsMenu(false);
    }, 300);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 border-b border-gray-100 overflow-visible">
      <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col items-center gap-2">
        <img
          src="/cabinet.svg"
          alt="Cabinet FPE"
          className="h-20"
        />

        <nav className="flex items-center gap-4 py-1">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className={`font-semibold text-xs tracking-wide transition-all hover:scale-105 relative group ${
              currentPage === 'accueil' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            ACCUEIL
            {currentPage === 'accueil' && (
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </a>

          <div
            ref={duerpMenuRef}
            className="relative"
            onMouseEnter={handleDuerpMouseEnter}
            onMouseLeave={handleDuerpMouseLeave}
          >
            <button
              onClick={() => setShowDuerpMenu(!showDuerpMenu)}
              className={`flex items-center gap-1.5 font-semibold text-xs tracking-wide transition-all hover:scale-105 relative group ${
                currentPage === 'duerp' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              DUERP
              <ChevronDown className={`w-3 h-3 transition-all duration-300 ${showDuerpMenu ? 'rotate-180' : ''}`} />
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </button>

            {showDuerpMenu && (
              <div
                className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
              >
                <button
                  onClick={() => {
                    setShowDuerpMenu(false);
                    navigate('/quest-ce-que-duerp');
                  }}
                  className="w-full text-left block px-5 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                >
                  Qu'est-Ce Que DUERP
                </button>
                <button
                  onClick={() => {
                    setShowDuerpMenu(false);
                    navigate('/quest-ce-que-penibilite');
                  }}
                  className="w-full text-left block px-5 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                >
                  Qu'est-Ce Que La Pénibilité
                </button>
                <button
                  onClick={() => {
                    setShowDuerpMenu(false);
                    navigate('/accompagnement');
                  }}
                  className="w-full text-left block px-5 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                >
                  Accompagnement
                </button>
              </div>
            )}
          </div>

          <div
            ref={droitsMenuRef}
            className="relative"
            onMouseEnter={handleDroitsMouseEnter}
            onMouseLeave={handleDroitsMouseLeave}
          >
            <button
              onClick={() => setShowDroitsMenu(!showDroitsMenu)}
              className={`flex items-center gap-1.5 font-semibold text-xs tracking-wide transition-all hover:scale-105 relative group ${
                currentPage === 'droits' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              MES DROITS
              <ChevronDown className={`w-3 h-3 transition-all duration-300 ${showDroitsMenu ? 'rotate-180' : ''}`} />
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </button>

            {showDroitsMenu && (
              <div
                className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
              >
                <button
                  onClick={() => {
                    setShowDroitsMenu(false);
                    navigate('/cotisations-atmp');
                  }}
                  className="w-full text-left block px-5 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                >
                  Cotisations AT/MP
                </button>
                <button
                  onClick={() => {
                    setShowDroitsMenu(false);
                    navigate('/cotisations-atmp#section2');
                  }}
                  className="w-full text-left block px-5 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                >
                  Majoration Forfaitaires
                </button>
                <button
                  onClick={() => {
                    setShowDroitsMenu(false);
                    navigate('/prise-en-charge-opco');
                  }}
                  className="w-full text-left block px-5 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                >
                  Prise En Charge OPCO
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/officiel')}
            className={`font-semibold text-xs tracking-wide transition-all hover:scale-105 relative group ${
              currentPage === 'officiel' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            OFFICIEL
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
          </button>

          <button
            onClick={() => navigate('/duerp-conforme')}
            className={`font-semibold text-xs tracking-wide transition-all hover:scale-105 relative group ${
              currentPage === 'duerp-conforme' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            DUERP CONFORME
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
          </button>

          <div className="w-px h-4 bg-gray-300 mx-1"></div>

          <button
            onClick={() => setShowContactModal(true)}
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors group"
          >
            <Phone className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-xs">Contactez-nous</span>
          </button>

          <button
            onClick={onLoginClick || (() => navigate('/', { state: { openLoginModal: true } }))}
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors group"
          >
            <LogIn className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-xs">Connexion</span>
          </button>
        </nav>
      </div>

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </header>
  );
}
