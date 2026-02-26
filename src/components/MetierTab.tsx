import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search, Wrench, X, Filter, Plus, Check, Link2, Unlink, Trash2,
  HardHat, Cog, Loader2, ChevronDown, ChevronUp, Copy, ClipboardCheck
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SectorItem {
  id: string;
  name: string;
  shortName: string;
  icon: React.ElementType;
  image: string;
  category: string;
  keywords: string[];
}

interface CustomMetier {
  id: string;
  name: string;
  created_at: string;
  affiliatedTools: AffiliatedTool[];
}

interface AffiliatedTool {
  id: string;
  metier_id: string;
  tool_sector_id: string;
  tool_name: string;
}

const normalize = (str: string) =>
  str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const sectorsData: Omit<SectorItem, 'id'>[] = [
  { name: 'Accueil de jeunes enfants', shortName: 'Enfants', icon: Wrench, image: '/accueil_de_jeunes_enfants.png', category: 'Services', keywords: ['creche', 'garderie', 'enfant', 'bebe', 'petite enfance', 'assistante maternelle', 'nourrice'] },
  { name: 'Agriculture tropicale', shortName: 'Agriculture', icon: Wrench, image: '/agriculture_tropicale.png', category: 'Agriculture', keywords: ['agriculture', 'tropical', 'plantation', 'culture', 'ferme', 'exploitation'] },
  { name: 'Aide à domicile', shortName: 'Aide domicile', icon: Wrench, image: '/aide_a_domicile copy.png', category: 'Services', keywords: ['aide', 'domicile', 'menage', 'personne agee', 'auxiliaire', 'maintien'] },
  { name: 'Ameublement', shortName: 'Ameublement', icon: Wrench, image: '/ameublement.png', category: 'Commerce', keywords: ['meuble', 'ameublement', 'mobilier', 'decoration', 'magasin', 'vente'] },
  { name: 'Boucherie Charcuterie', shortName: 'Boucherie', icon: Wrench, image: '/boucherie_charcuterie copy.png', category: 'Commerce', keywords: ['boucherie', 'charcuterie', 'viande', 'boucher', 'traiteur'] },
  { name: 'Boulangerie / Pâtisserie / Chocolaterie / Confiserie / Glacerie', shortName: 'Boulangerie', icon: Wrench, image: '/boulangerie_patisserie_chocolaterie_confiserie_glacerie copy.png', category: 'Alimentation', keywords: ['boulangerie', 'patisserie', 'chocolaterie', 'confiserie', 'glacerie', 'pain', 'gateau', 'boulanger'] },
  { name: 'Cabinet dentaire', shortName: 'Dentaire', icon: Wrench, image: '/cabinet_dentaire.png', category: 'Santé', keywords: ['dentaire', 'dentiste', 'cabinet', 'orthodontie', 'soin', 'dent'] },
  { name: 'Centre de contrôle technique', shortName: 'Controle technique', icon: Wrench, image: '/centre_de_controle_technique.png', category: 'Automobile', keywords: ['controle', 'technique', 'vehicule', 'inspection', 'automobile', 'ct'] },
  { name: 'Clubs sportifs', shortName: 'Sport', icon: Wrench, image: '/clubs_sportifs.png', category: 'Sport', keywords: ['sport', 'club', 'fitness', 'gym', 'salle', 'entrainement', 'coach'] },
  { name: 'Coiffure', shortName: 'Coiffure', icon: Wrench, image: '/coiffure.png', category: 'Services', keywords: ['coiffure', 'coiffeur', 'salon', 'cheveux', 'barbier', 'beaute'] },
  { name: 'Commerce alimentaire de proximité', shortName: 'Alimentaire', icon: Wrench, image: '/commerce_alimentaire_de_proximite.png', category: 'Commerce', keywords: ['alimentation', 'epicerie', 'proximite', 'commerce', 'superette', 'magasin'] },
  { name: 'Commerce de gros alimentaire', shortName: 'Gros alimentaire', icon: Wrench, image: '/commerce_de_gros_alimentaire.png', category: 'Commerce', keywords: ['gros', 'alimentaire', 'grossiste', 'distribution', 'entrepot'] },
  { name: 'Commerce de gros non alimentaire', shortName: 'Gros non alimentaire', icon: Wrench, image: '/commerce_de_gros_non_alimentaire.png', category: 'Commerce', keywords: ['gros', 'non alimentaire', 'grossiste', 'distribution', 'materiel'] },
  { name: 'Commerce non alimentaire', shortName: 'Commerce', icon: Wrench, image: '/commerce_non_alimentaire.png', category: 'Commerce', keywords: ['commerce', 'magasin', 'vente', 'boutique', 'detail', 'non alimentaire'] },
  { name: 'Culture de la banane', shortName: 'Banane', icon: Wrench, image: '/culture_de_la_banane.png', category: 'Agriculture', keywords: ['banane', 'bananeraie', 'plantation', 'culture', 'fruit', 'tropical'] },
  { name: 'Culture de la canne à sucre', shortName: 'Canne à sucre', icon: Wrench, image: '/culture_de_la_canne_a_sucre.png', category: 'Agriculture', keywords: ['canne', 'sucre', 'plantation', 'culture', 'sucrerie'] },
  { name: 'Cultures marines', shortName: 'Cultures marines', icon: Wrench, image: '/cultures_marines.png', category: 'Agriculture', keywords: ['marine', 'aquaculture', 'huitre', 'moule', 'conchyliculture', 'mer', 'ocean'] },
  { name: 'Déménagement', shortName: 'Demenagement', icon: Wrench, image: '/demenagement.png', category: 'Transport', keywords: ['demenagement', 'demenageur', 'transport', 'carton', 'mobilier', 'manutention'] },
  { name: 'EHPAD', shortName: 'EHPAD', icon: Wrench, image: '/ehpad.png', category: 'Santé', keywords: ['ehpad', 'maison retraite', 'personne agee', 'dependance', 'hebergement', 'soin'] },
  { name: 'Emballage bois', shortName: 'Emballage', icon: Wrench, image: '/emballage_bois.png', category: 'Industrie', keywords: ['emballage', 'bois', 'palette', 'caisse', 'conditionnement'] },
  { name: 'Garages automobiles et poids lourds', shortName: 'Garage', icon: Wrench, image: '/garages_automobiles_et_poids_lourds.png', category: 'Automobile', keywords: ['garage', 'mecano', 'mecanicien', 'reparation', 'voiture', 'auto', 'camion', 'poids lourd', 'carrosserie', 'vidange', 'pneu', 'entretien'] },
  { name: 'HCR – Hôtels, cafés, restaurants', shortName: 'HCR', icon: Wrench, image: '/hcr_–_hotels,_cafes,_restaurants.png', category: 'Restauration', keywords: ['hotel', 'cafe', 'restaurant', 'hcr', 'hebergement', 'hotellerie', 'bar'] },
  { name: 'Industries graphiques', shortName: 'Graphiques', icon: Wrench, image: '/industries_graphiques.png', category: 'Industrie', keywords: ['graphique', 'imprimerie', 'impression', 'edition', 'print', 'serigraphie'] },
  { name: 'Mécanique industrielle', shortName: 'Mecanique', icon: Wrench, image: '/mecanique_industrielle.png', category: 'Industrie', keywords: ['mecanique', 'industrielle', 'usinage', 'machine', 'outil', 'piece', 'tournage', 'fraisage'] },
  { name: 'Messagerie, Fret express', shortName: 'Messagerie', icon: Wrench, image: '/messagerie,_fret_express.png', category: 'Transport', keywords: ['messagerie', 'fret', 'express', 'colis', 'livraison', 'expedition', 'transport'] },
  { name: 'Métallerie, travail des métaux', shortName: 'Metallerie', icon: Wrench, image: '/metallerie,_travail_des_metaux.png', category: 'Industrie', keywords: ['metallerie', 'metal', 'soudure', 'ferronnerie', 'chaudronnerie', 'acier'] },
  { name: 'Navires à passagers', shortName: 'Navires', icon: Wrench, image: '/navires_a_passagers.png', category: 'Transport', keywords: ['navire', 'bateau', 'passager', 'maritime', 'croisiere', 'ferry', 'mer'] },
  { name: 'OiRA générique', shortName: 'OiRA', icon: Wrench, image: '/oira_generique.png', category: 'Général', keywords: ['oira', 'generique', 'evaluation', 'risque', 'prevention', 'securite'] },
  { name: 'Organisations associatives', shortName: 'Associations', icon: Wrench, image: '/organisations_associatives.png', category: 'Associatif', keywords: ['association', 'ong', 'benevolat', 'organisation', 'social', 'humanitaire'] },
  { name: 'Pêches maritimes', shortName: 'Peches', icon: Wrench, image: '/peches_maritimes.png', category: 'Agriculture', keywords: ['peche', 'maritime', 'poisson', 'mer', 'chalutier', 'marin', 'pecheur'] },
  { name: "Pharmacie d'officine", shortName: 'Pharmacie', icon: Wrench, image: "/pharmacie_d'officine.png", category: 'Santé', keywords: ['pharmacie', 'officine', 'medicament', 'pharmacien', 'ordonnance', 'sante'] },
  { name: 'Plasturgie', shortName: 'Plasturgie', icon: Wrench, image: '/plasturgie.png', category: 'Industrie', keywords: ['plastique', 'plasturgie', 'moule', 'injection', 'extrusion', 'polymere'] },
  { name: 'Poissonnerie', shortName: 'Poissonnerie', icon: Wrench, image: '/poissonnerie.png', category: 'Commerce', keywords: ['poissonnerie', 'poisson', 'fruit de mer', 'poissonnier', 'maree'] },
  { name: 'Production audiovisuelle, cinématographique et publicitaire', shortName: 'Audiovisuel', icon: Wrench, image: '/production_audiovisuelle,_cinematographique_et_publicitaire.png', category: 'Services', keywords: ['audiovisuel', 'cinema', 'film', 'video', 'publicite', 'production', 'tournage'] },
  { name: 'Propreté', shortName: 'Proprete', icon: Wrench, image: '/proprete.png', category: 'Services', keywords: ['proprete', 'nettoyage', 'entretien', 'menage', 'hygiene', 'desinfection'] },
  { name: 'Prothésiste dentaire', shortName: 'Prothesiste', icon: Wrench, image: '/prothesiste_dentaire.png', category: 'Santé', keywords: ['prothesiste', 'dentaire', 'prothese', 'couronne', 'bridge', 'laboratoire'] },
  { name: 'Restauration collective', shortName: 'Restauration coll.', icon: Wrench, image: '/restauration_collective.png', category: 'Restauration', keywords: ['restauration', 'collective', 'cantine', 'cuisine', 'repas', 'self'] },
  { name: 'Restauration rapide', shortName: 'Restauration rapide', icon: Wrench, image: '/restauration_rapide.png', category: 'Restauration', keywords: ['restauration', 'rapide', 'fast food', 'snack', 'sandwich', 'kebab', 'pizza'] },
  { name: 'Scierie', shortName: 'Scierie', icon: Wrench, image: '/scierie.png', category: 'Industrie', keywords: ['scierie', 'bois', 'decoupe', 'planche', 'grume', 'sciage'] },
  { name: 'Services funéraires', shortName: 'Funeraire', icon: Wrench, image: '/services_funeraires.png', category: 'Services', keywords: ['funeraire', 'pompes funebres', 'obseques', 'cremation', 'inhumation'] },
  { name: 'Soins esthétiques', shortName: 'Esthetique', icon: Wrench, image: '/soins_esthetiques.png', category: 'Services', keywords: ['esthetique', 'beaute', 'soin', 'visage', 'corps', 'institut', 'spa'] },
  { name: 'Soins et prothésie ongulaire', shortName: 'Ongulaire', icon: Wrench, image: '/soin_et_prothesie_ongulaire.png', category: 'Services', keywords: ['ongle', 'ongulaire', 'manucure', 'pedicure', 'nail', 'prothesie'] },
  { name: 'Traitement des métaux', shortName: 'Traitement metaux', icon: Wrench, image: '/traitement_des_metaux.png', category: 'Industrie', keywords: ['traitement', 'metaux', 'surface', 'galvanisation', 'peinture', 'anodisation'] },
  { name: 'Traiteurs et organisateurs de réception', shortName: 'Traiteur', icon: Wrench, image: '/traiteurs_et_organisateurs_de_reception.png', category: 'Restauration', keywords: ['traiteur', 'reception', 'evenement', 'buffet', 'mariage', 'cocktail'] },
  { name: 'Transport routier de marchandises', shortName: 'Transport marchandises', icon: Wrench, image: '/transport_routier_de_marchandises.png', category: 'Transport', keywords: ['transport', 'routier', 'marchandise', 'camion', 'chauffeur', 'logistique', 'poids lourd'] },
  { name: 'Transport routier de voyageurs', shortName: 'Transport voyageurs', icon: Wrench, image: '/transport_routier_de_voyageurs.png', category: 'Transport', keywords: ['transport', 'voyageur', 'bus', 'autocar', 'chauffeur', 'passager'] },
  { name: 'Transport sanitaire', shortName: 'Transport sanitaire', icon: Wrench, image: '/transport_sanitaire.png', category: 'Transport', keywords: ['transport', 'sanitaire', 'ambulance', 'ambulancier', 'patient', 'urgence', 'vsl'] },
  { name: 'Travail de bureau', shortName: 'Bureau', icon: Wrench, image: '/travail_de_bureau.png', category: 'Services', keywords: ['bureau', 'administratif', 'secretariat', 'ordinateur', 'informatique', 'tertiaire'] },
  { name: 'Tri et collecte des déchets', shortName: 'Dechets', icon: Wrench, image: '/tri_et_collecte_des_dechets.png', category: 'Environnement', keywords: ['dechet', 'tri', 'collecte', 'recyclage', 'poubelle', 'ordure', 'environnement'] },
  { name: 'Vétérinaire', shortName: 'Veterinaire', icon: Wrench, image: '/veterinaire.png', category: 'Santé', keywords: ['veterinaire', 'animal', 'chien', 'chat', 'clinique', 'soin', 'veto'] },
];

const sectors: SectorItem[] = sectorsData.map((s, i) => ({ ...s, id: String(i + 1).padStart(2, '0') }));

const categoryColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'Services': { bg: 'bg-sky-500/10', text: 'text-sky-300', border: 'border-sky-500/30', dot: 'bg-sky-400' },
  'Agriculture': { bg: 'bg-green-500/10', text: 'text-green-300', border: 'border-green-500/30', dot: 'bg-green-400' },
  'Commerce': { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  'Alimentation': { bg: 'bg-orange-500/10', text: 'text-orange-300', border: 'border-orange-500/30', dot: 'bg-orange-400' },
  'Santé': { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/30', dot: 'bg-rose-400' },
  'Automobile': { bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/30', dot: 'bg-slate-400' },
  'Sport': { bg: 'bg-teal-500/10', text: 'text-teal-300', border: 'border-teal-500/30', dot: 'bg-teal-400' },
  'Transport': { bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/30', dot: 'bg-blue-400' },
  'Industrie': { bg: 'bg-zinc-500/10', text: 'text-zinc-300', border: 'border-zinc-500/30', dot: 'bg-zinc-400' },
  'Restauration': { bg: 'bg-red-500/10', text: 'text-red-300', border: 'border-red-500/30', dot: 'bg-red-400' },
  'Général': { bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/30', dot: 'bg-cyan-400' },
  'Associatif': { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  'Environnement': { bg: 'bg-lime-500/10', text: 'text-lime-300', border: 'border-lime-500/30', dot: 'bg-lime-400' },
};

const ToolPickerModal: React.FC<{
  metierId: string;
  metierName: string;
  alreadyAffiliated: string[];
  onClose: () => void;
  onAffiliate: (toolId: string, toolName: string) => void;
}> = ({ metierName, alreadyAffiliated, onClose, onAffiliate }) => {
  const [toolSearch, setToolSearch] = useState('');

  const filteredTools = useMemo(() => {
    const term = normalize(toolSearch.trim());
    if (!term) return sectors;
    return sectors.filter(s =>
      normalize(s.shortName).includes(term) ||
      normalize(s.name).includes(term) ||
      s.keywords.some(kw => normalize(kw).includes(term))
    );
  }, [toolSearch]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg bg-slate-900 border-t sm:border border-white/15 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-white">Affilier un outil</h3>
            <p className="text-xs sm:text-sm text-white/50 mt-0.5 truncate">Pour : <span className="text-blue-300 font-medium">{metierName}</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all flex-shrink-0 ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 sm:p-4 border-b border-white/10 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/60" />
            <input
              type="text"
              value={toolSearch}
              onChange={e => setToolSearch(e.target.value)}
              placeholder="Rechercher un outil..."
              autoFocus
              className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm"
            />
            {toolSearch && (
              <button onClick={() => setToolSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white/80">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider px-2 mb-2">{filteredTools.length} outil{filteredTools.length > 1 ? 's' : ''}</p>
          {filteredTools.length === 0 && (
            <div className="text-center py-8">
              <Search className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-white/40 text-sm">Aucun outil trouve</p>
            </div>
          )}
          {filteredTools.map((tool, index) => {
            const isAffiliated = alreadyAffiliated.includes(tool.id);
            return (
              <button
                key={tool.id}
                onClick={() => !isAffiliated && onAffiliate(tool.id, tool.name)}
                disabled={isAffiliated}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-all duration-150 ${
                  index !== filteredTools.length - 1 ? 'border-b border-white/5' : ''
                } ${
                  isAffiliated
                    ? 'text-green-400 cursor-default'
                    : 'text-white/80 hover:text-white hover:bg-white/5 cursor-pointer'
                }`}
              >
                <span className="text-sm font-medium truncate"><span className="text-blue-400 font-bold mr-2">{tool.id}</span>{tool.name}</span>
                {isAffiliated && (
                  <span className="flex items-center gap-1 text-xs text-green-400 font-medium flex-shrink-0 ml-2">
                    <Check className="w-3.5 h-3.5" /> Affilie
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const MetierSimplifiedSubTab: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMetierName, setNewMetierName] = useState('');
  const [customMetiers, setCustomMetiers] = useState<CustomMetier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toolPickerFor, setToolPickerFor] = useState<CustomMetier | null>(null);
  const [expandedMetier, setExpandedMetier] = useState<string | null>(null);
  const [imageErrorsRecap, setImageErrorsRecap] = useState<Set<string>>(new Set());
  const [metierSearch, setMetierSearch] = useState('');

  const loadCustomMetiers = useCallback(async () => {
    try {
      const { data: metiers, error: mErr } = await supabase
        .from('custom_metiers')
        .select('*')
        .order('created_at', { ascending: false });

      if (mErr) throw mErr;

      const { data: affiliations, error: aErr } = await supabase
        .from('metier_tool_affiliations')
        .select('*');

      if (aErr) throw aErr;

      const metiersWithTools: CustomMetier[] = (metiers || []).map(m => ({
        ...m,
        affiliatedTools: (affiliations || []).filter(a => a.metier_id === m.id),
      }));

      setCustomMetiers(metiersWithTools);
    } catch (err) {
      console.error('Error loading custom metiers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomMetiers();
  }, [loadCustomMetiers]);

  const filteredCustomMetiers = useMemo(() => {
    const term = normalize(metierSearch.trim());
    if (!term) return customMetiers;
    return customMetiers.filter(m => {
      const nameMatch = normalize(m.name).includes(term);
      const toolMatch = m.affiliatedTools.some(t => normalize(t.tool_name).includes(term));
      return nameMatch || toolMatch;
    });
  }, [customMetiers, metierSearch]);

  const handleAddMetier = async () => {
    const trimmed = newMetierName.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('custom_metiers')
        .insert({ name: trimmed });

      if (error) throw error;

      setNewMetierName('');
      setShowAddForm(false);
      await loadCustomMetiers();
    } catch (err: any) {
      if (err?.code === '23505') {
        alert('Ce metier existe deja.');
      } else {
        console.error('Error adding metier:', err);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMetier = async (metierId: string) => {
    if (!confirm('Supprimer ce metier et toutes ses affiliations ?')) return;
    try {
      const { error } = await supabase
        .from('custom_metiers')
        .delete()
        .eq('id', metierId);
      if (error) throw error;
      await loadCustomMetiers();
    } catch (err) {
      console.error('Error deleting metier:', err);
    }
  };

  const handleAffiliateTool = async (metierId: string, toolSectorId: string, toolName: string) => {
    try {
      const { error } = await supabase
        .from('metier_tool_affiliations')
        .insert({ metier_id: metierId, tool_sector_id: toolSectorId, tool_name: toolName });
      if (error) throw error;
      await loadCustomMetiers();
    } catch (err) {
      console.error('Error affiliating tool:', err);
    }
  };

  const handleUnaffiliateTool = async (affiliationId: string) => {
    try {
      const { error } = await supabase
        .from('metier_tool_affiliations')
        .delete()
        .eq('id', affiliationId);
      if (error) throw error;
      await loadCustomMetiers();
    } catch (err) {
      console.error('Error removing affiliation:', err);
    }
  };

  return (
    <div>
      <div className="mb-5 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
          Metiers
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-blue-200 font-medium">
          Cliquez sur un metier pour voir l'outil correspondant
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-3.5 sm:p-5 md:p-6 mb-5 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-300/60" />
            <input
              type="text"
              value={metierSearch}
              onChange={(e) => setMetierSearch(e.target.value)}
              placeholder="Rechercher un metier..."
              className="w-full pl-10 sm:pl-12 pr-10 py-3 sm:py-3.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all text-sm"
            />
            {metierSearch && (
              <button
                onClick={() => setMetierSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-white/60 text-xs sm:text-sm">
            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{filteredCustomMetiers.length} metier{filteredCustomMetiers.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-white">Metiers personnalises</h2>
            <p className="text-xs sm:text-sm text-white/50 mt-1">Creez vos propres metiers et affiliez-leur des outils</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 w-full sm:w-auto ${
              showAddForm
                ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/25'
            }`}
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAddForm ? 'Annuler' : 'Ajouter un metier'}
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-5 md:p-6 animate-fade-in">
            <h3 className="text-base font-bold text-white mb-4">Nouveau metier</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newMetierName}
                onChange={e => setNewMetierName(e.target.value)}
                placeholder="Nom du metier..."
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAddMetier()}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm"
              />
              <button
                onClick={handleAddMetier}
                disabled={!newMetierName.trim() || saving}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-600/25"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Valider
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : filteredCustomMetiers.filter(m => m.affiliatedTools.length === 0).length === 0 && filteredCustomMetiers.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
            <HardHat className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 font-medium">{metierSearch ? 'Aucun metier trouve' : 'Aucun metier personnalise'}</p>
            <p className="text-white/30 text-sm mt-1">{metierSearch ? 'Essayez de modifier votre recherche' : 'Cliquez sur "Ajouter un nouveau metier" pour commencer'}</p>
          </div>
        ) : filteredCustomMetiers.filter(m => m.affiliatedTools.length === 0).length === 0 ? null : (
          <div className="space-y-3">
            {filteredCustomMetiers.filter(m => m.affiliatedTools.length === 0).map(metier => {
              const isExpanded = expandedMetier === metier.id;
              return (
                <div
                  key={metier.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20"
                >
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                        <HardHat className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-white truncate">{metier.name}</h3>
                        <p className="text-[11px] sm:text-xs text-white/40 mt-0.5">
                          {metier.affiliatedTools.length === 0
                            ? 'Aucun outil affilie'
                            : `${metier.affiliatedTools.length} outil${metier.affiliatedTools.length > 1 ? 's' : ''} affilie${metier.affiliatedTools.length > 1 ? 's' : ''}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        {metier.affiliatedTools.length > 0 && (
                          <button
                            onClick={() => setExpandedMetier(isExpanded ? null : metier.id)}
                            className="p-1.5 sm:p-2 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMetier(metier.id)}
                          className="p-1.5 sm:p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2.5 sm:mt-3 pl-12 sm:pl-14">
                      <button
                        onClick={() => setToolPickerFor(metier)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold hover:bg-blue-600/30 transition-all w-full sm:w-auto justify-center sm:justify-start"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        Affilier un outil
                      </button>
                    </div>
                  </div>

                  {isExpanded && metier.affiliatedTools.length > 0 && (
                    <div className="border-t border-white/10 p-2.5 sm:p-3 bg-white/[0.02] space-y-2">
                      <p className="text-[11px] sm:text-xs text-white/40 font-semibold uppercase tracking-wider px-1 mb-2">Outils affilies</p>
                      {metier.affiliatedTools.map(tool => {
                        const sectorMatch = sectors.find(s => s.id === tool.tool_sector_id);
                        const Icon = sectorMatch?.icon || Wrench;
                        const colors = sectorMatch ? (categoryColors[sectorMatch.category] || categoryColors['Général']) : categoryColors['Général'];
                        return (
                          <div
                            key={tool.id}
                            className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-white/5 border border-white/10"
                          >
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.bg} border ${colors.border}`}>
                              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${colors.text}`} />
                            </div>
                            <span className="flex-1 text-xs sm:text-sm font-medium text-white truncate">{tool.tool_name}</span>
                            <button
                              onClick={() => handleUnaffiliateTool(tool.id)}
                              className="flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all flex-shrink-0"
                            >
                              <Unlink className="w-3 h-3" />
                              <span className="hidden sm:inline">Retirer</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {filteredCustomMetiers.some(m => m.affiliatedTools.length > 0) && (
        <div className="mb-8">
          <h2 className="text-lg md:text-2xl font-bold text-white mb-2">Recapitulatif des affiliations</h2>
          <p className="text-xs sm:text-sm text-white/50 mb-5">Vos metiers personnalises et leurs outils affilies</p>
          <div className="space-y-3">
            {filteredCustomMetiers.filter(m => m.affiliatedTools.length > 0).map(metier => (
              metier.affiliatedTools.map(tool => {
                const sectorMatch = sectors.find(s => s.id === tool.tool_sector_id);
                const colors = sectorMatch ? (categoryColors[sectorMatch.category] || categoryColors['Général']) : categoryColors['Général'];
                return (
                  <div
                    key={tool.id}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:border-white/20 transition-all duration-300 p-3 sm:p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-blue-300 leading-none">{tool.tool_sector_id}</span>
                        </div>
                        <span className="text-sm font-bold text-white truncate">{metier.name}</span>
                      </div>

                      <div className="hidden sm:block flex-shrink-0 px-3">
                        <div className="w-8 h-[2px] bg-white/20 rounded-full" />
                      </div>

                      <div className="flex items-center gap-3 flex-1 min-w-0 ml-0 sm:ml-0">
                        <div className="relative flex-shrink-0">
                          {sectorMatch && !imageErrorsRecap.has(tool.tool_sector_id) ? (
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-white/20">
                              <img
                                src={sectorMatch.image}
                                alt={tool.tool_name}
                                className="w-full h-full object-cover"
                                onError={() => setImageErrorsRecap(prev => new Set([...prev, tool.tool_sector_id]))}
                              />
                            </div>
                          ) : (
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${colors.bg} border ${colors.border}`}>
                              <Wrench className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text}`} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-white sm:truncate block break-words">{tool.tool_name}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteMetier(metier.id)}
                        className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all self-end sm:self-center"
                        title="Supprimer le metier"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ))}
          </div>
        </div>
      )}

      {toolPickerFor && (
        <ToolPickerModal
          metierId={toolPickerFor.id}
          metierName={toolPickerFor.name}
          alreadyAffiliated={toolPickerFor.affiliatedTools.map(t => t.tool_sector_id)}
          onClose={() => setToolPickerFor(null)}
          onAffiliate={async (toolId, toolName) => {
            await handleAffiliateTool(toolPickerFor.id, toolId, toolName);
            const updated = customMetiers.find(m => m.id === toolPickerFor.id);
            if (updated) {
              const { data } = await supabase
                .from('metier_tool_affiliations')
                .select('*')
                .eq('metier_id', toolPickerFor.id);
              setToolPickerFor({
                ...toolPickerFor,
                affiliatedTools: data || [],
              });
            }
          }}
        />
      )}
    </div>
  );
};

const OutilsFullSubTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    const text = sectors.map(s => `${s.id} - ${s.name}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const filteredSectors = useMemo(() => {
    const term = normalize(searchTerm.trim());
    if (!term) return sectors;
    return sectors.filter(s => {
      const nameMatch = normalize(s.name).includes(term);
      const idMatch = s.id.includes(term);
      const keywordMatch = s.keywords.some(kw => normalize(kw).includes(term));
      return nameMatch || idMatch || keywordMatch;
    });
  }, [searchTerm]);

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
              Outils
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-blue-200 font-medium">
              Liste complete des {sectors.length} outils disponibles par secteur d'activite
            </p>
          </div>
          <button
            onClick={handleCopyAll}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex-shrink-0 w-full sm:w-auto ${
              copied
                ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                : 'bg-white/10 text-white/70 border border-white/15 hover:bg-white/15 hover:text-white'
            }`}
          >
            {copied ? <ClipboardCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copie !' : `Copier les ${sectors.length} outils`}
          </button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-3.5 sm:p-5 md:p-6 mb-5 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-300/60" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un metier, un secteur..."
              className="w-full pl-10 sm:pl-12 pr-10 py-3 sm:py-3.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-white/60 text-xs sm:text-sm">
            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{filteredSectors.length} resultat{filteredSectors.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredSectors.map((sector) => {
          const Icon = sector.icon;
          const colors = categoryColors[sector.category] || categoryColors['Général'];
          const hasImageError = imageErrors.has(sector.id);
          return (
            <div
              key={sector.id}
              className="group flex items-center gap-2.5 sm:gap-4 p-2.5 sm:p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <span className="flex-shrink-0 w-7 sm:w-8 text-center text-[11px] sm:text-xs font-bold text-white/50 bg-white/5 rounded-lg py-1 sm:py-1.5 border border-white/10">
                {sector.id}
              </span>
              <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-white/15">
                {!hasImageError ? (
                  <img
                    src={sector.image}
                    alt={sector.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageErrors(prev => new Set([...prev, sector.id]))}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${colors.bg}`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text}`} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white leading-tight truncate group-hover:text-blue-200 transition-colors">
                  {sector.name}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSectors.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-lg font-medium">Aucun metier trouve</p>
          <p className="text-white/30 text-sm mt-2">Essayez de modifier votre recherche ou vos filtres</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-4 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors border border-blue-500/30"
          >
            Reinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
};

type SubTab = 'outils' | 'metier';

const MetierTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('metier');

  return (
    <div>
      <div className="flex items-center gap-1 p-1 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 mb-6 w-full sm:w-fit">
        <button
          onClick={() => setActiveSubTab('metier')}
          className={`flex items-center justify-center gap-2 sm:gap-2.5 flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
            activeSubTab === 'metier'
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
              : 'text-white/50 hover:text-white/80 hover:bg-white/5'
          }`}
        >
          <HardHat className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          Metier
        </button>
        <button
          onClick={() => setActiveSubTab('outils')}
          className={`flex items-center justify-center gap-2 sm:gap-2.5 flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
            activeSubTab === 'outils'
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
              : 'text-white/50 hover:text-white/80 hover:bg-white/5'
          }`}
        >
          <Cog className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          Outils
        </button>
      </div>

      {activeSubTab === 'metier' && <MetierSimplifiedSubTab />}
      {activeSubTab === 'outils' && <OutilsFullSubTab />}
    </div>
  );
};

export default MetierTab;
