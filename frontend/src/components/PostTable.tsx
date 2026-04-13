import { useState } from "react";
import { Post, PostStatus } from "../types";

interface PostTableProps {
  posts: Post[];
  adminId: string;
  onStatusChange: (postId: string, status: PostStatus) => void;
  onAssign: (postId: string, staffId: string) => void;
  onDelete: (postId: string) => void;
}

const ALL_STATUSES: PostStatus[] = [
  "open", "in_review", "in_progress", "resolved", "closed", "rejected"
];

const STATUS_COLORS: Record<PostStatus, string> = {
  open:        "#534AB7",
  in_review:   "#BA7517",
  in_progress: "#185FA5",
  resolved:    "#0F6E56",
  closed:      "#444441",
  rejected:    "#A32D2D",
};

type SortKey = "createdAt" | "status" | "priority" | "upvotes";

export default function PostTable({ posts, onStatusChange, onDelete }: PostTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterStatus, setFilterStatus] = useState<PostStatus | "">("");
  const [filterCategory, setFilterCategory] = useState("");
  const [search, setSearch] = useState("");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setAortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(false); }
  };

  // Prevent typo — fix the function name
  const setAortAsc = setSortAsc;

  const filtered = posts
    .filter((p) => !filterStatus || p.status === filterStatus)
    .filter((p) => !filterCategory || p.category === filterCategory)
    .filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let va: any, vb: any;
      if (sortKey === "createdAt") { va = new Date(a.createdAt).getTime(); vb = new Date(b.createdAt).getTime(); }
      else if (sortKey === "upvotes") { va = a.upvotes; vb = b.upvotes; }
      else if (sortKey === "status") { va = a.status; vb = b.status; }
      else { va = a.priority; vb = b.priority; }
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const categories = Array.from(new Set(posts.map((p) => p.category)));

  const thStyle = (key: SortKey): React.CSSProperties => ({
    padding: "10px 12px",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-secondary)",
    borderBottom: "0.5px solid var(--color-border-secondary)",
    cursor: "pointer",
    whiteSpace: "nowrap",
    userSelect: "none",
    background: sortKey === key ? "var(--color-background-secondary)" : "transparent",
  });

  return (
    <div>
      {/* Filters row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
          style={{ flex: 1, minWidth: 160, padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", fontSize: 13 }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as PostStatus | "")}
          style={{ padding: "8px 10px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", fontSize: 13, color: "var(--color-text-primary)" }}
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: "8px 10px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", fontSize: 13, color: "var(--color-text-primary)" }}
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 10 }}>
        {filtered.length} of {posts.length} posts
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", border: "0.5px solid var(--color-border-secondary)", borderRadius: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...thStyle("createdAt"), minWidth: 220 }} onClick={() => toggleSort("createdAt")}>
                Title {sortKey === "createdAt" ? (sortAsc ? "↑" : "↓") : ""}
              </th>
              <th style={thStyle("status")} onClick={() => toggleSort("status")}>
                Status {sortKey === "status" ? (sortAsc ? "↑" : "↓") : ""}
              </th>
              <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-secondary)" }}>
                Category
              </th>
              <th style={thStyle("priority")} onClick={() => toggleSort("priority")}>
                Priority {sortKey === "priority" ? (sortAsc ? "↑" : "↓") : ""}
              </th>
              <th style={thStyle("upvotes")} onClick={() => toggleSort("upvotes")}>
                Votes {sortKey === "upvotes" ? (sortAsc ? "↑" : "↓") : ""}
              </th>
              <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-secondary)" }}>
                Change status
              </th>
              <th style={{ padding: "10px 12px", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-secondary)" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "32px", textAlign: "center", fontSize: 13, color: "var(--color-text-secondary)" }}>
                  No posts match the current filters
                </td>
              </tr>
            ) : (
              filtered.map((post, idx) => (
                <tr key={post.postId} style={{ background: idx % 2 === 0 ? "transparent" : "var(--color-background-secondary)" }}>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 2 }}>
                      {post.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
                      {new Date(post.createdAt).toLocaleDateString("en-IN")}
                      {post.isAnonymous ? " · anonymous" : ""}
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 4, background: STATUS_COLORS[post.status] + "18", color: STATUS_COLORS[post.status] }}>
                      {post.status.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                    {post.category}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--color-text-secondary)", textTransform: "capitalize" }}>
                    {post.priority}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "var(--color-text-secondary)" }}>
                    ▲{post.upvotes} ▼{post.downvotes}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <select
                      value={post.status}
                      onChange={(e) => onStatusChange(post.postId, e.target.value as PostStatus)}
                      style={{ padding: "5px 8px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)", fontSize: 12, color: "var(--color-text-primary)" }}
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <button
                      onClick={() => { if (confirm("Delete this post?")) onDelete(post.postId); }}
                      style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "0.5px solid #F7C1C1", background: "#FCEBEB", color: "#791F1F", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}