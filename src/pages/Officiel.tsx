import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ExternalLink } from 'lucide-react';
import UnifiedHeader from '../components/UnifiedHeader';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';

export default function Officiel() {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UnifiedHeader currentPage="officiel" />

      {/* Hero Section */}
      <section
        className="relative h-64 bg-cover bg-center flex items-center justify-center mt-32"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('https://images.pexels.com/photos/48148/document-agreement-documents-sign-48148.jpeg?auto=compress&cs=tinysrgb&w=1260')`
        }}
      >
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide">
            Officiel
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          {/* Introduction */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-8">
              Documentation officielle et liens utiles
            </h2>

            <div className="bg-white rounded-xl p-8 shadow-lg mb-8 text-left">
              <p className="text-gray-700 leading-relaxed mb-6">
                Depuis la réforme du Code du travail (loi n° 2021-1018), l'obligation de mise à jour et de transmission numérique du DUERP a été renforcée. Le Document Unique d'Évaluation des Risques Professionnels est désormais obligatoire pour toutes les entreprises dès l'embauche du premier salarié et doit être à jour, afin d'être présenté aux organismes suivants :
              </p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-1">•</span>
                  <span className="text-gray-700">L'inspection du travail (en cas de contrôle)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-1">•</span>
                  <span className="text-gray-700">La médecine du travail (en cas d'accident de travail)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-1">•</span>
                  <span className="text-gray-700">Le conseil de prud'hommes (en cas de litige entre le salarié et son employeur)</span>
                </li>
              </ul>

              <p className="text-gray-700 leading-relaxed">
                <span className="font-bold text-gray-900">Information importante :</span> En cas de non-déclaration ou de mise à jour du Document Unique d'Évaluation des Risques Professionnels DUERP, l'employeur s'expose à des sanctions pénales et financières pouvant aller jusqu'à 15 000 € en cas de récidive, conformément à l'article L4121-1 du Code du travail.
              </p>
            </div>
          </div>

          {/* Official Links */}
          <div className="space-y-6 mb-12">

            {/* Link 1 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-blue-900 uppercase">
                    Service Public – Déclaration et Évaluation des Risques
                  </h3>
                </div>
              </div>
              <a
                href="https://entreprendre.service-public.fr/vosdroits/F32360"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2 text-sm"
              >
                https://entreprendre.service-public.fr/vosdroits/F32360
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Link 2 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-blue-900 uppercase">
                    Légifrance – Code du Travail (Partie Réglementaire)
                  </h3>
                </div>
              </div>
              <a
                href="https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006072050/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2 text-sm"
              >
                https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006072050/
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Link 3 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-blue-900 uppercase">
                    Code du Travail – Articles L. 4121-1 et Suivants
                  </h3>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ces articles imposent à l'employeur d'évaluer les risques professionnels et de consigner les résultats dans un document unique, qu'il doit tenir à jour et mettre à disposition des salariés et anciens salariés.
              </p>
            </div>

            {/* Link 4 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-blue-900 uppercase">
                    Code du Travail – Articles R. 4121-1 à R. 4121-4
                  </h3>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ces articles détaillent les modalités d'élaboration, de mise à jour et de conservation du DUERP ainsi que les personnes et instances ayant droit d'accès au document.
              </p>
            </div>

            {/* Link 5 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-blue-900 uppercase">
                    Décret n° 2022-395 du 18 mars 2022
                  </h3>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ce décret précise les modalités de mise à jour du DUERP, notamment en cas de modification importante des conditions de travail ou d'apparition de nouveaux risques.
              </p>
            </div>

          </div>

          <div className="border-t border-gray-300 mb-12"></div>

          {/* CTA Section */}
          <div className="text-center mb-8">
            <button
              onClick={() => setShowContactModal(true)}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-4 px-10 rounded-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Comment élaborer mon DUERP
            </button>
          </div>

          {/* Bottom Info */}
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <p className="text-gray-700 leading-relaxed">
              Le Cabinet FPE (Formalités des Particuliers et des Entreprises) a procédé lui-même à toutes ces dispositions en accès numérique afin de vous accompagner et de vous fournir l'assistance nécessaire pour vous mettre en conformité, à moindre coût, sur le portail numérique, et ainsi attester votre attestation de conformité à présenter lors des contrôles.
            </p>
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
