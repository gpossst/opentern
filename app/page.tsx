"use client";

import { useConvexAuth, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import {
  Check,
  ClipboardPaste,
  Lightbulb,
  TextAlignJustify,
} from "lucide-react";
import { z } from "zod";
import ImportModal from "@/components/ImportModal";
import ApplicationList from "@/components/ApplicationList";

export default function Home() {
  const [showingList, setShowingList] = useState(false);
  return (
    <>
      <main className="p-8 flex flex-col gap-8">
        <ImportModal />
        <ListView />
        <div className="absolute top-4 right-4 flex flex-col items-center gap-2">
          <SignOutButton />
          <ViewToggle
            showingList={showingList}
            setShowingList={setShowingList}
          />
        </div>
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
          className="btn btn-sm btn-primary"
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

function ListView() {
  const { isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="mx-auto">
        <p>loading... (consider a loading skeleton)</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 mx-auto">
      <ApplicationInput />
      <ApplicationList />
    </div>
  );
}

function ApplicationInput() {
  const [hovered, setHovered] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createApplication = useMutation(api.applications.createApplication);

  const [formInfo, setFormInfo] = useState<z.infer<typeof formInfoSchema>>({
    company: "",
    title: "",
    link: "",
  });

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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      setFormInfo({ ...formInfo, link: text });
    });
  };

  return (
    <div className="flex flex-col max-w-4xl bg-neutral rounded-md p-2">
      <div className="flex gap-2 w-full">
        <label
          className={`input  transition-all duration-300 ${hovered === "company" ? "flex-[5]" : "flex-1"}`}
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
          className={`input transition-all duration-300 ${hovered === "title" ? "flex-[5]" : "flex-1"}`}
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
          className={`input transition-all duration-300 ${hovered === "link" ? "flex-[5]" : "flex-1"}`}
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
  );
}

function ViewToggle({
  showingList,
  setShowingList,
}: {
  showingList: boolean;
  setShowingList: (showingList: boolean) => void;
}) {
  return (
    <div className="flex flex-row items-center gap-2">
      <button
        className={`btn btn-primary btn-square ${showingList ? "" : "btn-soft"}`}
        onClick={() => setShowingList(true)}
      >
        <TextAlignJustify className="w-4 h-4" />
      </button>
      <button
        className={`btn btn-primary btn-square ${showingList ? "btn-soft" : ""}`}
        onClick={() => setShowingList(false)}
      >
        <Lightbulb className="w-4 h-4" />
      </button>
    </div>
  );
}
