const MONTHS = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const ROLE_KEYS = [
  { key: "viceChairperson", re: /vice\s?chair\s?person/i },
  { key: "organizingSecretary", re: /organi[sz]ing\s?secretary/i },
  { key: "nominatedMember", re: /nominated\s?member/i },
  { key: "treasurer", re: /treasurer/i },
  { key: "secretary", re: /secretary/i },
  { key: "chairperson", re: /chair\s?person/i },
];

const ACTION_SIGNALS =
  /\b(shall|will be|to be|agreed to|agreed that|resolved that|deadline|follow up|follow-up|by \d{1,2}(st|nd|rd|th)?|before (january|february|march|april|may|june|july|august|september|october|november|december)|open the|to open|to settle|to organise|to organize|to submit|to remit|to update)\b/i;

const IGNORED_LINES = /^(s\/?no\.?|no\.?|name|role|s\.?\s*no\.?)$/i;

const pad = (n) => String(n).padStart(2, "0");

export function tidyLine(line) {
  return String(line || "")
    .replace(/\u00a0/g, " ")
    .replace(/[\u2018\u2019\u201b]/g, "'")
    .replace(/[\u201c\u201d\u201e]/g, '"')
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\u2022/g, "")
    .replace(/\t+/g, "  ")
    .trim();
}

const KEEP_UPPER = new Set([
  "agm",
  "egm",
  "aob",
  "mmf",
  "neig",
  "kcb",
  "ksh",
  "usd",
  "ceo",
  "icp",
]);

function titleCase(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\b([a-z]{2,5})\b/g, (m) => (KEEP_UPPER.has(m) ? m.toUpperCase() : m))
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/([A-Za-z])'([A-Za-z])/g, (_, a, b) => `${a}'${b.toLowerCase()}`);
}

function toTime24(token) {
  const raw = String(token || "").toLowerCase();
  const meridiem = /p/.test(raw) ? "pm" : /a/.test(raw) ? "am" : null;
  const m = /(\d{1,2})[:.](\d{2})/.exec(raw);
  if (m) {
    let hour = Number(m[1]) % 24;
    const minute = Math.min(59, Number(m[2]));
    if (meridiem === "pm" && hour < 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
    return `${pad(hour)}:${pad(minute)}`;
  }
  const d = /^(\d{3,4})$/.exec(raw.trim());
  if (d) {
    const value = d[1].padStart(4, "0");
    return `${value.slice(0, 2)}:${value.slice(2, 4)}`;
  }
  return "";
}

function toIsoDate(day, monthName, year) {
  const month = MONTHS[String(monthName || "").toLowerCase()];
  if (!month) return "";
  return `${year}-${pad(month)}-${pad(day)}`;
}

function parseDateFromLine(line) {
  const iso = /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(line);
  if (iso) return `${iso[1]}-${pad(iso[2])}-${pad(iso[3])}`;

  const words = /(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3,9})\.?,?\s+(\d{4})/i.exec(line);
  if (words && MONTHS[words[2].toLowerCase()]) {
    return toIsoDate(Number(words[1]), words[2], words[3]);
  }

  const numeric = /(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/.exec(line);
  if (numeric) {
    const year = Number(numeric[3]) < 100 ? 2000 + Number(numeric[3]) : Number(numeric[3]);
    return `${year}-${pad(numeric[2])}-${pad(numeric[1])}`;
  }
  return "";
}

function findDueDate(text) {
  const words = /(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3,9})\.?,?\s+(\d{4})/i.exec(text);
  if (words && MONTHS[words[2].toLowerCase()]) {
    return toIsoDate(Number(words[1]), words[2], words[3]);
  }
  return "";
}

function meetingTypeFromText(text) {
  if (/annual\s+general\s+meeting|\bAGM\b/i.test(text)) return "AGM";
  if (/extra[\s-]?ordinary|emergency|special\s+meeting|\bEGM\b/i.test(text)) return "Special";
  if (/monthly\s+meeting/i.test(text)) return "Monthly";
  return "Monthly";
}

function defaultTitle(type, meetingDate) {
  const year = (meetingDate || "").slice(0, 4);
  if (type === "AGM") return "Annual General Meeting";
  if (type === "Special") return "Special Meeting";
  const monthIndex = Number((meetingDate || "").slice(5, 7)) - 1;
  const month = MONTH_NAMES[monthIndex] || "";
  return `Monthly Meeting ${month} ${year}`.trim();
}

function cleanPersonName(text) {
  return titleCase(
    String(text || "")
      .replace(/^\s*\d+[.)]?\s*/, "")
      .replace(/\s+/g, " ")
      .replace(/[^A-Za-z' .\-]/g, "")
      .trim(),
  );
}

function looksLikePersonName(text) {
  const value = String(text || "").trim();
  if (!value || value.length > 45) return false;
  const parts = value.split(/\s+/);
  if (parts.length > 4) return false;
  return parts.every((p) => /^[A-Z][A-Za-z'.\-]*[.,]?$/.test(p));
}

function normaliseKey(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function tokenise(text) {
  return new Set(
    String(text || "")
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((t) => t.length > 1),
  );
}

function lettersOnly(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function nameParts(name) {
  const words = String(name || "")
    .split(/[\s.]+/)
    .filter(Boolean);
  if (!words.length) return { first: "", last: "" };
  return {
    first: lettersOnly(words[0]),
    last: lettersOnly(words[words.length - 1]),
  };
}

function editDistance(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let i = 0; i < rows; i += 1) grid[i][0] = i;
  for (let j = 0; j < cols; j += 1) grid[0][j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      grid[i][j] = Math.min(
        grid[i - 1][j] + 1,
        grid[i][j - 1] + 1,
        grid[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return grid[rows - 1][cols - 1];
}

function similarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  return 1 - editDistance(a, b) / Math.max(a.length, b.length);
}

export function resolveAliasMember(name, members, aliases) {
  const map = aliases || {};
  const key = Object.keys(map).find((k) => normaliseKey(k) === normaliseKey(name));
  if (!key) return null;
  return (
    (members || []).find((m) => normaliseKey(m.name) === normaliseKey(map[key])) || null
  );
}

export function suggestMemberMatch(name, members, aliases) {
  const target = cleanPersonName(name);
  const key = normaliseKey(target);
  if (!key) return null;
  const list = members || [];

  const alias = resolveAliasMember(target, list, aliases);
  if (alias) return alias;

  const exact = list.find((m) => normaliseKey(m.name) === key);
  if (exact) return exact;

  const words = target.split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    const surname = lettersOnly(words[0] || "");
    return list.find((m) => nameParts(m.name).last === surname) || null;
  }

  const from = nameParts(target);
  let best = null;
  let bestScore = 0;
  list.forEach((member) => {
    const to = nameParts(member.name);
    const lastSim = similarity(from.last, to.last);
    if (lastSim < 0.6) return;
    const firstSim = similarity(from.first, to.first);
    if (firstSim < 0.6) return;
    const score = lastSim * 2 + firstSim;
    if (score > bestScore) {
      bestScore = score;
      best = member;
    }
  });
  if (best) return best;

  const sameFirstName = list.filter((m) => nameParts(m.name).first === from.first);
  return sameFirstName.length === 1 ? sameFirstName[0] : null;
}

export function parseMinutesText(rawText) {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map(tidyLine);

  const draft = {
    title: "",
    meetingType: "Monthly",
    meetingDate: "",
    startTime: "",
    endTime: "",
    venue: "",
    chairperson: "",
    viceChairperson: "",
    treasurer: "",
    secretary: "",
    organizingSecretary: "",
    nominatedMember: "",
    membersPresent: [],
    absentWithApology: [],
    absentWithoutApology: [],
    agenda: [],
    resolutions: [],
    writtenBy: "",
    approvedBy: "",
    warnings: [],
  };

  const header = lines.slice(0, 14).join(" ");
  draft.meetingType = meetingTypeFromText(header);
  const titleLine = lines.find((l) => /MINUTES\s+OF\s+THE/i.test(l));
  draft.title = titleLine
    ? titleCase(titleLine.replace(/.*MINUTES\s+OF\s+THE\s+/i, "").replace(/[:\.]+$/, ""))
    : "";
  const heldLine = lines.find((l) => /held|convened|took place/i.test(l)) || "";
  draft.meetingDate = parseDateFromLine(heldLine) || parseDateFromLine(header);
  if (!draft.meetingDate) {
    const dateLine = lines.find((l) => parseDateFromLine(l));
    if (dateLine) draft.meetingDate = parseDateFromLine(dateLine);
  }
  if (!draft.title) draft.title = defaultTitle(draft.meetingType, draft.meetingDate);

  if (heldLine) {
    const withoutDate = heldLine.replace(
      /(\d{1,2})(?:st|nd|rd|th)?\s+[a-z]{3,9}\.?,?\s+\d{4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}/i,
      " ",
    );
    const times = (withoutDate.match(/\b\d{1,2}[:.]\d{2}\s*(?:am|pm)?|\b\d{3,4}\b/gi) || [])
      .map(toTime24)
      .filter(Boolean);
    if (times[0]) draft.startTime = times[0];
    if (times[1]) draft.endTime = times[1];
  }
  if (!draft.startTime) draft.startTime = "20:30";
  if (!draft.endTime) draft.endTime = "21:30";

  const venueLine = lines
    .slice(0, 14)
    .find((l) => /^(venue|place of meeting)\s*[:\-–]/i.test(l) || /\bheld at\b/i.test(l));
  if (venueLine) {
    const m = /(?:venue|place of meeting|held at)\s*[:\-–]?\s*(.+)$/i.exec(venueLine);
    if (m && m[1].length <= 80) draft.venue = tidyLine(m[1]);
  }
  if (!draft.venue) draft.venue = "Google Meet";

  const committeeStart = lines.findIndex((l) => /executive\s+committee|committee\s+members|office\s+bearers/i.test(l));
  if (committeeStart >= 0) {
    for (let i = committeeStart + 1; i < lines.length; i += 1) {
      const line = lines[i];
      if (!line) continue;
      if (/MEMBERS\s+PRESENT|AGENDA|MIN\.\d/i.test(line)) break;
      const parts = line.split(/\s+[-–]\s+|\s{2,}|\s-\s/);
      if (parts.length >= 2) {
        const role = parts.slice(1).join(" ").trim();
        const name = cleanPersonName(parts[0]);
        const hit = ROLE_KEYS.find((r) => r.re.test(role));
        if (hit && name && !draft[hit.key]) draft[hit.key] = name;
      }
    }
  }

  const headerLines = lines.slice(0, 12);
  if (!draft.chairperson) {
    const seat = headerLines.find((l) => /chair\s?person/i.test(l));
    const name = seat
      ? cleanPersonName(seat.replace(/chair\s?person/i, "").replace(/[:\-–]/g, " "))
      : "";
    if (looksLikePersonName(name)) draft.chairperson = name;
  }
  if (!draft.secretary) {
    const seat = headerLines.find(
      (l) => /\bsecretary\b/i.test(l) && !/organi[sz]ing/i.test(l),
    );
    const name = seat
      ? cleanPersonName(seat.replace(/\bsecretary\b/i, "").replace(/[:\-–]/g, " "))
      : "";
    if (looksLikePersonName(name)) draft.secretary = name;
  }

  let mode = "";
  const bodyLines = [];
  const flushBody = () => {
    if (!bodyLines.length) return;
    const current = draft.resolutions[draft.resolutions.length - 1];
    const extra = bodyLines
      .filter((l) => !IGNORED_LINES.test(l) && !/^\d+[.)]?$/.test(l))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (current && extra) current.body = [current.body, extra].filter(Boolean).join(" ");
    bodyLines.length = 0;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const resolution = /^(MIN[.\s]?\d+[^\s:]*)\s*[:\-–]\s*(.+)$/i.exec(line);
    if (resolution) {
      flushBody();
      draft.resolutions.push({ ref: resolution[1].toUpperCase(), title: titleCase(resolution[2]), body: "" });
      mode = "resolutions";
      continue;
    }
    if (/MINUTES\s+WRITTEN\s+BY|WRITTEN\s+BY|APPROVED\s+BY/i.test(line)) {
      mode = "signoff";
      const inline = /WRITTEN\s+BY\s*[:\-–]?\s*(.+?)\s+APPROVED\s+BY\s*[:\-–]?\s*(.+)$/i.exec(line);
      if (inline) {
        const written = cleanPersonName(inline[1]);
        const approved = cleanPersonName(inline[2]);
        if (looksLikePersonName(written)) draft.writtenBy = written;
        if (looksLikePersonName(approved)) draft.approvedBy = approved;
      }
      continue;
    }
    if (/^\s*(members?\s+)?present\b/i.test(line) && !/absent/i.test(line)) {
      mode = "present";
      continue;
    }
    if (/absent\s+with(out)?\s+apolog/i.test(line)) {
      mode = /absent\s+without/i.test(line) ? "absentWithout" : "absentWith";
      continue;
    }
    if (/^\s*agenda\b/i.test(line)) {
      mode = "agenda";
      continue;
    }
    if (!line) continue;
    if (IGNORED_LINES.test(line) || /^\d+[.)]?$/.test(line)) continue;

    if (mode === "present") draft.membersPresent.push(cleanPersonName(line));
    else if (mode === "absentWith") draft.absentWithApology.push(cleanPersonName(line));
    else if (mode === "absentWithout") draft.absentWithoutApology.push(cleanPersonName(line));
    else if (mode === "agenda") draft.agenda.push(line.replace(/^\s*\d+[.)]\s*/, "").trim());
    else if (mode === "resolutions") bodyLines.push(line);
    else if (mode === "signoff") {
      const parts = line.split(/\s{2,}/).map((p) => cleanPersonName(p)).filter(Boolean);
      parts.forEach((part) => {
        if (/^(secretary|chair\s?person|chairperson|treasurer)$/i.test(part)) return;
        if (!draft.writtenBy) draft.writtenBy = part;
        else if (!draft.approvedBy) draft.approvedBy = part;
      });
    }
  }

  flushBody();
  draft.resolutions = draft.resolutions.filter((r) => r.title);

  const seen = new Set();
  ["membersPresent", "absentWithApology", "absentWithoutApology"].forEach((key) => {
    draft[key] = draft[key].filter((n) => {
      const key2 = normaliseKey(n);
      if (!key2 || seen.has(key2)) return false;
      seen.add(key2);
      return true;
    });
  });
  draft.agenda = draft.agenda.filter((a, i, all) => a && all.indexOf(a) === i);

  if (!draft.membersPresent.length && !draft.absentWithApology.length && !draft.absentWithoutApology.length) {
    draft.warnings.push("No attendance headings were found in this document.");
  }
  if (!draft.agenda.length) draft.warnings.push("No agenda items were found.");
  if (!draft.resolutions.length) draft.warnings.push("No numbered resolutions were found.");
  if (!draft.meetingDate) draft.warnings.push("The meeting date could not be read — set it before importing.");

  return draft;
}

export function proposeActionItems(draft) {
  const officerByRole = {
    treasurer: draft.treasurer,
    secretary: draft.secretary,
    chairperson: draft.chairperson,
    organizer: draft.organizingSecretary,
  };
  return (draft.resolutions || [])
    .filter((r) => ACTION_SIGNALS.test(r.body || "") || ACTION_SIGNALS.test(r.title || ""))
    .map((r) => {
      const body = r.body || "";
      const head = /newly elected/i.test(body) ? "" : body.slice(0, 160);
      const ownerRole = ["treasurer", "secretary", "chairperson", "organizing secretary"].find(
        (role) => head.toLowerCase().includes(role),
      );
      return {
        ref: r.ref,
        title: r.title,
        body,
        owner: ownerRole && officerByRole[ownerRole] ? `${officerByRole[ownerRole]}` : "",
        dueDate: findDueDate(body),
        include: true,
      };
    });
}

let mammothLoader = null;

function loadMammoth() {
  if (!mammothLoader) {
    mammothLoader = import("mammoth").then((mod) => mod.default || mod);
  }
  return mammothLoader;
}

export async function extractMinutesDocument(file) {
  const name = String(file?.name || "").toLowerCase();
  const buffer = await file.arrayBuffer();
  if (name.endsWith(".docx")) {
    const mammoth = await loadMammoth();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return { text: result.value, kind: "docx" };
  }
  if (name.endsWith(".pdf")) {
    return { text: await extractPdfText(buffer), kind: "pdf" };
  }
  throw new Error("Upload a .docx or .pdf minutes document.");
}

let pdfjsLoader = null;

function loadPdfjs() {
  if (!pdfjsLoader) {
    pdfjsLoader = Promise.all([
      import("pdfjs-dist"),
      import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    ]).then(([lib, worker]) => {
      const pdfjs = lib.default || lib;
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default || worker;
      return pdfjs;
    });
  }
  return pdfjsLoader;
}

async function extractPdfText(buffer) {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages = [];
  for (let pageNo = 1; pageNo <= doc.numPages; pageNo += 1) {
    const page = await doc.getPage(pageNo);
    const content = await page.getTextContent();
    const rows = new Map();
    content.items.forEach((item) => {
      if (!item.str || !item.str.trim()) return;
      const y = Math.round((item.transform?.[5] ?? 0) * 4) / 4;
      const row = rows.get(y) || [];
      row.push({ x: item.transform?.[4] ?? 0, str: item.str });
      rows.set(y, row);
    });
    const lines = [...rows.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, row]) =>
        row
          .sort((a, b) => a.x - b.x)
          .map((i) => i.str)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim(),
      )
      .filter(Boolean);
    pages.push(lines.join("\n"));
  }
  const text = pages.join("\n\n");
  if (!text.trim()) {
    throw new Error("No selectable text was found in that PDF — it may be a scanned image.");
  }
  return text;
}

export function matchExistingMeeting(draft, meetings) {
  const list = meetings || [];
  if (!draft.meetingDate) return null;
  const sameDay = list.filter((m) => m.date === draft.meetingDate);
  if (!sameDay.length) return null;
  if (sameDay.length === 1) return sameDay[0];

  const target = tokenise(`${draft.title} ${draft.meetingType}`);
  let best = null;
  let bestScore = 0;
  sameDay.forEach((meeting) => {
    const tokens = tokenise(meeting.title || "");
    if (!tokens.size) return;
    let shared = 0;
    target.forEach((t) => {
      if (tokens.has(t)) shared += 1;
    });
    const score = shared / Math.max(target.size, tokens.size);
    if (score > bestScore) {
      bestScore = score;
      best = meeting;
    }
  });
  return bestScore >= 0.5 ? best : null;
}
