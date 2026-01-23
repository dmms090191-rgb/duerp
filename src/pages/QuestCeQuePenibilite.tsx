import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileEdit, Search, List, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import UnifiedHeader from '../components/UnifiedHeader';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';

export default function QuestCeQuePenibilite() {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UnifiedHeader currentPage="duerp" />

      {/* Hero Section */}
      <section
        className="relative h-80 bg-cover bg-center flex items-center justify-center mt-32"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(30, 64, 175, 0.9), rgba(59, 130, 246, 0.8)), url('/blog-duerp.png.webp')`
        }}
      >
        <div className="text-center px-4">
          <div className="inline-block mb-4 px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
            <span className="text-white font-semibold text-sm uppercase tracking-wide">
              Conformité & Sécurité
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">
            Pénibilité mieux intégrer,<br />c'est mieux avancer.
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto">
            Protégez vos équipes et optimisez votre conformité réglementaire
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          {/* Introduction Section */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-blue-600">
                  QU'EST-CE QUE LA PÉNIBILITÉ ?
                </h2>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 mx-auto rounded-full"></div>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl p-10 shadow-xl border border-blue-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full -mr-32 -mt-32 opacity-30 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-100 rounded-full -ml-32 -mb-32 opacity-30 blur-3xl"></div>

              <div className="relative z-10">
                <div className="flex items-start gap-3 mb-6">
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <FileEdit className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 pt-1">
                    Document Unique et pénibilité
                  </h3>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-8 border border-blue-100">
                  <p className="text-gray-800 leading-relaxed text-lg">
                    Les facteurs de pénibilité sont des <span className="font-semibold text-blue-900">risques professionnels</span>. La sélection des postes est réalisée en cohérence avec l'évaluation des risques qui a été préalablement élaboré <span className="font-medium text-blue-700">(article L.4121-3-1 du code du travail)</span>. Le document unique est indispensable pour travailler sur la pénibilité car il réalise un inventaire exhaustif des risques présents dans l'entreprise.
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <img
                      src="https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=800"
                      alt="Personne écrivant sur une main"
                      className="relative rounded-xl shadow-2xl w-full max-w-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Three Cards Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full mb-4">
                <span className="text-white font-bold text-sm uppercase tracking-wide">
                  Méthodologie
                </span>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-3">
                LES ÉTAPES ESSENTIELLES
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Une approche structurée pour une conformité optimale
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl transform transition-transform group-hover:scale-105 duration-300"></div>
                <div className="relative bg-white rounded-2xl p-8 m-1 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-40"></div>
                      <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 rounded-full p-5">
                        <FileEdit className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-6 right-6 bg-blue-600 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                    1
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 text-center mb-3">
                    Identification
                  </h4>
                  <p className="text-gray-700 text-center leading-relaxed">
                    S'assurer que les situations de pénibilité sont repérées dans le DUERP
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl transform transition-transform group-hover:scale-105 duration-300"></div>
                <div className="relative bg-white rounded-2xl p-8 m-1 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-cyan-500 rounded-full blur-xl opacity-40"></div>
                      <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full p-5">
                        <Search className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-6 right-6 bg-cyan-600 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                    2
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 text-center mb-3">
                    Analyse
                  </h4>
                  <p className="text-gray-700 text-center leading-relaxed">
                    Ajouter les nouvelles situations repérées par l'analyse de la pénibilité
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-cyan-600 rounded-2xl transform transition-transform group-hover:scale-105 duration-300"></div>
                <div className="relative bg-white rounded-2xl p-8 m-1 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-700 rounded-full blur-xl opacity-40"></div>
                      <div className="relative bg-gradient-to-br from-blue-700 to-cyan-600 rounded-full p-5">
                        <List className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-6 right-6 bg-blue-700 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                    3
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 text-center mb-3">
                    Documentation
                  </h4>
                  <p className="text-gray-700 text-center leading-relaxed">
                    Consigner en annexe, la proportion de salariés exposés aux facteurs de pénibilité
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-10 mb-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full -mr-48 -mt-48 opacity-10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full -ml-48 -mb-48 opacity-10 blur-3xl"></div>

            <div className="relative z-10 grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="flex items-center justify-center mb-3">
                  <CheckCircle className="w-12 h-12 text-cyan-400" />
                </div>
                <div className="text-4xl font-extrabold text-white mb-2">100%</div>
                <div className="text-blue-200 font-medium">Conformité garantie</div>
              </div>
              <div>
                <div className="flex items-center justify-center mb-3">
                  <Shield className="w-12 h-12 text-cyan-400" />
                </div>
                <div className="text-4xl font-extrabold text-white mb-2">24/7</div>
                <div className="text-blue-200 font-medium">Support disponible</div>
              </div>
              <div>
                <div className="flex items-center justify-center mb-3">
                  <FileEdit className="w-12 h-12 text-cyan-400" />
                </div>
                <div className="text-4xl font-extrabold text-white mb-2">+500</div>
                <div className="text-blue-200 font-medium">Entreprises accompagnées</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-3xl blur-2xl opacity-60"></div>
            <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-3xl p-12 shadow-2xl border border-blue-100 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full mb-4">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900 mb-4">
                  Prêt à vous mettre en conformité ?
                </h3>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                  Le Cabinet FPE vous accompagne dans l'intégration des facteurs de pénibilité dans votre Document Unique. Notre expertise vous permet d'identifier, d'évaluer et de prévenir efficacement les risques professionnels liés à la pénibilité au travail.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-10 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-3"
                >
                  <FileEdit className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                  Besoin d'aide / contactez-nous
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>

                <button className="bg-white hover:bg-gray-50 text-blue-700 font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2 border-2 border-blue-200 hover:border-blue-300">
                  <CheckCircle className="w-5 h-5" />
                  En savoir plus
                </button>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Sans engagement</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Réponse sous 24h</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Expertise certifiée</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
}
