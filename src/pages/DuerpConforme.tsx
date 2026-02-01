import React, { useState } from 'react';
import { Users, AlertTriangle, FileText, FileCheck2, CheckCircle2, UserCircle2, UserCog, Phone, Shield, Award, Clock, Target, MessageCircle } from 'lucide-react';
import UnifiedHeader from '../components/UnifiedHeader';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';

const DuerpConforme: React.FC = () => {
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UnifiedHeader currentPage="duerp-conforme" />

      <section
        className="relative h-64 bg-cover bg-center flex items-center justify-center mt-32"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url("https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=1260")'
        }}
      >
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide">
            Tarifications DUERP
          </h1>
        </div>
      </section>

      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Votre DUERP conforme</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 leading-relaxed text-base">
                Le cabinet FPE ayant pour but d'accompagner les entreprises dans leurs obligations légales et droit administratifs notamment sur la prévention des risques des salariés et la mise en conformité du DUERP (Document unique d'évaluation des risques professionnels),{' '}
                <a
                  href="https://entreprendre.service-public.gouv.fr/vosdroits/F35360#:~:text=administrative%20(Premi%C3%A8re%20ministre)-,Le%20document%20unique%20d'%C3%A9valuation%20des%20risques%20professionnels%20(DUERP),peuvent%20%C3%AAtre%20expos%C3%A9s%20les%20salari%C3%A9s"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                >
                  selon l'article L4121-1 du Code du travail.
                </a>
              </p>
            </div>
          </div>

          <div className="mb-16">
            <div className="grid md:grid-cols-3 gap-8 mb-12">

              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className="bg-blue-100 rounded-full p-4">
                    <Shield className="w-12 h-12 text-blue-700" />
                  </div>
                </div>
                <h3 className="text-blue-800 font-bold text-center mb-4 text-lg">
                  CONFORMITÉ GARANTIE
                </h3>
                <p className="text-gray-700 text-center leading-relaxed text-sm">
                  Un DUERP conforme aux dernières réglementations en vigueur, validé par nos experts en prévention des risques professionnels.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className="bg-blue-100 rounded-full p-4">
                    <Clock className="w-12 h-12 text-blue-700" />
                  </div>
                </div>
                <h3 className="text-blue-800 font-bold text-center mb-4 text-lg">
                  ACCOMPAGNEMENT COMPLET
                </h3>
                <p className="text-gray-700 text-center leading-relaxed text-sm">
                  De l'évaluation des risques à l'élaboration du document, nous vous accompagnons à chaque étape de votre démarche.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className="bg-blue-100 rounded-full p-4">
                    <Award className="w-12 h-12 text-blue-700" />
                  </div>
                </div>
                <h3 className="text-blue-800 font-bold text-center mb-4 text-lg">
                  EXPERTISE RECONNUE
                </h3>
                <p className="text-gray-700 text-center leading-relaxed text-sm">
                  Bénéficiez de l'expertise de nos spécialistes certifiés en santé et sécurité au travail pour votre mise en conformité.
                </p>
              </div>
            </div>
          </div>

          <section className="mb-16">
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl shadow-2xl p-10">
                <div className="flex justify-center mb-8">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-4">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-10 tracking-wide">
                  OFFRE DUERP CONFORME
                </h3>

                <div className="space-y-6 text-white">
                  <div className="flex items-start gap-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                    <AlertTriangle className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Recensement et évaluation des risques</p>
                      <p className="text-blue-100 text-sm">Identification complète des dangers présents dans votre entreprise</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                    <FileText className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Élaboration du document unique</p>
                      <p className="text-blue-100 text-sm">Rédaction professionnelle de votre DUERP personnalisé</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                    <FileCheck2 className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Attestation de prise en charge</p>
                      <p className="text-blue-100 text-sm">Certification officielle de votre conformité réglementaire</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                    <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Rapport DUERP conforme</p>
                      <p className="text-blue-100 text-sm">Document finalisé prêt à être présenté aux autorités</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                    <UserCircle2 className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Accès à votre portail numérique</p>
                      <p className="text-blue-100 text-sm">Plateforme dédiée pour consulter et gérer vos documents 24/7</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                    <UserCog className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Service expertise en cas de contrôle</p>
                      <p className="text-blue-100 text-sm">Assistance d'un expert lors des inspections</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                    <Phone className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Suivi de vos demandes avec un conseiller</p>
                      <p className="text-blue-100 text-sm">Assistance personnalisée tout au long de votre démarche</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="bg-white rounded-xl p-8 shadow-lg mb-12">
            <div className="text-center max-w-3xl mx-auto">
              <Target className="w-16 h-16 text-blue-700 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                Besoin d'accompagnement ?
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Vous souhaitez répondre à votre obligation réglementaire mais vous ne savez pas comment vous y prendre ?
              </p>
              <p className="text-gray-700 leading-relaxed mb-8">
                Le cabinet FPE vous propose des solutions sur-mesure pour répondre à votre obligation réglementaire
              </p>
              <button
                onClick={() => setShowContactModal(true)}
                className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-4 px-10 rounded-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Besoin d'aide | Contactez-nous
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-8 shadow-md border border-blue-100">
            <div className="text-center">
              <p className="text-gray-700 leading-relaxed text-sm">
                <span className="font-bold text-blue-900">Information importante :</span> Le Cabinet FPE (Formalités des Particuliers et des Entreprises) vous accompagne dans toutes vos démarches administratives et vous fournit l'assistance nécessaire pour vous mettre en conformité, à moindre coût, via notre portail numérique sécurisé.
              </p>
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
};

export default DuerpConforme;
