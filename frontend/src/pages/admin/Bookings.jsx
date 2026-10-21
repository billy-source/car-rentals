import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Alert, Pagination, StatusBadge } from "../../components/ui";
import { formatKES, getError } from "../../utils/format";

const STATUSES = ["", "pending", "approved", "active", "completed", "rejected", "cancelled"];

export default function AdminBookings() {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // { booking, type: "pickup" | "return" }
  const [modalError, setModalError] = useState("");
  const [handover, setHandover] = useState({ mileage: "", notes: "" });

  const load = useCallback(() => {
    const params = { page };
    if (status) params.status = status;
    api.get("/bookings/", { params })
      .then((r) => { setData(r.data); setError(""); })
      .catch((e) => setError(getError(e)));
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const act = async (id, action) => {
    if (["reject", "cancel"].includes(action) && !confirm(`Are you sure you want to ${action} this booking?`)) return;
    try {
      await api.post(`/bookings/${id}/${action}/`);
      load();
    } catch (e) {
      setError(getError(e));
    }
  };

  const submitHandover = async (e) => {
    e.preventDefault();
    setModalError("");
    try {
      await api.post(`/bookings/${modal.booking.id}/${modal.type}/`, {
        mileage: Number(handover.mileage),
        notes: handover.notes,
      });
      setModal(null);
      load();
    } catch (err) {
      setModalError(getError(err));
    }
  };

  const openModal = (booking, type) => {
    setHandover({ mileage: "", notes: "" });
    setModalError("");
    setModal({ booking, type });
  };

  const btn = "rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-gray-50";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Bookings</h1>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border bg-white px-3 py-2 text-sm capitalize">
          {STATUSES.map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
        </select>
      </div>
      <div className="mt-4"><Alert>{error}</Alert></div>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3">#</th><th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.results.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="px-4 py-3">{b.id}</td>
                <td className="px-4 py-3">{b.customer_name}<br /><span className="text-xs text-gray-400">{b.customer_phone}</span></td>
                <td className="px-4 py-3">{b.vehicle_name}</td>
                <td className="px-4 py-3 whitespace-nowrap">{b.start_date} → {b.end_date}</td>
                <td className="px-4 py-3">{formatKES(b.total_price)}</td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {isAdmin && b.status === "pending" && (
                      <>
                        <button className={`${btn} text-green-700`} onClick={() => act(b.id, "approve")}>Approve</button>
                        <button className={`${btn} text-red-600`} onClick={() => act(b.id, "reject")}>Reject</button>
                      </>
                    )}
                    {b.status === "approved" && <button className={btn} onClick={() => openModal(b, "pickup")}>Pickup</button>}
                    {b.status === "active" && <button className={btn} onClick={() => openModal(b, "return")}>Return</button>}
                    {isAdmin && ["pending", "approved"].includes(b.status) && (
                      <button className={`${btn} text-red-600`} onClick={() => act(b.id, "cancel")}>Cancel</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.results.length === 0 && <p className="p-8 text-center text-gray-500">No bookings found.</p>}
      </div>
      <Pagination data={data} page={page} setPage={setPage} />

      {modal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={submitHandover} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold capitalize">
              Record {modal.type} — booking #{modal.booking.id}
            </h2>
            <input type="number" min="0" required placeholder="Current mileage (km)" value={handover.mileage}
              onChange={(e) => setHandover({ ...handover, mileage: e.target.value })}
              className="w-full rounded-lg border px-3 py-2" />
            <textarea rows={3} placeholder="Vehicle condition, damage, fuel level..." value={handover.notes}
              onChange={(e) => setHandover({ ...handover, notes: e.target.value })}
              className="w-full rounded-lg border px-3 py-2" />
            <Alert>{modalError}</Alert>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setModal(null)} className="rounded-lg border px-4 py-2 text-sm">Close</button>
              <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}