import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthorizedUser } from "./auth_helpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db.query("patients").order("desc").collect();
  },
});

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    
    if (!args.searchTerm) {
      return await ctx.db.query("patients").order("desc").take(50);
    }

    // Check if search term looks like a phone number (digits only)
    const isPhoneSearch = /^\d+$/.test(args.searchTerm);
    let phoneSearchTerms = [args.searchTerm];
    
    // If it's a phone number search, prepare variations
    if (isPhoneSearch) {
      if (args.searchTerm.length === 10 && args.searchTerm.startsWith("5")) {
        // If searching "5149626004", also search "15149626004"
        phoneSearchTerms.push("1" + args.searchTerm);
      } else if (args.searchTerm.length === 11 && args.searchTerm.startsWith("15")) {
        // If searching "15149626004", also search "5149626004"
        phoneSearchTerms.push(args.searchTerm.substring(1));
      }
    }

    // Search by name and email
    const [nameResults, emailResults] = await Promise.all([
      ctx.db
        .query("patients")
        .withSearchIndex("search_name", (q) => q.search("name", args.searchTerm))
        .take(50),
      ctx.db
        .query("patients")
        .withSearchIndex("search_email", (q) => q.search("email", args.searchTerm))
        .take(50),
    ]);

    // Search phone with all variations
    const phoneSearchPromises = phoneSearchTerms.map(term =>
      ctx.db
        .query("patients")
        .withSearchIndex("search_phone", (q) => q.search("phone", term))
        .take(50)
    );
    const phoneResults = await Promise.all(phoneSearchPromises);
    const flatPhoneResults = phoneResults.flat();

    // Combine results and remove duplicates
    const allResults = [...nameResults, ...emailResults, ...flatPhoneResults];
    const uniqueResults = allResults.filter((patient, index, self) => 
      index === self.findIndex(p => p._id === patient._id)
    );

    return uniqueResults.slice(0, 50);
  },
});

export const get = query({
  args: { id: v.id("patients") },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db.insert("patients", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("patients"),
    name: v.optional(v.string()),
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
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    birthday: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    const { id, ...updates } = args;
    
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(id, filteredUpdates);
  },
});

export const remove = mutation({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    console.log("Remove mutation called with args:", args);
    await ctx.db.delete(args.patientId);
  },
});

// Helper function to check if patient exists by name
const patientExistsByName = async (ctx: any, name: string) => {
  const existing = await ctx.db
    .query("patients")
    .withIndex("by_name", (q: any) => q.eq("name", name))
    .first();
  return existing !== null;
};

// Helper function to check if patient exists by email
const patientExistsByEmail = async (ctx: any, email: string) => {
  if (!email) return false;
  const existing = await ctx.db
    .query("patients")
    .withIndex("by_email", (q: any) => q.eq("email", email))
    .first();
  return existing !== null;
};

// Helper function to check if patient exists by CID
const patientExistsByCid = async (ctx: any, cid: string) => {
  if (!cid) return false;
  const existing = await ctx.db
    .query("patients")
    .withIndex("by_cid", (q: any) => q.eq("cid", cid))
    .first();
  return existing !== null;
};

export const importPatients = mutation({
  args: {
    patients: v.array(v.object({
      firstName: v.string(),
      lastName: v.string(),
      email: v.optional(v.string()),
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
      paid: v.optional(v.boolean()),
      dnd: v.optional(v.boolean()),
      campaign: v.optional(v.string()),
      apptDate: v.optional(v.string()),
      apptServiceName: v.optional(v.string()),
      dateCreated: v.optional(v.string()),
      smsReminder: v.optional(v.boolean()),
      emailConf: v.optional(v.boolean()),
      birthday: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    
    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const patientData of args.patients) {
      try {
        const fullName = `${patientData.firstName} ${patientData.lastName}`;
        
        // Check for duplicates using multiple criteria
        const nameExists = await patientExistsByName(ctx, fullName);
        const emailExists = patientData.email ? await patientExistsByEmail(ctx, patientData.email) : false;
        const cidExists = patientData.cid ? await patientExistsByCid(ctx, patientData.cid) : false;
        
        if (nameExists || emailExists || cidExists) {
          results.skipped++;
          continue;
        }

        // Transform the data to match our schema
        const transformedPatient = {
          name: fullName,
          dateOfBirth: patientData.birthday || "",
          email: patientData.email,
          phone: patientData.cellPhone || patientData.homePhone || patientData.workPhone,
          address: patientData.address,
          address2: patientData.address2,
          city: patientData.city,
          state: patientData.state,
          postal: patientData.postal,
          gender: patientData.gender,
          age: patientData.age,
          homePhone: patientData.homePhone,
          workPhone: patientData.workPhone,
          cellPhone: patientData.cellPhone,
          balance: patientData.balance,
          cid: patientData.cid,
          paid: patientData.paid,
          dnd: patientData.dnd,
          campaign: patientData.campaign,
          apptDate: patientData.apptDate,
          apptServiceName: patientData.apptServiceName,
          dateCreated: patientData.dateCreated,
          smsReminder: patientData.smsReminder,
          emailConf: patientData.emailConf,
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          birthday: patientData.birthday,
        };

        await ctx.db.insert("patients", transformedPatient);
        results.imported++;
      } catch (error) {
        results.errors.push(`Erreur pour ${patientData.firstName} ${patientData.lastName}: ${error}`);
      }
    }

    return results;
  },
});
