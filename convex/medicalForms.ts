import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthorizedUser } from "./auth_helpers";

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db.insert("medicalForms", args);
  },
});

export const list = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db
      .query("medicalForms")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: {
    formId: v.id("medicalForms"),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db.get(args.formId);
  },
});

export const update = mutation({
  args: {
    formId: v.id("medicalForms"),
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
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    const { formId, ...updates } = args;
    return await ctx.db.patch(formId, updates);
  },
});

export const remove = mutation({
  args: {
    formId: v.id("medicalForms"),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db.delete(args.formId);
  },
});
