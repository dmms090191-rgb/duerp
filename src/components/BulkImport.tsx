import React, { useState, useRef } from 'react';
import { Upload, Eye, Plus, List, User, Mail, Phone, Calendar, Hash, Users, Trash2, CheckSquare, Square, ArrowRight } from 'lucide-react';
import { Lead } from '../types/Lead';
import { leadService } from '../services/leadService';

interface BulkImportProps {
  leads: Lead[];
  onLeadCreated: (lead: Lead) => void;
  onLeadsDeleted: (leadIds: string[]) => void;
  onLeadsTransferred?: (leadIds: string[]) => void;
}

const BulkImport: React.FC<BulkImportProps> = ({ leads, onLeadCreated, onLeadsDeleted, onLeadsTransferred }) => {
  const [activeTab, setActiveTab] = useState<'import' | 'list'>('import');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [csvFormat, setCsvFormat] = useState('nom,prenom,email,motDePasse,telephone');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = (): string => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const handleFileSelect = (file: File) => {
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      setCsvFile(file);
      setIsProcessingCsv(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length > 0) {
          // Parse CSV lines - support both comma and semicolon separators
          const parsedLines = lines.map(line => {
            // Detect separator (semicolon or comma)
            const separator = line.includes(';') ? ';' : ',';
            return line.split(separator).map(cell => cell.trim().replace(/^"|"$/g, ''));
          });
          
          setCsvPreview(parsedLines); // Read all lines
          
          // Auto-detect format from first line
          if (parsedLines.length > 0) {
            const detectedFormat = parsedLines[0].join(',');
            setCsvFormat(detectedFormat);
          }
        }
        setIsProcessingCsv(false);
      };
      
      reader.onerror = () => {
        setIsProcessingCsv(false);
      };
      
      reader.readAsText(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImportCsv = () => {
    if (!csvFile || csvPreview.length === 0) {
      console.log('No file or preview data');
      return;
    }

    const formatColumns = csvFormat.split(',').map(col => col.trim());

    // Use the already parsed data from csvPreview
    const dataRows = csvPreview.slice(1); // Skip header row
    let importedCount = 0;
    
    dataRows.forEach(row => {
      if (row.length >= formatColumns.length) {
        const leadData: any = {};
        
        formatColumns.forEach((column, index) => {
          const value = row[index]?.trim();
          if (value) {
            // Map column names to lead properties - support your format
            const normalizedColumn = column.toLowerCase().replace(/[_\s-]/g, '');
            switch (normalizedColumn) {
              case 'nom':
                leadData.nom = value;
                break;
              case 'prenom':
              case 'prénom':
                leadData.prenom = value;
                break;
              case 'adresse':
                // Skip address field - not needed for leads
                break;
              case 'email':
              case 'mail':
                leadData.email = value;
                break;
              case 'numero':
              case 'numéro':
              case 'telephone':
              case 'téléphone':
              case 'tel':
              case 'phone':
                leadData.telephone = value;
                break;
              case 'source':
                // Use source as password if no password provided
                if (!leadData.motDePasse) {
                  leadData.motDePasse = value;
                }
                break;
              case 'com':
                // Use com as password if no password provided
                if (!leadData.motDePasse) {
                  leadData.motDePasse = value;
                }
                break;
              case 'motdepasse':
              case 'password':
              case 'mdp':
                leadData.motDePasse = value;
                break;
              default:
                // For unknown columns, try to use as password if none set
                if (!leadData.motDePasse && value.length >= 4) {
                  leadData.motDePasse = value;
                }
                break;
            }
          }
        });
        
        // Generate default password if none provided
        if (!leadData.motDePasse && leadData.nom && leadData.prenom) {
          leadData.motDePasse = `${leadData.prenom.toLowerCase()}123`;
        }
        
        // Debug: log the parsed data for the first few rows
        if (importedCount < 3) {
          console.log('Row data:', row);
          console.log('Parsed lead data:', leadData);
          console.log('Format columns:', formatColumns);
        }
        
        // Validate required fields
        if (leadData.nom && leadData.prenom && leadData.email && leadData.telephone) {
          // Ensure password exists
          if (!leadData.motDePasse) {
            leadData.motDePasse = `${leadData.prenom.toLowerCase()}123`;
          }
          
          const newLead: Lead = {
            id: generateId(),
            nom: leadData.nom,
            prenom: leadData.prenom,
            email: leadData.email,
            motDePasse: leadData.motDePasse,
            telephone: leadData.telephone,
            dateCreation: new Date().toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          };
          
          onLeadCreated(newLead);
          importedCount++;
        } else {
          // Debug: log missing fields for first few failed rows
          if (importedCount < 3) {
            console.log('Missing fields for row:', {
              nom: leadData.nom ? '✓' : '✗',
              prenom: leadData.prenom ? '✓' : '✗', 
              email: leadData.email ? '✓' : '✗',
              motDePasse: leadData.motDePasse ? '✓' : '✗',
              telephone: leadData.telephone ? '✓' : '✗'
            });
          }
        }
      }
    });
    
    if (importedCount > 0) {
      // Don't use alert - it can cause disconnection issues
      console.log(`${importedCount} leads imported successfully`);
      // Switch to list tab to show imported leads
      setActiveTab('list');
      
      // Reset
      setCsvFile(null);
      setCsvPreview([]);
      setCsvFormat('nom,prenom,email,motDePasse,telephone');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      console.error('No valid leads found in file');
      console.log('Current format:', csvFormat);
      console.log('Lines detected:', csvPreview.length - 1);
    }
  };

  // Debug function to check data
  const debugCsvData = () => {
    console.log('CSV Preview:', csvPreview);
    console.log('Format:', csvFormat);
    if (csvPreview.length > 1) {
      console.log('Sample data row:', csvPreview[1]);
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedLeads.length > 0) {
      try {
        await leadService.deleteMultipleLeads(selectedLeads);
        onLeadsDeleted(selectedLeads);
        setSelectedLeads([]);
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleTransferSelected = async () => {
    if (selectedLeads.length === 0) {
      alert('⚠️ Veuillez sélectionner au moins un lead à transférer.');
      return;
    }

    if (!onLeadsTransferred) {
      alert('⚠️ Fonction de transfert non disponible.');
      return;
    }

    const confirmTransfer = window.confirm(
      `Êtes-vous sûr de vouloir transférer ${selectedLeads.length} lead(s) vers Leads Principal ?\n\nCes leads seront déplacés et deviendront des clients.`
    );

    if (!confirmTransfer) {
      return;
    }

    try {
      console.log('🔄 DÉBUT TRANSFERT - IDs:', selectedLeads);
      await onLeadsTransferred(selectedLeads);
      console.log('✅ TRANSFERT OK');
      setSelectedLeads([]);
      alert(`✅ ${selectedLeads.length} lead(s) transféré(s) avec succès vers Leads Principal !`);
    } catch (error: any) {
      console.error('❌ ERREUR TRANSFERT:', error);
      alert(`❌ Erreur lors du transfert: ${error.message}`);
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Navigation Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6">
        <div className="space-y-4">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Navigation</h3>
            <p className="text-sm text-gray-600">Import de masse</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('import')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                activeTab === 'import'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-gray-700 hover:bg-gray-50 border border-transparent'
              }`}
            >
              <Upload className="w-5 h-5" />
              <div>
                <div className="font-medium">Importer des leads</div>
                <div className="text-xs text-gray-500">Fichier CSV</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                activeTab === 'list'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-gray-700 hover:bg-gray-50 border border-transparent'
              }`}
            >
              <List className="w-5 h-5" />
              <div className="flex-1">
                <div className="font-medium flex items-center justify-between">
                  Liste des leads masse
                  {leads.length > 0 && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {leads.length}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">Leads importés</div>
              </div>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Statistiques</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total leads</span>
                <span className="font-medium text-gray-900">{leads.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Importés aujourd'hui</span>
                <span className="font-medium text-gray-900">
                  {leads.filter(lead => 
                    lead.dateCreation.includes(new Date().toLocaleDateString('fr-FR'))
                  ).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Import de masse</h1>
                <p className="text-gray-600">Importez vos leads depuis un fichier CSV</p>
              </div>
            </div>
          </div>

          {/* Import Tab */}
          {activeTab === 'import' && (
            <>
              <div className="space-y-6">
                {/* Format Configuration */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-green-600" />
                    Format des colonnes
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Format CSV (ordre des colonnes)
                      </label>
                      <input
                        type="text"
                        value={csvFormat}
                        onChange={(e) => setCsvFormat(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="nom,prenom,email,motDePasse,telephone"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Personnalisez l'ordre des colonnes selon votre fichier CSV
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Colonnes supportées :</strong> nom, prenom, email, motDePasse, telephone, tel, phone, password
                      </p>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-green-600" />
                    Sélectionner le fichier
                  </h3>

                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                      isDragging
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Glissez-déposez votre fichier CSV ici
                    </p>
                    <p className="text-gray-500 mb-4">ou</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Parcourir les fichiers
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>

                  {csvFile && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Upload className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{csvFile.name}</p>
                            <p className="text-sm text-gray-500">
                              {(csvFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setCsvFile(null);
                            setCsvPreview([]);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Supprimer
                        </button>
                      </div>

                      {isProcessingCsv ? (
                        <div className="flex items-center gap-2 text-blue-600">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Analyse du fichier...</span>
                        </div>
                      ) : csvPreview.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-600">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold">{csvPreview.length - 1}</span>
                            </div>
                            <span className="text-sm font-medium">
                              {csvPreview.length - 1} leads détectés
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Fichier: <strong>{csvFile.name}</strong>
                          </p>
                          <button
                            onClick={handleImportCsv}
                            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Importer {csvPreview.length - 1} leads
                          </button>
                          <button
                            onClick={debugCsvData}
                            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                          >
                            Debug: Voir les données
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Instructions Section */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-600" />
                      Instructions d'utilisation
                    </h3>

                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="font-medium text-amber-900 mb-2">Format personnalisable</h4>
                        <ul className="text-sm text-amber-800 space-y-1">
                          <li>• <strong>Personnalisez le format</strong> : Modifiez l'ordre des colonnes selon vos besoins</li>
                          <li>• <strong>Exemples de formats :</strong></li>
                          <li className="ml-4">→ <code className="bg-white px-1 rounded">nom,prenom,email,motDePasse,telephone</code></li>
                          <li className="ml-4">→ <code className="bg-white px-1 rounded">prenom,nom,telephone,email,motDePasse</code></li>
                          <li className="ml-4">→ <code className="bg-white px-1 rounded">email,nom,prenom,tel,password</code></li>
                        </ul>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Règles d'import</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• La première ligne de votre CSV doit correspondre exactement au format choisi</li>
                          <li>• Utilisez un fichier CSV avec séparateur virgule</li>
                          <li>• Maximum 1000 leads par import</li>
                          <li>• Tous les champs sont obligatoires</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-2">Processus d'import</h4>
                        <ol className="text-sm text-green-800 space-y-1">
                          <li>1. Personnalisez le format des colonnes</li>
                          <li>2. Sélectionnez votre fichier CSV</li>
                          <li>3. Vérifiez le nombre de leads détectés</li>
                          <li>4. Cliquez sur "Importer X leads"</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* List Tab */}
          {activeTab === 'list' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <List className="w-6 h-6 text-green-600" />
                    <h2 className="text-2xl font-semibold text-gray-900">Liste des leads masse</h2>
                    <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                      {leads.length}
                    </span>
                  </div>
                  
                  {selectedLeads.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {selectedLeads.length} sélectionné{selectedLeads.length > 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={handleTransferSelected}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Transférer vers Leads Principal
                      </button>
                      <button
                        onClick={handleDeleteSelected}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {leads.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun lead importé</h3>
                  <p className="text-gray-500 mb-6">Commencez par importer votre premier fichier CSV</p>
                  <button
                    onClick={() => setActiveTab('import')}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Importer des leads
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <button
                            onClick={handleSelectAll}
                            className="flex items-center justify-center w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors"
                            title={selectedLeads.length === leads.length ? "Désélectionner tout" : "Sélectionner tout"}
                          >
                            {selectedLeads.length === leads.length ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            ID
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Nom
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Prénom
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Téléphone
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date de création
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleSelectLead(lead.id)}
                              className="flex items-center justify-center w-5 h-5 text-gray-500 hover:text-green-600 transition-colors"
                            >
                              {selectedLeads.includes(lead.id) ? (
                                <CheckSquare className="w-5 h-5 text-green-600" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{lead.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.nom}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.prenom}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.telephone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lead.dateCreation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImport;