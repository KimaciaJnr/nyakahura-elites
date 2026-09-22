import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  FileText,
  Landmark,
  Users2,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Gauge,
} from "lucide-react";
import {
  getActiveMembers,
  getMeetings,
  getMinutes,
  getActionItems,
  getSubCommittees,
  getEvents,
  getContributionStatements,
  getUnpaidTotals,
  getLoans,
  contributionDeadline,
  getContributionForMonth,
  KES,
} from "../../lib/store";

const LINK = {
  treasurer: "/treasurer",
  secretary: "/secretary",
  chair: "/chairperson",
  vicechair: "/vice-chair",
  organising: "/organising",
};

const ROLE_META = [
  { key: "treasurer", label: "Treasurer", icon: Wallet, blurb: "Contributions, statements & cash" },
  { key: "secretary", label: "Secretary", icon: FileText, blurb: "Minutes, records & follow-ups" },
  { key: "chair", label: "Chairperson", icon: Landmark, blurb: "Meetings & leadership" },
  { key: "vicechair", label: "Vice Chair", icon: Users2, blurb: "Sub-committees & discipline" },
  { key: "organising", label: "Organising", icon: CalendarDays, blurb: "Events, drives & mentorship" },
];

function StateDot({ state }) {
  const styles =
    state === "ready"
      ? "bg-green"
      : state === "attention"
        ? "bg-amber-400"
        : "bg-red-400";
  return <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${styles}`} />;
}

function CheckRow({ state, text, sub }) {
  return (
    <li className="flex items-start gap-2.5">
      <StateDot state={state} />
      <div>
        <p className="text-sm text-navy/80">{text}</p>
        {sub && <p className="text-xs text-navy/50">{sub}</p>}
      </div>
    </li>
  );
}

const CoverIcon = {
  ready: CheckCircle2,
  attention: AlertTriangle,
  no: XCircle,
};

export default function ReadinessPanel() {
  const hub = useMemo(() => {
    const active = getActiveMembers();
    const meetings = getMeetings();
    const minutes = getMinutes();
    const actionItems = getActionItems();
    const subComm = getSubCommittees();
    const events = getEvents();
    const statements = getContributionStatements();
    const unpaid = getUnpaidTotals();
    const loans = getLoans().filter((l) => l.status === "active");
    const TODAY = new Date().toISOString().slice(0, 10);
    const monthNow = TODAY.slice(0, 7);
    const expected = getContributionForMonth(monthNow);
    const deadline = contributionDeadline(monthNow);
    const stmtForMonth = statements.find((s) => s.month === monthNow) || null;

    const sortedMeetings = meetings
      .slice()
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    const lastHeld = sortedMeetings.find((m) => m.date <= TODAY) || null;
    const nextScheduled = sortedMeetings.find((m) => m.date && m.date >= TODAY) || null;

    const minutesForLastMeeting = minutes.some((mn) => mn.meetingId === lastHeld?.id);
    const hasAttendance =
      lastHeld && lastHeld.attendance && lastHeld.attendance.membersPresent
        ? lastHeld.attendance.membersPresent.length > 0
        : false;
    const overdueActions = actionItems.filter(
      (a) => a.status === "open" && a.dueDate && a.dueDate < TODAY,
    );
    const activeCommittees = subComm.filter((s) => s.status !== "inactive");
    const committeesWithoutLead = activeCommittees.filter((s) => !s.lead);
    const plannedArr = events.filter((e) => e.status === "planned");
    const eventsWithoutVenue = plannedArr.filter((e) => !e.venue);
    const overdueEvents = plannedArr.filter((e) => e.date && e.date < TODAY);
    const organisingReady =
      overdueEvents.length === 0 && eventsWithoutVenue.length === 0;

    const uncovered =
      stmtForMonth && stmtForMonth.unmatched && stmtForMonth.unmatched.length > 0
        ? stmtForMonth.unmatched.length
        : 0;

    const roles = [
      {
        key: "treasurer",
        state: stmtForMonth ? "ready" : "attention",
        checks: [
          {
            state: stmtForMonth ? "ready" : "attention",
            text: stmtForMonth
              ? `Statement uploaded for ${monthNow}`
              : `No statement uploaded for ${monthNow}`,
            sub: stmtForMonth ? `Deadline ${deadline}` : "Upload under Treasury portal",
          },
          {
            state: uncovered ? "attention" : "ready",
            text: uncovered ? `${uncovered} unmatched row${uncovered === 1 ? "" : "s"}` : "All rows matched to members",
          },
          {
            state: unpaid.count ? "attention" : "ready",
            text: unpaid.count ? `${unpaid.count} unpaid fee${unpaid.count === 1 ? "" : "s"} (${KES(unpaid.amount)})` : "No unpaid fees",
          },
        ],
      },
      {
        key: "secretary",
        state: minutesForLastMeeting && nextScheduled ? "ready" : "attention",
        checks: [
          {
            state: minutesForLastMeeting ? "ready" : "attention",
            text: minutesForLastMeeting ? "Minutes recorded for last meeting" : "Last meeting minutes not yet recorded",
            sub: lastHeld ? `Last meeting ${lastHeld.date}` : "No past meetings yet",
          },
          {
            state: nextScheduled ? "ready" : "attention",
            text: nextScheduled ? `Next meeting scheduled ${nextScheduled.date}` : "No upcoming meeting scheduled",
            sub: nextScheduled?.agenda?.length ? `${nextScheduled.agenda.length} agenda items` : undefined,
          },
          {
            state: overdueActions.length ? "attention" : "ready",
            text: overdueActions.length
              ? `${overdueActions.length} overdue action item${overdueActions.length === 1 ? "" : "s"}`
              : "No overdue action items",
          },
        ],
      },
      {
        key: "chair",
        state: hasAttendance ? "ready" : "attention",
        checks: [
          {
            state: hasAttendance ? "ready" : "attention",
            text: hasAttendance ? "Attendance recorded for last meeting" : "Attendance not yet recorded for last meeting",
            sub: lastHeld ? `Last meeting ${lastHeld.date}` : "No past meetings yet",
          },
          {
            state: nextScheduled ? "ready" : "attention",
            text: nextScheduled ? `${active.length} active members to mobilise` : "No upcoming meeting on the calendar",
            sub: `Contribution ${KES(expected)}/mo`,
          },
        ],
      },
      {
        key: "vicechair",
        state: activeCommittees.length && !committeesWithoutLead.length ? "ready" : "attention",
        checks: [
          {
            state: activeCommittees.length ? "ready" : "attention",
            text: activeCommittees.length
              ? `${activeCommittees.length} sub-committee${activeCommittees.length === 1 ? "" : "s"} active`
              : "No active sub-committees",
          },
          {
            state: committeesWithoutLead.length ? "attention" : "ready",
            text: committeesWithoutLead.length
              ? `${committeesWithoutLead.length} committee${committeesWithoutLead.length === 1 ? "" : "s"} without a lead`
              : "All committees have a lead",
          },
          {
            state: loans.length ? "ready" : "attention",
            text: loans.length ? `${loans.length} active loan${loans.length === 1 ? "" : "s"} on the books` : "No active loans",
          },
        ],
      },
      {
        key: "organising",
        state: organisingReady ? "ready" : "attention",
        checks: [
          {
            state: plannedArr.length ? "ready" : "attention",
            text: plannedArr.length
              ? `${plannedArr.length} event${plannedArr.length === 1 ? "" : "s"} planned`
              : "No events planned yet",
          },
          {
            state: eventsWithoutVenue.length ? "attention" : "ready",
            text: eventsWithoutVenue.length ? `${eventsWithoutVenue.length} planned event${eventsWithoutVenue.length === 1 ? "" : "s"} missing a venue` : "All planned events have a venue",
          },
          {
            state: overdueEvents.length ? "attention" : "ready",
            text: overdueEvents.length ? `${overdueEvents.length} event${overdueEvents.length === 1 ? "" : "s"} past date still "planned"` : "No overdue planned events",
          },
        ],
      },
    ];

    const uncoveredCount =
      roles.filter((r) => r.state === "attention").length;
    return { roles, uncovered: uncoveredCount };
  }, []);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-navy">
            <Gauge className="h-5 w-5 text-gold-dark" />
            Role readiness
          </h2>
          <p className="mt-1 text-sm text-navy/60">
            One look at what each portal needs before the month closes.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold ${
            hub.uncovered === 0
              ? "bg-green/10 text-green-dark"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {hub.uncovered === 0 ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5" />
          )}
          {hub.uncovered === 0 ? "All portals ready" : `${hub.uncovered} portal${hub.uncovered === 1 ? "" : "s"} need attention`}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {hub.roles.map((role) => {
          const meta = ROLE_META.find((r) => r.key === role.key);
          const Icon = meta.icon;
          const Cover = CoverIcon[role.state];
          return (
            <div
              key={role.key}
              className="flex flex-col rounded-2xl bg-navy/[0.03] p-5 ring-1 ring-navy/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-serif text-sm font-bold text-navy">{meta.label}</p>
                    <p className="text-xs text-navy/50">{meta.blurb}</p>
                  </div>
                </div>
                <Cover
                  className={`h-5 w-5 ${
                    role.state === "ready"
                      ? "text-green"
                      : role.state === "attention"
                        ? "text-amber-500"
                        : "text-red-400"
                  }`}
                />
              </div>

              <ul className="mt-4 flex-1 space-y-3">
                {role.checks.map((c, i) => (
                  <CheckRow key={i} {...c} />
                ))}
              </ul>

              <Link
                to={LINK[role.key]}
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-green transition-colors hover:text-green-dark"
              >
                Open portal
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
