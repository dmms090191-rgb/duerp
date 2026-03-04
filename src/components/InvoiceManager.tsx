import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Download, Calendar, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { generateInvoicePDF, getAllInvoices, deleteInvoice } from '../services/invoiceService';
import { supabase } from '../lib/supabase';

interface Client {
  id: number;
  nom_societe: string;
  nom_prenom_gerant: string;
  siret_siren: string;
  adresse: string;
  code_postal: string;
  ville: string;
  email: string;
}

interface InvoiceItem {
  description: string;
  details: string[];
  unitPrice: number;
  quantity: number;
  total: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  client_name: string;
  client_company: string;
  total: number;
  pdf_url: string;
}

const InvoiceManager: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: 'DUERP Numérique Article R4121-1',
      details: [
        'Rapport diagnostic conforme',
        'Accès à votre portail numérique',
        'Élaboration du document unique',
        'Suivi juridique en cas de contrôle',
        'Attestation de conformité DUERP'
      ],
      unitPrice: 830.00,
      quantity: 1,
      total: 830.00
    }
  ]);
  const [vatRate, setVatRate] = useState(20);

  useEffect(() => {
    loadClients();
    loadInvoices();
    generateInvoiceNumber();
  }, []);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('nom_societe');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadInvoices = async () => {
    const data = await getAllInvoices();
    setInvoices(data);
  };

  const generateInvoiceNumber = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setInvoiceNumber(randomNum.toString());
  };

  const handleClientSelect = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);
  };

  const addItem = () => {
    setItems([...items, {
      description: '',
      details: [],
      unitPrice: 0,
      quantity: 1,
      total: 0
    }]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'unitPrice' || field === 'quantity') {
      newItems[index].total = newItems[index].unitPrice * newItems[index].quantity;
    }

    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addDetail = (itemIndex: number) => {
    const newItems = [...items];
    newItems[itemIndex].details.push('');
    setItems(newItems);
  };

  const updateDetail = (itemIndex: number, detailIndex: number, value: string) => {
    const newItems = [...items];
    newItems[itemIndex].details[detailIndex] = value;
    setItems(newItems);
  };

  const removeDetail = (itemIndex: number, detailIndex: number) => {
    const newItems = [...items];
    newItems[itemIndex].details = newItems[itemIndex].details.filter((_, i) => i !== detailIndex);
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateVAT = () => {
    return (calculateSubtotal() * vatRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const formatDateForInvoice = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleGenerateInvoice = async () => {
    if (!selectedClient) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un client' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (items.length === 0 || items.some(item => !item.description)) {
      setMessage({ type: 'error', text: 'Veuillez ajouter au moins un article valide' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setLoading(true);
    try {
      const invoiceData = {
        invoiceNumber,
        invoiceDate: formatDateForInvoice(invoiceDate),
        clientId: selectedClient.id,
        clientName: selectedClient.nom_prenom_gerant,
        clientCompany: selectedClient.nom_societe,
        clientSiret: selectedClient.siret_siren,
        clientAddress: selectedClient.adresse,
        clientPostalCode: selectedClient.code_postal,
        clientCity: selectedClient.ville,
        items,
        subtotal: calculateSubtotal(),
        vatRate,
        vatAmount: calculateVAT(),
        total: calculateTotal()
      };

      await generateInvoicePDF(invoiceData);

      setMessage({ type: 'success', text: 'Facture générée avec succès!' });
      setTimeout(() => setMessage(null), 3000);

      loadInvoices();
      setShowCreateForm(false);
      resetForm();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la génération' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!confirm(`Supprimer la facture ${invoice.invoice_number} ?`)) return;

    const success = await deleteInvoice(invoice.id, invoice.pdf_url);
    if (success) {
      setMessage({ type: 'success', text: 'Facture supprimée' });
      setTimeout(() => setMessage(null), 3000);
      loadInvoices();
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const resetForm = () => {
    setSelectedClient(null);
    generateInvoiceNumber();
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setItems([{
      description: 'DUERP Numérique Article R4121-1',
      details: [
        'Rapport diagnostic conforme',
        'Accès à votre portail numérique',
        'Élaboration du document unique',
        'Suivi juridique en cas de contrôle',
        'Attestation de conformité DUERP'
      ],
      unitPrice: 830.00,
      quantity: 1,
      total: 830.00
    }]);
    setVatRate(20);
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Gestion des Factures</h3>
              <p className="text-sm text-gray-600">Créez et gérez vos factures de prise en charge</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Facture
          </button>
        </div>

        {showCreateForm && (
          <div className="border rounded-lg p-6 mb-6 bg-gray-50">
            <h4 className="font-semibold text-lg mb-4">Créer une nouvelle facture</h4>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de facture
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client
              </label>
              <select
                value={selectedClient?.id || ''}
                onChange={(e) => handleClientSelect(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Sélectionner un client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.nom_societe} - {client.nom_prenom_gerant}
                  </option>
                ))}
              </select>
            </div>

            {selectedClient && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-semibold">{selectedClient.nom_societe}</p>
                <p className="text-sm text-gray-600">SIRET: {selectedClient.siret_siren}</p>
                <p className="text-sm text-gray-600">{selectedClient.nom_prenom_gerant}</p>
                <p className="text-sm text-gray-600">{selectedClient.adresse}</p>
                <p className="text-sm text-gray-600">{selectedClient.code_postal} {selectedClient.ville}</p>
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Articles
                </label>
                <button
                  onClick={addItem}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un article
                </button>
              </div>

              {items.map((item, itemIndex) => (
                <div key={itemIndex} className="border rounded-lg p-4 mb-3 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(itemIndex, 'description', e.target.value)}
                      placeholder="Description de l'article"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={() => removeItem(itemIndex)}
                      className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Détails</span>
                      <button
                        onClick={() => addDetail(itemIndex)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        + Ajouter un détail
                      </button>
                    </div>
                    {item.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={detail}
                          onChange={(e) => updateDetail(itemIndex, detailIndex, e.target.value)}
                          placeholder="Détail"
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <button
                          onClick={() => removeDetail(itemIndex, detailIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Prix unitaire</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(itemIndex, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Quantité</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(itemIndex, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Total</label>
                      <input
                        type="text"
                        value={`${item.total.toFixed(2)} EUR`}
                        disabled
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Total HT:</span>
                <span className="font-semibold">{calculateSubtotal().toFixed(2)} EUR</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">TVA:</span>
                  <input
                    type="number"
                    value={vatRate}
                    onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span>%</span>
                </div>
                <span className="font-semibold">{calculateVAT().toFixed(2)} EUR</span>
              </div>
              <div className="flex justify-between text-lg border-t pt-2">
                <span className="font-bold">Total TTC:</span>
                <span className="font-bold text-blue-600">{calculateTotal().toFixed(2)} EUR</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPreview(!showPreview)}
                disabled={!selectedClient}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Eye className="w-5 h-5" />
                {showPreview ? 'Masquer' : 'Aperçu'}
              </button>
              <button
                onClick={handleGenerateInvoice}
                disabled={loading || !selectedClient}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Génération...' : 'Générer la Facture'}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setShowPreview(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
              >
                Annuler
              </button>
            </div>

            {showPreview && selectedClient && (
              <div className="mt-6 border rounded-lg p-6 bg-white">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Aperçu de la facture
                </h4>

                <div className="w-full max-w-4xl mx-auto bg-gray-100 p-8 rounded-lg shadow-inner">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ aspectRatio: '210/297' }}>
                    <div className="bg-blue-600 h-24 flex flex-col items-center justify-center relative">
                      <div className="bg-white rounded-lg shadow-md px-6 py-3 mb-2">
                        <div className="text-blue-600 text-2xl font-bold">Cabinet FPE</div>
                        <div className="text-gray-500 text-xs text-center">DUERP</div>
                      </div>
                      <div className="text-white text-sm">Sécurité Professionnelle</div>
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div className="bg-gray-100 rounded-lg p-4 w-1/2">
                          <div className="text-blue-600 font-bold text-sm mb-2">INFORMATIONS CLIENT</div>
                          <div className="text-sm space-y-1">
                            <div className="font-semibold">{selectedClient.nom_prenom_gerant}</div>
                            <div className="text-gray-600 text-xs">{selectedClient.nom_societe}</div>
                            <div className="text-gray-600 text-xs">SIRET: {selectedClient.siret_siren}</div>
                            <div className="text-gray-600 text-xs">{selectedClient.adresse}</div>
                            <div className="text-gray-600 text-xs">{selectedClient.code_postal} {selectedClient.ville}</div>
                          </div>
                        </div>

                        <div className="bg-white border-2 border-gray-200 rounded-lg p-3">
                          <div className="text-blue-600 font-bold text-center mb-1">FACTURE</div>
                          <div className="text-gray-500 text-xs text-center">N° {invoiceNumber}</div>
                          <div className="text-gray-500 text-xs text-center">Date : {formatDateForInvoice(invoiceDate)}</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="bg-blue-600 text-white text-xs font-bold p-2 rounded-t flex justify-between">
                          <span>Désignation</span>
                          <span>Montant HT</span>
                        </div>

                        {items.map((item, idx) => (
                          <div key={idx} className="border border-t-0 border-gray-200 p-3 bg-white">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-semibold text-xs mb-1">{item.description}</div>
                                <div className="text-xs text-gray-600 space-y-0.5">
                                  {item.details.map((detail, dIdx) => (
                                    <div key={dIdx}>• {detail}</div>
                                  ))}
                                </div>
                              </div>
                              <div className="text-blue-600 font-bold text-sm ml-4">{item.total.toFixed(2)} EUR</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-gray-100 rounded-lg p-4 mt-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total HT</span>
                            <span>{calculateSubtotal().toFixed(2)} EUR</span>
                          </div>
                          <div className="flex justify-between">
                            <span>TVA ({vatRate}%)</span>
                            <span>{calculateVAT().toFixed(2)} EUR</span>
                          </div>
                          <div className="border-t-2 border-blue-600 pt-2"></div>
                          <div className="bg-blue-600 text-white font-bold p-2 rounded flex justify-between">
                            <span>TOTAL TTC</span>
                            <span>{calculateTotal().toFixed(2)} EUR</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 text-white text-center py-3 mt-4">
                      <div className="text-xs">Cabinet FPE - Sécurité Professionnelle</div>
                      <div className="text-xs text-gray-400">administration@securiteprofessionnelle.fr</div>
                      <div className="text-xs text-gray-400">www.securiteprofessionnelle.fr</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <h4 className="font-semibold text-lg mb-4">Factures générées</h4>
          <div className="space-y-3">
            {invoices.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune facture générée</p>
            ) : (
              invoices.map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">Facture N° {invoice.invoice_number}</p>
                        <p className="text-sm text-gray-600">
                          {invoice.client_company} - {invoice.invoice_date}
                        </p>
                        <p className="text-sm font-semibold text-blue-600">{invoice.total.toFixed(2)} EUR</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={invoice.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Télécharger"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleDeleteInvoice(invoice)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceManager;
