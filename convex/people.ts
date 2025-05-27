import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Mutation to generate a short-lived upload URL for portrait images
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("User must be logged in to upload files.");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

// Mutation to create a new person
export const createPerson = mutation({
  args: {
    nameTh: v.string(),
    nameEn: v.optional(v.string()),
    portraitImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("User must be logged in to create a person.");
    }

    const personId = await ctx.db.insert("people", {
      nameTh: args.nameTh,
      nameEn: args.nameEn ?? args.nameTh,
      portraitImageId: args.portraitImageId,
      userId: identity.subject,
    });

    return personId;
  },
});

// Query to list people for the current user
export const listPeople = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      return []; // Or throw new Error("User must be logged in.");
    }

    const people = await ctx.db
      .query("people")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("asc")
      .collect();

    return Promise.all(
      people.map(async (person) => {
        let portraitUrl = null;
        if (person.portraitImageId) {
          portraitUrl = await ctx.storage.getUrl(person.portraitImageId);
        }
        return {
          ...person,
          portraitUrl: portraitUrl,
        };
      }),
    );
  },
});

// Query to get a specific person by ID (useful for relationship forms)
export const getPerson = query({
  args: { personId: v.id("people") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("User must be logged in.");
    }
    const person = await ctx.db.get(args.personId);
    if (!person || person.userId !== identity.subject) {
      return null; // Or throw error if person not found or not owned by user
    }

    let portraitUrl = null;
    if (person.portraitImageId) {
      portraitUrl = await ctx.storage.getUrl(person.portraitImageId);
    }
    return { ...person, portraitUrl };
  },
});
