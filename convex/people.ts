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
      nameTh: args.nameTh.trim(),
      nameEn:
        args.nameEn && args.nameEn.trim() !== ""
          ? args.nameEn.trim()
          : args.nameTh.trim(),
      portraitImageId: args.portraitImageId,
      userId: identity.subject,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: identity.subject,
      updatedBy: identity.subject,
    });

    return personId;
  },
});

// Query to list people for the current user
export const listPeople = query({
  args: {},
  handler: async (ctx) => {
    const people = await ctx.db.query("people").collect();

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

// Mutation to update a person
export const updatePerson = mutation({
  args: {
    personId: v.id("people"),
    nameTh: v.string(),
    nameEn: v.optional(v.string()),
    portraitImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("User must be logged in to update a person.");
    }

    const person = await ctx.db.get(args.personId);
    if (args.portraitImageId && person?.portraitImageId) {
      await ctx.storage.delete(person.portraitImageId);
    }

    await ctx.db.patch(args.personId, {
      nameTh: args.nameTh.trim(),
      nameEn:
        args.nameEn && args.nameEn.trim() !== ""
          ? args.nameEn.trim()
          : args.nameTh.trim(),
      portraitImageId: args.portraitImageId,
      updatedAt: Date.now(),
      updatedBy: identity.subject,
    });

    return args.personId;
  },
});

// Query to get a specific person by ID (useful for relationship forms)
export const getPerson = query({
  args: { personId: v.id("people") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("User must be logged in to get a person.");
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

// Delete a person
export const deletePerson = mutation({
  args: { personId: v.id("people") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("User must be logged in to delete a person.");
    }
    await ctx.db.delete(args.personId);
    return args.personId;
  },
});
