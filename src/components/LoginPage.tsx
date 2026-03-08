import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, ArrowRight, Sun, Wind, Home, Leaf, UserPlus, LogIn, X, Award, CheckCircle, Star, Facebook, Linkedin, Instagram, Phone, MapPin, Mail as MailIcon, ChevronDown, Eye, EyeOff } from 'lucide-react';
import RegistrationForm from './RegistrationForm';
import { Registration } from '../types/Registration';

interface LoginPageProps {
  onLogin: (email: string, password: string) => boolean;
  onRegister: (registration: Registration) => void;
  homepageImage?: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister, homepageImage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const [shuffledDigits] = useState<number[]>(() => {
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const shuffled = [...digits];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  const [statsAnimated, setStatsAnimated] = useState(false);
  const [installations, setInstallations] = useState(0);
  const [years, setYears] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);
  const [savings, setSavings] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);

  const [showSectorMenu, setShowSectorMenu] = useState(false);
  const sectorMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated) {
            setStatsAnimated(true);
            animateCounter(setInstallations, 2500, 1000);
            animateCounter(setYears, 15, 1000);
            animateCounter(setSatisfaction, 98, 1000);
            animateCounter(setSavings, 45, 1000);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [statsAnimated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sectorMenuRef.current && !sectorMenuRef.current.contains(event.target as Node)) {
        setShowSectorMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const animateCounter = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    target: number,
    duration: number
  ) => {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setter(target);
        clearInterval(timer);
      } else {
        setter(Math.floor(current));
      }
    }, 16);
  };

  const handleDigitClick = (digit: number) => {
    if (password.length < 6) {
      setPassword(prev => prev + digit.toString());
      setError('');

      if (voiceEnabled) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(digit.toString());
        utterance.lang = 'fr-FR';
        utterance.rate = 1;
        synth.speak(utterance);
      }
    }
  };

  const handleClearPassword = () => {
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 500));

    const success = onLogin(email, password);

    if (!success) {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        console.log('Tentative de connexion client...', email);

        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();
        console.log('Réponse auth:', response.ok, data);

        if (response.ok && data.access_token) {
          const clientResponse = await fetch(`${supabaseUrl}/rest/v1/clients?id=eq.${data.user.id}`, {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${data.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          const clientData = await clientResponse.json();
          console.log('Données client:', clientResponse.ok, clientData);

          if (clientResponse.ok && clientData.length > 0) {
            console.log('Redirection vers dashboard client...');
            sessionStorage.setItem('clientData', JSON.stringify({
              user: data.user,
              token: data.access_token,
              client: clientData[0]
            }));
            setIsLoading(false);
            window.location.href = '/client/dashboard';
            return;
          } else {
            console.log('Aucune donnée client trouvée');
            setError('Compte client introuvable');
          }
        } else {
          console.log('Échec authentification');
          setError('Email ou mot de passe incorrect');
        }
      } catch (err) {
        console.error('Erreur de connexion:', err);
        setError('Email ou mot de passe incorrect');
      }
    }

    setIsLoading(false);
  };

  const handleRegister = (registration: Registration) => {
    onRegister(registration);
  };

  const handleBackToLogin = () => {
    setShowRegistration(false);
  };

  const handleShowRegistration = () => {
    setShowRegistration(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowRegistration(false);
    setEmail('');
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center py-2">
            <img
              src="/LOGO_OFFICIEL4096.png"
              alt="SJ Renov Pro"
              className="h-40 md:h-48 w-auto mb-2"
            />

            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
              <nav className="flex items-center gap-2 md:gap-4">
                <div ref={sectorMenuRef} className="relative">
                  <button
                    onClick={() => setShowSectorMenu(!showSectorMenu)}
                    onMouseEnter={() => setShowSectorMenu(true)}
                    className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 font-semibold transition-all duration-200 hover:scale-105 text-lg px-2 py-1"
                  >
                    Secteur
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${showSectorMenu ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {showSectorMenu && (
                    <div
                      className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-fade-in"
                      onMouseLeave={() => setShowSectorMenu(false)}
                    >
                      <a
                        href="/secteurs/tertiaire"
                        className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        onClick={() => setShowSectorMenu(false)}
                      >
                        <div className="font-medium">Secteur Tertiaire</div>
                        <div className="text-sm text-gray-500">Bureaux et commerces</div>
                      </a>
                      <a
                        href="/secteurs/residentiel"
                        className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        onClick={() => setShowSectorMenu(false)}
                      >
                        <div className="font-medium">Secteur Résidentiel</div>
                        <div className="text-sm text-gray-500">Maisons et appartements</div>
                      </a>
                      <a
                        href="/secteurs/industriel"
                        className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        onClick={() => setShowSectorMenu(false)}
                      >
                        <div className="font-medium">Secteur Industriel</div>
                        <div className="text-sm text-gray-500">Usines et entrepôts</div>
                      </a>
                    </div>
                  )}
                </div>

                <a
                  href="/qui-sommes-nous"
                  className="text-gray-700 hover:text-emerald-600 font-semibold transition-all duration-200 hover:scale-105 text-lg px-2 py-1"
                >
                  Qui sommes-nous
                </a>
              </nav>

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-200 hover:scale-105 hover:shadow-md text-lg"
              >
                <LogIn className="w-5 h-5" />
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal de connexion */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {showRegistration ? (
              <div className="p-8">
                <RegistrationForm onRegister={handleRegister} onBackToLogin={handleBackToLogin} />
              </div>
            ) : (
              <div className="p-8">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h1>
                  <p className="text-gray-600">Accédez à votre espace personnel</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <label className="block text-sm font-medium text-gray-700 text-center">
                        Mot de passe
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-600 hover:text-gray-800 transition-colors p-1"
                      >
                        {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="flex justify-center items-center gap-2 mb-4">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <div key={index} className="flex flex-col items-center gap-1">
                          {password[index] && (
                            <div className="text-2xl font-bold text-gray-700 mb-1">
                              {showPassword ? password[index] : '★'}
                            </div>
                          )}
                          <div className="w-8 h-1 bg-gray-400 rounded-full"></div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleClearPassword}
                        disabled={isLoading || password.length === 0}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ml-1"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {shuffledDigits.map((digit) => (
                        <button
                          key={digit}
                          type="button"
                          onClick={() => handleDigitClick(digit)}
                          disabled={isLoading || password.length >= 6}
                          className="aspect-square bg-gray-100 hover:bg-gray-200 rounded-xl text-2xl font-semibold text-gray-700 transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-300"
                        >
                          {digit}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setVoiceEnabled(!voiceEnabled);
                        const synth = window.speechSynthesis;
                        const message = !voiceEnabled ? 'Mode clavier sonore activé' : 'Mode clavier sonore désactivé';
                        const utterance = new SpeechSynthesisUtterance(message);
                        utterance.lang = 'fr-FR';
                        synth.speak(utterance);
                      }}
                      className={`w-full text-center underline hover:text-gray-900 transition-colors py-1 text-sm ${
                        voiceEnabled ? 'text-emerald-600 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {voiceEnabled ? 'Désactiver le clavier sonore' : 'Activer le clavier sonore'}
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !email || password.length !== 6}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-full text-lg font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Connexion...
                      </>
                    ) : (
                      'Valider'
                    )}
                  </button>

                  <div className="text-center">
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">ou</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleShowRegistration}
                      className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center justify-center gap-2 mx-auto"
                    >
                      <UserPlus className="w-5 h-5" />
                      S'inscrire
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-[320px] md:pt-[340px] pb-16 bg-gradient-to-br from-emerald-50 via-teal-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                L'énergie verte pour votre habitat
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Experts en solutions énergétiques renouvelables depuis plus de 15 ans.
                Nous transformons votre maison en un espace éco-responsable et économique.
              </p>
              <button className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Demander un devis gratuit
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-lime-400/40 via-emerald-400/40 to-teal-400/40 rounded-2xl blur-3xl animate-neon-blink"></div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-lime-400/50 shadow-lime-400/20">
                <img
                  src="/pa1 copy.jpg"
                  alt="SJ Renov Pro - Rénovation énergétique"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Solutions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des solutions complètes et personnalisées pour tous vos besoins en énergie renouvelable
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 border border-amber-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                <Sun className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secteur Tertiaire</h3>
              <p className="text-gray-600">
                Solutions énergétiques adaptées aux bureaux, commerces et établissements tertiaires pour optimiser vos coûts opérationnels.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8 border border-emerald-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6">
                <Home className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secteur Résidentiel</h3>
              <p className="text-gray-600">
                Transformez votre maison en un espace éco-responsable avec nos solutions de rénovation énergétique personnalisées.
              </p>
            </div>

            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-8 border border-sky-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <Wind className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secteur Industriel</h3>
              <p className="text-gray-600">
                Systèmes énergétiques performants pour réduire l'empreinte carbone et les coûts énergétiques de votre industrie.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Notre Méthode en 4 Étapes</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Un processus éprouvé pour garantir la réussite de votre projet
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/20 h-full hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/50 group-hover:shadow-emerald-500/80 transition-shadow">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Étude</h3>
                <p className="text-gray-300 leading-relaxed">
                  Nous commençons par une analyse complète de vos besoins et de votre bâtiment. Nos experts réalisent une visite technique, évaluent la faisabilité et identifient les solutions énergétiques les plus adaptées à votre profil et à vos objectifs de performance.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/20 h-full hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/50 group-hover:shadow-emerald-500/80 transition-shadow">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Conception</h3>
                <p className="text-gray-300 leading-relaxed">
                  Sur la base de l'étude, nous élaborons une solution sur mesure intégrant plans techniques, simulation des gains énergétiques et sélection des équipements les plus performants du marché. Chaque détail est optimisé pour garantir efficacité, durabilité et conformité réglementaire.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/20 h-full hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/50 group-hover:shadow-emerald-500/80 transition-shadow">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Exécution</h3>
                <p className="text-gray-300 leading-relaxed">
                  Nos équipes qualifiées assurent la mise en œuvre avec rigueur et précision. Les travaux sont réalisés dans le respect des normes environnementales, des délais convenus et de la sécurité du site. Nos installations sont testées et validées avant mise en service.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/20 h-full hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/50 group-hover:shadow-emerald-500/80 transition-shadow">
                  <span className="text-3xl font-bold text-white">4</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Livraison</h3>
                <p className="text-gray-300 leading-relaxed">
                  À la fin du chantier, nous effectuons une vérification complète et vous remettons un rapport détaillé. Nous assurons également la formation à l'utilisation de vos équipements et restons à vos côtés pour le suivi technique, garantissant la performance durable de votre installation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">{installations.toLocaleString()}+</div>
              <p className="text-emerald-100 text-lg">Installations réalisées</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">{years} ans</div>
              <p className="text-emerald-100 text-lg">D'expertise</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">{satisfaction}%</div>
              <p className="text-emerald-100 text-lg">Clients satisfaits</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">{savings}%</div>
              <p className="text-emerald-100 text-lg">D'économies moyennes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ils nous font confiance</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez les témoignages de nos clients satisfaits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">
                "Installation impeccable et équipe très professionnelle. Nos factures d'électricité ont diminué de 60% !"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-emerald-600">MR</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Marie Rousseau</div>
                  <div className="text-sm text-gray-500">Paris</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">
                "Suivi excellent du projet de A à Z. La pompe à chaleur fonctionne parfaitement depuis 3 ans."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-emerald-600">PD</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Pierre Dubois</div>
                  <div className="text-sm text-gray-500">Lyon</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">
                "Conseils pertinents et devis transparent. Je recommande vivement pour tout projet d'énergie verte."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-emerald-600">SL</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sophie Laurent</div>
                  <div className="text-sm text-gray-500">Marseille</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <h3 className="text-3xl font-bold text-white tracking-tight">SJRenov Pro</h3>
              </div>
              <p className="text-gray-400">
                Votre partenaire pour une transition énergétique réussie.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Panneaux solaires</li>
                <li>Pompes à chaleur</li>
                <li>Isolation thermique</li>
                <li>Audit énergétique</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+33.(0).6.20.00.35.82</span>
                </li>
                <li className="flex items-center gap-2">
                  <MailIcon className="w-4 h-4" />
                  <span>contact@sjrenovpro.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Paris, France</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Suivez-nous</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
            <p>&copy; 2025 SJ Renov Pro. Tous droits réservés.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">CGV</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;