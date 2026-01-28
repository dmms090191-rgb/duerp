import React, { useState } from 'react';
import { LogIn, Mail, AlertCircle, Delete } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ClientLoginProps {
  onLoginSuccess: (clientData: any) => void;
}

const ClientLogin: React.FC<ClientLoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [siret, setSiret] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const shuffleDigits = () => {
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    return [...digits].sort(() => Math.random() - 0.5);
  };

  const [shuffledDigits] = useState<number[]>(() => {
    const shuffled = shuffleDigits();
    console.log('Shuffled digits:', shuffled);
    return shuffled;
  });

  const handleDigitClick = (digit: number) => {
    if (password.length < 6) {
      setPassword(prev => prev + digit.toString());
      setError('');
    }
  };

  const handleDelete = () => {
    setPassword(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔵 [CLIENT LOGIN] Soumission du formulaire');
    console.log('🔵 [CLIENT LOGIN] État actuel:', {
      email,
      siret,
      password,
      passwordLength: password.length
    });

    if ((!email && !siret) || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (password.length !== 6) {
      setError('Le code doit contenir exactement 6 chiffres.');
      return;
    }

    if (email && siret) {
      setError('Veuillez utiliser soit l\'email, soit le numéro de SIRET, pas les deux.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (siret) {
        console.log('🔵 [CLIENT LOGIN] Connexion avec SIRET:', siret);
        console.log('🔵 [CLIENT LOGIN] Mot de passe:', password);

        const { data: clientData, error } = await supabase
          .from('clients')
          .select('*')
          .eq('siret', siret)
          .eq('client_password', password)
          .maybeSingle();

        console.log('🔵 [CLIENT LOGIN] Résultat requête SIRET:', { clientData, error });
        console.log('🔵 [CLIENT LOGIN] Données complètes du client:', JSON.stringify(clientData, null, 2));

        if (error) {
          console.error('❌ [CLIENT LOGIN] Erreur Supabase:', error);
          setError('Erreur lors de la connexion.');
          setLoading(false);
          return;
        }

        if (!clientData) {
          console.log('❌ [CLIENT LOGIN] Aucun client trouvé avec SIRET:', siret, 'et mot de passe:', password);
          setError('Numéro de SIRET ou code incorrect.');
          setLoading(false);
          return;
        }

        console.log('✅ [CLIENT LOGIN] Connexion réussie ! Mise à jour du statut en ligne...');

        // Mise à jour du statut en ligne
        await supabase
          .from('clients')
          .update({
            is_online: true,
            last_connection: new Date().toISOString()
          })
          .eq('id', clientData.id);

        const loginData = {
          user: { id: clientData.id, email: clientData.email },
          token: import.meta.env.VITE_SUPABASE_ANON_KEY,
          client: { ...clientData, is_online: true, last_connection: new Date().toISOString() }
        };
        console.log('✅ [CLIENT LOGIN] Données de connexion:', loginData);

        onLoginSuccess(loginData);
        setLoading(false);

        console.log('✅ [CLIENT LOGIN] Navigation vers /client/dashboard');
        navigate('/client/dashboard');
      } else if (email) {
        console.log('🔵 [CLIENT LOGIN] Connexion avec EMAIL:', email);

        const { data: clientData, error } = await supabase
          .from('clients')
          .select('*')
          .eq('email', email)
          .eq('client_password', password)
          .maybeSingle();

        console.log('🔵 [CLIENT LOGIN] Résultat requête:', { clientData, error });

        if (error) {
          console.error('❌ [CLIENT LOGIN] Erreur Supabase:', error);
          setError('Erreur lors de la connexion.');
          setLoading(false);
          return;
        }

        if (!clientData) {
          console.log('❌ [CLIENT LOGIN] Aucun client trouvé avec email:', email);
          setError('Email ou code incorrect.');
          setLoading(false);
          return;
        }

        console.log('✅ [CLIENT LOGIN] Connexion réussie ! Mise à jour du statut en ligne...');

        // Mise à jour du statut en ligne
        await supabase
          .from('clients')
          .update({
            is_online: true,
            last_connection: new Date().toISOString()
          })
          .eq('id', clientData.id);

        const loginData = {
          user: { id: clientData.id, email: clientData.email },
          token: import.meta.env.VITE_SUPABASE_ANON_KEY,
          client: { ...clientData, is_online: true, last_connection: new Date().toISOString() }
        };

        onLoginSuccess(loginData);
        setLoading(false);

        console.log('✅ [CLIENT LOGIN] Navigation vers /client/dashboard');
        navigate('/client/dashboard');
      }
    } catch (err) {
      console.error('❌ [CLIENT LOGIN] Exception:', err);
      setError('Une erreur est survenue lors de la connexion.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center py-2">
            <img
              src="/kk.png"
              alt="Cabinet FPE"
              className="h-40 md:h-48 w-auto mb-2"
            />
            <Link
              to="/"
              className="text-gray-700 hover:text-emerald-600 font-semibold transition-all duration-200 hover:scale-105 text-lg"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </header>

      <div className="pt-[260px] md:pt-[280px] pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                <LogIn className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
              Espace Client
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Connectez-vous pour accéder à votre tableau de bord
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

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
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (e.target.value) setSiret('');
                    }}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    placeholder="votre@email.com"
                    disabled={loading || siret.length > 0}
                  />
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">ou</span>
                </div>
              </div>

              <div>
                <label htmlFor="siret" className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de SIRET
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="siret"
                    value={siret}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setSiret(value);
                      if (value) setEmail('');
                    }}
                    maxLength={14}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    placeholder="Entrez votre numéro SIRET"
                    disabled={loading || email.length > 0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Code numérique
                </label>

                <div className="flex justify-center items-center gap-2 sm:gap-3 mb-6">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <div className="w-8 sm:w-12 h-1 bg-gray-400 rounded-full"></div>
                      {password[index] && (
                        <div className="text-2xl sm:text-3xl font-bold text-gray-700">{password[index]}</div>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={loading || password.length === 0}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6 max-w-md mx-auto">
                  {shuffledDigits.length > 0 ? shuffledDigits.map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleDigitClick(digit)}
                      disabled={loading || password.length >= 6}
                      className="aspect-square bg-gray-100 hover:bg-gray-200 rounded-xl text-2xl sm:text-3xl font-semibold text-gray-700 transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-300"
                    >
                      {digit}
                    </button>
                  )) : (
                    <div className="col-span-4 text-center text-gray-500">Chargement...</div>
                  )}
                </div>

                <div className="max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const synth = window.speechSynthesis;
                      const utterance = new SpeechSynthesisUtterance('Mode clavier sonore activé');
                      utterance.lang = 'fr-FR';
                      synth.speak(utterance);
                    }}
                    className="w-full text-center text-gray-700 underline hover:text-gray-900 transition-colors mb-4 py-2 text-sm"
                  >
                    Activer le clavier sonore
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || (!email && !siret) || password.length !== 6}
                className="w-full max-w-md mx-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-full text-lg font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Valider'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;
