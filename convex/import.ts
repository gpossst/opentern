import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import { z } from "zod";
import Groq from "groq-sdk";
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

    // Validate input length to prevent token limit issues
    if (args.data.length > 50000) {
      throw new Error(
        "Input text is too long. Please limit to 50,000 characters.",
      );
    }

    if (args.data.trim().length === 0) {
      throw new Error("No text provided to parse.");
    }

    try {
      // Initialize Groq client
      const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });

      const prompt = `You are a job application parser. Extract job applications from the following text and return ONLY valid JSON.

INSTRUCTIONS:
1. Look for company names and job titles
2. Extract any URLs, status information, or notes
3. Return ONLY the JSON object, no other text
4. If no applications found, return: {"applications": []}

EXAMPLES of what to extract:
- "Google - Software Engineer" → {"company": "Google", "title": "Software Engineer"}
- "Applied to Meta for Product Manager role" → {"company": "Meta", "title": "Product Manager", "status": "applied"}
- "Amazon AWS Solutions Architect - https://amazon.com/job" → {"company": "Amazon", "title": "AWS Solutions Architect", "link": "https://amazon.com/job"}

REQUIRED JSON FORMAT (return exactly this structure):
{
  "applications": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "link": "URL if available or null",
      "notes": "Additional notes if any or null",
      "status": "Application status if mentioned or null",
      "dashboardLink": "Dashboard URL if available or null"
    }
  ]
}

Text to parse:
${args.data}

Return ONLY the JSON object:`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a JSON parser. Always return valid JSON only. Do not include any explanatory text or markdown formatting.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "openai/gpt-oss-20b",
        temperature: 0,
        reasoning_effort: "low",
        response_format: { type: "json_object" },
      });

      const responseContent = chatCompletion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error("No response content received from Groq");
      }

      console.log("Raw Groq response:", responseContent);

      // Clean up the response content - remove any markdown formatting
      let cleanedContent = responseContent.trim();

      // Remove markdown code blocks if present
      if (cleanedContent.startsWith("```json")) {
        cleanedContent = cleanedContent
          .replace(/^```json\s*/, "")
          .replace(/\s*```$/, "");
      } else if (cleanedContent.startsWith("```")) {
        cleanedContent = cleanedContent
          .replace(/^```\s*/, "")
          .replace(/\s*```$/, "");
      }

      // Parse the JSON response
      let object;
      try {
        object = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error("Failed to parse JSON response:");
        console.error("Original response:", responseContent);
        console.error("Cleaned response:", cleanedContent);
        console.error("Parse error:", parseError);

        // Try to extract JSON from the response if it's embedded in text
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            object = JSON.parse(jsonMatch[0]);
            console.log("Successfully extracted JSON from embedded text");
          } catch (secondParseError) {
            console.error("Failed to parse extracted JSON:", secondParseError);
            throw new Error(
              `Invalid JSON response from Groq. Raw response: ${responseContent.substring(0, 500)}...`,
            );
          }
        } else {
          throw new Error(
            `Invalid JSON response from Groq. Raw response: ${responseContent.substring(0, 500)}...`,
          );
        }
      }

      // Validate the response against our schema
      const validatedObject = ApplicationsResponseSchema.parse(object);

      console.log("Parsed applications:", validatedObject.applications.length);
      console.log("Raw object:", validatedObject);

      if (validatedObject.applications.length > 0) {
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
        const validApplications = validatedObject.applications.filter(
          (application) => {
            return (
              application.company &&
              typeof application.company === "string" &&
              application.company.trim().length > 0 &&
              application.title &&
              typeof application.title === "string" &&
              application.title.trim().length > 0
            );
          },
        );

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
      console.error("AI generation error:", error);
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
