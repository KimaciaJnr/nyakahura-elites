// Role metadata used across auth, portal consoles and mandate cards.
//
// A role belongs to the group, not the person: when an office is handed over,
// the next elected official signs in with the same role account and the portal
// continues as before.

export const MEMBER_ROLE = {
  key: "member",
  label: "Members",
  heading: "Member login",
  portalLabel: "Member Portal",
  blurb: "Sign in to view your savings, fees, loans and group investments.",
  home: "/account",
  isOfficer: false,
};

export const OFFICIAL_ROLES = [
  {
    key: "chairperson",
    label: "Chairperson",
    tag: "The Leader",
    heading: "Chairperson login",
    portalLabel: "Chairperson Portal",
    blurb: "Strategic direction, presiding over meetings and official representation.",
    home: "/chairperson",
    isOfficer: true,
    demo: "chairperson@nyakahura.com / chair1234",
    accent: "bg-gold-dark",
    accentHover: "hover:bg-gold",
    selectedTab: "bg-gold-dark text-white",
    card: "dark",
    mandate: [
      "Official head of the group — provides strategic direction and maintains order.",
      "Presides over meetings: calls them to order, follows the agenda, and manages discussions so everyone is heard.",
      "Signs official documents: counter-signs meeting minutes, official bank letters, and major contracts alongside the Secretary.",
      "Casting vote: casts the deciding vote in the event of a tie during executive decisions.",
      "Representation: acts as the primary spokesperson and public face of the group.",
    ],
  },
  {
    key: "vicechairperson",
    label: "Vice Chairperson",
    tag: "The Deputy",
    heading: "Vice chairperson login",
    portalLabel: "Vice Chairperson Portal",
    blurb: "Backs the Chairperson and keeps the group running in their absence.",
    home: "/vice-chair",
    isOfficer: true,
    demo: "vicechair@nyakahura.com / vicechair1234",
    accent: "bg-green",
    accentHover: "hover:bg-green-dark",
    selectedTab: "bg-green text-white",
    card: "light",
    mandate: [
      "Supports the Chairperson and keeps the group running smoothly in their absence.",
      "Steps in for the Chair: assumes all duties, powers and responsibilities of the Chairperson when they are absent or incapacitated.",
      "Committee oversight: heads special sub-committees and task forces (e.g. a disciplinary or constitutional review committee).",
      "Internal support: assists other committee members with their portfolios to balance the workload.",
    ],
  },
  {
    key: "organising",
    label: "Organising Secretary",
    tag: "The Mobilizer & Logician",
    heading: "Organising secretary login",
    portalLabel: "Organising Secretary Portal",
    blurb: "Drives action — venues, publicity, mobility and events.",
    home: "/organising",
    isOfficer: true,
    demo: "organising@nyakahura.com / organising1234",
    accent: "bg-green",
    accentHover: "hover:bg-green-dark",
    selectedTab: "bg-green text-white",
    card: "light",
    mandate: [
      "Venue and setup: secures meeting venues, sets up public address systems, arranges seating and coordinates refreshments.",
      "Publicity and mobilization: informs members about upcoming events, rallies attendance, and leads recruitment campaigns for new members.",
      "Event coordination: serves as the main coordinator for functions, projects, fundraisers and community outreach programs.",
    ],
  },
  {
    key: "secretary",
    label: "Secretary",
    tag: "The Administrator",
    heading: "Secretary login",
    portalLabel: "Secretary Portal",
    blurb: "Keeps the group's minutes, records, minutes archive and membership register.",
    home: "/secretary",
    isOfficer: true,
    demo: "secretary@nyakahura.com / secretary1234",
    accent: "bg-gold-dark",
    accentHover: "hover:bg-gold",
    selectedTab: "bg-gold-dark text-white",
    card: "dark",
    mandate: [
      "Meeting preparation: prepares and circulates meeting notices, agendas and invitations in consultation with the Chairperson.",
      "Minutes and records: takes accurate minutes during meetings and maintains the official archive of all past minutes and resolutions.",
      "Correspondence: handles all official incoming and outgoing mail, emails and notifications.",
      "Membership register: maintains an up-to-date and accurate list of all registered members.",
    ],
  },
  {
    key: "treasurer",
    label: "Treasurer",
    tag: "The Financial Custodian",
    heading: "Treasurer login",
    portalLabel: "Treasurer Portal",
    blurb: "Financial records, banking operations, reporting and budgeting.",
    home: "/treasurer",
    isOfficer: true,
    demo: "treasurer@nyakahura.com / treasurer1234",
    accent: "bg-green",
    accentHover: "hover:bg-green-dark",
    selectedTab: "bg-green text-white",
    card: "light",
    mandate: [
      "Financial records: keeps an accurate ledger of all income (dues, donations) and expenditure.",
      "Banking operations: operates the group's bank account and is a mandatory signatory for all financial withdrawals.",
      "Financial reporting: prepares and presents regular financial statements to the executive committee and a full report at the Annual General Meeting (AGM).",
      "Budgeting: leads the drafting of the group's annual budget and financial plans.",
    ],
  },
  {
    key: "admin",
    label: "System Admin",
    tag: "The Administrator",
    heading: "Administrator login",
    portalLabel: "Admin Console",
    blurb: "Manage members, accounts, settings and demo data.",
    home: "/admin",
    isOfficer: true,
    demo: "admin@nyakahura.com / admin12345",
    accent: "bg-gold-dark",
    accentHover: "hover:bg-gold",
    selectedTab: "bg-gold-dark text-white",
    card: "dark",
    mandate: [
      "Not an elected role: administers the group app — members, accounts, configurations and demo data.",
      "Owns tools that officers use day to day, so the group data stays consistent across every portal.",
    ],
  },
];

export const ALL_ROLES = [MEMBER_ROLE, ...OFFICIAL_ROLES];

export function getRoleByKey(key) {
  return ALL_ROLES.find((r) => r.key === key) || null;
}

export function getRoleHome(key) {
  const role = getRoleByKey(key);
  return role ? role.home : "/account";
}