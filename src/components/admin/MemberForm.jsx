import { useState } from "react";
import { UserPlus } from "lucide-react";
import { addMember } from "../../lib/store";

export default function MemberForm({ onAdded }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [occupation, setOccupation] = useState("");
  const [contribution, setContribution] = useState("500");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const member = addMember({
        name,
        email,
        password,
        occupation,
        monthlyContribution: contribution,
      });
      setSuccess(`${member.name} added as ${member.memberNo}.`);
      setName("");
      setEmail("");
      setPassword("");
      setOccupation("");
      setContribution("500");
      onAdded(member);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-navy" htmlFor="m-name">
            Full name *
          </label>
          <input
            id="m-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Amina Yusuf"
            className="mt-2 w-full rounded-xl border border-navy/10 px-4 py-3 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy" htmlFor="m-email">
            Email *
          </label>
          <input
            id="m-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="member@example.com"
            className="mt-2 w-full rounded-xl border border-navy/10 px-4 py-3 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-navy" htmlFor="m-pass">
            Initial password *
          </label>
          <input
            id="m-pass"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Set a temporary password"
            className="mt-2 w-full rounded-xl border border-navy/10 px-4 py-3 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy" htmlFor="m-occ">
            Occupation
          </label>
          <input
            id="m-occ"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder="e.g. Driver, Farmer"
            className="mt-2 w-full rounded-xl border border-navy/10 px-4 py-3 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-navy" htmlFor="m-cont">
          Monthly contribution (KES)
        </label>
        <input
          id="m-cont"
          type="number"
          min="0"
          value={contribution}
          onChange={(e) => setContribution(e.target.value)}
          className="mt-2 w-full rounded-xl border border-navy/10 px-4 py-3 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl bg-green/10 px-4 py-3 text-sm font-medium text-green ring-1 ring-green/20">
          {success}
        </p>
      )}

      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full bg-green px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-dark"
      >
        <UserPlus className="h-4 w-4" />
        Add member
      </button>
    </form>
  );
}