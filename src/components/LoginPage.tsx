import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sun, Wind, Home, Leaf, UserPlus, X, Award, CheckCircle, Star, Facebook, Linkedin, Instagram, Phone, MapPin, Mail as MailIcon, Eye, EyeOff, AlertCircle } from 'lucide-react';
import RegistrationForm from './RegistrationForm';
import { Registration } from '../types/Registration';
import UnifiedHeader from './UnifiedHeader';
import ContactModal from './ContactModal';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onLogin: (email: string, password: string) => boolean;
  onRegister: (registration: Registration) => void;
  homepageImage?: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister, homepageImage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [siret, setSiret] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

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
    if (location.state?.openLoginModal) {
      setShowModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

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

  const handleDigitClick = (digit: number, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isLoading || password.length >= 6) {
      return;
    }

    setPassword(prev => prev + digit.toString());
    setError('');

    if (voiceEnabled) {
      try {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(digit.toString());
        utterance.lang = 'fr-FR';
        utterance.rate = 1;
        synth.speak(utterance);
      } catch (error) {
        console.error('Speech synthesis error:', error);
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

    if (!email && !siret) {
      setError('Veuillez entrer un email ou un SIRET');
      setIsLoading(false);
      return;
    }

    if (password.length !== 6) {
      setError('Le mot de passe doit contenir 6 chiffres');
      setIsLoading(false);
      return;
    }

    try {
      if (siret && siret.trim()) {
        const cleanedSiret = siret.replace(/\s/g, '');
        console.log('🔵 [LOGIN MODAL] Tentative de connexion avec SIRET:', cleanedSiret, 'Password:', password);

        const { data: sellerData, error: sellerError } = await supabase
          .from('sellers')
          .select('*')
          .eq('siret', cleanedSiret)
          .maybeSingle();

        console.log('🔵 [LOGIN MODAL] Vérification SELLER avec SIRET:', { sellerData, sellerError });

        if (sellerData) {
          console.log('🔵 [LOGIN MODAL] Vendeur trouvé avec SIRET, vérification mot de passe');
          const success = await onLogin(sellerData.email, password);
          if (success) {
            console.log('✅ [LOGIN MODAL] Connexion vendeur réussie - redirection vers dashboard vendeur');
            setIsLoading(false);
            handleCloseModal();
            window.location.href = '/seller/dashboard';
            return;
          } else {
            console.log('❌ [LOGIN MODAL] Échec connexion vendeur - mauvais mot de passe');
            setError('SIRET ou mot de passe incorrect');
            setIsLoading(false);
            return;
          }
        }

        const { data: clientData, error } = await supabase
          .from('clients')
          .select('*')
          .eq('siret', cleanedSiret)
          .eq('client_password', password)
          .maybeSingle();

        console.log('🔵 [LOGIN MODAL] Résultat SIRET CLIENT:', { clientData, error });

        if (error) {
          console.error('❌ [LOGIN MODAL] Erreur Supabase:', error);
          setError('Erreur lors de la connexion');
          setIsLoading(false);
          return;
        }

        if (!clientData) {
          console.log('❌ [LOGIN MODAL] Aucun client trouvé');
          setError('SIRET ou mot de passe incorrect');
          setIsLoading(false);
          return;
        }

        console.log('✅ [LOGIN MODAL] Connexion réussie avec SIRET CLIENT');
        sessionStorage.setItem('clientData', JSON.stringify({
          user: { id: clientData.id, email: clientData.email },
          token: import.meta.env.VITE_SUPABASE_ANON_KEY,
          client: clientData
        }));
        setIsLoading(false);
        handleCloseModal();
        window.location.href = '/client/dashboard';
        return;
      } else if (email && email.trim()) {
        console.log('🔵 [LOGIN MODAL] Tentative de connexion avec EMAIL:', email);

        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        console.log('🔵 [LOGIN MODAL] Vérification ADMIN dans DB:', { adminData, adminError });

        if (adminData || email === 'dmms090191@gmail.com') {
          console.log('🔵 [LOGIN MODAL] Admin trouvé (DB ou super admin), vérification avec onLogin');
          const success = await onLogin(email, password);
          if (success) {
            console.log('✅ [LOGIN MODAL] Connexion admin réussie - redirection vers dashboard');
            setIsLoading(false);
            handleCloseModal();
            window.location.href = '/';
            return;
          } else {
            console.log('❌ [LOGIN MODAL] Échec connexion admin - mauvais mot de passe');
            setError('Email ou mot de passe incorrect');
            setIsLoading(false);
            return;
          }
        }

        const { data: sellerDataByEmail, error: sellerErrorByEmail } = await supabase
          .from('sellers')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        console.log('🔵 [LOGIN MODAL] Vérification SELLER avec EMAIL:', { sellerDataByEmail, sellerErrorByEmail });

        if (sellerDataByEmail) {
          console.log('🔵 [LOGIN MODAL] Vendeur trouvé avec EMAIL, vérification mot de passe');
          const success = await onLogin(email, password);
          if (success) {
            console.log('✅ [LOGIN MODAL] Connexion vendeur réussie - redirection vers dashboard vendeur');
            setIsLoading(false);
            handleCloseModal();
            window.location.href = '/seller/dashboard';
            return;
          } else {
            console.log('❌ [LOGIN MODAL] Échec connexion vendeur - mauvais mot de passe');
            setError('Email ou mot de passe incorrect');
            setIsLoading(false);
            return;
          }
        }

        const { data: clientData, error } = await supabase
          .from('clients')
          .select('*')
          .eq('email', email)
          .eq('client_password', password)
          .maybeSingle();

        console.log('🔵 [LOGIN MODAL] Résultat EMAIL CLIENT:', { clientData, error });

        if (error) {
          console.error('❌ [LOGIN MODAL] Erreur Supabase:', error);
          setError('Erreur lors de la connexion');
          setIsLoading(false);
          return;
        }

        if (!clientData) {
          console.log('❌ [LOGIN MODAL] Aucun client trouvé');
          setError('Email ou mot de passe incorrect');
          setIsLoading(false);
          return;
        }

        console.log('✅ [LOGIN MODAL] Connexion réussie avec EMAIL CLIENT');
        sessionStorage.setItem('clientData', JSON.stringify({
          user: { id: clientData.id, email: clientData.email },
          token: import.meta.env.VITE_SUPABASE_ANON_KEY,
          client: clientData
        }));
        setIsLoading(false);
        handleCloseModal();
        window.location.href = '/client/dashboard';
        return;
      }
    } catch (err) {
      console.error('❌ [LOGIN MODAL] Exception:', err);
      setError('Une erreur est survenue lors de la connexion');
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
    setSiret('');
    setPassword('');
    setError('');
  };

  return (
    <div className="bg-white">
      <UnifiedHeader currentPage="accueil" onLoginClick={() => setShowModal(true)} />

      {/* Modal de connexion */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className="bg-gradient-to-br from-[#2d4578] via-[#3d5a9e] to-[#4d6bb8] rounded-3xl shadow-2xl w-full max-w-md relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {showRegistration ? (
              <div className="p-5 md:p-8">
                <RegistrationForm onRegister={handleRegister} onBackToLogin={handleBackToLogin} />
              </div>
            ) : (
              <div className="p-4 md:p-8">
                <div className="text-center mb-3 md:mb-8">
                  <div className="w-14 h-14 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-4 shadow-xl">
                    <img
                      src="/kk.png"
                      alt="Logo"
                      className="w-10 h-10 md:w-16 md:h-16 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = '<svg class="w-8 h-8 md:w-14 md:h-14 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>';
                        }
                      }}
                    />
                  </div>
                  <h1 className="text-xl md:text-3xl font-bold text-white mb-0.5 md:mb-1.5">Connexion</h1>
                  <p className="text-blue-100 text-xs md:text-base">Accédez à votre espace personnel</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-2.5 md:space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-xs md:text-base font-semibold text-white mb-1.5 md:mb-2">
                      Adresse email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-blue-200/70" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (e.target.value) setSiret('');
                        }}
                        className="block w-full pl-9 pr-3 py-2.5 md:py-3.5 bg-[#2d4578]/40 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-blue-200/50 focus:outline-none focus:border-white/40 focus:bg-[#2d4578]/60 transition-all disabled:opacity-50 text-xs md:text-base"
                        placeholder="votre@email.com"
                        disabled={!!siret}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <span className="text-white/80 font-medium text-xs md:text-base">ou</span>
                  </div>

                  <div>
                    <label htmlFor="siret" className="block text-xs md:text-base font-semibold text-white mb-1.5 md:mb-2">
                      Numéro SIRET
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-blue-200/70" />
                      </div>
                      <input
                        id="siret"
                        type="text"
                        value={siret}
                        onChange={(e) => {
                          setSiret(e.target.value);
                          if (e.target.value) setEmail('');
                        }}
                        className="block w-full pl-9 pr-3 py-2.5 md:py-3.5 bg-[#2d4578]/40 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-blue-200/50 focus:outline-none focus:border-white/40 focus:bg-[#2d4578]/60 transition-all disabled:opacity-50 text-xs md:text-base"
                        placeholder="14 chiffres"
                        maxLength={14}
                        disabled={!!email}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <label className="block text-xs md:text-base font-semibold text-white">
                        Mot de passe
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-white/80 hover:text-white transition-all p-0.5 rounded-lg hover:bg-white/10"
                      >
                        {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex justify-center items-center gap-1 md:gap-2 mb-2 md:mb-3">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <div key={index} className="flex flex-col items-center gap-1">
                          <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
                            {password[index] && (
                              <div className="text-lg md:text-2xl font-bold text-white">
                                {showPassword ? password[index] : '●'}
                              </div>
                            )}
                          </div>
                          <div className={`w-6 h-0.5 md:w-8 md:h-1 rounded-full transition-all ${password[index] ? 'bg-white' : 'bg-white/30'}`}></div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleClearPassword}
                        disabled={isLoading || password.length === 0}
                        className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-white/60 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed rounded-lg hover:bg-white/10"
                      >
                        <X className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 md:gap-2 mb-2 md:mb-3">
                      {shuffledDigits.slice(0, 8).map((digit) => (
                        <button
                          key={digit}
                          type="button"
                          onClick={(e) => handleDigitClick(digit, e)}
                          disabled={isLoading || password.length >= 6}
                          className="aspect-square bg-[#2d4578]/60 backdrop-blur-sm hover:bg-[#2d4578]/80 active:bg-[#2d4578] border-2 border-white/20 hover:border-white/30 rounded-xl md:rounded-2xl text-xl md:text-3xl font-bold text-white transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                        >
                          {digit}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 md:gap-2 mb-2 md:mb-4">
                      {shuffledDigits.slice(8, 10).map((digit) => (
                        <button
                          key={digit}
                          type="button"
                          onClick={(e) => handleDigitClick(digit, e)}
                          disabled={isLoading || password.length >= 6}
                          className="aspect-square bg-[#2d4578]/60 backdrop-blur-sm hover:bg-[#2d4578]/80 active:bg-[#2d4578] border-2 border-white/20 hover:border-white/30 rounded-xl md:rounded-2xl text-xl md:text-3xl font-bold text-white transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
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
                      className={`w-full py-2 md:py-3 text-xs md:text-base rounded-xl md:rounded-2xl font-semibold transition-all ${
                        voiceEnabled
                          ? 'bg-[#2d4578]/60 text-white border-2 border-white/30'
                          : 'bg-[#2d4578]/40 text-white/80 border-2 border-white/20 hover:border-white/30'
                      }`}
                    >
                      {voiceEnabled ? 'Désactiver le clavier sonore' : 'Activer le clavier sonore'}
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-400/40 rounded-xl p-2 flex items-start gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-200 flex-shrink-0 mt-0.5" />
                      <p className="text-red-100 text-xs font-semibold">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || (!email && !siret) || password.length !== 6}
                    className="w-full bg-gradient-to-r from-blue-400 to-blue-300 hover:from-blue-300 hover:to-blue-400 text-[#2d4578] font-bold py-3 md:py-4 rounded-2xl transition-all transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl text-sm md:text-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-[#2d4578]/30 border-t-[#2d4578] rounded-full animate-spin"></div>
                        <span>Connexion...</span>
                      </>
                    ) : (
                      <span>Valider</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Section with Background Image */}
      <section className="pt-[80px] sm:pt-[100px] lg:pt-[140px] pb-12 sm:pb-16 md:pb-20 relative bg-cover bg-center flex items-center justify-center overflow-hidden" style={{ backgroundImage: 'url(https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=1260)' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/85 to-slate-800/90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-blue-600/10 to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_70%)]"></div>
        </div>

        <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="mb-6 sm:mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 shadow-xl">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-white/90">Expertise Réglementaire</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 sm:mb-6 md:mb-8 leading-[1.1] tracking-tight">
            <span className="block text-white drop-shadow-2xl mb-2">
              Obligations légales
            </span>
            <span className="block bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
              et Droit aux entreprises
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 font-light mb-6 sm:mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            Votre partenaire de confiance pour la conformité réglementaire et la sécurité au travail
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <button
              onClick={() => setShowModal(true)}
              className="group px-10 py-5 bg-white text-blue-900 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:-translate-y-1 flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              Démarrer maintenant
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
            <button className="px-10 py-5 bg-white/10 text-white rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 backdrop-blur-lg border-2 border-white/30 hover:border-white/50 w-full sm:w-auto">
              Découvrir nos services
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-100 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-100 rounded-full mb-4 sm:mb-6">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-xs sm:text-sm font-bold tracking-wide uppercase text-blue-900">Notre Mission</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight px-4">
              Mettez-vous en conformité
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                rapidement et sereinement
              </span>
            </h2>

            <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed mb-4 sm:mb-6 px-4">
                Le <span className="font-semibold text-gray-900">Cabinet FPE</span> (Formalités des Particuliers et des Entreprises) vous accompagne dans la mise en conformité réglementaire, à moindre coût, grâce à une plateforme numérique dédiée.
              </p>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed px-4">
                Nous mettons notre expertise au service des entreprises pour les aider à respecter leurs obligations légales et administratives, notamment en matière de prévention des risques professionnels. Nous vous assistons dans la réalisation du Document Unique d'Évaluation des Risques Professionnels (DUERP),{' '}
                <a
                  href="https://entreprendre.service-public.gouv.fr/vosdroits/F35360#:~:text=administrative%20(Premi%C3%A8re%20ministre)-,Le%20document%20unique%20d'%C3%A9valuation%20des%20risques%20professionnels%20(DUERP),peuvent%20%C3%AAtre%20expos%C3%A9s%20les%20salari%C3%A9s"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-2 font-semibold transition-colors"
                >
                  conformément à l'article L4121-1 du Code du travail
                </a>
                , et vous délivrons une attestation de conformité à présenter lors des contrôles.
              </p>
            </div>

            <div className="max-w-5xl mx-auto mb-8 sm:mb-12 px-4">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl sm:rounded-3xl p-1 shadow-2xl">
                <div className="bg-white rounded-[15px] sm:rounded-[22px] p-6 sm:p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
                    <div className="flex-shrink-0 mx-auto md:mx-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                        Document Unique d'Évaluation des Risques (DUERP)
                      </h3>
                      <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                        Nous vous assistons dans la réalisation du DUERP, obligatoire pour toutes les entreprises, et vous aidons à identifier et gérer les risques. Votre conformité est essentielle face aux contrôles.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center px-4">
              <button
                onClick={() => setShowContactModal(true)}
                className="group px-6 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold text-base sm:text-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3 w-full sm:w-auto justify-center"
              >
                <span className="hidden sm:inline">Comment élaborer mon DUERP</span>
                <span className="sm:hidden">Élaborer mon DUERP</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDZjMy4zMSAwIDYgMi42OSA2IDZzLTIuNjkgNi02IDYtNi0yLjY5LTYtNiAyLjY5LTYgNi02eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-30"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-6 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6 leading-tight max-w-4xl mx-auto px-4">
              Sécurisez votre activité, protégez vos salariés et restez en règle en toute simplicité
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl sm:rounded-3xl opacity-75 group-hover:opacity-100 transition-opacity blur-xl"></div>
              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center text-gray-900">Informations importantes</h3>
                <p className="text-sm sm:text-base leading-relaxed text-gray-700 text-center">
                  En cas d'absence de déclaration ou de mise à jour de votre document unique tout entrepreneur et gestionnaire s'expose à des sanctions pénales et financières.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl sm:rounded-3xl opacity-75 group-hover:opacity-100 transition-opacity blur-xl"></div>
              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-2">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center text-gray-900">Le DUERP</h3>
                <p className="text-sm sm:text-base leading-relaxed text-gray-700 text-center">
                  Doit être présenté aux organismes suivants : l'inspection du travail (en cas de contrôle), la médecine du travail (en cas d'accident de travail), le prudhomme (en cas de litige entre le salarié et son employeur).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100 to-transparent rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-cyan-100 to-transparent rounded-full blur-3xl opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-100 to-blue-100 rounded-full mb-4 sm:mb-6">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold tracking-wide uppercase text-red-900">Médias & Actualités</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-red-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                ON EN PARLE
              </span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Découvrez nos interventions et notre expertise reconnue
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="group">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-white p-2">
                <div className="relative aspect-video rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/xStZJPtflzo"
                    title="STOP Covid-19"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900">STOP Covid-19</h3>
                  </div>
                  <p className="text-gray-600">Nos mesures de prévention face à la pandémie</p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-white p-2">
                <div className="relative aspect-video rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/en1jiCVKDXQ"
                    title="DUERP"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900">DUERP</h3>
                  </div>
                  <p className="text-gray-600">Tout savoir sur le Document Unique</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/50"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-100 to-transparent rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-100 to-transparent rounded-full blur-3xl opacity-30"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-100 rounded-full mb-4 sm:mb-6">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm font-bold tracking-wide uppercase text-blue-900">Nos Services</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Une expertise
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> complète </span>
              à votre service
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Des solutions professionnelles adaptées à vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            <div className="group">
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                <div className="relative h-full bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-gray-100 hover:border-blue-200">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                    AUDIT & ANALYSE
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed text-center">
                    L'audit et l'analyse est une expertise professionnelle effectuée par nos agents compétents et impartiaux aboutissant à un jugement par rapport à une norme sur les états financiers, le contrôle interne, l'organisation, la procédure, ou une opération quelconque d'une entité privée ou professionnelle.
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                <div className="relative h-full bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-gray-100 hover:border-blue-200">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                    DIAGNOSTIC
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed text-center">
                    Après identification un agent spécialisé dans le diagnostic professionnel, évalue le sujet selon des indicateurs et critères propres à l'objet de l'étude. En France plusieurs domaines sont soumis obligatoirement au diagnostic en fonction des lois, ou du type de situation dans laquelle l'entité visée est engagée.
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                <div className="relative h-full bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-gray-100 hover:border-blue-200">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                    CONSEIL & ACCOMPAGNEMENT
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed text-center">
                    Par le conseil, nous vous aidons à analyser les problématiques et nous vous accompagnons dans l'animation de vos projets d'amélioration. Un agent est désigné: toujours au service des clients, afin d'optimiser leur dossier et d'obtenir le meilleur pour eux. Nous sommes à votre écoute.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDZjMy4zMSAwIDYgMi42OSA2IDZzLTIuNjkgNi02IDYtNi0yLjY5LTYtNiAyLjY5LTYgNi02eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDMiLz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500 rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500 rounded-full blur-3xl opacity-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
              <div className="relative bg-white text-gray-900 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-white/50">
                <div className="flex justify-center mb-6">
                  <div className="w-18 h-18 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-center text-gray-900">EVRP</h3>
                <h4 className="font-semibold mb-4 text-center text-gray-700 text-sm">Comment mener une évaluation des risques professionnels</h4>
                <p className="text-sm text-gray-600 leading-relaxed text-center">
                  Comment mener une évaluation des risques professionnels dans son entreprises dès l'embauche du premier salarié. Préparer l'évaluation avant d'entamer cette démarche, il faut en définir le cadre ainsi que les moyens à mettre en place et de constituer un groupe de travail comprenant tous les acteurs concernés.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
              <div className="relative bg-white text-gray-900 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-white/50">
                <div className="flex justify-center mb-6">
                  <div className="w-18 h-18 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-center text-gray-900">DUERP</h3>
                <h4 className="font-semibold mb-4 text-center text-gray-700 text-sm">Document unique d'évaluation des risques.</h4>
                <p className="text-sm text-gray-600 leading-relaxed text-center">
                  Prestation et prise en charge DUERP : La rédaction de votre DUERP document unique d'évaluations des risques professionnelles incluent une étude complète de votre établissement en matière de santé et sécurité qui vous sera délivré par le biais de votre choix ainsi qu'une mise à jour pour la première année.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
              <div className="relative bg-white text-gray-900 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-white/50">
                <div className="flex justify-center mb-6">
                  <div className="w-18 h-18 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-center text-gray-900">Article L4121-1</h3>
                <h4 className="font-semibold mb-4 text-center text-gray-700 text-sm">Informations importantes:</h4>
                <p className="text-sm text-gray-600 leading-relaxed text-center">
                  Le document unique d'évaluation des risques professionnels est obligatoire dans toutes les entreprises dès l'embauche du premier salarié. En cas d'absence de déclaration ou de mise à jour de votre document unique tout entrepreneur et gestionnaire s'expose à des sanctions pénales et financières, pouvant aller jusqu'à 15 000 € en cas de récidive, selon l'article L4121-1
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-gray-300 py-8 sm:py-10 md:py-12" style={{ backgroundColor: '#0f1729' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">À propos</h4>
              <p className="text-sm leading-relaxed mb-4">
                Le Cabinet FPE accompagne les entreprises dans leurs démarches réglementaires et administratives.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 bg-white/10 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all hover:scale-110">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-white/10 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all hover:scale-110">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-white/10 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all hover:scale-110">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">DUERP</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => navigate('/quest-ce-que-duerp')} className="hover:text-white transition-colors">
                    Qu'est ce que le DUERP
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/quest-ce-que-penibilite')} className="hover:text-white transition-colors">
                    Qu'est ce que la pénibilité
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/accompagnement')} className="hover:text-white transition-colors">
                    Accompagnements
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">MES DROITS</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => navigate('/cotisations-atmp')} className="hover:text-white transition-colors">
                    Cotisations AT/MP
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/cotisations-atmp#section2')} className="hover:text-white transition-colors">
                    Majoration Forfaitaires
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/prise-en-charge-opco')} className="hover:text-white transition-colors">
                    Prise En Charge OPCO
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">LIENS UTILES</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="hover:text-white transition-colors flex items-center gap-2 text-left"
                  >
                    <Phone className="w-4 h-4" />
                    Contactez-nous
                  </button>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors flex items-center gap-2">
                    <MailIcon className="w-4 h-4" />
                    support@cabinetfpe.fr
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Conditions Générales</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Protection RGPD</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; MydoctoBusiness - Tous droits réservés Cabinet FPE</p>
          </div>
        </div>
      </footer>

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
};

export default LoginPage;