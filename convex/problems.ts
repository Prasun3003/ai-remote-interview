import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

interface ProblemData {
  title: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  constraints: string[];
  starterCode: {
    javascript: string;
    python: string;
    java: string;
  };
  hints: string[];
}

// Generate a coding problem using AI (OpenAI)
export const generateProblem = mutation({
  args: {
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    category: v.optional(v.string()),
    topic: v.optional(v.string()), // Specific topic like "binary search", "two pointers", etc.
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Check if user is interviewer
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "interviewer") {
      throw new Error("Only interviewers can generate problems");
    }

    // Get OpenAI API key from environment
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Construct the prompt
    const prompt = `Generate a ${args.difficulty} level coding problem${args.topic ? ` about ${args.topic}` : ''}${args.category ? ` in the ${args.category} category` : ''}. The problem should be challenging but solvable within 30-45 minutes.`;

    try {
      // Call the OpenAI API directly in the mutation
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-1106",
          messages: [
            {
              role: "system",
              content: `You are an expert coding interview problem generator. 
                Generate a ${args.difficulty} level coding problem${args.topic ? ` about ${args.topic}` : ''}${args.category ? ` in the ${args.category} category` : ''}.
                The problem should be solvable in 30-45 minutes.
                Format the response as a valid JSON object with these exact keys:
                {
                  "title": "string",
                  "description": "string",
                  "examples": [{"input": "string", "output": "string", "explanation": "string"}],
                  "constraints": ["string"],
                  "starterCode": {
                    "javascript": "string",
                    "python": "string",
                    "java": "string"
                  },
                  "hints": ["string"]
                }`
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
      }

      const data = await response.json();
      const problemData = JSON.parse(data.choices[0].message.content);

      // Save the problem to database
      const problemId: Id<"problems"> = await ctx.db.insert("problems", {
        title: problemData.title,
        description: problemData.description,
        difficulty: args.difficulty,
        category: args.category || undefined,
        tags: args.topic ? [args.topic] : undefined,
        examples: problemData.examples,
        starterCode: problemData.starterCode,
        constraints: problemData.constraints || [],
        hints: problemData.hints || [],
        createdBy: identity.subject,
        isAIGenerated: true,
        aiPrompt: prompt,
        createdAt: Date.now(),
      });

      return await ctx.db.get(problemId);
    } catch (error) {
      console.error("Error generating problem:", error);
      throw new Error(`Failed to generate problem: ${error}`);
    }
  },
});

// Get all problems
export const getAllProblems = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const problems = await ctx.db.query("problems").order("desc").collect();
    return problems;
  },
});

// Get problems by creator
export const getMyProblems = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const problems = await ctx.db
      .query("problems")
      .withIndex("by_creator", (q) => q.eq("createdBy", identity.subject))
      .order("desc")
      .collect();

    return problems;
  },
});

// Get problems by difficulty
export const getProblemsByDifficulty = query({
  args: {
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const problems = await ctx.db
      .query("problems")
      .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty))
      .collect();

    return problems;
  },
});

// Get problems for an interview
export const getInterviewProblems = query({
  args: {
    interviewId: v.id("interviews"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const interviewProblems = await ctx.db
      .query("interviewProblems")
      .withIndex("by_interview", (q) => q.eq("interviewId", args.interviewId))
      .order("asc")
      .collect();

    const problems = await Promise.all(
      interviewProblems.map(async (ip) => {
        const problem = await ctx.db.get(ip.problemId);
        return {
          ...problem,
          order: ip.order,
        };
      })
    );

    return problems;
  },
});

// Create a custom problem (not AI-generated)
export const createCustomProblem = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    category: v.optional(v.string()),
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
    hints: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Check if user is interviewer
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "interviewer") {
      throw new Error("Only interviewers can create problems");
    }

    return await ctx.db.insert("problems", {
      ...args,
      createdBy: identity.subject,
      isAIGenerated: false,
      createdAt: Date.now(),
    });
  },
});

// Delete a problem
export const deleteProblem = mutation({
  args: {
    problemId: v.id("problems"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const problem = await ctx.db.get(args.problemId);
    if (!problem) throw new Error("Problem not found");

    // Check if user is the creator
    if (problem.createdBy !== identity.subject) {
      throw new Error("You can only delete your own problems");
    }

    await ctx.db.delete(args.problemId);
    return { success: true };
  },
});

// Get a single problem by ID
export const getProblemById = query({
  args: {
    problemId: v.id("problems"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.get(args.problemId);
  },
});

