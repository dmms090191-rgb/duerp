import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import LoginPage from './components/LoginPage';
import MobileLoginScreen from './components/MobileLoginScreen';
import Dashboard from './components/Dashboard';
import ClientDashboard from './components/ClientDashboard';
import SellerDashboard from './components/SellerDashboard';
import SecteurTertiaire from './pages/SecteurTertiaire';
import SecteurResidentiel from './pages/SecteurResidentiel';
import SecteurIndustriel from './pages/SecteurIndustriel';
import QuestCeQueDUERP from './pages/QuestCeQueDUERP';
import QuestCeQuePenibilite from './pages/QuestCeQuePenibilite';
import Accompagnement from './pages/Accompagnement';
import CotisationsATMP from './pages/CotisationsATMP';
import PriseEnChargeOPCO from './pages/PriseEnChargeOPCO';
import Officiel from './pages/Officiel';
import DuerpConforme from './pages/DuerpConforme';
import { User } from './types/User';
import { Lead } from './types/Lead';
import { Registration } from './types/Registration';
import { Seller } from './types/Seller';
import { Admin } from './types/Admin';
import { leadService } from './services/leadService';
import { adminService } from './services/adminService';
import { sellerService } from './services/sellerService';
import { clientService } from './services/clientService';
import { supabase } from './lib/supabase';

function App() {
  const isMobileApp = Capacitor.isNativePlatform();

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const stored = sessionStorage.getItem('isAdminLoggedIn');
    return stored === 'true';
  });
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem('adminUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [leads, setLeads] = useState<Lead[]>(() => {
    const savedLeads = localStorage.getItem('leads');
    return savedLeads ? JSON.parse(savedLeads) : [];
  });
  const [bulkLeads, setBulkLeads] = useState<Lead[]>(() => {
    const savedBulkLeads = localStorage.getItem('bulkLeads');
    return savedBulkLeads ? JSON.parse(savedBulkLeads) : [];
  });
  const [transferredLeads, setTransferredLeads] = useState<Lead[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const savedRegistrations = localStorage.getItem('global_registrations');
    return savedRegistrations ? JSON.parse(savedRegistrations) : [];
  });
  const [sellers, setSellers] = useState<Seller[]>(() => {
    const savedSellers = localStorage.getItem('sellers');
    return savedSellers ? JSON.parse(savedSellers) : [];
  });
  const [admins, setAdmins] = useState<Admin[]>(() => {
    const savedAdmins = localStorage.getItem('admins');
    return savedAdmins ? JSON.parse(savedAdmins) : [];
  });
  const [superAdminCredentials, setSuperAdminCredentials] = useState<{email: string, password: string}>(() => {
    const saved = localStorage.getItem('superAdminCredentials');
    return saved ? JSON.parse(saved) : { email: 'dmms090191@gmail.com', password: '000000' };
  });
  const [homepageImage, setHomepageImage] = useState<string | null>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [isAdminViewingClient, setIsAdminViewingClient] = useState(false);
  const [sellerData, setSellerData] = useState<Seller | null>(() => {
    const stored = sessionStorage.getItem('sellerData');
    return stored ? JSON.parse(stored) : null;
  });

  const getUserKey = () => {
    if (user?.type === 'admin') return `admin_${user.id}`;
    if (sellerData) return `seller_${sellerData.id}`;
    return 'default';
  };

  useEffect(() => {
    const storedClientData = sessionStorage.getItem('clientData');
    const storedIsAdminViewing = sessionStorage.getItem('isAdminViewingClient');
    if (storedClientData) {
      try {
        setClientData(JSON.parse(storedClientData));
        if (storedIsAdminViewing === 'true') {
          setIsAdminViewingClient(true);
        }
      } catch (e) {
        console.error('Erreur parsing clientData:', e);
        sessionStorage.removeItem('clientData');
        sessionStorage.removeItem('isAdminViewingClient');
      }
    }

    const loadDataFromSupabase = async () => {
      try {
        const [leadsData, adminsData, sellersData, clientsData] = await Promise.all([
          leadService.getAllLeads(),
          adminService.getAllAdmins(),
          sellerService.getAllSellers(),
          clientService.getAllClients()
        ]);

        const formattedLeads = leadsData.map((lead: any) => {
          const formattedLead = {
            id: lead.id,
            nom: lead.nom || lead.full_name?.split(' ').pop() || '',
            prenom: lead.prenom || lead.full_name?.split(' ')[0] || '',
            email: lead.email,
            motDePasse: lead.client_password || '',
            telephone: lead.phone || '',
            portable: lead.portable || '',
            dateCreation: new Date(lead.created_at).toLocaleString('fr-FR'),
            rendez_vous: lead.rendez_vous || '',
            activite: lead.activite || '',
            societe: lead.company_name || '',
            siret: lead.siret || '',
            vendeur: lead.vendeur || '',
            commentaires: lead.commentaires || '',
            address: lead.address || '',
            ville: lead.ville || '',
            code_postal: lead.code_postal || '',
            pays: lead.pays || 'France',
            anniversaire: lead.anniversaire || '',
            autre_courriel: lead.autre_courriel || '',
            date_affectation: lead.date_affectation || '',
            representant: lead.representant || '',
            prevente: lead.prevente || '',
            retention: lead.retention || '',
            sous_affilie: lead.sous_affilie || '',
            langue: lead.langue || 'Français',
            conseiller: lead.conseiller || '',
            source: lead.source || '',
            qualifiee: lead.qualifiee || false,
            status_id: lead.status_id,
            status: lead.status,
            creePar: lead.notes?.includes('par') ? lead.notes.split('par ')[1] : 'Admin',
            client_password: lead.client_password || '',
            client_account_created: lead.client_account_created || false,
            isOnline: lead.is_online || false,
            lastConnection: lead.last_connection || undefined
          };
          console.log('📋 [App] Lead formaté - ID:', formattedLead.id, 'SIRET:', formattedLead.siret, 'Société:', formattedLead.societe);
          return formattedLead;
        });
        setLeads(formattedLeads);

        const formattedAdmins = adminsData.map((admin: any) => ({
          id: admin.id,
          nom: admin.full_name?.split(' ').slice(1).join(' ') || admin.full_name || '',
          prenom: admin.full_name?.split(' ')[0] || '',
          email: admin.email,
          motDePasse: '',
          dateCreation: new Date(admin.created_at).toLocaleString('fr-FR'),
          isOnline: admin.is_online || false,
          lastConnection: admin.last_connection || undefined
        }));
        setAdmins(formattedAdmins);

        const formattedSellers = sellersData.map((seller: any) => ({
          id: seller.id,
          nom: seller.full_name?.split(' ').pop() || '',
          prenom: seller.full_name?.split(' ')[0] || '',
          full_name: seller.full_name,
          email: seller.email,
          motDePasse: seller.password || '',
          dateCreation: new Date(seller.created_at).toLocaleString('fr-FR'),
          isOnline: seller.is_online || false,
          lastConnection: seller.last_connection || undefined
        }));
        setSellers(formattedSellers);

        const formattedClients = clientsData.map((client: any) => ({
          id: client.id,
          nom: client.nom || client.full_name?.split(' ').pop() || '',
          prenom: client.prenom || client.full_name?.split(' ')[0] || '',
          email: client.email,
          motDePasse: client.client_password || '',
          telephone: client.phone || '',
          portable: client.portable || '',
          dateCreation: new Date(client.created_at).toLocaleString('fr-FR'),
          dateInscription: new Date(client.created_at).toLocaleString('fr-FR'),
          rendez_vous: client.rendez_vous || '',
          activite: client.activite || '',
          societe: client.company_name || '',
          siret: client.siret || '',
          vendeur: client.vendeur || '',
          commentaires: client.vendeur || '',
          agentAssigne: client.vendeur,
          status_id: client.status_id,
          status: client.status,
          client_password: client.client_password || '',
          client_account_created: client.client_account_created || false,
          address: client.address || '',
          ville: client.ville || '',
          code_postal: client.code_postal || '',
          pays: client.pays || 'France',
          anniversaire: client.anniversaire || '',
          autre_courriel: client.autre_courriel || '',
          date_affectation: client.date_affectation || '',
          representant: client.representant || '',
          prevente: client.prevente || '',
          retention: client.retention || '',
          sous_affilie: client.sous_affilie || '',
          langue: client.langue || 'Français',
          conseiller: client.conseiller || '',
          source: client.source || '',
          qualifiee: client.qualifiee || false,
          isOnline: client.is_online || false,
          lastConnection: client.last_connection || undefined
        }));
        setRegistrations(formattedClients);
        setTransferredLeads(formattedClients);

        console.log('✅ Données chargées depuis Supabase');
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    loadDataFromSupabase();
  }, []);

  useEffect(() => {
    const userKey = getUserKey();
    const savedLeads = localStorage.getItem(`leads_${userKey}`);
    setLeads(savedLeads ? JSON.parse(savedLeads) : []);
  }, [user, sellerData]);

  useEffect(() => {
    const userKey = getUserKey();
    if (userKey !== 'default') {
      localStorage.setItem(`leads_${userKey}`, JSON.stringify(leads));
    }
  }, [leads, user, sellerData]);

  useEffect(() => {
    localStorage.setItem('leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('bulkLeads', JSON.stringify(bulkLeads));
  }, [bulkLeads]);


  useEffect(() => {
    localStorage.setItem('global_registrations', JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem('sellers', JSON.stringify(sellers));
  }, [sellers]);

  useEffect(() => {
    localStorage.setItem('admins', JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    localStorage.setItem('superAdminCredentials', JSON.stringify(superAdminCredentials));
  }, [superAdminCredentials]);


  const handleLogin = async (email: string, password: string) => {
    const sellerIndex = sellers.findIndex(
      s => s.email === email && s.motDePasse === password
    );

    if (sellerIndex !== -1) {
      try {
        await supabase
          .from('sellers')
          .update({
            is_online: true,
            last_connection: new Date().toISOString()
          })
          .eq('id', sellers[sellerIndex].id);
      } catch (error) {
        console.error('Erreur mise à jour statut seller:', error);
      }

      const updatedSeller = {
        ...sellers[sellerIndex],
        isOnline: true,
        lastConnection: new Date().toISOString()
      };
      const updatedSellers = [...sellers];
      updatedSellers[sellerIndex] = updatedSeller;
      setSellers(updatedSellers);
      setSellerData(updatedSeller);
      sessionStorage.setItem('sellerData', JSON.stringify(updatedSeller));
      sessionStorage.setItem('sellerEmail', email);
      return true;
    }

    const adminIndex = admins.findIndex(
      a => a.email === email && a.motDePasse === password
    );

    if (adminIndex !== -1) {
      try {
        const adminData = await adminService.getAdminByEmail(email);
        if (adminData) {
          await supabase
            .from('admins')
            .update({
              is_online: true,
              last_connection: new Date().toISOString()
            })
            .eq('id', adminData.id);

          const updatedAdmin = {
            id: adminData.id,
            nom: adminData.full_name?.split(' ').slice(1).join(' ') || adminData.full_name || '',
            prenom: adminData.full_name?.split(' ')[0] || '',
            email: adminData.email,
            motDePasse: password,
            dateCreation: new Date(adminData.created_at).toLocaleString('fr-FR'),
            isOnline: true,
            lastConnection: new Date().toISOString()
          };

          const updatedAdmins = [...admins];
          updatedAdmins[adminIndex] = updatedAdmin;
          setAdmins(updatedAdmins);

          const adminUser = {
            id: updatedAdmin.id,
            email: updatedAdmin.email,
            type: 'admin' as const,
            nom: updatedAdmin.nom,
            prenom: updatedAdmin.prenom
          };
          setIsLoggedIn(true);
          setUser(adminUser);
          sessionStorage.setItem('isAdminLoggedIn', 'true');
          sessionStorage.setItem('adminUser', JSON.stringify(adminUser));
          sessionStorage.setItem('adminEmail', email);
          return true;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données admin:', error);
      }
    }

    if (email === superAdminCredentials.email && password === superAdminCredentials.password) {
      const adminUser = {
        id: 'super-admin',
        email,
        type: 'admin' as const,
        nom: 'Super',
        prenom: 'Admin'
      };
      setIsLoggedIn(true);
      setUser(adminUser);
      sessionStorage.setItem('isAdminLoggedIn', 'true');
      sessionStorage.setItem('adminUser', JSON.stringify(adminUser));
      sessionStorage.setItem('adminEmail', email);
      return true;
    }

    return false;
  };

  const handleLogout = async () => {
    if (user) {
      try {
        await supabase
          .from('admins')
          .update({
            is_online: false,
            last_connection: new Date().toISOString()
          })
          .eq('id', user.id);
      } catch (error) {
        console.error('Erreur mise à jour statut admin:', error);
      }

      const adminIndex = admins.findIndex(a => a.id === user.id);
      if (adminIndex !== -1) {
        const updatedAdmin = {
          ...admins[adminIndex],
          isOnline: false,
          lastConnection: new Date().toISOString()
        };
        const updatedAdmins = [...admins];
        updatedAdmins[adminIndex] = updatedAdmin;
        setAdmins(updatedAdmins);
      }
    }
    setIsLoggedIn(false);
    setUser(null);
    setLeads([]);
    setRegistrations([]);
    sessionStorage.removeItem('isAdminLoggedIn');
    sessionStorage.removeItem('adminUser');
  };

  const handleClientLogin = (data: any) => {
    setClientData(data);
    sessionStorage.setItem('clientData', JSON.stringify(data));
  };

  const handleAdminLoginAsClient = (lead: Lead) => {
    const clientData = {
      user: { id: lead.id, email: lead.email },
      token: 'admin-viewing-token',
      client: {
        id: lead.id,
        email: lead.email,
        full_name: `${lead.prenom} ${lead.nom}`,
        phone: lead.telephone,
        status: 'actif',
        created_at: lead.dateCreation || new Date().toISOString()
      }
    };
    setClientData(clientData);
    setIsAdminViewingClient(true);
    sessionStorage.setItem('clientData', JSON.stringify(clientData));
    sessionStorage.setItem('isAdminViewingClient', 'true');
    window.location.href = '/client/dashboard';
  };

  const handleReturnToAdmin = () => {
    setClientData(null);
    setIsAdminViewingClient(false);
    sessionStorage.removeItem('clientData');
    sessionStorage.removeItem('isAdminViewingClient');
    window.location.href = '/';
  };

  const handleAdminLoginAsSeller = (seller: Seller) => {
    const sellerData = {
      ...seller,
      isAdminViewing: true
    };
    setSellerData(sellerData);
    sessionStorage.setItem('sellerData', JSON.stringify(sellerData));
    sessionStorage.setItem('isAdminViewingSeller', 'true');
    window.location.href = '/seller/dashboard';
  };

  const handleReturnToAdminFromSeller = () => {
    setSellerData(null);
    sessionStorage.removeItem('sellerData');
    sessionStorage.removeItem('isAdminViewingSeller');
    window.location.href = '/';
  };

  const handleSellerLoginAsClient = (client: any) => {
    const clientData = {
      user: { id: client.id, email: client.email },
      token: 'seller-viewing-token',
      client: {
        id: client.id,
        email: client.email,
        full_name: `${client.prenom} ${client.nom}`,
        phone: client.phone || client.telephone,
        status: 'actif',
        created_at: client.created_at || new Date().toISOString()
      }
    };
    setClientData(clientData);
    sessionStorage.setItem('clientData', JSON.stringify(clientData));
    sessionStorage.setItem('isSellerViewingClient', 'true');
    window.location.href = '/client/dashboard';
  };

  const handleReturnToSellerFromClient = () => {
    setClientData(null);
    sessionStorage.removeItem('clientData');
    sessionStorage.removeItem('isSellerViewingClient');
    window.location.href = '/seller/dashboard';
  };

  const handleClientLogout = async () => {
    try {
      if (clientData) {
        const clientId = clientData.client?.id || clientData.user?.id || clientData.id;
        if (clientId) {
          // Mise à jour du statut hors ligne
          await supabase
            .from('clients')
            .update({
              is_online: false,
              last_connection: new Date().toISOString()
            })
            .eq('id', clientId);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setClientData(null);
      sessionStorage.removeItem('clientData');
      sessionStorage.removeItem('isAdminViewingClient');
      window.location.href = '/';
    }
  };

  const handleSellerLogin = (seller: Seller) => {
    setSellerData(seller);
    sessionStorage.setItem('sellerData', JSON.stringify(seller));
  };

  const handleSellerLogout = async () => {
    try {
      if (sellerData) {
        const sellerId = sellerData.id;
        if (sellerId) {
          // Mise à jour du statut hors ligne dans Supabase
          await supabase
            .from('sellers')
            .update({
              is_online: false,
              last_connection: new Date().toISOString()
            })
            .eq('id', sellerId);

          const sellerIndex = sellers.findIndex(s => s.id === sellerId);
          if (sellerIndex !== -1) {
            const updatedSeller = {
              ...sellers[sellerIndex],
              isOnline: false,
              lastConnection: new Date().toISOString()
            };
            const updatedSellers = [...sellers];
            updatedSellers[sellerIndex] = updatedSeller;
            setSellers(updatedSellers);
          }
        }
      }

      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setSellerData(null);
      sessionStorage.removeItem('sellerData');
      sessionStorage.removeItem('isAdminViewingSeller');
      setLeads([]);
      setRegistrations([]);
      window.location.href = '/';
    }
  };

  const handleLeadCreated = async (newLead: Lead) => {
    console.log('🔄 [App] handleLeadCreated appelé avec:', newLead);
    setLeads(prev => [...prev, newLead]);

    try {
      const leadsData = await leadService.getAllLeads();
      const formattedLeads = leadsData.map((lead: any) => ({
        id: lead.id,
        nom: lead.nom || lead.full_name?.split(' ').pop() || '',
        prenom: lead.prenom || lead.full_name?.split(' ')[0] || '',
        email: lead.email,
        motDePasse: lead.client_password || '',
        telephone: lead.phone || '',
        portable: lead.portable || '',
        dateCreation: new Date(lead.created_at).toLocaleString('fr-FR'),
        rendez_vous: lead.rendez_vous || '',
        activite: lead.activite || '',
        societe: lead.company_name || '',
        siret: lead.siret || '',
        commentaires: lead.commentaires || '',
        address: lead.address || '',
        ville: lead.ville || '',
        code_postal: lead.code_postal || '',
        pays: lead.pays || 'France',
        anniversaire: lead.anniversaire || '',
        autre_courriel: lead.autre_courriel || '',
        date_affectation: lead.date_affectation || '',
        representant: lead.representant || '',
        prevente: lead.prevente || '',
        retention: lead.retention || '',
        sous_affilie: lead.sous_affilie || '',
        langue: lead.langue || 'Français',
        conseiller: lead.conseiller || '',
        source: lead.source || '',
        qualifiee: lead.qualifiee || false,
        status_id: lead.status_id,
        status: lead.status,
        creePar: lead.notes?.includes('par') ? lead.notes.split('par ')[1] : 'Admin',
        client_password: lead.client_password || '',
        client_account_created: lead.client_account_created || false,
        isOnline: lead.is_online || false,
        lastConnection: lead.last_connection || undefined
      }));
      console.log('✅ [App] Leads rechargés depuis Supabase:', formattedLeads.length);
      setLeads(formattedLeads);
    } catch (error) {
      console.error('❌ [App] Erreur lors du rechargement des leads:', error);
    }
  };

  const handleBulkLeadCreated = (newLead: Lead) => {
    setBulkLeads(prev => [...prev, newLead]);
  };

  const handleLeadsDeleted = async (leadIds: number[]) => {
    console.log('🔄 [App] handleLeadsDeleted appelé avec:', leadIds);
    setLeads(prev => prev.filter(lead => !leadIds.includes(lead.id)));

    try {
      const leadsData = await leadService.getAllLeads();
      const formattedLeads = leadsData.map((lead: any) => ({
        id: lead.id,
        nom: lead.nom || lead.full_name?.split(' ').pop() || '',
        prenom: lead.prenom || lead.full_name?.split(' ')[0] || '',
        email: lead.email,
        motDePasse: lead.client_password || '',
        telephone: lead.phone || '',
        portable: lead.portable || '',
        dateCreation: new Date(lead.created_at).toLocaleString('fr-FR'),
        rendez_vous: lead.rendez_vous || '',
        activite: lead.activite || '',
        societe: lead.company_name || '',
        siret: lead.siret || '',
        commentaires: lead.commentaires || '',
        address: lead.address || '',
        ville: lead.ville || '',
        code_postal: lead.code_postal || '',
        pays: lead.pays || 'France',
        anniversaire: lead.anniversaire || '',
        autre_courriel: lead.autre_courriel || '',
        date_affectation: lead.date_affectation || '',
        representant: lead.representant || '',
        prevente: lead.prevente || '',
        retention: lead.retention || '',
        sous_affilie: lead.sous_affilie || '',
        langue: lead.langue || 'Français',
        conseiller: lead.conseiller || '',
        source: lead.source || '',
        qualifiee: lead.qualifiee || false,
        status_id: lead.status_id,
        status: lead.status,
        creePar: lead.notes?.includes('par') ? lead.notes.split('par ')[1] : 'Admin',
        client_password: lead.client_password || '',
        client_account_created: lead.client_account_created || false,
        isOnline: lead.is_online || false,
        lastConnection: lead.last_connection || undefined
      }));
      console.log('✅ [App] Leads rechargés depuis Supabase:', formattedLeads.length);
      setLeads(formattedLeads);
    } catch (error) {
      console.error('❌ [App] Erreur lors du rechargement des leads:', error);
    }
  };

  const handleBulkLeadsDeleted = (leadIds: number[]) => {
    setBulkLeads(prev => prev.filter(lead => !leadIds.includes(lead.id)));
  };

  const handleBulkLeadsTransferred = async (leadIds: number[]) => {
    console.log('🔄 [BULK TRANSFER] Début du transfert pour:', leadIds);
    const leadsToTransfer = bulkLeads.filter(lead => leadIds.includes(lead.id));
    console.log('🔄 [BULK TRANSFER] Leads à transférer:', leadsToTransfer);

    if (leadsToTransfer.length === 0) {
      console.error('❌ [BULK TRANSFER] Aucun lead trouvé à transférer');
      alert('❌ Aucun lead trouvé à transférer');
      return;
    }

    // Créer tous les clients en parallèle pour une performance maximale
    const clientPromises = leadsToTransfer.map(lead => {
      console.log('🔄 [BULK TRANSFER] Création client:', lead.email, lead.prenom, lead.nom);
      return clientService.createClient({
        email: lead.email,
        full_name: `${lead.prenom} ${lead.nom}`,
        phone: lead.telephone || '',
        prenom: lead.prenom,
        nom: lead.nom,
        portable: lead.portable || '',
        rendez_vous: lead.rendez_vous || undefined,
        activite: lead.activite || '',
        company_name: lead.societe || '',
        siret: lead.siret || '',
        vendeur: lead.conseiller || '',
        address: lead.address || '',
        ville: lead.ville || '',
        code_postal: lead.code_postal || '',
        pays: lead.pays || 'France',
        anniversaire: lead.anniversaire || undefined,
        autre_courriel: lead.autre_courriel || '',
        date_affectation: lead.date_affectation || undefined,
        representant: lead.representant || '',
        prevente: lead.prevente || '',
        retention: lead.retention || '',
        sous_affilie: lead.sous_affilie || '',
        langue: lead.langue || 'Français',
        conseiller: lead.conseiller || '',
        source: lead.source || '',
        qualifiee: lead.qualifiee || false,
        status_id: lead.status_id,
        client_password: lead.motDePasse || '',
        client_account_created: lead.client_account_created || false,
      }).then(client => {
        console.log('✅ [BULK TRANSFER] Client créé avec succès:', client?.email, 'ID:', client?.id);
        return client;
      }).catch(error => {
        console.error('❌ [BULK TRANSFER] Erreur création client:', lead.email, error);
        console.error('❌ [BULK TRANSFER] Détails erreur:', error.message);
        return null;
      });
    });

    const createdClients = await Promise.all(clientPromises);
    const successfulClients = createdClients.filter(client => client !== null);
    console.log(`✅ [BULK TRANSFER] ${successfulClients.length}/${leadsToTransfer.length} clients créés`);

    if (successfulClients.length === 0) {
      console.error('❌ [BULK TRANSFER] Aucun client créé avec succès');
      alert('❌ Erreur: Aucun client n\'a pu être créé. Vérifiez la console pour plus de détails.');
      return;
    }

    // Supprimer les leads de la base de données après création des clients
    console.log('🔄 [BULK TRANSFER] Suppression des leads de la base de données...');
    try {
      await leadService.deleteMultipleLeads(leadIds);
      console.log('✅ [BULK TRANSFER] Leads supprimés de la base de données');
    } catch (error) {
      console.error('❌ [BULK TRANSFER] Erreur lors de la suppression des leads:', error);
    }

    console.log('🔄 [BULK TRANSFER] Rechargement des clients depuis Supabase...');
    try {
      const clientsData = await clientService.getAllClients();
      console.log(`✅ [BULK TRANSFER] ${clientsData.length} clients récupérés depuis Supabase`);

      const formattedClients = clientsData.map((client: any) => ({
        id: client.id,
        nom: client.nom || client.full_name?.split(' ').pop() || '',
        prenom: client.prenom || client.full_name?.split(' ')[0] || '',
        email: client.email,
        motDePasse: client.client_password || '',
        telephone: client.phone || '',
        portable: client.portable || '',
        dateCreation: new Date(client.created_at).toLocaleString('fr-FR'),
        dateInscription: new Date(client.created_at).toLocaleString('fr-FR'),
        rendez_vous: client.rendez_vous || '',
        activite: client.activite || '',
        societe: client.company_name || '',
        siret: client.siret || '',
        vendeur: client.vendeur || '',
        commentaires: client.vendeur || '',
        agentAssigne: client.assigned_agent_name,
        status_id: client.status_id,
        status: client.status,
        client_password: client.client_password || '',
        client_account_created: client.client_account_created || false,
        address: client.address || '',
        ville: client.ville || '',
        code_postal: client.code_postal || '',
        pays: client.pays || 'France',
        anniversaire: client.anniversaire || '',
        autre_courriel: client.autre_courriel || '',
        date_affectation: client.date_affectation || '',
        representant: client.representant || '',
        prevente: client.prevente || '',
        retention: client.retention || '',
        sous_affilie: client.sous_affilie || '',
        langue: client.langue || 'Français',
        conseiller: client.conseiller || '',
        source: client.source || '',
        qualifiee: client.qualifiee || false,
        isOnline: client.is_online || false,
        lastConnection: client.last_connection || undefined
      }));

      console.log(`✅ [BULK TRANSFER] ${formattedClients.length} clients formatés`);
      setTransferredLeads(formattedClients);
      setBulkLeads(prev => prev.filter(lead => !leadIds.includes(lead.id)));
      console.log('✅ [BULK TRANSFER] Transfert terminé avec succès - State mis à jour');
    } catch (error) {
      console.error('❌ [BULK TRANSFER] Erreur rechargement:', error);
      alert('❌ Erreur lors du rechargement des clients');
    }
  };

  const handleLeadsTransferred = async (leadIds: number[]) => {
    console.log('🔄 [LEADS TRANSFER] Début du transfert pour:', leadIds);
    const leadsToTransfer = leads.filter(lead => leadIds.includes(lead.id));
    console.log('🔄 [LEADS TRANSFER] Leads à transférer:', leadsToTransfer);

    // Créer tous les clients en parallèle pour une performance maximale
    const clientPromises = leadsToTransfer.map(lead =>
      clientService.createClient({
        email: lead.email,
        full_name: `${lead.prenom} ${lead.nom}`,
        phone: lead.telephone || '',
        prenom: lead.prenom,
        nom: lead.nom,
        portable: lead.portable,
        rendez_vous: lead.rendez_vous || undefined,
        activite: lead.activite,
        company_name: lead.societe,
        siret: lead.siret,
        vendeur: lead.conseiller || '',
        address: lead.address,
        ville: lead.ville,
        code_postal: lead.code_postal,
        pays: lead.pays,
        anniversaire: lead.anniversaire || undefined,
        autre_courriel: lead.autre_courriel,
        date_affectation: lead.date_affectation || undefined,
        representant: lead.representant,
        prevente: lead.prevente,
        retention: lead.retention,
        sous_affilie: lead.sous_affilie,
        langue: lead.langue,
        conseiller: lead.conseiller,
        source: lead.source,
        qualifiee: lead.qualifiee,
        status_id: lead.status_id,
        client_password: lead.client_password,
        client_account_created: lead.client_account_created,
      }).catch(error => {
        console.error('❌ [LEADS TRANSFER] Erreur création client:', lead.email, error);
        return null;
      })
    );

    const createdClients = await Promise.all(clientPromises);
    const successfulClients = createdClients.filter(client => client !== null);
    console.log(`✅ [LEADS TRANSFER] ${successfulClients.length}/${leadsToTransfer.length} clients créés`);

    console.log('🔄 [LEADS TRANSFER] Suppression des leads de la table leads...');
    try {
      await leadService.deleteMultipleLeads(leadIds);
      console.log('✅ [LEADS TRANSFER] Leads supprimés');
    } catch (error) {
      console.error('❌ [LEADS TRANSFER] Erreur suppression leads:', error);
    }

    console.log('🔄 [LEADS TRANSFER] Rechargement des clients...');
    const [clientsData] = await Promise.all([clientService.getAllClients()]);
    const formattedClients = clientsData.map((client: any) => ({
      id: client.id,
      nom: client.nom || client.full_name?.split(' ').pop() || '',
      prenom: client.prenom || client.full_name?.split(' ')[0] || '',
      email: client.email,
      motDePasse: client.client_password || '',
      telephone: client.phone || '',
      portable: client.portable || '',
      dateCreation: new Date(client.created_at).toLocaleString('fr-FR'),
      dateInscription: new Date(client.created_at).toLocaleString('fr-FR'),
      rendez_vous: client.rendez_vous || '',
      activite: client.activite || '',
      societe: client.company_name || '',
      siret: client.siret || '',
      commentaires: client.vendeur || '',
      agentAssigne: client.assigned_agent_name,
      status_id: client.status_id,
      status: client.status,
      client_password: client.client_password || '',
      client_account_created: client.client_account_created || false,
      address: client.address || '',
      ville: client.ville || '',
      code_postal: client.code_postal || '',
      pays: client.pays || 'France',
      anniversaire: client.anniversaire || '',
      autre_courriel: client.autre_courriel || '',
      date_affectation: client.date_affectation || '',
      representant: client.representant || '',
      prevente: client.prevente || '',
      retention: client.retention || '',
      sous_affilie: client.sous_affilie || '',
      langue: client.langue || 'Français',
      conseiller: client.conseiller || '',
      source: client.source || '',
      qualifiee: client.qualifiee || false,
      isOnline: client.is_online || false,
      lastConnection: client.last_connection || undefined
    }));
    setTransferredLeads(formattedClients);
    setLeads(prev => prev.filter(lead => !leadIds.includes(lead.id)));
    console.log('✅ [LEADS TRANSFER] Transfert terminé avec succès');
  };

  const handleTransferredLeadsDeleted = async (clientIds: string[]) => {
    try {
      for (const id of clientIds) {
        await clientService.deleteClient(id);
      }
      const [clientsData] = await Promise.all([clientService.getAllClients()]);
      const formattedClients = clientsData.map((client: any) => ({
        id: client.id,
        nom: client.nom || client.full_name?.split(' ').pop() || '',
        prenom: client.prenom || client.full_name?.split(' ')[0] || '',
        email: client.email,
        motDePasse: client.client_password || '',
        telephone: client.phone || '',
        portable: client.portable || '',
        dateCreation: new Date(client.created_at).toLocaleString('fr-FR'),
        dateInscription: new Date(client.created_at).toLocaleString('fr-FR'),
        rendez_vous: client.rendez_vous || '',
        activite: client.activite || '',
        societe: client.company_name || '',
        siret: client.siret || '',
        vendeur: client.vendeur || '',
        commentaires: client.vendeur || '',
        agentAssigne: client.assigned_agent_name,
        status_id: client.status_id,
        status: client.status,
        client_password: client.client_password || '',
        client_account_created: client.client_account_created || false,
        address: client.address || '',
        ville: client.ville || '',
        code_postal: client.code_postal || '',
        pays: client.pays || 'France',
        anniversaire: client.anniversaire || '',
        autre_courriel: client.autre_courriel || '',
        date_affectation: client.date_affectation || '',
        representant: client.representant || '',
        prevente: client.prevente || '',
        retention: client.retention || '',
        sous_affilie: client.sous_affilie || '',
        langue: client.langue || 'Français',
        conseiller: client.conseiller || '',
        source: client.source || '',
        qualifiee: client.qualifiee || false,
        isOnline: client.is_online || false,
        lastConnection: client.last_connection || undefined
      }));
      setTransferredLeads(formattedClients);
    } catch (error) {
      console.error('Error deleting clients:', error);
      throw error;
    }
  };

  const handleHomepageImageUpdate = (imageUrl: string | null) => {
    setHomepageImage(imageUrl);
  };

  const handleRegister = (registration: Registration) => {
    setRegistrations(prev => [...prev, registration]);
  };

  const handleApproveRegistration = (id: string) => {
    const registration = registrations.find(reg => reg.id === id);
    if (registration) {
      const newLead: Lead = {
        id: registration.id,
        nom: registration.nom,
        prenom: registration.prenom,
        email: registration.email,
        motDePasse: registration.motDePasse,
        telephone: registration.telephone,
        societe: registration.societe,
        dateCreation: registration.dateInscription
      };

      setTransferredLeads(prev => [...prev, newLead]);
      setRegistrations(prev => prev.filter(reg => reg.id !== id));
    }
  };

  const handleRejectRegistration = (id: string) => {
    setRegistrations(prev => prev.filter(reg => reg.id !== id));
  };

  const handleRestoreLeads = (restoredLeads: Lead[]) => {
    setLeads(restoredLeads);
  };

  const handleRestoreRegistrations = (restoredRegistrations: Registration[]) => {
    setRegistrations(restoredRegistrations);
  };

  const handleSellerCreated = (newSeller: Seller) => {
    setSellers(prev => [...prev, newSeller]);
  };

  const handleSellerUpdated = (updatedSeller: Seller) => {
    setSellers(prev => prev.map(seller =>
      seller.id === updatedSeller.id ? updatedSeller : seller
    ));
  };

  const handleSellersDeleted = (sellerIds: string[]) => {
    setSellers(prev => prev.filter(seller => !sellerIds.includes(seller.id)));
  };

  const handleAdminCreated = (newAdmin: Admin) => {
    setAdmins(prev => [...prev, newAdmin]);
  };

  const handleAdminsDeleted = (adminIds: string[]) => {
    setAdmins(prev => prev.filter(admin => !adminIds.includes(admin.id)));
  };

  const handleRefreshAdmins = async () => {
    try {
      const adminsData = await adminService.getAllAdmins();
      const formattedAdmins = adminsData.map((admin: any) => ({
        id: admin.id,
        nom: admin.full_name?.split(' ').slice(1).join(' ') || admin.full_name || '',
        prenom: admin.full_name?.split(' ')[0] || '',
        email: admin.email,
        motDePasse: 'hidden',
        dateCreation: new Date(admin.created_at).toLocaleDateString('fr-FR'),
        isOnline: admin.is_online || false,
        lastConnection: admin.last_connection || undefined
      }));
      setAdmins(formattedAdmins);
    } catch (error) {
      console.error('Erreur lors du rechargement des admins:', error);
    }
  };

  const handleAdminCredentialsUpdated = (oldEmail: string, newEmail: string, newPassword: string) => {
    // Check if this is the super admin
    if (oldEmail === superAdminCredentials.email) {
      setSuperAdminCredentials({ email: newEmail, password: newPassword });

      // Update current user session if it's the logged-in admin
      if (user && user.email === oldEmail) {
        const updatedUser = {
          ...user,
          email: newEmail
        };
        setUser(updatedUser);
        sessionStorage.setItem('adminUser', JSON.stringify(updatedUser));
      }
      return;
    }

    // Update admin in the admins list
    setAdmins(prev => prev.map(admin => {
      if (admin.email === oldEmail) {
        return {
          ...admin,
          email: newEmail,
          motDePasse: newPassword
        };
      }
      return admin;
    }));

    // Update current user session if it's the logged-in admin
    if (user && user.email === oldEmail) {
      const updatedUser = {
        ...user,
        email: newEmail
      };
      setUser(updatedUser);
      sessionStorage.setItem('adminUser', JSON.stringify(updatedUser));
    }
  };

  const handleStatusChanged = (leadId: string, statusId: string | null) => {
    setTransferredLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return { ...lead, status_id: statusId, status: statusId || 'nouveau' };
      }
      return lead;
    }));
  };

  const handleLeadUpdated = async () => {
    try {
      const [clientsData] = await Promise.all([clientService.getAllClients()]);
      const formattedClients = clientsData.map((client: any) => ({
        id: client.id,
        nom: client.nom || client.full_name?.split(' ').pop() || '',
        prenom: client.prenom || client.full_name?.split(' ')[0] || '',
        email: client.email,
        motDePasse: client.client_password || '',
        telephone: client.phone || '',
        portable: client.portable || '',
        dateCreation: new Date(client.created_at).toLocaleString('fr-FR'),
        dateInscription: new Date(client.created_at).toLocaleString('fr-FR'),
        rendez_vous: client.rendez_vous || '',
        activite: client.activite || '',
        societe: client.company_name || '',
        siret: client.siret || '',
        vendeur: client.vendeur || '',
        commentaires: client.vendeur || '',
        agentAssigne: client.assigned_agent_name,
        status_id: client.status_id,
        status: client.status,
        client_password: client.client_password || '',
        client_account_created: client.client_account_created || false,
        address: client.address || '',
        ville: client.ville || '',
        code_postal: client.code_postal || '',
        pays: client.pays || 'France',
        anniversaire: client.anniversaire || '',
        autre_courriel: client.autre_courriel || '',
        date_affectation: client.date_affectation || '',
        representant: client.representant || '',
        prevente: client.prevente || '',
        retention: client.retention || '',
        sous_affilie: client.sous_affilie || '',
        langue: client.langue || 'Français',
        conseiller: client.conseiller || '',
        source: client.source || '',
        qualifiee: client.qualifiee || false,
        isOnline: client.is_online || false,
        lastConnection: client.last_connection || undefined
      }));
      setTransferredLeads(formattedClients);
    } catch (error) {
      console.error('Error refreshing leads:', error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/secteurs/tertiaire" element={<SecteurTertiaire />} />
          <Route path="/secteurs/residentiel" element={<SecteurResidentiel />} />
          <Route path="/secteurs/industriel" element={<SecteurIndustriel />} />
          <Route path="/quest-ce-que-duerp" element={<QuestCeQueDUERP />} />
          <Route path="/quest-ce-que-penibilite" element={<QuestCeQuePenibilite />} />
          <Route path="/accompagnement" element={<Accompagnement />} />
          <Route path="/cotisations-atmp" element={<CotisationsATMP />} />
          <Route path="/prise-en-charge-opco" element={<PriseEnChargeOPCO />} />
          <Route path="/officiel" element={<Officiel />} />
          <Route path="/duerp-conforme" element={<DuerpConforme />} />

          <Route
            path="/client-login"
            element={<Navigate to="/" replace />}
          />

          <Route
            path="/client/dashboard"
            element={
              (() => {
                const storedData = sessionStorage.getItem('clientData');
                const data = clientData || (storedData ? JSON.parse(storedData) : null);
                const isSellerViewing = sessionStorage.getItem('isSellerViewingClient') === 'true';
                return data ? (
                  <ClientDashboard
                    clientData={data}
                    onLogout={handleClientLogout}
                    isAdminViewing={isAdminViewingClient}
                    onReturnToAdmin={handleReturnToAdmin}
                    isSellerViewing={isSellerViewing}
                    onReturnToSeller={handleReturnToSellerFromClient}
                  />
                ) : (
                  <Navigate to="/client-login" replace />
                );
              })()
            }
          />

          <Route
            path="/seller-login"
            element={<Navigate to="/" replace />}
          />

          <Route
            path="/seller/dashboard"
            element={
              (() => {
                const storedData = sessionStorage.getItem('sellerData');
                const data = sellerData || (storedData ? JSON.parse(storedData) : null);
                const isAdminViewing = sessionStorage.getItem('isAdminViewingSeller') === 'true';
                return data ? (
                  <SellerDashboard
                    sellerData={data}
                    onLogout={handleSellerLogout}
                    leads={leads}
                    onLeadCreated={handleLeadCreated}
                    onLeadsDeleted={handleLeadsDeleted}
                    onLeadsTransferred={handleLeadsTransferred}
                    transferredLeads={transferredLeads}
                    onReturnToAdmin={isAdminViewing ? handleReturnToAdminFromSeller : undefined}
                    onClientLogin={handleSellerLoginAsClient}
                  />
                ) : (
                  <Navigate to="/seller-login" replace />
                );
              })()
            }
          />

          <Route
            path="/admin-login"
            element={<Navigate to="/" replace />}
          />

          <Route
            path="/dashboard"
            element={
              (() => {
                if (isLoggedIn && user?.type === 'admin') {
                  return (
                    <Dashboard
                      user={user}
                      onLogout={handleLogout}
                      leads={leads}
                      onLeadCreated={handleLeadCreated}
                      onLeadsDeleted={handleLeadsDeleted}
                      onLeadsTransferred={handleLeadsTransferred}
                      transferredLeads={transferredLeads}
                      onTransferredLeadsDeleted={handleTransferredLeadsDeleted}
                      bulkLeads={bulkLeads}
                      onBulkLeadCreated={handleBulkLeadCreated}
                      onBulkLeadsDeleted={handleBulkLeadsDeleted}
                      onBulkLeadsTransferred={handleBulkLeadsTransferred}
                      homepageImage={homepageImage}
                      onHomepageImageUpdate={handleHomepageImageUpdate}
                      registrations={registrations}
                      onApproveRegistration={handleApproveRegistration}
                      onRejectRegistration={handleRejectRegistration}
                      onRestoreLeads={handleRestoreLeads}
                      onRestoreRegistrations={handleRestoreRegistrations}
                      sellers={sellers}
                      onSellerCreated={handleSellerCreated}
                      onSellerUpdated={handleSellerUpdated}
                      onSellersDeleted={handleSellersDeleted}
                      admins={admins}
                      onAdminCreated={handleAdminCreated}
                      onAdminsDeleted={handleAdminsDeleted}
                      onRefreshAdmins={handleRefreshAdmins}
                      onClientLogin={handleAdminLoginAsClient}
                      onSellerLogin={handleAdminLoginAsSeller}
                      onStatusChanged={handleStatusChanged}
                      onLeadUpdated={handleLeadUpdated}
                      onAdminCredentialsUpdated={handleAdminCredentialsUpdated}
                      superAdminPassword={superAdminCredentials.password}
                      superAdminEmail={superAdminCredentials.email}
                    />
                  );
                }
                return <Navigate to="/" replace />;
              })()
            }
          />

          <Route
            path="/"
            element={
              (() => {
                if (isMobileApp) {
                  if (sellerData) {
                    return <Navigate to="/seller/dashboard" replace />;
                  }
                  if (isLoggedIn && user?.type === 'admin') {
                    return <Navigate to="/dashboard" replace />;
                  }
                  if (clientData) {
                    return <Navigate to="/client/dashboard" replace />;
                  }
                  return <MobileLoginScreen />;
                }

                if (sellerData) {
                  return <Navigate to="/seller/dashboard" replace />;
                }
                if (isLoggedIn && user?.type === 'admin') {
                  return (
                    <Dashboard
                      user={user}
                      onLogout={handleLogout}
                      leads={leads}
                      onLeadCreated={handleLeadCreated}
                      onLeadsDeleted={handleLeadsDeleted}
                      onLeadsTransferred={handleLeadsTransferred}
                      transferredLeads={transferredLeads}
                      onTransferredLeadsDeleted={handleTransferredLeadsDeleted}
                      bulkLeads={bulkLeads}
                      onBulkLeadCreated={handleBulkLeadCreated}
                      onBulkLeadsDeleted={handleBulkLeadsDeleted}
                      onBulkLeadsTransferred={handleBulkLeadsTransferred}
                      homepageImage={homepageImage}
                      onHomepageImageUpdate={handleHomepageImageUpdate}
                      registrations={registrations}
                      onApproveRegistration={handleApproveRegistration}
                      onRejectRegistration={handleRejectRegistration}
                      onRestoreLeads={handleRestoreLeads}
                      onRestoreRegistrations={handleRestoreRegistrations}
                      sellers={sellers}
                      onSellerCreated={handleSellerCreated}
                      onSellerUpdated={handleSellerUpdated}
                      onSellersDeleted={handleSellersDeleted}
                      admins={admins}
                      onAdminCreated={handleAdminCreated}
                      onAdminsDeleted={handleAdminsDeleted}
                      onRefreshAdmins={handleRefreshAdmins}
                      onClientLogin={handleAdminLoginAsClient}
                      onSellerLogin={handleAdminLoginAsSeller}
                      onStatusChanged={handleStatusChanged}
                      onLeadUpdated={handleLeadUpdated}
                      onAdminCredentialsUpdated={handleAdminCredentialsUpdated}
                      superAdminPassword={superAdminCredentials.password}
                      superAdminEmail={superAdminCredentials.email}
                    />
                  );
                }
                return (
                  <LoginPage
                    onLogin={handleLogin}
                    onRegister={handleRegister}
                    homepageImage={homepageImage}
                  />
                );
              })()
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;