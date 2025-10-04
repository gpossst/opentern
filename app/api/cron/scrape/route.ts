import { Octokit } from "octokit";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

/**
 * GitHub Repository Scraping API Route
 *
 * This cron job scrapes internship opportunities from GitHub repositories
 * that maintain lists of summer internship opportunities. It processes
 * both HTML table and markdown table formats to extract job postings.
 *
 * Sources:
 * - vanshb03/Summer2026-Internships: Community-maintained internship list
 * - SimplifyJobs/Summer2026-Internships: SimplifyJobs internship database
 *
 * The route fetches README.md files from these repositories, parses the
 * content to extract internship data, and stores it in the Convex database.
 */

/**
 * Repository configuration interface
 * Defines the structure for GitHub repository information
 */
type Repo = {
  owner: string; // GitHub username/organization
  repo: string; // Repository name
  path: string; // File path to scrape (typically README.md)
};

/**
 * List of repositories to scrape for internship opportunities
 * Each repository contains structured data about available internships
 */
const repos: Repo[] = [
  {
    owner: "vanshb03",
    repo: "Summer2026-Internships",
    path: "README.md",
  },
  {
    owner: "SimplifyJobs",
    repo: "Summer2026-Internships",
    path: "README.md",
  },
];

/**
 * Main GET handler for the scraping cron job
 *
 * This function:
 * 1. Authenticates with GitHub API
 * 2. Fetches README content from each repository
 * 3. Parses the content to extract internship data
 * 4. Stores the parsed data in Convex database
 *
 * @param request - HTTP request object
 * @returns JSON response with scraping results
 */
export async function GET(request: Request) {
  // Initialize GitHub API client with authentication token
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  // Process vanshb03 repository
  const vanshRepo = repos[0];
  const { data: vanshFileData } = await octokit.request(
    `GET /repos/${vanshRepo.owner}/${vanshRepo.repo}/contents/${vanshRepo.path}`,
    {
      owner: vanshRepo.owner,
      repo: vanshRepo.repo,
      path: vanshRepo.path,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  // Decode file content (handle base64 encoding)
  let vanshContent = vanshFileData.content;
  if (!vanshContent && vanshFileData.download_url) {
    // If content is not available, fetch from download URL
    const response = await fetch(vanshFileData.download_url);
    vanshContent = await response.text();
  } else if (vanshContent && vanshFileData.encoding === "base64") {
    // Decode base64 encoded content
    vanshContent = Buffer.from(vanshContent, "base64").toString("utf-8");
  }

  // Parse the content to extract internship data
  const vanshParsedData = parseVansh(vanshContent);

  // Process SimplifyJobs repository
  const simplifyRepo = repos[1];
  const { data: simplifyFileData } = await octokit.request(
    `GET /repos/${simplifyRepo.owner}/${simplifyRepo.repo}/contents/${simplifyRepo.path}`,
    {
      owner: simplifyRepo.owner,
      repo: simplifyRepo.repo,
      path: simplifyRepo.path,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  // Decode SimplifyJobs file content
  let simplifyContent = simplifyFileData.content;
  if (!simplifyContent && simplifyFileData.download_url) {
    const response = await fetch(simplifyFileData.download_url);
    simplifyContent = await response.text();
  } else if (simplifyContent && simplifyFileData.encoding === "base64") {
    simplifyContent = Buffer.from(simplifyContent, "base64").toString("utf-8");
  }

  // Parse SimplifyJobs content
  const simplifyParsedData = parseSimplify(simplifyContent);

  // Initialize Convex client for database operations
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  // Store vanshb03 opportunities in database
  await convex.mutation(api.opportunities.addOpportunities, {
    opportunities: vanshParsedData.internships.map((internship) => ({
      company: internship.company,
      title: internship.title,
      location: internship.location,
      applicationLink: internship.applicationLink,
      createdAt: internship.createdAt,
    })),
    source: vanshRepo.owner, // Use owner as source identifier
  });

  // Store SimplifyJobs opportunities in database
  await convex.mutation(api.opportunities.addOpportunities, {
    opportunities: simplifyParsedData.internships.map((internship) => ({
      company: internship.company,
      title: internship.title,
      location: internship.location,
      applicationLink: internship.applicationLink,
      createdAt: internship.createdAt,
    })),
    source: simplifyRepo.owner, // Use owner as source identifier
  });

  // Return scraping results for monitoring/debugging
  return Response.json({
    results: [
      {
        ...vanshFileData,
        content: vanshContent,
        parsedData: vanshParsedData,
      },
      {
        ...simplifyFileData,
        content: simplifyContent,
        parsedData: simplifyParsedData,
      },
    ],
  });
}

/**
 * Removes emojis from text content
 *
 * GitHub README files often contain emojis that need to be cleaned
 * from job titles and descriptions for better data processing.
 *
 * @param text - Input text that may contain emojis
 * @returns Cleaned text with emojis removed
 */
function removeEmojis(text: string): string {
  // Unicode ranges for various emoji categories
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F0F5}]|[\u{1F200}-\u{1F2FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F251}]/gu;
  return text.replace(emojiRegex, "").trim();
}

/**
 * Parses internship data from vanshb03 repository content
 *
 * This function handles the specific format used in the vanshb03 repository.
 * It supports both HTML table and markdown table formats, with special
 * handling for continuation symbols (↳) and date parsing.
 *
 * Features:
 * - HTML table parsing with regex
 * - Markdown table fallback parsing
 * - Continuation symbol handling for multi-row entries
 * - Date parsing from "Sep 24" format
 * - Filtering of old entries (>14 days)
 *
 * @param content - Raw README content from vanshb03 repository
 * @returns Parsed internship data with metadata
 */
function parseVansh(content: string) {
  const internships: any[] = [];
  let currentSection = "";

  // Split content into lines for section detection
  const lines = content.split("\n");

  // Find section headers first
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (
      trimmedLine.startsWith("### ") &&
      trimmedLine.includes("Internship Roles")
    ) {
      currentSection = trimmedLine
        .replace("### ", "")
        .replace(" Internship Roles", "");
      break;
    }
  }

  // Parse HTML table rows - handle 5-column table structure
  const tableRowRegex5 =
    /<tr>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<\/tr>/g;
  let lastCompany = "";

  // Try 5-column format first (SimplifyJobs format)
  let match;
  while ((match = tableRowRegex5.exec(content)) !== null) {
    const [, cell1, cell2, cell3, cell4, cell5] = match;
    const cells = [cell1, cell2, cell3, cell4, cell5];

    // For 5-column format: Company | Title | Location | Application Link | Date
    let company = "";
    let title = "";
    let location = "";
    let applicationLink = "";

    // Extract company from first cell (may have link or just text)
    const companyCell = cells[0];
    const companyLinkMatch = companyCell.match(
      /<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/,
    );
    if (companyLinkMatch) {
      // Company has a link - this is the application link
      applicationLink = companyLinkMatch[1];
      company = companyLinkMatch[2].trim();
    } else {
      // Company is just text
      company = companyCell.replace(/<[^>]*>/g, "").trim();
    }

    title = removeEmojis(cells[1].replace(/<[^>]*>/g, "").trim());
    location = cells[2].replace(/<[^>]*>/g, "").trim();

    // Check if 4th cell has application link (for vanshb03 format)
    if (!applicationLink) {
      const linkMatch = cells[3].match(/<a[^>]*href="([^"]*)"[^>]*>/);
      if (linkMatch) {
        applicationLink = linkMatch[1];
      }
    }

    const createdCell = cells[4];
    let createdAt = Date.now(); // Default to current time

    // Parse date in format "Sep 24" or similar
    const dateMatch = createdCell.match(/([A-Za-z]{3})\s+(\d{1,2})/);
    if (dateMatch) {
      const monthAbbr = dateMatch[1];
      const day = parseInt(dateMatch[2]);

      // Convert month abbreviation to month number
      const monthMap: { [key: string]: number } = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };

      const month = monthMap[monthAbbr];
      if (month !== undefined) {
        // Assume current year for the date
        const currentYear = new Date().getFullYear();
        const parsedDate = new Date(currentYear, month, day);
        createdAt = parsedDate.getTime();
      }
    }

    // Skip if it's a header row, empty, or no application link
    if (
      company.toLowerCase().includes("company") ||
      company.toLowerCase().includes("name") ||
      !company.trim() ||
      !title.trim() ||
      !applicationLink.trim() ||
      createdAt < Date.now() - 14 * 24 * 60 * 60 * 1000 // Skip entries older than 14 days
    ) {
      continue;
    }

    // Handle continuation symbol ↳ for multi-row entries
    let actualCompany = company.trim();
    if (actualCompany === "↳" && lastCompany) {
      actualCompany = lastCompany;
    } else if (actualCompany !== "↳") {
      lastCompany = actualCompany;
    }

    internships.push({
      company: actualCompany,
      title: title.trim(),
      location: location.replace(/<br\s*\/?>/gi, ", ").trim(),
      applicationLink: applicationLink.trim(),
      createdAt: createdAt,
    });
  }

  // If HTML parsing didn't work, fall back to markdown table parsing
  if (internships.length === 0) {
    let lastCompany = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect section headers in markdown format
      if (line.startsWith("### ") && line.includes("Internship Roles")) {
        currentSection = line
          .replace("### ", "")
          .replace(" Internship Roles", "");
        continue;
      }

      // Detect markdown table rows (lines starting with | and containing |)
      if (line.startsWith("|") && line.includes("|") && !line.includes("---")) {
        const cells = line
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell);

        if (cells.length >= 3) {
          let company = cells[0];
          const title = removeEmojis(cells[1]);
          const location = cells[2];
          let applicationLink = "";

          // Extract application link from HTML in the cells
          for (let j = 3; j < cells.length; j++) {
            const cell = cells[j];
            const linkMatch = cell.match(/<a[^>]*href="([^"]*)"[^>]*>/);
            if (linkMatch) {
              applicationLink = linkMatch[1];
            }
          }

          // Handle continuation symbol ↳
          if (company === "↳" && lastCompany) {
            company = lastCompany;
          } else if (company !== "↳") {
            lastCompany = company;
          }

          const createdCell = cells[4];
          let createdAt = Date.now(); // Default to current time

          // Parse date in format "Sep 24" or similar
          const dateMatch = createdCell.match(/([A-Za-z]{3})\s+(\d{1,2})/);
          if (dateMatch) {
            const monthAbbr = dateMatch[1];
            const day = parseInt(dateMatch[2]);

            // Convert month abbreviation to month number
            const monthMap: { [key: string]: number } = {
              Jan: 0,
              Feb: 1,
              Mar: 2,
              Apr: 3,
              May: 4,
              Jun: 5,
              Jul: 6,
              Aug: 7,
              Sep: 8,
              Oct: 9,
              Nov: 10,
              Dec: 11,
            };

            const month = monthMap[monthAbbr];
            if (month !== undefined) {
              // Assume current year for the date
              const currentYear = new Date().getFullYear();
              const parsedDate = new Date(currentYear, month, day);
              createdAt = parsedDate.getTime();
            }
          }

          // Skip if it's a header row, empty, or no application link
          if (
            company.toLowerCase().includes("company") ||
            company.toLowerCase().includes("name") ||
            !company.trim() ||
            !title.trim() ||
            !applicationLink.trim() ||
            createdAt < Date.now() - 14 * 24 * 60 * 60 * 1000
          ) {
            continue;
          }

          internships.push({
            company: company.replace(/\[|\]/g, ""),
            title: title.replace(/\[|\]/g, ""),
            location: location.replace(/\[|\]/g, ""),
            applicationLink: applicationLink,
            createdAt: createdAt,
          });
        }
      }
    }
  }

  return {
    totalInternships: internships.length,
    categories: [...new Set(internships.map((i) => i.category))],
    internships: internships,
  };
}

/**
 * Parses internship data from SimplifyJobs repository content
 *
 * This function handles the specific format used in the SimplifyJobs repository.
 * It focuses on HTML table parsing with special handling for relative dates
 * (e.g., "2d", "1w", "1mo") and "Apply" button links.
 *
 * Features:
 * - HTML table parsing with regex
 * - Relative date parsing ("2d", "1w", "1mo")
 * - "Apply" button link extraction
 * - Continuation symbol handling
 * - Filtering of old entries (>14 days)
 *
 * @param content - Raw README content from SimplifyJobs repository
 * @returns Parsed internship data with metadata
 */
function parseSimplify(content: string) {
  const internships: any[] = [];
  let currentSection = "";

  // Split content into lines for section detection
  const lines = content.split("\n");

  // Find section headers first
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (
      trimmedLine.startsWith("### ") &&
      trimmedLine.includes("Internship Roles")
    ) {
      currentSection = trimmedLine
        .replace("### ", "")
        .replace(" Internship Roles", "");
      break;
    }
  }

  // Parse HTML table rows - handle both 5-column and 6-column table structures
  const tableRowRegex5 =
    /<tr>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<\/tr>/g;
  const tableRowRegex6 =
    /<tr>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<\/tr>/g;

  let lastCompany = "";

  // Try 5-column format first (SimplifyJobs format)
  let match;
  while ((match = tableRowRegex5.exec(content)) !== null) {
    const [, cell1, cell2, cell3, cell4, cell5] = match;
    const cells = [cell1, cell2, cell3, cell4, cell5];

    // For 5-column format: Company | Title | Location | Application Link | Date
    let company = "";
    let title = "";
    let location = "";
    let applicationLink = "";

    // Extract company from first cell (may have link or just text)
    const companyCell = cells[0];
    const companyLinkMatch = companyCell.match(
      /<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/,
    );
    if (companyLinkMatch) {
      // Company has a link - extract company name only
      company = companyLinkMatch[2].trim();
    } else {
      // Company is just text
      company = companyCell.replace(/<[^>]*>/g, "").trim();
    }

    title = removeEmojis(cells[1].replace(/<[^>]*>/g, "").trim());
    location = cells[2].replace(/<[^>]*>/g, "").trim();

    // For Simplify format, prioritize the 4th cell for application link
    // Look for the "Apply" button link in the div
    const applyLinkMatch = cells[3].match(
      /<a[^>]*href="([^"]*)"[^>]*>.*?Apply.*?<\/a>/,
    );
    if (applyLinkMatch) {
      applicationLink = applyLinkMatch[1];
    } else {
      // Fallback: look for any link in the 4th cell
      const linkMatch = cells[0].match(/<a[^>]*href="([^"]*)"[^>]*>/);
      if (linkMatch) {
        applicationLink = linkMatch[1];
      }
    }

    const createdCell = cells[4];
    let createdAt = Date.now() - 180 * 24 * 60 * 60 * 1000; // Default to 6 months ago

    // Parse relative date in format like "0d", "2w", "1mo", etc.
    const relMatch = createdCell.match(/(\d+)\s*([a-zA-Z]+)/);
    if (relMatch) {
      const value = parseInt(relMatch[1]);
      const unit = relMatch[2].toLowerCase();
      let daysAgo = 0;

      if (unit === "d") {
        daysAgo = value;
      } else if (unit === "w") {
        daysAgo = value * 7;
      } else if (unit === "mo") {
        daysAgo = value * 30; // Approximate month as 30 days
      } else {
        // Default fallback for any other unit
        daysAgo = value * 30;
      }

      createdAt = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
    }

    // Skip if it's a header row, empty, or no application link
    if (
      company.toLowerCase().includes("company") ||
      company.toLowerCase().includes("name") ||
      !company.trim() ||
      !title.trim() ||
      !applicationLink.trim() ||
      createdAt < Date.now() - 14 * 24 * 60 * 60 * 1000 // Skip entries older than 14 days
    ) {
      continue;
    }

    // Handle continuation symbol ↳ for multi-row entries
    let actualCompany = company.trim();
    if (actualCompany === "↳" && lastCompany) {
      actualCompany = lastCompany;
    } else if (actualCompany !== "↳") {
      lastCompany = actualCompany;
    }

    internships.push({
      company: actualCompany,
      title: title.trim(),
      location: location.replace(/<br\s*\/?>/gi, ", ").trim(),
      applicationLink: applicationLink.trim(),
      createdAt: createdAt,
    });
  }

  return {
    totalInternships: internships.length,
    categories: [...new Set(internships.map((i) => i.category))],
    internships: internships,
  };
}
