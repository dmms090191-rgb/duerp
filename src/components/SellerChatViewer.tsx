import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, User, Send, Search, ShoppingBag, X, Trash2 } from 'lucide-react';

interface Seller {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

interface Message {
  id: string;
  seller_id: string;
  sender_id: string;
  sender_type: 'admin' | 'seller';
  sender_name?: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface SellerChatViewerProps {
  supabaseUrl: string;
  supabaseKey: string;
  preselectedSellerId?: string | null;
  adminEmail: string;
  sellers: Seller[];
}

const SellerChatViewer: React.FC<SellerChatViewerProps> = ({
  supabaseUrl,
  supabaseKey,
  preselectedSellerId,
  adminEmail,
  sellers,
}) => {
  const [sellersWithMessages, setSellersWithMessages] = useState<Set<string>>(new Set());
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSellersWithDiscussions();
  }, []);

  useEffect(() => {
    if (selectedSeller) {
      loadMessages(selectedSeller.id);
      const interval = setInterval(() => {
        loadMessages(selectedSeller.id);
        loadSellersWithDiscussions();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedSeller]);

  useEffect(() => {
    if (preselectedSellerId && sellers.length > 0) {
      const seller = sellers.find(s => s.id === preselectedSellerId);
      if (seller) {
        setSelectedSeller(seller);
      }
    }
  }, [preselectedSellerId, sellers]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSellersWithDiscussions = async () => {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/admin_seller_messages?select=seller_id`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const sellerIds = new Set(data.map((msg: any) => msg.seller_id));
        setSellersWithMessages(sellerIds);
      }
    } catch (error) {
      console.error('Error loading sellers with discussions:', error);
    }
  };

  const loadMessages = async (sellerId: string) => {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/admin_seller_messages?seller_id=eq.${sellerId}&order=created_at.asc`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSeller || sending) return;

    setSending(true);
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/admin_seller_messages`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            seller_id: selectedSeller.id,
            sender_id: adminEmail,
            sender_type: 'admin',
            sender_name: 'Admin',
            message: newMessage.trim(),
            read: false,
          }),
        }
      );

      if (response.ok) {
        setNewMessage('');
        loadMessages(selectedSeller.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const deleteAllMessages = async () => {
    if (!selectedSeller) return;

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/admin_seller_messages?seller_id=eq.${selectedSeller.id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      if (response.ok) {
        setMessages([]);
        setShowDeleteConfirm(false);
        await loadSellersWithDiscussions();
        alert('Tous les messages ont été supprimés');
      } else {
        alert('Erreur lors de la suppression des messages');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des messages:', error);
      alert('Erreur lors de la suppression des messages');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!selectedSeller) return;

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/admin_seller_messages?id=eq.${messageId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      if (response.ok) {
        await loadMessages(selectedSeller.id);
        await loadSellersWithDiscussions();
      } else {
        alert('Erreur lors de la suppression du message');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      alert('Erreur lors de la suppression du message');
    }
  };

  const sellersWithDiscussions = sellers
    .filter(seller => sellersWithMessages.has(seller.id))
    .filter(seller => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const fullName = `${seller.prenom} ${seller.nom}`.toLowerCase();
      const nameParts = fullName.split(' ');
      return fullName.includes(query) || nameParts.some(part => part.startsWith(query));
    });

  const sellersWithoutDiscussions = sellers.filter(seller => !sellersWithMessages.has(seller.id));

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return <>{text}</>;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-200 px-1 rounded">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  const SellerCard = ({ seller }: { seller: Seller }) => {
    const fullName = `${seller.prenom} ${seller.nom}`;
    return (
      <button
        key={seller.id}
        onClick={() => setSelectedSeller(seller)}
        className={`w-full text-left p-4 rounded-lg border transition-all ${
          selectedSeller?.id === seller.id
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {highlightText(fullName, searchQuery)}
            </p>
            <p className="text-xs text-gray-500 truncate">{seller.email}</p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-gray-900">
              Avec discussions ({sellersWithDiscussions.length})
            </h3>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un vendeur..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {sellersWithDiscussions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {searchQuery ? 'Aucun résultat' : 'Aucune discussion'}
              </p>
            ) : (
              sellersWithDiscussions.map((seller) => <SellerCard key={seller.id} seller={seller} />)
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">
              Sans discussion ({sellersWithoutDiscussions.length})
            </h3>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {sellersWithoutDiscussions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Tous les vendeurs ont des discussions</p>
            ) : (
              sellersWithoutDiscussions.map((seller) => <SellerCard key={seller.id} seller={seller} />)
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-3">
        {selectedSeller ? (
          <div className="bg-white rounded-2xl shadow-lg relative">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-500 to-teal-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-white" />
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedSeller.prenom} {selectedSeller.nom}
                    </h3>
                    <p className="text-emerald-100 text-sm">{selectedSeller.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                  title="Supprimer la conversation"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {showDeleteConfirm && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                      <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Supprimer la conversation</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Êtes-vous sûr de vouloir supprimer tous les messages de cette conversation ? Cette action est irréversible.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={deleteAllMessages}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="h-[500px] overflow-y-auto p-6 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun message pour le moment</p>
                    <p className="text-sm text-gray-400 mt-2">Envoyez un message pour démarrer la conversation</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="relative group inline-block max-w-[85%]">
                        <div
                          className={`rounded-lg px-4 py-3 shadow-sm ${
                            msg.sender_type === 'admin'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                              msg.sender_type === 'admin' ? 'bg-emerald-700' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            }`}>
                              {msg.sender_type === 'admin' ? (
                                <User className="w-3 h-3 text-white" />
                              ) : (
                                <ShoppingBag className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <p className={`text-xs font-medium ${msg.sender_type === 'admin' ? 'text-emerald-100' : 'text-gray-500'}`}>
                              {msg.sender_name || (msg.sender_type === 'admin' ? 'Admin' : 'Vendeur')}
                            </p>
                          </div>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                          <p className={`text-xs mt-2 ${msg.sender_type === 'admin' ? 'text-emerald-100' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          title="Supprimer ce message"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-white rounded-b-2xl">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  rows={2}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg h-full flex items-center justify-center">
            <div className="text-center p-12">
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Chat Vendeur
              </h3>
              <p className="text-gray-600">
                Sélectionnez un vendeur dans la liste pour démarrer ou continuer une conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerChatViewer;
