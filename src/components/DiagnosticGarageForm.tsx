import React, { useState, useEffect } from 'react';
import { ChevronRight, Home, Users, ClipboardCheck, FileText, TrendingUp, LogOut, Check, Printer, Download, Shield, CheckCircle2, Lightbulb, Target, BookOpen, Plus, ChevronUp, ChevronDown, AlertTriangle, X, HelpCircle, Menu } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { duerpCategories, DuerpQuestion, DuerpMeasure } from '../data/duerpQuestions';

interface DiagnosticGarageFormProps {
  clientId: string;
  typeDiagnostic: string;
}

interface DiagnosticSection {
  id: string;
  label: string;
  icon: React.ElementType;
  questions: DiagnosticQuestion[];
}

interface DiagnosticQuestion {
  id: string;
  text: string;
  description: string;
}

const diagnosticSections: DiagnosticSection[] = [
  {
    id: 'resume',
    label: 'Résumé',
    icon: BookOpen,
    questions: [
      {
        id: 'resume_1',
        text: 'Résumé du diagnostic',
        description: 'Présentez un résumé global de votre diagnostic.'
      }
    ]
  },
  {
    id: 'preparation',
    label: 'Préparation',
    icon: Home,
    questions: [
      {
        id: 'prep_1',
        text: 'Organisation générale',
        description: 'Décrivez l\'organisation générale de votre garage automobile.'
      }
    ]
  },
  {
    id: 'impliquer',
    label: 'Impliquer',
    icon: Users,
    questions: [
      {
        id: 'impl_1',
        text: 'Implication des salariés',
        description: 'L\'une des clés d\'un bon leadership en matière de Sécurité et santé au travail est d\'impliquer les travailleurs. Les employeurs ont l\'obligation légale de consulter les travailleurs sur les questions de sécurité et de santé. Mais il y a des avantages à aller au-delà des exigences minimales. La gestion de la SST aura plus de chances de réussir si elle encourage la participation active des travailleurs et instaure un dialogue entre les travailleurs et la direction.\n\nLes employeurs ont l\'obligation juridique de consulter les salariés sur les questions de SST. Il existe toutefois des avantages à ne pas se limiter aux exigences minimales. La gestion de la SST aura davantage de chances de réussir si elle encourage la participation active des travailleurs et qu\'elle établit un dialogue entre les salariés et la direction.\n\nDécidez de la meilleure manière d\'associer votre personnel ! Vous pouvez par exemple organiser une réunion ou un groupe de réflexion avec les travailleurs et passer en revue les différents modules de l\'évaluation des risques. Vous pouvez également télécharger ou imprimer le contenu de l\'outil ou des parties de l\'outil et le partager pour information et retour d\'information avec vos travailleurs.\n\nDécidez de la meilleure manière d\'associer votre personnel ! Vous pouvez par exemple organiser une réunion ou un groupe de réflexion avec les travailleurs et passer en revue les différents modules de l\'évaluation des risques.\nVous pouvez également télécharger ou imprimer le contenu de l\'outil ou des parties de l\'outil et le partager pour information et retour d\'information avec vos travailleurs.'
      }
    ]
  },
  {
    id: 'evaluation',
    label: 'Evaluation',
    icon: ClipboardCheck,
    questions: [
      {
        id: 'eval_1',
        text: 'Évaluation des risques',
        description: 'Comment évaluez-vous les risques dans votre garage automobile ?'
      }
    ]
  },
  {
    id: 'rapport',
    label: 'Rapport',
    icon: FileText,
    questions: [
      {
        id: 'rapp_1',
        text: 'Rapport de diagnostic',
        description: 'Décrivez les éléments clés de votre rapport de diagnostic.'
      }
    ]
  },
  {
    id: 'avancement',
    label: 'Avancement',
    icon: TrendingUp,
    questions: [
      {
        id: 'avanc_1',
        text: 'Suivi de l\'avancement',
        description: 'Comment suivez-vous l\'avancement des actions mises en place ?'
      }
    ]
  },
  {
    id: 'sortir',
    label: 'Sortir',
    icon: LogOut,
    questions: [
      {
        id: 'sort_1',
        text: 'Finalisation',
        description: 'Confirmez la finalisation de votre diagnostic.'
      }
    ]
  }
];

interface CustomMeasure {
  id: string;
  description: string;
  expertise: string;
  responsible: string;
  budget: string;
  startDate: string;
  endDate: string;
}

interface ActionPlanMeasure {
  id: string;
  text: string;
  description: string;
  responsible: string;
  budget: string;
  startDate: string;
  endDate: string;
}

interface DuerpResponse {
  selectedMeasures: string[];
  customMeasures: CustomMeasure[];
  riskStatus: 'maitrise' | 'non_maitrise' | 'non_applicable' | null;
  actionPlanMeasures: ActionPlanMeasure[];
  riskPriority: 'faible' | 'moyenne' | 'elevee' | null;
  remarks: string;
}

const DiagnosticGarageForm: React.FC<DiagnosticGarageFormProps> = ({ clientId, typeDiagnostic }) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [selectedDuerpCategory, setSelectedDuerpCategory] = useState(0);
  const [selectedDuerpQuestion, setSelectedDuerpQuestion] = useState(0);
  const [duerpResponses, setDuerpResponses] = useState<Record<string, DuerpResponse>>({});
  const [customMeasures, setCustomMeasures] = useState<CustomMeasure[]>([]);
  const [editingMeasureId, setEditingMeasureId] = useState<string | null>(null);
  const [isMeasuresSectionExpanded, setIsMeasuresSectionExpanded] = useState(true);
  const [isInformationExpanded, setIsInformationExpanded] = useState(true);
  const [isRemarquesExpanded, setIsRemarquesExpanded] = useState(true);
  const [showStandardMeasuresModal, setShowStandardMeasuresModal] = useState(false);
  const [showCustomMeasureModal, setShowCustomMeasureModal] = useState(false);
  const [viewMode, setViewMode] = useState<'question' | 'category'>('question');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentSection = diagnosticSections[currentSectionIndex];
  const currentQuestion = currentSection.questions[currentQuestionIndex];
  const totalSections = diagnosticSections.length;
  const totalQuestionsInSection = currentSection.questions.length;

  useEffect(() => {
    loadResponses();
    loadDuerpResponses();
  }, [clientId]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('diagnostic_responses')
        .select('*')
        .eq('client_id', clientId)
        .eq('type_diagnostic', typeDiagnostic);

      if (error) throw error;

      if (data) {
        const responsesMap: Record<string, string> = {};
        data.forEach(item => {
          responsesMap[item.question_id] = item.response || '';
        });
        setResponses(responsesMap);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réponses:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveResponse = async (questionId: string, response: string) => {
    try {
      setSaving(true);

      const { data: existing } = await supabase
        .from('diagnostic_responses')
        .select('id')
        .eq('client_id', clientId)
        .eq('question_id', questionId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('diagnostic_responses')
          .update({
            response,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('diagnostic_responses')
          .insert({
            client_id: parseInt(clientId),
            type_diagnostic: typeDiagnostic,
            section: currentSection.id,
            question_id: questionId,
            question_text: currentQuestion.text,
            response
          });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleResponseChange = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleSaveSession = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);

      if (currentQuestion.id === 'eval_1') {
        if (viewMode !== 'category') {
          const currentCategory = duerpCategories[selectedDuerpCategory];
          const currentDuerpQuestion = currentCategory.questions[selectedDuerpQuestion];
          await saveDuerpResponse(currentDuerpQuestion.id, currentCategory.id);
        }
      } else {
        await saveResponse(currentQuestion.id, responses[currentQuestion.id] || '');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la session:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadDuerpResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('duerp_evaluation_responses')
        .select('*')
        .eq('client_id', clientId)
        .eq('type_diagnostic', typeDiagnostic);

      if (error) throw error;

      if (data) {
        const responsesMap: Record<string, DuerpResponse> = {};
        data.forEach(item => {
          let actionPlanMeasures: ActionPlanMeasure[] = [];

          if (item.action_plan_measures && Array.isArray(item.action_plan_measures)) {
            actionPlanMeasures = item.action_plan_measures.map((measure: any) => {
              if (typeof measure === 'string') {
                return {
                  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                  text: measure,
                  description: measure,
                  responsible: '',
                  budget: '',
                  startDate: '',
                  endDate: ''
                };
              }
              return measure;
            });
          }

          responsesMap[item.question_id] = {
            selectedMeasures: item.selected_measures || [],
            customMeasures: item.custom_measures || [],
            riskStatus: item.risk_status,
            actionPlanMeasures: actionPlanMeasures,
            riskPriority: item.risk_priority || null,
            remarks: item.remarks || ''
          };
        });
        setDuerpResponses(responsesMap);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réponses DUERP:', error);
    }
  };

  const saveDuerpResponse = async (questionId: string, categoryId: string) => {
    try {
      const response = duerpResponses[questionId] || {
        selectedMeasures: [],
        customMeasures: [],
        riskStatus: null,
        actionPlanMeasures: [],
        riskPriority: null,
        remarks: ''
      };

      const { data: existing } = await supabase
        .from('duerp_evaluation_responses')
        .select('id')
        .eq('client_id', clientId)
        .eq('type_diagnostic', typeDiagnostic)
        .eq('question_id', questionId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('duerp_evaluation_responses')
          .update({
            selected_measures: response.selectedMeasures,
            custom_measures: response.customMeasures,
            risk_status: response.riskStatus,
            action_plan_measures: response.actionPlanMeasures,
            risk_priority: response.riskPriority,
            remarks: response.remarks,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('duerp_evaluation_responses')
          .insert({
            client_id: parseInt(clientId),
            type_diagnostic: typeDiagnostic,
            category: categoryId,
            question_id: questionId,
            selected_measures: response.selectedMeasures,
            custom_measures: response.customMeasures,
            risk_status: response.riskStatus,
            action_plan_measures: response.actionPlanMeasures,
            risk_priority: response.riskPriority,
            remarks: response.remarks
          });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde DUERP:', error);
    }
  };

  const toggleMeasure = (questionId: string, measureId: string, categoryId: string) => {
    setDuerpResponses(prev => {
      const current = prev[questionId] || { selectedMeasures: [], customMeasures: [], riskStatus: null, actionPlanMeasures: [], riskPriority: null, remarks: '' };
      const isSelected = current.selectedMeasures.includes(measureId);
      const newResponse = {
        ...current,
        selectedMeasures: isSelected
          ? current.selectedMeasures.filter(id => id !== measureId)
          : [...current.selectedMeasures, measureId]
      };

      setTimeout(() => saveDuerpResponse(questionId, categoryId), 100);

      return {
        ...prev,
        [questionId]: newResponse
      };
    });
  };


  const removeCustomMeasure = (questionId: string, categoryId: string, measureIndex: number) => {
    setDuerpResponses(prev => {
      const current = prev[questionId] || { selectedMeasures: [], customMeasures: [], riskStatus: null, actionPlanMeasures: [], riskPriority: null, remarks: '' };
      const newResponse = {
        ...current,
        customMeasures: current.customMeasures.filter((_, index) => index !== measureIndex)
      };

      setTimeout(() => saveDuerpResponse(questionId, categoryId), 100);

      return {
        ...prev,
        [questionId]: newResponse
      };
    });
  };

  const setRiskStatus = (questionId: string, categoryId: string, status: 'maitrise' | 'non_maitrise' | 'non_applicable') => {
    setDuerpResponses(prev => {
      const current = prev[questionId] || { selectedMeasures: [], customMeasures: [], riskStatus: null, actionPlanMeasures: [], riskPriority: null, remarks: '' };
      const newResponse = {
        ...current,
        riskStatus: status
      };

      setTimeout(() => saveDuerpResponse(questionId, categoryId), 100);

      return {
        ...prev,
        [questionId]: newResponse
      };
    });
  };

  const setRiskPriority = (questionId: string, categoryId: string, priority: 'faible' | 'moyenne' | 'elevee') => {
    setDuerpResponses(prev => {
      const current = prev[questionId] || { selectedMeasures: [], customMeasures: [], riskStatus: null, actionPlanMeasures: [], riskPriority: null, remarks: '' };
      const newResponse = {
        ...current,
        riskPriority: priority
      };

      setTimeout(() => saveDuerpResponse(questionId, categoryId), 100);

      return {
        ...prev,
        [questionId]: newResponse
      };
    });
  };

  const setRemarks = (questionId: string, categoryId: string, remarks: string) => {
    setDuerpResponses(prev => {
      const current = prev[questionId] || { selectedMeasures: [], customMeasures: [], riskStatus: null, actionPlanMeasures: [], riskPriority: null, remarks: '' };
      const newResponse = {
        ...current,
        remarks: remarks
      };

      setTimeout(() => saveDuerpResponse(questionId, categoryId), 500);

      return {
        ...prev,
        [questionId]: newResponse
      };
    });
  };

  const addActionPlanMeasure = (questionId: string, categoryId: string, measureText: string) => {
    setDuerpResponses(prev => {
      const current = prev[questionId] || { selectedMeasures: [], customMeasures: [], riskStatus: null, actionPlanMeasures: [], riskPriority: null, remarks: '' };

      if (current.actionPlanMeasures.some(m => m.text === measureText)) {
        return prev;
      }

      const newMeasure: ActionPlanMeasure = {
        id: Date.now().toString(),
        text: measureText,
        description: measureText,
        responsible: '',
        budget: '',
        startDate: '',
        endDate: ''
      };

      const newResponse = {
        ...current,
        actionPlanMeasures: [...current.actionPlanMeasures, newMeasure]
      };

      setTimeout(() => saveDuerpResponse(questionId, categoryId), 100);

      return {
        ...prev,
        [questionId]: newResponse
      };
    });
  };

  const removeActionPlanMeasure = (questionId: string, categoryId: string, measureId: string) => {
    setDuerpResponses(prev => {
      const current = prev[questionId] || { selectedMeasures: [], customMeasures: [], riskStatus: null, actionPlanMeasures: [], riskPriority: null, remarks: '' };
      const newResponse = {
        ...current,
        actionPlanMeasures: current.actionPlanMeasures.filter(m => m.id !== measureId)
      };

      setTimeout(() => saveDuerpResponse(questionId, categoryId), 100);

      return {
        ...prev,
        [questionId]: newResponse
      };
    });
  };

  const updateActionPlanMeasure = (questionId: string, categoryId: string, measureId: string, field: keyof ActionPlanMeasure, value: string) => {
    setDuerpResponses(prev => {
      const current = prev[questionId] || { selectedMeasures: [], customMeasures: [], riskStatus: null, actionPlanMeasures: [], riskPriority: null, remarks: '' };
      const newResponse = {
        ...current,
        actionPlanMeasures: current.actionPlanMeasures.map(m =>
          m.id === measureId ? { ...m, [field]: value } : m
        )
      };

      setTimeout(() => saveDuerpResponse(questionId, categoryId), 500);

      return {
        ...prev,
        [questionId]: newResponse
      };
    });
  };

  const isQuestionAnswered = (questionId: string): boolean => {
    const response = duerpResponses[questionId];
    if (!response || !response.riskStatus) return false;

    // Si le risque est maîtrisé ou non applicable, c'est bon
    if (response.riskStatus === 'maitrise' || response.riskStatus === 'non_applicable') {
      return true;
    }

    // Si le risque n'est pas maîtrisé, il faut au moins une mesure dans le plan d'actions
    if (response.riskStatus === 'non_maitrise') {
      return response.actionPlanMeasures && response.actionPlanMeasures.length > 0;
    }

    return false;
  };

  const isQuestionIncomplete = (questionId: string): boolean => {
    const response = duerpResponses[questionId];
    // Question incomplète = a un riskStatus mais n'est pas complètement répondue
    if (!response || !response.riskStatus) return false;
    return response.riskStatus === 'non_maitrise' && (!response.actionPlanMeasures || response.actionPlanMeasures.length === 0);
  };

  const isQuestionPartial = (questionId: string): boolean => {
    const response = duerpResponses[questionId];
    // Question partielle = a des mesures cochées mais pas de riskStatus
    if (!response || response.riskStatus) return false;
    return (response.selectedMeasures && response.selectedMeasures.length > 0) ||
           (response.customMeasures && response.customMeasures.length > 0);
  };

  const handleNext = async () => {
    await saveResponse(currentQuestion.id, responses[currentQuestion.id] || '');

    if (currentQuestionIndex < totalQuestionsInSection - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handleSectionClick = (sectionIndex: number) => {
    setCurrentSectionIndex(sectionIndex);
    setCurrentQuestionIndex(0);
  };

  const isQuestionCompleted = (sectionId: string, questionId: string) => {
    return responses[questionId] && responses[questionId].trim().length > 0;
  };

  const isSectionCompleted = (section: DiagnosticSection) => {
    return section.questions.every(q => isQuestionCompleted(section.id, q.id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="w-full lg:w-80 bg-gradient-to-b from-[#1e3a5f] to-[#2d4578] p-6 space-y-2 overflow-y-auto">
        {diagnosticSections.map((section, index) => {
          const Icon = section.icon;
          const isActive = index === currentSectionIndex;
          const isCompleted = isSectionCompleted(section);

          return (
            <button
              key={section.id}
              onClick={() => handleSectionClick(index)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                isActive
                  ? 'bg-white text-[#1e3a5f] font-bold shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-sm">{section.label}</span>
              {isCompleted && (
                <Check className="w-5 h-5 text-green-500" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col bg-gray-50 min-h-0">
        {currentQuestion.id === 'resume_1' ? (
          <>
            <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="flex-shrink-0">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 shadow-lg">
                        <img
                          src={`/${typeDiagnostic?.split(' ').slice(1).join('_').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]/g, '_')}.png`}
                          alt={typeDiagnostic?.split(' ').slice(1).join(' ') || 'Secteur'}
                          className="w-48 h-48 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="mt-6 flex flex-wrap gap-2 justify-center">
                          <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {typeDiagnostic?.split(' ').slice(1).join(' ') || 'Secteur'}
                          </span>
                          <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            France
                          </span>
                          <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            Français
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                        {typeDiagnostic?.split(' ').slice(1).join(' ') || 'Secteur'}
                      </h1>

                      <div className="space-y-4 sm:space-y-6 text-gray-700 leading-relaxed">
                        <p className="text-sm sm:text-base lg:text-lg">
                          L'évaluation des risques professionnels (EvRP) consiste à identifier et hiérarchiser les risques auxquels sont soumis les salariés d'un établissement, en vue de mettre en place des actions de prévention pertinentes.
                        </p>

                        <p className="text-sm sm:text-base lg:text-lg">
                          L'EvRP s'inscrit dans le cadre de la responsabilité de l'employeur, qui a une obligation générale d'assurer la sécurité et de protéger la santé de ses salariés. L'évaluation requiert l'implication et la participation des salariés. Elle doit être mise à jour annuellement et à chaque changement d'organisation ou de techniques de travail.
                        </p>

                        <p className="text-sm sm:text-base lg:text-lg">
                          Cet outil "OiRA {typeDiagnostic?.split(' ').slice(1).join(' ').toLowerCase() || 'secteur'}" vous permettra de répondre à cette obligation réglementaire et d'engager (ou poursuivre) une politique de prévention des risques professionnels.
                        </p>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-l-4 border-blue-500">
                          <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                            L'EvRP est une démarche structurée dont les résultats sont formalisés dans un "document unique", elle suit les étapes suivantes :
                          </p>

                          <ul className="space-y-2 sm:space-y-3 text-gray-700">
                            <li className="flex items-start gap-2 sm:gap-3">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                              <span className="text-sm sm:text-base lg:text-lg">Préparer l'évaluation des risques</span>
                            </li>
                            <li className="flex items-start gap-2 sm:gap-3">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                              <span className="text-sm sm:text-base lg:text-lg">Identifier les risques</span>
                            </li>
                            <li className="flex items-start gap-2 sm:gap-3">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                              <span className="text-sm sm:text-base lg:text-lg">hiérarchiser les risques</span>
                            </li>
                            <li className="flex items-start gap-2 sm:gap-3">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                              <span className="text-sm sm:text-base lg:text-lg">Proposer des actions de prévention</span>
                            </li>
                            <li className="flex items-start gap-2 sm:gap-3">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                              <span className="text-sm sm:text-base lg:text-lg">Editer le "Document unique"</span>
                            </li>
                          </ul>
                        </div>

                        <p className="text-sm sm:text-base lg:text-lg font-medium text-gray-800">
                          Cet outil vous accompagnera dans la démarche.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 lg:p-5 bg-white border-t-2 border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Section {currentSectionIndex + 1} / {totalSections} - Question {currentQuestionIndex + 1} / {totalQuestionsInSection}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center w-full sm:w-auto">
                {saveSuccess && (
                  <div className="flex items-center gap-2 text-green-600 font-medium text-xs sm:text-sm animate-fade-in">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Session enregistrée</span>
                  </div>
                )}
                <button
                  onClick={handleSaveSession}
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-bold text-sm sm:text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={handleNext}
                  disabled={saving || (currentSectionIndex === totalSections - 1 && currentQuestionIndex === totalQuestionsInSection - 1)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 bg-[#0066cc] text-white rounded-xl hover:bg-[#0052a3] transition-all duration-300 font-bold text-sm sm:text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Sauvegarde...' : 'Suivant'}
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </>
        ) : currentQuestion.id === 'impl_1' ? (
          <>
            <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                {currentQuestion.text}
              </h2>

              <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-xl shadow-md p-3 lg:p-4 border-2 border-gray-200 max-w-5xl mx-auto">
                <div className="w-full px-2 py-2">

                  <div className="space-y-3">
                    <div className="relative bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-5 border-l-4 sm:border-l-6 border-[#0066cc] transform transition-all duration-300 hover:shadow-xl">
                      <div className="hidden sm:flex absolute -left-8 sm:-left-10 top-3 sm:top-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#0066cc] to-[#0052a3] rounded-lg sm:rounded-xl items-center justify-center shadow-xl">
                        <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div className="sm:ml-4">
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <span className="bg-gradient-to-r from-[#0066cc] to-[#0052a3] bg-clip-text text-transparent">Leadership en SST</span>
                        </h3>
                        <div className="h-0.5 w-12 sm:w-16 bg-gradient-to-r from-[#0066cc] to-[#0052a3] rounded-full mb-2"></div>
                        <p className="text-xs sm:text-sm leading-normal text-gray-700">
                          L'une des clés d'un bon leadership en matière de <span className="font-bold text-[#0066cc]">Sécurité et santé au travail</span> est d'impliquer les travailleurs. Les employeurs ont l'obligation légale de consulter les travailleurs sur les questions de sécurité et de santé. Mais il y a des avantages à aller au-delà des exigences minimales. La gestion de la SST aura plus de chances de réussir si elle encourage la participation active des travailleurs et instaure un dialogue entre les travailleurs et la direction.
                        </p>
                      </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-3 sm:p-4 lg:p-5 border-l-4 sm:border-l-6 border-green-500 transform transition-all duration-300 hover:shadow-xl">
                      <div className="hidden sm:flex absolute -left-8 sm:-left-10 top-3 sm:top-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl items-center justify-center shadow-xl">
                        <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div className="sm:ml-4">
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2">
                          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Obligations & Opportunités</span>
                        </h3>
                        <div className="h-0.5 w-12 sm:w-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-2"></div>
                        <p className="text-xs sm:text-sm leading-normal text-gray-700">
                          Les employeurs ont l'obligation juridique de consulter les salariés sur les questions de SST. Il existe toutefois des avantages à ne pas se limiter aux exigences minimales. La gestion de la SST aura davantage de chances de réussir si elle encourage la <span className="font-bold text-green-600">participation active</span> des travailleurs et qu'elle établit un <span className="font-bold text-green-600">dialogue</span> entre les salariés et la direction.
                        </p>
                      </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg p-3 sm:p-4 lg:p-5 border-l-4 sm:border-l-6 border-amber-500 transform transition-all duration-300 hover:shadow-xl">
                      <div className="hidden sm:flex absolute -left-8 sm:-left-10 top-3 sm:top-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg sm:rounded-xl items-center justify-center shadow-xl">
                        <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div className="sm:ml-4">
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2">
                          <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Comment associer votre personnel ?</span>
                        </h3>
                        <div className="h-0.5 w-12 sm:w-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-2"></div>
                        <p className="text-xs sm:text-sm leading-normal text-gray-700 font-semibold mb-2 sm:mb-3">
                          Décidez de la meilleure manière d'associer votre personnel !
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2 sm:gap-3 bg-white rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                              <span className="text-white text-xs sm:text-sm font-bold">1</span>
                            </div>
                            <p className="text-xs sm:text-sm leading-normal text-gray-700 pt-0.5">
                              Organisez une <span className="font-semibold text-amber-700">réunion ou un groupe de réflexion</span> avec les travailleurs et passez en revue les différents modules de l'évaluation des risques.
                            </p>
                          </div>
                          <div className="flex items-start gap-2 sm:gap-3 bg-white rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                              <span className="text-white text-xs sm:text-sm font-bold">2</span>
                            </div>
                            <p className="text-sm leading-normal text-gray-700 pt-0.5">
                              <span className="font-semibold text-amber-700">Téléchargez ou imprimez</span> le contenu de l'outil ou des parties de l'outil et partagez-le pour information et retour d'information avec vos travailleurs.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-[#0066cc] via-[#0052a3] to-blue-700 rounded-xl shadow-xl p-5 lg:p-6 text-white overflow-hidden">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></div>
                      <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/10 rounded-full -ml-18 -mb-18"></div>
                      <div className="relative flex items-start gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Target className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg lg:text-xl font-bold mb-2">Point Clé</h3>
                          <div className="h-0.5 w-14 bg-white/40 rounded-full mb-2"></div>
                          <p className="text-sm leading-normal font-light">
                            La <span className="font-bold border-b-2 border-white/50">participation active</span> de vos collaborateurs est essentielle pour une gestion réussie de la sécurité et de la santé au travail.
                            <span className="block mt-2 text-sm font-semibold">
                              Ensemble, construisez un environnement de travail plus sûr et plus sain !
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 lg:p-5 bg-white border-t-2 border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Section {currentSectionIndex + 1} / {totalSections} - Question {currentQuestionIndex + 1} / {totalQuestionsInSection}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center w-full sm:w-auto">
                {saveSuccess && (
                  <div className="flex items-center gap-2 text-green-600 font-medium text-xs sm:text-sm animate-fade-in">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Session enregistrée</span>
                  </div>
                )}
                <button
                  onClick={handleSaveSession}
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-bold text-sm sm:text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={handleNext}
                  disabled={saving || (currentSectionIndex === totalSections - 1 && currentQuestionIndex === totalQuestionsInSection - 1)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 bg-[#0066cc] text-white rounded-xl hover:bg-[#0052a3] transition-all duration-300 font-bold text-sm sm:text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Sauvegarde...' : 'Suivant'}
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </>
        ) : currentQuestion.id === 'eval_1' ? (
          <>
            <div className="flex-1 flex overflow-hidden relative">
              {isSidebarOpen && (
                <div
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}

              <div className={`
                fixed lg:static inset-y-0 left-0 z-50 lg:z-0
                w-80 lg:w-80 bg-gradient-to-b from-slate-50 via-gray-50 to-blue-50
                border-r-2 border-gray-300 overflow-y-auto shadow-inner
                transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              `}>
                <div className="p-4">
                  <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-4 mb-6 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">Questions DUERP</h3>
                        <p className="text-xs text-cyan-300 font-semibold">Évaluation des risques</p>
                      </div>
                    </div>
                  </div>

                  {duerpCategories.map((category, catIndex) => (
                    <div key={category.id} className="mb-5">
                      <button
                        onClick={() => {
                          setSelectedDuerpCategory(catIndex);
                          setViewMode('category');
                          setIsSidebarOpen(false);
                        }}
                        className={`group relative w-full flex items-center gap-3 mb-3 px-3 py-3 rounded-xl transition-all duration-300 overflow-hidden ${
                          viewMode === 'category' && selectedDuerpCategory === catIndex
                            ? 'bg-gradient-to-r from-[#0066cc] to-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>

                        <div className={`relative flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-sm ${
                          viewMode === 'category' && selectedDuerpCategory === catIndex
                            ? 'bg-white/20 text-white backdrop-blur-sm'
                            : 'bg-gradient-to-br from-slate-200 to-slate-300 text-gray-700 group-hover:from-[#0066cc]/20 group-hover:to-cyan-500/20 group-hover:text-[#0066cc]'
                        }`}>
                          {catIndex + 1}
                        </div>

                        <h4 className={`relative text-sm font-bold leading-tight ${
                          viewMode === 'category' && selectedDuerpCategory === catIndex ? 'text-white' : 'text-gray-800 group-hover:text-gray-900'
                        }`}>
                          {category.label}
                        </h4>
                      </button>
                      <div className="ml-2 space-y-2">
                        {category.questions.map((question, qIndex) => {
                          const globalQIndex = duerpCategories.slice(0, catIndex).reduce((acc, cat) => acc + cat.questions.length, 0) + qIndex;
                          const isActive = selectedDuerpCategory === catIndex && selectedDuerpQuestion === qIndex;
                          const isAnswered = isQuestionAnswered(question.id);
                          const isIncomplete = isQuestionIncomplete(question.id);
                          const isPartial = isQuestionPartial(question.id);

                          return (
                            <button
                              key={question.id}
                              onClick={() => {
                                setSelectedDuerpCategory(catIndex);
                                setSelectedDuerpQuestion(qIndex);
                                setViewMode('question');
                                setIsSidebarOpen(false);
                              }}
                              className={`group relative w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 overflow-hidden ${
                                isActive && viewMode === 'question'
                                  ? 'bg-gradient-to-r from-[#0066cc] via-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 border border-gray-200 hover:border-blue-300 hover:shadow-md'
                              }`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>

                              <div className="relative flex items-start gap-3">
                                <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm ${
                                  isActive && viewMode === 'question'
                                    ? 'bg-white/20 text-white backdrop-blur-sm'
                                    : 'bg-gradient-to-br from-slate-100 to-slate-200 text-gray-700 group-hover:from-[#0066cc]/10 group-hover:to-cyan-500/10 group-hover:text-[#0066cc]'
                                }`}>
                                  {catIndex + 1}.{qIndex + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium leading-snug line-clamp-2 ${
                                    isActive && viewMode === 'question' ? 'text-white' : 'text-gray-800 group-hover:text-gray-900'
                                  }`}>
                                    {question.text}
                                  </p>

                                  <div className="flex items-center gap-1.5 mt-2">
                                    {isAnswered && (
                                      <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-md text-xs font-semibold">
                                        <Check className="w-3 h-3" />
                                        <span>Complète</span>
                                      </div>
                                    )}
                                    {isIncomplete && (
                                      <div className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-xs font-semibold">
                                        <X className="w-3 h-3" />
                                        <span>Incomplete</span>
                                      </div>
                                    )}
                                    {isPartial && !isAnswered && !isIncomplete && (
                                      <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md text-xs font-semibold">
                                        <HelpCircle className="w-3 h-3" />
                                        <span>Partielle</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {(isActive && viewMode === 'question') && (
                                  <div className="flex-shrink-0">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="sticky top-0 z-30 bg-white border-b-2 border-gray-200 p-4 lg:hidden shadow-md">
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0066cc] to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Menu className="w-5 h-5" />
                    <span className="font-bold">Questions DUERP</span>
                  </button>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                {viewMode === 'category' ? (
                  <div className="max-w-5xl mx-auto">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 border-l-4 sm:border-l-8 border-[#0066cc] shadow-lg">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        {duerpCategories[selectedDuerpCategory].label}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {duerpCategories[selectedDuerpCategory].defaultDescription
                          ? 'Description par défaut de cette section'
                          : 'Décrivez cette section pour mieux comprendre son objectif et son contexte'}
                      </p>
                    </div>

                    {duerpCategories[selectedDuerpCategory].defaultDescription && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 mb-6 border-l-4 border-gray-400">
                        <div className="flex items-start gap-3">
                          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">
                              Description officielle de la section
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                              {duerpCategories[selectedDuerpCategory].defaultDescription}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (() => {
                  const currentCategory = duerpCategories[selectedDuerpCategory];
                  const currentDuerpQuestion = currentCategory.questions[selectedDuerpQuestion];
                  const currentResponse = duerpResponses[currentDuerpQuestion.id] || {
                    selectedMeasures: [],
                    customMeasures: [],
                    actionPlanMeasures: [],
                    riskStatus: null,
                    riskPriority: null,
                    remarks: ''
                  };

                  return (
                    <div className="max-w-5xl mx-auto">
                      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

                        <div className="relative z-10">
                          <div className="flex items-start gap-3 sm:gap-6 mb-4">
                            <div className="relative flex-shrink-0">
                              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl sm:rounded-2xl blur-xl opacity-60 animate-pulse"></div>
                              <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl transform transition-transform hover:scale-110 duration-300">
                                <Shield className="w-6 h-6 sm:w-9 sm:h-9 text-white" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                                <span className="text-cyan-300 text-xs sm:text-sm font-bold tracking-wider uppercase">Question d'évaluation</span>
                              </div>

                              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-3 tracking-tight">
                                {currentDuerpQuestion.text}
                              </h2>

                              {isQuestionPartial(currentDuerpQuestion.id) && (
                                <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 px-4 py-2 rounded-xl backdrop-blur-sm">
                                  <HelpCircle className="w-5 h-5 text-orange-300" />
                                  <span className="text-orange-200 text-sm font-semibold">Réponse partielle</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {currentDuerpQuestion.informationText && (
                            <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 mt-4 sm:mt-6">
                              <div className="flex items-start gap-2 sm:gap-3">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-cyan-300 font-bold text-xs sm:text-sm mb-2 tracking-wide uppercase">Information contextuelle</h4>
                                  <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
                                    {currentDuerpQuestion.informationText}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border-2 border-blue-100 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#0066cc] to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">
                              Mesures <span className="text-[#0066cc]">déjà en place</span>
                            </h3>
                          </div>

                          <div className="h-1 w-24 bg-gradient-to-r from-[#0066cc] to-cyan-400 rounded-full mb-6"></div>

                          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                            {currentDuerpQuestion.measures.map((measure, index) => (
                              <div key={measure.id} className="group">
                                <label className="flex items-start gap-3 sm:gap-4 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 cursor-pointer transition-all duration-300 border-2 border-gray-200 hover:border-[#0066cc] hover:shadow-lg transform hover:-translate-y-0.5">
                                  <div className="relative flex-shrink-0">
                                    <input
                                      type="checkbox"
                                      checked={currentResponse.selectedMeasures.includes(measure.id)}
                                      onChange={() => toggleMeasure(currentDuerpQuestion.id, measure.id, currentCategory.id)}
                                      className="peer w-5 h-5 sm:w-6 sm:h-6 mt-0.5 text-[#0066cc] rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:ring-offset-2 cursor-pointer border-2 border-gray-300 transition-all"
                                    />
                                    <div className="absolute inset-0 peer-checked:animate-ping bg-[#0066cc]/30 rounded-lg pointer-events-none"></div>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-[#0066cc]/10 group-hover:to-cyan-500/10 transition-all">
                                        <span className="text-xs sm:text-sm font-bold text-gray-600 group-hover:text-[#0066cc] transition-colors">{index + 1}</span>
                                      </div>
                                      <span className="text-xs sm:text-sm text-gray-700 flex-1 leading-relaxed group-hover:text-gray-900 font-medium transition-colors">
                                        {measure.text}
                                      </span>
                                    </div>
                                  </div>
                                </label>
                              </div>
                            ))}

                            {currentResponse.customMeasures.map((customMeasure, index) => (
                              <div
                                key={`custom-${index}`}
                                className="relative p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 border-2 border-blue-300 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                              >
                                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

                                <div className="relative z-10">
                                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                      </div>
                                      <div>
                                        <span className="text-xs sm:text-sm font-black text-gray-900 block">Mesure personnalisée</span>
                                        <span className="text-xs text-blue-600 font-semibold">#{index + 1}</span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => removeCustomMeasure(currentDuerpQuestion.id, currentCategory.id, index)}
                                      className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors shadow-md flex-shrink-0"
                                    >
                                      <X className="w-3 h-3" />
                                      Supprimer
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                                    {customMeasure.description && (
                                      <div className="col-span-full bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-blue-200">
                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wide block mb-1">Description</span>
                                        <span className="text-sm text-gray-800 font-medium">{customMeasure.description}</span>
                                      </div>
                                    )}
                                    {customMeasure.expertise && (
                                      <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-blue-200">
                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wide block mb-1">Expertise</span>
                                        <span className="text-sm text-gray-800">{customMeasure.expertise}</span>
                                      </div>
                                    )}
                                    {customMeasure.responsible && (
                                      <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-blue-200">
                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wide block mb-1">Responsable</span>
                                        <span className="text-sm text-gray-800">{customMeasure.responsible}</span>
                                      </div>
                                    )}
                                    {customMeasure.budget && (
                                      <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-blue-200">
                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wide block mb-1">Budget</span>
                                        <span className="text-sm text-gray-800 font-semibold">{customMeasure.budget}</span>
                                      </div>
                                    )}
                                    {customMeasure.startDate && (
                                      <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-blue-200">
                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wide block mb-1">Date de début</span>
                                        <span className="text-sm text-gray-800">{new Date(customMeasure.startDate).toLocaleDateString('fr-FR')}</span>
                                      </div>
                                    )}
                                    {customMeasure.endDate && (
                                      <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-blue-200">
                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wide block mb-1">Date de fin</span>
                                        <span className="text-sm text-gray-800">{new Date(customMeasure.endDate).toLocaleDateString('fr-FR')}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => setShowCustomMeasureModal(true)}
                            className="relative group w-full mt-4 overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0066cc] via-blue-500 to-cyan-500 rounded-2xl blur group-hover:blur-md transition-all duration-300"></div>
                            <div className="relative flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#0066cc] to-blue-600 rounded-2xl hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 shadow-xl">
                              <Plus className="w-6 h-6 text-white" />
                              <span className="text-white font-bold text-base">Ajouter des mesures supplémentaires</span>
                            </div>
                          </button>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-xl p-8 border-2 border-purple-100 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                              <Target className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">
                              État de maîtrise du risque
                            </h3>
                          </div>

                          <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full mb-6"></div>

                          <div className="space-y-4">
                            <label className={`group relative flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                              currentResponse.riskStatus === 'maitrise'
                                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 shadow-lg shadow-green-200/50'
                                : 'bg-white border-gray-200 hover:border-green-300 hover:shadow-md'
                            }`}>
                              <div className="relative flex-shrink-0 mt-0.5">
                                <input
                                  type="radio"
                                  name={`risk-${currentDuerpQuestion.id}`}
                                  checked={currentResponse.riskStatus === 'maitrise'}
                                  onChange={() => setRiskStatus(currentDuerpQuestion.id, currentCategory.id, 'maitrise')}
                                  className="peer w-6 h-6 text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer border-2 border-gray-300 transition-all"
                                />
                                {currentResponse.riskStatus === 'maitrise' && (
                                  <div className="absolute inset-0 animate-ping bg-green-400/30 rounded-full pointer-events-none"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <CheckCircle2 className={`w-5 h-5 ${currentResponse.riskStatus === 'maitrise' ? 'text-green-600' : 'text-gray-400'} transition-colors`} />
                                  <span className={`text-base font-bold ${currentResponse.riskStatus === 'maitrise' ? 'text-green-900' : 'text-gray-700'} transition-colors`}>
                                    Risque maîtrisé
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">Les mesures en place sont suffisantes</p>
                              </div>
                            </label>

                            <label className={`group relative flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                              currentResponse.riskStatus === 'non_maitrise'
                                ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-400 shadow-lg shadow-orange-200/50'
                                : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-md'
                            }`}>
                              <div className="relative flex-shrink-0 mt-0.5">
                                <input
                                  type="radio"
                                  name={`risk-${currentDuerpQuestion.id}`}
                                  checked={currentResponse.riskStatus === 'non_maitrise'}
                                  onChange={() => setRiskStatus(currentDuerpQuestion.id, currentCategory.id, 'non_maitrise')}
                                  className="peer w-6 h-6 text-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 cursor-pointer border-2 border-gray-300 transition-all"
                                />
                                {currentResponse.riskStatus === 'non_maitrise' && (
                                  <div className="absolute inset-0 animate-ping bg-orange-400/30 rounded-full pointer-events-none"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <AlertTriangle className={`w-5 h-5 ${currentResponse.riskStatus === 'non_maitrise' ? 'text-orange-600' : 'text-gray-400'} transition-colors`} />
                                  <span className={`text-base font-bold ${currentResponse.riskStatus === 'non_maitrise' ? 'text-orange-900' : 'text-gray-700'} transition-colors`}>
                                    Risque non maîtrisé
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">Des mesures supplémentaires sont nécessaires</p>
                              </div>
                            </label>

                            <label className={`group relative flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                              currentResponse.riskStatus === 'non_applicable'
                                ? 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-400 shadow-lg shadow-gray-200/50'
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }`}>
                              <div className="relative flex-shrink-0 mt-0.5">
                                <input
                                  type="radio"
                                  name={`risk-${currentDuerpQuestion.id}`}
                                  checked={currentResponse.riskStatus === 'non_applicable'}
                                  onChange={() => setRiskStatus(currentDuerpQuestion.id, currentCategory.id, 'non_applicable')}
                                  className="peer w-6 h-6 text-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 cursor-pointer border-2 border-gray-300 transition-all"
                                />
                                {currentResponse.riskStatus === 'non_applicable' && (
                                  <div className="absolute inset-0 animate-ping bg-gray-400/30 rounded-full pointer-events-none"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <X className={`w-5 h-5 ${currentResponse.riskStatus === 'non_applicable' ? 'text-gray-600' : 'text-gray-400'} transition-colors`} />
                                  <span className={`text-base font-bold ${currentResponse.riskStatus === 'non_applicable' ? 'text-gray-900' : 'text-gray-700'} transition-colors`}>
                                    Non applicable
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">Ce risque ne concerne pas votre activité</p>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {currentResponse.riskStatus === 'non_maitrise' && (
                        <>
                          <div className="bg-gray-50 rounded-xl shadow-md border-2 border-gray-200 mb-6 overflow-hidden">
                            <button
                              onClick={() => setIsMeasuresSectionExpanded(!isMeasuresSectionExpanded)}
                              className="w-full flex items-center justify-between p-5 hover:bg-gray-100 transition-colors"
                            >
                              <h3 className="text-lg font-semibold text-[#0066cc]">
                                Mesures
                              </h3>
                              {isMeasuresSectionExpanded ? (
                                <ChevronUp className="w-5 h-5 text-[#0066cc]" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-[#0066cc]" />
                              )}
                            </button>

                            {isMeasuresSectionExpanded && (
                              <div className="p-6 pt-0">
                                <p className="text-sm text-gray-700 mb-5">
                                  Sélectionnez ou décrivez les mesures spécifiques nécessaires pour réduire le risque.
                                </p>

                                <div className="flex gap-3 mb-6">
                                  <button
                                    onClick={() => setShowStandardMeasuresModal(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium text-sm"
                                  >
                                    <Plus className="w-5 h-5" />
                                    Sélectionner des mesures standards
                                  </button>
                                  <button
                                    onClick={() => setShowCustomMeasureModal(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium text-sm"
                                  >
                                    <Plus className="w-5 h-5" />
                                    Ajouter une mesure supplémentaire
                                  </button>
                                </div>

                                {currentResponse.actionPlanMeasures.length > 0 && (
                                  <div className="mb-6 space-y-3">
                                    {currentResponse.actionPlanMeasures.map((measure, index) => (
                                      <div key={measure.id} className="bg-white rounded-lg border border-gray-300 p-3 flex items-center justify-between">
                                        <p className="text-sm text-gray-900">{measure.text}</p>
                                        <button
                                          onClick={() => removeActionPlanMeasure(currentDuerpQuestion.id, currentCategory.id, measure.id)}
                                          className="text-red-600 hover:text-red-800 font-medium text-xs flex items-center gap-1 ml-3"
                                        >
                                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                          Supprimer
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Priorité du risque
                            </h3>

                            <div className="space-y-3">
                              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                  type="radio"
                                  name={`priority-${currentDuerpQuestion.id}`}
                                  checked={currentResponse.riskPriority === 'faible'}
                                  onChange={() => setRiskPriority(currentDuerpQuestion.id, currentCategory.id, 'faible')}
                                  className="w-5 h-5 text-green-600 focus:ring-green-600 cursor-pointer"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  Faible
                                </span>
                              </label>

                              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                  type="radio"
                                  name={`priority-${currentDuerpQuestion.id}`}
                                  checked={currentResponse.riskPriority === 'moyenne'}
                                  onChange={() => setRiskPriority(currentDuerpQuestion.id, currentCategory.id, 'moyenne')}
                                  className="w-5 h-5 text-amber-600 focus:ring-amber-600 cursor-pointer"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  Moyenne
                                </span>
                              </label>

                              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                  type="radio"
                                  name={`priority-${currentDuerpQuestion.id}`}
                                  checked={currentResponse.riskPriority === 'elevee'}
                                  onChange={() => setRiskPriority(currentDuerpQuestion.id, currentCategory.id, 'elevee')}
                                  className="w-5 h-5 text-red-600 focus:ring-red-600 cursor-pointer"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  Élevée
                                </span>
                              </label>
                            </div>
                          </div>
                        </>
                      )}

                      {currentResponse.riskStatus && (
                        <>
                          {currentDuerpQuestion.informationText && (
                            <div className="bg-blue-50 rounded-xl shadow-md border-2 border-blue-200 mb-6 overflow-hidden">
                              <button
                                onClick={() => setIsInformationExpanded(!isInformationExpanded)}
                                className="w-full flex items-center justify-between p-5 hover:bg-blue-100 transition-colors"
                              >
                                <h3 className="text-lg font-semibold text-blue-900">
                                  Information
                                </h3>
                                {isInformationExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-blue-900" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-blue-900" />
                                )}
                              </button>

                              {isInformationExpanded && (
                                <div className="p-6 pt-0">
                                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                    {currentDuerpQuestion.informationText}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="bg-amber-50 rounded-xl shadow-md border-2 border-amber-200 mb-6 overflow-hidden">
                            <button
                              onClick={() => setIsRemarquesExpanded(!isRemarquesExpanded)}
                              className="w-full flex items-center justify-between p-5 hover:bg-amber-100 transition-colors"
                            >
                              <h3 className="text-lg font-semibold text-amber-900">
                                Remarques
                              </h3>
                              {isRemarquesExpanded ? (
                                <ChevronUp className="w-5 h-5 text-amber-900" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-amber-900" />
                              )}
                            </button>

                            {isRemarquesExpanded && (
                              <div className="p-6 pt-0">
                                <textarea
                                  value={currentResponse.remarks || ''}
                                  onChange={(e) => setRemarks(currentDuerpQuestion.id, currentCategory.id, e.target.value)}
                                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all min-h-[120px] text-gray-900 resize-y"
                                  placeholder="Ajoutez vos remarques ici..."
                                />
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 lg:p-5 bg-white border-t-2 border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Section {currentSectionIndex + 1} / {totalSections} - Évaluation des risques DUERP
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center w-full sm:w-auto">
                {saveSuccess && (
                  <div className="flex items-center gap-2 text-green-600 font-medium text-xs sm:text-sm animate-fade-in">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Session enregistrée</span>
                  </div>
                )}
                <button
                  onClick={handleSaveSession}
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-bold text-sm sm:text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={handleNext}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 bg-[#0066cc] text-white rounded-xl hover:bg-[#0052a3] transition-all duration-300 font-bold text-sm sm:text-base shadow-lg"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                {currentQuestion.text}
              </h2>

              <div className="prose prose-base lg:prose-lg max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {currentQuestion.description}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-4 lg:p-6 border-2 border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Votre réponse :
                </label>
                <textarea
                  value={responses[currentQuestion.id] || ''}
                  onChange={(e) => handleResponseChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-500 transition-all duration-300 min-h-[850px] text-gray-900 resize-none"
                  placeholder="Saisissez votre réponse ici..."
                />
              </div>
            </div>

            <div className="p-3 sm:p-4 lg:p-5 bg-white border-t-2 border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Section {currentSectionIndex + 1} / {totalSections} - Question {currentQuestionIndex + 1} / {totalQuestionsInSection}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center w-full sm:w-auto">
                {saveSuccess && (
                  <div className="flex items-center gap-2 text-green-600 font-medium text-xs sm:text-sm animate-fade-in">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Session enregistrée</span>
                  </div>
                )}
                <button
                  onClick={handleSaveSession}
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-bold text-sm sm:text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={handleNext}
                  disabled={saving || (currentSectionIndex === totalSections - 1 && currentQuestionIndex === totalQuestionsInSection - 1)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 bg-[#0066cc] text-white rounded-xl hover:bg-[#0052a3] transition-all duration-300 font-bold text-sm sm:text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Sauvegarde...' : 'Suivant'}
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showStandardMeasuresModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Mesures standards</h3>
              <button
                onClick={() => setShowStandardMeasuresModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Sélectionner une ou plusieurs des mesures communes connues fournies.
              </p>

              <div className="space-y-4">
                {(() => {
                  const currentCategory = duerpCategories[selectedDuerpCategory];
                  const currentDuerpQuestion = currentCategory.questions[selectedDuerpQuestion];
                  const currentResponse = duerpResponses[currentDuerpQuestion.id] || {
                    selectedMeasures: [],
                    customMeasures: [],
                    riskStatus: null,
                    actionPlanMeasures: [],
                    riskPriority: null,
                    remarks: ''
                  };

                  return currentDuerpQuestion.measures
                    .filter(measure => !currentResponse.selectedMeasures.includes(measure.id))
                    .map((measure, index) => {
                    const addedMeasure = currentResponse.actionPlanMeasures.find(m => m.text === measure.text);
                    const isAdded = !!addedMeasure;

                    return (
                      <label key={measure.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={isAdded}
                        onChange={() => {
                          if (isAdded && addedMeasure) {
                            removeActionPlanMeasure(currentDuerpQuestion.id, currentCategory.id, addedMeasure.id);
                          } else {
                            addActionPlanMeasure(currentDuerpQuestion.id, currentCategory.id, measure.text);
                          }
                        }}
                        className="w-5 h-5 mt-0.5 text-[#003d82] rounded focus:ring-2 focus:ring-[#003d82] cursor-pointer"
                      />
                      <p className="flex-1 text-gray-800 text-sm leading-relaxed">{measure.text}</p>
                    </label>
                  );
                });
                })()}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowStandardMeasuresModal(false)}
                  className="w-full px-6 py-3 bg-[#003d82] text-white rounded-md hover:bg-[#002d62] transition-colors font-medium"
                >
                  Terminé
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCustomMeasureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-5xl w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-[#003d82]">Mesures</h3>
              <button
                onClick={() => {
                  setShowCustomMeasureModal(false);
                  setCustomMeasures([]);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronUp className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Sélectionnez ou décrivez les éventuelles mesures supplémentaires pour réduire le risque.
              </p>

              {customMeasures.map((measure, index) => (
                <div key={measure.id} className="mb-8 border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                      <h4 className="text-lg font-medium text-[#003d82]">
                        Mesure additionnelle {index + 1}
                      </h4>
                    </div>
                    <button
                      onClick={() => {
                        setCustomMeasures(customMeasures.filter(m => m.id !== measure.id));
                      }}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Effacer cette mesure
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        Description
                        <svg className="w-4 h-4 text-[#003d82]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </label>
                      <input
                        type="text"
                        value={measure.description}
                        onChange={(e) => {
                          const updated = [...customMeasures];
                          updated[index].description = e.target.value;
                          setCustomMeasures(updated);
                        }}
                        placeholder="Décrivez cette mesure"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#003d82] focus:border-[#003d82] text-sm"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        Expertise
                        <svg className="w-4 h-4 text-[#003d82]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </label>
                      <textarea
                        value={measure.expertise}
                        onChange={(e) => {
                          const updated = [...customMeasures];
                          updated[index].expertise = e.target.value;
                          setCustomMeasures(updated);
                        }}
                        placeholder="Indiquez les compétences spécifiques nécessaires ou précisez quelle(s) fonction(s) de l'entreprise est (sont) à mobiliser."
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#003d82] focus:border-[#003d82] text-sm min-h-[80px] resize-y"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        Qui est responsable ?
                        <svg className="w-4 h-4 text-[#003d82]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </label>
                      <input
                        type="text"
                        value={measure.responsible}
                        onChange={(e) => {
                          const updated = [...customMeasures];
                          updated[index].responsible = e.target.value;
                          setCustomMeasures(updated);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#003d82] focus:border-[#003d82] text-sm"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        Budget
                        <svg className="w-4 h-4 text-[#003d82]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </label>
                      <input
                        type="text"
                        value={measure.budget}
                        onChange={(e) => {
                          const updated = [...customMeasures];
                          updated[index].budget = e.target.value;
                          setCustomMeasures(updated);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#003d82] focus:border-[#003d82] text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Date de commencement prévue
                      </label>
                      <input
                        type="date"
                        value={measure.startDate}
                        onChange={(e) => {
                          const updated = [...customMeasures];
                          updated[index].startDate = e.target.value;
                          setCustomMeasures(updated);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#003d82] focus:border-[#003d82] text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Date de fin prévue
                      </label>
                      <input
                        type="date"
                        value={measure.endDate}
                        onChange={(e) => {
                          const updated = [...customMeasures];
                          updated[index].endDate = e.target.value;
                          setCustomMeasures(updated);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#003d82] focus:border-[#003d82] text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowStandardMeasuresModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#003d82] text-white rounded-md hover:bg-[#002d62] transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Sélectionner des mesures standards
                </button>
                <button
                  onClick={() => {
                    const newMeasure: CustomMeasure = {
                      id: Date.now().toString(),
                      description: '',
                      expertise: '',
                      responsible: '',
                      budget: '',
                      startDate: '',
                      endDate: ''
                    };
                    setCustomMeasures([...customMeasures, newMeasure]);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-[#003d82] text-white rounded-md hover:bg-[#002d62] transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une mesure supplémentaire
                </button>
              </div>

              {customMeasures.length > 0 && (
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowCustomMeasureModal(false);
                      setCustomMeasures([]);
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      const currentCategory = duerpCategories[selectedDuerpCategory];
                      const currentDuerpQuestion = currentCategory.questions[selectedDuerpQuestion];

                      // Save all custom measures to the response
                      setDuerpResponses(prev => {
                        const current = prev[currentDuerpQuestion.id] || {
                          selectedMeasures: [],
                          customMeasures: [],
                          riskStatus: null,
                          actionPlanMeasures: [],
                          riskPriority: null,
                          remarks: ''
                        };
                        return {
                          ...prev,
                          [currentDuerpQuestion.id]: {
                            ...current,
                            customMeasures: [...current.customMeasures, ...customMeasures]
                          }
                        };
                      });

                      // Save to database
                      setTimeout(() => saveDuerpResponse(currentDuerpQuestion.id, currentCategory.id), 100);

                      setShowCustomMeasureModal(false);
                      setCustomMeasures([]);
                    }}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    Enregistrer les mesures
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticGarageForm;
