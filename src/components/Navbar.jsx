import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "Our Story", href: "#story" },
  { label: "Leadership", href: "#leadership" },
  { label: "Mentorship Programs", href: "#mentorship" },
  { label: "Community Impact", href: "#impact" },
  { label: "Get Involved", href: "#get-involved" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-black/5">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-10">
        <a href="#" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Nyakahura Elites"
            className="h-10 w-10 rounded-full object-cover ring-1 ring-navy/10"
          />
          <span className="font-serif text-lg font-bold text-navy">Nyakahura Elites</span>
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-navy/80 transition-colors hover:text-navy"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/account"
            className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-light"
          >
            Member Login
          </Link>
          <ThemeToggle className="text-navy hover:bg-navy/10" />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle className="text-navy hover:bg-navy/10" />
          <button
            className="lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-black/5 bg-white px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-navy/80"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="rounded-full bg-navy px-6 py-2.5 text-center text-sm font-semibold text-white"
            >
              Member Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}