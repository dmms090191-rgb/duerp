import React, { useState, useEffect } from 'react';
import { Shield, User, Mail, Lock, Calendar, Eye, EyeOff } from 'lucide-react';
import { Admin } from '../types/Admin';
import { adminService } from '../services/adminService';

interface AdminManagerProps {
  admins: Admin[];
  onAdminCreated: (admin: Admin) => void;
  onAdminsDeleted: (adminIds: string[]) => void;
  currentAdminEmail?: string;
  onCredentialsUpdated?: (oldEmail: string, newEmail: string, newPassword: string) => void;
  onRefreshAdmins?: () => Promise<void>;
  superAdminPassword?: string;
  superAdminEmail?: string;
}

const AdminManager: React.FC<AdminManagerProps> = ({ admins, currentAdminEmail, onCredentialsUpdated, onRefreshAdmins, superAdminPassword, superAdminEmail }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPassword, setEditedPassword] = useState('');
  const [editedPrenom, setEditedPrenom] = useState('');
  const [editedNom, setEditedNom] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadedSuperAdmin, setLoadedSuperAdmin] = useState<Admin | null>(null);

  // Charger le super admin depuis la base de données au montage du composant
  useEffect(() => {
    const loadSuperAdmin = async () => {
      const isSuperAdmin = currentAdminEmail === superAdminEmail;
      if (isSuperAdmin) {
        try {
          const superAdminData = await adminService.getSuperAdmin();
          if (superAdminData) {
            const adminObj: Admin = {
              id: superAdminData.id,
              nom: superAdminData.full_name?.split(' ').slice(1).join(' ') || 'Admin',
              prenom: superAdminData.full_name?.split(' ')[0] || 'Super',
              email: superAdminData.email,
              motDePasse: 'hidden',
              dateCreation: new Date(superAdminData.created_at).toLocaleDateString('fr-FR')
            };
            setLoadedSuperAdmin(adminObj);
          }
        } catch (error) {
          console.error('Erreur lors du chargement du super admin:', error);
        }
      }
    };

    loadSuperAdmin();
  }, [currentAdminEmail, superAdminEmail]);

  const handleUpdateCredentials = async () => {
    if (!currentAdminEmail || !editedEmail || !editedPassword || !editedPrenom || !editedNom) {
      setUpdateError('Veuillez remplir tous les champs');
      return;
    }

    try {
      const isSuperAdmin = currentAdminEmail === superAdminEmail;

      // Trouver l'admin dans la liste locale
      let currentAdmin = admins.find(admin => admin.email === currentAdminEmail);

      // Si c'est le super admin et qu'il n'est pas dans la liste locale, le chercher dans la base de données
      if (isSuperAdmin && !currentAdmin) {
        const superAdminData = await adminService.getSuperAdmin();
        if (superAdminData) {
          currentAdmin = {
            id: superAdminData.id,
            nom: superAdminData.full_name?.split(' ').slice(1).join(' ') || '',
            prenom: superAdminData.full_name?.split(' ')[0] || '',
            email: superAdminData.email,
            motDePasse: 'hidden',
            dateCreation: new Date(superAdminData.created_at).toLocaleDateString('fr-FR')
          };
        }
      }

      if (currentAdmin) {
        // Mettre à jour l'email et le mot de passe
        await adminService.updateAdminCredentials(currentAdmin.id, editedEmail, editedPassword);

        // Mettre à jour le nom complet
        const fullName = `${editedPrenom} ${editedNom}`;
        await adminService.updateAdmin(currentAdmin.id, { full_name: fullName });

        console.log('✅ Mise à jour réussie:', { id: currentAdmin.id, fullName });
      }

      if (onCredentialsUpdated) {
        onCredentialsUpdated(currentAdminEmail, editedEmail, editedPassword);
      }

      // Recharger les admins depuis la base de données pour obtenir les nouvelles données
      if (onRefreshAdmins) {
        await onRefreshAdmins();
      }

      // Recharger le super admin si c'est lui qui a été modifié
      if (isSuperAdmin) {
        const superAdminData = await adminService.getSuperAdmin();
        if (superAdminData) {
          const adminObj: Admin = {
            id: superAdminData.id,
            nom: superAdminData.full_name?.split(' ').slice(1).join(' ') || 'Admin',
            prenom: superAdminData.full_name?.split(' ')[0] || 'Super',
            email: superAdminData.email,
            motDePasse: 'hidden',
            dateCreation: new Date(superAdminData.created_at).toLocaleDateString('fr-FR')
          };
          setLoadedSuperAdmin(adminObj);
        }
      }

      setUpdateSuccess(true);
      setUpdateError('');
      setEditMode(false);
      setShowPassword(false);

      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      setUpdateError('Erreur lors de la mise à jour des identifiants');
    }
  };

  const handleStartEdit = async () => {
    const isSuperAdmin = currentAdminEmail === superAdminEmail;
    let currentAdmin = admins.find(admin => admin.email === currentAdminEmail);

    // Si c'est le super admin et qu'il n'est pas dans la liste locale, le chercher dans la base de données
    if (isSuperAdmin && !currentAdmin) {
      try {
        const superAdminData = await adminService.getSuperAdmin();
        if (superAdminData) {
          currentAdmin = {
            id: superAdminData.id,
            nom: superAdminData.full_name?.split(' ').slice(1).join(' ') || 'Admin',
            prenom: superAdminData.full_name?.split(' ')[0] || 'Super',
            email: superAdminData.email,
            motDePasse: 'hidden',
            dateCreation: new Date(superAdminData.created_at).toLocaleDateString('fr-FR')
          };
        }
      } catch (error) {
        console.error('Erreur lors du chargement du super admin:', error);
      }
    }

    setEditedEmail(currentAdminEmail || '');
    setEditedPassword(isSuperAdmin ? (superAdminPassword || '000000') : (currentAdmin?.motDePasse || ''));

    // Initialiser le prénom et nom
    if (currentAdmin) {
      setEditedPrenom(currentAdmin.prenom || '');
      setEditedNom(currentAdmin.nom || '');
    } else {
      setEditedPrenom('');
      setEditedNom('');
    }

    setEditMode(true);
    setUpdateSuccess(false);
    setUpdateError('');
    setShowPassword(false);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedEmail('');
    setEditedPassword('');
    setEditedPrenom('');
    setEditedNom('');
    setUpdateError('');
    setShowPassword(false);
  };

  const isSuperAdmin = currentAdminEmail === superAdminEmail;
  const currentAdmin = isSuperAdmin ? loadedSuperAdmin : admins.find(admin => admin.email === currentAdminEmail);
  const displayPassword = isSuperAdmin ? (superAdminPassword || '000000') : (currentAdmin?.motDePasse || 'Non disponible');
  const displayName = currentAdmin ? `${currentAdmin.prenom} ${currentAdmin.nom}` : currentAdminEmail?.split('@')[0];

  return (
    <div className="flex justify-center items-start min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-6">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-blue-200/50">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 bg-clip-text text-transparent">Info Admin</h1>
          </div>
          <p className="text-blue-700 font-semibold ml-[72px]">Gérez vos informations de connexion</p>
        </div>

        <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 rounded-3xl shadow-2xl border-2 border-blue-200 p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-8">
            <User className="w-7 h-7 text-blue-600" />
            <h2 className="text-3xl font-extrabold text-blue-900">Mes informations</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-300 shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-blue-200/50">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-700 font-bold uppercase tracking-widest mb-1">
                    {isSuperAdmin ? 'Super Administrateur' : 'Administrateur connecté'}
                  </p>
                  <p className="text-xl font-extrabold text-blue-900">
                    {displayName}
                  </p>
                </div>
              </div>
            </div>

            {updateSuccess && (
              <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl shadow-lg">
                <p className="text-sm text-green-900 font-bold">
                  Informations mises à jour avec succès ! Vos modifications ont été enregistrées.
                </p>
              </div>
            )}

            {updateError && (
              <div className="p-5 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-2xl shadow-lg">
                <p className="text-sm text-red-900 font-bold">{updateError}</p>
              </div>
            )}

            {editMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
                    Prénom
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-blue-400" />
                    </div>
                    <input
                      type="text"
                      value={editedPrenom}
                      onChange={(e) => setEditedPrenom(e.target.value)}
                      placeholder="Prénom"
                      className="block w-full pl-12 pr-4 py-4 border-2 rounded-xl transition-all duration-300 shadow-sm bg-white text-gray-900 border-blue-200 hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
                    Nom
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-blue-400" />
                    </div>
                    <input
                      type="text"
                      value={editedNom}
                      onChange={(e) => setEditedNom(e.target.value)}
                      placeholder="Nom"
                      className="block w-full pl-12 pr-4 py-4 border-2 rounded-xl transition-all duration-300 shadow-sm bg-white text-gray-900 border-blue-200 hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
                Email de connexion
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  type="email"
                  value={editMode ? editedEmail : (currentAdminEmail || 'Non disponible')}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  readOnly={!editMode}
                  className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl transition-all duration-300 shadow-sm ${
                    editMode
                      ? 'bg-white text-gray-900 border-blue-200 hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 font-bold'
                      : 'bg-blue-50/50 text-gray-900 cursor-not-allowed border-blue-200 font-bold'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  type={editMode ? (showPassword ? "text" : "password") : "text"}
                  value={editMode ? editedPassword : displayPassword}
                  onChange={(e) => setEditedPassword(e.target.value)}
                  readOnly={!editMode}
                  className={`block w-full pl-12 ${editMode ? 'pr-14' : 'pr-4'} py-4 border-2 rounded-xl transition-all duration-300 shadow-sm ${
                    editMode
                      ? 'bg-white text-gray-900 border-blue-200 hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 font-mono font-bold'
                      : 'bg-blue-50/50 text-gray-900 cursor-not-allowed border-blue-200 font-mono font-bold'
                  }`}
                />
                {editMode && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-400 hover:text-blue-600 transition-all duration-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-6 w-6" />
                    ) : (
                      <Eye className="h-6 w-6" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {!editMode && (
              <div className="pt-4">
                <button
                  onClick={handleStartEdit}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 font-extrabold shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
                >
                  Modifier
                </button>
              </div>
            )}

            {editMode && (
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleUpdateCredentials}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 font-extrabold shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
                >
                  Valider
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 font-extrabold shadow-md hover:shadow-lg"
                >
                  Annuler
                </button>
              </div>
            )}

            {currentAdmin && !editMode && (
              <div>
                <label className="block text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
                  Date de création du compte
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-blue-400" />
                  </div>
                  <input
                    type="text"
                    value={currentAdmin.dateCreation}
                    readOnly
                    className="block w-full pl-12 pr-4 py-4 border-2 border-blue-200 rounded-xl bg-blue-50/50 text-gray-900 font-bold cursor-not-allowed shadow-sm"
                  />
                </div>
              </div>
            )}

            {isSuperAdmin && !editMode && (
              <div className="mt-6 p-6 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-2xl border-2 border-amber-300 shadow-xl">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-extrabold text-amber-900 mb-2">
                      Compte Super Administrateur
                    </p>
                    <p className="text-sm text-amber-800 font-semibold">
                      Vous disposez de tous les privilèges d'administration. Ce compte ne peut pas être supprimé.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!editMode && (
              <div className="mt-6 p-5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl border-2 border-blue-300 shadow-md">
                <p className="text-sm text-blue-900 font-semibold">
                  <strong className="font-extrabold">Note de sécurité :</strong> Ces informations sont confidentielles. Ne les partagez avec personne.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManager;
