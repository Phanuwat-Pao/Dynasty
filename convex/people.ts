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
    nicknameTh: v.optional(v.string()),
    nicknameEn: v.optional(v.string()),
    prenameTh: v.optional(v.string()),
    prenameEn: v.optional(v.string()),
    givenNameTh: v.optional(v.string()),
    givenNameEn: v.optional(v.string()),
    familyNameTh: v.optional(v.string()),
    familyNameEn: v.optional(v.string()),
    portraitImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("User must be logged in to create a person.");
    }

    const personId = await ctx.db.insert("people", {
      nicknameTh: args.nicknameTh?.trim()
        ? args.nicknameTh?.trim()
        : args.nicknameEn?.trim(),
      nicknameEn:
        args.nicknameEn && args.nicknameEn.trim() !== ""
          ? args.nicknameEn.trim()
          : args.nicknameTh?.trim(),
      prenameTh: args.prenameTh?.trim()
        ? args.prenameTh?.trim()
        : args.prenameEn?.trim(),
      prenameEn:
        args.prenameEn && args.prenameEn.trim() !== ""
          ? args.prenameEn.trim()
          : args.prenameTh?.trim(),
      givenNameTh: args.givenNameTh?.trim()
        ? args.givenNameTh?.trim()
        : args.givenNameEn?.trim(),
      givenNameEn:
        args.givenNameEn && args.givenNameEn.trim() !== ""
          ? args.givenNameEn.trim()
          : args.givenNameTh?.trim(),
      familyNameTh: args.familyNameTh?.trim()
        ? args.familyNameTh?.trim()
        : args.familyNameEn?.trim(),
      familyNameEn:
        args.familyNameEn && args.familyNameEn.trim() !== ""
          ? args.familyNameEn.trim()
          : args.familyNameTh?.trim(),

      portraitImageId: args.portraitImageId,
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
    nicknameTh: v.optional(v.string()),
    nicknameEn: v.optional(v.string()),
    prenameTh: v.optional(v.string()),
    prenameEn: v.optional(v.string()),
    givenNameTh: v.optional(v.string()),
    givenNameEn: v.optional(v.string()),
    familyNameTh: v.optional(v.string()),
    familyNameEn: v.optional(v.string()),
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
      nicknameTh: args.nicknameTh?.trim()
        ? args.nicknameTh?.trim()
        : args.nicknameEn?.trim(),
      nicknameEn:
        args.nicknameEn && args.nicknameEn.trim() !== ""
          ? args.nicknameEn.trim()
          : args.nicknameTh?.trim(),
      prenameTh: args.prenameTh?.trim()
        ? args.prenameTh?.trim()
        : args.prenameEn?.trim(),
      givenNameTh: args.givenNameTh?.trim()
        ? args.givenNameTh?.trim()
        : args.givenNameEn?.trim(),
      givenNameEn:
        args.givenNameEn && args.givenNameEn.trim() !== ""
          ? args.givenNameEn.trim()
          : args.givenNameTh?.trim(),
      familyNameTh: args.familyNameTh?.trim()
        ? args.familyNameTh?.trim()
        : args.familyNameEn?.trim(),
      familyNameEn:
        args.familyNameEn && args.familyNameEn.trim() !== ""
          ? args.familyNameEn.trim()
          : args.familyNameTh?.trim(),
      portraitImageId: args.portraitImageId,
      updatedAt: Date.now(),
      updatedBy: identity.subject,
    });

    return args.personId;
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
    const person = await ctx.db.get(args.personId);
    if (person?.portraitImageId) {
      await ctx.storage.delete(person.portraitImageId);
    }
    const relationships = await ctx.db
      .query("relationships")
      .withIndex("by_person1Id", (q) => q.eq("person1Id", args.personId))
      .collect();
    for (const relationship of relationships) {
      await ctx.db.delete(relationship._id);
    }
    const relationships2 = await ctx.db
      .query("relationships")
      .withIndex("by_person2Id", (q) => q.eq("person2Id", args.personId))
      .collect();
    for (const relationship of relationships2) {
      await ctx.db.delete(relationship._id);
    }
    await ctx.db.delete(args.personId);
    return args.personId;
  },
});
