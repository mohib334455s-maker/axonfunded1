"use client";

import { Users, Shield, TrendingUp, Globe, Zap, Award, Heart } from "lucide-react";
import GoldButton from "@/components/ui/GoldButton";
import { useAboutDict } from "@/hooks/useAboutDict";

const VALUE_ICONS = [Shield, TrendingUp, Globe, Heart, Award, Zap] as const;

type AboutStat = { value: string; label: string };
type AboutTeamMember = { name: string; role: string; desc: string; avatar: string };

export default function AboutPageClient() {
  const { dict: a } = useAboutDict();
  const stats = a.stats as AboutStat[];
  const team = a.team as AboutTeamMember[];

  return (
    <div className="pt-20">
      <section className="relative overflow-hidden bg-black py-24 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/30 bg-gold-500/5 mb-6">
            <Users className="w-3.5 h-3.5 text-gold-500" />
            <span className="text-sm text-gold-500 font-medium">{a.heroBadge}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            {a.heroLine1}
            <br />
            <span className="text-gold-gradient">{a.heroLine2}</span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">{a.heroLead}</p>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 border-y border-white/5 bg-surface/50">
        <div className="max-w-4xl mx-auto text-center">
          {stats.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-4xl font-black text-gold-500 font-mono">{s.value}</p>
                  <p className="text-sm text-neutral-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 leading-relaxed max-w-xl mx-auto">{a.statsPlaceholder}</p>
          )}
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-bold text-gold-500 uppercase tracking-widest block mb-4">{a.missionKicker}</span>
              <h2 className="text-3xl font-black text-white mb-6 leading-tight">{a.missionTitle}</h2>
              <p className="text-neutral-400 leading-relaxed mb-6">{a.missionP1}</p>
              <p className="text-neutral-400 leading-relaxed mb-6">{a.missionP2}</p>
              <p className="text-neutral-400 leading-relaxed">{a.missionP3}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {a.values.slice(0, 4).map((v, i) => {
                const Icon = VALUE_ICONS[i] ?? Shield;
                return (
                  <div key={v.title} className="rounded-2xl border border-white/8 bg-surface p-5">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-gold-500" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">{v.title}</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">{v.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-surface/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">{a.valuesTitle}</h2>
            <p className="text-neutral-400">{a.valuesSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {a.values.map((v, i) => {
              const Icon = VALUE_ICONS[i] ?? Shield;
              return (
                <div
                  key={v.title}
                  className="flex items-start gap-4 p-5 rounded-2xl border border-white/5 bg-surface hover:border-gold-500/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1.5">{v.title}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">{a.teamTitle}</h2>
            <p className="text-neutral-400">{a.teamSubtitle}</p>
          </div>
          {team.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <div key={member.name} className="rounded-2xl border border-white/8 bg-surface p-5 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center text-black font-black text-xl mx-auto mb-4">
                    {member.avatar}
                  </div>
                  <h3 className="text-sm font-bold text-white">{member.name}</h3>
                  <p className="text-xs text-gold-500 mt-0.5 mb-3">{member.role}</p>
                  <p className="text-xs text-neutral-500 leading-relaxed">{member.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 text-center max-w-xl mx-auto leading-relaxed">{a.teamPlaceholder}</p>
          )}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-surface/40">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{a.ctaTitle}</h2>
          <p className="text-neutral-400 mb-8">{a.ctaLead}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GoldButton href="/challenge" size="lg">
              {a.ctaPrimary}
            </GoldButton>
            <GoldButton href="/contact" variant="outline" size="lg">
              {a.ctaSecondary}
            </GoldButton>
          </div>
        </div>
      </section>
    </div>
  );
}
