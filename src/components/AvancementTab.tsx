import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, AlertTriangle, AlertCircle, XCircle, Wrench, Calendar, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCategoriesForSector } from '../data/sectorQuestions';
import PdfPreviewModal from './PdfPreviewModal';

interface AvancementTabProps {
  clientId: string;
  typeDiagnostic: string;
}

interface CategoryStats {
  totalQuestions: number;
  answered: number;
  pasDeRisque: number;
  avecMesures: number;
  prioritaire: number;
  nonApplicable: number;
  percentage: number;
}

interface CompartmentProgress {
  id: string;
  label: string;
  stats: CategoryStats;
}

const AvancementTab: React.FC<AvancementTabProps> = ({ clientId, typeDiagnostic }) => {
  const duerpCategories = getCategoriesForSector(typeDiagnostic);
  const [compartments, setCompartments] = useState<CompartmentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  useEffect(() => {
    loadProgressData();

    const subscription = supabase
      .channel('duerp_avancement_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'duerp_evaluation_responses',
        filter: `client_id=eq.${clientId}`
      }, () => {
        loadProgressData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [clientId, typeDiagnostic]);

  const loadProgressData = async () => {
    if (!typeDiagnostic) {
      setLoading(false);
      return;
    }

    try {
      const { data: responses, error } = await supabase
        .from('duerp_evaluation_responses')
        .select('category, question_id, risk_status, selected_measures')
        .eq('client_id', clientId)
        .eq('type_diagnostic', typeDiagnostic);

      if (error) throw error;

      const { data: firstResponse } = await supabase
        .from('duerp_evaluation_responses')
        .select('created_at')
        .eq('client_id', clientId)
        .eq('type_diagnostic', typeDiagnostic)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (firstResponse?.created_at) {
        setStartDate(new Date(firstResponse.created_at).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }));
      } else {
        setStartDate(null);
      }

      const compartmentData: CompartmentProgress[] = duerpCategories.map((category) => {
        const totalQuestions = category.questions.length;
        const categoryResponses = (responses || []).filter(r => r.category === category.id);

        const uniqueQuestions = new Set(categoryResponses.map(r => r.question_id));
        const answered = uniqueQuestions.size;

        let pasDeRisque = 0;
        let avecMesures = 0;
        let prioritaire = 0;
        let nonApplicable = 0;

        categoryResponses.forEach(r => {
          if (r.risk_status === 'non_applicable') {
            nonApplicable++;
          } else if (r.risk_status === 'non_maitrise') {
            prioritaire++;
          } else if (r.risk_status === 'maitrise') {
            const hasMeasures = r.selected_measures && Array.isArray(r.selected_measures) && r.selected_measures.length > 0;
            if (hasMeasures) {
              avecMesures++;
            } else {
              pasDeRisque++;
            }
          }
        });

        return {
          id: category.id,
          label: category.label,
          stats: {
            totalQuestions,
            answered,
            pasDeRisque,
            avecMesures,
            prioritaire,
            nonApplicable,
            percentage: totalQuestions > 0 ? Math.round((answered / totalQuestions) * 100) : 0
          }
        };
      });

      setCompartments(compartmentData);
    } catch (error) {
      console.error('Erreur chargement avancement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!typeDiagnostic) {
    return (
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl sm:rounded-3xl shadow-2xl max-w-6xl mx-auto overflow-hidden border border-cyan-500/30 backdrop-blur-2xl">
        <div className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun diagnostic en cours</h3>
          <p className="text-white/80">Veuillez d'abord choisir un secteur dans l'onglet "Diagnostic Final"</p>
        </div>
      </div>
    );
  }

  const totalAnswered = compartments.reduce((s, c) => s + c.stats.answered, 0);
  const totalQuestions = compartments.reduce((s, c) => s + c.stats.totalQuestions, 0);
  const globalPercentage = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  return (
    <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-[calc(100vh-12rem)] rounded-2xl sm:rounded-3xl shadow-2xl max-w-7xl mx-auto overflow-hidden border border-cyan-500/30 backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ff_1px,transparent_1px),linear-gradient(to_bottom,#0ff_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.02]"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10">
        <div className="relative px-6 py-8 overflow-hidden border-b border-cyan-500/30">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setShowPdfPreview(true)}
              className="group relative flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-cyan-600/90 to-blue-600/90 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl transition-all duration-300 font-bold text-sm shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 border border-cyan-400/40 hover:border-cyan-300/60 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 rounded-xl"></div>
              <Eye className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Voir le PDF en cours</span>
            </button>
          </div>
          <div className="text-center">
            <div className="inline-block mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              <h1 className="relative text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent px-8 py-4">
                Suivi de l'avancement
              </h1>
            </div>
            <p className="text-cyan-200/80 leading-relaxed text-lg max-w-3xl mx-auto mb-6">
              Comment suivez-vous l'avancement des actions mises en place ?
            </p>
            <div className="inline-flex items-center gap-3 bg-slate-950/60 rounded-xl px-6 py-3 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <span className="text-cyan-300/80 text-sm font-medium">Progression globale</span>
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{globalPercentage}%</span>
              <span className="text-cyan-300/60 text-sm">({totalAnswered} / {totalQuestions})</span>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8">
          <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
            <div className="p-5 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-cyan-500/30 rounded-xl blur-lg"></div>
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50 shadow-lg shadow-cyan-500/50">
                      <Wrench className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-cyan-400 text-[10px] sm:text-xs tracking-wider mb-1">OUTIL UTILISE</div>
                    <div className="text-lg sm:text-xl lg:text-2xl font-black text-white leading-tight break-words">
                      {typeDiagnostic.replace(/^\d+\s*/, '')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-emerald-500/30 rounded-xl blur-lg"></div>
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center border border-emerald-400/50 shadow-lg shadow-emerald-500/50">
                      <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-emerald-400 text-[10px] sm:text-xs tracking-wider mb-1">COMMENCE LE</div>
                    <div className="text-lg sm:text-xl lg:text-2xl font-black text-white leading-tight">
                      {startDate || 'Pas encore commence'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-10 space-y-8 overflow-y-auto max-h-[calc(100vh-22rem)]">
          {compartments.map((compartment, index) => {
            const { stats } = compartment;
            const total = stats.pasDeRisque + stats.avecMesures + stats.prioritaire + stats.nonApplicable;

            return (
              <div
                key={compartment.id}
                className="relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-[1.02] hover:border-cyan-400/50">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>

                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="relative flex-shrink-0">
                          <div className="absolute inset-0 bg-cyan-500/30 rounded-xl blur-lg"></div>
                          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50 shadow-lg shadow-cyan-500/50">
                            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-xl lg:text-2xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text break-words">
                            {compartment.label}
                          </h3>
                          <p className="text-xs sm:text-sm text-cyan-300/70 font-medium mt-1">
                            Compartiment #{index + 1}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                          {stats.percentage}%
                        </div>
                        <p className="text-xs text-cyan-300/70 font-medium mt-1 whitespace-nowrap">
                          {stats.answered} / {stats.totalQuestions}
                        </p>
                      </div>
                    </div>

                    <div className="relative mb-6">
                      <div className="h-16 sm:h-20 bg-slate-950/60 rounded-xl overflow-hidden flex items-center shadow-inner border border-slate-700/50">
                        {stats.pasDeRisque > 0 && (
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center text-white font-black text-sm sm:text-base transition-all duration-700 hover:from-emerald-400 hover:to-green-400 relative group/bar shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                            style={{ width: `${(stats.pasDeRisque / stats.totalQuestions) * 100}%` }}
                            title="Pas de risque"
                          >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                            <span className="relative z-10 drop-shadow-lg">{stats.pasDeRisque}</span>
                          </div>
                        )}
                        {stats.avecMesures > 0 && (
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-black text-sm sm:text-base transition-all duration-700 hover:from-amber-400 hover:to-orange-400 relative group/bar shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                            style={{ width: `${(stats.avecMesures / stats.totalQuestions) * 100}%` }}
                            title="Risque avec mesure(s)"
                          >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                            <span className="relative z-10 drop-shadow-lg">{stats.avecMesures}</span>
                          </div>
                        )}
                        {stats.prioritaire > 0 && (
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center text-white font-black text-sm sm:text-base transition-all duration-700 hover:from-red-400 hover:to-rose-500 relative group/bar shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                            style={{ width: `${(stats.prioritaire / stats.totalQuestions) * 100}%` }}
                            title="Risque hautement prioritaire"
                          >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                            <span className="relative z-10 drop-shadow-lg">{stats.prioritaire}</span>
                          </div>
                        )}
                        {stats.nonApplicable > 0 && (
                          <div
                            className="h-full bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center text-white font-black text-sm sm:text-base transition-all duration-700 relative group/bar shadow-[0_0_20px_rgba(71,85,105,0.3)]"
                            style={{ width: `${(stats.nonApplicable / stats.totalQuestions) * 100}%` }}
                            title="Non applicable"
                          >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                            <span className="relative z-10 drop-shadow-lg">{stats.nonApplicable}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="relative group/card overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 p-3 sm:p-4 hover:border-emerald-400/50 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/50 flex-shrink-0">
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-emerald-400 text-[10px] sm:text-xs mb-0.5 sm:mb-1 leading-tight">PAS DE RISQUE</div>
                            <div className="text-xl sm:text-2xl font-black text-white">{stats.pasDeRisque}</div>
                          </div>
                        </div>
                      </div>

                      <div className="relative group/card overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-3 sm:p-4 hover:border-amber-400/50 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/50 flex-shrink-0">
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-amber-400 text-[10px] sm:text-xs mb-0.5 sm:mb-1 leading-tight">AVEC MESURES</div>
                            <div className="text-xl sm:text-2xl font-black text-white">{stats.avecMesures}</div>
                          </div>
                        </div>
                      </div>

                      <div className="relative group/card overflow-hidden rounded-xl bg-gradient-to-br from-red-500/10 to-rose-600/10 border border-red-500/30 p-3 sm:p-4 hover:border-red-400/50 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/50 flex-shrink-0">
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-red-400 text-[10px] sm:text-xs mb-0.5 sm:mb-1 leading-tight">PRIORITAIRE</div>
                            <div className="text-xl sm:text-2xl font-black text-white">{stats.prioritaire}</div>
                          </div>
                        </div>
                      </div>

                      <div className="relative group/card overflow-hidden rounded-xl bg-gradient-to-br from-slate-600/10 to-slate-700/10 border border-slate-600/30 p-3 sm:p-4 hover:border-slate-500/50 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-600/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-600/50 flex-shrink-0">
                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-slate-400 text-[10px] sm:text-xs mb-0.5 sm:mb-1 leading-tight">NON APPLICABLE</div>
                            <div className="text-xl sm:text-2xl font-black text-white">{stats.nonApplicable}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PdfPreviewModal
        isOpen={showPdfPreview}
        onClose={() => setShowPdfPreview(false)}
        clientId={clientId}
        typeDiagnostic={typeDiagnostic}
      />
    </div>
  );
};

export default AvancementTab;
