import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedHeader from '../components/UnifiedHeader';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';

export default function PriseEnChargeOPCO() {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UnifiedHeader currentPage="droits" />

      {/* Hero Section */}
      <section
        className="relative h-64 bg-cover bg-center flex items-center justify-center mt-32"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260')`
        }}
      >
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide">
            Trouvez votre OPCO
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          {/* Introduction */}
          <div className="text-center mb-12">
            <p className="text-xl text-blue-900 font-semibold leading-relaxed">
              Trouvez votre OPCO et tous les renseignements nécessaires à la bonne prise en charge et au financement de vos formations obligatoires.
            </p>
          </div>

          {/* Section Formations Obligatoires */}
          <div className="bg-white rounded-xl p-8 shadow-lg mb-12">
            <h2 className="text-center text-xl font-bold text-gray-900 mb-2">
              Quelles sont les différentes formations obligatoires en entreprise ?
            </h2>
            <h3 className="text-center text-lg font-semibold text-blue-900 mb-6">
              SANTÉ-SÉCURITÉ AU TRAVAIL
            </h3>

            <p className="text-gray-700 leading-relaxed text-center max-w-4xl mx-auto mb-12">
              Pour effectuer certaines missions, il est obligatoire qu'un salarié soit formé, que ce soit pour assurer les aspects techniques, règlementaires d'un poste de travail ou les bonnes pratiques en matière de sécurité. Dans ce cadre, il est nécessaire de distinguer la formation obligatoire et l'obligation de formation de l'employeur.
            </p>

            {/* Liste des OPCO */}
            <div className="relative">
              <div className="text-center mb-12">
                <h3 className="text-4xl font-bold text-gray-900 mb-3">
                  LA LISTE DES 11 OPCOS
                </h3>
                <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* OPCO 1 - AFDAS */}
                <a
                  href="https://www.afdas.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 p-[2px] rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="bg-white rounded-2xl p-6 h-full flex flex-col">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-xl text-gray-900 mb-3">AFDAS</h4>
                    <p className="text-sm text-gray-600 leading-relaxed flex-grow">Culture, Industries créatives, Médias, Communication, Télécommunications, Sport, Tourisme, Loisirs et Divertissement</p>
                    <div className="mt-4 flex items-center text-pink-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                      En savoir plus
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>

                {/* OPCO 2 - AKTO */}
                <a
                  href="https://www.akto.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-[2px] rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="bg-white rounded-2xl p-6 h-full flex flex-col">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-xl text-gray-900 mb-3">AKTO</h4>
                    <p className="text-sm text-gray-600 leading-relaxed flex-grow">Entreprises à forte intensité de main d'œuvre (Services à la personne, Hôtellerie-Restauration, Propreté, etc.)</p>
                    <div className="mt-4 flex items-center text-orange-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                      En savoir plus
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>

                {/* OPCO 3 - ATLAS */}
                <a
                  href="https://www.opco-atlas.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-[2px] rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="bg-white rounded-2xl p-6 h-full flex flex-col">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-xl text-gray-900 mb-3">ATLAS</h4>
                    <p className="text-sm text-gray-600 leading-relaxed flex-grow">Services financiers et Conseil</p>
                    <div className="mt-4 flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                      En savoir plus
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>

                {/* OPCO 4 - UNIFORMATION */}
                <a
                  href="https://www.uniformation.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 p-[2px] rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="bg-white rounded-2xl p-6 h-full flex flex-col">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-xl text-gray-900 mb-3">UNIFORMATION</h4>
                    <p className="text-sm text-gray-600 leading-relaxed flex-grow">Cohésion sociale (associations, coopératives, mutuelles, fondations)</p>
                    <div className="mt-4 flex items-center text-emerald-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                      En savoir plus
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>

                {/* OPCO 5 - CONSTRUCTYS */}
                <a
                  href="https://www.constructys.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-gradient-to-br from-slate-600 via-slate-500 to-gray-500 p-[2px] rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="bg-white rounded-2xl p-6 h-full flex flex-col">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-gray-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-xl text-gray-900 mb-3">CONSTRUCTYS</h4>
                    <p className="text-sm text-gray-600 leading-relaxed flex-grow">BTP et Construction</p>
                    <div className="mt-4 flex items-center text-slate-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                      En savoir plus
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>

                {/* OPCO 6 - OPCO 2i */}
                <a
                  href="https://www.opco2i.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500 p-[2px] rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="bg-white rounded-2xl p-6 h-full flex flex-col">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-xl text-gray-900 mb-3">OPCO 2i</h4>
                    <p className="text-sm text-gray-600 leading-relaxed flex-grow">Interindustries (Chimie, Pétrole, Pharmacie, Plasturgie, etc.)</p>
                    <div className="mt-4 flex items-center text-violet-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                      En savoir plus
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>

                {/* OPCO 7 - OCAPIAT */}
                <a
                  href="https://www.ocapiat.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-gradient-to-br from-lime-500 via-green-500 to-emerald-600 p-[2px] rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="bg-white rounded-2xl p-6 h-full flex flex-col">
                    <div className="w-14 h-14 bg-gradient-to-br from-lime-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-xl text-gray-900 mb-3">OCAPIAT</h4>
                    <p className="text-sm text-gray-600 leading-relaxed flex-grow">Agriculture, Pêche, Industrie agroalimentaire et Territoires</p>
                    <div className="mt-4 flex items-center text-lime-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                      En savoir plus
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>

                {/* OPCO 8 - OPCO MOBILITÉS */}
                <a
                  href="https://www.opcomobilites.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 p-[2px] rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="bg-white rounded-2xl p-6 h-full flex flex-col">
                    <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-xl text-gray-900 mb-3">OPCO MOBILITÉS</h4>
                    <p className="text-sm text-gray-600 leading-relaxed flex-grow">Transports et Services de l'automobile</p>
                    <div className="mt-4 flex items-center text-sky-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                      En savoir plus
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>

                {/* OPCO 9 - OPCO SANTÉ */}
                <a
                  href="https://www.opco-sante.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 p-[2px] rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="bg-white rounded-2xl p-6 h-full flex flex-col">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-xl text-gray-900 mb-3">OPCO SANTÉ</h4>
                    <p className="text-sm text-gray-600 leading-relaxed flex-grow">Secteur privé de la Santé</p>
                    <div className="mt-4 flex items-center text-red-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                      En savoir plus
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>

                {/* OPCO 10 - OPCOMMERCE */}
                <a
                  href="https://www.lopcommerce.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 p-[2px] rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="bg-white rounded-2xl p-6 h-full flex flex-col">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-xl text-gray-900 mb-3">OPCOMMERCE</h4>
                    <p className="text-sm text-gray-600 leading-relaxed flex-grow">Commerce</p>
                    <div className="mt-4 flex items-center text-cyan-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                      En savoir plus
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>

                {/* OPCO 11 - OPCO EP */}
                <a
                  href="https://www.opcoep.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-[2px] rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="bg-white rounded-2xl p-6 h-full flex flex-col">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-xl text-gray-900 mb-3">OPCO EP</h4>
                    <p className="text-sm text-gray-600 leading-relaxed flex-grow">Entreprises de Proximité (Artisanat, Professions libérales, etc.)</p>
                    <div className="mt-4 flex items-center text-amber-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                      En savoir plus
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl p-8 shadow-lg mb-12">
            <p className="text-gray-700 leading-relaxed text-center mb-6">
              Une formation désigne les obligations de l'employeur pour veiller au maintien et au renouvellement des compétences de ses salariés.
            </p>

            <p className="text-gray-700 leading-relaxed text-center">
              Afin d'assurer l'adaptation au poste de travail, ce dernier est tenu de mettre en place des actions de formation régulières (au moins une fois tous les 6 ans), dans le cadre d'un plan de développement des compétences.
            </p>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={() => setShowContactModal(true)}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-4 px-10 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Besoin d'aide | contactez-nous
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
