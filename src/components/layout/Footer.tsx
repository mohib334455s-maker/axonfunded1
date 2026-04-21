"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import InstagramGlyph from "@/components/icons/InstagramGlyph";
import PyramidLogo from "@/components/ui/PyramidLogo";
import { useCommonDict } from "@/hooks/useCommonDict";

const socialMeta = [
  { key: "email" as const, href: "mailto:support@axonfunded.com" },
  { key: "instagram" as const, href: "https://www.instagram.com/axonfunded" },
] as const;

export default function Footer() {
  const { dict } = useCommonDict();
  const year = new Date().getFullYear();

  return (
    <footer className="rounded-none border-t border-white/12 bg-[#12121a] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2">
            <div className="mb-4">
              <PyramidLogo size="sm" animate={false} tagline={dict.nav.brandSlogan} />
            </div>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-neutral-500">{dict.footer.tagline}</p>
            <div className="flex items-center gap-3">
              {socialMeta.map(({ href, key }) => (
                <Link
                  key={key}
                  href={href}
                  aria-label={dict.footer.social[key]}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-neutral-500 transition-all duration-200 hover:border-gold-500/30 hover:text-gold-500"
                >
                  {key === "email" ? (
                    <Mail className="h-4 w-4" strokeWidth={1.25} />
                  ) : (
                    <InstagramGlyph className="h-4 w-4" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {dict.footer.columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-semibold text-white">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-500 transition-colors duration-200 hover:text-gold-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 border-t border-white/8 pt-10 md:flex-row md:items-start md:justify-between">
          <p className="text-sm text-neutral-600">
            © {year} {dict.footer.brandLockup}. {dict.footer.rights}
          </p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
            <span className="text-xs text-neutral-500">{dict.footer.systems}</span>
          </div>
          <div className="max-w-lg text-center text-xs leading-relaxed text-neutral-700 md:text-end space-y-1.5">
            <p>{dict.footer.disclaimer}</p>
            <Link
              href="/legal/risk-disclaimer"
              className="inline-block text-gold-500/90 hover:text-gold-400 hover:underline font-medium"
            >
              {dict.footer.riskDisclaimerFullLink}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
