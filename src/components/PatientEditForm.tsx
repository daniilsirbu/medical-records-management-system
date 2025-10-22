import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface Patient {
  _id: Id<"patients">;
  name: string;
  dateOfBirth: string;
  email?: string;
  phone?: string;
  address?: string;
  address2?: string;
  city?: string;
  state?: string;
  postal?: string;
  gender?: string;
  age?: number;
  homePhone?: string;
  workPhone?: string;
  cellPhone?: string;
  balance?: number;
  cid?: string;
  pronoun?: string;
  paid?: boolean;
  dnd?: boolean;
  pPurchaseDate?: string;
  campaign?: string;
  promo?: string;
  amount?: number;
  apptDate?: string;
  apptServiceName?: string;
  dateCreated?: string;
  smsReminder?: boolean;
  emailConf?: boolean;
  firstName?: string;
  lastName?: string;
  birthday?: string;
}

export function PatientEditForm({
  patient,
  onComplete,
}: {
  patient: Patient;
  onComplete: () => void;
}) {
  const [formData, setFormData] = useState({
    name: patient.name || "",
    dateOfBirth: patient.dateOfBirth || "",
    email: patient.email || "",
    phone: patient.phone || "",
    address: patient.address || "",
    address2: patient.address2 || "",
    city: patient.city || "",
    state: patient.state || "",
    postal: patient.postal || "",
    gender: patient.gender || "",
    age: patient.age || "",
    homePhone: patient.homePhone || "",
    workPhone: patient.workPhone || "",
    cellPhone: patient.cellPhone || "",
    balance: patient.balance || "",
    cid: patient.cid || "",
    pronoun: patient.pronoun || "",
    paid: patient.paid || false,
    dnd: patient.dnd || false,
    pPurchaseDate: patient.pPurchaseDate || "",
    campaign: patient.campaign || "",
    promo: patient.promo || "",
    amount: patient.amount || "",
    apptDate: patient.apptDate || "",
    apptServiceName: patient.apptServiceName || "",
    dateCreated: patient.dateCreated || "",
    smsReminder: patient.smsReminder || false,
    emailConf: patient.emailConf || false,
    firstName: patient.firstName || "",
    lastName: patient.lastName || "",
    birthday: patient.birthday || "",
  });

  const updatePatient = useMutation(api.patients.update);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updatePatient({
        id: patient._id,
        name: formData.name || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        address2: formData.address2 || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        postal: formData.postal || undefined,
        gender: formData.gender || undefined,
        age: formData.age ? Number(formData.age) : undefined,
        homePhone: formData.homePhone || undefined,
        workPhone: formData.workPhone || undefined,
        cellPhone: formData.cellPhone || undefined,
        balance: formData.balance ? Number(formData.balance) : undefined,
        cid: formData.cid || undefined,
        pronoun: formData.pronoun || undefined,
        paid: formData.paid,
        dnd: formData.dnd,
        pPurchaseDate: formData.pPurchaseDate || undefined,
        campaign: formData.campaign || undefined,
        promo: formData.promo || undefined,
        amount: formData.amount ? Number(formData.amount) : undefined,
        apptDate: formData.apptDate || undefined,
        apptServiceName: formData.apptServiceName || undefined,
        dateCreated: formData.dateCreated || undefined,
        smsReminder: formData.smsReminder,
        emailConf: formData.emailConf,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        birthday: formData.birthday || undefined,
      });
      
      onComplete();
    } catch (error) {
      alert("Erreur lors de la mise à jour du patient: " + error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white border rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Modifier les informations du patient</h2>
        <button
          onClick={onComplete}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-blue-600">Informations de base</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de naissance
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de famille
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Genre
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner...</option>
                <option value="Male">Masculin</option>
                <option value="Female">Féminin</option>
                <option value="Other">Autre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-green-600">Coordonnées</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="emailConf"
                  checked={formData.emailConf}
                  onChange={(e) => handleInputChange("emailConf", e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="emailConf" className="text-sm text-gray-600">
                  Confirmation par email
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone principal
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="smsReminder"
                    checked={formData.smsReminder}
                    onChange={(e) => handleInputChange("smsReminder", e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="smsReminder" className="text-sm text-gray-600">
                    Rappels SMS
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="dnd"
                    checked={formData.dnd}
                    onChange={(e) => handleInputChange("dnd", e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="dnd" className="text-sm text-gray-600">
                    Ne pas déranger
                  </label>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone domicile
              </label>
              <input
                type="tel"
                value={formData.homePhone}
                onChange={(e) => handleInputChange("homePhone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone travail
              </label>
              <input
                type="tel"
                value={formData.workPhone}
                onChange={(e) => handleInputChange("workPhone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone cellulaire
              </label>
              <input
                type="tel"
                value={formData.cellPhone}
                onChange={(e) => handleInputChange("cellPhone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-purple-600">Adresse</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse 2 (Appartement, suite, etc.)
              </label>
              <input
                type="text"
                value={formData.address2}
                onChange={(e) => handleInputChange("address2", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province/État
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal
                </label>
                <input
                  type="text"
                  value={formData.postal}
                  onChange={(e) => handleInputChange("postal", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Informations financières */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-orange-600">Informations financières</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CID (Client ID)
              </label>
              <input
                type="text"
                value={formData.cid}
                onChange={(e) => handleInputChange("cid", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solde ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => handleInputChange("balance", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="paid"
                checked={formData.paid}
                onChange={(e) => handleInputChange("paid", e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="paid" className="text-sm font-medium text-gray-700">
                Payé
              </label>
            </div>
          </div>
        </div>

        {/* Informations marketing */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-red-600">Marketing et rendez-vous</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campagne
              </label>
              <input
                type="text"
                value={formData.campaign}
                onChange={(e) => handleInputChange("campaign", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promotion
              </label>
              <input
                type="text"
                value={formData.promo}
                onChange={(e) => handleInputChange("promo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'achat
              </label>
              <input
                type="text"
                value={formData.pPurchaseDate}
                onChange={(e) => handleInputChange("pPurchaseDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de rendez-vous
              </label>
              <input
                type="text"
                value={formData.apptDate}
                onChange={(e) => handleInputChange("apptDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du service de rendez-vous
              </label>
              <input
                type="text"
                value={formData.apptServiceName}
                onChange={(e) => handleInputChange("apptServiceName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de création
              </label>
              <input
                type="text"
                value={formData.dateCreated}
                onChange={(e) => handleInputChange("dateCreated", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>


        {/* Boutons d'action */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onComplete}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}
