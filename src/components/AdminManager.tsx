import React, { useState, useEffect } from 'react';
import { Shield, User, Mail, Lock, Calendar, Eye, EyeOff, X } from 'lucide-react';
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
  onClose?: () => void;
}

const AdminManager: React.FC<AdminManagerProps> = ({ admins, currentAdminEmail, onCredentialsUpdated, onRefreshAdmins, superAdminPassword, superAdminEmail, onClose }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPassword, setEditedPassword] = useState('');
  const [editedPrenom, setEditedPrenom] = useState('');
  const [editedNom, setEditedNom] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadedSuperAdmin, setLoadedSuperAdmin] = useState<Admin | null>(null);
  const passwordInputRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null)
  ];

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
    if (!currentAdminEmail || !editedEmail || !editedPrenom || !editedNom) {
      setUpdateError('Veuillez remplir tous les champs');
      return;
    }

    const finalPassword = editedPassword.padEnd(6, '0').slice(0, 6);

    if (finalPassword.length !== 6 || !/^\d{6}$/.test(finalPassword)) {
      setUpdateError('Le mot de passe doit contenir exactement 6 chiffres');
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
        await adminService.updateAdminCredentials(currentAdmin.id, editedEmail, finalPassword);

        // Mettre à jour le nom complet
        const fullName = `${editedPrenom} ${editedNom}`;
        await adminService.updateAdmin(currentAdmin.id, { full_name: fullName });

        console.log('✅ Mise à jour réussie:', { id: currentAdmin.id, fullName });
      }

      if (onCredentialsUpdated) {
        onCredentialsUpdated(currentAdminEmail, editedEmail, finalPassword);
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

  const handlePasswordDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const currentPassword = editedPassword || '';
    const passwordArray = currentPassword.split('');

    while (passwordArray.length < 6) {
      passwordArray.push('');
    }

    passwordArray[index] = value.slice(-1) || '';
    const newPassword = passwordArray.join('');
    setEditedPassword(newPassword);

    if (value && index < 5) {
      passwordInputRefs[index + 1].current?.focus();
    }
  };

  const handlePasswordDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentPassword = editedPassword || '';
    if (e.key === 'Backspace') {
      if (!currentPassword[index] && index > 0) {
        passwordInputRefs[index - 1].current?.focus();
      } else if (currentPassword[index]) {
        const passwordArray = currentPassword.split('');
        while (passwordArray.length < 6) {
          passwordArray.push('');
        }
        passwordArray[index] = '';
        setEditedPassword(passwordArray.join(''));
      }
    }
  };

  const isSuperAdmin = currentAdminEmail === superAdminEmail;
  const currentAdmin = isSuperAdmin ? loadedSuperAdmin : admins.find(admin => admin.email === currentAdminEmail);
  const displayPassword = isSuperAdmin ? (superAdminPassword || '000000') : (currentAdmin?.motDePasse || 'Non disponible');
  const displayName = currentAdmin ? `${currentAdmin.prenom} ${currentAdmin.nom}` : currentAdminEmail?.split('@')[0];

  const passwordDigits = displayPassword.split('').slice(0, 6);
  while (passwordDigits.length < 6) {
    passwordDigits.push('0');
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#1a2847]/95 via-[#2d4578]/95 to-[#1a2847]/95 backdrop-blur-xl flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2d4578] to-[#1e3a5f] rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-white/10 backdrop-blur-2xl animate-in slide-in-from-bottom-4 duration-500">

        <div className="relative bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          <div className="relative flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-5 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl flex items-center justify-center ring-2 sm:ring-4 ring-white/30 shadow-lg flex-shrink-0">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-white drop-shadow-lg" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-0.5 sm:mb-1 drop-shadow-lg tracking-tight truncate">
                  Info Admin
                </h2>
                <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium truncate">Gérez vos informations de connexion</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 group backdrop-blur-xl border border-white/20"
                title="Fermer"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-230px)] bg-gradient-to-b from-[#1a2847]/80 to-[#2d4578]/60 backdrop-blur-xl">

          <div className="bg-gradient-to-br from-[#1e3a5f]/50 to-[#2d4578]/50 border-2 border-white/20 rounded-xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center ring-2 ring-white/30 shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-300 font-bold uppercase tracking-widest mb-1">
                  {isSuperAdmin ? 'Super Administrateur' : 'Administrateur connecté'}
                </p>
                <p className="text-xl font-extrabold text-white">
                  {displayName}
                </p>
              </div>
            </div>

            {updateSuccess && (
              <div className="p-4 bg-green-500/20 border-2 border-green-400/50 rounded-xl shadow-lg mb-4">
                <p className="text-sm text-green-100 font-bold">
                  Informations mises à jour avec succès !
                </p>
              </div>
            )}

            {updateError && (
              <div className="p-4 bg-red-500/20 border-2 border-red-400/50 rounded-xl shadow-lg mb-4">
                <p className="text-sm text-red-100 font-bold">{updateError}</p>
              </div>
            )}

            <div className="space-y-4">
              {editMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                    <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={editedPrenom}
                      onChange={(e) => setEditedPrenom(e.target.value)}
                      placeholder="Prénom"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 placeholder-white/50"
                    />
                  </div>

                  <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                    <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={editedNom}
                      onChange={(e) => setEditedNom(e.target.value)}
                      placeholder="Nom"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/70 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 placeholder-white/50"
                    />
                  </div>
                </div>
              )}

              <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                  Email de connexion
                </label>
                <input
                  type="email"
                  value={editMode ? editedEmail : (currentAdminEmail || 'Non disponible')}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  readOnly={!editMode}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white border-2 border-white/20 rounded-lg ${
                    editMode
                      ? 'bg-[#1a2847]/70 focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50'
                      : 'bg-[#1a2847]/30 cursor-not-allowed opacity-75'
                  }`}
                />
              </div>

              <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                  Mot de passe (Code à 6 chiffres)
                </label>
                <div className="flex gap-2 justify-center sm:justify-start flex-wrap">
                  {[0, 1, 2, 3, 4, 5].map((index) => {
                    const digit = editMode ? (editedPassword[index] || '') : passwordDigits[index];
                    return (
                      <div key={index} className="relative">
                        {editMode ? (
                          <input
                            ref={passwordInputRefs[index]}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={editedPassword[index] || ''}
                            onChange={(e) => handlePasswordDigitChange(index, e.target.value)}
                            onKeyDown={(e) => handlePasswordDigitKeyDown(index, e)}
                            className="w-12 h-14 sm:w-14 sm:h-16 bg-white/90 rounded-lg flex items-center justify-center shadow-lg border-2 border-blue-400/50 text-center text-2xl sm:text-3xl font-bold text-[#1e3a5f] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                            placeholder="0"
                          />
                        ) : (
                          <div className="w-12 h-14 sm:w-14 sm:h-16 bg-white/90 rounded-lg flex items-center justify-center shadow-lg border-2 border-white/30">
                            <span className="text-2xl sm:text-3xl font-bold text-[#1e3a5f]">{digit}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {currentAdmin && !editMode && (
                <div className="bg-[#1a2847]/50 rounded-xl p-3 sm:p-4 border-2 border-white/20 shadow-md">
                  <label className="block text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                    Date de création du compte
                  </label>
                  <input
                    type="text"
                    value={currentAdmin.dateCreation}
                    readOnly
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg font-bold text-white bg-[#1a2847]/30 border-2 border-white/20 rounded-lg cursor-not-allowed opacity-75"
                  />
                </div>
              )}
            </div>

            {!editMode && (
              <div className="mt-6 pt-4 border-t border-white/20">
                <button
                  onClick={handleStartEdit}
                  className="w-full flex items-center justify-center px-6 py-3 sm:px-8 sm:py-3.5 text-sm bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] text-white rounded-xl hover:from-[#3a5488] hover:via-[#2d4578] hover:to-[#3a5488] transition-all duration-300 font-extrabold shadow-xl hover:shadow-2xl transform hover:scale-105 border border-blue-400/30"
                >
                  Modifier
                </button>
              </div>
            )}

            {editMode && (
              <div className="flex gap-4 mt-6 pt-4 border-t border-white/20">
                <button
                  onClick={handleUpdateCredentials}
                  className="flex-1 flex items-center justify-center px-6 py-3 sm:px-8 sm:py-3.5 text-sm bg-gradient-to-r from-[#2d4578] via-[#1e3a5f] to-[#2d4578] text-white rounded-xl hover:from-[#3a5488] hover:via-[#2d4578] hover:to-[#3a5488] transition-all duration-300 font-extrabold shadow-xl hover:shadow-2xl transform hover:scale-105 border border-blue-400/30"
                >
                  Valider
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 flex items-center justify-center px-6 py-3 sm:px-8 sm:py-3.5 text-sm bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-slate-400 hover:text-slate-600 transition-all duration-300 font-extrabold shadow-md hover:shadow-lg"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>

          {isSuperAdmin && !editMode && (
            <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-2 border-amber-400/50 rounded-xl p-4 sm:p-6 shadow-xl">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-amber-300 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-extrabold text-amber-100 mb-2">
                    Compte Super Administrateur
                  </p>
                  <p className="text-sm text-amber-200/90 font-semibold">
                    Vous disposez de tous les privilèges d'administration. Ce compte ne peut pas être supprimé.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!editMode && (
            <div className="bg-[#1e3a5f]/30 border-2 border-white/10 rounded-xl p-4 sm:p-5 shadow-md">
              <p className="text-sm text-white/90 font-semibold">
                <strong className="font-extrabold text-blue-300">Note de sécurité :</strong> Ces informations sont confidentielles. Ne les partagez avec personne.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManager;
