"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { api } from "@/lib/api";

type Round = {
  roundName: string;
  description: string;
  questions: string[];
};

const AVAILABLE_TAGS = ["DSA", "DBMS", "OS", "CN", "OOP", "System Design", "Aptitude"];

export default function CreatePage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");

  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [result, setResult] = useState<"Selected" | "Rejected" | "Waiting">("Waiting");

  const [tags, setTags] = useState<string[]>([]);
  const [rounds, setRounds] = useState<Round[]>([
    { roundName: "OA", description: "", questions: [""] },
  ]);

  const [loading, setLoading] = useState(false);

  // ✅ Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      router.push("/auth/login");
    }
  }, []);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // ✅ Add new round
  const addRound = () => {
    setRounds((prev) => [
      ...prev,
      { roundName: `Round ${prev.length + 1}`, description: "", questions: [""] },
    ]);
  };

  // ✅ Remove round
  const removeRound = (index: number) => {
    setRounds((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Update round field
  const updateRoundField = (index: number, field: "roundName" | "description", value: string) => {
    setRounds((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // ✅ Add question inside a round
  const addQuestion = (roundIndex: number) => {
    setRounds((prev) => {
      const copy = [...prev];
      copy[roundIndex].questions.push("");
      return [...copy];
    });
  };

  // ✅ Remove question inside a round
  const removeQuestion = (roundIndex: number, qIndex: number) => {
    setRounds((prev) => {
      const copy = [...prev];
      copy[roundIndex].questions = copy[roundIndex].questions.filter((_, i) => i !== qIndex);
      return [...copy];
    });
  };

  // ✅ Update question text
  const updateQuestion = (roundIndex: number, qIndex: number, value: string) => {
    setRounds((prev) => {
      const copy = [...prev];
      copy[roundIndex].questions[qIndex] = value;
      return [...copy];
    });
  };

  const handleSubmit = async () => {
    if (!companyName.trim() || !role.trim()) {
      toast.error("Company name and role are required");
      return;
    }

    // ✅ Clean rounds (remove empty questions)
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

      // redirect to post details
      setTimeout(() => {
        router.push(`/post/${res.data.post._id}`);
      }, 800);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <Toaster position="top-right" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="glass glow-border p-4 p-md-5 rounded-4 mb-4"
      >
        <h2 className="fw-bold mb-1">Share Interview Experience ✨</h2>
        <p className="text-muted2 mb-0">
          Create a structured post with rounds, questions, and tags to help others prepare smarter.
        </p>
      </motion.div>

      <div className="row g-4">
        {/* LEFT: Main form */}
        <div className="col-lg-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="glass rounded-4 p-4"
          >
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted2">Company Name</label>
                <input
                  className="form-control bg-transparent text-light border-secondary"
                  placeholder="Amazon"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted2">Role</label>
                <input
                  className="form-control bg-transparent text-light border-secondary"
                  placeholder="SDE Intern"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted2">Difficulty</label>
                <select
                  className="form-select bg-transparent text-light border-secondary"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted2">Result</label>
                <select
                  className="form-select bg-transparent text-light border-secondary"
                  value={result}
                  onChange={(e) => setResult(e.target.value as any)}
                >
                  <option value="Waiting">Waiting</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label text-muted2">Tags</label>
                <div className="d-flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map((tag) => {
                    const active = tags.includes(tag);

                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`btn btn-sm rounded-pill ${
                          active ? "btn-accent" : "btn-outline-light"
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Rounds */}
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h4 className="fw-bold mb-0">Rounds</h4>
                <button
                  type="button"
                  onClick={addRound}
                  className="btn btn-outline-light rounded-3"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Round
                </button>
              </div>

              <div className="mt-3 d-flex flex-column gap-3">
                {rounds.map((round, roundIndex) => (
                  <motion.div
                    key={roundIndex}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="glass rounded-4 p-3"
                  >
                    <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                      <div className="flex-grow-1">
                        <label className="form-label text-muted2">
                          Round Name
                        </label>
                        <input
                          className="form-control bg-transparent text-light border-secondary"
                          value={round.roundName}
                          onChange={(e) =>
                            updateRoundField(roundIndex, "roundName", e.target.value)
                          }
                          placeholder="Tech Round 1"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeRound(roundIndex)}
                        className="btn btn-outline-danger rounded-3 mt-4"
                        disabled={rounds.length === 1}
                        title="Remove round"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>

                    <div className="mt-3">
                      <label className="form-label text-muted2">Description</label>
                      <textarea
                        className="form-control bg-transparent text-light border-secondary"
                        rows={2}
                        value={round.description}
                        onChange={(e) =>
                          updateRoundField(roundIndex, "description", e.target.value)
                        }
                        placeholder="Explain what happened in this round..."
                      />
                    </div>

                    <div className="mt-3">
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <label className="form-label text-muted2 mb-0">
                          Questions
                        </label>
                        <button
                          type="button"
                          onClick={() => addQuestion(roundIndex)}
                          className="btn btn-sm btn-outline-light rounded-3"
                        >
                          <i className="bi bi-plus-lg me-2"></i>
                          Add Question
                        </button>
                      </div>

                      <div className="mt-2 d-flex flex-column gap-2">
                        {round.questions.map((q, qIndex) => (
                          <div key={qIndex} className="d-flex gap-2">
                            <input
                              className="form-control bg-transparent text-light border-secondary"
                              value={q}
                              onChange={(e) =>
                                updateQuestion(roundIndex, qIndex, e.target.value)
                              }
                              placeholder="e.g. Explain deadlock and prevention"
                            />
                            <button
                              type="button"
                              onClick={() => removeQuestion(roundIndex, qIndex)}
                              className="btn btn-outline-danger rounded-3"
                              disabled={round.questions.length === 1}
                              title="Remove question"
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="btn btn-accent w-100 py-2 rounded-3 mt-4"
            >
              {loading ? "Publishing..." : "Publish Experience"}
            </button>
          </motion.div>
        </div>

        {/* RIGHT: Preview panel */}
        <div className="col-lg-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="glass rounded-4 p-4"
          >
            <h5 className="fw-bold mb-3">
              Live Preview <span className="text-muted2">(mini)</span>
            </h5>

            <div className="glass rounded-4 p-3">
              <div className="fw-semibold">{companyName || "Company"}</div>
              <div className="text-muted2 small mt-1">
                <i className="bi bi-briefcase me-2"></i>
                {role || "Role"}
              </div>

              <div className="d-flex gap-2 flex-wrap mt-2">
                <span className="badge bg-secondary rounded-pill">{difficulty}</span>
                <span className="badge bg-secondary rounded-pill">{result}</span>
              </div>

              <div className="d-flex gap-2 flex-wrap mt-2">
                {tags.length === 0 ? (
                  <span className="text-muted2 small">No tags selected</span>
                ) : (
                  tags.slice(0, 6).map((t) => (
                    <span
                      key={t}
                      className="badge rounded-pill"
                      style={{
                        background: "rgba(109,94,249,0.18)",
                        border: "1px solid rgba(109,94,249,0.35)",
                      }}
                    >
                      #{t}
                    </span>
                  ))
                )}
              </div>

              <div className="text-muted2 small mt-3">
                Rounds: <span className="text-light">{rounds.length}</span>
              </div>
            </div>

            <div className="text-muted2 small mt-3">
              Tip: Keep your rounds structured and mention actual topics asked.
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
