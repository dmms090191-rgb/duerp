import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronDown, TrendingDown, Shield, DollarSign, ArrowRight, CheckCircle, FileText, Users, Award, Target, BarChart3, Zap, Clock, TrendingUp } from 'lucide-react';
import UnifiedHeader from '../components/UnifiedHeader';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';

export default function CotisationsATMP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedFaq1, setExpandedFaq1] = useState(false);
  const [expandedFaq2, setExpandedFaq2] = useState(false);
  const [expandedFaq3, setExpandedFaq3] = useState(false);
  const [expandedFaq4, setExpandedFaq4] = useState(false);
  const [expandedFaq5, setExpandedFaq5] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - 150;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UnifiedHeader currentPage="droits" />

      {/* Hero Section - Ultra Modern */}
      <section
        className="relative min-h-[85vh] bg-cover bg-center flex items-center justify-center mt-32 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.9)), url('https://images.pexels.com/photos/6863332/pexels-photo-6863332.jpeg?auto=compress&cs=tinysrgb&w=1260')`
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-300/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 mb-8 px-8 py-3 bg-white/25 backdrop-blur-md rounded-full border-2 border-white/40 shadow-2xl hover:scale-105 transition-transform duration-300">
            <Zap className="w-5 h-5 text-yellow-300" />
            <span className="text-white font-bold text-base uppercase tracking-wider">
              Économies Garanties
            </span>
            <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 drop-shadow-2xl leading-tight">
            Réduisez vos cotisations
            <span className="block mt-2 bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300 bg-clip-text text-transparent">
              jusqu'à 25%
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/95 text-xl md:text-2xl mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
            Transformez votre politique de prévention en économies concrètes sur vos cotisations AT/MP
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300">
              <div className="text-4xl font-black text-yellow-300 mb-2">25%</div>
              <div className="text-white font-semibold">Réduction maximale</div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300">
              <div className="text-4xl font-black text-yellow-300 mb-2">100%</div>
              <div className="text-white font-semibold">Accompagnement</div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300">
              <div className="text-4xl font-black text-yellow-300 mb-2">12 mois</div>
              <div className="text-white font-semibold">Bénéfice renouvelable</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <a href="#section1" className="group bg-white hover:bg-gray-50 text-emerald-700 px-10 py-5 rounded-2xl font-bold transition-all shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 inline-flex items-center gap-3 text-lg">
              <TrendingDown className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
              Découvrir les réductions
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#section2" className="group bg-emerald-600/30 backdrop-blur-md hover:bg-emerald-600/40 text-white px-10 py-5 rounded-2xl font-bold transition-all shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 inline-flex items-center gap-3 border-2 border-white/40 text-lg">
              <Shield className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Accidents de trajet
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/80" />
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Benefits Cards - Elevated Design */}
          <div className="grid md:grid-cols-3 gap-8 -mt-28 mb-20 relative z-20">
            <div className="group bg-white rounded-3xl p-8 shadow-2xl border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-emerald-200/50 transition-all duration-500 hover:-translate-y-2">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 w-20 h-20 flex items-center justify-center">
                  <TrendingDown className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Réduction jusqu'à 25%</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Sur vos cotisations AT/MP grâce à la prévention des risques</p>
              <div className="mt-6 flex items-center text-emerald-600 font-bold group-hover:gap-2 transition-all">
                En savoir plus
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="group bg-white rounded-3xl p-8 shadow-2xl border-2 border-teal-100 hover:border-teal-300 hover:shadow-teal-200/50 transition-all duration-500 hover:-translate-y-2">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-5 w-20 h-20 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Protection renforcée</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Amélioration de la sécurité et du bien-être de vos salariés</p>
              <div className="mt-6 flex items-center text-teal-600 font-bold group-hover:gap-2 transition-all">
                En savoir plus
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="group bg-white rounded-3xl p-8 shadow-2xl border-2 border-green-100 hover:border-green-300 hover:shadow-green-200/50 transition-all duration-500 hover:-translate-y-2">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-5 w-20 h-20 flex items-center justify-center">
                  <Award className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Conformité assurée</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Respect total des obligations réglementaires</p>
              <div className="mt-6 flex items-center text-green-600 font-bold group-hover:gap-2 transition-all">
                En savoir plus
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Section 1 - Premium Design */}
          <section id="section1" className="mb-20 py-12">
            <div className="bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 rounded-3xl p-12 shadow-2xl border-2 border-emerald-100 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200/30 to-transparent rounded-full -mr-48 -mt-48 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-transparent rounded-full -ml-48 -mb-48 blur-3xl"></div>

              <div className="relative z-10">
                {/* Section Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-4 rounded-2xl shadow-xl">
                    <DollarSign className="w-10 h-10" />
                  </div>
                  <div>
                    <div className="text-emerald-600 font-bold text-sm uppercase tracking-wider mb-1">Économies substantielles</div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                      Réduire les cotisations AT/MP
                    </h2>
                  </div>
                </div>

                {/* Key Info Box */}
                <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-8 mb-10 shadow-lg border-2 border-emerald-200/50">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-emerald-100 rounded-full p-3">
                      <Target className="w-6 h-6 text-emerald-700" />
                    </div>
                    <p className="text-gray-800 leading-relaxed text-lg flex-1">
                      Les caisses régionales de l'assurance maladie – risques professionnels <span className="font-bold text-emerald-700">(Carsat, Cramif, CGSS)</span> peuvent vous accorder des réductions significatives sur vos cotisations AT/MP en fonction des mesures de prévention que vous avez mises en place.
                    </p>
                  </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-10 shadow-lg border border-emerald-100">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl mb-6 shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                    <h3 className="text-xl font-black text-white">
                      LA RÉDUCTION DE LA COTISATION AT/MP
                    </h3>
                  </div>

                  <p className="text-gray-800 leading-relaxed text-lg mb-8">
                    La cotisation accidents du travail et maladies professionnelles (AT/MP) peut être réduite sous certaines conditions, en suivant une procédure précise.
                  </p>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 mb-8 border border-emerald-200">
                    <p className="text-gray-900 leading-relaxed mb-4 font-bold text-lg flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                      Votre caisse régionale peut accorder cette réduction si :
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-emerald-100 rounded-full p-2 flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="text-gray-800 text-lg">Vous avez accompli un <span className="font-bold text-emerald-700">effort soutenu en matière de prévention</span></p>
                      </div>
                      <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-emerald-100 rounded-full p-2 flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="text-gray-800 text-lg">Vous avez pris des <span className="font-bold text-emerald-700">mesures susceptibles de diminuer la fréquence et la gravité</span> des accidents du travail et des maladies professionnelles</p>
                      </div>
                      <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-emerald-100 rounded-full p-2 flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="text-gray-800 text-lg">Vous êtes <span className="font-bold text-emerald-700">à jour de vos cotisations</span> et les avez acquittées régulièrement au cours des 12 derniers mois</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-100 via-teal-50 to-emerald-100 border-l-4 border-emerald-600 p-6 rounded-r-2xl mb-8 shadow-md">
                    <div className="flex items-start gap-3">
                      <FileText className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-1" />
                      <p className="text-gray-800 leading-relaxed text-lg">
                        Votre établissement doit connaître la base des taux fixée en application des articles <span className="font-bold text-emerald-700">D242-6-11, D242-6-9</span> ou des articles <span className="font-bold text-emerald-700">D242-6-10 et D242-6-17</span> du code de la sécurité sociale (taux mixtes et collectifs).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm bg-gray-100 p-5 rounded-xl border border-gray-200">
                    <div className="bg-emerald-600 rounded-full p-2">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-gray-700">
                      Consultez le <span className="font-bold text-gray-900">décret 2010-753 du 5 juillet 2010</span> fixant les règles de tarification des risques AT/MP (PDF).
                    </p>
                  </div>
                </div>

                {/* FAQ Section - Modern Design */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-3">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900">Questions fréquentes</h3>
                  </div>

                  {/* FAQ 1 */}
                  <div className="bg-white border-2 border-emerald-100 rounded-2xl mb-5 overflow-hidden hover:border-emerald-300 hover:shadow-xl transition-all duration-300">
                    <button
                      onClick={() => setExpandedFaq1(!expandedFaq1)}
                      className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-transparent transition-all"
                    >
                      <span className="font-bold text-gray-900 pr-4 text-lg">Comment la réduction est-elle attribuée ?</span>
                      <ChevronDown className={`w-7 h-7 text-emerald-600 transition-transform duration-300 flex-shrink-0 ${expandedFaq1 ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedFaq1 && (
                      <div className="px-8 py-6 border-t-2 border-emerald-100 bg-gradient-to-br from-emerald-50/30 to-white">
                        <p className="text-gray-700 leading-relaxed text-lg">
                          La réduction est accordée soit à l'initiative de votre caisse régionale de l'Assurance Maladie – Risques professionnels (Carsat, Cramif, CGSS), soit à votre demande si elle est appuyée par un rapport motivé du service prévention de la caisse.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* FAQ 2 */}
                  <div className="bg-white border-2 border-emerald-100 rounded-2xl mb-5 overflow-hidden hover:border-emerald-300 hover:shadow-xl transition-all duration-300">
                    <button
                      onClick={() => setExpandedFaq2(!expandedFaq2)}
                      className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-transparent transition-all"
                    >
                      <span className="font-bold text-gray-900 pr-4 text-lg">Quel niveau de réduction du taux de cotisation AT/MP ?</span>
                      <ChevronDown className={`w-7 h-7 text-emerald-600 transition-transform duration-300 flex-shrink-0 ${expandedFaq2 ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedFaq2 && (
                      <div className="px-8 py-6 border-t-2 border-emerald-100 bg-gradient-to-br from-emerald-50/30 to-white">
                        <p className="text-gray-700 leading-relaxed mb-5 text-lg">
                          Cette réduction de la cotisation AT/MP est accordée après :
                        </p>
                        <div className="space-y-3 mb-6">
                          <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm">
                            <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                            <p className="text-gray-700">Avis obligatoire du comité social et économique (CSE) ou du comité d'hygiène, de sécurité et des conditions de travail (CHSCT), ou à défaut, des délégués du personnel</p>
                          </div>
                          <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm">
                            <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                            <p className="text-gray-700">Information de la direction régionale des entreprises, de la concurrence et de la consommation, du travail et de l'emploi (Direccte)</p>
                          </div>
                          <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm">
                            <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                            <p className="text-gray-700">Avis favorable du comité technique régional (CTR) compétent</p>
                          </div>
                        </div>
                        <p className="text-gray-900 leading-relaxed mb-4 font-bold text-lg">
                          La réduction du taux de cotisation AT/MP ne peut dépasser :
                        </p>
                        <div className="space-y-3 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-200">
                          <div className="flex items-start gap-3">
                            <div className="bg-emerald-600 rounded-full p-2">
                              <TrendingDown className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-gray-800 text-lg"><span className="font-black text-emerald-700 text-2xl">25%</span> du taux de cotisation AT/MP pour les établissements soumis au taux collectif</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-emerald-600 rounded-full p-2">
                              <TrendingDown className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-gray-800 text-lg"><span className="font-black text-emerald-700 text-2xl">25%</span> sur la part du taux collectif entrant dans le calcul du taux net pour les établissements soumis au taux mixte</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FAQ 3 */}
                  <div className="bg-white border-2 border-emerald-100 rounded-2xl mb-10 overflow-hidden hover:border-emerald-300 hover:shadow-xl transition-all duration-300">
                    <button
                      onClick={() => setExpandedFaq3(!expandedFaq3)}
                      className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-transparent transition-all"
                    >
                      <span className="font-bold text-gray-900 pr-4 text-lg">Pour combien de temps la réduction est-elle attribuée ?</span>
                      <ChevronDown className={`w-7 h-7 text-emerald-600 transition-transform duration-300 flex-shrink-0 ${expandedFaq3 ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedFaq3 && (
                      <div className="px-8 py-6 border-t-2 border-emerald-100 bg-gradient-to-br from-emerald-50/30 to-white">
                        <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-md border border-emerald-200">
                          <Clock className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                          <p className="text-gray-700 leading-relaxed text-lg">
                            Le bénéfice de la réduction est établi pour <span className="font-black text-emerald-700 text-xl">un an</span> et ne peut être renouvelé sans nouvel examen du CTR. Il peut être supprimé ou suspendu à tout moment par votre caisse régionale de l'Assurance Maladie – Risques professionnels (Carsat, Cramif, CGSS) après avis conforme du CTR.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="group bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-700 text-white font-black py-6 px-12 rounded-2xl shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 inline-flex items-center gap-4 text-lg border-2 border-emerald-400"
                  >
                    <Users className="w-7 h-7 group-hover:scale-110 transition-transform" />
                    Demandez l'aide d'un conseiller
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 - Premium Design */}
          <section id="section2" className="mb-20 py-12">
            <div className="bg-gradient-to-br from-white via-teal-50/20 to-emerald-50/30 rounded-3xl p-12 shadow-2xl border-2 border-teal-100 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-200/30 to-transparent rounded-full -mr-48 -mt-48 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-200/30 to-transparent rounded-full -ml-48 -mb-48 blur-3xl"></div>

              <div className="relative z-10">
                {/* Section Header */}
                <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 rounded-2xl mb-10 shadow-2xl">
                  <Shield className="w-8 h-8 text-white" />
                  <h3 className="text-2xl font-black text-white">
                    LA RÉDUCTION DE LA MAJORATION FORFAITAIRE « ACCIDENTS DE TRAJET »
                  </h3>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-10 shadow-lg border border-teal-100">
                  <div className="flex items-start gap-4 mb-8">
                    <div className="bg-teal-100 rounded-full p-3">
                      <TrendingUp className="w-6 h-6 text-teal-700" />
                    </div>
                    <p className="text-gray-800 leading-relaxed text-lg flex-1">
                      La majoration forfaitaire « accidents de trajet » peut être réduite sous certaines conditions.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 mb-8 border border-teal-200">
                    <p className="text-gray-900 leading-relaxed mb-4 font-bold text-lg flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-teal-600" />
                      Votre établissement peut bénéficier de cette réduction si :
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-teal-100 rounded-full p-2 flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-teal-600" />
                        </div>
                        <p className="text-gray-800 text-lg">Vous avez pris des <span className="font-bold text-teal-700">mesures de prévention</span> susceptibles de diminuer la fréquence et la gravité des accidents de trajet et de mission pour vos salariés</p>
                      </div>
                      <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-teal-100 rounded-full p-2 flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-teal-600" />
                        </div>
                        <p className="text-gray-800 text-lg">Vous avez une <span className="font-bold text-teal-700">politique de prévention</span> active</p>
                      </div>
                      <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-teal-100 rounded-full p-2 flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-teal-600" />
                        </div>
                        <p className="text-gray-800 text-lg">Vous développez un <span className="font-bold text-teal-700">projet de prévention</span> dans une démarche d'amélioration continue</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-teal-100 via-emerald-50 to-teal-100 border-l-4 border-teal-600 p-8 rounded-r-2xl mb-10 shadow-md">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-teal-600 rounded-xl p-3">
                        <Shield className="w-7 h-7 text-white" />
                      </div>
                      <h4 className="text-2xl font-black text-gray-900 pt-2">
                        La politique de prévention est prise en compte de manière globale
                      </h4>
                    </div>
                    <p className="text-gray-800 leading-relaxed text-lg pl-16">
                      La situation de votre entreprise en matière de prévention globale des risques professionnels est prise en compte pour l'attribution de cette réduction de la cotisation AT/MP. Une entreprise qui a fait des efforts de prévention des risques professionnels en matière d'accident de travail, mais a négligé la prévention des risques d'accident de travail en/ou des maladies professionnelles ne peut pas en bénéficier.
                    </p>
                  </div>

                  {/* FAQ Section */}
                  <div className="mb-10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl p-3">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-3xl font-black text-gray-900">Questions fréquentes</h3>
                    </div>

                    {/* FAQ 4 */}
                    <div className="bg-white border-2 border-teal-100 rounded-2xl mb-5 overflow-hidden hover:border-teal-300 hover:shadow-xl transition-all duration-300">
                      <button
                        onClick={() => setExpandedFaq4(!expandedFaq4)}
                        className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-transparent transition-all"
                      >
                        <span className="font-bold text-gray-900 pr-4 text-lg">Comment la réduction est-elle attribuée ?</span>
                        <ChevronDown className={`w-7 h-7 text-teal-600 transition-transform duration-300 flex-shrink-0 ${expandedFaq4 ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedFaq4 && (
                        <div className="px-8 py-6 border-t-2 border-teal-100 bg-gradient-to-br from-teal-50/30 to-white">
                          <p className="text-gray-700 leading-relaxed mb-5 text-lg">
                            La réduction de la cotisation AT/MP est accordée à l'initiative de votre caisse (Carsat, Cramif, CGSS) sur un rapport motivé de son service de prévention, après :
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm">
                              <CheckCircle className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                              <p className="text-gray-700">Avis obligatoire du comité social et économique (CSE), du comité d'hygiène, de sécurité et des conditions de travail (CHSCT), ou, à défaut, des délégués du personnel</p>
                            </div>
                            <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm">
                              <CheckCircle className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                              <p className="text-gray-700">Information de la direction régionale des entreprises, de la concurrence et de la consommation, du travail et de l'emploi (Direccte)</p>
                            </div>
                            <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm">
                              <CheckCircle className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                              <p className="text-gray-700">Avis favorable du comité technique régional (CTR)</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* FAQ 5 */}
                    <div className="bg-white border-2 border-teal-100 rounded-2xl mb-10 overflow-hidden hover:border-teal-300 hover:shadow-xl transition-all duration-300">
                      <button
                        onClick={() => setExpandedFaq5(!expandedFaq5)}
                        className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-transparent transition-all"
                      >
                        <span className="font-bold text-gray-900 pr-4 text-lg">À combien s'élève la réduction ?</span>
                        <ChevronDown className={`w-7 h-7 text-teal-600 transition-transform duration-300 flex-shrink-0 ${expandedFaq5 ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedFaq5 && (
                        <div className="px-8 py-6 border-t-2 border-teal-100 bg-gradient-to-br from-teal-50/30 to-white">
                          <p className="text-gray-900 leading-relaxed mb-5 font-bold text-lg">
                            La réduction de la cotisation AT/MP est accordée sous forme d'une diminution du taux net de la cotisation et ne peut être :
                          </p>
                          <div className="space-y-4 bg-gradient-to-br from-teal-50 to-emerald-50 p-6 rounded-xl border-2 border-teal-200">
                            <div className="flex items-start gap-3">
                              <div className="bg-teal-600 rounded-full p-2">
                                <TrendingDown className="w-6 h-6 text-white" />
                              </div>
                              <p className="text-gray-800 text-lg">Inférieure à <span className="font-black text-teal-700 text-2xl">25%</span> de la majoration forfaitaire « accident de trajet »</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="bg-teal-600 rounded-full p-2">
                                <TrendingUp className="w-6 h-6 text-white" />
                              </div>
                              <p className="text-gray-800 text-lg">Supérieure à <span className="font-black text-teal-700 text-2xl">87,7%</span> de la majoration forfaitaire « accident de trajet »</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="group bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 hover:from-teal-700 hover:via-emerald-700 hover:to-teal-700 text-white font-black py-6 px-12 rounded-2xl shadow-2xl hover:shadow-teal-500/50 hover:scale-105 transition-all duration-300 inline-flex items-center gap-4 text-lg border-2 border-teal-400"
                    >
                      <Users className="w-7 h-7 group-hover:scale-110 transition-transform" />
                      Besoin d'aide | contactez-nous
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

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
