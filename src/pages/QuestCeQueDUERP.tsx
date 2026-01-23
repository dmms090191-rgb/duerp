import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, FileText, Users, CheckCircle, Clock } from 'lucide-react';
import UnifiedHeader from '../components/UnifiedHeader';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';

export default function QuestCeQueDUERP() {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UnifiedHeader currentPage="duerp" />

      {/* Hero Section */}
      <section
        className="relative h-64 bg-cover bg-center flex items-center justify-center mt-32"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=1260')`
        }}
      >
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide">
            DUERP : QU'EST-CE QUE C'EST ?
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          {/* Section 1: Comment ça marche */}
          <section className="mb-12">
            <div className="bg-white rounded-xl p-8 md:p-10 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-bold text-blue-900">
                  LE DUERP : COMMENT ÇA MARCHE ?
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    La prévention des risques professionnels au sein de votre entreprise est un enjeu important car tout employeur a une obligation de résultat en matière de sécurité de ses salariés. Sa responsabilité peut donc être engagée.
                  </p>
                  <p>
                    L'employeur doit, pour diminuer ces risques de contentieux, informer ses salariés des risques professionnels pour leur permettre d'assurer leur propre sécurité et leur santé.
                  </p>
                  <p>
                    Cette information doit être réalisée par la mise à disposition de vos salariés, du document unique d'évaluation des risques professionnels (DUERP).
                  </p>
                </div>

                <div className="flex justify-center h-full">
                  <img
                    src="https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=1260"
                    alt="Ingénieurs civils et ouvriers du bâtiment travaillant ensemble sur un chantier"
                    className="rounded-lg shadow-md w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Obligatoire depuis quand */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl p-8 md:p-12 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Clock className="w-8 h-8 text-yellow-400" />
                <h2 className="text-3xl font-bold text-center">
                  LE DUERP EST OBLIGATOIRE DEPUIS QUAND ?
                </h2>
              </div>

              <div className="space-y-4 text-blue-50 leading-relaxed">
                <p>
                  Depuis un décret du 05 novembre 2001, ce document unique d'évaluation des risques professionnels est obligatoire dans toutes les entreprises, peu importe leur nombre de salariés. A défaut de l'avoir réalisé, vous vous exposez, en cas de contrôle de l'inspection du travail ou de la médecine du travail, à une amende.
                </p>
                <p>
                  A titre de rappel, la mise à jour de ce document unique doit être effectuée régulièrement ainsi que lors de toute décision d'aménagement important modifiant les conditions d'hygiène et de sécurité ou les conditions de travail, ou lorsqu'une information supplémentaire concernant l'évaluation d'un risque dans une unité de travail est recueillie.
                </p>

                <div className="bg-blue-800/50 rounded-lg p-4 mt-6 border-l-4 border-yellow-400">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <p className="font-semibold text-white">
                      En cas d'accident du travail, l'absence du Document Unique peut entraîner des sanctions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Que doit contenir le DUERP */}
          <section className="mb-12">
            <div className="bg-white rounded-xl p-8 md:p-10 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-bold text-blue-900">
                  QUE DOIT CONTENIR LE DUERP ?
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="flex justify-center order-2 md:order-1 h-full">
                  <img
                    src="https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1260"
                    alt="Document unique d'évaluation des risques professionnels"
                    className="rounded-lg shadow-md w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-4 text-gray-700 leading-relaxed order-1 md:order-2">
                  <p>
                    Ce document doit permettre d'identifier et de classer par niveau de gravité les risques auxquels sont soumis vos salariés, ceci en vue de mettre en place les actions de prévention adéquates.
                  </p>
                  <p className="font-semibold text-gray-800">
                    On doit donc y trouver, défini par type de poste de travail :
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start bg-blue-50 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span>l'identification des dangers, c'est-à-dire des causes capables de provoquer un dommage au salarié (lésion ou atteinte à la santé);</span>
                    </li>
                    <li className="flex items-start bg-blue-50 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span>l'évaluation des risques, autrement dit, en estimer la gravité et la probabilité d'apparition. Cela vous permet d'envisager les niveaux de priorité ;</span>
                    </li>
                    <li className="flex items-start bg-blue-50 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span>la détermination des mesures de prévention, existantes et à venir envisagées.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Qui peut consulter */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl p-8 md:p-12 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Users className="w-8 h-8 text-yellow-400" />
                <h2 className="text-3xl font-bold text-center">
                  QUI PEUT CONSULTER LE DUERP ?
                </h2>
              </div>

              <div className="space-y-4 text-blue-50 leading-relaxed">
                <p className="text-lg">
                  Au même titre que le registre unique du personnel, il doit être à disposition :
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start bg-blue-800/50 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span>des représentants du personnel, ou, à défaut, des salariés soumis à un risque</span>
                  </li>
                  <li className="flex items-start bg-blue-800/50 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span>de l'inspection du Travail</span>
                  </li>
                  <li className="flex items-start bg-blue-800/50 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span>de la médecine du travail</span>
                  </li>
                  <li className="flex items-start bg-blue-800/50 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span>des organismes de sécurité sociale</span>
                  </li>
                </ul>

                <div className="bg-blue-800/50 rounded-lg p-4 mt-6 border-l-4 border-yellow-400">
                  <p className="font-semibold text-white mb-2">
                    La réalisation du document unique est de votre responsabilité.
                  </p>
                  <p>
                    Si vous êtes employeur, vous avez l'obligation de tenir à jour un ensemble de documents réglementaires.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-gray-300 mb-12"></div>

          {/* CTA Button */}
          <div className="text-center mb-8">
            <button
              onClick={() => setShowContactModal(true)}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-4 px-10 rounded-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              <Shield className="w-5 h-5" />
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
