"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

type Round = {
  roundName: string;
  description: string;
  questions: string[];
};

const AVAILABLE_TAGS = [
  "DSA",
  "DBMS",
  "OS",
  "CN",
  "OOP",
  "System Design",
  "Aptitude",
];

export default function CreatePage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");

  const [difficulty, setDifficulty] =
    useState<"Easy" | "Medium" | "Hard">("Medium");
  const [result, setResult] =
    useState<"Selected" | "Rejected" | "Waiting">("Waiting");

  // ✅ TAG STATE
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [rounds, setRounds] = useState<Round[]>([
    { roundName: "OA", description: "", questions: [""] },
  ]);

  const [loading, setLoading] = useState(false);

  // 🔐 Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      router.push("/auth/login");
    }
  }, []);

  // ---------------- TAG LOGIC ----------------

  const filteredSuggestions = AVAILABLE_TAGS.filter(
    (t) =>
      t.toLowerCase().includes(tagInput.toLowerCase()) &&
      !tags.includes(t),
  );

  const addTag = (tag: string) => {
    const clean = tag.trim();
    if (!clean || tags.includes(clean)) return;

    setTags((prev) => [...prev, clean]);
    setTagInput("");
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  // ---------------- ROUNDS ----------------

  const addRound = () => {
    setRounds((prev) => [
      ...prev,
      {
        roundName: `Round ${prev.length + 1}`,
        description: "",
        questions: [""],
      },
    ]);
  };

  const removeRound = (index: number) => {
    setRounds((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRoundField = (
    index: number,
    field: "roundName" | "description",
    value: string,
  ) => {
    setRounds((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // ✅ FIX: ONLY ONE QUESTION PER CLICK
  const addQuestion = (roundIndex: number) => {
    setRounds((prev) => {
      const copy = [...prev];
      copy[roundIndex] = {
        ...copy[roundIndex],
        questions: [...copy[roundIndex].questions, ""],
      };
      return copy;
    });
  };

  const removeQuestion = (roundIndex: number, qIndex: number) => {
    setRounds((prev) => {
      const copy = [...prev];
      copy[roundIndex].questions = copy[roundIndex].questions.filter(
        (_, i) => i !== qIndex,
      );
      return copy;
    });
  };

  const updateQuestion = (
    roundIndex: number,
    qIndex: number,
    value: string,
  ) => {
    setRounds((prev) => {
      const copy = [...prev];
      copy[roundIndex].questions[qIndex] = value;
      return copy;
    });
  };

  // ---------------- SUBMIT ----------------

  const handleSubmit = async () => {
    if (!companyName.trim() || !role.trim()) {
      toast.error("Company name and role are required");
      return;
    }

    const cleanedRounds = rounds
      .map((r) => ({
        ...r,
        questions: r.questions.filter((q) => q.trim() !== ""),
      }))
      .filter((r) => r.roundName.trim() !== "");

    try {
      setLoading(true);

      const res = await api.post("/posts", {
        companyName,
        role,
        tags,
        difficulty,
        result,
        rounds: cleanedRounds,
      });

      toast.success("Post created ✅");
      router.push(`/post/${res.data.post._id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------

  return (
    <div className="container py-5">
      
      {/* HEADER */}
      <motion.div className="glass glow-border p-4 p-md-5 rounded-4 mb-4">
        <h2 className="fw-bold mb-1">Share Interview Experience ✨</h2>
        <p className="text-muted2 mb-0">
          Create a structured post with rounds, questions, and tags.
        </p>
      </motion.div>

      <div className="row g-4">
        <div className="col-lg-8">
          <motion.div className="glass rounded-4 p-4">
            {/* BASIC INFO */}
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted2">Company Name</label>
                <input
                  className="form-control bg-transparent text-light border-secondary"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted2">Role</label>
                <input
                  className="form-control bg-transparent text-light border-secondary"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>

              {/* TAGS */}
<div className="col-12">
  <label className="form-label text-muted2">Tags</label>

  {/* Selected tags */}
  <div className="d-flex flex-wrap gap-2 mb-2">
    {tags.map((tag) => (
      <span
        key={tag}
        className="badge rounded-pill d-flex align-items-center gap-2"
        style={{
          background: "rgba(109,94,249,0.25)",
          border: "1px solid rgba(109,94,249,0.45)",
        }}
      >
        #{tag}
        <button
          type="button"
          onClick={() => removeTag(tag)}
          className="btn btn-sm text-light p-0"
        >
          ✕
        </button>
      </span>
    ))}
  </div>

  {/* Input + Suggestions */}
  <div className="position-relative">
    <input
      className="form-control bg-transparent text-light border-secondary"
      placeholder="Type a tag (e.g. DSA) and press Enter"
      value={tagInput}
      onChange={(e) => {
        setTagInput(e.target.value);
        setShowSuggestions(true);
      }}
      onFocus={() => setShowSuggestions(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addTag(tagInput);
        }
      }}
    />

    {/* Suggestions dropdown */}
    {showSuggestions && tagInput && filteredSuggestions.length > 0 && (
      <div
        className="position-absolute w-100 mt-2 rounded-3"
        style={{
          zIndex: 1000,
          background: "rgba(20, 24, 40, 0.98)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(12px)",
          maxHeight: 180,
          overflowY: "auto",
        }}
      >
        {filteredSuggestions.map((tag) => (
          <div
            key={tag}
            className="px-3 py-2"
            style={{
              cursor: "pointer",
            }}
            onMouseDown={() => addTag(tag)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "rgba(255,255,255,0.08)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            #{tag}
          </div>
        ))}
      </div>
    )}
  </div>
</div>

            </div>

            {/* ROUNDS */}
            <div className="mt-4">
              <div className="d-flex justify-content-between">
                <h4 className="fw-bold">Rounds</h4>
                <button
                  onClick={addRound}
                  className="btn btn-outline-light rounded-3"
                >
                  + Add Round
                </button>
              </div>

              <div className="mt-3 d-flex flex-column gap-3">
                {rounds.map((round, rIndex) => (
                  <div key={rIndex} className="glass rounded-4 p-3">
                    <div className="d-flex gap-2">
                      <input
                        className="form-control bg-transparent text-light border-secondary"
                        value={round.roundName}
                        onChange={(e) =>
                          updateRoundField(
                            rIndex,
                            "roundName",
                            e.target.value,
                          )
                        }
                      />
                      <button
                        onClick={() => removeRound(rIndex)}
                        disabled={rounds.length === 1}
                        className="btn btn-outline-danger"
                      >
                        🗑
                      </button>
                    </div>

                    <div className="mt-2">
                      {round.questions.map((q, qIndex) => (
                        <div key={qIndex} className="d-flex gap-2 mt-2">
                          <input
                            className="form-control bg-transparent text-light border-secondary"
                            value={q}
                            onChange={(e) =>
                              updateQuestion(
                                rIndex,
                                qIndex,
                                e.target.value,
                              )
                            }
                          />
                          <button
                            onClick={() =>
                              removeQuestion(rIndex, qIndex)
                            }
                            disabled={round.questions.length === 1}
                            className="btn btn-outline-danger"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => addQuestion(rIndex)}
                        className="btn btn-sm btn-outline-light mt-2"
                      >
                        + Add Question
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-accent w-100 mt-4"
            >
              {loading ? "Publishing..." : "Publish Experience"}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
