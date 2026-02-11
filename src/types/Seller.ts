export interface Seller {
  id: string;
  nom: string;
  prenom: string;
  full_name: string;
  email: string;
  motDePasse: string;
  dateCreation: string;
  isOnline?: boolean;
  lastConnection?: string;
  pin_code?: string;
}
