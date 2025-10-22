import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  patients: defineTable({
    name: v.string(),
    dateOfBirth: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    address2: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postal: v.optional(v.string()),
    gender: v.optional(v.string()),
    age: v.optional(v.number()),
    homePhone: v.optional(v.string()),
    workPhone: v.optional(v.string()),
    cellPhone: v.optional(v.string()),
    balance: v.optional(v.number()),
    cid: v.optional(v.string()),
    pronoun: v.optional(v.string()),
    paid: v.optional(v.boolean()),
    dnd: v.optional(v.boolean()),
    pPurchaseDate: v.optional(v.string()),
    campaign: v.optional(v.string()),
    promo: v.optional(v.string()),
    amount: v.optional(v.number()),
    apptDate: v.optional(v.string()),
    apptServiceName: v.optional(v.string()),
    dateCreated: v.optional(v.string()),
    smsReminder: v.optional(v.boolean()),
    emailConf: v.optional(v.boolean()),
    // Additional fields that might be in import data
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    birthday: v.optional(v.string()),
  })
    .searchIndex("search_name", {
      searchField: "name",
    })
    .searchIndex("search_email", {
      searchField: "email",
    })
    .searchIndex("search_phone", {
      searchField: "phone",
    })
    .index("by_name", ["name"])
    .index("by_email", ["email"])
    .index("by_cid", ["cid"]),

  patientNotes: defineTable({
    patientId: v.id("patients"),
    title: v.string(),
    content: v.string(),
    category: v.optional(v.string()),
    isImportNote: v.optional(v.boolean()),
  }).index("by_patient", ["patientId"]),

  consents: defineTable({
    patientId: v.id("patients"),
    types: v.array(v.string()),
    text: v.string(),
    doctorSignature: v.string(),
    patientSignature: v.string(),
    date: v.string(),
    doctorName: v.string(),
    additionalInfo: v.optional(v.string()),
    medications: v.optional(v.array(v.string())),
    beforeImages: v.optional(v.array(v.id("_storage"))),
    afterImages: v.optional(v.array(v.id("_storage"))),
  }).index("by_patient", ["patientId"]),

  treatments: defineTable({
    patientId: v.id("patients"),
    type: v.string(),
    subType: v.optional(v.string()),
    date: v.string(),
    notes: v.string(),
    images: v.optional(v.array(v.id("_storage"))),
  }).index("by_patient", ["patientId"]),

  followUps: defineTable({
    patientId: v.id("patients"),
    date: v.string(),
    bodyAnnotation: v.string(),
    notes: v.string(),
  }).index("by_patient", ["patientId"]),

  photos: defineTable({
    patientId: v.id("patients"),
    date: v.string(),
    description: v.optional(v.string()),
    storageId: v.id("_storage"),
  }).index("by_patient", ["patientId"]),

  miscFiles: defineTable({
    patientId: v.id("patients"),
    fileName: v.string(),
    fileType: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    uploadDate: v.string(),
    storageId: v.id("_storage"),
  }).index("by_patient", ["patientId"]),

  medicalForms: defineTable({
    patientId: v.id("patients"),
    formType: v.string(),
    formData: v.object({
      personalInfo: v.object({
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        dateOfBirth: v.optional(v.string()),
        address: v.optional(v.string()),
        city: v.optional(v.string()),
        province: v.optional(v.string()),
        postalCode: v.optional(v.string()),
        phoneEmail: v.optional(v.string()),
        referralSource: v.optional(v.string()),
      }),
      generalInfo: v.object({
        underDoctorCare: v.optional(v.boolean()),
        doctorCareReason: v.optional(v.string()),
        underDermatologistCare: v.optional(v.boolean()),
        dermatologistCareReason: v.optional(v.string()),
        skinType: v.optional(v.string()),
        skinProblems: v.optional(v.boolean()),
        skinProblemsDetails: v.optional(v.string()),
        erythemaAbIgne: v.optional(v.boolean()),
        previousTreatments: v.optional(v.boolean()),
        previousTreatmentsDetails: v.optional(v.string()),
        retinoidProducts: v.optional(v.boolean()),
        retinoidProductsDetails: v.optional(v.string()),
        otherHealthProblems: v.optional(v.string()),
      }),
      medicalConditions: v.object({
        cancer: v.optional(v.boolean()),
        coldSores: v.optional(v.boolean()),
        epilepsy: v.optional(v.boolean()),
        bloodClotting: v.optional(v.boolean()),
        diabetes: v.optional(v.boolean()),
        hivAids: v.optional(v.boolean()),
        hepatitis: v.optional(v.boolean()),
        activeInfection: v.optional(v.boolean()),
        bloodPressure: v.optional(v.boolean()),
        keloidScars: v.optional(v.boolean()),
        hormonalImbalance: v.optional(v.boolean()),
        herpes: v.optional(v.boolean()),
        skinLesions: v.optional(v.boolean()),
        thyroidImbalance: v.optional(v.boolean()),
        arthritis: v.optional(v.boolean()),
      }),
      allergies: v.object({
        hydrocortisone: v.optional(v.boolean()),
        hydroquinone: v.optional(v.boolean()),
        lidocaine: v.optional(v.boolean()),
        latex: v.optional(v.boolean()),
        aspirin: v.optional(v.boolean()),
        food: v.optional(v.boolean()),
        foodDetails: v.optional(v.string()),
        other: v.optional(v.boolean()),
        otherDetails: v.optional(v.string()),
      }),
      medications: v.object({
        contraceptivePills: v.optional(v.boolean()),
        hormones: v.optional(v.boolean()),
        otherMedications: v.optional(v.boolean()),
        otherMedicationsDetails: v.optional(v.string()),
        moodMedications: v.optional(v.boolean()),
        accutane: v.optional(v.boolean()),
        accutaneLastTime: v.optional(v.string()),
        herbalSupplements: v.optional(v.boolean()),
        herbalSupplementsDetails: v.optional(v.string()),
      }),
      additionalInfo: v.object({
        laserHairRemoval: v.optional(v.boolean()),
        recentTanning: v.optional(v.boolean()),
        thickScars: v.optional(v.boolean()),
        pigmentationChanges: v.optional(v.boolean()),
        pigmentationDetails: v.optional(v.string()),
        lidocaineAnesthesia: v.optional(v.boolean()),
      }),
      femaleClientele: v.object({
        pregnant: v.optional(v.boolean()),
        breastfeeding: v.optional(v.boolean()),
        contraception: v.optional(v.boolean()),
        urinaryIncontinence: v.optional(v.boolean()),
        implants: v.optional(v.boolean()),
      }),
      consent: v.object({
        paymentConsent: v.optional(v.boolean()),
        consultationFeeConsent: v.optional(v.boolean()),
      }),
      signatures: v.object({
        clientDate: v.optional(v.string()),
        clientSignature: v.optional(v.string()),
        practitionerDate: v.optional(v.string()),
        practitionerSignature: v.optional(v.string()),
        medicalDirectorDate: v.optional(v.string()),
        medicalDirectorSignature: v.optional(v.string()),
      }),
    }),
    completedDate: v.string(),
  }).index("by_patient", ["patientId"]),

  // New tables for dynamic form system
  formTemplates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    sections: v.array(v.object({
      title: v.string(),
      fields: v.array(v.object({
        id: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("textarea"),
          v.literal("select"),
          v.literal("radio"),
          v.literal("checkbox"),
          v.literal("date"),
          v.literal("number"),
          v.literal("email"),
          v.literal("phone")
        ),
        label: v.string(),
        required: v.optional(v.boolean()),
        options: v.optional(v.array(v.string())),
        placeholder: v.optional(v.string()),
        validation: v.optional(v.object({
          min: v.optional(v.number()),
          max: v.optional(v.number()),
          pattern: v.optional(v.string()),
        })),
      })),
    })),
    isActive: v.optional(v.boolean()),
  }),

  dynamicForms: defineTable({
    patientId: v.id("patients"),
    templateId: v.id("formTemplates"),
    formData: v.any(), // Dynamic object to store form responses
    completedDate: v.string(),
  }).index("by_patient", ["patientId"]),
};

// Extend the authTables to add isAuthorized field to users
const customAuthTables = {
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Custom fields for authorization and roles
    isAuthorized: v.optional(v.boolean()),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
  }).index("email", ["email"]),
};

export default defineSchema({
  ...customAuthTables,
  ...applicationTables,
});
