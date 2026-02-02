import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Save, X, Search, ChevronDown, ChevronUp, File, List, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ArgumentaireItem {
  id: number;
  titre: string;
  contenu: string;
  categorie: string;
  ordre: number;
  created_at: string;
  updated_at: string;
}

interface DocumentArgumentaire {
  id: number;
  titre: string;
  contenu: string;
  created_at: string;
  updated_at: string;
}

const Argumentaire: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'document'>('list');
  const [items, setItems] = useState<ArgumentaireItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const [documents, setDocuments] = useState<DocumentArgumentaire[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [showDocumentList, setShowDocumentList] = useState(true);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [isSavingDocument, setIsSavingDocument] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    categorie: 'Général'
  });

  const categories = ['Tous', 'Général', 'Objections', 'Prix', 'Concurrence', 'Techniques de vente', 'Produits', 'Services'];

  useEffect(() => {
    loadArgumentaire();
    loadDocument();
  }, []);

  const loadArgumentaire = async () => {
    try {
      const { data, error } = await supabase
        .from('argumentaire')
        .select('*')
        .order('categorie', { ascending: true })
        .order('ordre', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'argumentaire:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('argumentaire_document')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    }
  };

  const createNewDocument = () => {
    setSelectedDocumentId(null);
    setDocumentTitle('');
    setDocumentContent('');
    setLastSaved(null);
    setShowDocumentList(false);
  };

  const openDocument = (doc: DocumentArgumentaire) => {
    setSelectedDocumentId(doc.id);
    setDocumentTitle(doc.titre);
    setDocumentContent(doc.contenu);
    setLastSaved(new Date(doc.updated_at));
    setShowDocumentList(false);
  };

  const deleteDocument = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      const { error } = await supabase
        .from('argumentaire_document')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (selectedDocumentId === id) {
        setSelectedDocumentId(null);
        setDocumentTitle('');
        setDocumentContent('');
        setLastSaved(null);
        setShowDocumentList(true);
      }

      loadDocument();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du document');
    }
  };

  const saveDocument = async () => {
    if (!documentTitle.trim()) {
      alert('Veuillez entrer un titre pour votre document');
      return;
    }

    setIsSavingDocument(true);
    try {
      if (selectedDocumentId) {
        const { error } = await supabase
          .from('argumentaire_document')
          .update({
            titre: documentTitle,
            contenu: documentContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedDocumentId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('argumentaire_document')
          .insert([{
            titre: documentTitle,
            contenu: documentContent
          }])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setSelectedDocumentId(data.id);
        }
      }

      setLastSaved(new Date());
      loadDocument();
      alert('Document enregistré avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement du document');
    } finally {
      setIsSavingDocument(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.titre.trim() || !formData.contenu.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      const { data: maxOrdre } = await supabase
        .from('argumentaire')
        .select('ordre')
        .eq('categorie', formData.categorie)
        .order('ordre', { ascending: false })
        .limit(1)
        .maybeSingle();

      const newOrdre = maxOrdre ? maxOrdre.ordre + 1 : 1;

      const { error } = await supabase
        .from('argumentaire')
        .insert([{
          titre: formData.titre,
          contenu: formData.contenu,
          categorie: formData.categorie,
          ordre: newOrdre
        }]);

      if (error) throw error;

      setFormData({ titre: '', contenu: '', categorie: 'Général' });
      setAddingNew(false);
      loadArgumentaire();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      alert('Erreur lors de l\'ajout de l\'élément');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formData.titre.trim() || !formData.contenu.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      const { error } = await supabase
        .from('argumentaire')
        .update({
          titre: formData.titre,
          contenu: formData.contenu,
          categorie: formData.categorie,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      setFormData({ titre: '', contenu: '', categorie: 'Général' });
      loadArgumentaire();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    try {
      const { error } = await supabase
        .from('argumentaire')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadArgumentaire();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const startEdit = (item: ArgumentaireItem) => {
    setEditingId(item.id);
    setFormData({
      titre: item.titre,
      contenu: item.contenu,
      categorie: item.categorie
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAddingNew(false);
    setFormData({ titre: '', contenu: '', categorie: 'Général' });
  };

  const toggleExpand = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.contenu.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || item.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.categorie]) {
      acc[item.categorie] = [];
    }
    acc[item.categorie].push(item);
    return acc;
  }, {} as Record<string, ArgumentaireItem[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-2xl sm:rounded-3xl shadow-2xl w-full overflow-hidden border border-white/10 backdrop-blur-2xl">
      <div className="relative bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        <div className="relative flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-5 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center ring-2 sm:ring-4 ring-white/30 shadow-lg flex-shrink-0">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-white drop-shadow-lg" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-0.5 sm:mb-1 drop-shadow-lg tracking-tight truncate">
                Argumentaire
              </h2>
              <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium truncate">
                {viewMode === 'list' ? 'Organisez vos arguments de vente' : 'Créez et gérez vos documents commerciaux'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white/10 backdrop-blur-xl rounded-xl p-1.5 shadow-lg border border-white/20">
              <button
                onClick={() => setViewMode('document')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  viewMode === 'document'
                    ? 'bg-white/90 text-[#2d4578] shadow-md scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <File className="w-4 h-4" />
                <span className="hidden sm:inline">Document</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-white/90 text-[#2d4578] shadow-md scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Liste</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-h-[calc(100vh-200px)] overflow-y-auto bg-gradient-to-br from-[#1a2847]/30 via-[#2d4578]/30 to-[#1a2847]/30 p-4 sm:p-6 md:p-8">

      {viewMode === 'document' ? (
        showDocumentList ? (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">Mes Documents</h3>
                  <p className="text-sm text-white/60 mt-1">{documents.length} document{documents.length > 1 ? 's' : ''} au total</p>
                </div>
                <button
                  onClick={createNewDocument}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold whitespace-nowrap backdrop-blur-xl border border-white/30"
                >
                  <Plus className="w-5 h-5" />
                  Nouveau document
                </button>
              </div>
            </div>

            {documents.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 text-center py-12 sm:py-20 px-4">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl opacity-30"></div>
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto ring-4 ring-white/30">
                    <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Aucun document</h3>
                <p className="text-sm sm:text-base text-white/70 mb-8 max-w-md mx-auto px-4">
                  Créez votre premier document argumentaire pour organiser vos stratégies de vente
                </p>
                <button
                  onClick={createNewDocument}
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-base sm:text-lg backdrop-blur-xl border border-white/30"
                >
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                  Créer mon premier document
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden hover:border-white/40 hover:shadow-2xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1"
                  >
                    <div className="relative h-32 bg-gradient-to-br from-white/5 via-white/10 to-white/5 overflow-hidden">
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FileText className="w-16 h-16 text-white opacity-20" />
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/30">
                          <span className="text-xs text-white font-medium">
                            {new Date(doc.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <div onClick={() => openDocument(doc)}>
                        <h4 className="font-bold text-white mb-2 text-lg group-hover:text-white/80 transition-colors line-clamp-2">
                          {doc.titre || 'Sans titre'}
                        </h4>
                        <p className="text-sm text-white/60 line-clamp-3 mb-4">
                          {doc.contenu.substring(0, 120)}
                          {doc.contenu.length > 120 ? '...' : ''}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-white/20">
                        <span className="text-xs text-white/50 font-medium">
                          {doc.contenu.split('\n').filter(p => p.trim()).length} paragraphes
                        </span>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => openDocument(doc)}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-semibold backdrop-blur-xl border border-white/30"
                          >
                            <Edit className="w-4 h-4" />
                            Éditer
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(doc.id);
                            }}
                            className="p-2 text-red-300 hover:bg-red-500/20 rounded-lg transition-colors border border-red-300/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <button
                  onClick={() => setShowDocumentList(true)}
                  className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-xl transition-all hover:scale-105 font-medium backdrop-blur-xl border border-white/20"
                >
                  <ChevronDown className="w-4 h-4 rotate-90" />
                  Retour aux documents
                </button>
                {lastSaved && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white/70">
                      Sauvegardé à {lastSaved.toLocaleTimeString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="bg-white/5 backdrop-blur-xl p-4 sm:p-6 border-b border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-xl rounded-lg flex items-center justify-center flex-shrink-0 ring-2 ring-white/30">
                    <Type className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-base sm:text-lg">Titre du document</h3>
                </div>
                <input
                  type="text"
                  placeholder="Entrez un titre accrocheur..."
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-xl sm:text-2xl md:text-3xl font-bold border-2 border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 bg-white/10 text-white placeholder-white/50 backdrop-blur-xl"
                />
              </div>

              <div className="bg-white/5 backdrop-blur-xl border-b border-white/20 px-4 py-3 overflow-x-auto">
                <div className="flex items-center gap-2 sm:gap-4 min-w-max">
                  <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xl rounded-lg p-1 shadow-sm border border-white/20">
                    <button
                      className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title="Gras"
                      onClick={() => document.execCommand('bold', false)}
                    >
                      <Bold className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </button>
                    <button
                      className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title="Italique"
                      onClick={() => document.execCommand('italic', false)}
                    >
                      <Italic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </button>
                    <button
                      className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title="Souligné"
                      onClick={() => document.execCommand('underline', false)}
                    >
                      <Underline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xl rounded-lg p-1 shadow-sm border border-white/20">
                    <button
                      className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title="Aligner à gauche"
                      onClick={() => document.execCommand('justifyLeft', false)}
                    >
                      <AlignLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </button>
                    <button
                      className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title="Centrer"
                      onClick={() => document.execCommand('justifyCenter', false)}
                    >
                      <AlignCenter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </button>
                    <button
                      className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title="Aligner à droite"
                      onClick={() => document.execCommand('justifyRight', false)}
                    >
                      <AlignRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl p-4 sm:p-8 md:p-12" style={{ minHeight: '600px' }}>
                <textarea
                  placeholder="✨ Commencez à écrire votre argumentaire ici...

�� Structurez votre contenu avec clarté :

• Introduction et contexte
• Présentation de l'offre
• Avantages et bénéfices clés
• Réponses aux objections courantes
• Conclusion et appel à l'action

💡 Conseil : Soyez clair, concis et convaincant. Votre équipe s'appuiera sur ce document pour réussir ses ventes."
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                  className="w-full h-full border-none focus:outline-none resize-none text-sm sm:text-base text-white placeholder-white/40 bg-transparent"
                  style={{
                    minHeight: '400px',
                    fontFamily: 'Georgia, serif',
                    lineHeight: '1.9'
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={saveDocument}
                disabled={isSavingDocument}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-green-500/20 hover:bg-green-500/30 text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 backdrop-blur-xl border border-green-400/50"
              >
                <Save className="w-5 h-5" />
                {isSavingDocument ? 'Enregistrement...' : 'Enregistrer le document'}
              </button>
            </div>
          </div>
        )
      ) : (
        <>
          <div className="mb-4">
            <button
              onClick={() => setAddingNew(true)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm md:text-base backdrop-blur-xl border border-white/30 shadow-lg hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Nouvel argument
            </button>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/10 backdrop-blur-xl text-white placeholder-white/50"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 md:px-4 py-2 text-sm md:text-base border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/10 backdrop-blur-xl text-white"
        >
          {categories.map(cat => (
            <option key={cat} value={cat} className="bg-[#2d4578] text-white">{cat}</option>
          ))}
        </select>
      </div>

      {addingNew && (
        <div className="mb-6 p-3 md:p-4 bg-white/10 backdrop-blur-xl border border-white/30 rounded-lg shadow-lg">
          <h3 className="text-sm md:text-base font-semibold text-white mb-3">Nouvel argument</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Titre"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              className="w-full px-3 py-2 text-sm md:text-base border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/10 backdrop-blur-xl text-white placeholder-white/50"
            />
            <select
              value={formData.categorie}
              onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
              className="w-full px-3 py-2 text-sm md:text-base border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/10 backdrop-blur-xl text-white"
            >
              {categories.filter(cat => cat !== 'Tous').map(cat => (
                <option key={cat} value={cat} className="bg-[#2d4578] text-white">{cat}</option>
              ))}
            </select>
            <textarea
              placeholder="Contenu"
              value={formData.contenu}
              onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
              className="w-full px-3 py-2 text-sm md:text-base border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 h-32 bg-white/10 backdrop-blur-xl text-white placeholder-white/50"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAdd}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-white text-sm md:text-base rounded-lg transition-colors backdrop-blur-xl border border-green-400/50"
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm md:text-base rounded-lg transition-colors backdrop-blur-xl border border-white/30"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 md:space-y-6">
        {Object.entries(groupedItems).map(([categorie, categoryItems]) => (
          <div key={categorie}>
            <h3 className="text-base md:text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/70"></div>
              {categorie}
              <span className="text-xs md:text-sm text-white/50 font-normal">({categoryItems.length})</span>
            </h3>
            <div className="space-y-2">
              {categoryItems.map(item => (
                <div key={item.id} className="border border-white/20 rounded-lg overflow-hidden hover:border-white/40 transition-colors bg-white/5 backdrop-blur-xl">
                  {editingId === item.id ? (
                    <div className="p-3 md:p-4 bg-white/10">
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={formData.titre}
                          onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                          className="w-full px-3 py-2 text-sm md:text-base border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/10 backdrop-blur-xl text-white placeholder-white/50"
                        />
                        <select
                          value={formData.categorie}
                          onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                          className="w-full px-3 py-2 text-sm md:text-base border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/10 backdrop-blur-xl text-white"
                        >
                          {categories.filter(cat => cat !== 'Tous').map(cat => (
                            <option key={cat} value={cat} className="bg-[#2d4578] text-white">{cat}</option>
                          ))}
                        </select>
                        <textarea
                          value={formData.contenu}
                          onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                          className="w-full px-3 py-2 text-sm md:text-base border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 h-32 bg-white/10 backdrop-blur-xl text-white placeholder-white/50"
                        />
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleUpdate(item.id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-white text-sm md:text-base rounded-lg transition-colors backdrop-blur-xl border border-green-400/50"
                          >
                            <Save className="w-4 h-4" />
                            Enregistrer
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm md:text-base rounded-lg transition-colors backdrop-blur-xl border border-white/30"
                          >
                            <X className="w-4 h-4" />
                            Annuler
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="p-3 md:p-4 cursor-pointer hover:bg-white/5"
                        onClick={() => toggleExpand(item.id)}
                      >
                        <div className="flex items-start md:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            {expandedItems.has(item.id) ? (
                              <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-white/50 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-white/50 flex-shrink-0" />
                            )}
                            <h4 className="text-sm md:text-base font-semibold text-white break-words">{item.titre}</h4>
                          </div>
                          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => startEdit(item)}
                              className="p-1.5 md:p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 md:p-2 text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      {expandedItems.has(item.id) && (
                        <div className="px-3 md:px-4 pb-3 md:pb-4 pt-0 border-t border-white/20 bg-white/5">
                          <p className="text-xs md:text-sm text-white/80 whitespace-pre-wrap">{item.contenu}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8 md:py-12">
              <FileText className="w-10 h-10 md:w-12 md:h-12 text-white/40 mx-auto mb-3" />
              <p className="text-sm md:text-base text-white/60">Aucun argument trouvé</p>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default Argumentaire;
