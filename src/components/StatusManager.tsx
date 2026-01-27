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
      <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-4 ring-white/30">
                <Tag className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-extrabold">Liste des Statuts</h2>
            </div>
            <p className="text-blue-100 font-semibold ml-[72px]">Gérez les statuts pour vos leads et clients</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/30 shadow-xl">
            <div className="text-4xl font-extrabold">{statuses.length}</div>
            <div className="text-sm text-blue-100 font-semibold">Statuts</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20 rounded-2xl shadow-2xl border-2 border-blue-200 backdrop-blur-xl">
        <div className="border-b-2 border-blue-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2 px-6 py-4 font-bold transition-all text-sm ${
                activeTab === 'create'
                  ? 'text-blue-700 border-b-4 border-blue-600 bg-gradient-to-b from-blue-50 to-blue-100/50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
              }`}
            >
              <Plus className="w-5 h-5" />
              Créer un statut
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-6 py-4 font-bold transition-all text-sm ${
                activeTab === 'list'
                  ? 'text-blue-700 border-b-4 border-blue-600 bg-gradient-to-b from-blue-50 to-blue-100/50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
              }`}
            >
              <List className="w-5 h-5" />
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
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all font-semibold shadow-sm hover:border-blue-300"
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
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg font-bold transform hover:scale-105"
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
                        className={`w-full h-16 rounded-xl transition-all shadow-md ${
                          color
                            ? newStatusColor === color
                              ? 'ring-4 ring-blue-500 scale-110 cursor-pointer shadow-xl'
                              : 'hover:scale-105 ring-2 ring-blue-300 cursor-pointer hover:shadow-lg'
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 cursor-not-allowed'
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
                    <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-xl shadow-md">
                      <p className="text-sm text-orange-900 font-bold">
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
                        className="w-20 h-20 rounded-xl cursor-pointer border-2 border-blue-300 shadow-lg hover:shadow-xl transition-all"
                      />
                      <Palette className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white pointer-events-none" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-blue-300 shadow-md">
                        <p className="text-sm text-gray-700 mb-2 font-bold">Aperçu:</p>
                        <span
                          className="text-2xl font-extrabold"
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
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white rounded-xl font-extrabold hover:from-blue-700 hover:via-blue-600 hover:to-cyan-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Tag className="w-10 h-10 text-blue-600" />
                  </div>
                  <p className="text-gray-700 text-xl font-extrabold mb-2">Aucun statut créé</p>
                  <p className="text-gray-500 text-sm mb-6 font-semibold">
                    Créez votre premier statut pour commencer
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:via-blue-600 hover:to-cyan-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 font-extrabold"
                  >
                    <Plus className="w-5 h-5" />
                    Créer un statut
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {statuses.map((status) => (
                    <div
                      key={status.id}
                      className="bg-gradient-to-br from-white via-blue-50/20 to-cyan-50/10 border-2 border-blue-200 rounded-2xl p-6 hover:shadow-2xl transition-all shadow-lg hover:scale-105 hover:border-blue-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md"
                            style={{ backgroundColor: status.color + '20' }}
                          >
                            <Tag className="w-7 h-7" style={{ color: status.color }} />
                          </div>
                          <div>
                            <h3
                              className="text-xl font-extrabold"
                              style={{ color: status.color }}
                            >
                              {status.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 font-mono font-semibold">
                              {status.color}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteStatus(status.id)}
                          className="p-2.5 text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-110"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="pt-4 border-t-2 border-blue-200">
                        <p className="text-xs text-gray-600 font-semibold">
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
