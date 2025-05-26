import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  people: defineTable({
    name: v.string(),
    portraitImageId: v.optional(v.id("_storage")),
    userId: v.string(),
  }).index("by_userId", ["userId"]),

  relationships: defineTable({
    person1Id: v.id("people"),
    person2Id: v.id("people"),
    type: v.string(), // e.g., "friend", "colleague", "family"
    userId: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_person1Id", ["person1Id"])
    .index("by_person2Id", ["person2Id"]),
});
