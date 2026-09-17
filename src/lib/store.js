import { buildSeed, ADMIN } from "../data/seed";

const KEYS = {
  members: "neh_members",
  accounts: "neh_accounts",
  history: "neh_history",
  fees: "neh_fees",
  investments: "neh_investments",
  session: "neh_session",
  seedVersion: "neh_seed_version",
};

const SEED_VERSION = "2026-09-real-members";

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seed() {
  const seedData = buildSeed();
  write(KEYS.members, [ADMIN, ...seedData.members]);
  write(KEYS.accounts, seedData.accounts);
  write(KEYS.history, seedData.history);
  write(KEYS.fees, seedData.fees);
  write(KEYS.investments, seedData.investments);
}

function initStore() {
  const existingVersion = localStorage.getItem(KEYS.seedVersion);
  if (existingVersion !== SEED_VERSION) {
    localStorage.removeItem(KEYS.session);
    seed();
    write(KEYS.seedVersion, SEED_VERSION);
  } else if (!localStorage.getItem(KEYS.members)) {
    seed();
  }
}

initStore();

export const KES = (n) => "KES " + Number(n || 0).toLocaleString("en-KE");

export function getMembers() {
  return read(KEYS.members, []);
}

export function getAccounts() {
  return read(KEYS.accounts, []);
}

export function getInvestments() {
  return read(KEYS.investments, []);
}

export function login(email, password) {
  const members = getMembers();
  const member = members.find(
    (m) => m.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!member || member.password !== password) {
    throw new Error("Invalid email or password");
  }
  const session = { memberId: member.id, role: member.role, name: member.name };
  write(KEYS.session, session);
  return session;
}

export function getSession() {
  const session = read(KEYS.session, null);
  if (!session) return null;
  const member = getMembers().find((m) => m.id === session.memberId);
  if (!member) return null;
  return { ...session, name: member.name };
}

export function logout() {
  localStorage.removeItem(KEYS.session);
}

export function getMember(memberId) {
  return getMembers().find((m) => m.id === memberId) || null;
}

export function getAccount(memberId) {
  return getAccounts().find((a) => a.memberId === memberId) || null;
}

export function getHistory(memberId) {
  return read(KEYS.history, [])
    .filter((e) => e.memberId === memberId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getFees(memberId) {
  return read(KEYS.fees, [])
    .filter((f) => f.memberId === memberId && f.status === "unpaid")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function addMember({ name, email, password, occupation, monthlyContribution }) {
  if (!name || !email || !password) {
    throw new Error("Name, email and password are required");
  }
  const members = getMembers();
  const exists = members.some(
    (m) => m.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (exists) throw new Error("A member with that email already exists");

  const number = members.length + 1;
  const member = {
    id: `m${Date.now()}`,
    memberNo: `NE-${String(number).padStart(3, "0")}`,
    name: name.trim(),
    email: email.trim(),
    password,
    role: "member",
    occupation: occupation || "",
    joined: new Date().toISOString().slice(0, 7),
  };

  const accounts = getAccounts();
  accounts.push({
    memberId: member.id,
    balance: 0,
    monthlyContribution: Number(monthlyContribution) || 2000,
    contributionsMade: 0,
    lastContribution: null,
    memberSince: member.joined,
    monthsExpected: 0,
  });

  write(KEYS.members, [...members, member]);
  write(KEYS.accounts, accounts);
  return member;
}

export function updateMember(memberId, updates, monthlyContribution) {
  const members = getMembers().map((m) =>
    m.id === memberId ? { ...m, ...updates } : m,
  );
  write(KEYS.members, members);

  if (monthlyContribution !== undefined) {
    write(
      KEYS.accounts,
      getAccounts().map((a) =>
        a.memberId === memberId
          ? { ...a, monthlyContribution: Number(monthlyContribution) || 0 }
          : a,
      ),
    );
  }
}

export function deleteMember(memberId) {
  write(KEYS.members, getMembers().filter((m) => m.id !== memberId));
  write(KEYS.accounts, getAccounts().filter((a) => a.memberId !== memberId));
  write(
    KEYS.history,
    read(KEYS.history, []).filter((e) => e.memberId !== memberId),
  );
  write(
    KEYS.fees,
    read(KEYS.fees, []).filter((f) => f.memberId !== memberId),
  );
}

export function recordContribution(memberId, date, amount) {
  const value = Number(amount);
  if (!date || !value) throw new Error("A date and amount are required");

  const history = read(KEYS.history, []);
  history.push({
    id: `${memberId}-${date}-${Date.now()}`,
    memberId,
    date,
    amount: value,
    type: "contribution",
    note: `${date} contribution (recorded by admin)`,
  });
  write(KEYS.history, history);

  write(
    KEYS.accounts,
    getAccounts().map((a) =>
      a.memberId === memberId
        ? {
            ...a,
            balance: a.balance + value,
            contributionsMade: a.contributionsMade + 1,
            lastContribution: date,
          }
        : a,
    ),
  );
}

export function settleFee(feeId) {
  write(
    KEYS.fees,
    read(KEYS.fees, []).map((f) =>
      f.id === feeId ? { ...f, status: "paid", paidDate: new Date().toISOString().slice(0, 10) } : f,
    ),
  );
}

export function resetDemo() {
  localStorage.removeItem(KEYS.members);
  localStorage.removeItem(KEYS.accounts);
  localStorage.removeItem(KEYS.history);
  localStorage.removeItem(KEYS.fees);
  localStorage.removeItem(KEYS.investments);
  localStorage.removeItem(KEYS.session);
  initStore();
}