import { useState } from "react";
import type { User } from "../types";

interface UserCardProps {
  user: User;
  showEmail?: boolean;
  onContact?: (user: User) => void;
  onDelete?: (id: User["id"]) => void;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function UserCard({
  user,
  showEmail = true,
  onContact,
  onDelete,
}: UserCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(user.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="user-card">
      <div className="avatar" aria-hidden="true">
        {initials(user.name)}
      </div>

      <div className="user-card-body">
        <h3>{user.name}</h3>
        {showEmail && <p className="muted">{user.email}</p>}
        <p className="muted">
          {user.role ?? "viewer"}
          {user.age !== undefined && ` · ${user.age} سنة`}
        </p>
      </div>

      <div className="row">
        {onContact && (
          <button type="button" onClick={() => onContact(user)}>
            تواصل
          </button>
        )}
        {showEmail && (
          <button type="button" onClick={() => void handleCopy()}>
            {copied ? "تم النسخ" : "نسخ البريد"}
          </button>
        )}
        {onDelete && (
          <button type="button" className="danger" onClick={() => onDelete(user.id)}>
            حذف
          </button>
        )}
      </div>
    </article>
  );
}
