import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.

export default defineSchema({
  people: defineTable({
    nameTh: v.string(),
    nameEn: v.string(),
    portraitImageId: v.optional(v.id("_storage")),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(),
    updatedBy: v.string(),
  }).index("by_userId", ["userId"]),

  relationships: defineTable({
    person1Id: v.id("people"),
    person2Id: v.id("people"),
    relationshipType: v.union(
      v.literal("parent"),
      v.literal("child"),
      v.literal("sibling"),
      v.literal("spouse"),
    ), // e.g., "friend", "colleague", "family"
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(),
    updatedBy: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_person1Id", ["person1Id"])
    .index("by_person2Id", ["person2Id"]),
});
