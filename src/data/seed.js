const DEFAULT_CONTRIBUTION = 2000;

const NAMES = [
  "David Muhia",
  "Marvin Karanja",
  "John Thiong'o",
  "Esther Mucho",
  "Benson Macharia",
  "Peter Maina",
  "Jane Wangari",
  "Nelius Waithira",
  "Kenneth Muchoki",
  "Stanley Ndiba",
  "Edwin Nyaga",
  "Vincent Ng'ang'a",
  "Kevin Kagwi",
  "Simon Kamau",
  "John Macharia",
  "Susan Wambui",
  "Peter Kariuki",
  "Phillip Gatimu",
  "Maureen Wanjiku",
];

const JOINED = [
  "2019-11", "2020-02", "2020-05", "2020-08", "2020-11",
  "2021-02", "2021-06", "2021-09", "2022-01", "2022-04",
  "2022-08", "2022-12", "2023-03", "2023-07", "2023-11",
  "2024-02", "2024-05", "2024-09", "2025-01",
];

const ADMIN = {
  id: "admin",
  memberNo: "ADMIN",
  name: "Administrator",
  email: "admin@nyakahura.com",
  password: "admin12345",
  role: "admin",
  occupation: "Group Leadership",
  joined: "2019-12",
};

function emailSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s.]/g, "")
    .trim()
    .replace(/\s+/g, ".");
}

const MEMBERS = NAMES.map((name, i) => {
  const id = `m${i + 1}`;
  return {
    id,
    memberNo: `NE-${String(i + 1).padStart(3, "0")}`,
    name,
    email: `${emailSlug(name)}@example.com`,
    password: `password${i + 1}`,
    role: "member",
    occupation: "",
    joined: JOINED[i],
  };
});

// Months skipped per member (index in the history range -> creates unpaid fee records)
const SKIPPED_MONTHS = {
  m1: [],
  m2: ["2026-02", "2026-06"],
  m3: ["2024-07", "2025-09"],
  m4: ["2025-01"],
  m5: ["2026-03", "2026-04"],
  m6: [],
  m7: ["2025-11", "2026-08"],
  m8: ["2026-05"],
  m9: ["2026-01", "2026-07"],
  m12: ["2026-02", "2026-03"],
  m13: ["2025-10"],
  m16: ["2026-08"],
};

const HISTORY_RANGE = ["2023-01", "2026-09"];

function eachMonth(start, end) {
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  const out = [];
  let y = sy;
  let m = sm;
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

function buildHistory(member) {
  const months = eachMonth(HISTORY_RANGE[0], HISTORY_RANGE[1]);
  const skipped = SKIPPED_MONTHS[member.id] || [];
  const entries = [];
  const fees = [];
  let balance = 0;

  months.forEach((month, index) => {
    if (skipped.includes(month)) {
      fees.push({
        id: `${member.id}-fee-${month}`,
        memberId: member.id,
        type: "monthly",
        label: `${month} monthly contribution`,
        amount: DEFAULT_CONTRIBUTION,
        dueDate: `${month}-28`,
        status: "unpaid",
      });
      return;
    }
    balance += DEFAULT_CONTRIBUTION;
    if (month >= member.joined) {
      entries.push({
        id: `${member.id}-${month}`,
        memberId: member.id,
        date: `${month}-05`,
        amount: DEFAULT_CONTRIBUTION,
        type: index % 6 === 5 ? "dividend" : "contribution",
        note: month === "2026-09" ? "September contribution" : `${month} monthly contribution`,
      });
    }
  });

  if (member.id === "m5") {
    fees.push({
      id: "m5-fine-1",
      memberId: member.id,
      type: "fine",
      label: "Late payment fine (March 2026)",
      amount: 500,
      dueDate: "2026-03-10",
      status: "unpaid",
    });
  }

  return { balance, entries, fees };
}

const INVESTMENTS = [
  {
    id: "inv-1",
    title: "Community Plot — Nyakahura",
    category: "land",
    amount: 1250000,
    currentValue: 1600000,
    date: "2023-03",
    status: "active",
    notes: "Half-acre parcel reserved for community projects and future member amenities.",
  },
  {
    id: "inv-2",
    title: "Maize Trading Fund",
    category: "business",
    amount: 450000,
    currentValue: 512000,
    date: "2024-10",
    status: "active",
    notes: "Seasonal maize buying and resale run by a small committee from the group.",
  },
  {
    id: "inv-3",
    title: "Member Welfare Loan Fund",
    category: "loan",
    amount: 300000,
    currentValue: 300000,
    date: "2025-06",
    status: "active",
    notes: "Revolving fund for member emergencies, repaid with agreed interest.",
  },
];

export { ADMIN, MEMBERS, INVESTMENTS, DEFAULT_CONTRIBUTION };

export function buildSeed() {
  const members = MEMBERS;
  const accounts = [];
  const history = [];
  const fees = [];

  for (const member of members) {
    const { balance, entries, fees: memberFees } = buildHistory(member);
    const joinedMonth = eachMonth(member.joined, HISTORY_RANGE[1]);
    accounts.push({
      memberId: member.id,
      balance,
      monthlyContribution: DEFAULT_CONTRIBUTION,
      contributionsMade: entries.filter((e) => e.type === "contribution").length,
      lastContribution: entries.length ? entries[entries.length - 1].date : null,
      memberSince: member.joined,
      monthsExpected: joinedMonth.length,
    });
    history.push(...entries);
    fees.push(...memberFees);
  }

  return { members, accounts, history, fees, investments: INVESTMENTS };
}