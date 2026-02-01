import React, { useState } from 'react';
import { ShoppingBag, Mail, Lock, LogIn, AlertCircle, Home } from 'lucide-react';
import { Seller } from '../types/Seller';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface SellerLoginProps {
  sellers: Seller[];
  onLoginSuccess: (sellerData: Seller) => void;
}

const SellerLogin: React.FC<SellerLoginProps> = ({ sellers, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        console.error('Erreur authentification:', authError);
        setError('Email ou mot de passe incorrect');
        return;
      }

      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (sellerError || !sellerData) {
        console.error('Erreur récupération vendeur:', sellerError);
        await supabase.auth.signOut();
        setError('Ce compte n\'est pas un compte vendeur');
        return;
      }

      await supabase
        .from('sellers')
        .update({
          is_online: true,
          last_connection: new Date().toISOString()
        })
        .eq('id', sellerData.id);

      const formattedSeller: Seller = {
        id: sellerData.id,
        nom: sellerData.full_name?.split(' ').pop() || '',
        prenom: sellerData.full_name?.split(' ')[0] || '',
        email: sellerData.email,
        motDePasse: sellerData.password || '',
        dateCreation: new Date(sellerData.created_at).toLocaleString('fr-FR'),
        isOnline: true,
        lastConnection: new Date().toISOString()
      };

      onLoginSuccess(formattedSeller);
    } catch (error: any) {
      console.error('Erreur connexion:', error);
      setError('Une erreur est survenue lors de la connexion');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex items-center gap-2 text-green-700 hover:text-green-900 font-medium transition-colors group"
        >
          <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Retour à l'accueil</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Connexion Seller
            </h2>
            <p className="text-gray-600">
              Accédez à votre espace vendeur
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="votre.email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-5 h-5" />
              Se connecter
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous n'avez pas de compte seller ?<br />
              Contactez un administrateur
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerLogin;
