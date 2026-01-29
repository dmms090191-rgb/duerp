import React, { useState, useEffect } from 'react';
import { FileText, Search, ChevronDown, Eye, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DocumentArgumentaire {
  id: number;
  titre: string;
  contenu: string;
  created_at: string;
  updated_at: string;
}

const ArgumentaireViewer: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentArgumentaire[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentArgumentaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<DocumentArgumentaire | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [searchTerm, documents]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('argumentaire_document')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    if (!searchTerm.trim()) {
      setFilteredDocuments(documents);
      return;
    }

    const filtered = documents.filter(doc =>
      doc.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.contenu.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDocuments(filtered);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-300/30 border-t-blue-400 mb-4"></div>
        <p className="text-white/80 font-medium">Chargement des documents...</p>
      </div>
    );
  }

  if (selectedDocument) {
    return (
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedDocument(null)}
              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-xl transition-all hover:scale-105 font-medium border border-white/20"
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
              Retour à la liste
            </button>
            <span className="text-sm text-blue-200 font-medium">
              Mis à jour le {new Date(selectedDocument.updated_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-[#2d4578] to-[#1a2847] p-8 border-b border-white/20">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{selectedDocument.titre}</h1>
            <p className="text-sm text-blue-200 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
              Créé le {new Date(selectedDocument.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>

          <div className="p-8 md:p-12 bg-white/5 backdrop-blur-sm">
            <div
              className="prose max-w-none text-white"
              style={{
                fontFamily: 'Georgia, serif',
                lineHeight: '1.9',
                fontSize: '17px'
              }}
            >
              {selectedDocument.contenu.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-5 whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">
          Bibliothèque Argumentaire
        </h1>
        <p className="text-sm md:text-base text-blue-200 font-medium">
          Ressources et documents commerciaux à votre disposition
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
          <input
            type="text"
            placeholder="Rechercher par titre ou contenu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg bg-white/10 border-2 border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 backdrop-blur-sm transition-all"
          />
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 text-center py-20">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-30"></div>
            <div className="relative w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto border border-white/30">
              <FileText className="w-12 h-12 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {searchTerm ? 'Aucun résultat' : 'Aucun document'}
          </h3>
          <p className="text-blue-200 mb-8 max-w-md mx-auto">
            {searchTerm ? 'Essayez avec d\'autres mots-clés' : 'Les documents seront affichés ici une fois créés par l\'administration'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-3 bg-gradient-to-r from-[#2d4578] to-[#1a2847] text-white rounded-xl hover:from-[#3a5488] hover:to-[#223761] transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold border border-blue-400/50"
            >
              Effacer la recherche
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden hover:border-blue-400/50 hover:shadow-2xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1"
              onClick={() => setSelectedDocument(doc)}
            >
              <div className="relative h-32 bg-gradient-to-br from-[#2d4578] to-[#1a2847] overflow-hidden">
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all"></div>
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
                <h3 className="font-bold text-white mb-2 text-lg group-hover:text-blue-300 transition-colors line-clamp-2">
                  {doc.titre || 'Sans titre'}
                </h3>
                <p className="text-sm text-blue-200 line-clamp-3 mb-4">
                  {doc.contenu.substring(0, 120)}
                  {doc.contenu.length > 120 ? '...' : ''}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <span className="text-xs text-blue-300 font-medium">
                    {doc.contenu.split('\n').filter(p => p.trim()).length} paragraphes
                  </span>
                  <button
                    onClick={() => setSelectedDocument(doc)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                  >
                    <Eye className="w-4 h-4" />
                    Lire
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArgumentaireViewer;
