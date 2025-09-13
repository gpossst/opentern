import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

export const importFromFile = action({
  args: { file: v.bytes() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.create({
      model: "gpt-5-nano",
      input: args.file.toString(),
    });

    // return a value
    return "success";
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
