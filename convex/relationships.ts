import { v } from "convex/values";
import { getDictionary } from "../get-dictionary";
import { mutation, query } from "./_generated/server";

const dictionary = await getDictionary("th");

// Mutation to add a relationship between two people
export const addRelationship = mutation({
  args: {
    person1Id: v.id("people"),
    person2Id: v.id("people"),
    type: v.union(
      ...Object.getOwnPropertyNames(dictionary.relationshipTypes).map(
        v.literal,
      ),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("User must be logged in to add a relationship.");
    }

    // Ensure both people exist and belong to the user
    const person1 = await ctx.db.get(args.person1Id);
    const person2 = await ctx.db.get(args.person2Id);

    if (
      !person1 ||
      person1.userId !== identity.subject ||
      !person2 ||
      person2.userId !== identity.subject
    ) {
      throw new Error(
        "One or both persons not found or not owned by the user.",
      );
    }
    if (args.person1Id === args.person2Id) {
      throw new Error("Cannot create a relationship with oneself.");
    }

    // Check if relationship already exists (optional, depending on desired behavior)
    // For simplicity, we'll allow multiple relationships of different types,
    // or even same type if not checked.

    const relationshipId = await ctx.db.insert("relationships", {
      person1Id: args.person1Id,
      person2Id: args.person2Id,
      type: args.type,
      userId: identity.subject,
    });

    return relationshipId;
  },
});

// Query to list relationships for the current user
export const listRelationshipsForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      return [];
    }

    const relationships = await ctx.db
      .query("relationships")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    // Optionally, enrich with person names
    return Promise.all(
      relationships.map(async (rel) => {
        const person1 = await ctx.db.get(rel.person1Id);
        const person2 = await ctx.db.get(rel.person2Id);
        return {
          ...rel,
          person1NameTh: person1?.nameTh ?? "Unknown",
          person1NameEn: person1?.nameEn ?? "Unknown",
          person2NameTh: person2?.nameTh ?? "Unknown",
          person2NameEn: person2?.nameEn ?? "Unknown",
        };
      }),
    );
  },
});

// Query to get data structured for visualization
export const getVisualData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      return { nodes: [], edges: [] };
    }

    const people = await ctx.db
      .query("people")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    const nodesPromises = people.map(async (person) => {
      let portraitUrl = null;
      if (person.portraitImageId) {
        portraitUrl = await ctx.storage.getUrl(person.portraitImageId);
      }
      return {
        id: person._id,
        nameTh: person.nameTh,
        nameEn: person.nameEn,
        portraitUrl: portraitUrl,
      };
    });
    const nodes = await Promise.all(nodesPromises);

    const relationships = await ctx.db
      .query("relationships")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    const edges = relationships.map((rel) => ({
      id: rel._id,
      source: rel.person1Id,
      target: rel.person2Id,
      label: rel.type,
    }));

    return { nodes, edges };
  },
});
