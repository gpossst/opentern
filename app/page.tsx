"use client";

import { useConvexAuth, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ClipboardPaste } from "lucide-react";
import { z } from "zod";
import ImportModal from "@/components/ImportModal";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 p-4 border-b-2 flex flex-row justify-between items-center">
        Convex + Next.js + Convex Auth
        <SignOutButton />
      </header>
      <main className="p-8 flex flex-col gap-8">
        <ImportModal />
        <Content />
      </main>
    </>
  );
}

function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  return (
    <>
      {isAuthenticated && (
        <button
          className=""
          onClick={() =>
            void signOut().then(() => {
              router.push("/signin");
            })
          }
        >
          Sign out
        </button>
      )}
    </>
  );
}

const formInfoSchema = z.object({
  company: z.string(),
  title: z.string(),
  link: z.string().refine(
    (val) => {
      // If it already has a protocol, validate as-is
      if (val.startsWith("http://") || val.startsWith("https://")) {
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      }
      // If no protocol, add https:// and validate
      try {
        new URL(`https://${val}`);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: "Must be a valid URL (protocol optional)",
    },
  ),
});

function Content() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [hovered, setHovered] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createApplication = useMutation(api.applications.createApplication);

  const [formInfo, setFormInfo] = useState<z.infer<typeof formInfoSchema>>({
    company: "",
    title: "",
    link: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormInfo({ ...formInfo, [e.target.name]: e.target.value });
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      setFormInfo({ ...formInfo, link: text });
    });
  };

  const handleSubmit = async () => {
    let parsed;
    setError(null);

    try {
      parsed = formInfoSchema.parse(formInfo);
    } catch (error) {
      setError("Invalid form info");
      return;
    }

    await createApplication({
      ...parsed,
    });
    setError(null);
    setFormInfo({
      company: "",
      title: "",
      link: "",
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto">
        <p>loading... (consider a loading skeleton)</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 mx-auto">
      <div className="flex flex-col max-w-4xl bg-neutral rounded-md p-2">
        <div className="flex gap-2 w-full">
          <label
            className={`input  transition-all duration-300 ${hovered === "company" ? "flex-[4]" : "flex-1"}`}
            onFocus={() => setHovered("company")}
            onBlur={() => setHovered("")}
          >
            <span className="label">Company</span>
            <input
              type="text"
              name="company"
              placeholder=""
              value={formInfo.company}
              onChange={handleChange}
            />
          </label>
          <label
            className={`input transition-all duration-300 ${hovered === "title" ? "flex-[4]" : "flex-1"}`}
            onFocus={() => setHovered("title")}
            onBlur={() => setHovered("")}
          >
            <span className="label">Title</span>
            <input
              type="text"
              name="title"
              placeholder=""
              value={formInfo.title}
              onChange={handleChange}
            />
          </label>
          <label
            className={`input transition-all duration-300 ${hovered === "link" ? "flex-[4]" : "flex-1"}`}
            onFocus={() => setHovered("link")}
            onBlur={() => setHovered("")}
          >
            <span className="label">Link</span>
            <input
              type="text"
              name="link"
              placeholder=""
              value={formInfo.link}
              onChange={handleChange}
            />
            <button className="btn btn-square h-6 w-6" onClick={handlePaste}>
              <ClipboardPaste className="w-4 h-4" />
            </button>
          </label>
          <button
            className="btn btn-primary btn-square btn-soft"
            onClick={handleSubmit}
          >
            <Check className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
