import React, { useState, useEffect } from 'react';
import { Truck, UtensilsCrossed, Wrench, Heart, ClipboardCheck, Stethoscope, FlaskConical, Church, Pill, Package, TreePine, Factory, Baby, Hammer, ShoppingCart, Store, Users, Building2, Sparkles, Recycle, Wheat, Leaf, Banana, Package2, ShoppingBag, Dog, Armchair, Scissors, Search, Cake, Settings, Trash2, Home, Printer, Ambulance, Briefcase, Fish, TruckIcon, FileCheck, Hand, Bus, Waves, Ship, ChefHat, Hotel, Video, Lock, Unlock, FileEdit } from 'lucide-react';
import { sectorUnlockService } from '../services/sectorUnlockService';

interface SectorSelectionProps {
  onSelectSector: (sector: string) => void;
  onOpenForm?: (sector: string) => void;
  onSectorAssigned?: (sectorId: string, sectorName: string) => void;
  onSectorUnassigned?: () => void;
  currentType?: string;
  unlockedSectorIds?: string[];
  canToggleLock?: boolean;
  clientId?: number;
  userType?: 'admin' | 'seller' | 'client';
  hideFilters?: boolean;
}

interface Sector {
  id: string;
  name: string;
  icon?: React.ElementType;
  image?: string;
  status: 'actif' | 'archive';
  category: string;
}

const sectorsBase = [
  { name: 'Accueil de jeunes enfants', icon: Baby, image: '/accueil_de_jeunes_enfants.png', status: 'actif', category: 'Services' },
  { name: 'Agriculture tropicale', icon: Wheat, image: '/agriculture_tropicale.png', status: 'actif', category: 'Agriculture' },
  { name: 'Aide à domicile', icon: Home, image: '/aide_a_domicile copy.png', status: 'actif', category: 'Services' },
  { name: 'Ameublement', icon: Armchair, image: '/ameublement.png', status: 'actif', category: 'Commerce' },
  { name: 'Boucherie Charcuterie', icon: ShoppingCart, image: '/boucherie_charcuterie copy.png', status: 'actif', category: 'Commerce' },
  { name: 'Boulangerie / Pâtisserie / Chocolaterie / Confiserie / Glacerie', icon: Cake, image: '/boulangerie_patisserie_chocolaterie_confiserie_glacerie copy.png', status: 'actif', category: 'Alimentation' },
  { name: 'Cabinet dentaire', icon: Stethoscope, image: '/cabinet_dentaire.png', status: 'actif', category: 'Santé' },
  { name: 'Centre de contrôle technique', icon: ClipboardCheck, image: '/centre_de_controle_technique.png', status: 'actif', category: 'Automobile' },
  { name: 'Clubs sportifs', icon: Users, image: '/clubs_sportifs.png', status: 'actif', category: 'Sport' },
  { name: 'Coiffure', icon: Scissors, image: '/coiffure.png', status: 'actif', category: 'Services' },
  { name: 'Commerce alimentaire de proximité', icon: ShoppingBag, image: '/commerce_alimentaire_de_proximite.png', status: 'actif', category: 'Commerce' },
  { name: 'Commerce de gros alimentaire', icon: ShoppingCart, image: '/commerce_de_gros_alimentaire.png', status: 'actif', category: 'Commerce' },
  { name: 'Commerce de gros non alimentaire', icon: Store, image: '/commerce_de_gros_non_alimentaire.png', status: 'actif', category: 'Commerce' },
  { name: 'Commerce non alimentaire', icon: Store, image: '/commerce_non_alimentaire.png', status: 'actif', category: 'Commerce' },
  { name: 'Culture de la banane', icon: Banana, image: '/culture_de_la_banane.png', status: 'actif', category: 'Agriculture' },
  { name: 'Culture de la canne à sucre', icon: Leaf, image: '/culture_de_la_canne_a_sucre.png', status: 'actif', category: 'Agriculture' },
  { name: 'Cultures marines', icon: Waves, image: '/cultures_marines.png', status: 'actif', category: 'Agriculture' },
  { name: 'Déménagement', icon: TruckIcon, image: '/demenagement.png', status: 'actif', category: 'Transport' },
  { name: 'EHPAD', icon: Heart, image: '/ehpad.png', status: 'actif', category: 'Santé' },
  { name: 'Emballage bois', icon: Package, image: '/emballage_bois.png', status: 'actif', category: 'Industrie' },
  { name: 'Garages automobiles et poids lourds', icon: Wrench, image: '/garages_automobiles_et_poids_lourds.png', status: 'actif', category: 'Automobile' },
  { name: 'HCR – Hôtels, cafés, restaurants', icon: Hotel, image: '/hcr_–_hotels,_cafes,_restaurants.png', status: 'actif', category: 'Restauration' },
  { name: 'Industries graphiques', icon: Printer, image: '/industries_graphiques.png', status: 'actif', category: 'Industrie' },
  { name: 'Mécanique industrielle', icon: Settings, image: '/mecanique_industrielle.png', status: 'actif', category: 'Industrie' },
  { name: 'Messagerie, Fret express', icon: Package2, image: '/messagerie,_fret_express.png', status: 'actif', category: 'Transport' },
  { name: 'Métallerie, travail des métaux', icon: Hammer, image: '/metallerie,_travail_des_metaux.png', status: 'actif', category: 'Industrie' },
  { name: 'Navires à passagers', icon: Ship, image: '/navires_a_passagers.png', status: 'actif', category: 'Transport' },
  { name: 'OiRA générique', icon: FileCheck, image: '/oira_generique.png', status: 'actif', category: 'Général' },
  { name: 'Organisations associatives', icon: Building2, image: '/organisations_associatives.png', status: 'actif', category: 'Associatif' },
  { name: 'Pêches maritimes', icon: Fish, image: '/peches_maritimes.png', status: 'actif', category: 'Agriculture' },
  { name: 'Pharmacie d\'officine', icon: Pill, image: '/pharmacie_d\'officine.png', status: 'actif', category: 'Santé' },
  { name: 'Plasturgie', icon: Recycle, image: '/plasturgie.png', status: 'actif', category: 'Industrie' },
  { name: 'Poissonnerie', icon: Fish, image: '/poissonnerie.png', status: 'actif', category: 'Commerce' },
  { name: 'Production audiovisuelle, cinématographique et publicitaire', icon: Video, image: '/production_audiovisuelle,_cinematographique_et_publicitaire.png', status: 'actif', category: 'Services' },
  { name: 'Propreté', icon: Sparkles, image: '/proprete.png', status: 'actif', category: 'Services' },
  { name: 'Prothésiste dentaire', icon: FlaskConical, image: '/prothesiste_dentaire.png', status: 'actif', category: 'Santé' },
  { name: 'Restauration collective', icon: UtensilsCrossed, image: '/restauration_collective.png', status: 'actif', category: 'Restauration' },
  { name: 'Restauration rapide', icon: UtensilsCrossed, image: '/restauration_rapide.png', status: 'actif', category: 'Restauration' },
  { name: 'Scierie', icon: TreePine, image: '/scierie.png', status: 'actif', category: 'Industrie' },
  { name: 'Services funéraires', icon: Church, image: '/services_funeraires.png', status: 'actif', category: 'Services' },
  { name: 'Soins esthétiques', icon: Sparkles, image: '/soins_esthetiques.png', status: 'actif', category: 'Services' },
  { name: 'Soins et prothésie ongulaire', icon: Hand, image: '/soin_et_prothesie_ongulaire.png', status: 'actif', category: 'Services' },
  { name: 'Traitement des métaux', icon: Factory, image: '/traitement_des_metaux.png', status: 'actif', category: 'Industrie' },
  { name: 'Traiteurs et organisateurs de réception', icon: ChefHat, image: '/traiteurs_et_organisateurs_de_reception.png', status: 'actif', category: 'Restauration' },
  { name: 'Transport routier de marchandises', icon: Truck, image: '/transport_routier_de_marchandises.png', status: 'actif', category: 'Transport' },
  { name: 'Transport routier de voyageurs', icon: Bus, image: '/transport_routier_de_voyageurs.png', status: 'actif', category: 'Transport' },
  { name: 'Transport sanitaire', icon: Ambulance, image: '/transport_sanitaire.png', status: 'actif', category: 'Transport' },
  { name: 'Travail de bureau', icon: Briefcase, image: '/travail_de_bureau.png', status: 'actif', category: 'Services' },
  { name: 'Tri et collecte des déchets', icon: Trash2, image: '/tri_et_collecte_des_dechets.png', status: 'actif', category: 'Environnement' },
  { name: 'Vétérinaire', icon: Dog, image: '/veterinaire.png', status: 'actif', category: 'Santé' },
];

const sectors: Sector[] = sectorsBase
  .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
  .map((sector, index) => ({
    ...sector,
    id: String(index + 1).padStart(2, '0')
  }));

const SectorSelection: React.FC<SectorSelectionProps> = ({ onSelectSector, onOpenForm, onSectorAssigned, onSectorUnassigned, currentType, unlockedSectorIds: initialUnlockedSectorIds, canToggleLock = false, clientId, userType, hideFilters = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [unlockedSectorIds, setUnlockedSectorIds] = useState<string[]>(initialUnlockedSectorIds || []);
  const [togglingLock, setTogglingLock] = useState<string | null>(null);

  useEffect(() => {
    if (initialUnlockedSectorIds) {
      setUnlockedSectorIds(initialUnlockedSectorIds);
    }
  }, [initialUnlockedSectorIds]);

  useEffect(() => {
    if (!clientId) return;

    const unsubscribe = sectorUnlockService.subscribeToUnlockedSectors(clientId, (unlockedSectors) => {
      setUnlockedSectorIds(unlockedSectors.map(s => s.sector_id));
    });

    return () => {
      unsubscribe();
    };
  }, [clientId]);

  const handleToggleLock = async (e: React.MouseEvent, sector: { id: string; name: string }) => {
    e.stopPropagation();

    if (!canToggleLock || !clientId || userType === 'client') {
      return;
    }

    setTogglingLock(sector.id);

    const isCurrentlyUnlocked = unlockedSectorIds.includes(sector.id);
    const previousIds = [...unlockedSectorIds];

    if (isCurrentlyUnlocked) {
      setUnlockedSectorIds([]);
    } else {
      setUnlockedSectorIds([sector.id]);
    }

    if (isCurrentlyUnlocked) {
      onSectorUnassigned?.();
    } else {
      onSectorAssigned?.(sector.id, sector.name);
    }

    try {
      if (isCurrentlyUnlocked) {
        await sectorUnlockService.lockAllSectors(clientId);
      } else {
        await sectorUnlockService.selectSingleSector(clientId, sector.id, sector.name);
      }
    } catch (error) {
      console.error('Error selecting sector:', error);
      setUnlockedSectorIds(previousIds);
    } finally {
      setTogglingLock(null);
    }
  };

  const showOnlyUnlockedSectors = !canToggleLock && unlockedSectorIds && unlockedSectorIds.length > 0;

  const availableSectors = showOnlyUnlockedSectors
    ? sectors.filter(sector => unlockedSectorIds.includes(sector.id))
    : sectors;

  const categories = ['all', ...Array.from(new Set(availableSectors.map(s => s.category)))];

  const filteredSectors = availableSectors
    .filter(sector => {
      const matchesSearch = sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sector.id.includes(searchTerm);
      const matchesCategory = selectedCategory === 'all' || sector.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-600/10 rounded-3xl blur-3xl" />
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-blue-200/50 shadow-xl space-y-6">
          <div className="flex flex-col gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-600/70 z-10" />
              <input
                type="text"
                placeholder="Rechercher un secteur d'activité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="relative w-full pl-14 pr-6 py-4 bg-white border-2 border-blue-200/60 rounded-2xl text-gray-900 text-lg placeholder-gray-500 focus:ring-4 focus:ring-blue-400/30 focus:border-blue-500 transition-all duration-300 shadow-sm"
              />
            </div>

            {!hideFilters && (
              <div className="flex flex-wrap gap-3">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                        : 'bg-white/80 text-gray-700 hover:bg-blue-50 border border-blue-200/50 hover:border-blue-400/50'
                    }`}
                  >
                    <span className="relative z-10">{category === 'all' ? 'Tous' : category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSectors.map((sector) => {
          const Icon = sector.icon;
          const isSelected = currentType === `${sector.id} ${sector.name}`;
          const isSectorUnlocked = unlockedSectorIds.includes(sector.id);
          const isLocked = !isSectorUnlocked;
          const hasAnyAssigned = canToggleLock && unlockedSectorIds.length > 0;
          const isGrayedOut = hasAnyAssigned && !isSectorUnlocked;

          return (
            <div
              key={sector.id}
              className={`group relative transition-all duration-300 ${
                isGrayedOut ? 'opacity-40 grayscale' : isLocked && !canToggleLock ? 'opacity-60' : isSectorUnlocked ? 'scale-[1.03]' : 'hover:scale-[1.02]'
              }`}
            >
              <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                isSectorUnlocked
                  ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/20 blur-xl scale-105'
                  : isGrayedOut
                  ? ''
                  : isLocked
                  ? 'bg-gradient-to-br from-gray-500/10 to-gray-600/10 blur-xl'
                  : isSelected
                  ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-xl scale-105'
                  : 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-xl opacity-0 group-hover:opacity-100 group-hover:scale-105'
              }`} />

              <div className={`relative bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
                isSectorUnlocked
                  ? 'border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20 ring-2 ring-emerald-400/30'
                  : isLocked && !canToggleLock
                  ? 'border border-gray-300'
                  : isSelected
                  ? 'border-2 border-blue-500 shadow-2xl shadow-blue-500/20'
                  : 'border border-gray-200 group-hover:border-blue-300 group-hover:shadow-xl'
              }`}>
                <div
                  className={`relative h-48 overflow-hidden bg-gradient-to-br transition-all duration-300 ${
                    isSectorUnlocked
                      ? 'from-emerald-500 via-green-500 to-emerald-600'
                      : isGrayedOut
                      ? 'from-gray-400 via-gray-500 to-gray-600'
                      : isLocked
                      ? 'from-gray-400 via-gray-500 to-gray-600'
                      : isSelected
                      ? 'from-blue-500 via-cyan-500 to-blue-600'
                      : 'from-blue-400 via-cyan-400 to-blue-500 group-hover:from-blue-500 group-hover:via-cyan-500 group-hover:to-blue-600'
                  } ${canToggleLock && userType !== 'client' ? 'cursor-pointer' : ''}`}
                  onClick={(e) => canToggleLock && userType !== 'client' ? handleToggleLock(e, sector) : undefined}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                  {canToggleLock && userType !== 'client' && (
                    <div className="absolute top-3 left-3 z-20">
                      <div className={`backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-lg ${
                        isSectorUnlocked ? 'bg-emerald-500/90' : 'bg-white/90'
                      }`}>
                        {togglingLock === sector.id ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : isLocked ? (
                          <Lock className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Unlock className="w-4 h-4 text-white" />
                        )}
                        <span className={`text-xs font-semibold ${isSectorUnlocked ? 'text-white' : 'text-gray-700'}`}>
                          {isLocked ? 'Cliquez pour attribuer' : 'Attribue au client'}
                        </span>
                      </div>
                    </div>
                  )}

                  {isLocked && !canToggleLock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <Lock className="w-16 h-16 text-white drop-shadow-2xl" />
                    </div>
                  )}

                  {sector.image && !imageErrors.has(sector.id) ? (
                    <img
                      src={sector.image}
                      alt={sector.name}
                      className={`w-full h-full object-cover transition-transform duration-500 ${isLocked && !canToggleLock ? 'grayscale' : 'group-hover:scale-110'}`}
                      onError={() => {
                        setImageErrors(prev => new Set(prev).add(sector.id));
                      }}
                    />
                  ) : Icon ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className={`w-20 h-20 drop-shadow-2xl ${isLocked ? 'text-white/50' : 'text-white/90'}`} />
                    </div>
                  ) : null}

                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-blue-600 backdrop-blur-sm shadow-lg">
                      #{sector.id}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md ${
                      sector.status === 'actif'
                        ? 'bg-emerald-500/95 text-white'
                        : 'bg-gray-600/95 text-white'
                    }`}>
                      {sector.status === 'actif' ? 'ACTIF' : 'ARCHIVÉ'}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 min-h-[3.5rem]">
                      {sector.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                        {sector.category}
                      </span>
                    </div>
                  </div>

                  {canToggleLock && userType !== 'client' ? (
                    <div className="space-y-2">
                      <button
                        onClick={(e) => handleToggleLock(e, sector)}
                        disabled={togglingLock === sector.id}
                        className={`relative w-full py-3.5 px-6 rounded-xl font-bold transition-all duration-300 overflow-hidden ${
                          isSectorUnlocked
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30 hover:from-red-500 hover:to-red-600 hover:shadow-red-500/30'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5'
                        }`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {togglingLock === sector.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : isSectorUnlocked ? (
                            <>
                              <Unlock className="w-4 h-4" />
                              Outil attribue - Cliquer pour retirer
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              Attribuer au client
                            </>
                          )}
                        </span>
                      </button>
                      {isSectorUnlocked && onOpenForm && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenForm(`${sector.id} ${sector.name}`);
                          }}
                          className="relative w-full py-3 px-6 rounded-xl font-bold transition-all duration-300 overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <FileEdit className="w-4 h-4" />
                            Remplir le formulaire
                          </span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectSector(`${sector.id} ${sector.name}`)}
                      disabled={sector.status === 'archive' || isLocked}
                      className={`relative w-full py-3.5 px-6 rounded-xl font-bold transition-all duration-300 overflow-hidden ${
                        isLocked
                          ? 'bg-gray-400 text-gray-100 cursor-not-allowed'
                          : sector.status === 'actif'
                          ? isSelected
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLocked ? (
                          <>
                            <Lock className="w-4 h-4" />
                            Verrouille
                          </>
                        ) : isSelected ? (
                          <>
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            Selectionne
                          </>
                        ) : sector.status === 'actif' ? (
                          'Commencer'
                        ) : (
                          'Telecharger'
                        )}
                      </span>
                    </button>
                  )}
                </div>

                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSectors.length === 0 && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-3xl" />
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-16 border border-blue-200/50 text-center shadow-xl">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-blue-500" />
            </div>
            <p className="text-gray-900 text-xl font-bold">
              Aucun secteur trouvé pour "{searchTerm}"
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Essayez avec d'autres mots-clés
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorSelection;
