import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { todayStr } from "../utils/format";

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
      <section className="bg-brand-700 px-4 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight md:text-5xl">
            Rent the perfect car for your next trip
          </h1>
          <p className="mt-4 max-w-xl text-blue-100">Affordable daily rates and cars for every occasion.</p>
          <form onSubmit={search} className="mt-8 grid gap-3 rounded-xl bg-white p-4 text-gray-800 shadow-lg md:grid-cols-3">
            <label className="text-sm text-gray-500">Pickup date
              <input type="date" min={todayStr()} value={from} onChange={(e) => setFrom(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-800" />
            </label>
            <label className="text-sm text-gray-500">Return date
              <input type="date" min={from || todayStr()} value={to} onChange={(e) => setTo(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-800" />
            </label>
            <button className="self-end rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700">
              Search available cars
            </button>
          </form>
        </div>
      </section>
    </>
  );
}