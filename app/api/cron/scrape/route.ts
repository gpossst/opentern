import { Octokit } from "octokit";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

type Repo = {
  owner: string;
  repo: string;
  path: string;
};

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

export async function GET(request: Request) {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  // Process vanshb03 repo
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

  let vanshContent = vanshFileData.content;
  if (!vanshContent && vanshFileData.download_url) {
    const response = await fetch(vanshFileData.download_url);
    vanshContent = await response.text();
  } else if (vanshContent && vanshFileData.encoding === "base64") {
    vanshContent = Buffer.from(vanshContent, "base64").toString("utf-8");
  }

  const vanshParsedData = parseVansh(vanshContent);

  // Process SimplifyJobs repo
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

  let simplifyContent = simplifyFileData.content;
  if (!simplifyContent && simplifyFileData.download_url) {
    const response = await fetch(simplifyFileData.download_url);
    simplifyContent = await response.text();
  } else if (simplifyContent && simplifyFileData.encoding === "base64") {
    simplifyContent = Buffer.from(simplifyContent, "base64").toString("utf-8");
  }

  const simplifyParsedData = parseSimplify(simplifyContent);

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  // Add vanshb03 opportunities
  await convex.mutation(api.opportunities.addOpportunities, {
    opportunities: vanshParsedData.internships.map((internship) => ({
      company: internship.company,
      title: internship.title,
      location: internship.location,
      applicationLink: internship.applicationLink,
      createdAt: internship.createdAt,
    })),
    source: vanshRepo.owner,
  });

  // Add SimplifyJobs opportunities
  await convex.mutation(api.opportunities.addOpportunities, {
    opportunities: simplifyParsedData.internships.map((internship) => ({
      company: internship.company,
      title: internship.title,
      location: internship.location,
      applicationLink: internship.applicationLink,
      createdAt: internship.createdAt,
    })),
    source: simplifyRepo.owner,
  });

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

// Function to remove emojis from text
function removeEmojis(text: string): string {
  // Unicode ranges for emojis
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F0F5}]|[\u{1F200}-\u{1F2FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F251}]/gu;
  return text.replace(emojiRegex, "").trim();
}

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

  // Parse HTML table rows - handle both 5-column and 6-column table structures
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
      createdAt < Date.now() - 14 * 24 * 60 * 60 * 1000
    ) {
      continue;
    }

    // Handle continuation symbol ↳
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

      // Detect section headers
      if (line.startsWith("### ") && line.includes("Internship Roles")) {
        currentSection = line
          .replace("### ", "")
          .replace(" Internship Roles", "");
        continue;
      }

      // Detect markdown table rows
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
    let createdAt = Date.now() - 180 * 24 * 60 * 60 * 1000; // Default to current time

    // Parse date in format like "0d", "2w", "1mo", etc.
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
      createdAt < Date.now() - 14 * 24 * 60 * 60 * 1000
    ) {
      continue;
    }

    // Handle continuation symbol ↳
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
