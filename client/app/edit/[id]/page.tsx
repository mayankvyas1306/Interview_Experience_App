"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

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
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [result, setResult] = useState<"Selected" | "Rejected" | "Waiting">("Waiting");
  const [tagsInput, setTagsInput] = useState("");
  const [rounds, setRounds] = useState<Round[]>([]);

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
        setTagsInput((p.tags || []).join(", "));
        setRounds(p.rounds || []);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load post");
        router.push("/explore");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [postId, router, user]);

  const handleSave = async () => {
    if (!companyName.trim() || !role.trim()) {
      toast.error("Company name and role are required");
      return;
    }

    try {
      setSaving(true);

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await api.put(`/posts/${postId}`, {
        companyName,
        role,
        difficulty,
        result,
        tags,
        rounds,
      });

      toast.success("Post updated");
      router.push(`/post/${postId}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-light" role="status"></div>
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
              onChange={(e) => setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
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
              onChange={(e) => setResult(e.target.value as "Selected" | "Rejected" | "Waiting")}
            >
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
              <option value="Waiting">Waiting</option>
            </select>
          </div>

          <div className="col-12">
            <label className="form-label text-muted2">Tags (comma separated)</label>
            <input
              className="form-control bg-transparent text-light border-secondary"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn btn-accent mt-4">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
