"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users);
    } catch {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔁 BAN / UNBAN
  const toggleBan = async (id: string) => {
    try {
      await api.patch(`/admin/users/${id}/ban`);
      toast.success("User status updated");
      fetchUsers();
    } catch {
      toast.error("Failed");
    }
  };

  // 👑 PROMOTE / DEMOTE
  const toggleRole = async (id: string) => {
    try {
      await api.patch(`/admin/users/${id}/role`);
      toast.success("Role updated");
      fetchUsers();
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Manage Users</h2>

      <div className="glass rounded-4 p-4">
        <table className="table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>

                <td>
                  <span
                    className={`badge ${
                      u.role === "admin" ? "bg-danger" : "bg-secondary"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>

                <td>
                  {u.isBanned ? (
                    <span className="badge bg-danger">Banned</span>
                  ) : (
                    <span className="badge bg-success">Active</span>
                  )}
                </td>

                <td className="d-flex gap-2">

                  <button
                    onClick={() => toggleBan(u._id)}
                    className="btn btn-sm btn-outline-warning"
                  >
                    {u.isBanned ? "Unban" : "Ban"}
                  </button>

                  <button
                    onClick={() => toggleRole(u._id)}
                    className="btn btn-sm btn-outline-info"
                  >
                    {u.role === "admin"
                      ? "Demote"
                      : "Make Admin"}
                  </button>

                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
