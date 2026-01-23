import { X, Mail, Clock, MapPin } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  if (!isOpen) return null;

  const contactEmail = 'contact@cabinet-fpe.fr';

  const handleEmailClick = () => {
    const subject = encodeURIComponent('Demande de contact - Cabinet FPE');
    const body = encodeURIComponent(`Prénom:
Nom:
Téléphone Portable:
E-mail:
Activité:
Société:
SIRET:

Message:`);
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-1">Besoin d'aide ?</h2>
            <p className="text-blue-100 text-sm">Nous sommes là pour vous accompagner</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Comment nous contacter
            </h3>
            <p className="text-gray-700 mb-4">
              Veuillez nous envoyer par mail les informations suivantes :
            </p>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span className="font-medium">Prénom</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span className="font-medium">Nom</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span className="font-medium">Téléphone Portable</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span className="font-medium">E-mail</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span className="font-medium">Activité</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span className="font-medium">Société</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span className="font-medium">SIRET</span>
              </li>
            </ul>
            <button
              onClick={handleEmailClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2 group"
            >
              <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Envoyer un email à {contactEmail}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Horaires d'ouverture
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700 font-medium">Le service administratif est ouvert</p>
                <p className="text-gray-600">Du lundi au vendredi</p>
                <p className="text-blue-600 font-bold text-lg">8h30 - 16h00</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Adresse du siège
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700 font-medium">Courrier de prise en charge</p>
                <p className="text-gray-600 leading-relaxed">
                  8 RUE ETIENNE RICHERAND<br />
                  69003 LYON
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl">
            <p className="text-center text-sm leading-relaxed">
              Notre équipe d'experts est à votre écoute pour vous accompagner dans vos démarches de mise en conformité et de prévention des risques professionnels.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
