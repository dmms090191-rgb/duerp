import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Home, Users, ClipboardCheck, FileText, TrendingUp, LogOut, Check, Printer, Download, Shield, CheckCircle2, Lightbulb, Target, BookOpen, Plus, ChevronUp, ChevronDown, AlertTriangle, X, HelpCircle, Menu, Clock, AlertCircle, MessageSquare, XCircle, RotateCcw, Wrench, Calendar, FileDown, Loader2, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DuerpQuestion, DuerpMeasure } from '../data/duerpQuestions';
import { getCategoriesForSector } from '../data/sectorQuestions';
import { generateDuerpReportPDF } from '../services/duerpReportPdfService';
import PdfPreviewModal from './PdfPreviewModal';

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
        text: 'Rapport',
        description: 'Maintenant que vous avez fini d\'identifier tous les risques dans votre organisation et créé un plan d\'action, vous pouvez éditer un rapport qui répertorie tous vos résultats ainsi qu\'un plan d\'action. Vous pouvez, si vous le voulez, ajouter ci-dessous des commentaires supplémentaires qui seront inclus dans ce rapport. Vous pouvez également télécharger ce rapport et l\'enregistrer sur votre ordinateur. Vous pourrez ainsi le personnaliser, le compléter et le modifier comme vous le souhaitez.'
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
  const duerpCategories = useMemo(() => getCategoriesForSector(typeDiagnostic), [typeDiagnostic]);
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
  const [expandedSidebarCategories, setExpandedSidebarCategories] = useState<Record<number, boolean>>({});
  const [showStandardMeasuresModal, setShowStandardMeasuresModal] = useState(false);
  const [showCustomMeasureModal, setShowCustomMeasureModal] = useState(false);
  const [viewMode, setViewMode] = useState<'question' | 'category'>('question');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [customRisks, setCustomRisks] = useState<Array<{
    id: string;
    title: string;
    measures: string[];
    information: string;
    informationImage: string | null;
    remarks: string;
    riskStatus: 'oui' | 'non' | null;
    actionMeasures: Array<{
      id: string;
      description: string;
      expertise: string;
      responsible: string;
      budget: string;
      startDate: string;
      endDate: string;
    }>;
  }>>([]);
  const [showCustomRiskForm, setShowCustomRiskForm] = useState(false);
  const [diagnosticStartDate, setDiagnosticStartDate] = useState<string | null>(null);
  const [showFinirConfirmation, setShowFinirConfirmation] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const questionContainerRef = useRef<HTMLDivElement>(null);

  const currentSection = diagnosticSections[currentSectionIndex];
  const currentQuestion = currentSection.questions[currentQuestionIndex];
  const totalSections = diagnosticSections.length;
  const totalQuestionsInSection = currentSection.questions.length;

  useEffect(() => {
    loadResponses();
    loadDuerpResponses();
  }, [clientId]);

  // Scroll automatiquement vers le conteneur de la question à chaque changement
  useEffect(() => {
    if (questionContainerRef.current) {
      questionContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentQuestionIndex, currentSectionIndex]);

  // Passer automatiquement à la catégorie suivante quand la catégorie actuelle est complétée
  useEffect(() => {
    const activeCategoryIndex = getActiveCategory();
    if (activeCategoryIndex !== selectedDuerpCategory && isCategoryCompleted(selectedDuerpCategory)) {
      setSelectedDuerpCategory(activeCategoryIndex);
      setSelectedDuerpQuestion(0);
      const cat = duerpCategories[activeCategoryIndex];
      if (cat?.questions[0]?.isYesNoOnly) {
        setViewMode('question');
      } else if (cat?.defaultDescription && cat?.questions.length > 0) {
        setViewMode('category');
      } else {
        setViewMode('question');
      }
    }
  }, [duerpResponses]);

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
    console.log('🔄 Chargement des réponses DUERP pour client:', clientId, 'type:', typeDiagnostic);
    try {
      const { data, error } = await supabase
        .from('duerp_evaluation_responses')
        .select('*')
        .eq('client_id', clientId)
        .eq('type_diagnostic', typeDiagnostic);

      if (error) throw error;

      const { data: firstResp } = await supabase
        .from('duerp_evaluation_responses')
        .select('created_at')
        .eq('client_id', clientId)
        .eq('type_diagnostic', typeDiagnostic)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (firstResp?.created_at) {
        setDiagnosticStartDate(new Date(firstResp.created_at).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }));
      }

      console.log('📥 Réponses DUERP chargées:', data?.length, 'enregistrements');

      if (data) {
        const responsesMap: Record<string, DuerpResponse> = {};
        const loadedCustomRisks: typeof customRisks = [];

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

          // Charger les risques personnalisés
          if (item.category === 'risques_personnalises' && item.custom_risk_title) {
            loadedCustomRisks.push({
              id: item.question_id,
              title: item.custom_risk_title,
              measures: item.selected_measures || [],
              information: item.custom_risk_information || '',
              informationImage: null,
              remarks: item.remarks || '',
              riskStatus: item.risk_status === 'maitrise' ? 'oui' : item.risk_status === 'non_maitrise' ? 'non' : null,
              actionMeasures: actionPlanMeasures.map(m => ({
                id: m.id || `action_${Date.now()}`,
                description: m.description || m.text || '',
                expertise: m.expertise || '',
                responsible: m.responsible || '',
                budget: m.budget || '',
                startDate: m.startDate || '',
                endDate: m.endDate || ''
              }))
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
          console.log('  ✓ Question', item.question_id, '- Mesures:', item.selected_measures?.length || 0, 'Statut:', item.risk_status);
        });

        setDuerpResponses(responsesMap);

        // Charger les risques personnalisés
        if (loadedCustomRisks.length > 0) {
          setCustomRisks(loadedCustomRisks);
          setShowCustomRiskForm(true);
          console.log('✅ Chargé', loadedCustomRisks.length, 'risques personnalisés');
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des réponses DUERP:', error);
    }
  };

  const saveDuerpResponseData = async (
    questionId: string,
    categoryId: string,
    responseData: {
      selectedMeasures: string[];
      customMeasures: string[];
      riskStatus: 'maitrise' | 'non_maitrise' | 'non_applicable' | null;
      actionPlanMeasures: ActionPlanMeasure[];
      riskPriority: 'faible' | 'moyenne' | 'elevee' | null;
      remarks: string;
    }
  ) => {
    console.log('📝 saveDuerpResponseData - Question:', questionId, 'Category:', categoryId);
    console.log('📝 Data to save:', responseData);

    try {
      const { data: existing, error: selectError } = await supabase
        .from('duerp_evaluation_responses')
        .select('id')
        .eq('client_id', clientId)
        .eq('type_diagnostic', typeDiagnostic)
        .eq('question_id', questionId)
        .maybeSingle();

      if (selectError) {
        console.error('❌ Erreur lors de la recherche DUERP:', selectError);
        return;
      }

      if (existing) {
        console.log('🔄 Mise à jour de l\'enregistrement existant ID:', existing.id);
        const { error: updateError } = await supabase
          .from('duerp_evaluation_responses')
          .update({
            selected_measures: responseData.selectedMeasures,
            custom_measures: responseData.customMeasures,
            risk_status: responseData.riskStatus,
            action_plan_measures: responseData.actionPlanMeasures,
            risk_priority: responseData.riskPriority,
            remarks: responseData.remarks,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour DUERP:', updateError);
        } else {
          console.log('✅ Mise à jour réussie pour', questionId);
        }
      } else {
        console.log('➕ Création d\'un nouvel enregistrement');
        const { error: insertError } = await supabase
          .from('duerp_evaluation_responses')
          .insert({
            client_id: parseInt(clientId),
            type_diagnostic: typeDiagnostic,
            category: categoryId,
            question_id: questionId,
            selected_measures: responseData.selectedMeasures,
            custom_measures: responseData.customMeasures,
            risk_status: responseData.riskStatus,
            action_plan_measures: responseData.actionPlanMeasures,
            risk_priority: responseData.riskPriority,
            remarks: responseData.remarks
          });

        if (insertError) {
          console.error('❌ Erreur lors de l\'insertion DUERP:', insertError);
        } else {
          console.log('✅ Insertion réussie pour', questionId);
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde DUERP:', error);
    }
  };

  const saveDuerpResponse = async (questionId: string, categoryId: string) => {
    const response = duerpResponses[questionId] || {
      selectedMeasures: [],
      customMeasures: [],
      riskStatus: null,
      actionPlanMeasures: [],
      riskPriority: null,
      remarks: ''
    };
    await saveDuerpResponseData(questionId, categoryId, response);
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

      console.log('toggleMeasure - Question:', questionId, 'Measure:', measureId, 'New measures:', newResponse.selectedMeasures);
      setTimeout(() => saveDuerpResponseData(questionId, categoryId, newResponse), 100);

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

      setTimeout(() => saveDuerpResponseData(questionId, categoryId, newResponse), 100);

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

      setTimeout(() => saveDuerpResponseData(questionId, categoryId, newResponse), 100);

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

      setTimeout(() => saveDuerpResponseData(questionId, categoryId, newResponse), 100);

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

      setTimeout(() => saveDuerpResponseData(questionId, categoryId, newResponse), 500);

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

      setTimeout(() => saveDuerpResponseData(questionId, categoryId, newResponse), 100);

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

      setTimeout(() => saveDuerpResponseData(questionId, categoryId, newResponse), 100);

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

      setTimeout(() => saveDuerpResponseData(questionId, categoryId, newResponse), 500);

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

  const isCategoryCompleted = (categoryIndex: number): boolean => {
    const category = duerpCategories[categoryIndex];
    return category.questions.every(question => isQuestionAnswered(question.id));
  };

  const getActiveCategory = (): number => {
    for (let i = 0; i < duerpCategories.length; i++) {
      if (!isCategoryCompleted(i)) {
        return i;
      }
    }
    return duerpCategories.length - 1;
  };

  // Fonction pour sauvegarder un risque personnalisé
  const saveCustomRisk = async (risk: typeof customRisks[0]) => {
    try {
      console.log('💾 Sauvegarde du risque personnalisé:', risk);

      const responseData = {
        selectedMeasures: risk.measures,
        customMeasures: [],
        riskStatus: risk.riskStatus === 'oui' ? 'maitrise' as const : risk.riskStatus === 'non' ? 'non_maitrise' as const : null,
        actionPlanMeasures: risk.actionMeasures.map(measure => ({
          description: measure.description,
          expertise: measure.expertise,
          responsible: measure.responsible,
          budget: measure.budget,
          startDate: measure.startDate,
          endDate: measure.endDate
        })),
        riskPriority: null,
        remarks: risk.remarks
      };

      const { data: existing, error: selectError } = await supabase
        .from('duerp_evaluation_responses')
        .select('id')
        .eq('client_id', clientId)
        .eq('type_diagnostic', typeDiagnostic)
        .eq('question_id', risk.id)
        .maybeSingle();

      if (selectError) {
        console.error('❌ Erreur lors de la recherche du risque personnalisé:', selectError);
        return false;
      }

      if (existing) {
        console.log('🔄 Mise à jour du risque personnalisé existant ID:', existing.id);
        const { error: updateError } = await supabase
          .from('duerp_evaluation_responses')
          .update({
            selected_measures: responseData.selectedMeasures,
            custom_measures: responseData.customMeasures,
            risk_status: responseData.riskStatus,
            action_plan_measures: responseData.actionPlanMeasures,
            risk_priority: responseData.riskPriority,
            remarks: responseData.remarks,
            custom_risk_title: risk.title,
            custom_risk_information: risk.information,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour du risque personnalisé:', updateError);
          return false;
        }
        console.log('✅ Mise à jour réussie du risque personnalisé');
      } else {
        console.log('➕ Création d\'un nouveau risque personnalisé');
        const { error: insertError } = await supabase
          .from('duerp_evaluation_responses')
          .insert({
            client_id: parseInt(clientId),
            type_diagnostic: typeDiagnostic,
            category: 'risques_personnalises',
            question_id: risk.id,
            selected_measures: responseData.selectedMeasures,
            custom_measures: responseData.customMeasures,
            risk_status: responseData.riskStatus,
            action_plan_measures: responseData.actionPlanMeasures,
            risk_priority: responseData.riskPriority,
            remarks: responseData.remarks,
            custom_risk_title: risk.title,
            custom_risk_information: risk.information
          });

        if (insertError) {
          console.error('❌ Erreur lors de l\'insertion du risque personnalisé:', insertError);
          return false;
        }
        console.log('✅ Insertion réussie du risque personnalisé');
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du risque personnalisé:', error);
      return false;
    }
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

      <div ref={questionContainerRef} className="flex-1 flex flex-col bg-gray-50 min-h-0">
        {currentQuestion.id === 'resume_1' ? (
          <>
            <div className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 lg:p-12">
                  <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
                    <div className="flex-shrink-0 mx-auto lg:mx-0">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-lg">
                        <img
                          src={`/${typeDiagnostic?.split(' ').slice(1).join('_').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]/g, '_')}.png`}
                          alt={typeDiagnostic?.split(' ').slice(1).join(' ') || 'Secteur'}
                          className="w-32 h-32 sm:w-48 sm:h-48 object-contain"
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
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">
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
        ) : currentQuestion.id === 'prep_1' ? (
          <>
            <div className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50/30">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
                  Préparation
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm">
                  <div className="flex items-start gap-3 mb-5">
                    <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      Attention : Mise à jour de l'outil
                    </h3>
                  </div>

                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p className="text-sm sm:text-base">
                      <span className="font-semibold text-gray-900">Octobre 2025</span> : l'outil OiRA Garages automobiles et poids lourds vient d'être mis à jour. Nous conseillons de vérifier les contenus des évaluations existantes. Des modifications ont pu intervenir dans son contenu.
                    </p>

                    <div className="h-px bg-blue-200"></div>

                    <p className="text-sm sm:text-base">
                      <span className="font-semibold text-gray-900">Juin 2024</span> : OiRA Garages automobiles et poids lourds a été mis à jour. Cette mise à jour peut avoir un impact sur les contenus de vos précédentes évaluations. Si vous souhaitez ouvrir une ancienne évaluation, vous pouvez retrouver la précédente version d'OiRA Garages automobiles et poids lourds.
                    </p>

                    <div className="h-px bg-blue-200"></div>

                    <p className="text-sm sm:text-base">
                      <span className="font-semibold text-gray-900">Information navigateur</span> : Des dysfonctionnements d'OiRA ont été observés lors de l'utilisation de certains navigateurs. Nous vous encourageons à utiliser Chrome ou Edge pour bénéficier de l'ensemble des fonctionnalités d'OiRA. Nos équipes techniques sont en cours de traitement de ce problème, merci de votre compréhension.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 lg:p-5 bg-white border-t-2 border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Section {currentSectionIndex + 1} / {totalSections} - Question {currentQuestionIndex + 1} / {totalQuestionsInSection}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center w-full sm:w-auto">
                <button
                  onClick={handleNext}
                  disabled={saving || (currentSectionIndex === totalSections - 1 && currentQuestionIndex === totalQuestionsInSection - 1)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 bg-[#0066cc] text-white rounded-xl hover:bg-[#0052a3] transition-all duration-300 font-bold text-sm sm:text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
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
                      <div className="absolute top-0 right-0 w-24 h-24 sm:w-48 sm:h-48 bg-white/10 rounded-full -mr-12 -mt-12 sm:-mr-24 sm:-mt-24"></div>
                      <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-36 sm:h-36 bg-white/10 rounded-full -ml-10 -mb-10 sm:-ml-18 sm:-mb-18"></div>
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
        ) : currentQuestion.id === 'avanc_1' ? (
          <>
            <div className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ff_1px,transparent_1px),linear-gradient(to_bottom,#0ff_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.02]"></div>
              <div className="absolute top-0 left-0 w-48 h-48 sm:w-96 sm:h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

              <div className="max-w-7xl mx-auto relative z-10">
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

                <div className="mb-10 text-center">
                  <div className="inline-block mb-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                    <h2 className="relative text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent px-4 sm:px-8 py-3 sm:py-4">
                      {currentQuestion.text}
                    </h2>
                  </div>
                  <p className="text-cyan-200/80 leading-relaxed text-lg max-w-3xl mx-auto">
                    {currentQuestion.description}
                  </p>
                </div>

                <div className="mb-10">
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
                            <div className="font-black text-cyan-400 text-xs sm:text-xs tracking-wider mb-1">OUTIL UTILISE</div>
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
                            <div className="font-black text-emerald-400 text-xs sm:text-xs tracking-wider mb-1">COMMENCE LE</div>
                            <div className="text-lg sm:text-xl lg:text-2xl font-black text-white leading-tight">
                              {diagnosticStartDate || 'Pas encore commencé'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {(() => {
                    const progressByCategory = duerpCategories.map(category => {
                      const questionIds = category.questions.map(q => q.id);
                      const categoryResponses = questionIds
                        .filter(qId => duerpResponses[qId])
                        .map(qId => duerpResponses[qId]);

                      let pasDerRisque = 0;
                      let risqueAvecMesure = 0;
                      let risqueHautementPrioritaire = 0;
                      let nonApplicable = 0;

                      categoryResponses.forEach(response => {
                        if (response.riskStatus === 'maitrise') {
                          const hasMeasures = (response.selectedMeasures?.length > 0 || response.customMeasures?.length > 0);
                          if (hasMeasures) {
                            risqueAvecMesure++;
                          } else {
                            pasDerRisque++;
                          }
                        } else if (response.riskStatus === 'non_applicable') {
                          nonApplicable++;
                        } else if (response.riskStatus === 'non_maitrise') {
                          risqueHautementPrioritaire++;
                        }
                      });

                      return {
                        categoryId: category.id,
                        categoryLabel: category.label,
                        totalQuestions: category.questions.length,
                        pasDerRisque,
                        risqueAvecMesure,
                        risqueHautementPrioritaire,
                        nonApplicable
                      };
                    });

                    return progressByCategory.map((category, idx) => {
                      const total = category.pasDerRisque + category.risqueAvecMesure + category.risqueHautementPrioritaire + category.nonApplicable;
                      const completionPercentage = ((total / category.totalQuestions) * 100).toFixed(0);

                      return (
                        <div
                          key={category.categoryId}
                          className="relative group"
                          style={{ animationDelay: `${idx * 100}ms` }}
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
                                      {category.categoryLabel}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-cyan-300/70 font-medium mt-1">
                                      Compartiment #{idx + 1}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                                    {completionPercentage}%
                                  </div>
                                  <p className="text-xs text-cyan-300/70 font-medium mt-1 whitespace-nowrap">
                                    {total} / {category.totalQuestions}
                                  </p>
                                </div>
                              </div>

                              <div className="relative mb-6">
                                <div className="h-16 sm:h-20 bg-slate-950/60 rounded-xl overflow-hidden flex items-center shadow-inner border border-slate-700/50">
                                  {category.pasDerRisque > 0 && (
                                    <div
                                      className="h-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center text-white font-black text-sm sm:text-base transition-all duration-700 hover:from-emerald-400 hover:to-green-400 relative group/bar shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                                      style={{ width: `${(category.pasDerRisque / category.totalQuestions) * 100}%` }}
                                      title="Pas de risque"
                                    >
                                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                                      <span className="relative z-10 drop-shadow-lg">{category.pasDerRisque}</span>
                                    </div>
                                  )}
                                  {category.risqueAvecMesure > 0 && (
                                    <div
                                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-black text-sm sm:text-base transition-all duration-700 hover:from-amber-400 hover:to-orange-400 relative group/bar shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                                      style={{ width: `${(category.risqueAvecMesure / category.totalQuestions) * 100}%` }}
                                      title="Risque avec mesure(s)"
                                    >
                                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                                      <span className="relative z-10 drop-shadow-lg">{category.risqueAvecMesure}</span>
                                    </div>
                                  )}
                                  {category.risqueHautementPrioritaire > 0 && (
                                    <div
                                      className="h-full bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center text-white font-black text-sm sm:text-base transition-all duration-700 hover:from-red-400 hover:to-rose-500 relative group/bar shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                                      style={{ width: `${(category.risqueHautementPrioritaire / category.totalQuestions) * 100}%` }}
                                      title="Risque hautement prioritaire"
                                    >
                                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                                      <span className="relative z-10 drop-shadow-lg">{category.risqueHautementPrioritaire}</span>
                                    </div>
                                  )}
                                  {category.nonApplicable > 0 && (
                                    <div
                                      className="h-full bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center text-white font-black text-sm sm:text-base transition-all duration-700 relative group/bar shadow-[0_0_20px_rgba(71,85,105,0.3)]"
                                      style={{ width: `${(category.nonApplicable / category.totalQuestions) * 100}%` }}
                                      title="Non applicable"
                                    >
                                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                                      <span className="relative z-10 drop-shadow-lg">{category.nonApplicable}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="relative group/card overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 p-3 sm:p-4 hover:border-emerald-400/50 transition-all duration-300">
                                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                                  <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/50 flex-shrink-0">
                                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-black text-emerald-400 text-xs sm:text-xs mb-0.5 sm:mb-1 leading-tight">PAS DE RISQUE</div>
                                      <div className="text-xl sm:text-2xl font-black text-white">{category.pasDerRisque}</div>
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
                                      <div className="font-black text-amber-400 text-xs sm:text-xs mb-0.5 sm:mb-1 leading-tight">AVEC MESURES</div>
                                      <div className="text-xl sm:text-2xl font-black text-white">{category.risqueAvecMesure}</div>
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
                                      <div className="font-black text-red-400 text-xs sm:text-xs mb-0.5 sm:mb-1 leading-tight">PRIORITAIRE</div>
                                      <div className="text-xl sm:text-2xl font-black text-white">{category.risqueHautementPrioritaire}</div>
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
                                      <div className="font-black text-slate-400 text-xs sm:text-xs mb-0.5 sm:mb-1 leading-tight">NON APPLICABLE</div>
                                      <div className="text-xl sm:text-2xl font-black text-white">{category.nonApplicable}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            <div className="relative p-4 sm:p-5 lg:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ff_1px,transparent_1px),linear-gradient(to_bottom,#0ff_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03]"></div>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>

              <div className="relative text-xs sm:text-sm font-bold text-cyan-300/90 text-center sm:text-left bg-slate-950/50 px-4 py-2 rounded-lg border border-cyan-500/20">
                SECTION {currentSectionIndex + 1} / {totalSections} - QUESTION {currentQuestionIndex + 1} / {totalQuestionsInSection}
              </div>

              <div className="relative flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
                {saveSuccess && (
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-xs sm:text-sm animate-fade-in bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/30">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>SESSION ENREGISTRÉE</span>
                  </div>
                )}
                <button
                  onClick={handleSaveSession}
                  disabled={saving}
                  className="relative group w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-500 hover:to-green-500 transition-all duration-300 font-black text-sm sm:text-base shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-400/50 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                  <span className="relative z-10">{saving ? 'ENREGISTREMENT...' : 'ENREGISTRER'}</span>
                </button>
                <button
                  onClick={handleNext}
                  disabled={saving || (currentSectionIndex === totalSections - 1 && currentQuestionIndex === totalQuestionsInSection - 1)}
                  className="relative group w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 font-black text-sm sm:text-base shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed border border-cyan-400/50 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  <span className="relative z-10">{saving ? 'SAUVEGARDE...' : 'SUIVANT'}</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
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
                w-72 sm:w-80 lg:w-80 bg-white/30 backdrop-blur-2xl border-r border-white/20 overflow-y-auto
                transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              `}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-cyan-50/40 pointer-events-none"></div>

                <div className="relative p-4">
                  <div className="relative bg-white/40 backdrop-blur-xl rounded-2xl p-4 mb-6 border border-white/30 shadow-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0066cc]/10 via-transparent to-cyan-500/10"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-3xl"></div>

                    <div className="relative flex items-center gap-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-[#0066cc] via-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-white/50">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-800 tracking-tight">Questions DUERP</h3>
                        <p className="text-xs text-[#0066cc] font-semibold">Compartiment actuel</p>
                      </div>
                    </div>
                  </div>

                  {duerpCategories && duerpCategories.length > 0 && (() => {
                    const activeCategoryIndex = selectedDuerpCategory;
                    const activeCategory = duerpCategories[activeCategoryIndex];

                    if (!activeCategory) return null;

                    const parentCategory = activeCategory.parentGateQuestionId
                      ? duerpCategories.find(c => c.questions.some(q => q.id === activeCategory.parentGateQuestionId))
                      : activeCategory;

                    if (!parentCategory) return null;

                    const parentIndex = duerpCategories.indexOf(parentCategory);
                    const hasGate = parentCategory.questions[0]?.isYesNoOnly;
                    const gateQuestionId = hasGate ? parentCategory.questions[0].id : null;
                    const gateAnsweredOui = gateQuestionId && duerpResponses[gateQuestionId]?.riskStatus === 'oui';

                    const childCategories = gateQuestionId
                      ? duerpCategories
                          .map((c, i) => ({ cat: c, idx: i }))
                          .filter(({ cat }) => cat.parentGateQuestionId === gateQuestionId)
                      : [];

                    const renderCategoryButton = (cat: typeof activeCategory, catIdx: number, isChild: boolean) => {
                      const isActiveCategory = selectedDuerpCategory === catIdx;
                      const isSidebarExpanded = expandedSidebarCategories[catIdx] ?? false;
                      const catHasGate = cat.questions[0]?.isYesNoOnly;
                      const catGateAnswered = catHasGate && duerpResponses[cat.questions[0].id]?.riskStatus === 'oui';
                      const subQuestionsAfterGate = catHasGate ? cat.questions.slice(1) : [];
                      const hasExpandableQuestions = (isChild && cat.questions.length > 0 && !catHasGate) || (catGateAnswered && subQuestionsAfterGate.length > 0) || (cat.defaultDescription && cat.questions.length > 0 && !catHasGate);
                      return (
                        <div key={cat.id} className={`mb-3 ${isChild ? 'ml-4' : ''}`}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedDuerpCategory(catIdx);
                                if (cat.questions[0]?.isYesNoOnly) {
                                  setSelectedDuerpQuestion(0);
                                  setViewMode('question');
                                } else if (cat.defaultDescription && cat.questions.length > 0) {
                                  setViewMode('category');
                                } else if (cat.questions.length > 0) {
                                  setSelectedDuerpQuestion(0);
                                  setViewMode('question');
                                } else {
                                  setViewMode('category');
                                }
                                if (hasExpandableQuestions) {
                                  setExpandedSidebarCategories(prev => ({ ...prev, [catIdx]: true }));
                                }
                                setIsSidebarOpen(false);
                              }}
                              className={`group relative flex-1 flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 overflow-hidden ${
                                isActiveCategory
                                  ? 'bg-gradient-to-r from-[#0066cc] to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                                  : 'bg-white/50 backdrop-blur-sm hover:bg-white/70 border border-white/40 hover:border-[#0066cc]/30 hover:shadow-lg'
                              }`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>

                              <div className={`relative flex-shrink-0 ${isChild ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm'} rounded-lg flex items-center justify-center font-black shadow-md ${
                                isActiveCategory
                                  ? 'bg-white/30 text-white backdrop-blur-md ring-2 ring-white/50'
                                  : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 group-hover:from-[#0066cc]/20 group-hover:to-cyan-500/20 group-hover:text-[#0066cc]'
                              }`}>
                                {cat.displayNumber || (catIdx + 1)}
                              </div>

                              <h4 className={`relative text-sm font-bold leading-tight flex-1 text-left ${
                                isActiveCategory ? 'text-white' : 'text-gray-800 group-hover:text-[#0066cc]'
                              }`}>
                                {cat.label}
                              </h4>
                              {hasExpandableQuestions && (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedSidebarCategories(prev => ({ ...prev, [catIdx]: !prev[catIdx] }));
                                  }}
                                  className={`relative flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                    isActiveCategory
                                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isSidebarExpanded ? 'rotate-180' : ''}`} />
                                </div>
                              )}
                            </button>
                          </div>
                          {isSidebarExpanded && hasExpandableQuestions && (
                            <div className="ml-2 mt-2 space-y-2">
                              {(catHasGate ? cat.questions.slice(1) : cat.questions).map((question, filteredIndex) => {
                                const qIndex = catHasGate ? filteredIndex + 1 : filteredIndex;
                                const isActive = selectedDuerpCategory === catIdx && selectedDuerpQuestion === qIndex;
                                const isAnswered = isQuestionAnswered(question.id);
                                const isIncomplete = isQuestionIncomplete(question.id);
                                const isPartial = isQuestionPartial(question.id);

                                return (
                                  <button
                                    key={question.id}
                                    onClick={() => {
                                      setSelectedDuerpCategory(catIdx);
                                      setSelectedDuerpQuestion(qIndex);
                                      setViewMode('question');
                                      setIsSidebarOpen(false);
                                    }}
                                    className={`group relative w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 overflow-hidden ${
                                      isActive && viewMode === 'question'
                                        ? 'bg-gradient-to-r from-[#0066cc] via-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02] border border-white/30'
                                        : 'text-gray-700 hover:bg-white/60 bg-white/30 backdrop-blur-sm border border-white/30 hover:border-[#0066cc]/40 hover:shadow-lg'
                                    }`}
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>

                                    <div className="relative flex items-start gap-3">
                                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-md ${
                                        isActive && viewMode === 'question'
                                          ? 'bg-white/30 text-white backdrop-blur-md ring-2 ring-white/50'
                                          : 'bg-gradient-to-br from-gray-100/80 to-gray-200/80 text-gray-700 group-hover:from-[#0066cc]/20 group-hover:to-cyan-500/20 group-hover:text-[#0066cc] backdrop-blur-sm'
                                      }`}>
                                        {question.displayNumber || `${catIdx + 1}.${qIndex + 1}`}
                                      </div>

                                      <div className="flex-1">
                                        <p className={`font-semibold leading-snug mb-1.5 ${
                                          isActive && viewMode === 'question' ? 'text-white' : 'text-gray-800 group-hover:text-gray-900'
                                        }`}>
                                          {question.text}
                                        </p>

                                        <div className="flex items-center gap-2 flex-wrap">
                                          {isAnswered && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/20 backdrop-blur-sm text-green-700 rounded-lg border border-green-500/30">
                                              <CheckCircle2 className="w-3.5 h-3.5" />
                                              <span className="text-xs font-bold">Répondu</span>
                                            </div>
                                          )}
                                          {isIncomplete && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-500/20 backdrop-blur-sm text-orange-600 rounded-lg border border-orange-500/30">
                                              <HelpCircle className="w-3.5 h-3.5" />
                                              <span className="text-xs font-bold">Incomplet</span>
                                            </div>
                                          )}
                                          {isPartial && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/20 backdrop-blur-sm text-blue-600 rounded-lg border border-blue-500/30">
                                              <Clock className="w-3.5 h-3.5" />
                                              <span className="text-xs font-bold">Partiel</span>
                                            </div>
                                          )}
                                          {!isAnswered && !isIncomplete && !isPartial && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-500/20 backdrop-blur-sm text-gray-600 rounded-lg border border-gray-500/30">
                                              <AlertCircle className="w-3.5 h-3.5" />
                                              <span className="text-xs font-bold">A faire</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    };

                    return (
                      <div className="mb-5">
                        {renderCategoryButton(parentCategory, parentIndex, false)}
                        {gateAnsweredOui && childCategories.map(({ cat, idx }) => renderCategoryButton(cat, idx, true))}
                      </div>
                    );
                  })()}

                  {customRisks.length > 0 && (
                    <div className="mb-5">
                      <div className="space-y-2">
                        {customRisks.map((risk, index) => (
                          <button
                            key={risk.id}
                            onClick={() => {
                              const risquesPersoCatIndex = duerpCategories.findIndex(cat => cat.id === 'risques_personnalises');
                              if (risquesPersoCatIndex !== -1) {
                                setSelectedDuerpCategory(risquesPersoCatIndex);
                                setViewMode('category');
                                setIsSidebarOpen(false);
                                setTimeout(() => {
                                  const riskElement = document.getElementById(`risk-${risk.id}`);
                                  if (riskElement) {
                                    riskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }
                                }, 100);
                              }
                            }}
                            className="group relative w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 overflow-hidden text-gray-700 hover:bg-white/60 bg-white/30 backdrop-blur-sm border border-white/30 hover:border-[#0066cc]/40 hover:shadow-lg"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>

                            <div className="relative flex items-start gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-md bg-gradient-to-br from-gray-100/80 to-gray-200/80 text-gray-700 group-hover:from-[#0066cc]/20 group-hover:to-cyan-500/20 group-hover:text-[#0066cc] backdrop-blur-sm">
                                Q.{index + 1}
                              </div>

                              <div className="flex-1">
                                <p className="font-semibold leading-snug text-gray-800 group-hover:text-gray-900">
                                  {risk.title || `Risque personnalisé ${index + 1}`}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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

                <div className="p-3 sm:p-4 md:p-6 lg:p-8 min-h-screen">
                {duerpCategories && duerpCategories.length > 0 && (
                  <>
                    <div className="max-w-5xl mx-auto mb-4">
                      <div className="flex items-center justify-between gap-2 sm:gap-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-3 sm:p-4 shadow-lg border-2 border-gray-200">
                        <button
                          onClick={() => {
                            let prevIdx = selectedDuerpCategory - 1;
                            while (prevIdx >= 0) {
                              const prevCat = duerpCategories[prevIdx];
                              if (prevCat.parentGateQuestionId && duerpResponses[prevCat.parentGateQuestionId]?.riskStatus !== 'oui') {
                                prevIdx--;
                              } else {
                                break;
                              }
                            }
                            if (prevIdx >= 0) {
                              setSelectedDuerpCategory(prevIdx);
                              setSelectedDuerpQuestion(0);
                              const cat = duerpCategories[prevIdx];
                              if (cat.questions[0]?.isYesNoOnly) {
                                setViewMode('question');
                              } else if (cat.defaultDescription && cat.questions.length > 0) {
                                setViewMode('category');
                              } else if (cat.questions.length > 0) {
                                setViewMode('question');
                              } else {
                                setViewMode('category');
                              }
                            }
                          }}
                          disabled={selectedDuerpCategory === 0}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                            selectedDuerpCategory === 0
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-[#0066cc] to-blue-600 text-white hover:shadow-xl hover:scale-105'
                          }`}
                        >
                          <ChevronLeft className="w-5 h-5" />
                          <span className="hidden sm:inline">Compartiment précédent</span>
                          <span className="sm:hidden">Précédent</span>
                        </button>

                        <div className="flex-1 text-center">
                          <div className="text-sm font-bold text-gray-600">
                            Compartiment {duerpCategories[selectedDuerpCategory]?.displayNumber || (selectedDuerpCategory + 1)} / {duerpCategories.length}
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-[#0066cc] truncate">
                            {duerpCategories[selectedDuerpCategory]?.label}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            let nextIdx = selectedDuerpCategory + 1;
                            while (nextIdx < duerpCategories.length) {
                              const nextCat = duerpCategories[nextIdx];
                              if (nextCat.parentGateQuestionId && duerpResponses[nextCat.parentGateQuestionId]?.riskStatus !== 'oui') {
                                nextIdx++;
                              } else {
                                break;
                              }
                            }
                            if (nextIdx < duerpCategories.length) {
                              setSelectedDuerpCategory(nextIdx);
                              setSelectedDuerpQuestion(0);
                              const cat = duerpCategories[nextIdx];
                              if (cat.questions[0]?.isYesNoOnly) {
                                setViewMode('question');
                              } else if (cat.defaultDescription && cat.questions.length > 0) {
                                setViewMode('category');
                              } else if (cat.questions.length > 0) {
                                setViewMode('question');
                              } else {
                                setViewMode('category');
                              }
                            }
                          }}
                          disabled={selectedDuerpCategory === duerpCategories.length - 1}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                            selectedDuerpCategory === duerpCategories.length - 1
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-[#0066cc] to-blue-600 text-white hover:shadow-xl hover:scale-105'
                          }`}
                        >
                          <span className="hidden sm:inline">Compartiment suivant</span>
                          <span className="sm:hidden">Suivant</span>
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                  </>
                )}

                {!duerpCategories || duerpCategories.length === 0 ? (
                  <div className="max-w-5xl mx-auto min-h-[300px] sm:min-h-[600px]">
                    <div className="bg-red-50 rounded-2xl p-8 border-l-4 border-red-500">
                      <h2 className="text-2xl font-bold text-red-900 mb-2">
                        Erreur de chargement
                      </h2>
                      <p className="text-red-700">
                        Les questions DUERP n'ont pas pu être chargées. Veuillez rafraîchir la page.
                      </p>
                    </div>
                  </div>
                ) : viewMode === 'category' ? (
                  <div className="max-w-5xl mx-auto min-h-[300px] sm:min-h-[600px]">
                    {duerpCategories[selectedDuerpCategory]?.id === 'risques_personnalises' ? (
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 border-l-4 sm:border-l-8 border-[#0066cc] shadow-lg">
                        <div className="flex items-start justify-between mb-4">
                          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                            Risques personnalisés
                          </h2>
                        </div>

                        <p className="text-sm text-gray-700 mb-4">
                          Si vous avez identifié des risques qui ne sont pas abordés par l'outil, vous pouvez les ajouter ici.
                        </p>

                        {!showCustomRiskForm ? (
                          <div className="flex flex-col items-center justify-center py-8 gap-4">
                            <button
                              onClick={() => {
                                const newRiskId = `custom_risk_${Date.now()}`;
                                setCustomRisks([...customRisks, {
                                  id: newRiskId,
                                  title: '',
                                  measures: [],
                                  information: '',
                                  informationImage: null,
                                  remarks: '',
                                  riskStatus: null,
                                  actionMeasures: []
                                }]);
                                setShowCustomRiskForm(true);

                                // Scroll to the new risk form after a short delay
                                setTimeout(() => {
                                  const newRiskElement = document.getElementById(`risk-${newRiskId}`);
                                  if (newRiskElement) {
                                    newRiskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }
                                }, 100);
                              }}
                              className="bg-[#0066cc] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0052a3] transition-colors"
                            >
                              Ajoutez un risque personnalisé
                            </button>

                            <div className="text-center">
                              <p className="text-sm text-gray-600 mb-3">ou</p>
                              <button
                                onClick={() => {
                                  // Passer directement au rapport (section suivante)
                                  if (currentSectionIndex < totalSections - 1) {
                                    setCurrentSectionIndex(currentSectionIndex + 1);
                                    setCurrentQuestionIndex(0);
                                  }
                                }}
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
                              >
                                <FileText className="w-5 h-5" />
                                Passer au rapport
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                const newRiskId = `custom_risk_${Date.now()}`;
                                setCustomRisks([...customRisks, {
                                  id: newRiskId,
                                  title: '',
                                  measures: [],
                                  information: '',
                                  informationImage: null,
                                  remarks: '',
                                  riskStatus: null,
                                  actionMeasures: []
                                }]);
                                setShowCustomRiskForm(true);

                                // Scroll to the new risk form after a short delay
                                setTimeout(() => {
                                  const newRiskElement = document.getElementById(`risk-${newRiskId}`);
                                  if (newRiskElement) {
                                    newRiskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }
                                }, 100);
                              }}
                              className="bg-[#0066cc] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0052a3] transition-colors mb-4"
                            >
                              Ajoutez un risque personnalisé
                            </button>
                          </>
                        )}

                        {customRisks.map((risk, index) => (
                          <div id={`risk-${risk.id}`} key={risk.id} className="mb-4">
                            <div className="bg-[#0066cc] rounded-t-xl p-3 flex items-center justify-between border-2 border-[#0066cc] border-b-0">
                              <label className="text-sm font-semibold text-white">Q.{index + 1} - Décrivez le risque</label>
                              <button
                                onClick={() => {
                                  setCustomRisks(customRisks.filter(r => r.id !== risk.id));
                                }}
                                className="relative group w-10 h-10 bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 shadow-lg hover:shadow-xl hover:scale-110 border-2 border-red-400/50 hover:border-red-300"
                              >
                                <div className="absolute inset-0 bg-gradient-to-tr from-red-400/0 via-red-300/30 to-red-200/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute inset-0 rounded-xl bg-red-500/20 blur-sm group-hover:blur-md transition-all duration-300"></div>
                                <X className="w-5 h-5 text-white relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
                              </button>
                            </div>

                            <div className="bg-white border-2 border-gray-300 rounded-b-xl p-4 border-t-0">
                            <input
                              type="text"
                              value={risk.title}
                              onChange={(e) => {
                                const updatedRisks = [...customRisks];
                                updatedRisks[index].title = e.target.value;
                                setCustomRisks(updatedRisks);
                              }}
                              placeholder="Décrivez le risque..."
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            />

                            <div className="mb-4">
                              <p className="text-sm text-gray-700 mb-2">Ajouter une autre mesure</p>
                              {risk.measures.map((measure, measureIndex) => (
                                <div key={measureIndex} className="flex items-center gap-2 mb-2">
                                  <input type="checkbox" className="w-4 h-4" />
                                  <input
                                    type="text"
                                    value={measure}
                                    onChange={(e) => {
                                      const updatedRisks = [...customRisks];
                                      updatedRisks[index].measures[measureIndex] = e.target.value;
                                      setCustomRisks(updatedRisks);
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Description de la mesure"
                                  />
                                  <button
                                    onClick={() => {
                                      const updatedRisks = [...customRisks];
                                      updatedRisks[index].measures.splice(measureIndex, 1);
                                      setCustomRisks(updatedRisks);
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const updatedRisks = [...customRisks];
                                  updatedRisks[index].measures.push('');
                                  setCustomRisks(updatedRisks);
                                }}
                                className="flex items-center gap-2 text-[#0066cc] hover:text-[#0052a3] font-medium mt-2"
                              >
                                <Plus className="w-4 h-4" />
                                Ajouter une autre mesure
                              </button>
                            </div>

                            <div className="mb-4">
                              <p className="text-sm text-gray-700 mb-2 font-semibold">Le risque est-il maîtrisé ?</p>
                              <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`risk_status_${risk.id}`}
                                    checked={risk.riskStatus === 'oui'}
                                    onChange={() => {
                                      const updatedRisks = [...customRisks];
                                      updatedRisks[index].riskStatus = 'oui';
                                      setCustomRisks(updatedRisks);
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-sm">Oui, les mesures en place sont suffisantes</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`risk_status_${risk.id}`}
                                    checked={risk.riskStatus === 'non'}
                                    onChange={() => {
                                      const updatedRisks = [...customRisks];
                                      updatedRisks[index].riskStatus = 'non';
                                      setCustomRisks(updatedRisks);
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-sm">Non, des mesures sont à ajouter au plan d'actions</span>
                                </label>
                              </div>
                            </div>

                            {risk.riskStatus === 'non' && (
                              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                <h3 className="text-base font-semibold text-[#0066cc] mb-2">Actions</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                  Décrivez les mesures spécifiques nécessaires pour prévenir le risque.
                                </p>

                                {risk.actionMeasures.map((measure, measureIndex) => (
                                  <div key={measure.id} className="bg-white rounded-lg p-4 mb-4 border-2 border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="font-semibold text-gray-700">Mesure additionnelle {measureIndex + 1}</h4>
                                      <div className="flex items-center gap-2">
                                        <label className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer">
                                          <input type="checkbox" className="w-4 h-4" />
                                          <span>Effacer cette mesure</span>
                                        </label>
                                        <button
                                          onClick={() => {
                                            const updatedRisks = [...customRisks];
                                            updatedRisks[index].actionMeasures.splice(measureIndex, 1);
                                            setCustomRisks(updatedRisks);
                                          }}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>

                                    <div className="space-y-3">
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <label className="text-sm font-medium text-gray-700">Description</label>
                                          <HelpCircle className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <input
                                          type="text"
                                          value={measure.description}
                                          onChange={(e) => {
                                            const updatedRisks = [...customRisks];
                                            updatedRisks[index].actionMeasures[measureIndex].description = e.target.value;
                                            setCustomRisks(updatedRisks);
                                          }}
                                          placeholder="Décrivez cette mesure"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                      </div>

                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <label className="text-sm font-medium text-gray-700">Expertise</label>
                                          <HelpCircle className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <textarea
                                          value={measure.expertise}
                                          onChange={(e) => {
                                            const updatedRisks = [...customRisks];
                                            updatedRisks[index].actionMeasures[measureIndex].expertise = e.target.value;
                                            setCustomRisks(updatedRisks);
                                          }}
                                          placeholder="Indiquez les compétences spécifiques nécessaires ou précisez quelle(s) fonction(s) de l'entreprise est (sont) à mobiliser."
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none h-20"
                                        />
                                      </div>

                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <label className="text-sm font-medium text-gray-700">Qui est responsable ?</label>
                                          <HelpCircle className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <input
                                          type="text"
                                          value={measure.responsible}
                                          onChange={(e) => {
                                            const updatedRisks = [...customRisks];
                                            updatedRisks[index].actionMeasures[measureIndex].responsible = e.target.value;
                                            setCustomRisks(updatedRisks);
                                          }}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                      </div>

                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <label className="text-sm font-medium text-gray-700">Budget</label>
                                          <HelpCircle className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <input
                                          type="text"
                                          value={measure.budget}
                                          onChange={(e) => {
                                            const updatedRisks = [...customRisks];
                                            updatedRisks[index].actionMeasures[measureIndex].budget = e.target.value;
                                            setCustomRisks(updatedRisks);
                                          }}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                          <label className="text-sm font-medium text-gray-700 block mb-1">
                                            Date de commencement prévue
                                          </label>
                                          <input
                                            type="date"
                                            value={measure.startDate}
                                            onChange={(e) => {
                                              const updatedRisks = [...customRisks];
                                              updatedRisks[index].actionMeasures[measureIndex].startDate = e.target.value;
                                              setCustomRisks(updatedRisks);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700 block mb-1">
                                            Date de fin prévue
                                          </label>
                                          <input
                                            type="date"
                                            value={measure.endDate}
                                            onChange={(e) => {
                                              const updatedRisks = [...customRisks];
                                              updatedRisks[index].actionMeasures[measureIndex].endDate = e.target.value;
                                              setCustomRisks(updatedRisks);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                <button
                                  onClick={() => {
                                    const updatedRisks = [...customRisks];
                                    updatedRisks[index].actionMeasures.push({
                                      id: `action_${Date.now()}`,
                                      description: '',
                                      expertise: '',
                                      responsible: '',
                                      budget: '',
                                      startDate: '',
                                      endDate: ''
                                    });
                                    setCustomRisks(updatedRisks);
                                  }}
                                  className="w-full flex items-center justify-center gap-2 bg-[#0066cc] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0052a3] transition-colors"
                                >
                                  <Plus className="w-5 h-5" />
                                  Ajouter une mesure supplémentaire
                                </button>
                              </div>
                            )}

                            <div className="bg-blue-50 rounded-lg p-4 mb-4">
                              <div className="flex items-center justify-between mb-2 cursor-pointer">
                                <h3 className="text-base font-semibold text-[#0066cc]">Information</h3>
                                <ChevronUp className="w-5 h-5 text-[#0066cc]" />
                              </div>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <textarea
                                  value={risk.information}
                                  onChange={(e) => {
                                    const updatedRisks = [...customRisks];
                                    updatedRisks[index].information = e.target.value;
                                    setCustomRisks(updatedRisks);
                                  }}
                                  placeholder="Votre commentaire sera retranscrit dans le rapport. Reporter ici tout information que vous jugez utiles au sujet de ce risque."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none h-32"
                                />
                                <div className="bg-blue-100 rounded-lg flex flex-col items-center justify-center p-4">
                                  {risk.informationImage ? (
                                    <div className="relative w-full">
                                      <img src={risk.informationImage} alt="Uploaded" className="w-full rounded-lg" />
                                      <button
                                        onClick={() => {
                                          const updatedRisks = [...customRisks];
                                          updatedRisks[index].informationImage = null;
                                          setCustomRisks(updatedRisks);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="w-16 h-16 mb-2 text-gray-400">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <rect x="3" y="3" width="18" height="18" rx="2" />
                                          <circle cx="8.5" cy="8.5" r="1.5" />
                                          <path d="m21 15-5-5L5 21" />
                                        </svg>
                                      </div>
                                      <label className="cursor-pointer">
                                        <span className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg inline-block transition-colors">
                                          Télécharger image
                                        </span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onload = (event) => {
                                                const updatedRisks = [...customRisks];
                                                updatedRisks[index].informationImage = event.target?.result as string;
                                                setCustomRisks(updatedRisks);
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                        />
                                      </label>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2 cursor-pointer">
                                <h3 className="text-base font-semibold text-[#0066cc]">Remarques</h3>
                                <ChevronUp className="w-5 h-5 text-[#0066cc]" />
                              </div>
                              <textarea
                                value={risk.remarks}
                                onChange={(e) => {
                                  const updatedRisks = [...customRisks];
                                  updatedRisks[index].remarks = e.target.value;
                                  setCustomRisks(updatedRisks);
                                }}
                                placeholder="Votre commentaire sera retranscrit dans le rapport. Reporter ici tout information que vous jugez utiles au sujet de ce risque."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none h-32"
                              />
                            </div>

                            <div className="mt-4 pt-4 border-t-2 border-gray-200">
                              <button
                                onClick={async () => {
                                  // Sauvegarder le risque actuel avant de créer le nouveau
                                  const currentRisk = risk;
                                  const saved = await saveCustomRisk(currentRisk);

                                  if (saved) {
                                    console.log('✅ Risque actuel sauvegardé, création du nouveau risque');

                                    const newRiskId = `custom_risk_${Date.now()}`;
                                    const newRisk = {
                                      id: newRiskId,
                                      title: '',
                                      measures: [],
                                      information: '',
                                      informationImage: null,
                                      remarks: '',
                                      riskStatus: null,
                                      actionMeasures: []
                                    };

                                    const updatedRisks = [...customRisks];
                                    updatedRisks.splice(index + 1, 0, newRisk);
                                    setCustomRisks(updatedRisks);
                                    setShowCustomRiskForm(true);

                                    setTimeout(() => {
                                      const newRiskElement = document.getElementById(`risk-${newRiskId}`);
                                      if (newRiskElement) {
                                        newRiskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }
                                    }, 100);
                                  } else {
                                    console.error('❌ Impossible de sauvegarder le risque actuel');
                                    alert('Erreur lors de la sauvegarde du risque actuel. Veuillez réessayer.');
                                  }
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
                              >
                                <Plus className="w-5 h-5" />
                                Créer un autre risque personnalisé
                              </button>
                            </div>
                            </div>
                          </div>
                        ))}

                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Important</strong>: Afin d'éviter les doublons, nous vous recommandons au préalable de bien parcourir l'ensemble des modules si ce n'est déjà fait.
                        </p>

                        <p className="text-sm text-gray-700 mb-6">
                          Si vous ne devez pas ajouter de risques, veuillez continuer.
                        </p>

                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              if (selectedDuerpCategory > 0) {
                                setSelectedDuerpCategory(selectedDuerpCategory - 1);
                                setViewMode('category');
                              }
                            }}
                            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                          >
                            Précédent
                          </button>
                          <button
                            onClick={() => {
                              const rapportSectionIndex = diagnosticSections.findIndex(s => s.id === 'rapport');
                              if (rapportSectionIndex !== -1) {
                                setCurrentSectionIndex(rapportSectionIndex);
                                setCurrentQuestionIndex(0);
                              }
                            }}
                            className="px-6 py-2.5 bg-[#0066cc] text-white rounded-lg font-medium hover:bg-[#0052a3] transition-colors"
                          >
                            Passer au rapport
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 overflow-hidden border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ff_1px,transparent_1px),linear-gradient(to_bottom,#0ff_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.03]"></div>
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                          <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
                          <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                          <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/30 border border-cyan-400/30">
                              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
                            </div>
                            <div className="flex-1">
                              <h2 className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent mb-1.5 drop-shadow-lg">
                                {duerpCategories[selectedDuerpCategory]?.label || 'Catégorie inconnue'}
                              </h2>
                              {duerpCategories[selectedDuerpCategory]?.defaultDescription && (
                                <div className="flex items-start gap-2 mt-3 bg-slate-800/60 backdrop-blur-xl rounded-lg p-3 border border-cyan-500/20">
                                  <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-cyan-400 via-blue-400 to-cyan-400 rounded-full"></div>
                                  <Lightbulb className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                                  <p className="text-sm sm:text-base text-cyan-100/80 leading-relaxed whitespace-pre-line font-medium">
                                    {duerpCategories[selectedDuerpCategory].defaultDescription}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {duerpCategories[selectedDuerpCategory]?.questions?.length > 0 && (
                          <div className="flex justify-center mt-6">
                            <button
                              onClick={() => {
                                setSelectedDuerpQuestion(0);
                                setViewMode('question');
                              }}
                              className="group relative flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#0066cc] to-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.03] transition-all duration-300 overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                              <span className="relative z-10">Commencer</span>
                              <ChevronRight className="w-5 h-5 relative z-10" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (() => {
                  const currentCategory = duerpCategories[selectedDuerpCategory];
                  if (!currentCategory) return null;

                  const currentDuerpQuestion = currentCategory.questions?.[selectedDuerpQuestion];

                  if (!currentDuerpQuestion) {
                    if (currentCategory.id === 'risques_personnalises') {
                      return (
                        <div className="max-w-5xl mx-auto min-h-[300px] sm:min-h-[600px]">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 border-l-4 sm:border-l-8 border-[#0066cc] shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                                Risques personnalisés
                              </h2>
                            </div>

                            <p className="text-sm text-gray-700 mb-6">
                              Si vous avez identifié des risques qui ne sont pas abordés par l'outil, vous pouvez les ajouter ici.
                            </p>

                            <div className="flex flex-col items-center justify-center py-8 gap-4">
                              <button
                                onClick={() => {
                                  setViewMode('category');
                                  const newRiskId = `custom_risk_${Date.now()}`;
                                  setCustomRisks([...customRisks, {
                                    id: newRiskId,
                                    title: '',
                                    measures: [],
                                    information: '',
                                    informationImage: null,
                                    remarks: '',
                                    riskStatus: null,
                                    actionMeasures: []
                                  }]);
                                  setShowCustomRiskForm(true);

                                  setTimeout(() => {
                                    const newRiskElement = document.getElementById(`risk-${newRiskId}`);
                                    if (newRiskElement) {
                                      newRiskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                  }, 100);
                                }}
                                className="bg-[#0066cc] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0052a3] transition-colors"
                              >
                                Ajoutez un risque personnalisé
                              </button>

                              <div className="text-center">
                                <p className="text-sm text-gray-600 mb-3">ou</p>
                                <button
                                  onClick={() => {
                                    const rapportSectionIndex = diagnosticSections.findIndex(s => s.id === 'rapport');
                                    if (rapportSectionIndex !== -1) {
                                      setCurrentSectionIndex(rapportSectionIndex);
                                      setCurrentQuestionIndex(0);
                                    }
                                  }}
                                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
                                >
                                  <FileText className="w-5 h-5" />
                                  Passer au rapport
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }

                  if (currentDuerpQuestion.id === 'rapp_1') {
                    const currentResponse = duerpResponses[currentDuerpQuestion.id] || { remarks: '' };

                    const handleFinirReport = async () => {
                      setIsGeneratingReport(true);
                      try {
                        await saveDuerpResponseData('rapp_1', 'rapport', {
                          selectedMeasures: [],
                          customMeasures: [],
                          riskStatus: null,
                          actionPlanMeasures: [],
                          riskPriority: null,
                          remarks: currentResponse.remarks || ''
                        });

                        const { data: clientData } = await supabase
                          .from('clients')
                          .select('*')
                          .eq('id', clientId)
                          .maybeSingle();

                        const clientInfo = {
                          fullName: clientData?.full_name || clientData?.nom ? `${clientData.prenom || ''} ${clientData.nom || ''}`.trim() : '',
                          companyName: clientData?.company_name || '',
                          siret: clientData?.siret || '',
                          email: clientData?.email || '',
                          phone: clientData?.phone || clientData?.portable || '',
                          address: clientData?.address || '',
                          ville: clientData?.ville || '',
                          codePostal: clientData?.code_postal || '',
                        };

                        await generateDuerpReportPDF(
                          clientId,
                          typeDiagnostic,
                          currentResponse.remarks || '',
                          clientInfo
                        );

                        setReportGenerated(true);
                        setShowFinirConfirmation(false);
                        alert('Le rapport PDF a ete genere et sauvegarde dans vos documents.');
                      } catch (error: any) {
                        console.error('Erreur generation rapport:', error);
                        alert('Erreur lors de la generation du rapport: ' + (error?.message || 'Erreur inconnue'));
                      } finally {
                        setIsGeneratingReport(false);
                      }
                    };

                    return (
                      <div className="max-w-4xl mx-auto">
                        <div className="mb-6">
                          <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            {currentDuerpQuestion.text}
                          </h2>
                          <p className="text-gray-600 leading-relaxed">
                            {currentDuerpQuestion.description}
                          </p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                          <label className="block mb-3">
                            <span className="text-sm font-medium text-gray-700">Vos commentaires supplementaires pour le rapport :</span>
                          </label>
                          <textarea
                            value={currentResponse.remarks || ''}
                            onChange={(e) => {
                              setDuerpResponses(prev => ({
                                ...prev,
                                [currentDuerpQuestion.id]: {
                                  ...prev[currentDuerpQuestion.id],
                                  remarks: e.target.value
                                }
                              }));
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-32 resize-y"
                            placeholder="Vous pouvez ecrire ici tout commentaire se rapportant a cette question"
                          />
                        </div>

                        <div className="flex justify-center mt-8">
                          <button
                            onClick={() => setShowFinirConfirmation(true)}
                            disabled={isGeneratingReport}
                            className="group relative flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-800 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-400/30"
                          >
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <FileDown className="w-6 h-6 relative z-10" />
                            <span className="relative z-10">Finir et generer le rapport PDF</span>
                          </button>
                        </div>

                        {reportGenerated && (
                          <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold">
                              <CheckCircle2 className="w-5 h-5" />
                              <span>Rapport genere avec succes ! Consultez l'onglet "Documents" pour le telecharger.</span>
                            </div>
                          </div>
                        )}

                        {showFinirConfirmation && (
                          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                  <FileDown className="w-6 h-6" />
                                  Confirmation de generation du rapport
                                </h3>
                              </div>
                              <div className="p-6 space-y-4">
                                <p className="text-gray-700 text-base leading-relaxed">
                                  Vous etes sur le point de generer le rapport PDF complet de votre evaluation des risques (DUERP).
                                </p>
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                  <p className="text-amber-800 text-sm font-medium flex items-start gap-2">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>Ce rapport inclura toutes les reponses de votre evaluation, les mesures selectionnees, le plan d'action et vos commentaires. Il sera sauvegarde dans vos documents.</span>
                                  </p>
                                </div>
                                <p className="text-gray-600 text-sm">
                                  Voulez-vous continuer ?
                                </p>
                              </div>
                              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                                <button
                                  onClick={() => setShowFinirConfirmation(false)}
                                  disabled={isGeneratingReport}
                                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all disabled:opacity-50"
                                >
                                  Annuler
                                </button>
                                <button
                                  onClick={handleFinirReport}
                                  disabled={isGeneratingReport}
                                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isGeneratingReport ? (
                                    <>
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                      <span>Generation en cours...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-5 h-5" />
                                      <span>Confirmer et generer</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  const currentResponse = duerpResponses[currentDuerpQuestion.id] || {
                    selectedMeasures: [],
                    customMeasures: [],
                    actionPlanMeasures: [],
                    riskStatus: null,
                    riskPriority: null,
                    remarks: ''
                  };

                  return (
                    <div className="max-w-5xl mx-auto min-h-[300px] sm:min-h-[600px]">
                      {/* Boutons de navigation et réinitialisation en haut */}
                      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <button
                          onClick={async () => {
                            if (confirm(`Voulez-vous réinitialiser toutes les questions du compartiment "${duerpCategories[selectedDuerpCategory]?.label}" ?\n\nCette action est irréversible.`)) {
                              try {
                                const currentCategory = duerpCategories[selectedDuerpCategory];

                                const { error } = await supabase
                                  .from('duerp_evaluation_responses')
                                  .delete()
                                  .eq('client_id', clientId)
                                  .eq('type_diagnostic', typeDiagnostic)
                                  .eq('category', currentCategory.id);

                                if (error) throw error;

                                setDuerpResponses(prev => {
                                  const updated = { ...prev };
                                  currentCategory.questions.forEach(q => {
                                    delete updated[q.id];
                                  });
                                  return updated;
                                });

                                alert('Compartiment réinitialisé');
                              } catch (error) {
                                console.error('Erreur:', error);
                                alert('Erreur lors de la réinitialisation');
                              }
                            }
                          }}
                          className="group relative flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-orange-500/10 backdrop-blur-sm border border-orange-400/20 hover:border-orange-400/50 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(251,146,60,0.15)]"
                        >
                          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="truncate">Réinitialiser le compartiment</span>
                        </button>

                        <button
                          onClick={async () => {
                            if (confirm('⚠️ ATTENTION ⚠️\n\nVoulez-vous réinitialiser TOUTE l\'évaluation ?\n\nToutes vos réponses seront supprimées définitivement.\n\nContinuer ?')) {
                              try {
                                const { error } = await supabase
                                  .from('duerp_evaluation_responses')
                                  .delete()
                                  .eq('client_id', clientId)
                                  .eq('type_diagnostic', typeDiagnostic);

                                if (error) throw error;

                                setDuerpResponses({});
                                setCustomRisks([]);
                                alert('Évaluation réinitialisée');
                              } catch (error) {
                                console.error('Erreur:', error);
                                alert('Erreur lors de la réinitialisation');
                              }
                            }
                          }}
                          className="group relative flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-500/10 backdrop-blur-sm border border-red-400/20 hover:border-red-400/50 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                        >
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span>Réinitialiser tout</span>
                        </button>

                        <button
                          onClick={() => {
                            const currentCategory = duerpCategories[selectedDuerpCategory];
                            const totalQuestionsInCategory = currentCategory.questions.length;
                            const currentQ = currentCategory.questions[selectedDuerpQuestion];
                            const currentResp = duerpResponses[currentQ?.id];

                            if (currentQ?.isYesNoOnly && currentResp?.riskStatus === 'non') {
                              let nextIdx = selectedDuerpCategory + 1;
                              while (nextIdx < duerpCategories.length) {
                                const nextCat = duerpCategories[nextIdx];
                                if (nextCat.parentGateQuestionId && duerpResponses[nextCat.parentGateQuestionId]?.riskStatus !== 'oui') {
                                  nextIdx++;
                                } else {
                                  break;
                                }
                              }
                              if (nextIdx < duerpCategories.length) {
                                setSelectedDuerpCategory(nextIdx);
                                setSelectedDuerpQuestion(0);
                                const cat = duerpCategories[nextIdx];
                                if (cat.questions[0]?.isYesNoOnly) {
                                  setViewMode('question');
                                } else if (cat.defaultDescription && cat.questions.length > 0) {
                                  setViewMode('category');
                                } else if (cat.questions.length > 0) {
                                  setViewMode('question');
                                } else {
                                  setViewMode('category');
                                }
                              } else {
                                handleNext();
                              }
                            } else if (selectedDuerpQuestion < totalQuestionsInCategory - 1) {
                              setSelectedDuerpQuestion(selectedDuerpQuestion + 1);
                            } else {
                              let nextIdx = selectedDuerpCategory + 1;
                              while (nextIdx < duerpCategories.length) {
                                const nextCat = duerpCategories[nextIdx];
                                if (nextCat.parentGateQuestionId && duerpResponses[nextCat.parentGateQuestionId]?.riskStatus !== 'oui') {
                                  nextIdx++;
                                } else {
                                  break;
                                }
                              }
                              if (nextIdx < duerpCategories.length) {
                                setSelectedDuerpCategory(nextIdx);
                                setSelectedDuerpQuestion(0);
                                const cat = duerpCategories[nextIdx];
                                if (cat.questions[0]?.isYesNoOnly) {
                                  setViewMode('question');
                                } else if (cat.defaultDescription && cat.questions.length > 0) {
                                  setViewMode('category');
                                } else if (cat.questions.length > 0) {
                                  setViewMode('question');
                                } else {
                                  setViewMode('category');
                                }
                              } else {
                                handleNext();
                              }
                            }
                          }}
                          className="group relative flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-orange-500/10 backdrop-blur-sm border border-orange-400/20 hover:border-orange-400/50 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 rounded-xl transition-all duration-300 font-bold text-sm sm:text-base hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(251,146,60,0.15)]"
                        >
                          <span>Question suivante</span>
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-2.5 mb-3 overflow-hidden border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                        <div className="absolute inset-0">
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ff_1px,transparent_1px),linear-gradient(to_bottom,#0ff_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03]"></div>
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
                        </div>
                        <div className="absolute top-0 left-0 w-24 h-24 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>

                        <div className="relative z-10">
                          <div className="flex items-start gap-2 mb-1.5">
                            <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/50 border border-cyan-400/50 hover:scale-110 transition-all duration-300">
                              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/30 to-transparent"></div>
                              <Shield className="w-3.5 h-3.5 text-white relative z-10 drop-shadow-lg" />
                            </div>
                            <div className="flex-1 pt-0.5">
                              {currentDuerpQuestion.isYesNoOnly && currentCategory.defaultDescription && (
                                <p className="text-sm text-cyan-100/70 leading-snug mb-1.5">
                                  {currentCategory.defaultDescription}
                                </p>
                              )}
                              <h2 className="text-base sm:text-lg font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent leading-tight drop-shadow-lg">
                                {currentDuerpQuestion.text}
                              </h2>
                            </div>
                            {isQuestionPartial(currentDuerpQuestion.id) && (
                              <div className="inline-flex items-center gap-1 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-fuchsia-600 px-2 py-1 rounded-md shadow-md shadow-fuchsia-500/50 hover:shadow-lg hover:scale-105 transition-all duration-300 border border-fuchsia-400/50">
                                <HelpCircle className="w-2.5 h-2.5 text-white drop-shadow-lg" />
                                <span className="text-white text-xs font-bold">PARTIEL</span>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>

                      {currentDuerpQuestion.isYesNoOnly ? (
                        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-2.5 border border-purple-500/30 mb-3 shadow-lg shadow-purple-500/20 overflow-hidden">
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,#a855f7_1px,transparent_1px),linear-gradient(to_bottom,#a855f7_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03]"></div>
                          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                          <div className="relative z-10">
                            <p className="text-sm sm:text-base text-cyan-100 mb-3 font-bold">
                              {currentDuerpQuestion.yesNoQuestion}
                            </p>
                            <div className="space-y-2.5">
                              <label className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all duration-300 ${
                                currentResponse.riskStatus === 'oui'
                                  ? 'bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/40 scale-[1.01]'
                                  : 'bg-slate-800/40 border-slate-600 hover:border-cyan-400/50 hover:bg-gradient-to-br hover:from-cyan-500/10 hover:to-blue-500/10 hover:shadow-md hover:shadow-cyan-500/20'
                              }`}>
                                <div className={`absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                <input
                                  type="radio"
                                  name={`yesno-${currentDuerpQuestion.id}`}
                                  checked={currentResponse.riskStatus === 'oui'}
                                  onChange={() => setRiskStatus(currentDuerpQuestion.id, currentCategory.id, 'oui')}
                                  className="w-5 h-5 text-cyan-400 focus:ring-2 focus:ring-cyan-400 cursor-pointer relative z-10 accent-cyan-500"
                                />
                                <span className={`text-sm sm:text-base font-black relative z-10 tracking-wider ${currentResponse.riskStatus === 'oui' ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'text-slate-400 group-hover:text-cyan-300'}`}>
                                  OUI
                                </span>
                              </label>

                              <label className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all duration-300 ${
                                currentResponse.riskStatus === 'non'
                                  ? 'bg-gradient-to-br from-slate-700/40 via-slate-600/40 to-slate-700/40 border-slate-500 shadow-lg shadow-slate-500/40 scale-[1.01]'
                                  : 'bg-slate-800/40 border-slate-600 hover:border-slate-400 hover:bg-gradient-to-br hover:from-slate-700/30 hover:to-slate-600/30 hover:shadow-md'
                              }`}>
                                <div className={`absolute inset-0 rounded-lg bg-gradient-to-br from-slate-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                <input
                                  type="radio"
                                  name={`yesno-${currentDuerpQuestion.id}`}
                                  checked={currentResponse.riskStatus === 'non'}
                                  onChange={() => setRiskStatus(currentDuerpQuestion.id, currentCategory.id, 'non')}
                                  className="w-5 h-5 text-slate-400 focus:ring-2 focus:ring-slate-400 cursor-pointer relative z-10 accent-slate-500"
                                />
                                <span className={`text-sm sm:text-base font-black relative z-10 tracking-wider ${currentResponse.riskStatus === 'non' ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-400'}`}>
                                  NON
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-2.5 border border-cyan-500/30 mb-3 shadow-lg shadow-cyan-500/20 overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ff_1px,transparent_1px),linear-gradient(to_bottom,#0ff_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03]"></div>
                        <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-cyan-500/30">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50 border border-cyan-400/50 relative">
                              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/30 to-transparent"></div>
                              <CheckCircle2 className="w-3.5 h-3.5 text-white relative z-10 drop-shadow-lg" />
                            </div>
                            <h3 className="text-sm sm:text-base font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-wider">
                              MESURES EN PLACE
                            </h3>
                          </div>

                          <div className="space-y-1.5 mb-2">
                            {currentDuerpQuestion.measures.map((measure, index) => {
                              const measureId = typeof measure === 'string' ? `measure_${index}` : measure.id;
                              const measureText = typeof measure === 'string' ? measure : measure.text;
                              return (
                                <label key={measureId} className="group relative flex items-start gap-2 p-2 rounded-lg bg-slate-800/40 hover:bg-gradient-to-br hover:from-cyan-500/20 hover:to-blue-500/20 cursor-pointer border border-slate-600 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 backdrop-blur-sm">
                                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  <input
                                    type="checkbox"
                                    checked={currentResponse.selectedMeasures.includes(measureId)}
                                    onChange={() => toggleMeasure(currentDuerpQuestion.id, measureId, currentCategory.id)}
                                    className="w-4 h-4 mt-0.5 text-cyan-400 rounded focus:ring-2 focus:ring-cyan-400 cursor-pointer flex-shrink-0 relative z-10 accent-cyan-500"
                                  />
                                  <span className="text-sm text-cyan-100 flex-1 leading-relaxed font-medium relative z-10">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 border border-cyan-400/50 text-xs font-black text-white mr-2 shadow-sm shadow-cyan-500/30">{index + 1}</span>{measureText}
                                  </span>
                                </label>
                              );
                            })}

                            {currentResponse.customMeasures.map((customMeasure, index) => (
                              <div key={`custom-${index}`} className="relative bg-gradient-to-br from-fuchsia-500/20 via-pink-500/20 to-fuchsia-500/20 border border-fuchsia-500/50 rounded-lg p-2 shadow-lg shadow-fuchsia-500/30 overflow-hidden">
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_3s_linear_infinite]"></div>
                                <div className="flex items-start justify-between mb-1 relative z-10">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-fuchsia-500 via-pink-500 to-fuchsia-600 flex items-center justify-center shadow-sm shadow-fuchsia-500/50 border border-fuchsia-400/50">
                                      <span className="text-white text-xs font-black drop-shadow-lg">{index + 1}</span>
                                    </div>
                                    <span className="text-xs font-black bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent tracking-wide">PERSO</span>
                                  </div>
                                  <button
                                    onClick={() => removeCustomMeasure(currentDuerpQuestion.id, currentCategory.id, index)}
                                    className="p-1 rounded-md bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 hover:text-red-300 transition-all hover:shadow-sm hover:shadow-red-500/30 hover:scale-105 duration-200"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                                {customMeasure.description && (
                                  <p className="text-sm text-cyan-100 leading-relaxed pl-7 font-medium relative z-10">{customMeasure.description}</p>
                                )}
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => setShowCustomMeasureModal(true)}
                            className="w-full mt-1.5 group relative overflow-hidden rounded-lg"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-50 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
                            <div className="relative flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-600 hover:from-cyan-400 hover:to-blue-600 rounded-lg shadow-lg shadow-cyan-500/40 group-hover:shadow-cyan-500/60 transition-all duration-300 border border-cyan-400/50">
                              <Plus className="w-3.5 h-3.5 text-white group-hover:scale-125 group-hover:rotate-90 transition-all duration-300 drop-shadow-lg" />
                              <span className="text-white font-black text-sm tracking-wider">AJOUTER MESURE</span>
                            </div>
                          </button>
                        </div>
                      </div>

                      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg p-2 border border-blue-500/30 mb-2 shadow-md shadow-blue-500/20 overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03]"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-blue-500/30">
                            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-500/50 border border-blue-400/50">
                              <Target className="w-2.5 h-2.5 text-white relative z-10 drop-shadow-lg" />
                            </div>
                            <h3 className="text-sm font-black bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 bg-clip-text text-transparent tracking-wider">ÉTAT</h3>
                          </div>

                          <div className="space-y-1.5">
                            <label className={`group relative flex items-center gap-1.5 p-1.5 rounded-md cursor-pointer border transition-all duration-300 ${
                              currentResponse.riskStatus === 'maitrise'
                                ? 'bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/40'
                                : 'bg-slate-800/40 border-slate-600 hover:border-cyan-400/50 hover:bg-gradient-to-br hover:from-cyan-500/10 hover:to-blue-500/10'
                            }`}>
                              <input
                                type="radio"
                                name={`risk-${currentDuerpQuestion.id}`}
                                checked={currentResponse.riskStatus === 'maitrise'}
                                onChange={() => setRiskStatus(currentDuerpQuestion.id, currentCategory.id, 'maitrise')}
                                className="w-4 h-4 text-cyan-400 cursor-pointer flex-shrink-0 relative z-10 accent-cyan-500"
                              />
                              <div className={`w-4 h-4 rounded-sm flex items-center justify-center ${currentResponse.riskStatus === 'maitrise' ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/50' : 'bg-slate-700'}`}>
                                <CheckCircle2 className={`w-2.5 h-2.5 ${currentResponse.riskStatus === 'maitrise' ? 'text-white drop-shadow-lg' : 'text-slate-500'}`} />
                              </div>
                              <span className={`text-sm font-black tracking-wider ${currentResponse.riskStatus === 'maitrise' ? 'text-cyan-400' : 'text-slate-500'}`}>
                                MAÎTRISÉ
                              </span>
                            </label>

                            <label className={`group relative flex items-center gap-1.5 p-1.5 rounded-md cursor-pointer border transition-all duration-300 ${
                              currentResponse.riskStatus === 'non_maitrise'
                                ? 'bg-gradient-to-br from-red-500/20 via-orange-500/20 to-red-500/20 border-red-400 shadow-md shadow-red-500/40'
                                : 'bg-slate-800/40 border-slate-600 hover:border-red-400/50 hover:bg-gradient-to-br hover:from-red-500/10 hover:to-orange-500/10'
                            }`}>
                              <input
                                type="radio"
                                name={`risk-${currentDuerpQuestion.id}`}
                                checked={currentResponse.riskStatus === 'non_maitrise'}
                                onChange={() => setRiskStatus(currentDuerpQuestion.id, currentCategory.id, 'non_maitrise')}
                                className="w-4 h-4 text-red-400 cursor-pointer flex-shrink-0 relative z-10 accent-red-500"
                              />
                              <div className={`w-4 h-4 rounded-sm flex items-center justify-center ${currentResponse.riskStatus === 'non_maitrise' ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-md shadow-red-500/50' : 'bg-slate-700'}`}>
                                <AlertTriangle className={`w-2.5 h-2.5 ${currentResponse.riskStatus === 'non_maitrise' ? 'text-white drop-shadow-lg' : 'text-slate-500'}`} />
                              </div>
                              <span className={`text-sm font-black tracking-wider ${currentResponse.riskStatus === 'non_maitrise' ? 'text-red-400' : 'text-slate-500'}`}>
                                NON MAÎTRISÉ
                              </span>
                            </label>

                            <label className={`group relative flex items-center gap-1.5 p-1.5 rounded-md cursor-pointer border transition-all duration-300 ${
                              currentResponse.riskStatus === 'non_applicable'
                                ? 'bg-gradient-to-br from-slate-700/40 to-slate-700/40 border-slate-500 shadow-md shadow-slate-500/40'
                                : 'bg-slate-800/40 border-slate-600 hover:border-slate-400 hover:bg-gradient-to-br hover:from-slate-700/30 hover:to-slate-600/30'
                            }`}>
                              <input
                                type="radio"
                                name={`risk-${currentDuerpQuestion.id}`}
                                checked={currentResponse.riskStatus === 'non_applicable'}
                                onChange={() => setRiskStatus(currentDuerpQuestion.id, currentCategory.id, 'non_applicable')}
                                className="w-4 h-4 text-slate-400 cursor-pointer flex-shrink-0 relative z-10 accent-slate-500"
                              />
                              <div className={`w-4 h-4 rounded-sm flex items-center justify-center ${currentResponse.riskStatus === 'non_applicable' ? 'bg-gradient-to-br from-slate-500 to-slate-700 shadow-md shadow-slate-500/50' : 'bg-slate-700'}`}>
                                <X className={`w-2.5 h-2.5 ${currentResponse.riskStatus === 'non_applicable' ? 'text-white drop-shadow-lg' : 'text-slate-500'}`} />
                              </div>
                              <span className={`text-sm font-black tracking-wider ${currentResponse.riskStatus === 'non_applicable' ? 'text-slate-300' : 'text-slate-500'}`}>
                                NON APPLICABLE
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {currentResponse.riskStatus === 'non_maitrise' && (
                        <>
                          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg border border-fuchsia-500/30 mb-2 overflow-hidden shadow-md shadow-fuchsia-500/20">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#d946ef_1px,transparent_1px),linear-gradient(to_bottom,#d946ef_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03]"></div>
                            <div className="absolute top-0 left-1/3 w-16 h-16 bg-gradient-to-br from-fuchsia-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
                            <button
                              onClick={() => setIsMeasuresSectionExpanded(!isMeasuresSectionExpanded)}
                              className="relative z-10 w-full flex items-center justify-between p-2 hover:bg-fuchsia-500/10 transition-all duration-300 rounded-lg"
                            >
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-fuchsia-500 via-pink-500 to-fuchsia-600 flex items-center justify-center shadow-md shadow-fuchsia-500/30 border border-fuchsia-400/50">
                                  <Plus className="w-2.5 h-2.5 text-white relative z-10 drop-shadow-lg" />
                                </div>
                                <h3 className="text-sm font-black bg-gradient-to-r from-fuchsia-400 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent tracking-wider">MESURES</h3>
                              </div>
                              {isMeasuresSectionExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-fuchsia-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-fuchsia-400" />
                              )}
                            </button>

                            {isMeasuresSectionExpanded && (
                              <div className="relative z-10 p-2 pt-0">
                                <div className="flex gap-1.5 mb-2">
                                  <button
                                    onClick={() => setShowStandardMeasuresModal(true)}
                                    className="group relative flex items-center justify-center gap-1 px-2 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-600 text-white rounded-md shadow-md shadow-cyan-500/30 font-bold text-xs flex-1 transition-all duration-300 border border-cyan-400/50 overflow-hidden"
                                  >
                                    <Plus className="w-2.5 h-2.5 relative z-10" />
                                    <span className="relative z-10">STD</span>
                                  </button>
                                  <button
                                    onClick={() => setShowCustomMeasureModal(true)}
                                    className="group relative flex items-center justify-center gap-1 px-2 py-1.5 bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-400 hover:to-pink-600 text-white rounded-md shadow-md shadow-fuchsia-500/30 font-bold text-xs flex-1 transition-all duration-300 border border-fuchsia-400/50 overflow-hidden"
                                  >
                                    <Plus className="w-2.5 h-2.5 relative z-10" />
                                    <span className="relative z-10">PERSO</span>
                                  </button>
                                </div>

                                {currentResponse.actionPlanMeasures.length > 0 && (
                                  <div className="space-y-1.5">
                                    {currentResponse.actionPlanMeasures.map((measure, index) => (
                                      <div key={measure.id} className="relative bg-slate-800/60 backdrop-blur-sm rounded-md border border-fuchsia-500/30 p-1.5 flex items-center justify-between shadow-sm overflow-hidden">
                                        <p className="text-xs text-cyan-100 leading-relaxed flex-1 font-medium relative z-10">{measure.text}</p>
                                        <button
                                          onClick={() => removeActionPlanMeasure(currentDuerpQuestion.id, currentCategory.id, measure.id)}
                                          className="relative z-10 p-1 rounded-md bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 ml-1.5 flex-shrink-0 transition-all hover:scale-105 duration-200"
                                        >
                                          <X className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg p-2 border border-yellow-500/30 mb-2 shadow-md shadow-yellow-500/20 overflow-hidden">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#eab308_1px,transparent_1px),linear-gradient(to_bottom,#eab308_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03]"></div>
                            <div className="absolute bottom-0 right-0 w-16 h-16 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
                            <div className="relative z-10">
                              <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-yellow-500/30">
                                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-500 flex items-center justify-center shadow-md shadow-yellow-500/50 border border-yellow-400/50">
                                  <span className="text-white text-xs font-bold relative z-10 drop-shadow-lg">!</span>
                                </div>
                                <h3 className="text-xs font-black bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent tracking-wider">PRIORITÉ</h3>
                              </div>

                              <div className="space-y-1.5">
                                <label className={`group relative flex items-center gap-1.5 p-1.5 rounded-md cursor-pointer transition-all duration-300 ${
                                  currentResponse.riskPriority === 'faible'
                                    ? 'bg-gradient-to-br from-cyan-500/20 to-cyan-500/20 border border-cyan-400 shadow-md shadow-cyan-500/40'
                                    : 'bg-slate-800/40 border border-slate-600 hover:border-cyan-400/50'
                                }`}>
                                  <input
                                    type="radio"
                                    name={`priority-${currentDuerpQuestion.id}`}
                                    checked={currentResponse.riskPriority === 'faible'}
                                    onChange={() => setRiskPriority(currentDuerpQuestion.id, currentCategory.id, 'faible')}
                                    className="w-3 h-3 text-cyan-600 cursor-pointer relative z-10 accent-cyan-500"
                                  />
                                  <div className={`w-3 h-3 rounded-full shadow-sm ${currentResponse.riskPriority === 'faible' ? 'bg-gradient-to-br from-cyan-500 to-cyan-600' : 'bg-slate-600'}`}></div>
                                  <span className={`text-xs font-black ${currentResponse.riskPriority === 'faible' ? 'text-cyan-400' : 'text-slate-500'}`}>FAIBLE</span>
                                </label>

                                <label className={`group relative flex items-center gap-1.5 p-1.5 rounded-md cursor-pointer transition-all duration-300 ${
                                  currentResponse.riskPriority === 'moyenne'
                                    ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-500/20 border border-yellow-400 shadow-md shadow-yellow-500/40'
                                    : 'bg-slate-800/40 border border-slate-600 hover:border-yellow-400/50'
                                }`}>
                                  <input
                                    type="radio"
                                    name={`priority-${currentDuerpQuestion.id}`}
                                    checked={currentResponse.riskPriority === 'moyenne'}
                                    onChange={() => setRiskPriority(currentDuerpQuestion.id, currentCategory.id, 'moyenne')}
                                    className="w-3 h-3 text-yellow-600 cursor-pointer relative z-10 accent-yellow-500"
                                  />
                                  <div className={`w-3 h-3 rounded-full shadow-sm ${currentResponse.riskPriority === 'moyenne' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-slate-600'}`}></div>
                                  <span className={`text-xs font-black ${currentResponse.riskPriority === 'moyenne' ? 'text-yellow-400' : 'text-slate-500'}`}>MOYENNE</span>
                                </label>

                                <label className={`group relative flex items-center gap-1.5 p-1.5 rounded-md cursor-pointer transition-all duration-300 ${
                                  currentResponse.riskPriority === 'elevee'
                                    ? 'bg-gradient-to-br from-red-500/20 to-red-500/20 border border-red-400 shadow-md shadow-red-500/40'
                                    : 'bg-slate-800/40 border border-slate-600 hover:border-red-400/50'
                                }`}>
                                  <input
                                    type="radio"
                                    name={`priority-${currentDuerpQuestion.id}`}
                                    checked={currentResponse.riskPriority === 'elevee'}
                                    onChange={() => setRiskPriority(currentDuerpQuestion.id, currentCategory.id, 'elevee')}
                                    className="w-3 h-3 text-red-600 cursor-pointer relative z-10 accent-red-500"
                                  />
                                  <div className={`w-3 h-3 rounded-full shadow-sm ${currentResponse.riskPriority === 'elevee' ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-slate-600'}`}></div>
                                  <span className={`text-xs font-black ${currentResponse.riskPriority === 'elevee' ? 'text-red-400' : 'text-slate-500'}`}>ÉLEVÉE</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      </>
                      )}

                      {currentDuerpQuestion.informationText && (
                        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-2xl rounded-2xl border border-cyan-500/20 mb-6 overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.08)] group/expand">
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ff_1px,transparent_1px),linear-gradient(to_bottom,#0ff_1px,transparent_1px)] bg-[size:50px_50px] opacity-[0.02]"></div>
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(6,182,212,0.1),transparent_50%)]"></div>
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"></div>
                          <div className="absolute top-0 right-1/4 w-32 h-32 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full blur-3xl"></div>
                          <div className="absolute bottom-0 left-1/3 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
                          <button
                            onClick={() => setIsInformationExpanded(!isInformationExpanded)}
                            className="relative z-10 w-full flex items-center justify-between p-4 sm:p-5 hover:bg-cyan-500/5 transition-all duration-500 rounded-2xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-300/30 group-hover/expand:shadow-cyan-400/50 group-hover/expand:scale-105 transition-all duration-500">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent"></div>
                                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10 drop-shadow-lg" />
                              </div>
                              <div className="text-left">
                                <h3 className="text-sm sm:text-base font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">Information</h3>
                                <span className="text-xs text-cyan-500/60 font-medium">{isInformationExpanded ? 'Cliquez pour replier' : 'Cliquez pour voir les details'}</span>
                              </div>
                            </div>
                            <div className={`w-8 h-8 rounded-lg bg-slate-800/80 border border-cyan-500/20 flex items-center justify-center transition-all duration-500 ${isInformationExpanded ? 'rotate-180' : ''} group-hover/expand:border-cyan-400/40 group-hover/expand:bg-cyan-500/10`}>
                              <ChevronDown className="w-4 h-4 text-cyan-400" />
                            </div>
                          </button>

                          {isInformationExpanded && (
                            <div className="relative z-10 px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                              <div className="relative bg-cyan-950/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-cyan-500/15">
                                <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-cyan-400 via-blue-500 to-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.5)] rounded-full"></div>
                                <p className="text-sm text-cyan-100/80 leading-relaxed whitespace-pre-line font-medium pl-3">
                                  {currentDuerpQuestion.informationText}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-2.5 border border-amber-500/30 mb-3 shadow-lg shadow-amber-500/20 overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03]"></div>
                        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-0 left-1/3 w-16 h-16 bg-orange-500/15 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                          <button
                            onClick={() => setIsRemarquesExpanded(!isRemarquesExpanded)}
                            className="w-full flex items-center justify-between mb-2 pb-2 border-b border-amber-500/30 hover:bg-amber-500/10 transition-all duration-300 rounded-lg px-1 py-0.5"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/50 border border-amber-400/50 relative">
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/30 to-transparent"></div>
                                <MessageSquare className="w-3.5 h-3.5 text-white relative z-10 drop-shadow-lg" />
                              </div>
                              <h3 className="text-sm font-black bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent tracking-wider">REMARQUES</h3>
                            </div>
                            {isRemarquesExpanded ? (
                              <ChevronUp className="w-4 h-4 text-amber-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-amber-400" />
                            )}
                          </button>

                          {isRemarquesExpanded && (
                            <div className="relative">
                              <div className="absolute -left-0.5 top-2 bottom-2 w-[2px] bg-gradient-to-b from-amber-400 via-orange-500 to-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)] rounded-full"></div>
                              <textarea
                                value={currentResponse.remarks || ''}
                                onChange={(e) => setRemarks(currentDuerpQuestion.id, currentCategory.id, e.target.value)}
                                className="w-full px-3 py-2 pl-3 bg-slate-800/60 backdrop-blur-sm border border-amber-500/30 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 min-h-[60px] text-sm text-cyan-100 resize-y placeholder-slate-500 font-medium transition-all duration-300 hover:border-amber-400/50 hover:shadow-md hover:shadow-amber-500/20"
                                placeholder="Vos remarques..."
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 lg:p-5 bg-white border-t-2 border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mb-3">
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
                </div>
              </div>

              {(() => {
                const currentCategory = duerpCategories[selectedDuerpCategory];
                const totalQuestionsInCategory = currentCategory.questions.length;
                const isLastQuestion = viewMode === 'question' && selectedDuerpQuestion === totalQuestionsInCategory - 1;

                if (isLastQuestion) {
                  return (
                    <div className="border-t-2 border-gray-200 pt-4">
                      <button
                        onClick={() => {
                          if (selectedDuerpCategory < duerpCategories.length - 1) {
                            const nextCat = duerpCategories[selectedDuerpCategory + 1];
                            setSelectedDuerpCategory(selectedDuerpCategory + 1);
                            setSelectedDuerpQuestion(0);
                            if (nextCat.questions[0]?.isYesNoOnly) {
                              setViewMode('question');
                            } else if (nextCat.defaultDescription && nextCat.questions.length > 0) {
                              setViewMode('category');
                            } else {
                              setViewMode('question');
                            }
                          }
                        }}
                        disabled={selectedDuerpCategory === duerpCategories.length - 1}
                        className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-xl ${
                          selectedDuerpCategory === duerpCategories.length - 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 hover:shadow-2xl hover:scale-[1.02]'
                        }`}
                      >
                        <span>Compartiment suivant</span>
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  );
                }
                return null;
              })()}
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-500 transition-all duration-300 h-32 text-gray-900 resize-y"
                  placeholder="Vous pouvez écrire ici tout commentaire se rapportant à cette question"
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
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowStandardMeasuresModal(false)}>
            <div
              className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.4)] border border-blue-400/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_ease-in-out_infinite] pointer-events-none"></div>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>

              <div className="relative z-10 sticky top-0 bg-gradient-to-r from-slate-900/95 to-blue-900/95 backdrop-blur-md border-b border-blue-400/30 p-4 sm:p-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.6)] flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] truncate">Mesures standards</h3>
                </div>
                <button
                  onClick={() => setShowStandardMeasuresModal(false)}
                  className="w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-red-900/50 border border-slate-600 hover:border-red-500/50 text-slate-400 hover:text-red-400 transition-all shadow-[0_0_10px_rgba(100,116,139,0.3)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                >
                  <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="relative z-10 p-4 sm:p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
                <p className="text-cyan-200 mb-6 text-sm leading-relaxed">
                  Sélectionner une ou plusieurs des mesures communes connues fournies.
                </p>

                <div className="space-y-3">
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
                        <label key={measure.id} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border backdrop-blur-sm transition-all ${
                          isAdded
                            ? 'bg-blue-900/40 border-blue-400/60 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                            : 'bg-slate-900/50 border-slate-700/50 hover:border-blue-400/40 hover:bg-blue-950/30'
                        }`}>
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
                          className="w-5 h-5 mt-0.5 text-blue-500 rounded border-2 border-slate-600 focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-[0_0_5px_rgba(59,130,246,0.3)]"
                        />
                        <p className="flex-1 text-slate-200 text-sm leading-relaxed">{measure.text}</p>
                      </label>
                    );
                  });
                  })()}
                </div>
                <div className="mt-6 pt-6 border-t border-blue-400/20">
                  <button
                    onClick={() => setShowStandardMeasuresModal(false)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] border border-blue-400/30"
                  >
                    Terminé
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showCustomMeasureModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 rounded-2xl max-w-5xl w-full shadow-[0_0_50px_rgba(59,130,246,0.4)] max-h-[85vh] sm:max-h-[70vh] overflow-hidden border border-blue-400/30">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_ease-in-out_infinite] pointer-events-none"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>

            <div className="relative z-10 sticky top-0 bg-gradient-to-r from-slate-900/95 to-blue-900/95 backdrop-blur-md border-b border-blue-400/30 p-4 sm:p-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.6)] flex-shrink-0">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] truncate">Mesures personnalisées</h3>
              </div>
              <button
                onClick={() => {
                  setShowCustomMeasureModal(false);
                  setCustomMeasures([]);
                }}
                className="w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-red-900/50 border border-slate-600 hover:border-red-500/50 text-slate-400 hover:text-red-400 transition-all shadow-[0_0_10px_rgba(100,116,139,0.3)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center justify-center"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>

            <div className="relative z-10 p-4 sm:p-6 overflow-y-auto max-h-[calc(85vh-100px)] sm:max-h-[calc(70vh-100px)]">
              <p className="text-cyan-200 mb-6 text-sm leading-relaxed">
                Sélectionnez ou décrivez les éventuelles mesures supplémentaires pour réduire le risque.
              </p>

              {customMeasures.map((measure, index) => (
                <div key={measure.id} className="mb-6 border border-blue-400/30 rounded-lg p-4 bg-slate-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_0_8px_rgba(59,130,246,0.6)]">
                        <ChevronDown className="w-3.5 h-3.5 text-white" />
                      </div>
                      <h4 className="text-base font-bold text-blue-100 drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]">
                        Mesure additionnelle {index + 1}
                      </h4>
                    </div>
                    <button
                      onClick={() => {
                        setCustomMeasures(customMeasures.filter(m => m.id !== measure.id));
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-red-900/50 hover:bg-red-800/70 border border-red-500/40 rounded text-red-400 hover:text-red-300 transition-all shadow-[0_0_8px_rgba(239,68,68,0.3)] hover:shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Effacer
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-2">
                        Description
                        <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
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
                        className="w-full p-2.5 bg-slate-900/70 border border-slate-600 focus:border-blue-400 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-400/30 transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-2">
                        Expertise
                        <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
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
                        className="w-full p-2.5 bg-slate-900/70 border border-slate-600 focus:border-blue-400 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-400/30 transition-all min-h-[70px] resize-y shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-2">
                        Qui est responsable ?
                        <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
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
                        className="w-full p-2.5 bg-slate-900/70 border border-slate-600 focus:border-blue-400 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-400/30 transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-2">
                        Budget
                        <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
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
                        className="w-full p-2.5 bg-slate-900/70 border border-slate-600 focus:border-blue-400 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-400/30 transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-cyan-300 mb-2 block">
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
                          className="w-full p-2.5 bg-slate-900/70 border border-slate-600 focus:border-blue-400 rounded-lg text-slate-200 text-sm focus:ring-2 focus:ring-blue-400/30 transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-cyan-300 mb-2 block">
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
                          className="w-full p-2.5 bg-slate-900/70 border border-slate-600 focus:border-blue-400 rounded-lg text-slate-200 text-sm focus:ring-2 focus:ring-blue-400/30 transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={() => setShowStandardMeasuresModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-bold text-sm transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] border border-blue-400/30"
                >
                  <Plus className="w-4 h-4" />
                  Mesures standards
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
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-bold text-sm transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] border border-blue-400/30"
                >
                  <Plus className="w-4 h-4" />
                  Mesure supplémentaire
                </button>
              </div>

              {customMeasures.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-blue-400/20">
                  <button
                    onClick={() => {
                      setShowCustomMeasureModal(false);
                      setCustomMeasures([]);
                    }}
                    className="flex-1 px-4 py-2.5 bg-slate-800/70 hover:bg-slate-700/70 text-slate-300 hover:text-white rounded-lg font-bold text-sm transition-all border border-slate-600 hover:border-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.3)]"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      const currentCategory = duerpCategories[selectedDuerpCategory];
                      const currentDuerpQuestion = currentCategory.questions[selectedDuerpQuestion];

                      // Calculate the new response with custom measures
                      setDuerpResponses(prev => {
                        const current = prev[currentDuerpQuestion.id] || {
                          selectedMeasures: [],
                          customMeasures: [],
                          riskStatus: null,
                          actionPlanMeasures: [],
                          riskPriority: null,
                          remarks: ''
                        };

                        const newResponse = {
                          ...current,
                          customMeasures: [...current.customMeasures, ...customMeasures]
                        };

                        setTimeout(() => saveDuerpResponseData(currentDuerpQuestion.id, currentCategory.id, newResponse), 100);

                        return {
                          ...prev,
                          [currentDuerpQuestion.id]: newResponse
                        };
                      });

                      setShowCustomMeasureModal(false);
                      setCustomMeasures([]);
                    }}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-bold text-sm transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] border border-green-400/30"
                  >
                    Enregistrer les mesures
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <PdfPreviewModal
        isOpen={showPdfPreview}
        onClose={() => setShowPdfPreview(false)}
        clientId={clientId}
        typeDiagnostic={typeDiagnostic}
      />
    </div>
  );
};

export default DiagnosticGarageForm;
