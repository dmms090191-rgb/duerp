import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Save, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
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

const Argumentaire: React.FC = () => {
  const [items, setItems] = useState<ArgumentaireItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    categorie: 'Général'
  });

  const categories = ['Tous', 'Général', 'Objections', 'Prix', 'Concurrence', 'Techniques de vente', 'Produits', 'Services'];

  useEffect(() => {
    loadArgumentaire();
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
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Argumentaire</h2>
            <p className="text-xs md:text-sm text-gray-500">Gérez vos arguments de vente</p>
          </div>
        </div>
        <button
          onClick={() => setAddingNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
        >
          <Plus className="w-4 h-4" />
          Nouvel argument
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {addingNew && (
        <div className="mb-6 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3">Nouvel argument</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Titre"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={formData.categorie}
              onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
              className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.filter(cat => cat !== 'Tous').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <textarea
              placeholder="Contenu"
              value={formData.contenu}
              onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
              className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAdd}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm md:text-base rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white text-sm md:text-base rounded-lg hover:bg-gray-600 transition-colors"
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
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              {categorie}
              <span className="text-xs md:text-sm text-gray-500 font-normal">({categoryItems.length})</span>
            </h3>
            <div className="space-y-2">
              {categoryItems.map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors">
                  {editingId === item.id ? (
                    <div className="p-3 md:p-4 bg-yellow-50">
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={formData.titre}
                          onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                          className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={formData.categorie}
                          onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                          className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {categories.filter(cat => cat !== 'Tous').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <textarea
                          value={formData.contenu}
                          onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                          className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                        />
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleUpdate(item.id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm md:text-base rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            Enregistrer
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white text-sm md:text-base rounded-lg hover:bg-gray-600 transition-colors"
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
                        className="p-3 md:p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleExpand(item.id)}
                      >
                        <div className="flex items-start md:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            {expandedItems.has(item.id) ? (
                              <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" />
                            )}
                            <h4 className="text-sm md:text-base font-semibold text-gray-900 break-words">{item.titre}</h4>
                          </div>
                          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => startEdit(item)}
                              className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      {expandedItems.has(item.id) && (
                        <div className="px-3 md:px-4 pb-3 md:pb-4 pt-0 border-t border-gray-200 bg-gray-50">
                          <p className="text-xs md:text-sm text-gray-700 whitespace-pre-wrap">{item.contenu}</p>
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
          <FileText className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm md:text-base text-gray-500">Aucun argument trouvé</p>
        </div>
      )}
    </div>
  );
};

export default Argumentaire;
