import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.

export const relationshipTypes = v.union(
  v.literal("father"),
  v.literal("mother"),
  v.literal("olderSibling"),
);

export default defineSchema({
  people: defineTable({
    nicknameTh: v.optional(v.string()),
    nicknameEn: v.optional(v.string()),
    prenameTh: v.optional(v.string()),
    prenameEn: v.optional(v.string()),
    givenNameTh: v.optional(v.string()),
    givenNameEn: v.optional(v.string()),
    familyNameTh: v.optional(v.string()),
    familyNameEn: v.optional(v.string()),
    portraitImageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(),
    updatedBy: v.string(),
  }).index("by_fullname", ["givenNameTh", "familyNameTh"]),

  relationships: defineTable({
    person1Id: v.id("people"),
    person2Id: v.id("people"),
    relationshipType: relationshipTypes,
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(),
    updatedBy: v.string(),
  })
    .index("by_person1Id", ["person1Id"])
    .index("by_person2Id", ["person2Id"]),
});
