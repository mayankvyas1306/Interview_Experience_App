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

  const [result, setResult] =
    useState<"Selected" | "Rejected" | "Pending">("Pending");

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

        {/* BASIC INFO */}
        <div className="row g-3">

          <div className="col-md-6">
            <label className="form-label text-muted2">Company Name</label>
            <input
              placeholder="Google, Amazon..."
              className="form-control bg-transparent text-light border-secondary"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label text-muted2">Role</label>
            <input
              placeholder="SDE Intern, Backend Engineer..."
              className="form-control bg-transparent text-light border-secondary"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          {/* DIFFICULTY */}
          <div className="col-md-6">
            <label className="form-label text-muted2">Difficulty</label>

            <div className="d-flex gap-2">
              {["Easy", "Medium", "Hard"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    setDifficulty(level as "Easy" | "Medium" | "Hard")
                  }
                  className={`btn rounded-pill px-3 ${difficulty === level
                    ? "btn-accent"
                    : "btn-outline-light"
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* RESULT */}
          <div className="col-md-6">
            <label className="form-label text-muted2">Result</label>

            <div className="d-flex gap-2">
              {["Pending", "Selected", "Rejected"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() =>
                    setResult(
                      r as "Pending" | "Selected" | "Rejected",
                    )
                  }
                  className={`btn rounded-pill px-3 ${result === r
                    ? r === "Selected"
                      ? "btn-success"
                      : r === "Rejected"
                        ? "btn-danger"
                        : "btn-warning"
                    : "btn-outline-light"
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* ANONYMOUS */}
          <div className="col-12">
            <div
              className="glass rounded-3 p-3 d-flex justify-content-between align-items-center"
              style={{ cursor: "pointer" }}
              onClick={() => setIsAnonymous(!isAnonymous)}
            >
              <div>
                <div className="fw-semibold">Post Anonymously</div>
                <div className="text-muted2 small">
                  Hide your name and college publicly
                </div>
              </div>

              <div
                className={`badge ${isAnonymous ? "bg-primary" : "bg-secondary"
                  }`}
              >
                {isAnonymous ? "ON" : "OFF"}
              </div>
            </div>
          </div>

          {/* TAGS */}
          <div className="col-12">
            <label className="form-label text-muted2">Tags</label>

            <div className="d-flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="badge rounded-pill bg-primary"
                >
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
              placeholder="Type tag and press Enter"
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
          </div>
        </div>

        {/* ROUNDS */}
        <div className="mt-5">

          <div className="d-flex justify-content-between mb-3">
            <h4 className="fw-bold">Interview Rounds</h4>

            <button
              onClick={addRound}
              className="btn btn-outline-light"
            >
              + Add Round
            </button>
          </div>

          {rounds.map((round, rIndex) => (
            <div key={rIndex} className="glass p-3 rounded-4 mb-3">

              <div className="d-flex gap-2">

                <input
                  placeholder="Round name (OA, Technical...)"
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
                  className="btn btn-danger"
                  disabled={rounds.length === 1}
                >
                  🗑
                </button>

              </div>

              <textarea
                placeholder="Describe this round..."
                className="form-control bg-transparent text-light border-secondary mt-2"
                value={round.description}
                onChange={(e) =>
                  updateRoundField(
                    rIndex,
                    "description",
                    e.target.value,
                  )
                }
              />

              {round.questions.map((q, qIndex) => (
                <div key={qIndex} className="d-flex gap-2 mt-2">

                  <input
                    placeholder="Interview question..."
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
                    className="btn btn-outline-danger"
                    onClick={() =>
                      removeQuestion(rIndex, qIndex)
                    }
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
          ))}
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