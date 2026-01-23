import { useNavigate } from 'react-router-dom';
import { Phone, Mail, ChevronDown, LogIn, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const duerpMenuRef = useRef<HTMLDivElement>(null);
  const droitsMenuRef = useRef<HTMLDivElement>(null);
  const duerpTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const droitsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between">
          <img
            src="/kk.png"
            alt="Cabinet FPE"
            className="h-12 w-auto"
          />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex flex-col items-center gap-2">
          <img
            src="/kk.png"
            alt="Cabinet FPE"
            className="h-20 w-auto"
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
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[60px] bg-white z-50 overflow-y-auto">
          <nav className="px-4 py-6 space-y-1">
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                currentPage === 'accueil' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              ACCUEIL
            </button>

            <div className="space-y-1">
              <button
                onClick={() => setShowDuerpMenu(!showDuerpMenu)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                  currentPage === 'duerp' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>DUERP</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showDuerpMenu ? 'rotate-180' : ''}`} />
              </button>
              {showDuerpMenu && (
                <div className="ml-4 space-y-1">
                  <button
                    onClick={() => {
                      navigate('/quest-ce-que-duerp');
                      setMobileMenuOpen(false);
                      setShowDuerpMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Qu'est-Ce Que DUERP
                  </button>
                  <button
                    onClick={() => {
                      navigate('/quest-ce-que-penibilite');
                      setMobileMenuOpen(false);
                      setShowDuerpMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Qu'est-Ce Que La Pénibilité
                  </button>
                  <button
                    onClick={() => {
                      navigate('/accompagnement');
                      setMobileMenuOpen(false);
                      setShowDuerpMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Accompagnement
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setShowDroitsMenu(!showDroitsMenu)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                  currentPage === 'droits' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>MES DROITS</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showDroitsMenu ? 'rotate-180' : ''}`} />
              </button>
              {showDroitsMenu && (
                <div className="ml-4 space-y-1">
                  <button
                    onClick={() => {
                      navigate('/cotisations-atmp');
                      setMobileMenuOpen(false);
                      setShowDroitsMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Cotisations AT/MP
                  </button>
                  <button
                    onClick={() => {
                      navigate('/cotisations-atmp#section2');
                      setMobileMenuOpen(false);
                      setShowDroitsMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Majoration Forfaitaires
                  </button>
                  <button
                    onClick={() => {
                      navigate('/prise-en-charge-opco');
                      setMobileMenuOpen(false);
                      setShowDroitsMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Prise En Charge OPCO
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                navigate('/officiel');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                currentPage === 'officiel' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              OFFICIEL
            </button>

            <button
              onClick={() => {
                navigate('/duerp-conforme');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                currentPage === 'duerp-conforme' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              DUERP CONFORME
            </button>

            <div className="border-t border-gray-200 my-4"></div>

            <button
              onClick={() => {
                setShowContactModal(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium text-sm">Contactez-nous</span>
            </button>

            <button
              onClick={() => {
                if (onLoginClick) {
                  onLoginClick();
                } else {
                  navigate('/', { state: { openLoginModal: true } });
                }
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="font-medium text-sm">Connexion</span>
            </button>
          </nav>
        </div>
      )}

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </header>
  );
}
