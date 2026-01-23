import React, { useState } from 'react';
import { Shield, User, Mail, Lock, Calendar, Eye, EyeOff } from 'lucide-react';
import { Admin } from '../types/Admin';
import { adminService } from '../services/adminService';

interface AdminManagerProps {
  admins: Admin[];
  onAdminCreated: (admin: Admin) => void;
  onAdminsDeleted: (adminIds: string[]) => void;
  currentAdminEmail?: string;
  onCredentialsUpdated?: (oldEmail: string, newEmail: string, newPassword: string) => void;
  superAdminPassword?: string;
  superAdminEmail?: string;
}

const AdminManager: React.FC<AdminManagerProps> = ({ admins, currentAdminEmail, onCredentialsUpdated, superAdminPassword, superAdminEmail }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPassword, setEditedPassword] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdateCredentials = async () => {
    if (!currentAdminEmail || !editedEmail || !editedPassword) {
      setUpdateError('Veuillez remplir tous les champs');
      return;
    }

    try {
      const currentAdmin = admins.find(admin => admin.email === currentAdminEmail);
      const isSuperAdmin = currentAdminEmail === 'dmms090191@gmail.com';

      if (currentAdmin && !isSuperAdmin) {
        await adminService.updateAdminCredentials(currentAdmin.id, editedEmail, editedPassword);
      }

      if (onCredentialsUpdated) {
        onCredentialsUpdated(currentAdminEmail, editedEmail, editedPassword);
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

  const handleStartEdit = () => {
    const currentAdmin = admins.find(admin => admin.email === currentAdminEmail);
    const isSuperAdmin = currentAdminEmail === superAdminEmail;

    setEditedEmail(currentAdminEmail || '');
    setEditedPassword(isSuperAdmin ? (superAdminPassword || '000000') : (currentAdmin?.motDePasse || ''));
    setEditMode(true);
    setUpdateSuccess(false);
    setUpdateError('');
    setShowPassword(false);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedEmail('');
    setEditedPassword('');
    setUpdateError('');
    setShowPassword(false);
  };

  const currentAdmin = admins.find(admin => admin.email === currentAdminEmail);
  const isSuperAdmin = currentAdminEmail === superAdminEmail;
  const displayPassword = isSuperAdmin ? (superAdminPassword || '000000') : (currentAdmin?.motDePasse || 'Non disponible');
  const displayName = isSuperAdmin ? 'Super Admin' : (currentAdmin ? `${currentAdmin.prenom} ${currentAdmin.nom}` : currentAdminEmail?.split('@')[0]);

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Info Admin</h1>
          </div>
          <p className="text-gray-600">Gérez vos informations de connexion</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Mes informations</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border border-red-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    {isSuperAdmin ? 'Super Administrateur' : 'Administrateur connecté'}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {displayName}
                  </p>
                </div>
              </div>
            </div>

            {updateSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  Identifiants mis à jour avec succès ! Utilisez vos nouveaux identifiants lors de votre prochaine connexion.
                </p>
              </div>
            )}

            {updateError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">{updateError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de connexion
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={editMode ? editedEmail : (currentAdminEmail || 'Non disponible')}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  readOnly={!editMode}
                  className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg ${
                    editMode
                      ? 'bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      : 'bg-gray-50 text-gray-900 cursor-not-allowed'
                  } font-medium`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={editMode ? (showPassword ? "text" : "password") : "text"}
                  value={editMode ? editedPassword : displayPassword}
                  onChange={(e) => setEditedPassword(e.target.value)}
                  readOnly={!editMode}
                  className={`block w-full pl-10 ${editMode ? 'pr-12' : 'pr-3'} py-3 border border-gray-300 rounded-lg ${
                    editMode
                      ? 'bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      : 'bg-gray-50 text-gray-900 cursor-not-allowed'
                  } font-mono font-medium`}
                />
                {editMode && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {!editMode && (
              <div className="pt-2">
                <button
                  onClick={handleStartEdit}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-medium"
                >
                  Modifier
                </button>
              </div>
            )}

            {editMode && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdateCredentials}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium"
                >
                  Valider
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-200 font-medium"
                >
                  Annuler
                </button>
              </div>
            )}

            {currentAdmin && !editMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de création du compte
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={currentAdmin.dateCreation}
                    readOnly
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-medium cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {isSuperAdmin && !editMode && (
              <div className="mt-6 p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">
                      Compte Super Administrateur
                    </p>
                    <p className="text-sm text-amber-800">
                      Vous disposez de tous les privilèges d'administration. Ce compte ne peut pas être supprimé.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!editMode && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Note de sécurité :</strong> Ces informations sont confidentielles. Ne les partagez avec personne.
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
