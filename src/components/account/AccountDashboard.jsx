import { Link } from "react-router-dom";
import {
  Wallet,
  CalendarCheck,
  AlertCircle,
  TrendingUp,
  LogOut,
  Landmark,
  Briefcase,
  HandHeart,
  ArrowRight,
} from "lucide-react";
import BackLink from "../BackLink";
import BackToLogin from "../BackToLogin";
import {
  getMember,
  getAccount,
  getHistory,
  getFees,
  getInvestments,
  KES,
} from "../../lib/store";

const CATEGORY_ICONS = {
  land: Landmark,
  business: Briefcase,
  loan: HandHeart,
};

export default function AccountDashboard({ session, onLogout }) {
  const member = getMember(session.memberId);
  const account = getAccount(session.memberId);
  const history = getHistory(session.memberId).slice(0, 12);
  const fees = getFees(session.memberId);
  const investments = getInvestments();

  const feeTotal = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);

  if (!account) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-sand px-6 text-center">
        <p className="font-serif text-2xl font-bold text-navy">
          This account has no member portal yet.
        </p>
        <p className="mt-2 text-sm text-navy/70">
          {member ? `${member.name}, please contact the group leadership.` : "Please contact the group leadership."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <BackLink
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </BackLink>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand">
<header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3 lg:gap-6">
            <BackToLogin
              to="/account"
              onLogout={onLogout}
              className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-3.5 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
            >
              Back
            </BackToLogin>
            <Link to="/" className="hidden items-center gap-2 sm:flex">
              <img
                src="/logo.png"
                alt="Nyakahura Elites"
                className="h-10 w-10 rounded-full object-contain"
              />
              <span className="font-serif text-lg font-bold text-navy">
                Nyakahura Elites
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-navy">{member.name}</p>
              <p className="text-xs text-navy/50">{member.memberNo}</p>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
              Member Portal
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-navy sm:text-4xl">
              Karibu, {member.name.split(" ")[0]}
            </h1>
            <p className="mt-1 text-sm text-navy/60">
              Membership since {account.memberSince}
            </p>
          </div>
          {member.occupation && (
            <p className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy ring-1 ring-navy/10">
              {member.occupation}
            </p>
          )}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-3xl bg-navy p-7 text-white shadow-lg shadow-navy/10">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold/20 text-gold">
                <Wallet className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-white/70">
                Current Savings Balance
              </p>
            </div>
            <p className="mt-5 font-serif text-3xl font-bold">
              {KES(account.balance)}
            </p>
            <p className="mt-1 text-xs text-white/60">
              Monthly contribution: {KES(account.monthlyContribution)}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-navy/5">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green/10 text-green">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-navy/70">
                Contributions Made
              </p>
            </div>
            <p className="mt-5 font-serif text-3xl font-bold text-navy">
              {account.contributionsMade}
            </p>
            <p className="mt-1 text-xs text-navy/50">
              Last: {account.lastContribution || "—"}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-navy/5">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-navy/70">Unpaid Fees</p>
            </div>
            <p className="mt-5 font-serif text-3xl font-bold text-navy">
              {fees.length > 0 ? `${fees.length} · ${KES(feeTotal)}` : "None"}
            </p>
            <p className="mt-1 text-xs text-navy/50">
              {fees.length > 0 ? "Due — please settle soon" : "All settled, asante"}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-navy">
                Outstanding Fees
              </h2>
              <span className="text-xs font-semibold text-navy/50">
                {fees.length} pending
              </span>
            </div>

            {fees.length === 0 ? (
              <p className="mt-6 rounded-2xl bg-green/5 px-5 py-6 text-sm font-medium text-green ring-1 ring-green/10">
                You have no unpaid fees. Save on!
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {fees.map((fee) => (
                  <li
                    key={fee.id}
                    className="flex items-center justify-between rounded-2xl bg-sand px-5 py-4 ring-1 ring-navy/5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-navy">
                        {fee.label}
                      </p>
                      <p className="mt-0.5 text-xs text-navy/50">
                        Due {fee.dueDate}
                        {fee.type === "fine" ? " · Fine" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">
                        {KES(fee.amount)}
                      </p>
                      <span className="mt-1 inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-600">
                        Unpaid
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-navy">
                Contribution History
              </h2>
              <span className="text-xs font-semibold text-navy/50">
                Recent 12
              </span>
            </div>

            <ul className="mt-5 divide-y divide-navy/5">
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between py-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-navy">
                      {entry.note}
                    </p>
                    <p className="mt-0.5 text-xs text-navy/45">{entry.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green">
                      {entry.type === "dividend" ? "+" : ""}
                      {KES(entry.amount)}
                    </p>
                    {entry.type === "dividend" && (
                      <span className="mt-1 inline-flex rounded-full bg-green/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-green">
                        Dividend
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
                Group Investments
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-navy">
                Where the group's money works
              </h2>
            </div>
            <p className="text-sm text-navy/60">
              Total invested:{" "}
              <span className="font-bold text-navy">{KES(totalInvested)}</span>{" "}
              · Current value:{" "}
              <span className="font-bold text-green">{KES(totalValue)}</span>
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {investments.map((inv) => {
              const Icon = CATEGORY_ICONS[inv.category] || TrendingUp;
              const gain = inv.currentValue - inv.amount;
              const gainPct = ((gain / inv.amount) * 100).toFixed(1);
              const isUp = gain >= 0;
              return (
                <article
                  key={inv.id}
                  className="rounded-2xl bg-sand p-6 ring-1 ring-navy/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 text-navy">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy">{inv.title}</p>
                      <p className="text-xs capitalize text-navy/50">
                        {inv.category} · {inv.date}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-navy/50">Invested</p>
                      <p className="font-serif text-xl font-bold text-navy">
                        {KES(inv.amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-navy/50">Now worth</p>
                      <p className="font-serif text-xl font-bold text-green">
                        {KES(inv.currentValue)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                      isUp ? "bg-green/10 text-green" : "bg-red-100 text-red-600"
                    }`}
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    {isUp ? "+" : ""}
                    {gainPct}%
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-navy/60">
                    {inv.notes}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-navy/50">
          Need a change or a question about your account? Reach the group
          leadership through the contact section on the main site.
          <Link
            to="/#get-involved"
            className="ml-1 inline-flex items-center gap-1 font-semibold text-navy hover:text-gold-dark"
          >
            Contact us <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      </main>
    </div>
  );
}