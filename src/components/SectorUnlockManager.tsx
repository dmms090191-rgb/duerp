import React, { useState, useEffect } from 'react';
import { X, Lock, Unlock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { sectorUnlockService } from '../services/sectorUnlockService';

interface Sector {
  id: string;
  name: string;
  icon?: React.ElementType;
  image?: string;
  category: string;
}

interface SectorUnlockManagerProps {
  clientId: number;
  clientName: string;
  onClose: () => void;
}

const sectorsBase = [
  { name: 'Accueil de jeunes enfants', image: '/accueil_de_jeunes_enfants.png', category: 'Services' },
  { name: 'Agriculture tropicale', image: '/agriculture_tropicale.png', category: 'Agriculture' },
  { name: 'Aide à domicile', image: '/aide_a_domicile copy.png', category: 'Services' },
  { name: 'Ameublement', image: '/ameublement.png', category: 'Commerce' },
  { name: 'Boucherie Charcuterie', image: '/boucherie_charcuterie copy.png', category: 'Commerce' },
  { name: 'Boulangerie / Pâtisserie / Chocolaterie / Confiserie / Glacerie', image: '/boulangerie_patisserie_chocolaterie_confiserie_glacerie copy.png', category: 'Alimentation' },
  { name: 'Cabinet dentaire', image: '/cabinet_dentaire.png', category: 'Santé' },
  { name: 'Centre de contrôle technique', image: '/centre_de_controle_technique.png', category: 'Automobile' },
  { name: 'Clubs sportifs', image: '/clubs_sportifs.png', category: 'Sport' },
  { name: 'Coiffure', image: '/coiffure.png', category: 'Services' },
  { name: 'Commerce alimentaire de proximité', image: '/commerce_alimentaire_de_proximite.png', category: 'Commerce' },
  { name: 'Commerce de gros alimentaire', image: '/commerce_de_gros_alimentaire.png', category: 'Commerce' },
  { name: 'Commerce de gros non alimentaire', image: '/commerce_de_gros_non_alimentaire.png', category: 'Commerce' },
  { name: 'Commerce non alimentaire', image: '/commerce_non_alimentaire.png', category: 'Commerce' },
  { name: 'Culture de la banane', image: '/culture_de_la_banane.png', category: 'Agriculture' },
  { name: 'Culture de la canne à sucre', image: '/culture_de_la_canne_a_sucre.png', category: 'Agriculture' },
  { name: 'Cultures marines', image: '/cultures_marines.png', category: 'Agriculture' },
  { name: 'Déménagement', image: '/demenagement.png', category: 'Transport' },
  { name: 'EHPAD', image: '/ehpad.png', category: 'Santé' },
  { name: 'Emballage bois', image: '/emballage_bois.png', category: 'Industrie' },
  { name: 'Garages automobiles et poids lourds', image: '/garages_automobiles_et_poids_lourds.png', category: 'Automobile' },
  { name: 'HCR – Hôtels, cafés, restaurants', image: '/hcr_–_hotels,_cafes,_restaurants.png', category: 'Restauration' },
  { name: 'Industries graphiques', image: '/industries_graphiques.png', category: 'Industrie' },
  { name: 'Mécanique industrielle', image: '/mecanique_industrielle.png', category: 'Industrie' },
  { name: 'Messagerie, Fret express', image: '/messagerie,_fret_express.png', category: 'Transport' },
  { name: 'Métallerie, travail des métaux', image: '/metallerie,_travail_des_metaux.png', category: 'Industrie' },
  { name: 'Navires à passagers', image: '/navires_a_passagers.png', category: 'Transport' },
  { name: 'OiRA générique', image: '/oira_generique.png', category: 'Général' },
  { name: 'Organisations associatives', image: '/organisations_associatives.png', category: 'Associatif' },
  { name: 'Pêches maritimes', image: '/peches_maritimes.png', category: 'Agriculture' },
  { name: "Pharmacie d'officine", image: "/pharmacie_d'officine.png", category: 'Santé' },
  { name: 'Plasturgie', image: '/plasturgie.png', category: 'Industrie' },
  { name: 'Poissonnerie', image: '/poissonnerie.png', category: 'Commerce' },
  { name: 'Production audiovisuelle, cinématographique et publicitaire', image: '/production_audiovisuelle,_cinematographique_et_publicitaire.png', category: 'Services' },
  { name: 'Propreté', image: '/proprete.png', category: 'Services' },
  { name: 'Prothésiste dentaire', image: '/prothesiste_dentaire.png', category: 'Santé' },
  { name: 'Restauration collective', image: '/restauration_collective.png', category: 'Restauration' },
  { name: 'Restauration rapide', image: '/restauration_rapide.png', category: 'Restauration' },
  { name: 'Scierie', image: '/scierie.png', category: 'Industrie' },
  { name: 'Services funéraires', image: '/services_funeraires.png', category: 'Services' },
  { name: 'Soins esthétiques', image: '/soins_esthetiques.png', category: 'Services' },
  { name: 'Soins et prothésie ongulaire', image: '/soin_et_prothesie_ongulaire.png', category: 'Services' },
  { name: 'Traitement des métaux', image: '/traitement_des_metaux.png', category: 'Industrie' },
  { name: 'Traiteurs et organisateurs de réception', image: '/traiteurs_et_organisateurs_de_reception.png', category: 'Restauration' },
  { name: 'Transport routier de marchandises', image: '/transport_routier_de_marchandises.png', category: 'Transport' },
  { name: 'Transport routier de voyageurs', image: '/transport_routier_de_voyageurs.png', category: 'Transport' },
  { name: 'Transport sanitaire', image: '/transport_sanitaire.png', category: 'Transport' },
  { name: 'Travail de bureau', image: '/travail_de_bureau.png', category: 'Services' },
  { name: 'Tri et collecte des déchets', image: '/tri_et_collecte_des_dechets.png', category: 'Environnement' },
  { name: 'Vétérinaire', image: '/veterinaire.png', category: 'Santé' },
];

const sectors: Sector[] = sectorsBase
  .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
  .map((sector, index) => ({
    ...sector,
    id: String(index + 1).padStart(2, '0')
  }));

const SectorUnlockManager: React.FC<SectorUnlockManagerProps> = ({ clientId, clientName, onClose }) => {
  const [unlockedSectorIds, setUnlockedSectorIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUnlockedSectors();
  }, [clientId]);

  const loadUnlockedSectors = async () => {
    try {
      setLoading(true);
      const unlockedSectors = await sectorUnlockService.getUnlockedSectors(clientId);
      setUnlockedSectorIds(new Set(unlockedSectors.map(s => s.sector_id)));
    } catch (error) {
      console.error('Error loading unlocked sectors:', error);
      showMessage('error', 'Erreur lors du chargement des secteurs');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleToggleSector = async (sector: Sector) => {
    try {
      setProcessing(true);
      const isUnlocked = unlockedSectorIds.has(sector.id);

      if (isUnlocked) {
        await sectorUnlockService.lockSector(clientId, sector.id);
        setUnlockedSectorIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(sector.id);
          return newSet;
        });
        showMessage('success', `Secteur "${sector.name}" verrouillé`);
      } else {
        await sectorUnlockService.unlockSector(clientId, sector.id, sector.name);
        setUnlockedSectorIds(prev => new Set(prev).add(sector.id));
        showMessage('success', `Secteur "${sector.name}" débloqué`);
      }
    } catch (error) {
      console.error('Error toggling sector:', error);
      showMessage('error', 'Erreur lors de la modification');
    } finally {
      setProcessing(false);
    }
  };

  const handleUnlockAll = async () => {
    try {
      setProcessing(true);
      await sectorUnlockService.unlockAllSectors(
        clientId,
        sectors.map(s => ({ id: s.id, name: s.name }))
      );
      setUnlockedSectorIds(new Set(sectors.map(s => s.id)));
      showMessage('success', 'Tous les secteurs ont été débloqués');
    } catch (error) {
      console.error('Error unlocking all sectors:', error);
      showMessage('error', 'Erreur lors du déblocage de tous les secteurs');
    } finally {
      setProcessing(false);
    }
  };

  const handleLockAll = async () => {
    try {
      setProcessing(true);
      await sectorUnlockService.lockAllSectors(clientId);
      setUnlockedSectorIds(new Set());
      showMessage('success', 'Tous les secteurs ont été verrouillés');
    } catch (error) {
      console.error('Error locking all sectors:', error);
      showMessage('error', 'Erreur lors du verrouillage de tous les secteurs');
    } finally {
      setProcessing(false);
    }
  };

  const unlockedCount = unlockedSectorIds.size;
  const totalCount = sectors.length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Gestion des secteurs d'activité</h2>
            <p className="text-blue-100 text-sm mt-1">Client: {clientName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">{unlockedCount}</span> / {totalCount} secteurs débloqués
              </div>
              <div className="h-2 w-48 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-300"
                  style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUnlockAll}
                disabled={processing || unlockedCount === totalCount}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                <Unlock className="w-4 h-4" />
                Tout débloquer
              </button>
              <button
                onClick={handleLockAll}
                disabled={processing || unlockedCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                <Lock className="w-4 h-4" />
                Tout verrouiller
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sectors.map((sector) => {
                const isUnlocked = unlockedSectorIds.has(sector.id);

                return (
                  <button
                    key={sector.id}
                    onClick={() => handleToggleSector(sector)}
                    disabled={processing}
                    className={`relative group transition-all duration-200 ${
                      processing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    <div className={`relative bg-white rounded-xl overflow-hidden shadow-md border-2 transition-all ${
                      isUnlocked
                        ? 'border-green-500 shadow-green-500/20'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}>
                      <div className={`relative h-32 overflow-hidden ${
                        isUnlocked ? 'bg-gradient-to-br from-green-400 to-green-500' : 'bg-gradient-to-br from-gray-300 to-gray-400'
                      }`}>
                        {sector.image && !imageErrors.has(sector.id) ? (
                          <img
                            src={sector.image}
                            alt={sector.name}
                            className={`w-full h-full object-cover ${isUnlocked ? '' : 'grayscale opacity-50'}`}
                            onError={() => {
                              setImageErrors(prev => new Set(prev).add(sector.id));
                            }}
                          />
                        ) : null}

                        <div className="absolute inset-0 flex items-center justify-center">
                          {isUnlocked ? (
                            <Unlock className="w-10 h-10 text-white drop-shadow-lg" />
                          ) : (
                            <Lock className="w-10 h-10 text-white/70 drop-shadow-lg" />
                          )}
                        </div>

                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-white/95 text-gray-700">
                            #{sector.id}
                          </span>
                        </div>

                        {isUnlocked && (
                          <div className="absolute top-2 left-2">
                            <CheckCircle className="w-6 h-6 text-white drop-shadow-lg" />
                          </div>
                        )}
                      </div>

                      <div className="p-3">
                        <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 min-h-[2.5rem]">
                          {sector.name}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                            {sector.category}
                          </span>
                          <span className={`text-xs font-bold ${
                            isUnlocked ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {isUnlocked ? 'Débloqué' : 'Verrouillé'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectorUnlockManager;
