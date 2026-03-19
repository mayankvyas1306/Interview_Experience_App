"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import AIInsights from "@/components/AIInsights";

type Round = {
  roundName: string;
  description: string;
  questions: string[];
};

type PostDetails = {
  _id: string;
  companyName: string;
  role: string;
  tags: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  result: "Selected" | "Rejected" | "Waiting";
  upvotesCount: number;
  createdAt: string;
  rounds: Round[];
  isAnonymous: boolean;
  authorId?: {
    _id?: string;
    fullName?: string;
    college?: string;
    year?: number;
  } | null;
};

type Comment = {
  _id: string;
  text: string;
  createdAt: string;
  userId?: {
    _id?: string;
    fullName?: string;
    college?: string;
    year?: number;
  };
};

const DIFFICULTY_BADGE: Record<string, string> = {
  Easy: "success",
  Medium: "warning",
  Hard: "danger",
};

const RESULT_BADGE: Record<string, string> = {
  Selected: "success",
  Rejected: "danger",
  Waiting: "secondary",
};

export default function PostDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const { user } = useAuth();

  const [post, setPost] = useState<PostDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const [upvoting, setUpvoting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  const [isUpvoted, setIsUpvoted] = useState(false);

  const isOwner =
    !!user && !!post?.authorId && user.id === (post.authorId as any)._id;

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          api.get(`/posts/${postId}`),
          api.get(`/comments/${postId}`),
        ]);

        if (isMounted) {
          setPost(postRes.data.post);
          setComments(commentsRes.data.comments);
        }
      } catch (err: any) {
        if (isMounted) {
          toast.error(err?.response?.data?.message || "Failed to load post");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [postId]);

  useEffect(() => {
    if (!user) return;

    const checkStatus = async () => {
      try {
        const [saveRes, upvoteRes] = await Promise.all([
          api.get(`/users/save-status/${postId}`),
          api.get(`/posts/${postId}/upvote-status`),
        ]);

        setIsSaved(saveRes.data.saved);
        setIsUpvoted(upvoteRes.data.upvoted);
      } catch { }
    };

    checkStatus();
  }, [user, postId]);

  const handleUpvote = async () => {
    if (!user) {
      toast.error("Please login to upvote");
      router.push("/auth/login");
      return;
    }

    if (upvoting || !post) return;

    const prevCount = post.upvotesCount;
    const prevUpvoted = isUpvoted;

    setPost({
      ...post,
      upvotesCount: isUpvoted
        ? Math.max(0, post.upvotesCount - 1)
        : post.upvotesCount + 1,
    });

    setIsUpvoted(!isUpvoted);

    try {
      setUpvoting(true);

      const res = await api.patch(`/posts/${postId}/upvote`);

      setPost((prev) =>
        prev ? { ...prev, upvotesCount: res.data.upvotesCount } : prev
      );

      setIsUpvoted(res.data.upvoted);

      toast.success(res.data.message);
    } catch (err: any) {
      setPost((prev) =>
        prev ? { ...prev, upvotesCount: prevCount } : prev
      );

      setIsUpvoted(prevUpvoted);

      toast.error(err?.response?.data?.message || "Upvote failed");
    } finally {
      setUpvoting(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Please login to save posts");
      router.push("/auth/login");
      return;
    }

    if (saving) return;

    try {
      setSaving(true);

      const res = await api.patch(`/users/save/${postId}`);
      setIsSaved(res.data.saved);

      toast.success(res.data.message);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleReport = async () => {
    if (!user) {
      toast.error("Please login to report posts");
      router.push("/auth/login");
      return;
    }

    if (hasReported || reporting) return;

    const reason = prompt("Enter reason:");

    if (!reason) return;

    try {
      setReporting(true);
      await api.post(`/reports/${postId}`, { reason });
      setHasReported(true);
      toast.success("Report submitted");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed");
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return <div className="container py-5 text-center">Loading...</div>;
  }

  if (!post) {
    return <div className="container py-5 text-center">Not found</div>;
  }

  return (
    <div className="container py-5">
      <motion.div className="glass p-4 rounded-4">

        <h2>{post.companyName}</h2>

        {/* ROUNDS SECTION */}
        <motion.div>
          {post.rounds.map((round, idx) => (
            <div key={idx}>
              <h5>{round.roundName}</h5>
              <p>{round.description}</p>
            </div>
          ))}

          {/* ✅ ADDED AI INSIGHTS HERE */}
          <AIInsights postId={postId} />

        </motion.div>

      </motion.div>
    </div>
  );
}