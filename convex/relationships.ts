import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Mutation to add a relationship between two people
export const addRelationship = mutation({
  args: {
    person1Id: v.id("people"),
    person2Id: v.id("people"),
    relationshipType: v.union(
      v.literal("parent"),
      v.literal("child"),
      v.literal("sibling"),
      v.literal("spouse"),
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
      relationshipType: args.relationshipType,
      userId: identity.subject,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: identity.subject,
      updatedBy: identity.subject,
    });

    return relationshipId;
  },
});

// Query to get all relationships
export const listRelationships = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("relationships").collect();
  },
});

// Update a relationship
export const updateRelationship = mutation({
  args: {
    relationshipId: v.id("relationships"),
    relationshipType: v.union(
      v.literal("parent"),
      v.literal("child"),
      v.literal("sibling"),
      v.literal("spouse"),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("User must be logged in to update a relationship.");
    }

    const relationship = await ctx.db.get(args.relationshipId);
    if (!relationship) {
      throw new Error("Relationship not found.");
    }

    await ctx.db.patch(args.relationshipId, {
      relationshipType: args.relationshipType,
      updatedAt: Date.now(),
      updatedBy: identity.subject,
    });

    return args.relationshipId;
  },
});

// Delete a relationship
export const deleteRelationship = mutation({
  args: {
    relationshipId: v.id("relationships"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("User must be logged in to delete a relationship.");
    }

    await ctx.db.delete(args.relationshipId);

    return args.relationshipId;
  },
});
