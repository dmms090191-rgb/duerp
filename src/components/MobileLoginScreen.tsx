import React, { useState, useEffect } from 'react';
import { LogIn, AlertCircle, Loader2, Eye, EyeOff, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const MobileLoginScreen: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const navigate = useNavigate();

  const [shuffledDigits] = useState<number[]>(() => {
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const shuffled = [...digits];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const isAdminLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
      const sellerData = sessionStorage.getItem('sellerData');
      const clientData = sessionStorage.getItem('clientData');

      if (isAdminLoggedIn) {
        navigate('/dashboard');
        return;
      }

      if (sellerData) {
        navigate('/seller/dashboard');
        return;
      }

      if (clientData) {
        navigate('/');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Erreur vérification session:', err);
    } finally {
      setCheckingSession(false);
    }
  };

  const handleDigitClick = (digit: number) => {
    if (loading || password.length >= 6) {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length !== 6) {
      setError('Le mot de passe doit contenir 6 chiffres');
      setLoading(false);
      return;
    }

    try {
      const isEmail = identifier.includes('@');

      if (isEmail) {
        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('email', identifier)
          .maybeSingle();

        if (adminData) {
          const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
            email: identifier,
            password: password,
          });

          if (!signInError && authData.user) {
            await supabase
              .from('admins')
              .update({
                is_online: true,
                last_connection: new Date().toISOString()
              })
              .eq('id', adminData.id);

            sessionStorage.setItem('isAdminLoggedIn', 'true');
            sessionStorage.setItem('adminData', JSON.stringify(adminData));
            navigate('/dashboard');
            return;
          }
        }

        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('email', identifier)
          .maybeSingle();

        if (clientData && clientData.client_password === password) {
          await supabase
            .from('clients')
            .update({
              is_online: true,
              last_connection: new Date().toISOString()
            })
            .eq('id', clientData.id);

          sessionStorage.setItem('clientData', JSON.stringify({
            user: { id: clientData.id, email: clientData.email },
            token: 'client-token',
            client: clientData
          }));
          navigate('/');
          return;
        }
      } else {
        const { data: sellerData } = await supabase
          .from('sellers')
          .select('*')
          .eq('siret', identifier)
          .maybeSingle();

        if (sellerData) {
          await supabase
            .from('sellers')
            .update({
              is_online: true,
              last_connection: new Date().toISOString()
            })
            .eq('id', sellerData.id);

          sessionStorage.setItem('sellerData', JSON.stringify(sellerData));
          sessionStorage.setItem('sellerEmail', sellerData.email);
          navigate('/seller/dashboard');
          return;
        }
      }

      setError('Identifiants incorrects');
    } catch (err) {
      console.error('Erreur connexion:', err);
      setError('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2d4578] via-[#3d5a9e] to-[#4d6bb8] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl animate-pulse">
            <img
              src="/kk.png"
              alt="Logo"
              className="w-16 h-16 md:w-20 md:h-20 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = '<svg class="w-12 h-12 md:w-16 md:h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>';
                }
              }}
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Cabinet FPE</h1>
          <p className="text-blue-100 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d4578] via-[#3d5a9e] to-[#4d6bb8] flex flex-col overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 md:mb-10">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <img
                src="/kk.png"
                alt="Logo"
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<svg class="w-12 h-12 md:w-16 md:h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>';
                  }
                }}
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Cabinet FPE</h1>
            <p className="text-blue-100 text-base md:text-lg">Espace Professionnel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
            <div>
              <label className="block text-sm md:text-base font-semibold text-white mb-3">
                Email ou SIRET
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="email@exemple.com ou SIRET"
                className="w-full px-4 md:px-5 py-3 md:py-4 bg-[#2d4578]/40 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-blue-200/50 focus:outline-none focus:border-white/40 focus:bg-[#2d4578]/60 transition-all text-sm md:text-base"
                required
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm md:text-base font-semibold text-white">
                  Mot de passe (6 chiffres)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white/80 hover:text-white transition-all p-1.5 rounded-lg hover:bg-white/10"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>

              <div className="bg-[#2d4578]/60 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-4 md:p-5 mb-4">
                <div className="flex justify-center items-center gap-2 md:gap-2.5 mb-3">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <div
                      key={index}
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-white text-xl md:text-2xl font-bold"
                    >
                      {password[index] ? (showPassword ? password[index] : '●') : ''}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleClearPassword}
                    disabled={loading || password.length === 0}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-white/60 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
                <div className="flex justify-center gap-1.5 md:gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <div
                      key={index}
                      className={`w-8 h-1 md:w-10 md:h-1.5 rounded-full transition-all ${
                        password[index] ? 'bg-white' : 'bg-white/30'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2.5 md:gap-3 mb-4">
                {shuffledDigits.slice(0, 8).map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleDigitClick(digit)}
                    disabled={loading || password.length >= 6}
                    className="aspect-square bg-[#2d4578]/60 backdrop-blur-sm hover:bg-[#2d4578]/80 active:bg-[#2d4578] border-2 border-white/20 hover:border-white/30 rounded-2xl text-2xl md:text-3xl font-bold text-white transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                  >
                    {digit}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2.5 md:gap-3 mb-4">
                {shuffledDigits.slice(8, 10).map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleDigitClick(digit)}
                    disabled={loading || password.length >= 6}
                    className="aspect-square bg-[#2d4578]/60 backdrop-blur-sm hover:bg-[#2d4578]/80 active:bg-[#2d4578] border-2 border-white/20 hover:border-white/30 rounded-2xl text-2xl md:text-3xl font-bold text-white transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
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
                className={`w-full py-3 md:py-3.5 text-sm md:text-base rounded-2xl font-semibold transition-all ${
                  voiceEnabled
                    ? 'bg-[#2d4578]/60 text-white border-2 border-white/30'
                    : 'bg-[#2d4578]/40 text-white/80 border-2 border-white/20 hover:border-white/30'
                }`}
              >
                {voiceEnabled ? 'Désactiver le clavier sonore' : 'Activer le clavier sonore'}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-400/40 rounded-2xl p-3 md:p-4 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-200 flex-shrink-0 mt-0.5" />
                <p className="text-red-100 text-sm md:text-base font-semibold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !identifier || password.length !== 6}
              className="w-full bg-gradient-to-r from-blue-400 to-blue-300 hover:from-blue-300 hover:to-blue-400 text-[#2d4578] font-bold py-3.5 md:py-4 rounded-2xl transition-all transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-xl text-base md:text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 md:w-6 md:h-6" />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="py-4 md:py-6 text-center">
        <p className="text-blue-200/70 text-xs md:text-sm font-semibold tracking-wide">
          APPLICATION MOBILE CABINET FPE
        </p>
        <p className="text-blue-200/50 text-xs mt-1">
          Tous droits réservés © 2024
        </p>
      </div>
    </div>
  );
};

export default MobileLoginScreen;
