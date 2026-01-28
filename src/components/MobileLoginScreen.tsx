import React, { useState, useEffect } from 'react';
import { LogIn, AlertCircle, Loader2, Mail, Eye, EyeOff, X } from 'lucide-react';
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
          await supabase
            .from('admins')
            .update({
              is_online: true,
              last_connection: new Date().toISOString()
            })
            .eq('id', adminData.id);

          sessionStorage.setItem('isAdminLoggedIn', 'true');
          sessionStorage.setItem('adminEmail', identifier);
          sessionStorage.setItem('adminUser', JSON.stringify({
            id: adminData.id,
            email: adminData.email,
            type: 'admin',
            nom: adminData.full_name?.split(' ').slice(1).join(' ') || '',
            prenom: adminData.full_name?.split(' ')[0] || ''
          }));
          navigate('/dashboard');
          return;
        }

        const { data: sellerData } = await supabase
          .from('sellers')
          .select('*')
          .eq('email', identifier)
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
          sessionStorage.setItem('sellerEmail', identifier);
          navigate('/seller/dashboard');
          return;
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
      <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent"></div>
        <div className="text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-white to-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl animate-pulse backdrop-blur-xl border border-white/20">
            <img
              src="/kk.png"
              alt="Logo"
              className="w-16 h-16 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = '<svg class="w-14 h-14 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>';
                }
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Cabinet FPE</h1>
          <p className="text-blue-200/80 text-sm font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent"></div>

      <div className="flex-1 flex flex-col p-4 pt-6 relative z-10">
        <div className="text-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-white to-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-2xl backdrop-blur-xl border border-white/20 transform transition-transform hover:scale-105">
            <img
              src="/kk.png"
              alt="Logo"
              className="w-16 h-16 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = '<svg class="w-14 h-14 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>';
                }
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1.5 tracking-tight">Cabinet FPE</h1>
          <p className="text-blue-200/80 text-sm font-medium">Espace Professionnel</p>
        </div>

        <div className="flex-1 flex flex-col">
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-white/90 mb-2 tracking-wide">
                Email ou SIRET
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-blue-300/70 group-focus-within:text-blue-300 transition-colors" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="email@exemple.com ou SIRET"
                  className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-blue-200/60 focus:outline-none focus:bg-white/15 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm font-medium shadow-lg"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-2.5 mb-3">
                <label className="block text-xs font-semibold text-white/90 tracking-wide">
                  Mot de passe (6 chiffres)
                </label>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setShowPassword(!showPassword);
                  }}
                  className="text-white/70 hover:text-white active:text-white transition-all active:scale-95 touch-manipulation select-none p-1 rounded-lg hover:bg-white/10"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 mb-3 shadow-xl">
                <div className="flex justify-center items-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div className="w-9 h-11 flex items-center justify-center">
                        {password[index] && (
                          <div className="text-2xl font-bold text-white drop-shadow-lg">
                            {showPassword ? password[index] : '●'}
                          </div>
                        )}
                      </div>
                      <div className={`w-9 h-1.5 rounded-full transition-all ${password[index] ? 'bg-gradient-to-r from-blue-400 to-cyan-400 shadow-lg shadow-blue-500/50' : 'bg-white/20'}`}></div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      if (!loading && password.length > 0) {
                        handleClearPassword();
                      }
                    }}
                    disabled={loading || password.length === 0}
                    className="w-9 h-11 flex items-center justify-center text-white/70 hover:text-white active:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed ml-1 touch-manipulation select-none rounded-lg hover:bg-white/10 active:scale-95"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      WebkitUserSelect: 'none',
                      userSelect: 'none'
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2.5 mb-3">
                {shuffledDigits.map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      if (!loading && password.length < 6) {
                        handleDigitClick(digit);
                      }
                    }}
                    disabled={loading || password.length >= 6}
                    className="aspect-square bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl hover:from-white/25 hover:to-white/10 active:from-white/30 active:to-white/15 rounded-2xl text-2xl font-bold text-white transition-all duration-200 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed border border-white/20 shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-400/30 touch-manipulation select-none"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      WebkitUserSelect: 'none',
                      userSelect: 'none'
                    }}
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
                className={`w-full text-center transition-all py-1.5 text-xs rounded-lg ${
                  voiceEnabled
                    ? 'text-white font-bold bg-white/10 border border-white/20'
                    : 'text-blue-200/70 hover:text-blue-200'
                }`}
              >
                {voiceEnabled ? 'Désactiver le clavier sonore' : 'Activer le clavier sonore'}
              </button>
            </div>

            {error && (
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-xl border border-red-400/40 rounded-2xl p-3 flex items-start gap-2.5 shadow-xl shadow-red-500/10 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-4 h-4 text-red-200 flex-shrink-0 mt-0.5" />
                <p className="text-red-100 text-xs font-semibold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !identifier || password.length !== 6}
              className="w-full bg-gradient-to-r from-white to-blue-50 hover:from-blue-50 hover:to-white text-blue-900 font-bold py-3.5 rounded-2xl transition-all transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-2xl shadow-blue-900/20 hover:shadow-blue-900/30 text-base touch-manipulation border border-white/50 disabled:border-white/20"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-center text-[10px] text-white/60 font-semibold tracking-wider uppercase">
              Application mobile Cabinet FPE
            </p>
            <p className="text-center text-[9px] text-white/40 mt-1 font-medium">
              Tous droits réservés © 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLoginScreen;
