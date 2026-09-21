import {
  buildSeed,
  ADMIN,
  OFFICERS,
  SEED_FINANCE_DOCS,
  SEED_MINUTES,
  DEFAULT_CONFIG,
  SEED_MEETINGS,
  SEED_FINES,
  SEED_LOANS,
  SEED_WITHDRAWALS,
  SEED_BANK_ACCOUNTS,
  SEED_MMF,
  SEED_ANNOUNCEMENTS,
  SEED_ACTION_ITEMS,
} from "../data/seed";

const KEYS = {
  members: "neh_members",
  accounts: "neh_accounts",
  history: "neh_history",
  fees: "neh_fees",
  investments: "neh_investments",
  session: "neh_session",
  seedVersion: "neh_seed_version",
  documents: "neh_fin_docs",
  minutes: "neh_minutes",
  savingsRecord: "neh_savings_record",
  config: "neh_config",
  meetings: "neh_meetings",
  fines: "neh_fines",
  loans: "neh_loans",
  withdrawals: "neh_withdrawals",
  banks: "neh_banks",
  mmf: "neh_mmf",
  announcements: "neh_announcements",
  actionItems: "neh_action_items",
  statements: "neh_contribution_statements",
  subCommittees: "neh_subcommittees",
  events: "neh_events",
};

const SEED_VERSION = "2026-09-roles-600";

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
  write(
    KEYS.members,
    [ADMIN, ...OFFICERS, ...seedData.members].map((m) => ({
      status: "active",
      ...m,
    })),
  );
  write(KEYS.accounts, seedData.accounts);
  write(KEYS.history, seedData.history);
  write(KEYS.fees, seedData.fees);
  write(KEYS.investments, seedData.investments);
  write(KEYS.documents, SEED_FINANCE_DOCS);
  write(KEYS.minutes, SEED_MINUTES);
  write(KEYS.savingsRecord, seedData.savingsRecord);
  write(KEYS.config, DEFAULT_CONFIG);
  write(KEYS.meetings, SEED_MEETINGS);
  write(KEYS.fines, SEED_FINES);
  write(KEYS.loans, SEED_LOANS);
  write(KEYS.withdrawals, SEED_WITHDRAWALS);
  write(KEYS.banks, SEED_BANK_ACCOUNTS);
  write(KEYS.mmf, SEED_MMF);
  write(KEYS.announcements, SEED_ANNOUNCEMENTS);
  write(KEYS.actionItems, SEED_ACTION_ITEMS);
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
  return read(KEYS.members, []).map((m) => ({ status: "active", ...m }));
}

export function getActiveMembers() {
  return getMembers().filter((m) => m.role === "member" && m.status !== "frozen");
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

  // Member numbers are permanent identity — never reuse a freed number and
  // never re-derive from list length. New members take the next highest NE.
  const maxNo = getMembers().reduce((max, mem) => {
    const raw = String(mem.memberNo || "").replace("NE-", "");
    const n = Number(raw);
    return Number.isInteger(n) && n > max ? n : max;
  }, 0);
  const number = maxNo + 1;
  const member = {
    id: `m${number}`,
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
    monthlyContribution: Number(monthlyContribution) || 500,
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
  write(
    KEYS.fines,
    read(KEYS.fines, []).filter((f) => f.memberId !== memberId),
  );
  write(
    KEYS.loans,
    read(KEYS.loans, []).filter((l) => l.memberId !== memberId),
  );
  write(
    KEYS.withdrawals,
    read(KEYS.withdrawals, []).filter((w) => w.memberId !== memberId),
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

const MAX_FILE_SIZE = 2_500_000;

export function getFinanceDocuments() {
  return read(KEYS.documents, []).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addFinanceDocument(doc) {
  if (doc.sizeBytes && doc.sizeBytes > MAX_FILE_SIZE) {
    throw new Error("That file is too large (max 2.5 MB in the demo).");
  }
  const docs = read(KEYS.documents, []);
  const next = {
    id: `doc-${Date.now()}`,
    createdAt: new Date().toISOString().slice(0, 10),
    ...doc,
  };
  docs.push(next);
  write(KEYS.documents, docs);
  return next;
}

export function deleteFinanceDocument(id) {
  write(KEYS.documents, read(KEYS.documents, []).filter((d) => d.id !== id));
}

export function getMinutes() {
  return read(KEYS.minutes, [])
    .slice()
    .sort((a, b) => b.meetingDate.localeCompare(a.meetingDate));
}

export function getMinutesById(id) {
  return read(KEYS.minutes, []).find((m) => m.id === id) || null;
}

export function addMinutes(data) {
  const list = read(KEYS.minutes, []);
  const now = new Date().toISOString();
  const next = {
    id: `min-${Date.now()}`,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    ...data,
  };
  list.push(next);
  write(KEYS.minutes, list);
  return next;
}

export function updateMinutes(id, updates) {
  write(
    KEYS.minutes,
    read(KEYS.minutes, []).map((m) =>
      m.id === id
        ? { ...m, ...updates, updatedAt: new Date().toISOString() }
        : m,
    ),
  );
}

export function deleteMinutes(id) {
  write(KEYS.minutes, read(KEYS.minutes, []).filter((m) => m.id !== id));
}

export function getSavingsRecord() {
  return read(KEYS.savingsRecord, [])
    .slice()
    .sort((a, b) => a.row - b.row);
}

export function getMemberSavings(memberId) {
  return read(KEYS.savingsRecord, []).find((r) => r.memberId === memberId) || null;
}

export function getMemberYearlySavings(memberId) {
  const row = getMemberSavings(memberId);
  if (!row) return [];
  return [2023, 2024, 2025, 2026]
    .filter((year) => row.years[year] != null)
    .map((year) => ({ year, total: row.years[year] }));
}

export function getPoolYearlyTotals() {
  const record = getSavingsRecord();
  return [2023, 2024, 2025, 2026].map((year) => ({
    year,
    total: record.reduce((sum, r) => sum + (r.years[year] || 0), 0),
  }));
}

export function getUnpaidTotals() {
  const record = read(KEYS.savingsRecord, []);
  return {
    amount: record.reduce((sum, r) => sum + (r.arrears || 0), 0),
    count: record.filter((r) => r.arrears > 0).length,
  };
}

export function getPoolStats() {
  const members = getMembers();
  const active = members.filter((m) => m.role === "member" && m.status !== "frozen");
  const accounts = getAccounts();
  return {
    memberCount: active.length,
    frozenCount: members.filter((m) => m.role === "member" && m.status === "frozen").length,
    savingsPool: accounts.reduce((sum, a) => sum + a.balance, 0),
    invested: getInvestments().reduce((sum, i) => sum + i.currentValue, 0),
  };
}

export function resetDemo() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  initStore();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ---------- Configuration & contribution schedule ----------

export function getConfig() {
  const cfg = read(KEYS.config, null);
  if (cfg) return cfg;
  return { ...DEFAULT_CONFIG, schedule: DEFAULT_CONFIG.schedule.slice() };
}

export function updateConfig(patch) {
  const next = { ...getConfig(), ...patch };
  write(KEYS.config, next);
  return next;
}

function scheduleSort(a, b) {
  const af = a.from || "";
  const bf = b.from || "";
  if (af === bf) return 0;
  if (!af) return -1;
  if (!bf) return 1;
  return af.localeCompare(bf);
}

export function getContributionForMonth(month) {
  const cfg = getConfig();
  const schedule = (cfg.schedule || []).slice().sort(scheduleSort);
  let amount = cfg.monthlyContribution || 500;
  for (const s of schedule) {
    if (!s.from) amount = s.amount;
    else if (month >= s.from) amount = s.amount;
  }
  return amount;
}

// ---------- Monthly check-off register ----------

export function addMonths(month, delta) {
  const [y, m] = String(month).split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function contributionDeadline(month) {
  const day = String(getConfig().deadlineDay || 5).padStart(2, "0");
  return `${addMonths(month, 1)}-${day}`;
}

export function getContributionStatements() {
  return read(KEYS.statements, [])
    .slice()
    .sort((a, b) => b.month.localeCompare(a.month));
}

function normalizeName(name) {
  return String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseDateOnly(token) {
  const t = token.trim();
  let m = /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/.exec(t);
  if (m) return { date: `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` };
  m = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/.exec(t);
  if (m) {
    const y = +m[3] < 100 ? 2000 + +m[3] : +m[3];
    return { date: `${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` };
  }
  m = /^(\d{1,2})[\s-]([A-Za-z]{3,})[\s-](\d{2,4})$/.exec(t);
  if (m) {
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const mi = months.indexOf((m[2] || "").slice(0, 3).toLowerCase());
    if (mi >= 0) {
      const y = +m[3] < 100 ? 2000 + +m[3] : +m[3];
      return { date: `${y}-${String(mi + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}` };
    }
  }
  return null;
}

// Parses a treasurer-uploaded statement (.txt/.csv/.tsv). Lines are tolerant
// of column order: each line  → { date?, amount?, member name or NE number }.
export function parseContributionStatementText(text, month) {
  const members = getActiveMembers();
  const byNo = new Map(members.map((m) => [String(m.memberNo).toLowerCase(), m]));
  const byName = new Map(
    members.map((m) => [normalizeName(m.name), m]).filter(([k]) => k),
  );
  const got = new Map();
  const unmatched = [];

  String(text || "")
    .split(/\r?\n/)
    .forEach((raw) => {
      const line = raw.trim();
      if (!line) return;
      const tokens = line.split(/[\t,]+/).map((t) => t.trim()).filter(Boolean);
      if (tokens.length === 0) return;

      let date = null;
      let member = null;
      const nameParts = [];
      const amounts = [];

      tokens.forEach((tok) => {
        if (/^(date|name|member|amount|narration|description|ref|status)$/i.test(tok)) return;
        if (/^(dr|cr)$/i.test(tok)) return;
        if (!date) {
          const p = parseDateOnly(tok);
          if (p) {
            date = p.date;
            return;
          }
        }
        const norm = tok.toLowerCase();
        const byNoHit = byNo.get(norm);
        if (byNoHit) {
          member = byNoHit;
          return;
        }
        if (/^(kes|ksh|k\/s|=)?[\d,]+(\.\d{1,2})?$/i.test(tok.replace(/^[^\d]/g, ""))) {
          const num = Number(tok.replace(/[^0-9.]/g, ""));
          if (Number.isFinite(num) && num > 0) {
            amounts.push(num);
            return;
          }
        }
        nameParts.push(tok);
      });

      const amount = amounts.reduce((s, a) => s + a, 0);

      if (!member && !date && !amount) return;

      if (!member) {
        const nameText = nameParts.join(" ");
        if (nameParts.length === 1 && /^NE-\d{3}$/i.test(nameText.trim())) {
          member = byNo.get(nameText.trim().toLowerCase()) || null;
        } else {
          member = byName.get(normalizeName(nameText)) || null;
        }
      }

      if (!member) {
        unmatched.push({ line, date, amount, reason: "Member not recognised in that line" });
        return;
      }
      if (!date) {
        unmatched.push({ line, date, amount, reason: "No deposit date found" });
        return;
      }
      if (!amount) {
        unmatched.push({ line, date, amount, reason: "No amount found" });
        return;
      }

      const prev = got.get(member.id);
      got.set(member.id, {
        memberId: member.id,
        memberNo: member.memberNo,
        name: member.name,
        amount: (prev ? prev.amount : 0) + amount,
        depositedOn: date,
      });
    });

  const deadline = contributionDeadline(month);
  const rows = Array.from(got.values()).map((r) => ({
    ...r,
    depositedOn: r.depositedOn > deadline ? r.depositedOn : r.depositedOn,
    onTime: r.depositedOn <= deadline,
  }));

  return { rows, unmatched, deadline };
}

// Publishes an uploaded statement: replaces that month's auto-tracked entries
// with statement-derived data, credits savings, and applies fines/arrears.
export function saveContributionStatement({ month, fileName, rows, unmatched }) {
  if (!month || !fileName || !Array.isArray(rows)) {
    throw new Error("A month, file name and parsed rows are required");
  }
  const deadline = contributionDeadline(month);

  // Re-uploads must first roll back the previous statement completely so the
  // original (seed) entries are restored before re-applying fresh deltas.
  if (getContributionStatements().some((s) => s.month === month)) {
    deleteContributionStatement(month);
  }

  const cfg = getConfig();
  const fine = Number(cfg.fineLate) || 100;
  const expected = getContributionForMonth(month);
  const accounts = getAccounts();
  const history = read(KEYS.history, []);

  // 1. Clear any previously tracked data for this month (re-uploads replace).
  const removedByMember = new Map();
  const removedHistory = [];
  const kept = history.filter((e) => {
    const belongs =
      e.contributionMonth === month || e.date.slice(0, 7) === month;
    if (belongs && e.type === "contribution") {
      const prev = removedByMember.get(e.memberId) || 0;
      removedByMember.set(e.memberId, prev + (e.amount || 0));
      removedHistory.push(e);
      return false;
    }
    return true;
  });
  removedByMember.forEach((amount, memberId) => {
    const acct = accounts.find((a) => a.memberId === memberId);
    if (acct) {
      acct.balance = Math.max(0, (acct.balance || 0) - amount);
      acct.contributionsMade = Math.max(0, (acct.contributionsMade || 0) - 1);
    }
  });

  const fees = read(KEYS.fees, []).filter(
    (f) => !(f.fromStmt && f.stmtMonth === month),
  );
  const fines = read(KEYS.fines, []).filter(
    (f) => !(f.fromStmt && f.stmtMonth === month),
  );

  // 2. Post each deposit (removed seed amounts were already subtracted above).
  const depositedRows = [];
  rows.forEach((r) => {
    const acct = accounts.find((a) => a.memberId === r.memberId);
    const removedAmt = removedByMember.get(r.memberId) || 0;
    if (acct) {
      acct.balance = (acct.balance || 0) + r.amount;
      acct.contributionsMade = (acct.contributionsMade || 0) + 1;
      acct.lastContribution = r.depositedOn;
    }
    kept.push({
      id: `${r.memberId}-${month}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      memberId: r.memberId,
      contributionMonth: month,
      date: r.depositedOn,
      amount: r.amount,
      type: "contribution",
      note: `${month} contribution (from ${fileName})`,
    });
    depositedRows.push({ ...r, removedAmt });
    if (!r.onTime) {
      fees.push({
        id: `${r.memberId}-fine-${month}-late`,
        memberId: r.memberId,
        type: "fine",
        label: `Late payment fine (${month})`,
        amount: fine,
        dueDate: deadline,
        status: "unpaid",
        fromStmt: true,
        stmtMonth: month,
      });
      fines.push({
        id: `${r.memberId}-fine-${month}-late`,
        memberId: r.memberId,
        type: "late",
        label: `Late ${month} contribution (${fileName})`,
        amount: fine,
        date: new Date().toISOString().slice(0, 10),
        status: "unpaid",
        fromStmt: true,
        stmtMonth: month,
      });
    }
  });

  // 3. Members with no deposit this month accrue the fee (arrears).
  const depositedIds = new Set(rows.map((r) => r.memberId));
  const missing = [];
  getActiveMembers().forEach((m) => {
    if (depositedIds.has(m.id)) return;
    const removedAmt = removedByMember.get(m.id) || 0;
    missing.push({ memberId: m.id, removedAmt });
    fees.push({
      id: `${m.id}-fee-${month}-stmt`,
      memberId: m.id,
      type: "monthly",
      label: `${month} monthly contribution`,
      amount: expected,
      dueDate: deadline,
      status: "unpaid",
      fromStmt: true,
      stmtMonth: month,
    });
  });

  write(KEYS.history, kept);
  write(KEYS.fees, fees);
  write(KEYS.fines, fines);
  write(KEYS.accounts, accounts);

  const stmt = {
    id: `stmt-${month}-${Date.now()}`,
    month,
    fileName,
    uploadedBy: "Treasurer",
    uploadedAt: new Date().toISOString().slice(0, 10),
    deadline,
    rows: depositedRows,
    missing,
    unmatched: unmatched || [],
    removedHistory,
  };
  write(KEYS.statements, [
    ...read(KEYS.statements, []).filter((s) => s.month !== month),
    stmt,
  ]);
  return stmt;
}

// Reverts a month to "awaiting statement": the exact inverse of save.
export function deleteContributionStatement(month) {
  const accounts = getAccounts();
  const stmt = read(KEYS.statements, []).find((s) => s.month === month);
  if (stmt) {
    stmt.rows.forEach((r) => {
      const acct = accounts.find((a) => a.memberId === r.memberId);
      if (acct) {
        acct.balance = Math.max(0, (acct.balance || 0) - (r.amount - (r.removedAmt || 0)));
        if (!r.removedAmt) {
          acct.contributionsMade = Math.max(0, (acct.contributionsMade || 0) - 1);
        }
      }
    });
    (stmt.missing || []).forEach((miss) => {
      const acct = accounts.find((a) => a.memberId === miss.memberId);
      if (acct) {
        acct.balance = Math.max(0, (acct.balance || 0) + (miss.removedAmt || 0));
        acct.contributionsMade = Math.max(0, (acct.contributionsMade || 0) + 1);
      }
    });
  }
  // Restore the entries the statement had replaced (the original month data).
  const keptHistory = read(KEYS.history, []).filter((e) => e.contributionMonth !== month);
  write(KEYS.history, [...(stmt.removedHistory || []), ...keptHistory]);
  write(
    KEYS.fees,
    read(KEYS.fees, []).filter((f) => !(f.fromStmt && f.stmtMonth === month)),
  );
  write(
    KEYS.fines,
    read(KEYS.fines, []).filter((f) => !(f.fromStmt && f.stmtMonth === month)),
  );
  write(KEYS.accounts, accounts);
  write(
    KEYS.statements,
    read(KEYS.statements, []).filter((s) => s.month !== month),
  );
}

export function getMonthRegister(month) {
  const members = getActiveMembers();
  const stmt = read(KEYS.statements, []).find((s) => s.month === month);
  const paidEntries = read(KEYS.history, []).filter(
    (e) =>
      e.type === "contribution" &&
      (e.contributionMonth === month || e.date.slice(0, 7) === month),
  );
  const monthFees = read(KEYS.fees, []).filter(
    (f) => f.label && f.label.includes(month),
  );
  const expected = getContributionForMonth(month);
  const awaiting = !stmt && paidEntries.length === 0;

  return members.map((m) => {
    if (stmt) {
      const row = stmt.rows.find((r) => r.memberId === m.id);
      if (row) {
        const fee = monthFees.find(
          (f) => f.memberId === m.id && f.label.includes("Late payment fine"),
        );
        return {
          member: m,
          paid: true,
          late: !row.onTime,
          awaiting: false,
          fee: row.onTime ? null : fee || null,
          expected,
          amountReceived: row.amount,
          depositedOn: row.depositedOn,
        };
      }
      const fee = monthFees.find((f) => f.memberId === m.id) || null;
      return {
        member: m,
        paid: false,
        late: false,
        awaiting: false,
        fee,
        expected,
        amountReceived: 0,
        depositedOn: null,
      };
    }
    const paid = paidEntries.some((e) => e.memberId === m.id);
    const fee = monthFees.find((f) => f.memberId === m.id) || null;
    return {
      member: m,
      paid,
      late: false,
      awaiting,
      fee,
      expected,
      amountReceived: paid ? paidEntries.find((e) => e.memberId === m.id).amount : 0,
      depositedOn: paidEntries.find((e) => e.memberId === m.id)?.date || null,
    };
  });
}

// ---------- Withdrawals ----------

export function getWithdrawals() {
  return read(KEYS.withdrawals, [])
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function addWithdrawal({ memberId, amount, reason }) {
  const value = Math.abs(Number(amount));
  if (!memberId || !value) throw new Error("Amount is required");
  const list = read(KEYS.withdrawals, []);
  const next = {
    id: `wd-${Date.now()}`,
    memberId,
    amount: value,
    reason: reason || "",
    date: today(),
    recordedBy: "Treasurer",
  };
  list.push(next);
  write(KEYS.withdrawals, list);
  return next;
}

export function recordWithdrawal(memberId, date, amount, note) {
  const value = -Math.abs(Number(amount));
  if (!memberId || !value) throw new Error("An amount is required");
  const history = read(KEYS.history, []);
  history.push({
    id: `${memberId}-wd-${Date.now()}`,
    memberId,
    date: date || today(),
    amount: value,
    type: "withdrawal",
    note: note || "Withdrawal",
  });
  write(KEYS.history, history);
  write(
    KEYS.accounts,
    getAccounts().map((a) =>
      a.memberId === memberId ? { ...a, balance: a.balance + value } : a,
    ),
  );
}

// Elected officials only: record a member payout from the group account.
export function recordMemberWithdrawal({ memberId, amount, reason, date }) {
  const member = getMembers().find((m) => m.id === memberId);
  if (!member) throw new Error("Select a member");
  if (member.status === "frozen") throw new Error("Frozen members are not paid out");
  const value = Math.abs(Number(amount));
  if (!value) throw new Error("Amount is required");
  const entry = addWithdrawal({
    memberId,
    amount: value,
    reason: reason,
  });
  recordWithdrawal(memberId, date || today(), value, `Withdrawal: ${reason || "member withdrawal"}`);
  return entry;
}

// ---------- Fines (meeting/late-payment fines) ----------

export function getFinesLog() {
  return read(KEYS.fines, [])
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getMemberFines(memberId) {
  return getFinesLog().filter((f) => f.memberId === memberId);
}

export function addFine({ memberId, type, label, amount, date, meetingId }) {
  if (!memberId || !Number(amount)) throw new Error("Member and amount required");
  const list = read(KEYS.fines, []);
  const next = {
    id: `fine-${Date.now()}`,
    memberId,
    type: type || "other",
    label: label || "Fine",
    amount: Number(amount),
    date: date || today(),
    meetingId: meetingId || null,
    status: "unpaid",
  };
  list.push(next);
  write(KEYS.fines, list);
  return next;
}

export function settleFine(id) {
  write(
    KEYS.fines,
    read(KEYS.fines, []).map((f) =>
      f.id === id ? { ...f, status: "paid", paidDate: today() } : f,
    ),
  );
}

export function deleteFine(id) {
  write(KEYS.fines, read(KEYS.fines, []).filter((f) => f.id !== id));
}

// ---------- Loans ----------

export function getLoans() {
  return read(KEYS.loans, [])
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getMemberLoans(memberId) {
  return getLoans().filter((l) => l.memberId === memberId);
}

export function loanOutstanding(loan) {
  const payable = loan.amount * (1 + (loan.interestPct || 0) / 100);
  const repaid = (loan.repayments || []).reduce((s, r) => s + r.amount, 0);
  return Math.max(0, payable - repaid);
}

export function addLoan({ memberId, amount, interestPct, date, reason }) {
  if (!memberId || !Number(amount)) throw new Error("Member and amount required");
  const list = read(KEYS.loans, []);
  const next = {
    id: `loan-${Date.now()}`,
    memberId,
    amount: Math.abs(Number(amount)),
    interestPct: Number(interestPct) || 0,
    date: date || today(),
    reason: reason || "",
    status: "active",
    repayments: [],
  };
  list.push(next);
  write(KEYS.loans, list);
  return next;
}

export function addLoanRepayment(loanId, amount, date) {
  const list = getLoans();
  const loan = list.find((l) => l.id === loanId);
  if (!loan || !Number(amount)) throw new Error("Amount required");
  const repayment = { date: date || today(), amount: Math.abs(Number(amount)) };
  const updated = list.map((l) =>
    l.id === loanId
      ? {
          ...l,
          repayments: [...(l.repayments || []), repayment],
          status: loanOutstanding({
            ...l,
            repayments: [...(l.repayments || []), repayment],
          }) <= 0
            ? "settled"
            : l.status,
        }
      : l,
  );
  write(KEYS.loans, updated);
}

export function deleteLoan(id) {
  write(KEYS.loans, getLoans().filter((l) => l.id !== id));
}

// ---------- Meetings ----------

export function getMeetings() {
  return read(KEYS.meetings, [])
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getNextMeeting() {
  const upcoming = getMeetings().filter((m) => m.date >= today());
  if (!upcoming.length) return null;
  return upcoming[upcoming.length - 1];
}

export function addMeeting(data) {
  const list = read(KEYS.meetings, []);
  const next = {
    id: `mtg-${Date.now()}`,
    agenda: [],
    attendance: null,
    ...data,
  };
  list.push(next);
  write(KEYS.meetings, list);
  return next;
}

export function updateMeeting(id, updates) {
  write(
    KEYS.meetings,
    read(KEYS.meetings, []).map((m) =>
      m.id === id ? { ...m, ...updates } : m,
    ),
  );
}

export function deleteMeeting(id) {
  write(KEYS.meetings, read(KEYS.meetings, []).filter((m) => m.id !== id));
}

export function saveMeetingAttendance(meetingId, { presentIds, apologyIds, absentIds }) {
  const namesById = Object.fromEntries(
    getMembers()
      .filter((m) => m.role === "member")
      .map((m) => [m.id, m.name]),
  );
  const build = (ids) =>
    (ids || []).map((id) => namesById[id]).filter(Boolean);
  updateMeeting(meetingId, {
    attendance: {
      membersPresent: build(presentIds),
      absentWithApology: build(apologyIds),
      absentWithoutApology: build(absentIds),
    },
  });
}

export function finesFromAttendance(meetingId) {
  const meeting = getMeetings().find((m) => m.id === meetingId);
  if (!meeting || !meeting.attendance) {
    throw new Error("No attendance recorded for this meeting yet");
  }
  const cfg = getConfig();
  const before = getMeetings().filter(
    (m) => m.date < meeting.date && m.attendance,
  );
  const absent = meeting.attendance.absentWithoutApology || [];
  const namesById = Object.fromEntries(
    getMembers()
      .filter((m) => m.role === "member")
      .map((m) => [m.id, m.name]),
  );
  let created = 0;
  absent.forEach((name) => {
    const memberId = Object.keys(namesById).find(
      (id) => namesById[id] === name,
    );
    if (!memberId) return;
    const misses = before.filter((m) =>
      (m.attendance.absentWithoutApology || []).includes(name),
    ).length;
    const amount =
      misses >= 2 ? Number(cfg.fineThreeMisses) : Number(cfg.fineMeeting);
    addFine({
      memberId,
      type: "meeting",
      label: `Missed meeting fine — ${meeting.date} (${name})`,
      amount,
      date: meeting.date,
      meetingId,
    });
    created += 1;
  });
  return created;
}

// ---------- Action items ----------

export function getActionItems() {
  return read(KEYS.actionItems, [])
    .slice()
    .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));
}

export function addActionItem({ minutesId, ref, title, owner, dueDate }) {
  if (!title) throw new Error("Action item needs a short description");
  const list = read(KEYS.actionItems, []);
  const next = {
    id: `act-${Date.now()}`,
    minutesId: minutesId || null,
    ref: ref || "",
    title,
    owner: owner || "",
    dueDate: dueDate || "",
    status: "open",
  };
  list.push(next);
  write(KEYS.actionItems, list);
  return next;
}

export function updateActionItem(id, updates) {
  write(
    KEYS.actionItems,
    read(KEYS.actionItems, []).map((a) =>
      a.id === id ? { ...a, ...updates } : a,
    ),
  );
}

export function deleteActionItem(id) {
  write(KEYS.actionItems, read(KEYS.actionItems, []).filter((a) => a.id !== id));
}

// ---------- Announcements ----------

export function getAnnouncements() {
  return read(KEYS.announcements, [])
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function addAnnouncement({ title, body, published }) {
  if (!title) throw new Error("Title required");
  const list = read(KEYS.announcements, []);
  const next = {
    id: `ann-${Date.now()}`,
    title,
    body: body || "",
    date: today(),
    published: published !== false,
  };
  list.push(next);
  write(KEYS.announcements, list);
  return next;
}

export function updateAnnouncement(id, updates) {
  write(
    KEYS.announcements,
    read(KEYS.announcements, []).map((a) =>
      a.id === id ? { ...a, ...updates } : a,
    ),
  );
}

export function deleteAnnouncement(id) {
  write(
    KEYS.announcements,
    read(KEYS.announcements, []).filter((a) => a.id !== id),
  );
}

// ---------- Sub-committees & task forces (Vice Chairperson) ----------

export function getSubCommittees() {
  return read(KEYS.subCommittees, []);
}

export function addSubCommittee({ name, focus, lead, members, status }) {
  if (!name) throw new Error("Committee name required");
  const list = read(KEYS.subCommittees, []);
  const next = {
    id: `sub-${Date.now()}`,
    name,
    focus: focus || "",
    lead: lead || "",
    members: members || "",
    status: status || "active",
    createdAt: today(),
  };
  list.push(next);
  write(KEYS.subCommittees, list);
  return next;
}

export function updateSubCommittee(id, updates) {
  write(
    KEYS.subCommittees,
    read(KEYS.subCommittees, []).map((s) => (s.id === id ? { ...s, ...updates } : s)),
  );
}

export function deleteSubCommittee(id) {
  write(
    KEYS.subCommittees,
    read(KEYS.subCommittees, []).filter((s) => s.id !== id),
  );
}

// ---------- Events & drives (Organising Secretary) ----------

export function getEvents() {
  return read(KEYS.events, [])
    .slice()
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
}

export function addEvent({ title, type, date, goal, details, status }) {
  if (!title) throw new Error("Event title required");
  const list = read(KEYS.events, []);
  const next = {
    id: `evt-${Date.now()}`,
    title,
    type: type || "Other",
    date: date || today(),
    goal: goal || "",
    details: details || "",
    status: status || "planned",
    createdAt: today(),
  };
  list.push(next);
  write(KEYS.events, list);
  return next;
}

export function updateEvent(id, updates) {
  write(
    KEYS.events,
    read(KEYS.events, []).map((e) => (e.id === id ? { ...e, ...updates } : e)),
  );
}

export function deleteEvent(id) {
  write(
    KEYS.events,
    read(KEYS.events, []).filter((e) => e.id !== id),
  );
}

// ---------- Bank & Money Market Fund ----------

export function getBankAccounts() {
  return read(KEYS.banks, []);
}

export function updateBankAccount(id, updates) {
  write(
    KEYS.banks,
    getBankAccounts().map((a) => (a.id === id ? { ...a, ...updates } : a)),
  );
}

export function addBankTxn(id, amount, note) {
  const value = Number(amount);
  if (!value) throw new Error("Amount required");
  updateBankAccount(id, {
    balance: (getBankAccounts().find((a) => a.id === id)?.balance || 0) + value,
    updatedAt: today(),
    txns: [
      { date: today(), amount: value, note: note || "Adjustment" },
      ...(getBankAccounts().find((a) => a.id === id)?.txns || []),
    ],
  });
}

export function getMMF() {
  return read(KEYS.mmf, null);
}

export function updateMMF(updates) {
  write(KEYS.mmf, { ...getMMF(), ...updates, updatedAt: today() });
}

export function addMMFTxn(amount, note) {
  const value = Number(amount);
  if (!value) throw new Error("Amount required");
  const mmf = getMMF();
  const balance = mmf.balance + value;
  updateMMF({
    balance,
    txns: [
      { date: today(), amount: value, note: note || "Adjustment" },
      ...(mmf.txns || []),
    ],
  });
}

export function accrueMMF(pct) {
  const mmf = getMMF();
  const rate = Number(pct) || 0;
  const interest = Math.round(mmf.balance * rate) / 100;
  updateMMF({
    balance: mmf.balance + interest,
    txns: [
      { date: today(), amount: interest, note: `Interest accrued at ${rate}%` },
      ...(mmf.txns || []),
    ],
  });
}

export function getCashPosition() {
  const bank = getBankAccounts().reduce((s, a) => s + a.balance, 0);
  const mmf = getMMF()?.balance || 0;
  const stats = getPoolStats();
  return {
    bank,
    mmf,
    liquid: bank + mmf,
    invested: stats.invested,
    pool: stats.savingsPool,
  };
}

// ---------- Backup ----------

export function backupAll() {
  const keys = [
    "members", "accounts", "history", "fees", "investments",
    "documents", "minutes", "savingsRecord", "config", "meetings",
    "fines", "loans", "withdrawals", "banks", "mmf",
    "announcements", "actionItems", "subCommittees", "events", "statements",
  ];
  const data = {};
  keys.forEach((key) => {
    data[key] = read(KEYS[key], null);
  });
  return JSON.stringify({ exportedAt: today(), app: "nyakahura-elites", data }, null, 2);
}