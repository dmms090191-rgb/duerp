import { useState } from 'react';
import { Menu, X, Zap, Shield, Users, Download, ChevronRight, Star, Smartphone, Check } from 'lucide-react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-red-600/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Zap className="w-10 h-10 text-red-600 glow-red" />
                <div className="absolute inset-0 bg-red-600/20 blur-xl"></div>
              </div>
              <span className="text-2xl font-bold text-glow-red">NEXUS</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="hover:text-red-500 transition-colors">Accueil</a>
              <a href="#features" className="hover:text-red-500 transition-colors">Fonctionnalités</a>
              <a href="#download" className="hover:text-red-500 transition-colors">Télécharger</a>
              <a href="#contact" className="hover:text-red-500 transition-colors">Contact</a>
              <button className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg glow-red transition-all">
                Connexion
              </button>
            </div>

            <button
              className="md:hidden text-red-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 py-4 space-y-4 border-t border-red-600/30">
              <a href="#home" className="block hover:text-red-500 transition-colors">Accueil</a>
              <a href="#features" className="block hover:text-red-500 transition-colors">Fonctionnalités</a>
              <a href="#download" className="block hover:text-red-500 transition-colors">Télécharger</a>
              <a href="#contact" className="block hover:text-red-500 transition-colors">Contact</a>
              <button className="w-full px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg glow-red transition-all">
                Connexion
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-black to-black"></div>

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-800/20 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="container mx-auto px-4 z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 text-glow-red">
              BIENVENUE DANS
              <span className="block text-red-600 mt-2">LE FUTUR</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              Découvrez une expérience gaming révolutionnaire avec une technologie de pointe
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg text-lg font-semibold glow-red-intense transition-all transform hover:scale-105">
                Commencer Maintenant
                <ChevronRight className="inline-block ml-2" />
              </button>
              <button className="px-8 py-4 border-2 border-red-600 hover:bg-red-600/10 rounded-lg text-lg font-semibold transition-all">
                En Savoir Plus
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/10 to-black"></div>
        <div className="container mx-auto px-4 z-10 relative">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-red-600/30 rounded-2xl p-8 glow-red">
              <h2 className="text-4xl font-bold text-center mb-8 text-glow-red">Créer un Compte</h2>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-black border border-red-600/50 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/50 transition-all"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Prénom</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-black border border-red-600/50 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/50 transition-all"
                      placeholder="Votre prénom"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-black border border-red-600/50 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/50 transition-all"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Code</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black border border-red-600/50 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/50 transition-all"
                    placeholder="Entrez votre code"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Mot de passe</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-black border border-red-600/50 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/50 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirmer</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-black border border-red-600/50 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/50 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="terms"
                    className="w-4 h-4 border-red-600 rounded focus:ring-red-600"
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                    J'accepte les conditions d'utilisation et la politique de confidentialité
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg text-lg font-semibold glow-red-intense transition-all transform hover:scale-105"
                >
                  S'INSCRIRE
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 z-10 relative">
          <h2 className="text-5xl font-bold text-center mb-16 text-glow-red">Fonctionnalités Avancées</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Sécurité Maximale', description: 'Cryptage de niveau militaire pour protéger vos données et transactions' },
              { icon: Zap, title: 'Performance Extrême', description: 'Technologie ultra-rapide pour une expérience sans latence' },
              { icon: Users, title: 'Communauté Active', description: 'Rejoignez des milliers de joueurs du monde entier' }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-900 to-black border border-red-600/30 rounded-xl p-8 hover:border-red-600 transition-all group hover:glow-red"
              >
                <feature.icon className="w-16 h-16 text-red-600 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/20 to-black"></div>
        <div className="container mx-auto px-4 z-10 relative">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '50K+', label: 'Utilisateurs Actifs' },
              { number: '99.9%', label: 'Uptime' },
              { number: '24/7', label: 'Support' },
              { number: '100+', label: 'Pays' }
            ].map((stat, index) => (
              <div key={index} className="p-6">
                <div className="text-5xl font-bold text-red-600 mb-2 text-glow-red">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 relative">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 z-10 relative">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 text-glow-red">Télécharger l'Application</h2>
            <p className="text-xl text-gray-400">Disponible sur toutes les plateformes</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-gray-900 to-black border border-red-600/50 rounded-xl hover:border-red-600 hover:glow-red transition-all group">
              <Smartphone className="w-12 h-12 text-red-600" />
              <div className="text-left">
                <div className="text-sm text-gray-400">Télécharger sur</div>
                <div className="text-xl font-bold">Google Play</div>
              </div>
            </button>

            <button className="flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-gray-900 to-black border border-red-600/50 rounded-xl hover:border-red-600 hover:glow-red transition-all group">
              <Smartphone className="w-12 h-12 text-red-600" />
              <div className="text-left">
                <div className="text-sm text-gray-400">Télécharger sur</div>
                <div className="text-xl font-bold">App Store</div>
              </div>
            </button>

            <button className="flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-gray-900 to-black border border-red-600/50 rounded-xl hover:border-red-600 hover:glow-red transition-all group">
              <Download className="w-12 h-12 text-red-600" />
              <div className="text-left">
                <div className="text-sm text-gray-400">Télécharger pour</div>
                <div className="text-xl font-bold">Windows</div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/10 to-black"></div>
        <div className="container mx-auto px-4 z-10 relative">
          <h2 className="text-5xl font-bold text-center mb-16 text-glow-red">Ce que disent nos utilisateurs</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-900 to-black border border-red-600/30 rounded-xl p-8 hover:border-red-600 transition-all"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-red-600 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6">
                  "Une expérience incroyable! L'interface est fluide et la sécurité est au top."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center text-red-600 font-bold">
                    U{index + 1}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold">Utilisateur {index + 1}</div>
                    <div className="text-sm text-gray-500">Membre vérifié</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 z-10 relative">
          <h2 className="text-5xl font-bold text-center mb-16 text-glow-red">Questions Fréquentes</h2>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: 'Comment créer un compte?', a: 'Remplissez simplement le formulaire d\'inscription ci-dessus avec vos informations.' },
              { q: 'Est-ce sécurisé?', a: 'Oui, nous utilisons un cryptage de niveau militaire pour protéger toutes vos données.' },
              { q: 'Puis-je utiliser l\'application sur mobile?', a: 'Absolument! Notre application est disponible sur iOS et Android.' },
              { q: 'Y a-t-il un support client?', a: 'Notre équipe de support est disponible 24/7 pour vous aider.' }
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-gray-900 to-black border border-red-600/30 rounded-xl p-6 hover:border-red-600 transition-all"
              >
                <div className="flex items-start">
                  <Check className="w-6 h-6 text-red-600 mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{faq.q}</h3>
                    <p className="text-gray-400">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="relative border-t border-red-600/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-8 h-8 text-red-600" />
                <span className="text-xl font-bold">NEXUS</span>
              </div>
              <p className="text-gray-400">La plateforme gaming du futur</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-red-600">Liens Rapides</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#home" className="hover:text-red-500 transition-colors">Accueil</a></li>
                <li><a href="#features" className="hover:text-red-500 transition-colors">Fonctionnalités</a></li>
                <li><a href="#download" className="hover:text-red-500 transition-colors">Télécharger</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-red-600">Légal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-red-500 transition-colors">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Mentions légales</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-red-600">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-red-500 transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-red-600/30 pt-8 text-center text-gray-500">
            <p>&copy; 2026 NEXUS. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
