import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Search, FileText, Scale, Target, UserPlus } from 'lucide-react';
import UnifiedHeader from '../components/UnifiedHeader';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';

export default function Accompagnement() {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UnifiedHeader currentPage="duerp" />

      {/* Hero Section */}
      <section
        className="relative h-64 bg-cover bg-center flex items-center justify-center mt-32"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=1260')`
        }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide">
          Accompagnement
        </h1>
      </section>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          {/* Title */}
          <h2 className="text-3xl font-bold text-blue-900 mb-12 text-center">
            Comment ça marche
          </h2>

          {/* First Row - 3 Cards */}
          <section className="mb-16">
            <div className="grid md:grid-cols-3 gap-8">

              {/* Card 1 */}
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className="bg-blue-100 rounded-full p-4">
                    <User className="w-12 h-12 text-blue-700" />
                  </div>
                </div>
                <h3 className="text-blue-800 font-bold text-center mb-4 text-lg">
                  PRÉPARER LA DÉMARCHE DU DUERP
                </h3>
                <p className="text-gray-700 text-center leading-relaxed text-sm">
                  Le chef d'entreprise recense les différentes unités de travail au sein de son entreprise avec l'aide de notre expert.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className="bg-blue-100 rounded-full p-4">
                    <Search className="w-12 h-12 text-blue-700" />
                  </div>
                </div>
                <h3 className="text-blue-800 font-bold text-center mb-4 text-lg">
                  EVALUER LES RISQUES PROFESSIONNELS
                </h3>
                <p className="text-gray-700 text-center leading-relaxed text-sm">
                  Le chef d'entreprise et l'assistant prévention des risques élaborent ensemble de manière interactive le document unique.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className="bg-blue-100 rounded-full p-4">
                    <FileText className="w-12 h-12 text-blue-700" />
                  </div>
                </div>
                <h3 className="text-blue-800 font-bold text-center mb-4 text-lg">
                  ELABORER UN PROGRAMME D'ACTIONS
                </h3>
                <p className="text-gray-700 text-center leading-relaxed text-sm">
                  Le chef d'entreprise et l'assistant prévention des risques élaborent ensemble de manière interactive le document unique.
                </p>
              </div>

            </div>
          </section>

          {/* Second Row - 3 Blue Cards */}
          <section className="mb-16">
            <div className="grid md:grid-cols-3 gap-8">

              {/* Card 4 */}
              <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 text-white">
                <div className="flex justify-center mb-6">
                  <div className="bg-white bg-opacity-20 rounded-full p-4">
                    <Scale className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-center mb-4 text-lg">
                  EVITER LES SANCTIONS JURIDIQUE
                </h3>
                <p className="text-blue-50 text-center leading-relaxed text-sm">
                  L'employeur, s'il n'inscrit pas les risques professionnels de l'entreprise dans le DUERP ou sa mise à jour s'expose à des sanctions pénales et financières
                </p>
              </div>

              {/* Card 5 */}
              <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 text-white">
                <div className="flex justify-center mb-6">
                  <div className="bg-white bg-opacity-20 rounded-full p-4">
                    <Target className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-center mb-4 text-lg">
                  RE-ÉVALUER LES RISQUES,
                  <br />
                  (suite aux actions réalisées)
                </h3>
                <p className="text-blue-50 text-center leading-relaxed text-sm">
                  Cette étape dans faire focus d'une mise à jour du D.U.E.R. et de son programme d'actions avec une rédaction du document.
                </p>
              </div>

              {/* Card 6 */}
              <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 text-white">
                <div className="flex justify-center mb-6">
                  <div className="bg-white bg-opacity-20 rounded-full p-4">
                    <UserPlus className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-center mb-4 text-lg">
                  ACCOMPAGNEMENT AVEC UN CONSEILLER
                </h3>
                <p className="text-blue-50 text-center leading-relaxed text-sm">
                  Nos conseillers sont à votre disposition pour vous accompagner dans la mise en conformité réglementaire de votre entreprise, association ou entité.
                </p>
              </div>

            </div>
          </section>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={() => setShowContactModal(true)}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Besoin d'aide / contactez-nous
            </button>
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
