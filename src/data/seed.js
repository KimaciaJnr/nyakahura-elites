const DEFAULT_CONTRIBUTION = 500;

// PERMANENT MEMBER-NUMBER ROSTER (NE-001…NE-021).
// These member numbers are immutable identity — do not reorder or insert.
// NE-001 John Thiong'o … founders first, later joiners after, NE-021
// Peter Muchoki (last to join). Adding members takes the next free NE number.
const NAMES = [
  "John Thiong'o",
  "David Muhia",
  "Peter Maina",
  "Vincent Ng'ang'a",
  "Esther Mucho",
  "Benson Macharia",
  "Jane Wangari",
  "Kenneth Muchoki",
  "Edwin Nyaga",
  "Danson Ngumba",
  "Stanley Ndiba",
  "Simon Kamau",
  "Nelius Waithira",
  "Marvin Karanja",
  "Susan Wambui",
  "Kevin Kagwi",
  "John Macharia",
  "Maureen Wanjiku",
  "Phillip Gatimu",
  "Peter Kariuki",
  "Peter Muchoki",
];

// Joining month per member (founding members first, later joiners after).
const JOINED = {
  "John Thiong'o": "2019-11",
  "David Muhia": "2020-02",
  "Peter Maina": "2020-05",
  "Vincent Ng'ang'a": "2020-08",
  "Esther Mucho": "2020-11",
  "Benson Macharia": "2021-02",
  "Jane Wangari": "2021-06",
  "Kenneth Muchoki": "2021-09",
  "Edwin Nyaga": "2022-01",
  "Danson Ngumba": "2023-01",
  "Stanley Ndiba": "2022-04",
  "Simon Kamau": "2022-08",
  "Nelius Waithira": "2022-12",
  "Marvin Karanja": "2023-03",
  "Susan Wambui": "2023-07",
  "Kevin Kagwi": "2023-11",
  "John Macharia": "2023-11",
  "Maureen Wanjiku": "2024-02",
  "Phillip Gatimu": "2024-05",
  "Peter Kariuki": "2024-09",
  "Peter Muchoki": "2025-06",
};

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

const PHONES = {
  "David Muhia": "0712 345 678",
  "Marvin Karanja": "0722 111 222",
  "Peter Maina": "0733 555 666",
  "Jane Wangari": "0745 007 008",
  "Simon Kamau": "0701 990 100",
  "Susan Wambui": "0798 465 132",
  "Peter Kariuki": "0711 234 567",
  "Maureen Wanjiku": "0726 890 123",
  "Danson Ngumba": "0754 321 098",
};

// Contact details supplied in Members.docx, matched to the permanent NE roster.
export const MEMBER_CONTACTS_BY_NO = {
  "NE-001": { name: "John Thiong'o", phone: "0714065805", email: "johndhiosh@gmail.com" },
  "NE-002": { name: "David Mugo", phone: "0702268668", email: "dmugoson@gmail.com" },
  "NE-003": { name: "Peter Maina", phone: "0702649377", email: "mainangugi5@gmail.com" },
  "NE-004": { name: "Vincent Nganga", phone: "0723563899", email: "vincentnganga97@gmail.com" },
  "NE-006": { name: "Benson Macharia", phone: "0707456576", email: "machariaben018@gmail.com" },
  "NE-007": { name: "Jane Wangari", phone: "0712517733", email: "wangarijane1515@gmail.com" },
  "NE-010": { name: "Danson Ngumba", phone: "0790539275", email: "ngumbamuchoki94@gmail.com" },
  "NE-011": { name: "Stanley Ndiba", phone: "0742114791", email: "" },
  "NE-012": { name: "Simon Kamau", phone: "0708540262", email: "simonkiiru66@gmail.com" },
  "NE-013": { name: "Nelius Waithera", phone: "0723069854", email: "neliusirungu30@gmail.com" },
  "NE-014": { name: "Marvin Karanja", phone: "0727471131", email: "karanjamarv@gmail.com" },
  "NE-015": { name: "Susan Wambui", phone: "0759770390", email: "suwamu45@gmail.com" },
  "NE-017": { name: "John Maina", phone: "0705769024", email: "jm695369@gmail.com" },
  "NE-018": { name: "Maureen Wanjiku", phone: "0708055468", email: "shikohmaureenm@gmail.com" },
  "NE-020": { name: "Peter Kariuki", phone: "0759285091", email: "peterkariukiirungu@gmail.com" },
  "NE-021": { name: "Peter Muchoki", phone: "0702144569", email: "peterndabi17@gmail.com" },
};

const MEMBERS = NAMES.map((name, i) => {
  const id = `m${i + 1}`;
  const memberNo = `NE-${String(i + 1).padStart(3, "0")}`;
  const contact = MEMBER_CONTACTS_BY_NO[memberNo];
  return {
    id,
    memberNo,
    name: contact?.name || name,
    email: contact?.email || `${emailSlug(name)}@example.com`,
    password: name === "David Muhia" ? "password1" : `password${i + 1}`,
    role: "member",
    occupation: "",
    phone: contact?.phone || PHONES[name] || "",
    joined: JOINED[name],
  };
});

// Months skipped per member (name -> creates unpaid fee records)
const SKIPPED_MONTHS = {
  "David Muhia": [],
  "Marvin Karanja": ["2026-02", "2026-06"],
  "John Thiong'o": ["2024-07", "2025-09"],
  "Esther Mucho": ["2025-01"],
  "Benson Macharia": ["2026-03", "2026-04"],
  "Peter Maina": [],
  "Jane Wangari": ["2025-11", "2026-08"],
  "Nelius Waithera": ["2026-05"],
  "Kenneth Muchoki": ["2026-01", "2026-07"],
  "Vincent Ng'ang'a": ["2026-02", "2026-03"],
  "Kevin Kagwi": ["2025-10"],
  "Peter Kariuki": ["2026-08"],
  "Danson Ngumba": ["2025-01", "2025-02"],
  "John Macharia": [],
  "Peter Muchoki": ["2026-08"],
};

const HISTORY_RANGE = ["2023-01", "2026-09"];

// Authoritative 2026 contribution entries from the uploaded savings record.
// Values are ordered Jan-Dec; zero means no contribution was recorded.
const CONTRIBUTIONS_2026 = {
  "NE-001": [500, 500, 500, 500, 500, 500, 500, 500, 0, 0, 0, 0],
  "NE-002": [1000, 1000, 0, 1100, 1600, 0, 1200, 0, 0, 0, 0, 0],
  "NE-003": [500, 500, 500, 500, 600, 500, 1100, 500, 0, 0, 0, 0],
  "NE-004": [500, 0, 500, 500, 500, 500, 500, 500, 0, 0, 0, 0],
  "NE-005": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  "NE-006": [0, 2000, 1000, 500, 500, 500, 500, 500, 0, 0, 0, 0],
  "NE-007": [0, 1000, 0, 700, 500, 500, 1100, 0, 0, 0, 0, 0],
  "NE-008": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  "NE-009": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  "NE-010": [0, 500, 5000, 500, 500, 0, 4200, 2000, 0, 0, 0, 0],
  "NE-011": [100, 0, 1200, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  "NE-012": [2000, 0, 1000, 500, 500, 1000, 500, 500, 0, 0, 0, 0],
  "NE-013": [0, 1000, 2200, 1200, 0, 1300, 0, 600, 0, 0, 0, 0],
  "NE-014": [500, 500, 500, 500, 1500, 500, 500, 500, 0, 0, 0, 0],
  "NE-015": [0, 0, 1000, 2000, 0, 0, 0, 0, 0, 0, 0, 0],
  "NE-016": [500, 0, 0, 1000, 0, 0, 0, 0, 0, 0, 0, 0],
  "NE-017": [500, 1500, 1500, 1500, 0, 3500, 0, 3000, 0, 0, 0, 0],
  "NE-018": [0, 5000, 2400, 500, 500, 500, 500, 1500, 0, 0, 0, 0],
  "NE-019": [0, 0, 1300, 2700, 0, 0, 0, 0, 0, 0, 0, 0],
  "NE-020": [0, 1600, 0, 500, 3000, 0, 0, 0, 0, 0, 0, 0],
  "NE-021": [10000, 0, 0, 5600, 0, 0, 0, 6000, 0, 0, 0, 0],
};

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
  const skipped = SKIPPED_MONTHS[member.name] || [];
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

export const OFFICERS = [
  {
    id: "officer-chairperson",
    memberNo: "CHAIR",
    name: "Marvin Karanja",
    email: "chairperson@nyakahura.com",
    password: "chair1234",
    role: "chairperson",
    occupation: "Chairperson",
    relatedMemberId: "m14",
    joined: "2020-08",
  },
  {
    id: "officer-vicechairperson",
    memberNo: "VICEC",
    name: "Maureen Wanjiku",
    email: "vicechair@nyakahura.com",
    password: "vicechair1234",
    role: "vicechairperson",
    occupation: "Vice Chairperson",
    relatedMemberId: "m18",
    joined: "2020-08",
  },
  {
    id: "officer-organising",
    memberNo: "ORGSEC",
    name: "Simon Kamau",
    email: "organising@nyakahura.com",
    password: "organising1234",
    role: "organising",
    occupation: "Organising Secretary",
    relatedMemberId: "m12",
    joined: "2020-08",
  },
  {
    id: "officer-treasurer",
    memberNo: "TREAS",
    name: "Jane Wangari",
    email: "treasurer@nyakahura.com",
    password: "treasurer1234",
    role: "treasurer",
    occupation: "Treasurer",
    relatedMemberId: "m7",
    joined: "2020-08",
  },
  {
    id: "officer-secretary",
    memberNo: "SECRE",
    name: "Susan Wambui",
    email: "secretary@nyakahura.com",
    password: "secretary1234",
    role: "secretary",
    occupation: "Secretary",
    relatedMemberId: "m15",
    joined: "2020-08",
  },
];

function toTextDataUrl(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return "data:text/plain;base64," + btoa(binary);
}

// Exact figures from NEIG 2023 SAVINGS RECORD - Arrears (prepared 09/06/2026).
// null = no savings recorded for that year.
const SAVINGS_RECORD_ROWS = [
  { name: "David Muhia", y2023: 6500, y2024: 4000, y2025: 6000, y2026: 3500, grandTotal: 20000, arrears: 1000 },
  { name: "Marvin Karanja", y2023: 4500, y2024: 8000, y2025: 4000, y2026: 3500, grandTotal: 20000, arrears: 1000 },
  { name: "John Thiong'o", y2023: 6500, y2024: 6000, y2025: 6000, y2026: 2500, grandTotal: 21000, arrears: 0 },
  { name: "Esther Mucho", y2023: 5000, y2024: 3500, y2025: 3500, y2026: -600, grandTotal: 11400, arrears: 9600 },
  { name: "Benson Macharia", y2023: 3000, y2024: 8700, y2025: 5300, y2026: 3800, grandTotal: 20800, arrears: 200 },
  { name: "Peter Maina", y2023: 6500, y2024: 5500, y2025: 6500, y2026: 2500, grandTotal: 21000, arrears: 0 },
  { name: "Jane Wangari", y2023: 6500, y2024: 6000, y2025: 6600, y2026: 2200, grandTotal: 21300, arrears: -300 },
  { name: "Nelius Waithira", y2023: 6000, y2024: 5500, y2025: 5300, y2026: 3600, grandTotal: 20400, arrears: 600 },
  { name: "Kenneth Muchoki", y2023: 5500, y2024: 3500, y2025: 800, y2026: -1200, grandTotal: 8600, arrears: 12400 },
  { name: "Stanley Ndiba", y2023: 5000, y2024: 7500, y2025: 7000, y2026: 900, grandTotal: 20400, arrears: 600 },
  { name: "Edwin Nyaga", y2023: 2500, y2024: 4500, y2025: 2300, y2026: -1200, grandTotal: 8100, arrears: 12900 },
  { name: "Vincent Ng'ang'a", y2023: 4500, y2024: 1500, y2025: 13000, y2026: 2000, grandTotal: 21000, arrears: 0 },
  { name: "Kevin Kagwi", y2023: 6000, y2024: 4000, y2025: 4000, y2026: 1100, grandTotal: 15100, arrears: 5900 },
  { name: "Simon Kamau", y2023: 2000, y2024: 7500, y2025: 6000, y2026: 3800, grandTotal: 19300, arrears: 1700 },
  { name: "Susan Wambui", y2023: 1000, y2024: 12500, y2025: 6000, y2026: 3000, grandTotal: 22500, arrears: -1500 },
  { name: "Peter Kariuki", y2023: 3000, y2024: 9000, y2025: 6000, y2026: 4900, grandTotal: 22900, arrears: -1900 },
  { name: "Phillip Gatimu", y2023: null, y2024: 4500, y2025: 3800, y2026: 3100, grandTotal: 11400, arrears: 9600 },
  { name: "Maureen Wanjiku", y2023: null, y2024: 12500, y2025: 300, y2026: 8200, grandTotal: 21000, arrears: 0 },
  { name: "Danson Ngumba", y2023: null, y2024: null, y2025: 6000, y2026: 6400, grandTotal: 12400, arrears: 8600 },
  { name: "John Macharia", y2023: null, y2024: 4000, y2025: 800, y2026: 4300, grandTotal: 9100, arrears: 11900 },
  { name: "Peter Muchoki", y2023: null, y2024: null, y2025: null, y2026: 15400, grandTotal: 15400, arrears: 5600 },
];

export const SAVINGS_RECORD_TOTALS = {
  y2023: 74000,
  y2024: 118200,
  y2025: 99200,
  y2026: 71700,
  grand: 363100,
  arrears: 77900,
};

const SAVINGS_RECORD_TEXT = `
NYAKAHURA ELITES INVESTMENT GROUP
SAVINGS RECORD - 2023 TO 2026 (PREPARED 09/06/2026)

S.NO | NAME               | 2023     | 2024     | 2025     | 2026      | GRAND TOTAL | ARREARS
1    | David Muhia        | 6,500    | 4,000    | 6,000    | 3,500     | 20,000      | 1,000
2    | Marvin Karanja     | 4,500    | 8,000    | 4,000    | 3,500     | 20,000      | 1,000
3    | John Thiong'o      | 6,500    | 6,000    | 6,000    | 2,500     | 21,000      | 0
4    | Esther Mucho       | 5,000    | 3,500    | 3,500    | -600      | 11,400      | 9,600
5    | Benson Macharia    | 3,000    | 8,700    | 5,300    | 3,800     | 20,800      | 200
6    | Peter Maina        | 6,500    | 5,500    | 6,500    | 2,500     | 21,000      | 0
7    | Jane Wangari       | 6,500    | 6,000    | 6,600    | 2,200     | 21,300      | -300
8    | Nelius Waithira    | 6,000    | 5,500    | 5,300    | 3,600     | 20,400      | 600
9    | Kenneth Muchoki    | 5,500    | 3,500    | 800      | -1,200    | 8,600       | 12,400
10   | Stanley Ndiba      | 5,000    | 7,500    | 7,000    | 900       | 20,400      | 600
11   | Edwin Nyaga        | 2,500    | 4,500    | 2,300    | -1,200    | 8,100       | 12,900
12   | Vincent Ng'ang'a   | 4,500    | 1,500    | 13,000   | 2,000     | 21,000      | 0
13   | Kevin Kagwi        | 6,000    | 4,000    | 4,000    | 1,100     | 15,100      | 5,900
14   | Simon Kamau        | 2,000    | 7,500    | 6,000    | 3,800     | 19,300      | 1,700
15   | Susan Wambui       | 1,000    | 12,500   | 6,000    | 3,000     | 22,500      | -1,500
16   | Peter Kariuki      | 3,000    | 9,000    | 6,000    | 4,900     | 22,900      | -1,900
17   | Phillip Gatimu     |          | 4,500    | 3,800    | 3,100     | 11,400      | 9,600
18   | Maureen Wanjiku    |          | 12,500   | 300      | 8,200     | 21,000      | 0
19   | Danson Ngumba      |          |          | 6,000    | 6,400     | 12,400      | 8,600
20   | John Macharia      |          | 4,000    | 800      | 4,300     | 9,100       | 11,900
21   | Peter Muchoki      |          |          |          | 15,400    | 15,400      | 5,600

YEARLY TOTALS
2023: 74,000 | 2024: 118,200 | 2025: 99,200 | 2026: 71,700
GRAND TOTAL: 363,100 | TOTAL ARREARS: 77,900

Note: monthly contribution is Ksh 500. Figures grow gradually each month.
Negative amounts in 2026 are withdrawals, negative arrears are overpayments.
`.trim();

export const SEED_FINANCE_DOCS = [
  {
    id: "doc-savings-2023-26",
    title: "Savings Record 2023-2026 with Arrears",
    category: "savings",
    periodFrom: "2023-01",
    periodTo: "2026-06",
    note: "Individual savings for 2023 to 2026 with arrears, prepared 09/06/2026.",
    fileName: "NEIG 2023 SAVINGS RECORD - Arrears.txt",
    mime: "text/plain",
    sizeBytes: null,
    dataUrl: toTextDataUrl(SAVINGS_RECORD_TEXT),
    recordedAmount: 363100,
    recordedArrears: 77900,
    uploadedBy: "Jane Wangari (Treasurer)",
    createdAt: "2026-06-09",
  },
];

export const SEED_MINUTES = [
  {
    id: "min-agm-2025",
    title: "Annual General Meeting",
    meetingType: "AGM",
    meetingDate: "2025-12-31",
    startTime: "14:00",
    endTime: "16:00",
    venue: "Google Meet",
    chairperson: "Marvin Karanja",
    secretary: "Susan Wambui",
    writtenBy: "Susan Wambui",
    approvedBy: "Marvin Karanja",
    status: "approved",
    membersPresent: [
      "Peter Maina", "David Muhia", "Esther Mucho", "Danson Ngumba",
      "Vincent Ng'ang'a", "John Thiong'o", "Kelvin Mwangi", "Peter Kariuki",
    ],
    absentWithApology: ["Benson Macharia"],
    absentWithoutApology: [
      "Nelius Waithira", "Kenneth Muchoki", "Edwin Nyaga", "John Macharia", "Philip Gatimu",
    ],
    agenda: [
      "Preliminaries", "Monthly Meetings and Attendance", "Constitution Reading",
      "Fun Day", "Review of Members Savings", "Elections", "AOB",
    ],
    resolutions: [
      {
        ref: "MIN.01/AGM/2025",
        title: "Preliminaries",
        body: "The meeting was called to order by David Muhia on behalf of the chairperson at 2:00 pm followed by an opening word of prayer by Peter Maina. Apology noted for 1 member.",
      },
      {
        ref: "MIN.02/AGM/2025",
        title: "Monthly Meetings and Attendance",
        body: "Monthly meetings will be conducted every 2nd Tuesday of the month via Google Meet (8:30 PM - 9:30 PM). Members were encouraged to keep time to ensure meetings run smoothly. Members agreed that all meetings are compulsory and failure to that will attract a fine of Ksh100. Members agreed to have both physical and online meetings. Missing three consecutive meetings will attract a fine of Ksh500.",
      },
      {
        ref: "MIN.03/AGM/2025",
        title: "Constitution Reading",
        body: "Members were taken through key articles of the constitution and the members present reviewed them. Key provisions were highlighted to enhance understanding and members were given the opportunity to seek clarification where necessary. Members were encouraged to familiarize themselves with our Constitution, especially the key clauses on finances, fines, and disciplinary actions.",
      },
      {
        ref: "MIN.04/AGM/2025",
        title: "Fun Day",
        body: "Members agreed to hold a fun day between June and August 2026, contribution fee to be 1000/=. Venue to be communicated at a later date. The Fun Day doubles up as a monthly meeting and absenteeism will attract a fine as with other physical meetings (Ksh500).",
      },
      {
        ref: "MIN.05/AGM/2025",
        title: "Review of Members Monthly Contributions",
        body: "The treasurer highlighted each member's arrears and members agreed to settle their pending contributions by 5th April 2026. It was emphasized that deadline for monthly contributions is always date 5 of the next month. Late payment attracts a fine of 100/= each and every month.",
      },
      {
        ref: "MIN.06/AGM/2025",
        title: "Elections",
        body: "Elections were held and the newly elected executive were: Marvin Karanja (Chairperson), Maureen Wanjiku (Vice chairperson), Jane Wangari (Treasurer), Susan Wambui (Secretary), Simon Kamau (Organizing secretary), Stanley Ndiba (Nominated member). The former and newly elected executives agreed to have an official handover meeting before February for induction and planning for the year ahead.",
      },
      {
        ref: "MIN.07/AGM/2025",
        title: "Any Other Business",
        body: "Investment in Money Market Funds: members discussed opening an MMF with KCB instead of keeping money idle in the bank to promote prudent financial management and generate stable returns. Members unanimously agreed that in the event of severe ailment or death affecting the nuclear family (mother, father, child or spouse) of any NEIG member, the group will offer financial assistance as a gesture of love, care and solidarity during such difficult times.",
      },
      {
        ref: "MIN.08/AGM/2025",
        title: "Adjournment",
        body: "There being no any other business the meeting was adjourned by the chairperson and closed by a word of prayer.",
      },
    ],
    createdAt: "2026-01-05",
    updatedAt: "2026-01-05",
  },
];

export const DEFAULT_CONFIG = {
  monthlyContribution: 500,
  schedule: [
    { from: null, amount: 500 },
    { from: "2027-01", amount: 1000 },
  ],
  fineLate: 100,
  fineMeeting: 100,
  fineThreeMisses: 500,
  deadlineDay: 5,
  meetingDay: "Every 2nd Tuesday",
  meetingTime: "20:30",
  venue: "Google Meet",
};

const MONTHLY_MEETINGS_AGENDA = [
  "Opening & prayer",
  "Confirm previous minutes",
  "Savings & arrears update",
  "Investments update",
  "Any other business",
];

const AGM_2025_MEETING = {
  id: "mtg-agm-2025",
  title: "Annual General Meeting",
  date: "2025-12-31",
  time: "14:00",
  venue: "Google Meet",
  agenda: [
    "Preliminaries",
    "Monthly Meetings and Attendance",
    "Constitution Reading",
    "Fun Day",
    "Review of Members Savings",
    "Elections",
    "AOB",
  ],
  minutesId: "min-agm-2025",
  president: "Marvin Karanja",
  secretary: "Susan Wambui",
  attendance: {
    membersPresent: [
      "Peter Maina", "David Muhia", "Esther Mucho", "Danson Ngumba",
      "Vincent Ng'ang'a", "John Thiong'o", "Peter Kariuki",
    ],
    absentWithApology: ["Benson Macharia"],
    absentWithoutApology: [
      "Nelius Waithira", "Kenneth Muchoki", "Edwin Nyaga", "John Macharia", "Phillip Gatimu",
    ],
  },
};

export const SEED_MEETINGS = [
  AGM_2025_MEETING,
  ...[
    "2026-01-13", "2026-02-10", "2026-03-10", "2026-04-14",
    "2026-05-12", "2026-06-09", "2026-07-14", "2026-08-11",
    "2026-09-08",
  ].map((date, i) => ({
    id: `mtg-2026-${String(i + 1).padStart(2, "0")}`,
    title: `Monthly Meeting ${date.slice(0, 7)}`,
    date,
    time: "20:30",
    venue: "Google Meet",
    agenda: MONTHLY_MEETINGS_AGENDA,
    minutesId: null,
    president: "Marvin Karanja",
    secretary: "Susan Wambui",
    attendance: {
      membersPresent: [
        "David Muhia", "Marvin Karanja", "Peter Maina", "Jane Wangari",
        "Susan Wambui", "Simon Kamau", "Peter Kariuki",
      ],
      absentWithApology: [],
      absentWithoutApology: ["Nelius Waithira", "Kenneth Muchoki"],
    },
  })),
  {
    id: "mtg-2026-10",
    title: "Monthly Meeting Oct 2026",
    date: "2026-10-13",
    time: "20:30",
    venue: "Google Meet",
    agenda: MONTHLY_MEETINGS_AGENDA,
    minutesId: null,
    president: "Marvin Karanja",
    secretary: "Susan Wambui",
    attendance: null,
  },
];

export const SEED_FINES = [
  {
    id: "fine-1",
    memberId: "m8",
    type: "late",
    label: "Late payment fine — Feb 2026 contribution",
    amount: 100,
    date: "2026-02-10",
    status: "unpaid",
  },
  {
    id: "fine-2",
    memberId: "m9",
    type: "meeting",
    label: "Missed meeting fine — Feb 2026",
    amount: 100,
    date: "2026-02-10",
    status: "unpaid",
  },
  {
    id: "fine-3",
    memberId: "m3",
    type: "meeting",
    label: "Three consecutive missed meetings — Mar 2026",
    amount: 500,
    date: "2026-03-10",
    status: "unpaid",
  },
];

export const SEED_LOANS = [
  {
    id: "loan-1",
    memberId: "m6",
    amount: 15000,
    interestPct: 10,
    date: "2026-03-01",
    reason: "School fees",
    status: "active",
    repayments: [
      { date: "2026-04-01", amount: 2500 },
      { date: "2026-05-01", amount: 2500 },
      { date: "2026-06-01", amount: 2500 },
    ],
  },
];

export const SEED_WITHDRAWALS = [];

// Members kept active despite arrears > a full year, because they have made
// concrete efforts to clear their arrears, so they remain active.
const KEEP_ACTIVE_ARREARS = ["Danson Ngumba", "John Macharia"];

export const SEED_BANK_ACCOUNTS = [
  {
    id: "bank-kcb",
    name: "KCB — Group Main Account",
    accountName: "Nyakahura Elites Investment Group",
    accountNumber: "5221-100-0090",
    balance: 153700,
    updatedAt: "2026-09-20",
    txns: [
      { date: "2026-06-01", amount: 12000, note: "June contributions" },
      { date: "2026-07-01", amount: 11800, note: "July contributions" },
      { date: "2026-07-05", amount: -50000, note: "Transfer to KCB Money Market Fund" },
    ],
  },
];

export const SEED_MMF = {
  id: "mmf-kcb",
  name: "KCB Money Market Fund",
  balance: 50000,
  unitPrice: 118.4,
  shares: 422.3,
  updatedAt: "2026-09-20",
  txns: [
    { date: "2026-07-05", amount: 50000, note: "Initial investment (per MIN.07/AGM/2025)" },
  ],
};

export const SEED_ANNOUNCEMENTS = [
  {
    id: "ann-1",
    title: "Welcome to the members' portal",
    body: "Member dashboard, savings statements, minutes and announcements are now available online. Kindly review your details and keep your phone number up to date.",
    date: "2026-09-10",
    published: true,
  },
  {
    id: "ann-2",
    title: "Arrears settlement reminder",
    body: "Members are reminded to clear outstanding arrears. Monthly contributions are due by the 5th of the following month — late payment attracts a fine of Ksh 100.",
    date: "2026-06-15",
    published: true,
  },
  {
    id: "ann-3",
    title: "Contribution rises to Ksh 1,000 from January 2027",
    body: "Starting January 2027 the monthly contribution increases to Ksh 1,000 per member as agreed. Plan ahead so your savings keep growing.",
    date: "2026-09-01",
    published: true,
  },
];

// Partner schools for the group's annual mentorship outreach programme.
// The Organising Secretary plans one visit per school every year.
export const MENTORSHIP_SCHOOLS = [
  "Nyakahura Primary School",
  "Mugechi Kaboro Primary School",
  "Nyakahura Secondary School",
];

const MENTORSHIP_PROGRAM = [
  "Arrival & introductions",
  "Career talks & role models",
  "Lives of the group & saving culture",
  "Q&A with the learners",
  "Token handover & photos",
];

export const SEED_EVENTS = [
  {
    id: "evt-funday-2026",
    title: "Elites Fun Day 2026",
    type: "Fun Day",
    date: "2026-10-03",
    time: "10:00",
    venue: "Rolfs Place, Ngong Road",
    goal: "A relaxed family day out for members, spouses and children to bond beyond boardroom meetings.",
    details:
      "Venue confirmed at Rolfs Place along Ngong Road. Tents, catering, games and prizes currently being quoted — plan to be presented to the executive for approval.",
    program: [
      "Arrival & welcome",
      "Group games & tug of war",
      "Picnic lunch",
      "Team challenges",
      "Awards & closing",
    ],
    budget: [
      { label: "Venue hire", est: 15000 },
      { label: "Tents & seating", est: 8000 },
      { label: "Catering", est: 25000 },
      { label: "Games & prizes", est: 5000 },
    ],
    contact: "Simon Kamau · 0701 990 100",
    status: "planned",
    recurring: "",
    createdAt: "2026-09-15",
  },
  {
    id: "evt-mentor-np-2025",
    title: "Mentorship Day 2025 — Nyakahura Primary",
    type: "Mentorship",
    school: "Nyakahura Primary School",
    date: "2025-11-07",
    time: "09:00",
    venue: "Nyakahura Primary School",
    goal: "Annual mentorship visit — career talks and group savings culture.",
    details: "Completed successfully. Learners engaged, tokens shared with top performers.",
    program: MENTORSHIP_PROGRAM,
    budget: [],
    contact: "Simon Kamau",
    status: "completed",
    recurring: "annual",
    createdAt: "2025-10-05",
  },
  {
    id: "evt-mentor-mk-2025",
    title: "Mentorship Day 2025 — Mugechi Kaboro Primary",
    type: "Mentorship",
    school: "Mugechi Kaboro Primary School",
    date: "2025-11-14",
    time: "09:00",
    venue: "Mugechi Kaboro Primary School",
    goal: "Annual mentorship visit — career talks and group savings culture.",
    details: "Completed successfully. Learners engaged, tokens shared with top performers.",
    program: MENTORSHIP_PROGRAM,
    budget: [],
    contact: "Simon Kamau",
    status: "completed",
    recurring: "annual",
    createdAt: "2025-10-05",
  },
  {
    id: "evt-mentor-ns-2025",
    title: "Mentorship Day 2025 — Nyakahura Secondary",
    type: "Mentorship",
    school: "Nyakahura Secondary School",
    date: "2025-11-21",
    time: "10:00",
    venue: "Nyakahura Secondary School",
    goal: "Annual mentorship visit — career guidance and saving for students.",
    details: "Completed successfully with the students' careers club.",
    program: MENTORSHIP_PROGRAM,
    budget: [],
    contact: "Simon Kamau",
    status: "completed",
    recurring: "annual",
    createdAt: "2025-10-05",
  },
  {
    id: "evt-mentor-np-2026",
    title: "Mentorship Day 2026 — Nyakahura Primary",
    type: "Mentorship",
    school: "Nyakahura Primary School",
    date: "2026-11-06",
    time: "09:00",
    venue: "Nyakahura Primary School",
    goal: "Annual mentorship visit — career talks and group savings culture.",
    details: "Confirm timing with the school head, budget tokens and transport.",
    program: MENTORSHIP_PROGRAM,
    budget: [{ label: "Tokens & refreshments", est: 10000 }],
    contact: "Simon Kamau",
    status: "planned",
    recurring: "annual",
    createdAt: "2026-09-01",
  },
  {
    id: "evt-mentor-mk-2026",
    title: "Mentorship Day 2026 — Mugechi Kaboro Primary",
    type: "Mentorship",
    school: "Mugechi Kaboro Primary School",
    date: "2026-11-13",
    time: "09:00",
    venue: "Mugechi Kaboro Primary School",
    goal: "Annual mentorship visit — career talks and group savings culture.",
    details: "Coordinate transport with Nyakahura Primary visits to cut costs.",
    program: MENTORSHIP_PROGRAM,
    budget: [{ label: "Tokens & refreshments", est: 10000 }],
    contact: "Simon Kamau",
    status: "planned",
    recurring: "annual",
    createdAt: "2026-09-01",
  },
  {
    id: "evt-mentor-ns-2026",
    title: "Mentorship Day 2026 — Nyakahura Secondary",
    type: "Mentorship",
    school: "Nyakahura Secondary School",
    date: "2026-11-20",
    time: "10:00",
    venue: "Nyakahura Secondary School",
    goal: "Annual mentorship visit — career guidance and saving for students.",
    details: "Tie in with the school careers day where possible.",
    program: MENTORSHIP_PROGRAM,
    budget: [{ label: "Tokens & refreshments", est: 10000 }],
    contact: "Simon Kamau",
    status: "planned",
    recurring: "annual",
    createdAt: "2026-09-01",
  },
];

export const SEED_ACTION_ITEMS = [
  {
    id: "act-1",
    minutesId: "min-agm-2025",
    ref: "MIN.05/AGM/2025",
    title: "Clear member arrears",
    owner: "All members",
    dueDate: "2026-04-05",
    status: "done",
  },
  {
    id: "act-2",
    minutesId: "min-agm-2025",
    ref: "MIN.06/AGM/2025",
    title: "Executive handover & induction",
    owner: "Former & new executive",
    dueDate: "2026-02-01",
    status: "done",
  },
  {
    id: "act-3",
    minutesId: "min-agm-2025",
    ref: "MIN.07/AGM/2025",
    title: "Open KCB Money Market Fund",
    owner: "Jane Wangari (Treasurer)",
    dueDate: "2026-07-31",
    status: "done",
  },
  {
    id: "act-4",
    minutesId: "min-agm-2025",
    ref: "MIN.04/AGM/2025",
    title: "Hold 2026 Fun Day (June–August)",
    owner: "Organizing Secretary",
    dueDate: "2026-08-30",
    status: "open",
  },
];

export function buildSeed() {
  const members = MEMBERS;
  const accounts = [];
  const history = [];
  let fees = [];
  const savingsRecord = [];

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

  for (const member of members) {
    const monthly = CONTRIBUTIONS_2026[member.memberNo];
    if (!monthly) continue;

    history.splice(
      0,
      history.length,
      ...history.filter(
        (entry) => !(entry.memberId === member.id && entry.date.startsWith("2026-")),
      ),
    );

    monthly.forEach((amount, monthIndex) => {
      if (!amount) return;
      const month = String(monthIndex + 1).padStart(2, "0");
      history.push({
        id: `${member.id}-2026-${month}-recorded`,
        memberId: member.id,
        date: `2026-${month}-05`,
        amount,
        type: "contribution",
        note: `2026 ${month} contribution (uploaded record)`,
      });
    });
  }

  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const row = SAVINGS_RECORD_ROWS.find((r) =>
      r.name === member.name ||
      (member.memberNo === "NE-002" && r.name === "David Muhia") ||
      (member.memberNo === "NE-004" && r.name === "Vincent Ng'ang'a") ||
      (member.memberNo === "NE-013" && r.name === "Nelius Waithira") ||
      (member.memberNo === "NE-017" && r.name === "John Macharia"),
    ) || null;
    if (!row) continue;

    const account = accounts.find((a) => a.memberId === member.id);
    account.balance = row.grandTotal;

    const frozen = row.arrears > 6000 && !KEEP_ACTIVE_ARREARS.includes(member.name);
    member.status = frozen ? "frozen" : "active";

    fees = fees.filter((f) => f.memberId !== member.id);
    if (row.arrears > 0) {
      fees.push({
        id: `${member.id}-arrears`,
        memberId: member.id,
        type: "arrears",
        label: "Savings arrears per record (09/06/2026)",
        amount: row.arrears,
        dueDate: "2026-06-09",
        status: "unpaid",
      });
    }

    savingsRecord.push({
      memberId: member.id,
      row: i + 1,
      memberNo: member.memberNo,
      name: member.name,
      years: {
        2023: row.y2023,
        2024: row.y2024,
        2025: row.y2025,
        2026: row.y2026,
      },
      grandTotal: row.grandTotal,
      arrears: row.arrears,
    });
  }

  return { members, accounts, history, fees, investments: INVESTMENTS, savingsRecord };
}