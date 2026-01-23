import { useNavigate } from 'react-router-dom';
import { Phone, Mail, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface CompactNavbarProps {
  currentPage?: 'accueil' | 'duerp' | 'droits' | 'officiel';
}

export default function CompactNavbar({ currentPage }: CompactNavbarProps) {
  const navigate = useNavigate();
  const [showDuerpMenu, setShowDuerpMenu] = useState(false);
  const [showDroitsMenu, setShowDroitsMenu] = useState(false);

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <img
                src="/kk.png"
                alt="Cabinet FPE"
                className="h-14 my-1"
              />
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => navigate('/')}
                className={`font-medium text-xs uppercase tracking-wide transition-colors ${
                  currentPage === 'accueil'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Accueil
              </button>

              <div
                className="relative"
                onMouseEnter={() => setShowDuerpMenu(true)}
                onMouseLeave={() => setShowDuerpMenu(false)}
              >
                <button className={`font-medium text-xs uppercase tracking-wide transition-colors flex items-center gap-1 ${
                  currentPage === 'duerp'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}>
                  DUERP
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showDuerpMenu ? 'rotate-180' : ''}`} />
                </button>

                {showDuerpMenu && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => navigate('/quest-ce-que-duerp')}
                      className="w-full text-left block px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Qu'est-Ce Que DUERP
                    </button>
                    <button
                      onClick={() => navigate('/quest-ce-que-penibilite')}
                      className="w-full text-left block px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Qu'est-Ce Que La Pénibilité
                    </button>
                    <button
                      onClick={() => navigate('/accompagnement')}
                      className="w-full text-left block px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Accompagnement
                    </button>
                  </div>
                )}
              </div>

              <div
                className="relative"
                onMouseEnter={() => setShowDroitsMenu(true)}
                onMouseLeave={() => setShowDroitsMenu(false)}
              >
                <button className={`font-medium text-xs uppercase tracking-wide transition-colors flex items-center gap-1 ${
                  currentPage === 'droits'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}>
                  Mes Droits
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showDroitsMenu ? 'rotate-180' : ''}`} />
                </button>

                {showDroitsMenu && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => navigate('/cotisations-atmp')}
                      className="w-full text-left block px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Cotisations AT/MP
                    </button>
                    <button
                      onClick={() => {
                        setShowDroitsMenu(false);
                        navigate('/cotisations-atmp#section2');
                      }}
                      className="w-full text-left block px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Majoration Forfaitaires
                    </button>
                    <button
                      onClick={() => navigate('/prise-en-charge-opco')}
                      className="w-full text-left block px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Prise En Charge OPCO
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/officiel')}
                className={`font-medium text-xs uppercase tracking-wide transition-colors ${
                  currentPage === 'officiel'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Officiel
              </button>

              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium text-xs uppercase tracking-wide transition-colors">
                DUERP Conforme
              </a>

              <div className="w-px h-4 bg-gray-300 mx-2"></div>

              <a href="#" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <Phone className="w-3 h-3 mr-1" />
                <span className="font-medium text-xs">Contactez-nous</span>
              </a>

              <a href="#" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <Mail className="w-3 h-3 mr-1" />
                <span className="font-medium text-xs">Connexion</span>
              </a>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
