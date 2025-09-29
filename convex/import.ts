import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import { z } from "zod";
import { generateObject, NoObjectGeneratedError } from "ai";
import { groq } from "@ai-sdk/groq";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

const ApplicationsResponseSchema = z.object({
  applications: z
    .array(
      z.object({
        company: z.string().min(1).describe("The company name"),
        title: z.string().min(1).describe("The job title or position"),
        link: z
          .string()
          .optional()
          .nullable()
          .describe("Job posting URL if available"),
        notes: z
          .string()
          .optional()
          .nullable()
          .describe("Additional notes about the application"),
        status: z
          .string()
          .optional()
          .nullable()
          .describe("Application status if mentioned"),
        dashboardLink: z
          .string()
          .optional()
          .nullable()
          .describe("Dashboard URL if available"),
      }),
    )
    .describe("Array of job applications found in the text"),
});

export const importFromText = action({
  args: { data: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Client is not authenticated!");
    }

    try {
      const { object } = await generateObject({
        model: groq("openai/gpt-oss-20b"),
        schema: ApplicationsResponseSchema,
        providerOptions: {
          groq: {
            reasoningEffort: "low",
            structuredOutputs: true,
          },
        },
        prompt: `Extract ALL job applications from the following text. Look for company names, job titles, application links, notes, and status information. If no applications are found, return an empty array.

IMPORTANT: 
- Every application MUST have a valid company name and job title
- Process the ENTIRE text, not just the beginning
- Return ALL applications found, not just the first 20
- If the text is very long, make sure to scan through all of it

Text to parse:
${args.data}

Return the applications in the specified JSON format.`,
      });

      if (object.applications.length > 0) {
        const validStatuses = [
          "interested",
          "applied",
          "assessment",
          "interviewed",
          "offered",
          "rejected",
          "archived",
        ] as const;

        // Filter out applications with missing required fields
        const validApplications = object.applications.filter((application) => {
          return (
            application.company &&
            typeof application.company === "string" &&
            application.company.trim().length > 0 &&
            application.title &&
            typeof application.title === "string" &&
            application.title.trim().length > 0
          );
        });

        const applicationsToInsert = validApplications.map((application) => {
          const status =
            application.status &&
            validStatuses.includes(application.status as any)
              ? (application.status as (typeof validStatuses)[number])
              : "interested";

          return {
            company: application.company.trim(),
            title: application.title.trim(),
            link: application.link ?? undefined,
            notes: application.notes ?? undefined,
            status,
            dashboardLink: application.dashboardLink ?? undefined,
          };
        });

        // Call the mutation to insert data
        await ctx.runMutation(internal.applications.insertApplications, {
          applications: applicationsToInsert,
          userId: userId,
        });
      }

      return { success: true };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        console.error("No object generated error:", error.cause);
      } else {
        console.error("AI generation error:", error);
      }
      return {
        success: false,
      };
    }
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
