import React, { useState, useEffect } from 'react';
import { LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const MobileLoginScreen: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>';
                  }
                }}
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Cabinet FPE</h1>
            <p className="text-blue-100 text-sm">Espace Professionnel</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email ou SIRET
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="email@exemple.com ou SIRET"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 rounded-xl transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Se connecter
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-xs text-gray-500">
                Application mobile CRM Cabinet FPE
              </p>
              <p className="text-center text-xs text-gray-400 mt-1">
                Tous droits réservés © 2024
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLoginScreen;
