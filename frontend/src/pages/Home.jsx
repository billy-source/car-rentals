import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, CarFront, Check, Clock3, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { todayStr } from "../utils/format";

const benefits = [
  { icon: CarFront, title: "A car for every journey", text: "Find a ride that fits your plans, from city drives to weekend escapes." },
  { icon: CalendarDays, title: "Choose your dates", text: "Check availability for the days that work for you." },
  { icon: ShieldCheck, title: "Book with confidence", text: "Keep your booking details and updates together in one place." },
];

export default function Home() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const search = (e) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (from && to) { q.set("from", from); q.set("to", to); }
    navigate(`/vehicles?${q}`);
  };

  return (
    <>
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div aria-hidden="true" className="absolute -right-40 -top-48 -z-10 h-[34rem] w-[34rem] rounded-full bg-blue-600/25 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-64 left-1/4 -z-10 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:pt-20 lg:pb-20 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-blue-100">
                <Sparkles className="h-4 w-4 text-cyan-300" /> Make the most of the road ahead
              </div>
              <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Your next journey starts with the <span className="text-blue-300">right drive.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
                Find a car that fits your plans. Choose your dates, explore the available rides, and get moving.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/vehicles" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-brand-400">
                  Explore cars <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="inline-flex items-center gap-2 text-sm text-slate-300"><Check className="h-4 w-4 text-cyan-300" /> Simple online booking</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
              <div aria-hidden="true" className="absolute inset-8 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-white/10 to-white/[0.03] p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-blue-200">THE OPEN ROAD IS CALLING</p>
                    <h2 className="mt-2 text-2xl font-semibold">Pick your kind of drive.</h2>
                  </div>
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-200">Ready when you are</span>
                </div>
                <div className="relative mt-8 flex h-48 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 via-slate-800/40 to-cyan-400/10 sm:h-56">
                  <div aria-hidden="true" className="absolute bottom-9 h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  <div aria-hidden="true" className="absolute bottom-0 h-16 w-full bg-gradient-to-t from-blue-950/30 to-transparent" />
                  <CarFront aria-hidden="true" strokeWidth={1.1} className="relative h-36 w-36 text-blue-100 drop-shadow-[0_14px_28px_rgba(96,165,250,0.25)] sm:h-44 sm:w-44" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 backdrop-blur">
                    <MapPin className="h-4 w-4 text-cyan-300" /> Your trip, your way
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                    <p className="text-xs text-slate-400">Find your ride</p>
                    <p className="mt-1 font-medium">Browse available cars</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/10 p-3">
                    <p className="text-xs text-slate-400">Plan ahead</p>
                    <p className="mt-1 flex items-center gap-2 font-medium"><Clock3 className="h-4 w-4 text-cyan-300" /> Pick your dates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={search} className="mt-14 grid gap-4 rounded-2xl bg-white p-4 text-gray-800 shadow-2xl shadow-black/20 sm:p-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="text-sm font-medium text-gray-600">
              <span className="mb-2 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-brand-600" /> Pickup date</span>
              <input type="date" min={todayStr()} value={from} onChange={(e) => { setFrom(e.target.value); if (to && e.target.value > to) setTo(""); }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-gray-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="text-sm font-medium text-gray-600">
              <span className="mb-2 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-brand-600" /> Return date</span>
              <input type="date" min={from || todayStr()} value={to} onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-gray-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </label>
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700">
              Find a car <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">A smoother way to go</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Make every mile yours.</h2>
          <p className="mt-4 text-gray-600">A few simple steps stand between you and your next adventure.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, text }, index) => (
            <article key={title} className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-gray-400">0{index + 1}</p>
              <h3 className="mt-1 text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 leading-6 text-gray-600">{text}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-2xl bg-brand-50 p-6 sm:flex-row sm:p-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Ready to find your next ride?</h3>
            <p className="mt-1 text-gray-600">Explore the cars available for your trip.</p>
          </div>
          <Link to="/vehicles" className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-brand-700 px-5 py-3 font-semibold text-white transition hover:bg-brand-800">
            Browse vehicles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
