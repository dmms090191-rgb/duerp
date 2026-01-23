import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Palette, List, RotateCcw } from 'lucide-react';
import { statusService } from '../services/statusService';
import { Status } from '../types/Status';

const StatusManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);
  const [savedColors, setSavedColors] = useState<(string | null)[]>(() => {
    const stored = localStorage.getItem('statusColorSlots');
    return stored ? JSON.parse(stored) : [null, null, null, null, null, null];
  });

  useEffect(() => {
    loadStatuses();
  }, []);

  useEffect(() => {
    localStorage.setItem('statusColorSlots', JSON.stringify(savedColors));
  }, [savedColors]);

  const handleResetColors = () => {
    setSavedColors([null, null, null, null, null, null]);
  };

  const allSlotsFilled = savedColors.every(color => color !== null);

  const loadStatuses = async () => {
    try {
      const data = await statusService.getAllStatuses();
      setStatuses(data);
    } catch (error) {
      console.error('Error loading statuses:', error);
    }
  };

  const handleCreateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusName.trim()) {
      return;
    }

    setLoading(true);
    try {
      await statusService.createStatus(newStatusName, newStatusColor);

      const emptySlotIndex = savedColors.findIndex(color => color === null);
      if (emptySlotIndex !== -1) {
        const newSavedColors = [...savedColors];
        newSavedColors[emptySlotIndex] = newStatusColor;
        setSavedColors(newSavedColors);
      }

      setNewStatusName('');
      setNewStatusColor('#3B82F6');
      await loadStatuses();
      setActiveTab('list');
    } catch (error) {
      console.error('Error creating status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStatus = async (id: string) => {
    try {
      await statusService.deleteStatus(id);
      await loadStatuses();
    } catch (error) {
      console.error('Error deleting status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Liste des Statuts</h2>
            <p className="text-purple-100">Gérez les statuts pour vos leads et clients</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-3xl font-bold">{statuses.length}</div>
            <div className="text-sm text-purple-100">Statuts</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors text-sm ${
                activeTab === 'create'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Plus className="w-4 h-4" />
              Créer un statut
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors text-sm ${
                activeTab === 'list'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4" />
              Liste des statuts
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'create' && (
            <div className="max-w-2xl">
              <form onSubmit={handleCreateStatus} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du statut
                  </label>
                  <input
                    type="text"
                    value={newStatusName}
                    onChange={(e) => setNewStatusName(e.target.value)}
                    placeholder="Ex: En cours, Terminé, En attente..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Couleurs enregistrées ({savedColors.filter(c => c !== null).length}/6)
                    </label>
                    <button
                      type="button"
                      onClick={handleResetColors}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Réinitialiser
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-3 mb-4">
                    {savedColors.map((color, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => color && setNewStatusColor(color)}
                        disabled={!color}
                        className={`w-full h-16 rounded-lg transition-all ${
                          color
                            ? newStatusColor === color
                              ? 'ring-4 ring-purple-500 scale-110 cursor-pointer'
                              : 'hover:scale-105 ring-2 ring-gray-300 cursor-pointer'
                            : 'bg-gray-100 border-2 border-dashed border-gray-300 cursor-not-allowed'
                        }`}
                        style={color ? { backgroundColor: color } : {}}
                        title={color || 'Case vide'}
                      >
                        {!color && (
                          <span className="text-gray-400 text-xs">Vide</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {allSlotsFilled && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800 font-medium">
                        ⚠️ Toutes les cases sont remplies. Réinitialisez pour enregistrer de nouvelles couleurs.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <input
                        type="color"
                        value={newStatusColor}
                        onChange={(e) => setNewStatusColor(e.target.value)}
                        className="w-20 h-20 rounded-lg cursor-pointer border-2 border-gray-300"
                      />
                      <Palette className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white pointer-events-none" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-300">
                        <p className="text-sm text-gray-600 mb-2">Aperçu:</p>
                        <span
                          className="text-2xl font-bold"
                          style={{ color: newStatusColor }}
                        >
                          {newStatusName || 'Nom du statut'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Code couleur: {newStatusColor}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !newStatusName.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Créer le statut
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'list' && (
            <div>
              {statuses.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium mb-2">Aucun statut créé</p>
                  <p className="text-gray-400 text-sm mb-4">
                    Créez votre premier statut pour commencer
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Créer un statut
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statuses.map((status) => (
                    <div
                      key={status.id}
                      className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: status.color + '20' }}
                          >
                            <Tag className="w-6 h-6" style={{ color: status.color }} />
                          </div>
                          <div>
                            <h3
                              className="text-xl font-bold"
                              style={{ color: status.color }}
                            >
                              {status.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {status.color}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteStatus(status.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Créé le {new Date(status.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusManager;
