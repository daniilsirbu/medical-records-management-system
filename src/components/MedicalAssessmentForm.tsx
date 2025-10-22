import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phoneEmail: string;
  referralSource: string;
}

interface GeneralInfo {
  underDoctorCare: boolean | null;
  doctorCareReason: string;
  underDermatologistCare: boolean | null;
  dermatologistCareReason: string;
  otherHealthProblems: string;
}

interface MedicalConditions {
  cancer: boolean;
  coldSores: boolean;
  epilepsy: boolean;
  bloodClotting: boolean;
  diabetes: boolean;
  hivAids: boolean;
  hepatitis: boolean;
  activeInfection: boolean;
  bloodPressure: boolean;
  keloidScars: boolean;
  hormonalImbalance: boolean;
  herpes: boolean;
  skinLesions: boolean;
  thyroidImbalance: boolean;
  arthritis: boolean;
}

interface Allergies {
  hydrocortisone: boolean;
  hydroquinone: boolean;
  lidocaine: boolean;
  latex: boolean;
  aspirin: boolean;
  food: boolean;
  foodDetails: string;
  other: boolean;
  otherDetails: string;
}

interface Medications {
  contraceptivePills: boolean;
  hormones: boolean;
  otherMedications: boolean;
  otherMedicationsDetails: string;
  moodMedications: boolean | null;
  accutane: boolean | null;
  accutaneLastTime: string;
  herbalSupplements: boolean | null;
  herbalSupplementsDetails: string;
}

interface AdditionalInfo {
  laserHairRemoval: boolean | null;
  recentTanning: boolean | null;
  thickScars: boolean | null;
  pigmentationChanges: boolean | null;
  pigmentationDetails: string;
  lidocaineAnesthesia: boolean | null;
}

interface FemaleClientele {
  pregnant: boolean | null;
  breastfeeding: boolean | null;
  contraception: boolean | null;
  urinaryIncontinence: boolean | null;
  implants: boolean | null;
}

interface Consent {
  paymentConsent: boolean;
  consultationFeeConsent: boolean;
}

interface Signatures {
  clientDate: string;
  clientSignature: string;
  practitionerDate: string;
  practitionerSignature: string;
  medicalDirectorDate: string;
  medicalDirectorSignature: string;
}

export function MedicalAssessmentForm({
  patientId,
  onComplete,
  existingForm,
}: {
  patientId: Id<"patients">;
  onComplete: () => void;
  existingForm?: any;
}) {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: existingForm?.formData?.personalInfo?.firstName || "",
    lastName: existingForm?.formData?.personalInfo?.lastName || "",
    dateOfBirth: existingForm?.formData?.personalInfo?.dateOfBirth || "",
    address: existingForm?.formData?.personalInfo?.address || "",
    city: existingForm?.formData?.personalInfo?.city || "",
    province: existingForm?.formData?.personalInfo?.province || "",
    postalCode: existingForm?.formData?.personalInfo?.postalCode || "",
    phoneEmail: existingForm?.formData?.personalInfo?.phoneEmail || "",
    referralSource: existingForm?.formData?.personalInfo?.referralSource || "",
  });

  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    underDoctorCare: existingForm?.formData?.generalInfo?.underDoctorCare ?? null,
    doctorCareReason: existingForm?.formData?.generalInfo?.doctorCareReason || "",
    underDermatologistCare: existingForm?.formData?.generalInfo?.underDermatologistCare ?? null,
    dermatologistCareReason: existingForm?.formData?.generalInfo?.dermatologistCareReason || "",
    otherHealthProblems: existingForm?.formData?.generalInfo?.otherHealthProblems || "",
  });

  const [medicalConditions, setMedicalConditions] = useState<MedicalConditions>({
    cancer: false, coldSores: false, epilepsy: false, bloodClotting: false, diabetes: false,
    hivAids: false, hepatitis: false, activeInfection: false, bloodPressure: false, keloidScars: false,
    hormonalImbalance: false, herpes: false, skinLesions: false, thyroidImbalance: false, arthritis: false,
  });

  const [allergies, setAllergies] = useState<Allergies>({
    hydrocortisone: existingForm?.formData?.allergies?.hydrocortisone || false,
    hydroquinone: existingForm?.formData?.allergies?.hydroquinone || false,
    lidocaine: existingForm?.formData?.allergies?.lidocaine || false,
    latex: existingForm?.formData?.allergies?.latex || false,
    aspirin: existingForm?.formData?.allergies?.aspirin || false,
    food: existingForm?.formData?.allergies?.food || false,
    foodDetails: existingForm?.formData?.allergies?.foodDetails || "",
    other: existingForm?.formData?.allergies?.other || false,
    otherDetails: existingForm?.formData?.allergies?.otherDetails || "",
  });

  const [medications, setMedications] = useState<Medications>({
    contraceptivePills: existingForm?.formData?.medications?.contraceptivePills || false,
    hormones: existingForm?.formData?.medications?.hormones || false,
    otherMedications: existingForm?.formData?.medications?.otherMedications || false,
    otherMedicationsDetails: existingForm?.formData?.medications?.otherMedicationsDetails || "",
    moodMedications: existingForm?.formData?.medications?.moodMedications ?? null,
    accutane: existingForm?.formData?.medications?.accutane ?? null,
    accutaneLastTime: existingForm?.formData?.medications?.accutaneLastTime || "",
    herbalSupplements: existingForm?.formData?.medications?.herbalSupplements ?? null,
    herbalSupplementsDetails: existingForm?.formData?.medications?.herbalSupplementsDetails || "",
  });

  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo>({
    laserHairRemoval: existingForm?.formData?.additionalInfo?.laserHairRemoval ?? null,
    recentTanning: existingForm?.formData?.additionalInfo?.recentTanning ?? null,
    thickScars: existingForm?.formData?.additionalInfo?.thickScars ?? null,
    pigmentationChanges: existingForm?.formData?.additionalInfo?.pigmentationChanges ?? null,
    pigmentationDetails: existingForm?.formData?.additionalInfo?.pigmentationDetails || "",
    lidocaineAnesthesia: existingForm?.formData?.additionalInfo?.lidocaineAnesthesia ?? null,
  });

  const [femaleClientele, setFemaleClientele] = useState<FemaleClientele>({
    pregnant: existingForm?.formData?.femaleClientele?.pregnant ?? null,
    breastfeeding: existingForm?.formData?.femaleClientele?.breastfeeding ?? null,
    contraception: existingForm?.formData?.femaleClientele?.contraception ?? null,
    urinaryIncontinence: existingForm?.formData?.femaleClientele?.urinaryIncontinence ?? null,
    implants: existingForm?.formData?.femaleClientele?.implants ?? null,
  });

  const [consent, setConsent] = useState<Consent>({
    paymentConsent: existingForm?.formData?.consent?.paymentConsent || false,
    consultationFeeConsent: existingForm?.formData?.consent?.consultationFeeConsent || false,
  });

  const [signatures, setSignatures] = useState<Signatures>({
    clientDate: existingForm?.formData?.signatures?.clientDate || "",
    clientSignature: existingForm?.formData?.signatures?.clientSignature || "",
    practitionerDate: existingForm?.formData?.signatures?.practitionerDate || "",
    practitionerSignature: existingForm?.formData?.signatures?.practitionerSignature || "",
    medicalDirectorDate: existingForm?.formData?.signatures?.medicalDirectorDate || "",
    medicalDirectorSignature: existingForm?.formData?.signatures?.medicalDirectorSignature || "",
  });

  const clientSignatureRef = useRef<SignatureCanvas>(null);
  const practitionerSignatureRef = useRef<SignatureCanvas>(null);
  const medicalDirectorSignatureRef = useRef<SignatureCanvas>(null);

  const createForm = useMutation(api.medicalForms.create);
  const updateForm = useMutation(api.medicalForms.update);

  // Load existing signatures when editing
  useEffect(() => {
    if (existingForm?.formData?.signatures) {
      setTimeout(() => {
        if (existingForm.formData.signatures.clientSignature && clientSignatureRef.current) {
          clientSignatureRef.current.fromDataURL(existingForm.formData.signatures.clientSignature);
        }
        if (existingForm.formData.signatures.practitionerSignature && practitionerSignatureRef.current) {
          practitionerSignatureRef.current.fromDataURL(existingForm.formData.signatures.practitionerSignature);
        }
        if (existingForm.formData.signatures.medicalDirectorSignature && medicalDirectorSignatureRef.current) {
          medicalDirectorSignatureRef.current.fromDataURL(existingForm.formData.signatures.medicalDirectorSignature);
        }
      }, 100);
    }
  }, [existingForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Capture signatures as base64 data URLs
    const clientSignatureData = clientSignatureRef.current?.toDataURL() || existingForm?.formData?.signatures?.clientSignature || "";
    const practitionerSignatureData = practitionerSignatureRef.current?.toDataURL() || existingForm?.formData?.signatures?.practitionerSignature || "";
    const medicalDirectorSignatureData = medicalDirectorSignatureRef.current?.toDataURL() || existingForm?.formData?.signatures?.medicalDirectorSignature || "";

    const formData = {
      personalInfo: {
        firstName: personalInfo.firstName || undefined,
        lastName: personalInfo.lastName || undefined,
        dateOfBirth: personalInfo.dateOfBirth || undefined,
        address: personalInfo.address || undefined,
        city: personalInfo.city || undefined,
        province: personalInfo.province || undefined,
        postalCode: personalInfo.postalCode || undefined,
        phoneEmail: personalInfo.phoneEmail || undefined,
        referralSource: personalInfo.referralSource || undefined,
      },
      generalInfo: {
        underDoctorCare: generalInfo.underDoctorCare || undefined,
        doctorCareReason: generalInfo.doctorCareReason || undefined,
        underDermatologistCare: generalInfo.underDermatologistCare || undefined,
        dermatologistCareReason: generalInfo.dermatologistCareReason || undefined,
        otherHealthProblems: generalInfo.otherHealthProblems || undefined,
      },
      medicalConditions: {
        cancer: medicalConditions.cancer || undefined,
        coldSores: medicalConditions.coldSores || undefined,
        epilepsy: medicalConditions.epilepsy || undefined,
        bloodClotting: medicalConditions.bloodClotting || undefined,
        diabetes: medicalConditions.diabetes || undefined,
        hivAids: medicalConditions.hivAids || undefined,
        hepatitis: medicalConditions.hepatitis || undefined,
        activeInfection: medicalConditions.activeInfection || undefined,
        bloodPressure: medicalConditions.bloodPressure || undefined,
        keloidScars: medicalConditions.keloidScars || undefined,
        hormonalImbalance: medicalConditions.hormonalImbalance || undefined,
        herpes: medicalConditions.herpes || undefined,
        skinLesions: medicalConditions.skinLesions || undefined,
        thyroidImbalance: medicalConditions.thyroidImbalance || undefined,
        arthritis: medicalConditions.arthritis || undefined,
      },
      allergies: {
        hydrocortisone: allergies.hydrocortisone || undefined,
        hydroquinone: allergies.hydroquinone || undefined,
        lidocaine: allergies.lidocaine || undefined,
        latex: allergies.latex || undefined,
        aspirin: allergies.aspirin || undefined,
        food: allergies.food || undefined,
        foodDetails: allergies.foodDetails || undefined,
        other: allergies.other || undefined,
        otherDetails: allergies.otherDetails || undefined,
      },
      medications: {
        contraceptivePills: medications.contraceptivePills || undefined,
        hormones: medications.hormones || undefined,
        otherMedications: medications.otherMedications || undefined,
        otherMedicationsDetails: medications.otherMedicationsDetails || undefined,
        moodMedications: medications.moodMedications || undefined,
        accutane: medications.accutane || undefined,
        accutaneLastTime: medications.accutaneLastTime || undefined,
        herbalSupplements: medications.herbalSupplements || undefined,
        herbalSupplementsDetails: medications.herbalSupplementsDetails || undefined,
      },
      additionalInfo: {
        laserHairRemoval: additionalInfo.laserHairRemoval || undefined,
        recentTanning: additionalInfo.recentTanning || undefined,
        thickScars: additionalInfo.thickScars || undefined,
        pigmentationChanges: additionalInfo.pigmentationChanges || undefined,
        pigmentationDetails: additionalInfo.pigmentationDetails || undefined,
        lidocaineAnesthesia: additionalInfo.lidocaineAnesthesia || undefined,
      },
      femaleClientele: {
        pregnant: femaleClientele.pregnant || undefined,
        breastfeeding: femaleClientele.breastfeeding || undefined,
        contraception: femaleClientele.contraception || undefined,
        urinaryIncontinence: femaleClientele.urinaryIncontinence || undefined,
        implants: femaleClientele.implants || undefined,
      },
      consent: {
        paymentConsent: consent.paymentConsent || undefined,
        consultationFeeConsent: consent.consultationFeeConsent || undefined,
      },
      signatures: {
        clientDate: signatures.clientDate || undefined,
        clientSignature: clientSignatureData || undefined,
        practitionerDate: signatures.practitionerDate || undefined,
        practitionerSignature: practitionerSignatureData || undefined,
        medicalDirectorDate: signatures.medicalDirectorDate || undefined,
        medicalDirectorSignature: medicalDirectorSignatureData || undefined,
      },
    };

    if (existingForm) {
      await updateForm({
        formId: existingForm._id,
        formData,
      });
    } else {
      await createForm({
        patientId,
        formType: "medical_assessment",
        formData,
        completedDate: new Date().toISOString().split("T")[0],
      });
    }

    onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white border rounded-lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">BILAN MÉDICAL</h1>
        <h2 className="text-lg text-gray-600">Clinique Idyllium</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations Personnelles */}
        <div className="border-t-2 border-gray-300 pt-6">
          <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2">
            INFORMATIONS PERSONNELLES
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prénom:</label>
              <input
                type="text"
                value={personalInfo.firstName}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, firstName: e.target.value })
                }
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom:</label>
              <input
                type="text"
                value={personalInfo.lastName}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, lastName: e.target.value })
                }
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none py-1"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              Date de naissance: (jour/mois/année)
            </label>
            <input
              type="date"
              value={personalInfo.dateOfBirth}
              onChange={(e) =>
                setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })
              }
              className="border-b border-gray-400 focus:border-blue-500 outline-none py-1"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Adresse:</label>
            <input
              type="text"
              value={personalInfo.address}
              onChange={(e) =>
                setPersonalInfo({ ...personalInfo, address: e.target.value })
              }
              className="w-full border-b border-gray-400 focus:border-blue-500 outline-none py-1"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ville:</label>
              <input
                type="text"
                value={personalInfo.city}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, city: e.target.value })
                }
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Province:</label>
              <input
                type="text"
                value={personalInfo.province}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, province: e.target.value })
                }
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code postal:</label>
              <input
                type="text"
                value={personalInfo.postalCode}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, postalCode: e.target.value })
                }
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none py-1"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              Téléphone & Courriel:
            </label>
            <input
              type="text"
              value={personalInfo.phoneEmail}
              onChange={(e) =>
                setPersonalInfo({ ...personalInfo, phoneEmail: e.target.value })
              }
              className="w-full border-b border-gray-400 focus:border-blue-500 outline-none py-1"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              Source de référence:
            </label>
            <input
              type="text"
              value={personalInfo.referralSource}
              onChange={(e) =>
                setPersonalInfo({ ...personalInfo, referralSource: e.target.value })
              }
              className="w-full border-b border-gray-400 focus:border-blue-500 outline-none py-1"
            />
          </div>
        </div>

        {/* Information Générale */}
        <div className="border-t-2 border-gray-300 pt-6">
          <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2">
            INFORMATION GÉNÉRALE
          </h3>

          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">
                1. Êtes-vous actuellement sous les soins d'un médecin?
              </p>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="underDoctorCare"
                    checked={generalInfo.underDoctorCare === true}
                    onChange={() =>
                      setGeneralInfo({ ...generalInfo, underDoctorCare: true })
                    }
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="underDoctorCare"
                    checked={generalInfo.underDoctorCare === false}
                    onChange={() =>
                      setGeneralInfo({ ...generalInfo, underDoctorCare: false })
                    }
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Si oui, pour quelle raison?
                </label>
                <input
                  type="text"
                  value={generalInfo.doctorCareReason}
                  onChange={(e) =>
                    setGeneralInfo({
                      ...generalInfo,
                      doctorCareReason: e.target.value,
                    })
                  }
                  className="w-full border-b border-gray-400 focus:border-blue-500 outline-none py-1"
                />
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">
                2. Êtes-vous actuellement sous les soins d'un dermatologue?
              </p>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="underDermatologistCare"
                    checked={generalInfo.underDermatologistCare === true}
                    onChange={() =>
                      setGeneralInfo({
                        ...generalInfo,
                        underDermatologistCare: true,
                      })
                    }
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="underDermatologistCare"
                    checked={generalInfo.underDermatologistCare === false}
                    onChange={() =>
                      setGeneralInfo({
                        ...generalInfo,
                        underDermatologistCare: false,
                      })
                    }
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Si oui, pour quelle raison?
                </label>
                <input
                  type="text"
                  value={generalInfo.dermatologistCareReason}
                  onChange={(e) =>
                    setGeneralInfo({
                      ...generalInfo,
                      dermatologistCareReason: e.target.value,
                    })
                  }
                  className="w-full border-b border-gray-400 focus:border-blue-500 outline-none py-1"
                />
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">
                9. Avez-vous d'autres problèmes de santé ou conditions médicales?
              </p>
              <textarea
                value={generalInfo.otherHealthProblems}
                onChange={(e) =>
                  setGeneralInfo({
                    ...generalInfo,
                    otherHealthProblems: e.target.value,
                  })
                }
                className="w-full border border-gray-400 focus:border-blue-500 outline-none py-1 px-2 rounded"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Allergies */}
        <div className="border-t-2 border-gray-300 pt-6">
          <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2">ALLERGIES</h3>
          <p className="font-medium mb-4">
            10. Avez-vous déjà eu une réaction allergique à l'un des suivants?
          </p>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={allergies.hydrocortisone}
                  onChange={(e) =>
                    setAllergies({ ...allergies, hydrocortisone: e.target.checked })
                  }
                  className="mr-2"
                />
                Hydrocortisone
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={allergies.hydroquinone}
                  onChange={(e) =>
                    setAllergies({ ...allergies, hydroquinone: e.target.checked })
                  }
                  className="mr-2"
                />
                Hydroquinone
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={allergies.lidocaine}
                  onChange={(e) =>
                    setAllergies({ ...allergies, lidocaine: e.target.checked })
                  }
                  className="mr-2"
                />
                Lidocaine
              </label>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={allergies.latex}
                  onChange={(e) =>
                    setAllergies({ ...allergies, latex: e.target.checked })
                  }
                  className="mr-2"
                />
                Latex
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={allergies.aspirin}
                  onChange={(e) =>
                    setAllergies({ ...allergies, aspirin: e.target.checked })
                  }
                  className="mr-2"
                />
                Aspirine
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={allergies.food}
                  onChange={(e) =>
                    setAllergies({ ...allergies, food: e.target.checked })
                  }
                  className="mr-2"
                />
                Nourriture
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              Quelle nourriture?
            </label>
            <input
              type="text"
              value={allergies.foodDetails}
              onChange={(e) =>
                setAllergies({ ...allergies, foodDetails: e.target.value })
              }
              className="w-full border-b border-gray-400 focus:border-blue-500 outline-none py-1"
            />
          </div>

          <div className="mt-4">
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={allergies.other}
                onChange={(e) =>
                  setAllergies({ ...allergies, other: e.target.checked })
                }
                className="mr-2"
              />
              Autre
            </label>
            <label className="block text-sm font-medium mb-1">
              Si autre, veuillez préciser:
            </label>
            <input
              type="text"
              value={allergies.otherDetails}
              onChange={(e) =>
                setAllergies({ ...allergies, otherDetails: e.target.value })
              }
              className="w-full border-b border-gray-400 focus:border-blue-500 outline-none py-1"
            />
          </div>
        </div>

        {/* Médicaments */}
        <div className="border-t-2 border-gray-300 pt-6">
          <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2">MÉDICAMENTS</h3>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">
                11. Quels médicaments oraux/topiques prenez-vous actuellement?
              </p>
              <div className="flex gap-6 mb-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={medications.contraceptivePills}
                    onChange={(e) =>
                      setMedications({ ...medications, contraceptivePills: e.target.checked })
                    }
                    className="mr-2"
                  />
                  Pilules contraceptives
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={medications.hormones}
                    onChange={(e) =>
                      setMedications({ ...medications, hormones: e.target.checked })
                    }
                    className="mr-2"
                  />
                  Hormones
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={medications.otherMedications}
                    onChange={(e) =>
                      setMedications({ ...medications, otherMedications: e.target.checked })
                    }
                    className="mr-2"
                  />
                  Autres
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Si autres, veuillez préciser:
                </label>
                <input
                  type="text"
                  value={medications.otherMedicationsDetails}
                  onChange={(e) =>
                    setMedications({
                      ...medications,
                      otherMedicationsDetails: e.target.value,
                    })
                  }
                  className="w-full border-b border-gray-400 focus:border-blue-500 outline-none py-1"
                />
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">
                12. Prenez-vous des médicaments qui modifient l'humeur ou des anti-dépresseurs?
              </p>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="moodMedications"
                    checked={medications.moodMedications === true}
                    onChange={() =>
                      setMedications({ ...medications, moodMedications: true })
                    }
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="moodMedications"
                    checked={medications.moodMedications === false}
                    onChange={() =>
                      setMedications({ ...medications, moodMedications: false })
                    }
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">
                13. Avez-vous déjà pris de l'Accutane?
              </p>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="accutane"
                    checked={medications.accutane === true}
                    onChange={() =>
                      setMedications({ ...medications, accutane: true })
                    }
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="accutane"
                    checked={medications.accutane === false}
                    onChange={() =>
                      setMedications({ ...medications, accutane: false })
                    }
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Si oui, quand était la dernière fois?
                </label>
                <input
                  type="text"
                  value={medications.accutaneLastTime}
                  onChange={(e) =>
                    setMedications({
                      ...medications,
                      accutaneLastTime: e.target.value,
                    })
                  }
                  className="w-full border-b border-gray-400 focus:border-blue-500 outline-none py-1"
                />
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">
                14. Utilisez-vous régulièrement des suppléments à base de plantes?
              </p>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="herbalSupplements"
                    checked={medications.herbalSupplements === true}
                    onChange={() =>
                      setMedications({ ...medications, herbalSupplements: true })
                    }
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="herbalSupplements"
                    checked={medications.herbalSupplements === false}
                    onChange={() =>
                      setMedications({ ...medications, herbalSupplements: false })
                    }
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Si oui, lesquels?
                </label>
                <input
                  type="text"
                  value={medications.herbalSupplementsDetails}
                  onChange={(e) =>
                    setMedications({
                      ...medications,
                      herbalSupplementsDetails: e.target.value,
                    })
                  }
                  className="w-full border-b border-gray-400 focus:border-blue-500 outline-none py-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Renseignements Supplémentaires */}
        <div className="border-t-2 border-gray-300 pt-6">
          <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2">
            RENSEIGNEMENTS SUPPLÉMENTAIRES
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">
                15. Avez-vous déjà subi une épilation au laser ou au LIP?
              </p>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="laserHairRemoval"
                    checked={additionalInfo.laserHairRemoval === true}
                    onChange={() =>
                      setAdditionalInfo({ ...additionalInfo, laserHairRemoval: true })
                    }
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="laserHairRemoval"
                    checked={additionalInfo.laserHairRemoval === false}
                    onChange={() =>
                      setAdditionalInfo({ ...additionalInfo, laserHairRemoval: false })
                    }
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">
                16. Avez-vous eu récemment un bronzage (naturel ou artificiel) ou une exposition au soleil?
              </p>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="recentTanning"
                    checked={additionalInfo.recentTanning === true}
                    onChange={() =>
                      setAdditionalInfo({ ...additionalInfo, recentTanning: true })
                    }
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="recentTanning"
                    checked={additionalInfo.recentTanning === false}
                    onChange={() =>
                      setAdditionalInfo({ ...additionalInfo, recentTanning: false })
                    }
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">
                17. Formez-vous des cicatrices épaisses ou surélevées à la suite de coupures ou de brûlures?
              </p>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="thickScars"
                    checked={additionalInfo.thickScars === true}
                    onChange={() =>
                      setAdditionalInfo({ ...additionalInfo, thickScars: true })
                    }
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="thickScars"
                    checked={additionalInfo.thickScars === false}
                    onChange={() =>
                      setAdditionalInfo({ ...additionalInfo, thickScars: false })
                    }
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">
                18. Avez-vous une hyperpigmentation ou une hypopigmentation après un traumatisme physique?
              </p>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pigmentationChanges"
                    checked={additionalInfo.pigmentationChanges === true}
                    onChange={() =>
                      setAdditionalInfo({ ...additionalInfo, pigmentationChanges: true })
                    }
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pigmentationChanges"
                    checked={additionalInfo.pigmentationChanges === false}
                    onChange={() =>
                      setAdditionalInfo({ ...additionalInfo, pigmentationChanges: false })
                    }
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Si oui, précisez:
                </label>
                <input
                  type="text"
                  value={additionalInfo.pigmentationDetails}
                  onChange={(e) =>
                    setAdditionalInfo({
                      ...additionalInfo,
                      pigmentationDetails: e.target.value,
                    })
                  }
                  className="w-full border-b border-gray-400 focus:border-blue-500 outline-none py-1"
                />
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">
                19. Avez-vous déjà eu une anesthésie locale avec de la lidocaïne?
              </p>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="lidocaineAnesthesia"
                    checked={additionalInfo.lidocaineAnesthesia === true}
                    onChange={() =>
                      setAdditionalInfo({ ...additionalInfo, lidocaineAnesthesia: true })
                    }
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="lidocaineAnesthesia"
                    checked={additionalInfo.lidocaineAnesthesia === false}
                    onChange={() =>
                      setAdditionalInfo({ ...additionalInfo, lidocaineAnesthesia: false })
                    }
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Clientèle Féminine */}
        <div className="border-t-2 border-gray-300 pt-6">
          <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2">
            CLIENTÈLE FÉMININE
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">
                20. Êtes-vous enceinte ou essayez-vous de l'être?
              </p>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pregnant"
                    checked={femaleClientele.pregnant === true}
                    onChange={() =>
                      setFemaleClientele({ ...femaleClientele, pregnant: true })
                    }
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pregnant"
                    checked={femaleClientele.pregnant === false}
                    onChange={() =>
                      setFemaleClientele({ ...femaleClientele, pregnant: false })
                    }
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">21. Allaitez-vous?</p>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="breastfeeding"
                    checked={femaleClientele.breastfeeding === true}
                    onChange={() =>
                      setFemaleClientele({ ...femaleClientele, breastfeeding: true })
                    }
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="breastfeeding"
                    checked={femaleClientele.breastfeeding === false}
                    onChange={() =>
                      setFemaleClientele({ ...femaleClientele, breastfeeding: false })
                    }
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">22. Utilisez-vous une contraception?</p>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="contraception"
                    checked={femaleClientele.contraception === true}
                    onChange={() =>
                      setFemaleClientele({ ...femaleClientele, contraception: true })
                    }
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="contraception"
                    checked={femaleClientele.contraception === false}
                    onChange={() =>
                      setFemaleClientele({ ...femaleClientele, contraception: false })
                    }
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">23. Avez-vous une incontinence urinaire?</p>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="urinaryIncontinence"
                    checked={femaleClientele.urinaryIncontinence === true}
                    onChange={() =>
                      setFemaleClientele({ ...femaleClientele, urinaryIncontinence: true })
                    }
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="urinaryIncontinence"
                    checked={femaleClientele.urinaryIncontinence === false}
                    onChange={() =>
                      setFemaleClientele({ ...femaleClientele, urinaryIncontinence: false })
                    }
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">24. Avez-vous des implants?</p>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="implants"
                    checked={femaleClientele.implants === true}
                    onChange={() =>
                      setFemaleClientele({ ...femaleClientele, implants: true })
                    }
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="implants"
                    checked={femaleClientele.implants === false}
                    onChange={() =>
                      setFemaleClientele({ ...femaleClientele, implants: false })
                    }
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Consentement */}
        <div className="border-t-2 border-gray-300 pt-6">
          <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2">CONSENTEMENT</h3>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <p className="mb-4">
                Par la présente je consens à l'obligation de payer pour mes rendez-vous à la clinique Idyllium. 
                Je confirme aussi d'avoir été avisé qu'il y a un frais de 100$ pour les consultations avec les médecins, 
                à l'exception si j'effectue un traitement le jour même.
              </p>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={consent.paymentConsent}
                    onChange={(e) =>
                      setConsent({ ...consent, paymentConsent: e.target.checked })
                    }
                    className="mr-2"
                  />
                  Je consens à l'obligation de payer pour mes rendez-vous
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={consent.consultationFeeConsent}
                    onChange={(e) =>
                      setConsent({ ...consent, consultationFeeConsent: e.target.checked })
                    }
                    className="mr-2"
                  />
                  J'ai été avisé des frais de consultation de 100$
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="border-t-2 border-gray-300 pt-6">
          <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2">SIGNATURES</h3>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">CLIENT</h4>
                <div>
                  <label className="block text-sm font-medium mb-1">Date:</label>
                  <input
                    type="date"
                    value={signatures.clientDate}
                    onChange={(e) =>
                      setSignatures({ ...signatures, clientDate: e.target.value })
                    }
                    className="border-b border-gray-400 focus:border-blue-500 outline-none py-1"
                  />
                </div>
              </div>
              <div className="border rounded-md p-2 bg-white">
                <SignatureCanvas
                  ref={clientSignatureRef}
                  canvasProps={{
                    className: "w-full h-40 border rounded",
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => clientSignatureRef.current?.clear()}
                className="mt-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Effacer
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">PRATICIEN</h4>
                <div>
                  <label className="block text-sm font-medium mb-1">Date:</label>
                  <input
                    type="date"
                    value={signatures.practitionerDate}
                    onChange={(e) =>
                      setSignatures({
                        ...signatures,
                        practitionerDate: e.target.value,
                      })
                    }
                    className="border-b border-gray-400 focus:border-blue-500 outline-none py-1"
                  />
                </div>
              </div>
              <div className="border rounded-md p-2 bg-white">
                <SignatureCanvas
                  ref={practitionerSignatureRef}
                  canvasProps={{
                    className: "w-full h-40 border rounded",
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => practitionerSignatureRef.current?.clear()}
                className="mt-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Effacer
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">DIRECTEUR MÉDICAL</h4>
                <div>
                  <label className="block text-sm font-medium mb-1">Date:</label>
                  <input
                    type="date"
                    value={signatures.medicalDirectorDate}
                    onChange={(e) =>
                      setSignatures({
                        ...signatures,
                        medicalDirectorDate: e.target.value,
                      })
                    }
                    className="border-b border-gray-400 focus:border-blue-500 outline-none py-1"
                  />
                </div>
              </div>
              <div className="border rounded-md p-2 bg-white">
                <SignatureCanvas
                  ref={medicalDirectorSignatureRef}
                  canvasProps={{
                    className: "w-full h-40 border rounded",
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => medicalDirectorSignatureRef.current?.clear()}
                className="mt-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Effacer
              </button>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onComplete}
            className="px-6 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {existingForm ? "Mettre à jour" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
