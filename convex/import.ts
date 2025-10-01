import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Interface for parsed application data
interface ParsedApplication {
  company: string;
  title: string;
  link?: string;
  notes?: string;
  status?: string;
}

// Column mapping interface
interface ColumnMapping {
  company?: number;
  title?: number;
  status?: number;
  link?: number;
  date?: number;
  notes?: number;
}

// Function to detect column headers and map them to our fields
function detectColumns(headerRow: string): ColumnMapping {
  const columns = headerRow.toLowerCase().split("\t");
  const mapping: ColumnMapping = {};

  columns.forEach((col, index) => {
    const normalizedCol = col.trim().toLowerCase();

    // Map various possible column names to our fields
    if (
      normalizedCol.includes("company") ||
      normalizedCol.includes("employer")
    ) {
      mapping.company = index;
    } else if (
      normalizedCol.includes("role") ||
      normalizedCol.includes("position") ||
      normalizedCol.includes("title") ||
      normalizedCol.includes("job")
    ) {
      mapping.title = index;
    } else if (
      normalizedCol.includes("status") ||
      normalizedCol.includes("state")
    ) {
      mapping.status = index;
    } else if (
      normalizedCol.includes("link") ||
      normalizedCol.includes("url") ||
      normalizedCol.includes("dashboard")
    ) {
      mapping.link = index;
    } else if (
      normalizedCol.includes("date") ||
      normalizedCol.includes("applied")
    ) {
      mapping.date = index;
    } else if (
      normalizedCol.includes("note") ||
      normalizedCol.includes("comment") ||
      normalizedCol.includes("remark")
    ) {
      mapping.notes = index;
    }
  });

  return mapping;
}

// Function to normalize status values
function normalizeStatus(status: string): string {
  if (!status) return "interested";

  const normalized = status.toLowerCase().trim();

  // Map various status formats to our standard statuses
  if (normalized.includes("submitted") || normalized.includes("applied")) {
    return "applied";
  } else if (normalized.includes("rejected")) {
    return "rejected";
  } else if (normalized.includes("test") || normalized.includes("assessment")) {
    return "assessment";
  } else if (normalized.includes("interview")) {
    return "interviewed";
  } else if (normalized.includes("offer")) {
    return "offered";
  } else if (normalized.includes("cancel")) {
    return "archived";
  }

  return "interested";
}

// Function to check if a string is a URL
function isUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

// Main parsing function
function parseApplicationData(data: string): ParsedApplication[] {
  const lines = data.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("Data must contain at least a header row and one data row");
  }

  // Detect column mapping from header row
  const columnMapping = detectColumns(lines[0]);

  // Validate that we have at least company and title columns
  if (
    columnMapping.company === undefined ||
    columnMapping.title === undefined
  ) {
    throw new Error(
      "Could not detect Company and Role/Title columns. Please ensure your data has these columns.",
    );
  }

  const applications: ParsedApplication[] = [];

  // Parse each data row
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].trim();
    if (!row) continue; // Skip empty rows

    const columns = row.split("\t");

    // Extract basic required fields
    const company = columns[columnMapping.company]?.trim();
    const title = columns[columnMapping.title]?.trim();

    if (!company || !title) {
      console.warn(`Skipping row ${i + 1}: missing company or title`);
      continue;
    }

    // Extract optional fields
    const status =
      columnMapping.status !== undefined
        ? columns[columnMapping.status]?.trim()
        : undefined;
    const link =
      columnMapping.link !== undefined
        ? columns[columnMapping.link]?.trim()
        : undefined;
    const notes =
      columnMapping.notes !== undefined
        ? columns[columnMapping.notes]?.trim()
        : undefined;
    const date =
      columnMapping.date !== undefined
        ? columns[columnMapping.date]?.trim()
        : undefined;

    // Determine if link is a job posting or dashboard link
    let jobLink: string | undefined;

    if (link && isUrl(link)) {
      // If it looks like a dashboard URL (contains common dashboard keywords)
      if (
        link.includes("dashboard") ||
        link.includes("profile") ||
        link.includes("candidate") ||
        link.includes("applicant") ||
        link.includes("myworkday") ||
        link.includes("oraclecloud") ||
        link.includes("workday") ||
        link.includes("userHome")
      ) {
      } else {
        jobLink = link;
      }
    }

    // Build notes from available information
    let combinedNotes = "";
    if (date) {
      combinedNotes += `Applied: ${date}`;
    }
    if (notes && notes !== date) {
      if (combinedNotes) combinedNotes += " | ";
      combinedNotes += notes;
    }

    applications.push({
      company,
      title,
      link: jobLink,
      notes: combinedNotes || undefined,
      status: normalizeStatus(status || ""),
    });
  }

  return applications;
}

export const importFromText = action({
  args: { data: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Client is not authenticated!");
    }

    // Validate input length
    if (args.data.length > 100000) {
      throw new Error(
        "Input text is too long. Please limit to 100,000 characters.",
      );
    }

    if (args.data.trim().length === 0) {
      throw new Error("No text provided to parse.");
    }

    try {
      // Parse the data using our custom parser
      const parsedApplications = parseApplicationData(args.data);

      console.log("Parsed applications:", parsedApplications.length);

      if (parsedApplications.length > 0) {
        const validStatuses = [
          "interested",
          "applied",
          "assessment",
          "interviewed",
          "offered",
          "rejected",
          "archived",
        ] as const;

        // Filter out applications with missing required fields and validate status
        const validApplications = parsedApplications.filter((application) => {
          return (
            application.company &&
            application.company.trim().length > 0 &&
            application.title &&
            application.title.trim().length > 0
          );
        });

        const applicationsToInsert = validApplications.map((application) => {
          const status = validStatuses.includes(application.status as any)
            ? (application.status as (typeof validStatuses)[number])
            : "interested";

          return {
            company: application.company.trim(),
            title: application.title.trim(),
            link: application.link ?? undefined,
            notes: application.notes ?? undefined,
            status,
          };
        });

        // Call the mutation to insert data
        await ctx.runMutation(internal.applications.insertApplications, {
          applications: applicationsToInsert,
          userId: userId,
        });

        console.log(
          `Successfully imported ${applicationsToInsert.length} applications`,
        );
      }

      return {
        success: true,
        importedCount: parsedApplications.length,
      };
    } catch (error) {
      console.error("Parsing error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown parsing error",
      };
    }
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
