import React, { useState, useEffect } from "react";
import "./App.css";

export default function UserManagement({ adminEmail }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`/api/users?email=${encodeURIComponent(adminEmail)}`)
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error);
  }, [adminEmail]);

  const reload = () =>
    fetch(`/api/users?email=${encodeURIComponent(adminEmail)}`)
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error);

  const action = (uid, path, opts) =>
    fetch(`/api/users/${uid}/${path}?email=${encodeURIComponent(adminEmail)}`, opts)
      .then(res => res.json())
      .then(() => reload())
      .catch(console.error);

  return (
    <div className="dashboard-container">
      <h2>User Management</h2>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Disabled</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.is_disabled ? "Yes":"No"}</td>
              <td>
                <button onClick={() => action(u.id, "", { method:"DELETE" })}>
                  Delete
                </button>
                <button onClick={() => action(u.id, "disable", { method:"PATCH" })}>
                  {u.is_disabled ? "Enable":"Disable"}
                </button>
                <button onClick={() => action(u.id, "role",
                  { method:"PATCH", headers:{"Content-Type":"application/json"},
                    body:JSON.stringify({role: u.role==="admin"?"member":"admin"}) })}>
                  {u.role==="admin"?"Demote":"Promote"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
