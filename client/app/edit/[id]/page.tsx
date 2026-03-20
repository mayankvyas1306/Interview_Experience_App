"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import TagInput from "@/components/TagInput";
import type { Difficulty, Result } from "@/constants/options";

type Round = {
  roundName: string;
  description: string;
  questions: string[];
};

export default function EditPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [result, setResult] = useState<Result>("Waiting");
  const [tags, setTags] = useState<string[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // ── Load existing post data ───────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/posts/${postId}`);
        const p = res.data.post;

        if (!user || user.id !== p.authorId?._id) {
          toast.error("Only the author can edit this post");
          router.push(`/post/${postId}`);
          return;
        }

        setCompanyName(p.companyName || "");
        setRole(p.role || "");
        setDifficulty(p.difficulty || "Medium");
        setResult(p.result || "Waiting");
        setTags(p.tags || []);         // ← now an array, not comma-separated string
        setRounds(p.rounds || []);
        setIsAnonymous(p.isAnonymous || false);
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to load post"));
        router.push("/explore");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [postId, router, user]);

  // ── Rounds management ────────────────────────────────────────────────────
  const addRound = () => {
    setRounds((prev) => [
      ...prev,
      { roundName: `Round ${prev.length + 1}`, description: "", questions: [""] },
    ]);
  };

  const removeRound = (index: number) => {
    setRounds((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRoundField = (
    index: number,
    field: "roundName" | "description",
    value: string
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
      copy[roundIndex].questions = copy[roundIndex].questions.filter(
        (_, i) => i !== qIndex
      );
      return copy;
    });
  };

  const updateQuestion = (roundIndex: number, qIndex: number, value: string) => {
    setRounds((prev) => {
      const copy = [...prev];
      copy[roundIndex].questions[qIndex] = value;
      return copy;
    });
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!companyName.trim() || !role.trim()) {
      toast.error("Company name and role are required");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/posts/${postId}`, {
        companyName,
        role,
        difficulty,
        result,
        tags,            // ← send array directly, not comma-separated string
        rounds,
        isAnonymous,
      });

      toast.success("Post updated ✅");
      router.push(`/post/${postId}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update post"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-light" role="status" />
        <p className="text-muted2 mt-3">Loading post...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="glass rounded-4 p-4">
        <h2 className="fw-bold mb-4">Edit Post</h2>

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
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            >
              <option value="Easy" className="bg-dark">Easy</option>
              <option value="Medium" className="bg-dark">Medium</option>
              <option value="Hard" className="bg-dark">Hard</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label text-muted2">Result</label>
            <select
              className="form-select bg-transparent text-light border-secondary"
              value={result}
              onChange={(e) => setResult(e.target.value as Result)}
            >
              <option value="Selected" className="bg-dark">Selected</option>
              <option value="Rejected" className="bg-dark">Rejected</option>
              <option value="Waiting" className="bg-dark">Waiting</option>
            </select>
          </div>

          {/* Tags — now using same TagInput as create page */}
          <div className="col-12">
            <label className="form-label text-muted2">Tags</label>
            <TagInput tags={tags} onChange={setTags} />
          </div>
        </div>

        {/* Interview Rounds */}
        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">Interview Rounds</h4>
            <button
              onClick={addRound}
              className="btn btn-sm btn-accent rounded-pill px-3"
            >
              <i className="bi bi-plus-lg me-1" />
              Add Round
            </button>
          </div>

          <div className="d-flex flex-column gap-4">
            {rounds.map((round, rIndex) => (
              <div
                key={rIndex}
                className="p-4 border border-secondary rounded-4 position-relative"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                {rounds.length > 1 && (
                  <button
                    onClick={() => removeRound(rIndex)}
                    className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-3 rounded-circle"
                    style={{ width: 32, height: 32, padding: 0 }}
                    aria-label="Remove round"
                  >
                    <i className="bi bi-trash" />
                  </button>
                )}

                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label text-muted2 small">Round Name</label>
                    <input
                      className="form-control bg-transparent text-light border-secondary"
                      placeholder="e.g. Online Assessment"
                      value={round.roundName}
                      onChange={(e) =>
                        updateRoundField(rIndex, "roundName", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label text-muted2 small">
                      Description (Optional)
                    </label>
                    <textarea
                      className="form-control bg-transparent text-light border-secondary"
                      placeholder="What was this round about?"
                      rows={2}
                      value={round.description}
                      onChange={(e) =>
                        updateRoundField(rIndex, "description", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label text-muted2 small mb-0">
                      Questions Asked
                    </label>
                    <button
                      onClick={() => addQuestion(rIndex)}
                      className="btn btn-sm btn-accent rounded-pill px-3"
                      style={{ fontSize: "0.8rem" }}
                    >
                      <i className="bi bi-plus-circle me-1" />
                      Add Question
                    </button>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {round.questions?.map((q, qIndex) => (
                      <div key={qIndex} className="d-flex gap-2">
                        <textarea
                          className="form-control bg-transparent text-light border-secondary"
                          placeholder="e.g. Write a function to reverse a linked list..."
                          rows={2}
                          value={q}
                          onChange={(e) =>
                            updateQuestion(rIndex, qIndex, e.target.value)
                          }
                          style={{ minHeight: 60, resize: "vertical" }}
                        />
                        {round.questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(rIndex, qIndex)}
                            className="btn btn-sm btn-outline-danger"
                            aria-label="Remove question"
                          >
                            <i className="bi bi-trash" />
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

        {/* Anonymous toggle */}
        <div className="mt-4 form-check form-switch d-flex align-items-center gap-2">
          <input
            className="form-check-input bg-transparent border-secondary"
            type="checkbox"
            id="anonymousSwitch"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            style={{ width: 40, cursor: "pointer" }}
          />
          <label
            className="form-check-label text-light mb-0"
            htmlFor="anonymousSwitch"
            style={{ cursor: "pointer" }}
          >
            Post Anonymously
            <span className="text-muted2 ms-2 small fw-normal">
              (Your name, college, and year will be hidden)
            </span>
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-accent mt-4 px-5"
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}