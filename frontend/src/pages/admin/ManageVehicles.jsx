import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../api/axios";
import { Alert, Pagination } from "../../components/ui";
import { formatKES, getError } from "../../utils/format";

const EMPTY = {
  make: "", model: "", year: new Date().getFullYear(), category: "Sedan", plate_number: "",
  price_per_day: "", seats: 5, transmission: "Automatic", fuel: "Petrol", mileage: 0,
  description: "", status: "available", is_active: true,
};

function VehicleForm({ vehicle, onDone, onCancel }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: vehicle || EMPTY });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  const onSubmit = async (form) => {
    setError("");
    try {
      const { data } = vehicle
        ? await api.patch(`/vehicles/${vehicle.id}/`, form)
        : await api.post("/vehicles/", form);
      for (const file of files) {
        const fd = new FormData();
        fd.append("image", file);
        await api.post(`/vehicles/${data.id}/upload_image/`, fd);
      }
      onDone();
    } catch (e) {
      setError(getError(e));
    }
  };

  const input = "w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-brand-500";
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3 rounded-xl border bg-white p-5">
      <h2 className="text-lg font-semibold">{vehicle ? "Edit vehicle" : "Add vehicle"}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <input className={input} placeholder="Make" {...register("make", { required: true })} />
        <input className={input} placeholder="Model" {...register("model", { required: true })} />
        <input className={input} type="number" placeholder="Year" {...register("year", { required: true })} />
        <input className={input} placeholder="Category (Sedan, SUV...)" {...register("category", { required: true })} />
        <input className={input} placeholder="Plate number" {...register("plate_number", { required: true })} />
        <input className={input} type="number" step="0.01" placeholder="Price per day" {...register("price_per_day", { required: true })} />
        <input className={input} type="number" placeholder="Seats" {...register("seats", { required: true })} />
        <input className={input} placeholder="Transmission" {...register("transmission")} />
        <input className={input} placeholder="Fuel" {...register("fuel")} />
        <input className={input} type="number" placeholder="Mileage" {...register("mileage")} />
        <select className={input} {...register("status")}>
          <option value="available">Available</option>
          <option value="maintenance">In maintenance</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("is_active")} /> Listed publicly
        </label>
      </div>
      <textarea className={input} rows={2} placeholder="Description" {...register("description")} />
      <label className="block text-sm text-gray-500">Images (you can choose several)
        <input type="file" accept="image/*" multiple className="mt-1 block text-sm"
          onChange={(e) => setFiles([...e.target.files])} />
      </label>
      <Alert>{error}</Alert>
      <div className="flex gap-2">
        <button disabled={isSubmitting} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50">
          {isSubmitting ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border px-5 py-2 text-sm">Cancel</button>
      </div>
    </form>
  );
}

export default function ManageVehicles() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null | "new" | vehicle object
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api.get("/vehicles/", { params: { page, ordering: "-created_at" } })
      .then((r) => setData(r.data))
      .catch((e) => setError(getError(e)));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const remove = async (v) => {
    if (!confirm(`Remove ${v.make} ${v.model} from listings?`)) return;
    try {
      await api.delete(`/vehicles/${v.id}/`);
      load();
    } catch (e) {
      setError(getError(e));
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage vehicles</h1>
        {!editing && (
          <button onClick={() => setEditing("new")} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">
            + Add vehicle
          </button>
        )}
      </div>
      <div className="mt-4"><Alert>{error}</Alert></div>

      {editing && (
        <VehicleForm
          key={editing === "new" ? "new" : editing.id}
          vehicle={editing === "new" ? null : editing}
          onDone={() => { setEditing(null); load(); }}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Plate</th>
              <th className="px-4 py-3">Price/day</th><th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Images</th><th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.results.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="px-4 py-3">{v.make} {v.model} {v.year}<br /><span className="text-xs text-gray-400">{v.category}</span></td>
                <td className="px-4 py-3">{v.plate_number}</td>
                <td className="px-4 py-3">{formatKES(v.price_per_day)}</td>
                <td className="px-4 py-3">
                  {v.status === "maintenance" ? "In maintenance" : "Available"}
                  {!v.is_active && <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-xs">Hidden</span>}
                </td>
                <td className="px-4 py-3">{v.images.length}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => setEditing(v)} className="rounded-md border px-2.5 py-1 text-xs hover:bg-gray-50">Edit</button>
                    {v.is_active && (
                      <button onClick={() => remove(v)} className="rounded-md border px-2.5 py-1 text-xs text-red-600 hover:bg-red-50">Remove</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination data={data} page={page} setPage={setPage} />
    </div>
  );
}