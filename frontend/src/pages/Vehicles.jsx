import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import VehicleCard from "../components/VehicleCard";
import { Alert, Pagination } from "../components/ui";
import { getError, todayStr } from "../utils/format";

const CATEGORIES = ["Economy", "Sedan", "SUV", "Van", "Luxury"];

export default function Vehicles() {
  const [sp] = useSearchParams();
  const [filters, setFilters] = useState({
    search: "", category: "", ordering: "price_per_day",
    from: sp.get("from") || "", to: sp.get("to") || "", page: 1,
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const set = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  useEffect(() => {
    const params = { page: filters.page, ordering: filters.ordering };
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.from && filters.to) {
      params.available_from = filters.from;
      params.available_to = filters.to;
    }
    setLoading(true);
    api.get("/vehicles/", { params })
      .then((r) => { setData(r.data); setError(""); })
      .catch((e) => setError(getError(e)))
      .finally(() => setLoading(false));
  }, [filters]);

  const input = "rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Browse vehicles</h1>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <input className={input} placeholder="Search make or model..." value={filters.search}
          onChange={(e) => set("search", e.target.value)} />
        <select className={input} value={filters.category} onChange={(e) => set("category", e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={input} value={filters.ordering} onChange={(e) => set("ordering", e.target.value)}>
          <option value="price_per_day">Price: low to high</option>
          <option value="-price_per_day">Price: high to low</option>
          <option value="-created_at">Newest</option>
        </select>
        <label className="text-xs text-gray-500">From
          <input type="date" min={todayStr()} className={`${input} block`} value={filters.from}
            onChange={(e) => set("from", e.target.value)} />
        </label>
        <label className="text-xs text-gray-500">To
          <input type="date" min={filters.from || todayStr()} className={`${input} block`} value={filters.to}
            onChange={(e) => set("to", e.target.value)} />
        </label>
      </div>

      <div className="mt-6"><Alert>{error}</Alert></div>

      {loading ? (
        <p className="mt-16 text-center text-gray-500">Loading...</p>
      ) : data?.results.length === 0 ? (
        <p className="mt-16 text-center text-gray-500">No vehicles match your search.</p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.results.map((v) => <VehicleCard key={v.id} v={v} />)}
        </div>
      )}

      <Pagination data={data} page={filters.page} setPage={(p) => setFilters((f) => ({ ...f, page: p }))} />
    </div>
  );
}