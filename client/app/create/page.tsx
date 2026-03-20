"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Round = {
  roundName: string;
  description: string;
  questions: string[];
};

const TAGS = [
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

  const [result, setResult] = useState<"Selected" | "Rejected" | "Waiting">("Waiting");

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [isAnonymous, setIsAnonymous] = useState(false);

  const [rounds, setRounds] = useState<Round[]>([
    { roundName: "OA", description: "", questions: [""] },
  ]);

  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      toast.error("Please login first");
      router.push("/auth/login");
    }
  }, [user, router]);

  // ---------------- TAGS ----------------

  const addTag = (tag: string) => {
    const clean = tag.trim();
    if (!clean || tags.includes(clean)) return;

    setTags((prev) => [...prev, clean]);
    setTagInput("");
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

  const addQuestion = (roundIndex: number) => {
    setRounds((prev) => {
      const copy = [...prev];
      copy[roundIndex].questions.push("");
      return copy;
    });
  };

  const removeQuestion = (roundIndex: number, qIndex: number) => {
    setRounds((prev) => {
      const copy = [...prev];
      copy[roundIndex].questions =
        copy[roundIndex].questions.filter((_, i) => i !== qIndex);
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
        difficulty,
        result,
        tags,
        rounds: cleanedRounds,
        isAnonymous,
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

      <motion.div
        className="glass glow-border p-4 rounded-4 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="fw-bold">Share Interview Experience ✨</h2>
        <p className="text-muted2 mb-0">
          Help others prepare by sharing your interview journey.
        </p>
      </motion.div>

      <div className="glass rounded-4 p-4">

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

          <div className="col-md-6">
            <label className="form-label text-muted2">Difficulty</label>
            <select
              className="form-select bg-transparent text-light border-secondary"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
            >
              <option value="Easy" className="bg-dark text-light">Easy</option>
              <option value="Medium" className="bg-dark text-light">Medium</option>
              <option value="Hard" className="bg-dark text-light">Hard</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label text-muted2">Result</label>
            <select
              className="form-select bg-transparent text-light border-secondary"
              value={result}
              onChange={(e) => setResult(e.target.value as "Selected" | "Rejected" | "Waiting")}
            >
              <option value="Selected" className="bg-dark text-light">Selected</option>
              <option value="Rejected" className="bg-dark text-light">Rejected</option>
              <option value="Waiting" className="bg-dark text-light">Waiting</option>
            </select>
          </div>

          {/* TAGS */}
          <div className="col-12">
            <label className="form-label text-muted2">Tags</label>

            <div className="d-flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span key={tag} className="badge rounded-pill bg-primary">
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="btn btn-sm text-light p-0 ms-2"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <input
              className="form-control bg-transparent text-light border-secondary"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(tagInput);
                }
              }}
            />

            {/* ✅ ADDED AI TAG SUGGESTION BUTTON */}
            <button
              type="button"
              onClick={async () => {
                if (!companyName.trim() && !role.trim()) {
                  toast.error("Enter company name and role first");
                  return;
                }
                try {
                  const res = await api.post("/ai/suggest-tags", {
                    companyName,
                    role,
                    rounds,
                  });
                  const suggested = res.data.tags.filter(
                    (t: string) => !tags.includes(t)
                  );
                  if (suggested.length === 0) {
                    toast("No new tags to suggest", { icon: "ℹ️" });
                  } else {
                    setTags((prev) => [...prev, ...suggested]);
                    toast.success(`Added ${suggested.length} suggested tags ✨`);
                  }
                } catch {
                  toast.error("Failed to suggest tags");
                }
              }}
              className="btn btn-sm btn-outline-secondary rounded-3 mt-2"
            >
              ✨ Suggest Tags with AI
            </button>

          </div>
        </div>

        {/* INTERVIEW ROUNDS SECTION */}
        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">Interview Rounds</h4>
            <button
              onClick={addRound}
              className="btn btn-sm btn-accent rounded-pill px-3 shadow-sm"
              style={{ fontWeight: "600" }}
            >
              <i className="bi bi-plus-lg me-1"></i> Add Round
            </button>
          </div>

          <div className="d-flex flex-column gap-4">
            {rounds.map((round, rIndex) => (
              <div key={rIndex} className="p-4 border border-secondary rounded-4 position-relative" style={{ background: "rgba(255,255,255,0.02)" }}>
                {rounds.length > 1 && (
                  <button
                    onClick={() => removeRound(rIndex)}
                    className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-3 rounded-circle"
                    style={{ width: "32px", height: "32px", padding: 0 }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                )}

                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label text-muted2 small">Round Name</label>
                    <input
                      className="form-control bg-transparent text-light border-secondary"
                      placeholder="e.g. Online Assessment"
                      value={round.roundName}
                      onChange={(e) => updateRoundField(rIndex, "roundName", e.target.value)}
                    />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label text-muted2 small">Description (Optional)</label>
                    <textarea
                      className="form-control bg-transparent text-light border-secondary"
                      placeholder="What was this round about?"
                      rows={2}
                      value={round.description}
                      onChange={(e) => updateRoundField(rIndex, "description", e.target.value)}
                    />
                  </div>
                </div>

                {/* QUESTIONS */}
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label text-muted2 small mb-0">Questions Asked</label>
                    <button
                      onClick={() => addQuestion(rIndex)}
                      className="btn btn-sm btn-accent rounded-pill px-3 shadow-sm"
                      style={{ fontSize: "0.8rem", fontWeight: "600" }}
                    >
                      <i className="bi bi-plus-circle me-1"></i> Add Question
                    </button>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {round.questions.map((q, qIndex) => (
                      <div key={qIndex} className="d-flex gap-2">
                        <textarea
                          className="form-control bg-transparent text-light border-secondary"
                          placeholder="e.g. Write a function to reverse a linked list..."
                          rows={2}
                          value={q}
                          onChange={(e) => updateQuestion(rIndex, qIndex, e.target.value)}
                          style={{ minHeight: "60px", resize: "vertical" }}
                        />
                        {round.questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(rIndex, qIndex)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ANONYMOUS TOGGLE */}
        <div className="mt-4 form-check form-switch d-flex align-items-center gap-2">
          <input
            className="form-check-input bg-transparent border-secondary"
            type="checkbox"
            id="anonymousSwitch"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            style={{ width: "40px", cursor: "pointer" }}
          />
          <label className="form-check-label text-light mb-0" htmlFor="anonymousSwitch" style={{ cursor: "pointer" }}>
            Post Anonymously
            <span className="text-muted2 ms-2 small fw-normal">
              (Your name, college, and year will be hidden)
            </span>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn btn-accent w-100 mt-4"
        >
          {loading ? "Publishing..." : "Publish Experience"}
        </button>

      </div>
    </div>
  );
}