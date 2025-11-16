import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    role: v.union(v.literal("candidate"), v.literal("interviewer")),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  interviews: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
  })
    .index("by_candidate_id", ["candidateId"])
    .index("by_stream_call_id", ["streamCallId"]),

  comments: defineTable({
    content: v.string(),
    rating: v.number(),
    interviewerId: v.string(),
    interviewId: v.id("interviews"),
  }).index("by_interview_id", ["interviewId"]),

  problems: defineTable({
    title: v.string(),
    description: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    category: v.optional(v.string()), // e.g., "arrays", "strings", "dynamic-programming"
    tags: v.optional(v.array(v.string())),
    examples: v.array(
      v.object({
        input: v.string(),
        output: v.string(),
        explanation: v.optional(v.string()),
      })
    ),
    starterCode: v.object({
      javascript: v.string(),
      python: v.string(),
      java: v.string(),
    }),
    constraints: v.optional(v.array(v.string())),
    hints: v.optional(v.array(v.string())), // AI-generated hints
    createdBy: v.string(), // clerkId of creator
    isAIGenerated: v.boolean(),
    aiPrompt: v.optional(v.string()), // Store the prompt used to generate
    createdAt: v.number(),
  })
    .index("by_creator", ["createdBy"])
    .index("by_difficulty", ["difficulty"])
    .index("by_category", ["category"]),

  interviewProblems: defineTable({
    interviewId: v.id("interviews"),
    problemId: v.id("problems"),
    order: v.number(), // Order in which problems appear
    assignedAt: v.number(),
  })
    .index("by_interview", ["interviewId"])
    .index("by_problem", ["problemId"]),
});
