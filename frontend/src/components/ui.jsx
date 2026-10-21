const COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  active: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-200 text-gray-700",
};

export function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${COLORS[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
}

export function Alert({ children, type = "error" }) {
  if (!children) return null;
  const style = type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700";
  return <p className={`rounded-lg border px-3 py-2 text-sm ${style}`}>{children}</p>;
}

export function Pagination({ data, page, setPage }) {
  if (!data || (!data.next && !data.previous)) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button disabled={!data.previous} onClick={() => setPage(page - 1)}
        className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-40">Previous</button>
      <span className="text-sm text-gray-500">Page {page}</span>
      <button disabled={!data.next} onClick={() => setPage(page + 1)}
        className="rounded-lg border bg-white px-4 py-2 text-sm disabled:opacity-40">Next</button>
    </div>
  );
}