import React, { useState, useRef } from 'react';
import { Upload, Eye, Plus, List, User, Mail, Phone, Calendar, Hash, Users, Trash2, CheckSquare, Square, ArrowRight } from 'lucide-react';
import { Lead } from '../types/Lead';
import { leadService } from '../services/leadService';

interface BulkImportProps {
  leads: Lead[];
  onLeadCreated: (lead: Lead) => void;
  onLeadsDeleted: (leadIds: number[]) => void;
  onLeadsTransferred?: (leadIds: number[]) => void;
}

const BulkImport: React.FC<BulkImportProps> = ({ leads, onLeadCreated, onLeadsDeleted, onLeadsTransferred }) => {
  const [activeTab, setActiveTab] = useState<'import' | 'list'>('import');
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [csvFormat, setCsvFormat] = useState('nom,prenom,email,motDePasse,telephone');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [encoding, setEncoding] = useState<'UTF-8' | 'ISO-8859-1'>('UTF-8');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = (): number => {
    return Math.floor(10000 + Math.random() * 90000);
  };

  const handleFileSelect = (file: File, selectedEncoding?: 'UTF-8' | 'ISO-8859-1') => {
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      setCsvFile(file);
      setIsProcessingCsv(true);

      const encodingToUse = selectedEncoding || encoding;

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

      // Read file with specified encoding to support French accents (é, è, à, etc.)
      reader.readAsText(file, encodingToUse);
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

  const handleImportCsv = async () => {
    if (!csvFile || csvPreview.length === 0) {
      console.log('No file or preview data');
      return;
    }

    const formatColumns = csvFormat.split(',').map(col => col.trim());

    // Use the already parsed data from csvPreview
    const dataRows = csvPreview.slice(1); // Skip header row
    let importedCount = 0;

    for (const row of dataRows) {
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
              case 'portable':
                leadData.portable = value;
                break;
              case 'siret':
                leadData.siret = value;
                break;
              case 'societe':
              case 'société':
              case 'company':
                leadData.societe = value;
                break;
              case 'activite':
              case 'activité':
                leadData.activite = value;
                break;
              case 'vendeur':
              case 'conseiller':
              case 'commentaires':
              case 'commentaire':
              case 'notes':
                leadData.conseiller = value;
                break;
              case 'source':
                leadData.source = value;
                break;
              case 'com':
                if (!leadData.conseiller) {
                  leadData.conseiller = value;
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

          try {
            // Sauvegarder dans Supabase
            const createdLead = await leadService.createLead({
              email: leadData.email,
              full_name: `${leadData.prenom} ${leadData.nom}`,
              nom: leadData.nom,
              prenom: leadData.prenom,
              phone: leadData.telephone,
              portable: leadData.portable || '',
              company_name: leadData.societe || '',
              siret: leadData.siret || '',
              activite: leadData.activite || '',
              conseiller: leadData.conseiller || '',
              source: leadData.source || '',
              client_password: leadData.motDePasse,
            });

            console.log('✅ Lead créé dans Supabase:', createdLead.email);

            // Créer l'objet Lead pour l'interface
            const newLead: Lead = {
              id: createdLead.id,
              nom: leadData.nom,
              prenom: leadData.prenom,
              email: leadData.email,
              motDePasse: leadData.motDePasse,
              telephone: leadData.telephone,
              portable: leadData.portable || '',
              societe: leadData.societe || '',
              siret: leadData.siret || '',
              activite: leadData.activite || '',
              conseiller: leadData.conseiller || '',
              source: leadData.source || '',
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
          } catch (error) {
            console.error('❌ Erreur création lead:', leadData.email, error);
          }
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
    }
    
    if (importedCount > 0) {
      console.log(`${importedCount} leads imported successfully`);

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

  const handleSelectLead = (leadId: number) => {
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
      `Êtes-vous sûr de vouloir transférer ${selectedLeads.length} lead(s) vers Clients ?\n\nCes leads seront déplacés et deviendront des clients.`
    );

    if (!confirmTransfer) {
      return;
    }

    try {
      console.log('🔄 DÉBUT TRANSFERT - IDs:', selectedLeads);
      await onLeadsTransferred(selectedLeads);
      console.log('✅ TRANSFERT OK');
      setSelectedLeads([]);
      alert(`✅ ${selectedLeads.length} lead(s) transféré(s) avec succès vers Clients !`);
    } catch (error: any) {
      console.error('❌ ERREUR TRANSFERT:', error);
      alert(`❌ Erreur lors du transfert: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Left Navigation Sidebar */}
      <div className="w-full md:w-80 bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] border-r border-white/10 p-4 md:p-6">
        <div className="space-y-4">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Navigation</h3>
            <p className="text-sm text-white/70">Import de masse</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('import')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all duration-200 ${
                activeTab === 'import'
                  ? 'bg-white/20 text-white border-2 border-white/30'
                  : 'text-white/70 hover:bg-white/10 border-2 border-transparent'
              }`}
            >
              <Upload className="w-4 h-4" />
              <div>
                <div className="font-medium text-sm">Importer des leads</div>
                <div className="text-xs text-white/60">Fichier CSV</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all duration-200 ${
                activeTab === 'list'
                  ? 'bg-white/20 text-white border-2 border-white/30'
                  : 'text-white/70 hover:bg-white/10 border-2 border-transparent'
              }`}
            >
              <List className="w-4 h-4" />
              <div className="flex-1">
                <div className="font-medium text-sm flex items-center justify-between">
                  Liste des leads masse
                  {leads.length > 0 && (
                    <span className="bg-white/30 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {leads.length}
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/60">Leads importés</div>
              </div>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8 p-4 bg-[#1a2847]/50 rounded-lg border-2 border-white/20">
            <h4 className="font-medium text-white mb-3">Statistiques</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Total leads</span>
                <span className="font-medium text-white">{leads.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Importés aujourd'hui</span>
                <span className="font-medium text-white">
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
      <div className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f]">
        <div className="w-full">
          {/* Header */}
          <div className="mb-6 bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 backdrop-blur-2xl">
            <div className="relative bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
              <div className="relative flex items-center gap-2 sm:gap-3 md:gap-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center ring-2 sm:ring-4 ring-white/30 shadow-lg">
                  <Upload className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-white drop-shadow-lg" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-0.5 sm:mb-1 drop-shadow-lg tracking-tight">
                    Import de masse
                  </h1>
                  <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium">
                    Importez vos leads depuis un fichier CSV
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Import Tab */}
          {activeTab === 'import' && (
            <>
              <div className="space-y-6">
                {/* Format Configuration */}
                <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-2xl shadow-2xl border-2 border-white/10 p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Upload className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    Format des colonnes
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-300 mb-2">
                        Encodage du fichier CSV
                      </label>
                      <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="encoding"
                            value="UTF-8"
                            checked={encoding === 'UTF-8'}
                            onChange={(e) => {
                              setEncoding(e.target.value as 'UTF-8');
                              if (csvFile) {
                                handleFileSelect(csvFile, 'UTF-8');
                              }
                            }}
                            className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-sm text-white">UTF-8 (recommandé)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="encoding"
                            value="ISO-8859-1"
                            checked={encoding === 'ISO-8859-1'}
                            onChange={(e) => {
                              setEncoding(e.target.value as 'ISO-8859-1');
                              if (csvFile) {
                                handleFileSelect(csvFile, 'ISO-8859-1');
                              }
                            }}
                            className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-sm text-white">ISO-8859-1 (Excel Windows)</span>
                        </label>
                      </div>
                      <p className="text-xs text-white/70">
                        Si vous voyez des "?" à la place des accents (é, è, à), changez l'encodage
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-300 mb-2">
                        Format CSV (ordre des colonnes)
                      </label>
                      <input
                        type="text"
                        value={csvFormat}
                        onChange={(e) => setCsvFormat(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 text-white placeholder-white/50 transition-colors"
                        placeholder="nom,prenom,email,motDePasse,telephone"
                      />
                      <p className="text-xs text-white/70 mt-1">
                        {csvFile ? '✓ Colonnes détectées automatiquement depuis votre fichier' : 'Personnalisez l\'ordre des colonnes selon votre fichier CSV'}
                      </p>
                    </div>

                    {csvFile && csvFormat && (
                      <div className="bg-[#1a2847]/50 border-2 border-white/20 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          Colonnes détectées
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {csvFormat.split(',').map((col, index) => (
                            <span key={index} className="inline-flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full text-sm font-medium text-white border border-white/20">
                              <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                {index + 1}
                              </span>
                              {col.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-[#1a2847]/50 border-2 border-white/20 rounded-lg p-3">
                      <p className="text-sm text-white">
                        <strong>Colonnes supportées :</strong> nom, prenom, email, motDePasse, telephone, portable, siret, societe, activite, conseiller, vendeur, source
                      </p>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-2xl shadow-2xl border-2 border-white/10 p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    Sélectionner le fichier
                  </h3>

                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                      isDragging
                        ? 'border-white/50 bg-white/10'
                        : 'border-white/30 hover:border-white/50 hover:bg-white/5'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-12 h-12 text-white/70 mx-auto mb-4" />
                    <p className="text-lg font-medium text-white mb-2">
                      Glissez-déposez votre fichier CSV ici
                    </p>
                    <p className="text-white/70 mb-4">ou</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2 rounded-lg transition-all duration-300 font-medium shadow-lg border-2 border-white/20"
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
                    <div className="mt-6 p-4 bg-[#1a2847]/50 rounded-lg border-2 border-white/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Upload className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{csvFile.name}</p>
                            <p className="text-sm text-white/70">
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
                          className="text-red-400 hover:text-red-300 text-sm font-medium"
                        >
                          Supprimer
                        </button>
                      </div>

                      {isProcessingCsv ? (
                        <div className="flex items-center gap-2 text-blue-300">
                          <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Analyse du fichier...</span>
                        </div>
                      ) : csvPreview.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-white">
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold">{csvPreview.length - 1}</span>
                            </div>
                            <span className="text-sm font-medium">
                              {csvPreview.length - 1} leads détectés
                            </span>
                          </div>
                          <p className="text-xs text-white/70">
                            Fichier: <strong>{csvFile.name}</strong>
                          </p>
                          <button
                            onClick={handleImportCsv}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 px-4 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-lg border-2 border-white/20"
                          >
                            <Upload className="w-4 h-4" />
                            Importer {csvPreview.length - 1} leads
                          </button>
                          <button
                            onClick={debugCsvData}
                            className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-colors text-sm border-2 border-white/20"
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
                  <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-2xl shadow-2xl border-2 border-white/10 p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Eye className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      Instructions d'utilisation
                    </h3>

                    <div className="space-y-4">
                      <div className="bg-amber-500/20 border-2 border-amber-500/30 rounded-lg p-4">
                        <h4 className="font-medium text-amber-200 mb-2">Détection automatique des colonnes</h4>
                        <ul className="text-sm text-white/90 space-y-1">
                          <li>• <strong>Détection automatique</strong> : Les colonnes sont automatiquement détectées depuis la première ligne de votre fichier CSV</li>
                          <li>• <strong>Aperçu visuel</strong> : Vous verrez les colonnes détectées affichées avec leur ordre</li>
                          <li>• <strong>Personnalisation</strong> : Vous pouvez modifier manuellement l'ordre si nécessaire</li>
                          <li>• <strong>Séparateurs supportés</strong> : Virgule (,) ou point-virgule (;)</li>
                          <li>• <strong>Caractères accentués</strong> : Changez l'encodage si vous voyez des "?" au lieu de é, è, à</li>
                        </ul>
                      </div>

                      <div className="bg-[#1a2847]/50 border-2 border-white/20 rounded-lg p-4">
                        <h4 className="font-medium text-blue-300 mb-2">Règles d'import</h4>
                        <ul className="text-sm text-white/90 space-y-1">
                          <li>• La première ligne de votre CSV doit contenir les noms des colonnes</li>
                          <li>• Les noms de colonnes seront automatiquement détectés et affichés</li>
                          <li>• Séparateurs supportés : virgule (,) ou point-virgule (;)</li>
                          <li>• Maximum 1000 leads par import</li>
                          <li>• Champs obligatoires : nom, prenom, email, telephone</li>
                        </ul>
                      </div>

                      <div className="bg-[#1a2847]/50 border-2 border-white/20 rounded-lg p-4">
                        <h4 className="font-medium text-blue-300 mb-2">Processus d'import</h4>
                        <ol className="text-sm text-white/90 space-y-1">
                          <li>1. Choisissez l'encodage correct (UTF-8 ou ISO-8859-1)</li>
                          <li>2. Sélectionnez votre fichier CSV</li>
                          <li>3. Les colonnes seront automatiquement détectées et affichées</li>
                          <li>4. Vérifiez que les accents (é, è, à) s'affichent correctement</li>
                          <li>5. Vérifiez l'aperçu des colonnes détectées</li>
                          <li>6. Cliquez sur "Importer X leads"</li>
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
            <>
              {selectedLeads.length > 0 && (
                <>
                  <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#2d4578] to-[#1e3a5f] shadow-lg rounded-full px-4 py-2 z-40 border-2 border-white/30">
                    <span className="text-sm font-medium text-white">
                      {selectedLeads.length} lead(s) sélectionné(s)
                    </span>
                  </div>
                  <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
                    <button
                      onClick={handleTransferSelected}
                      className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group relative"
                      title="Transférer"
                    >
                      <ArrowRight className="w-6 h-6" />
                      <span className="absolute right-16 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Transférer
                      </span>
                    </button>
                    <button
                      onClick={handleDeleteSelected}
                      className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group relative"
                      title="Supprimer"
                    >
                      <Trash2 className="w-6 h-6" />
                      <span className="absolute right-16 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Supprimer
                      </span>
                    </button>
                  </div>
                </>
              )}
              <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-2xl shadow-2xl border-2 border-white/10">
                <div className="p-4 md:p-6 border-b border-white/20">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <List className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      <h2 className="text-lg md:text-2xl font-semibold text-white">Liste des leads masse</h2>
                      <span className="bg-white/20 text-white text-sm font-medium px-2.5 py-0.5 rounded-full border border-white/30">
                        {leads.length}
                      </span>
                    </div>
                  </div>
                </div>

              {leads.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Aucun lead importé</h3>
                  <p className="text-white/70 mb-6">Commencez par importer votre premier fichier CSV</p>
                  <button
                    onClick={() => setActiveTab('import')}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg transition-all duration-300 border-2 border-white/20 shadow-lg"
                  >
                    <Upload className="w-4 h-4" />
                    Importer des leads
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[1000px] border-collapse table-auto">
                    <thead>
                      <tr className="bg-[#1a2847]/50 border-b border-white/20">
                        <th className="px-2 py-2 text-left border-r border-white/20 w-8">
                          <button
                            onClick={handleSelectAll}
                            className="flex items-center justify-center w-5 h-5 text-white/70 hover:text-white transition-colors"
                            title={selectedLeads.length === leads.length ? "Désélectionner tout" : "Sélectionner tout"}
                          >
                            {selectedLeads.length === leads.length ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-blue-300 border-r border-white/20 w-32">Rendez-vous</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-blue-300 border-r border-white/20 w-80">Statut du client</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-blue-300 border-r border-white/20 w-24">Prénom</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-blue-300 border-r border-white/20 w-24">Nom</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-blue-300 border-r border-white/20">Téléphone</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-blue-300 border-r border-white/20">Portable</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-blue-300 border-r border-white/20">E-mail</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-blue-300 border-r border-white/20">Activité</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-blue-300 border-r border-white/20">Société</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-blue-300 border-r border-white/20">SIRET</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-blue-300 border-r border-white/20">Commentaire</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-blue-300">Créé le</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gradient-to-b from-[#1a2847]/80 to-[#2d4578]/60 divide-y divide-white/10">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-white/5 transition-colors border-b border-white/10">
                          <td className="px-2 py-2 border-r border-white/10 text-center w-8">
                            <button
                              onClick={() => handleSelectLead(lead.id)}
                              className="flex items-center justify-center w-5 h-5 text-white/70 hover:text-white transition-colors"
                            >
                              {selectedLeads.includes(lead.id) ? (
                                <CheckSquare className="w-5 h-5 text-white" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>
                          </td>
                          <td className="px-3 py-2 border-r border-white/10 w-32">
                            <div className="text-xs text-white">{lead.rendez_vous ? new Date(lead.rendez_vous).toLocaleString('fr-FR') : '-'}</div>
                          </td>
                          <td className="px-3 py-2 border-r border-white/10 w-80">
                            {lead.status ? (
                              <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: `${lead.status.color}20`,
                                  color: lead.status.color,
                                  border: `1px solid ${lead.status.color}40`
                                }}
                              >
                                {lead.status.name}
                              </span>
                            ) : (
                              <span className="text-xs text-white/50 italic">Aucun statut</span>
                            )}
                          </td>
                          <td className="px-3 py-2 border-r border-white/10 w-24">
                            <div className="text-xs text-white font-semibold">{lead.prenom}</div>
                          </td>
                          <td className="px-3 py-2 border-r border-white/10 w-24">
                            <div className="text-xs text-white font-semibold">{lead.nom}</div>
                          </td>
                          <td className="px-3 py-2 border-r border-white/10">
                            <div className="text-xs text-white">{lead.telephone || '-'}</div>
                          </td>
                          <td className="px-3 py-2 border-r border-white/10">
                            <div className="text-xs text-white">{lead.portable || '-'}</div>
                          </td>
                          <td className="px-3 py-2 border-r border-white/10">
                            <div className="text-xs text-white">{lead.email}</div>
                          </td>
                          <td className="px-3 py-2 border-r border-white/10">
                            <div className="text-xs text-white">{lead.activite || '-'}</div>
                          </td>
                          <td className="px-3 py-2 border-r border-white/10">
                            <div className="text-xs text-white">{lead.societe || '-'}</div>
                          </td>
                          <td className="px-3 py-2 border-r border-white/10">
                            <div className="text-xs text-white">{lead.siret || '-'}</div>
                          </td>
                          <td className="px-3 py-2 border-r border-white/10">
                            <div className="text-xs text-white">{lead.conseiller || '-'}</div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-xs text-white">{lead.dateCreation}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImport;