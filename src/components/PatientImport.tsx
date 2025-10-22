import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import * as XLSX from "xlsx";

const SAMPLE_PATIENTS = [
  {
    cid: "3417",
    firstName: "Stephanie",
    lastName: "Tucker",
    email: "stephtucker514@hotmail.ca",
    address: "2892, Montcalm",
    city: "Vaudreuil Dorion",
    state: "Qc",
    postal: "J7V7W8",
    cellPhone: "15148047734",
    gender: "Female",
    age: 51,
    birthday: "04/04/1974",
    balance: 574.88,
  },
  {
    cid: "95",
    firstName: "Lauren",
    lastName: "Belanger",
    email: "belangerlauren@hotmail.com",
    address: "180 Langlois",
    city: "Vaudreuil-Dorion",
    state: "J7v 1a1",
    cellPhone: "15146795287",
    age: 34,
    birthday: "16/09/1990",
    balance: 9237.12,
  },
  {
    cid: "5995",
    firstName: "Lisa",
    lastName: "Dobson",
    email: "lisadobsonanthony@gmail.com",
    address: "2095 route 201",
    city: "Ormstown",
    state: "QC",
    postal: "J0S1K0",
    cellPhone: "15148333098",
    gender: "Female",
    age: 59,
    birthday: "02/12/1965",
    balance: 931.29,
  },
  {
    cid: "81",
    firstName: "Ecaterina",
    lastName: "Sirbu",
    email: "kate.sirbu221b@gmail.com",
    address: "2740 Rue Dahlias",
    city: "Vaudreuil-Dorion",
    state: "QC",
    postal: "J7V 0A5",
    cellPhone: "14182557877",
    gender: "Female",
    age: 25,
    birthday: "02/10/1999",
    balance: 0,
  },
  {
    cid: "3741",
    firstName: "Brigitte",
    lastName: "Cedilot",
    email: "brigitteced@hotmail.com",
    address: "42, rue Square Sir George",
    city: "Montreal",
    state: "Qc",
    postal: "H4C0C6",
    cellPhone: "16472369221",
    gender: "Female",
    age: 41,
    birthday: "03/11/1983",
    balance: 2690.42,
  },
  {
    cid: "3415",
    firstName: "Elena",
    lastName: "Salikova",
    email: "esalikova@hotmail.com",
    address: "190, rue de Repentigny",
    city: "Vaudreuil Dorion",
    state: "QC",
    postal: "J7V5L6",
    cellPhone: "15149282171",
    gender: "Female",
    age: 37,
    birthday: "04/09/1987",
    balance: 2400.69,
  },
  {
    cid: "1283",
    firstName: "Sonia Daljit",
    lastName: "Ghotra",
    email: "daljitghotra1980@icloud.com",
    address: "180 Ravel",
    city: "Vaudreuil-Dorion",
    state: "QC",
    postal: "J7V 0M7",
    homePhone: "14503191009",
    cellPhone: "14389342250",
    gender: "Female",
    balance: 1104.12,
  },
  {
    cid: "1163",
    firstName: "Laura",
    lastName: "Budd",
    workPhone: "6133472240",
    cellPhone: "6133624825",
    gender: "Female",
    age: 58,
    birthday: "23/09/1966",
    balance: 2299.5,
  },
  {
    cid: "8272",
    firstName: "Lukasz",
    lastName: "Pilipionek",
    email: "lukaspilip@gmx.com",
    address: "113 rue Ravel",
    city: "Vaudreuil-Dorion",
    state: "QC",
    postal: "J7V0M7",
    cellPhone: "15145772682",
    age: 42,
    birthday: "13/08/1982",
    balance: 2354.12,
  },
];

export function PatientImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string>("");
  const [parsedPatients, setParsedPatients] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importPatients = useMutation(api.patients.importPatients);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus("Lecture du fichier...");
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Mapper les colonnes du fichier Excel vers notre format
      const mappedPatients = jsonData.map((row: any) => {
        // Essayer différentes variantes de noms de colonnes
        const getField = (possibleNames: string[]) => {
          for (const name of possibleNames) {
            if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
              return String(row[name]).trim();
            }
          }
          return undefined;
        };

        const getBooleanField = (possibleNames: string[]) => {
          for (const name of possibleNames) {
            if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
              const value = String(row[name]).toLowerCase().trim();
              return value === 'true' || value === '1' || value === 'yes' || value === 'oui';
            }
          }
          return undefined;
        };

        const getNumberField = (possibleNames: string[]) => {
          for (const name of possibleNames) {
            if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
              const num = Number(row[name]);
              return !isNaN(num) ? num : undefined;
            }
          }
          return undefined;
        };

        return {
          cid: getField(['CID', 'cid', 'ID', 'id', 'Client ID', 'Patient ID']),
          firstName: getField(['firstName', 'FirstName', 'first_name', 'Prénom', 'prenom', 'First Name']),
          lastName: getField(['lastName', 'LastName', 'last_name', 'Nom', 'nom', 'Last Name', 'Name']),
          pronoun: getField(['pronoun', 'Pronoun', 'Pronom', 'pronom']),
          email: getField(['email', 'Email', 'EMAIL', 'Courriel', 'courriel']),
          address: getField(['address', 'Address', 'Adresse', 'adresse', 'Address1']),
          address2: getField(['address2', 'Address2', 'Adresse2', 'adresse2']),
          city: getField(['city', 'City', 'Ville', 'ville']),
          state: getField(['state', 'State', 'Province', 'province', 'État', 'etat']),
          postal: getField(['postal', 'Postal', 'PostalCode', 'postal_code', 'Code Postal', 'ZIP']),
          homePhone: getField(['homePhone', 'HomePhone', 'home_phone', 'Téléphone Domicile', 'Home Phone']),
          workPhone: getField(['workPhone', 'WorkPhone', 'work_phone', 'Téléphone Travail', 'Work Phone']),
          cellPhone: getField(['cellPhone', 'CellPhone', 'cell_phone', 'Téléphone Cellulaire', 'Cell Phone', 'Mobile', 'Cellulaire']),
          gender: getField(['gender', 'Gender', 'Genre', 'genre', 'Sex', 'Sexe']),
          age: getNumberField(['age', 'Age', 'âge', 'Âge']),
          birthday: getField(['birthday', 'Birthday', 'DateNaissance', 'date_naissance', 'Date de Naissance', 'Birth Date', 'DOB']),
          balance: getNumberField(['balance', 'Balance', 'Solde', 'solde']),
          paid: getBooleanField(['paid', 'Paid', 'Payé', 'paye']),
          dnd: getBooleanField(['dnd', 'DND', 'DoNotDisturb', 'Ne pas déranger']),
          pPurchaseDate: getField(['pPurchaseDate', 'PPurchaseDate', 'Purchase Date', 'Date Achat']),
          campaign: getField(['campaign', 'Campaign', 'Campagne', 'campagne']),
          promo: getField(['promo', 'Promo', 'Promotion', 'promotion']),
          amount: getNumberField(['amount', 'Amount', 'Montant', 'montant']),
          apptDate: getField(['apptDate', 'ApptDate', 'Appointment Date', 'Date RDV']),
          apptServiceName: getField(['apptServiceName', 'ApptServiceName', 'Service Name', 'Nom Service']),
          dateCreated: getField(['dateCreated', 'DateCreated', 'Date Created', 'Date Création']),
          smsReminder: getBooleanField(['smsReminder', 'SMSReminder', 'SMS Reminder', 'Rappel SMS']),
          emailConf: getBooleanField(['emailConf', 'EmailConf', 'Email Confirmation', 'Confirmation Email']),
        };
      }).filter(patient => patient.firstName && patient.lastName);

      setParsedPatients(mappedPatients);
      setShowPreview(true);
      setImportStatus(`✅ ${mappedPatients.length} patients trouvés dans le fichier`);
    } catch (error) {
      setImportStatus(`❌ Erreur lors de la lecture du fichier: ${error}`);
    }
  };

  const handleImportSample = async () => {
    setIsImporting(true);
    setImportStatus("Importation en cours...");
    
    try {
      const results = await importPatients({ patients: SAMPLE_PATIENTS });
      setImportStatus(`✅ ${results.imported} patients d'exemple importés avec succès ! (${results.skipped} ignorés)`);
    } catch (error) {
      setImportStatus(`❌ Erreur lors de l'importation: ${error}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportFromFile = async () => {
    if (parsedPatients.length === 0) return;

    setIsImporting(true);
    setImportStatus("Importation en cours...");
    
    try {
      const results = await importPatients({ patients: parsedPatients });
      setImportStatus(`✅ ${results.imported} patients importés avec succès depuis le fichier ! (${results.skipped} ignorés)`);
      setParsedPatients([]);
      setShowPreview(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setImportStatus(`❌ Erreur lors de l'importation: ${error}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-lg font-medium mb-4">Importer les patients</h3>
      
      {/* Import depuis fichier Excel */}
      <div className="mb-6 p-4 border rounded-lg bg-white">
        <h4 className="font-medium mb-3">📊 Importer depuis un fichier Excel (.xls/.xlsx)</h4>
        <p className="text-gray-600 mb-3 text-sm">
          Sélectionnez un fichier Excel contenant les données des patients. Le système reconnaît automatiquement les colonnes courantes.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
        <div className="mt-2 text-xs text-gray-500">
          <strong>Colonnes reconnues :</strong> CID, FirstName, LastName, Pronoun, Address, Address2, City, State, Postal, Email, HomePhone, WorkPhone, CellPhone, Paid, Balance, Gender, Age, Birthday, DND, PPurchaseDate, Campaign, Promo, Amount, ApptDate, ApptServiceName, DateCreated, SMSReminder, EmailConf
        </div>
      </div>

      {/* Aperçu des données du fichier */}
      {showPreview && parsedPatients.length > 0 && (
        <div className="mb-6 p-4 border rounded-lg bg-blue-50">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Aperçu des patients du fichier ({parsedPatients.length})</h4>
            <button
              onClick={handleImportFromFile}
              disabled={isImporting}
              className={`px-4 py-2 rounded font-medium ${
                isImporting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {isImporting ? "Importation..." : `Importer ${parsedPatients.length} patients`}
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto border rounded bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">CID</th>
                  <th className="px-3 py-2 text-left">Nom</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Balance</th>
                  <th className="px-3 py-2 text-left">Campagne</th>
                </tr>
              </thead>
              <tbody>
                {parsedPatients.slice(0, 10).map((patient, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-3 py-2">{patient.cid || "-"}</td>
                    <td className="px-3 py-2">{patient.firstName} {patient.lastName}</td>
                    <td className="px-3 py-2">{patient.email || "-"}</td>
                    <td className="px-3 py-2">{patient.city || "-"}</td>
                    <td className="px-3 py-2">{patient.balance ? `$${patient.balance}` : "-"}</td>
                    <td className="px-3 py-2">{patient.campaign || "-"}</td>
                  </tr>
                ))}
                {parsedPatients.length > 10 && (
                  <tr className="border-t bg-gray-50">
                    <td colSpan={6} className="px-3 py-2 text-center text-gray-500">
                      ... et {parsedPatients.length - 10} autres patients
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import des données d'exemple */}
      <div className="p-4 border rounded-lg bg-white">
        <h4 className="font-medium mb-3">📋 Importer les données d'exemple</h4>
        <p className="text-gray-600 mb-4">
          Cliquez sur le bouton ci-dessous pour importer {SAMPLE_PATIENTS.length} patients d'exemple dans le système.
        </p>
        
        <button
          onClick={handleImportSample}
          disabled={isImporting}
          className={`px-4 py-2 rounded font-medium ${
            isImporting
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isImporting ? "Importation..." : `Importer ${SAMPLE_PATIENTS.length} patients d'exemple`}
        </button>
      </div>

      {/* Statut d'importation */}
      {importStatus && (
        <div className={`mt-4 p-3 rounded ${
          importStatus.includes("✅") 
            ? "bg-green-100 text-green-800" 
            : importStatus.includes("❌")
            ? "bg-red-100 text-red-800"
            : "bg-blue-100 text-blue-800"
        }`}>
          {importStatus}
        </div>
      )}

      {/* Aperçu des patients d'exemple */}
      <div className="mt-6">
        <h4 className="font-medium mb-2">Aperçu des patients d'exemple :</h4>
        <div className="max-h-60 overflow-y-auto border rounded bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">CID</th>
                <th className="px-3 py-2 text-left">Nom</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Ville</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_PATIENTS.map((patient, index) => (
                <tr key={index} className="border-t">
                  <td className="px-3 py-2">{patient.cid}</td>
                  <td className="px-3 py-2">{patient.firstName} {patient.lastName}</td>
                  <td className="px-3 py-2">{patient.email || "-"}</td>
                  <td className="px-3 py-2">{patient.city || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
