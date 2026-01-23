import React from 'react';
import { UserCheck, UserX, Clock, User, Mail, Phone, Calendar, Hash, CheckCircle, XCircle } from 'lucide-react';
import { Registration } from '../types/Registration';

interface RegistrationManagerProps {
  registrations: Registration[];
  onApproveRegistration: (id: string) => void;
  onRejectRegistration: (id: string) => void;
}

const RegistrationManager: React.FC<RegistrationManagerProps> = ({ 
  registrations, 
  onApproveRegistration, 
  onRejectRegistration 
}) => {
  const pendingRegistrations = registrations.filter(reg => reg.statut === 'en_attente');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
          <UserCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Inscriptions en attente</h2>
          <p className="text-gray-600">Gérez les demandes d'inscription des nouveaux utilisateurs</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingRegistrations.length}</p>
              <p className="text-sm text-gray-600">Inscriptions en attente de validation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Registrations List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <UserCheck className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-semibold text-gray-900">Demandes d'inscription</h3>
            {pendingRegistrations.length > 0 && (
              <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {pendingRegistrations.length}
              </span>
            )}
          </div>
        </div>

        {pendingRegistrations.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Aucune inscription en attente</h4>
            <p className="text-gray-500">Toutes les demandes d'inscription ont été traitées</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      ID
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nom
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Prénom
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-56">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Téléphone
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date d'inscription
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRegistrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{registration.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {registration.nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {registration.prenom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {registration.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {registration.telephone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.dateInscription}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onApproveRegistration(registration.id)}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          title="Valider l'inscription"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Valider
                        </button>
                        <button
                          onClick={() => onRejectRegistration(registration.id)}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          title="Refuser l'inscription"
                        >
                          <XCircle className="w-4 h-4" />
                          Refuser
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          Instructions
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Valider ✅</strong> : L'inscription est convertie en lead et ajoutée à l'onglet Leads</li>
          <li>• <strong>Refuser ❌</strong> : La demande d'inscription est supprimée définitivement</li>
          <li>• Une fois validée, l'inscription disparaît de cette liste et devient un lead actif</li>
          <li>• Vérifiez les informations avant de valider une inscription</li>
        </ul>
      </div>
    </div>
  );
};

export default RegistrationManager;