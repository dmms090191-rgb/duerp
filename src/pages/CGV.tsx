import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

const CGV = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#2563eb]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 sm:mb-8 flex items-center gap-2 text-white/90 hover:text-white transition-colors font-medium bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Retour
        </button>

        <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          <div className="px-4 sm:px-8 py-8 sm:py-12 text-white border-b border-white/20">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Conditions Générales de Vente</h1>
            </div>
            <p className="text-white/80 text-sm sm:text-base lg:text-lg">
              Applicables aux prestations proposées par Cabinet FPE
            </p>
          </div>

          <div className="px-4 sm:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
            <div className="bg-white/15 backdrop-blur-sm border-l-4 border-white/40 rounded-r-lg p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg mb-2">Informations légales</h3>
                  <div className="space-y-1 text-sm sm:text-base text-white/90">
                    <p><strong>Entreprise :</strong> Monsieur David Schemmama</p>
                    <p><strong>Nom commercial :</strong> Cabinet FPE</p>
                    <p><strong>Statut juridique :</strong> Entrepreneur individuel</p>
                    <p><strong>SIREN :</strong> 917 716 250</p>
                    <p><strong>SIRET :</strong> 917 716 250 00019</p>
                    <p><strong>Numéro de TVA intracommunautaire :</strong> FR90917716250</p>
                    <p><strong>Code APE / NAF :</strong> 8299Z - Autres activités de soutien aux entreprises n.c.a.</p>
                    <p><strong>Adresse :</strong> 8 rue Étienne Richerand, 69003 Lyon - France</p>
                    <p><strong>Email de contact :</strong> administration@securiteprofessionnelle.fr</p>
                  </div>
                </div>
              </div>
            </div>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <span className="text-white/70">1.</span>
                Objet
              </h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                Les présentes CGV régissent l'ensemble des prestations de services fournies par Cabinet FPE, notamment l'accompagnement des entreprises dans leurs obligations légales et réglementaires, incluant la prise en charge et l'accompagnement DUERP.
              </p>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed mt-2 sm:mt-3">
                Toute commande, paiement ou acceptation d'une offre implique l'acceptation pleine et entière des présentes CGV.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <span className="text-white/70">2.</span>
                Description des prestations
              </h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                Les prestations consistent en un accompagnement professionnel réalisé sur la base des informations communiquées par le client.
              </p>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed mt-2 sm:mt-3 font-semibold text-white">
                Cabinet FPE est tenu à une obligation de moyens et non de résultat.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <span className="text-white/70">3.</span>
                Prix
              </h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                Les prix sont indiqués en euros et correspondent aux tarifs en vigueur au moment de la commande. Les prestations proposées sont des prestations de services.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                Paiement
              </h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-3 sm:mb-4">
                Le paiement peut être effectué selon les modalités suivantes :
              </p>

              <div className="space-y-3 sm:space-y-4">
                <div className="bg-white/15 backdrop-blur-sm border-l-4 border-white/40 rounded-r-xl p-4 sm:p-6">
                  <h3 className="font-bold text-white text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    Paiement par carte bancaire en ligne
                  </h3>
                  <p className="text-sm sm:text-base text-white/90 mb-2 sm:mb-3">
                    Via une solution de paiement sécurisée :
                  </p>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-sm sm:text-base text-white/90 ml-2 sm:ml-4">
                    <li>En une fois, ou</li>
                    <li>En plusieurs fois (2, 3 ou 4 mensualités) lorsque cette option est proposée</li>
                  </ul>
                  <div className="mt-3 sm:mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
                    <p className="text-xs sm:text-sm text-white font-semibold mb-1 sm:mb-2">Dans le cas d'un paiement fractionné :</p>
                    <ul className="text-xs sm:text-sm text-white/90 space-y-1 ml-2 sm:ml-4">
                      <li>• Le premier prélèvement est effectué immédiatement lors de la commande</li>
                      <li>• Les prélèvements suivants sont réalisés automatiquement chaque mois</li>
                      <li>• Les prélèvements s'arrêtent automatiquement à l'issue du nombre de paiements prévu</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white/15 backdrop-blur-sm border-l-4 border-white/40 rounded-r-xl p-4 sm:p-6">
                  <h3 className="font-bold text-white text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    Paiement par virement bancaire
                  </h3>
                  <p className="text-sm sm:text-base text-white/90 mb-2">
                    Le paiement par virement est accepté <strong>uniquement en une seule fois</strong>.
                  </p>
                  <p className="text-sm sm:text-base text-white/90">
                    La prestation débute après réception effective du virement sur le compte bancaire de Cabinet FPE.
                  </p>
                </div>

                <div className="bg-white/15 backdrop-blur-sm border-l-4 border-white/40 rounded-r-xl p-4 sm:p-6">
                  <h3 className="font-bold text-white text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    Paiement par chèque bancaire
                  </h3>
                  <p className="text-sm sm:text-base text-white/90 mb-2">
                    Le paiement par chèque est accepté <strong>uniquement en une seule fois</strong>.
                  </p>
                  <p className="text-sm sm:text-base text-white/90">
                    La prestation débute après encaissement effectif du chèque.
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 bg-white/20 backdrop-blur-sm border-l-4 border-white/50 rounded-r-lg p-4 sm:p-5">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0 mt-0.5" />
                  <p className="text-sm sm:text-base text-white">
                    <strong>Important :</strong> En cas de retard ou d'échec de paiement, Cabinet FPE se réserve le droit de suspendre ou retarder l'exécution de la prestation jusqu'à régularisation complète.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <span className="text-white/70">5.</span>
                Démarrage de la prestation - Absence de remboursement
              </h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-2 sm:mb-3">
                La prestation débute uniquement après validation du paiement et réception des informations nécessaires fournies par le client.
              </p>
              <div className="bg-white/20 backdrop-blur-sm border-l-4 border-white/50 rounded-r-lg p-4 sm:p-5">
                <p className="text-sm sm:text-base text-white font-semibold">
                  Toute prestation commencée ne pourra faire l'objet d'aucun remboursement, quelle que soit la méthode ou la modalité de paiement choisie (paiement comptant ou fractionné).
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <span className="text-white/70">6.</span>
                Obligations du client
              </h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-2 sm:mb-3">
                Le client s'engage à fournir des informations exactes, complètes et sincères.
              </p>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                Cabinet FPE ne pourra être tenu responsable des conséquences résultant d'informations erronées, incomplètes ou non communiquées par le client.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <span className="text-white/70">7.</span>
                Responsabilité
              </h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-2 sm:mb-3">
                La responsabilité de Cabinet FPE est limitée, tous préjudices confondus, au montant total effectivement payé par le client pour la prestation concernée.
              </p>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                Aucune responsabilité ne pourra être engagée pour des dommages indirects (pertes financières, sanctions, pertes d'exploitation, etc.).
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <span className="text-white/70">8.</span>
                Données personnelles
              </h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-2 sm:mb-3">
                Les données personnelles sont utilisées uniquement dans le cadre de la relation commerciale et de l'exécution des prestations.
              </p>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                Conformément à la réglementation en vigueur, le client peut exercer ses droits en contactant : <a href="mailto:administration@securiteprofessionnelle.fr" className="text-white hover:text-white/80 font-semibold underline break-all">administration@securiteprofessionnelle.fr</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <span className="text-white/70">9.</span>
                Droit applicable - Litiges
              </h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-2 sm:mb-3">
                Les présentes CGV sont soumises au droit français.
              </p>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. À défaut, les tribunaux compétents seront ceux du ressort du siège de l'entreprise.
              </p>
            </section>

            <section className="bg-white/20 backdrop-blur-sm rounded-xl p-6 sm:p-8 text-white border border-white/30">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                Acceptation
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed">
                Le client reconnaît avoir pris connaissance des présentes Conditions Générales de Vente et les accepter sans réserve avant toute commande.
              </p>
            </section>

            <div className="mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-white/20 text-center">
              <p className="text-white/70 text-xs sm:text-sm mb-2">
                Dernière mise à jour : Février 2026
              </p>
              <p className="text-white font-medium text-sm sm:text-base">
                Cabinet FPE - Sécurité Professionnelle
              </p>
              <p className="text-white/70 text-xs sm:text-sm">
                8 rue Étienne Richerand, 69003 Lyon - France
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGV;
