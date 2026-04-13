import { useState, useEffect } from "react";
import { Post, PostStatus } from "../types";
import PostTable from "./PostTable";

interface AdminDashboardProps {
  adminId: string;
}

interface Stats {
  totalPosts: number;
  byStatus: Record<PostStatus, number>;
  totalUsers: number;
  resolvedThisWeek: number;
}

const STAT_CARDS = [
  { key: "totalPosts",        label: "Total posts",         color: "#534AB7", bg: "#EEEDFE" },
  { key: "totalUsers",        label: "Registered users",    color: "#0F6E56", bg: "#E1F5EE" },
  { key: "resolvedThisWeek",  label: "Resolved this week",  color: "#185FA5", bg: "#E6F1FB" },
  { key: "open",              label: "Open posts",          color: "#854F0B", bg: "#FAEEDA" },
];

export default function AdminDashboard({ adminId }: AdminDashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "posts">("overview");

  useEffect(() => {
    Promise.all([fetchStats(), fetchPosts()]).finally(() => setLoading(false));
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/admin/stats");
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch {}
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/admin/posts");
      const data = await res.json();
      if (data.success) setPosts(data.data);
    } catch {}
  };

  const handleStatusChange = async (postId: string, status: PostStatus) => {
    try {
      const res = await fetch(`http://localhost:3000/api/admin/${postId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminId }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.map((p) => p.postId === postId ? { ...p, status } : p));
        fetchStats(); // refresh counts
      }
    } catch {}
  };

  const handleAssign = async (postId: string, staffId: string) => {
    try {
      await fetch(`http://localhost:3000/api/admin/${postId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, adminId }),
      });
      fetchPosts();
    } catch {}
  };

  const handleDelete = async (postId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/admin/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.postId !== postId));
        fetchStats();
      }
    } catch {}
  };

  const getStatValue = (key: string): number => {
    if (!stats) return 0;
    if (key === "open") return stats.byStatus?.open ?? 0;
    return (stats as any)[key] ?? 0;
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>Admin dashboard</h2>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>
          Manage all posts, assign staff, and track resolution progress
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        {(["overview", "posts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 16px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: activeTab === tab ? 500 : 400,
              color: activeTab === tab ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              borderBottom: activeTab === tab ? "2px solid #534AB7" : "2px solid transparent",
              marginBottom: -1,
              textTransform: "capitalize",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: 80, borderRadius: 10, background: "var(--color-background-secondary)" }} />
          ))}
        </div>
      ) : activeTab === "overview" ? (
        <>
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 32 }}>
            {STAT_CARDS.map((card) => (
              <div key={card.key} style={{ padding: "16px 18px", borderRadius: 10, background: card.bg, border: `0.5px solid ${card.color}30` }}>
                <div style={{ fontSize: 28, fontWeight: 500, color: card.color, lineHeight: 1 }}>
                  {getStatValue(card.key)}
                </div>
                <div style={{ fontSize: 12, color: card.color, marginTop: 6, opacity: 0.85 }}>
                  {card.label}
                </div>
              </div>
            ))}
          </div>

          {/* Status breakdown */}
          {stats && (
            <div style={{ border: "0.5px solid var(--color-border-secondary)", borderRadius: 10, padding: "18px 20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 500, margin: "0 0 14px" }}>Posts by status</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Object.entries(stats.byStatus).map(([status, count]) => {
                  const total = stats.totalPosts || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={status}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                        <span style={{ color: "var(--color-text-secondary)", textTransform: "capitalize" }}>
                          {status.replace("_", " ")}
                        </span>
                        <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div style={{ height: 6, background: "var(--color-background-secondary)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "#534AB7", borderRadius: 3, transition: "width 0.4s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Posts tab */
        <PostTable
          posts={posts}
          adminId={adminId}
          onStatusChange={handleStatusChange}
          onAssign={handleAssign}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}