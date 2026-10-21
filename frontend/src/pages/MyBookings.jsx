import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { Alert, Pagination, StatusBadge } from "../components/ui";
import { formatKES, getError, todayStr } from "../utils/format";

export default function MyBookings() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api.get("/bookings/", { params: { page } })
      .then((r) => setData(r.data))
      .catch((e) => setError(getError(e)));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const cancel = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await api.post(`/bookings/${id}/cancel/`);
      load();
    } catch (e) {
      setError(getError(e));
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">My bookings</h1>
      <div className="mt-4"><Alert>{error}</Alert></div>

      {data?.results.length === 0 && (
        <p className="mt-12 text-center text-gray-500">
          No bookings yet. <Link to="/vehicles" className="text-brand-600 underline">Browse vehicles</Link>
        </p>
      )}

      <div className="mt-6 space-y-4">
        {data?.results.map((b) => (
          <div key={b.id} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{b.vehicle_name}</h3>
                <p className="text-sm text-gray-500">{b.start_date} → {b.end_date}</p>
              </div>
              <StatusBadge status={b.status} />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <p>Total <b>{formatKES(b.total_price)}</b> · Deposit <b>{formatKES(b.deposit_amount)}</b></p>
              {["pending", "approved"].includes(b.status) && b.start_date > todayStr() && (
                <button onClick={() => cancel(b.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50">
                  Cancel booking
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <Pagination data={data} page={page} setPage={setPage} />
    </div>
  );
}