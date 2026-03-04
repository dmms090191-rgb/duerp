import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scale, Building2, Server, Copyright, Shield, Globe } from 'lucide-react';

const MentionsLegales = () => {
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
                <Scale className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Mentions Légales</h1>
            </div>
            <p className="text-white/80 text-sm sm:text-base lg:text-lg">
              Conformément aux dispositions de la loi n°2004-575 du 21 juin 2004 pour la Confiance dans l'Économie Numérique (LCEN)
            </p>
          </div>

          <div className="px-4 sm:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              Conformément aux dispositions des articles 6-III et 19 de la loi n°2004-575 du 21 juin 2004 pour la Confiance dans l'Économie Numérique (LCEN), il est précisé aux utilisateurs du site les informations suivantes :
            </p>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                Éditeur du site
              </h2>
              <div className="bg-white/15 backdrop-blur-sm border-l-4 border-white/40 rounded-r-xl p-4 sm:p-6">
                <div className="space-y-2 text-sm sm:text-base text-white/90">
                  <p><strong>Nom / Raison sociale :</strong> MONSIEUR DAVID SCHEMMAMA</p>
                  <p><strong>Statut juridique :</strong> Entrepreneur individuel</p>
                  <p><strong>SIREN :</strong> 917 716 250</p>
                  <p><strong>SIRET :</strong> 917 716 250 00019</p>
                  <p><strong>Numéro de TVA intracommunautaire :</strong> FR90917716250</p>
                  <p><strong>Adresse du siège social :</strong><br />
                    8 rue Étienne Richerand<br />
                    69003 Lyon - France
                  </p>
                  <p><strong>Adresse e-mail :</strong> <a href="mailto:administration@securiteprofessionnelle.fr" className="text-white hover:text-white/80 underline font-semibold break-all">administration@securiteprofessionnelle.fr</a></p>
                </div>
                <p className="text-sm sm:text-base text-white/90 mt-3 sm:mt-4 leading-relaxed">
                  Le site a pour objet l'accompagnement des entreprises dans leurs obligations légales, administratives et réglementaires, notamment en matière de DUERP et de conformité.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <Server className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                Hébergement du site
              </h2>
              <div className="bg-white/15 backdrop-blur-sm border-l-4 border-white/40 rounded-r-xl p-4 sm:p-6">
                <p className="text-sm sm:text-base text-white/90 mb-3 sm:mb-4 font-semibold">Le site est hébergé par :</p>
                <div className="space-y-2 text-sm sm:text-base text-white/90">
                  <p><strong>Vercel Inc.</strong></p>
                  <p>340 S Lemon Ave #4133</p>
                  <p>Walnut, CA 91789</p>
                  <p>États-Unis</p>
                  <p>Site internet : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 underline font-semibold">https://vercel.com</a></p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <Copyright className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                Propriété intellectuelle
              </h2>
              <div className="bg-white/15 backdrop-blur-sm border-l-4 border-white/40 rounded-r-xl p-4 sm:p-6">
                <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-2 sm:mb-3">
                  L'ensemble des contenus présents sur le site (textes, images, graphismes, logos, icônes, documents, logiciels, structure du site, etc.) est la propriété exclusive de <strong>MONSIEUR DAVID SCHEMMAMA</strong>, sauf mention contraire.
                </p>
                <p className="text-sm sm:text-base text-white/90 leading-relaxed font-semibold">
                  Toute reproduction, représentation, modification, publication, adaptation, totale ou partielle, de ces éléments, par quelque procédé que ce soit, est interdite sans autorisation écrite préalable.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <Scale className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                Responsabilité
              </h2>
              <div className="bg-white/15 backdrop-blur-sm border-l-4 border-white/40 rounded-r-xl p-4 sm:p-6">
                <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-2 sm:mb-3">
                  L'éditeur du site met tout en œuvre pour fournir des informations fiables et à jour. Toutefois, il ne saurait être tenu responsable des erreurs, omissions ou des résultats obtenus par l'usage de ces informations.
                </p>
                <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                  L'utilisateur reconnaît utiliser les informations disponibles sur le site sous sa responsabilité exclusive. L'éditeur ne pourra être tenu responsable de tout dommage direct ou indirect résultant de l'utilisation du site.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                Données personnelles - RGPD
              </h2>
              <div className="bg-white/15 backdrop-blur-sm border-l-4 border-white/40 rounded-r-xl p-4 sm:p-6">
                <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-2 sm:mb-3">
                  Les données personnelles collectées via le site sont utilisées uniquement dans le cadre de la gestion des demandes, des prestations et de la relation client.
                </p>
                <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-2 sm:mb-3 font-semibold">
                  Aucune donnée personnelle n'est cédée ou vendue à des tiers.
                </p>
                <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-2 sm:mb-3">
                  Conformément au Règlement Général sur la Protection des Données (RGPD - UE 2016/679), l'utilisateur dispose d'un droit d'accès, de rectification, d'effacement et d'opposition concernant ses données personnelles.
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
                  <p className="text-sm sm:text-base text-white/90 mb-2">
                    <strong>Toute demande peut être adressée par email à :</strong>
                  </p>
                  <a href="mailto:administration@securiteprofessionnelle.fr" className="text-white hover:text-white/80 font-bold text-base sm:text-lg underline break-all">
                    administration@securiteprofessionnelle.fr
                  </a>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                Droit applicable
              </h2>
              <div className="bg-white/15 backdrop-blur-sm border-l-4 border-white/40 rounded-r-xl p-4 sm:p-6">
                <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-2 sm:mb-3">
                  Les présentes mentions légales sont régies par le droit français.
                </p>
                <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                  En cas de litige, et à défaut de résolution amiable, les tribunaux compétents seront ceux du ressort de la juridiction compétente.
                </p>
              </div>
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

export default MentionsLegales;
