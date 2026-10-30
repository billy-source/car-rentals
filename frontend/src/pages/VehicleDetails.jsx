import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Car, Users, Fuel, Settings } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/ui";
import { formatKES, getError, todayStr } from "../utils/format";

export default function VehicleDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [active, setActive] = useState(0);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    api.get(`/vehicles/${id}/`).then((r) => setVehicle(r.data)).catch((e) => setError(getError(e)));
  }, [id]);

  const start = watch("start_date");
  const end = watch("end_date");
  const days = start && end ? Math.round((new Date(end) - new Date(start)) / 86400000) : 0;

  if (error) return <div className="py-20 text-center"><Alert>{error}</Alert></div>;
  if (!vehicle) return <p className="py-20 text-center text-gray-500">Loading...</p>;

  const total = days > 0 ? days * Number(vehicle.price_per_day) : 0;
  const images = vehicle.images || [];
  const input = "mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-brand-500";

  const onSubmit = async (form) => {
    setSubmitError("");
    try {
      await api.post("/bookings/", { vehicle: vehicle.id, ...form });
      navigate("/my-bookings");
    } catch (e) {
      setSubmitError(getError(e));
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/vehicles" className="text-sm text-brand-600 hover:underline">← Back to vehicles</Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div>
          {images.length ? (
            <>
              <img src={images[active].image} alt="" className="h-64 w-full rounded-xl object-cover" />
              <div className="mt-2 flex gap-2">
                {images.map((im, i) => (
                  <img key={im.id} src={im.image} alt="" onClick={() => setActive(i)}
                    className={`h-16 w-20 cursor-pointer rounded-lg object-cover ${i === active ? "ring-2 ring-brand-500" : "opacity-70"}`} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl bg-gray-100">
              <Car className="h-20 w-20 text-gray-300" />
            </div>
          )}
          <h1 className="mt-5 text-3xl font-bold">{vehicle.make} {vehicle.model} {vehicle.year}</h1>
          <p className="mt-1 text-gray-500">{vehicle.category}</p>
          <div className="mt-4 flex flex-wrap gap-5 text-gray-600">
            <span className="flex items-center gap-1"><Users className="h-5 w-5" />{vehicle.seats} seats</span>
            <span className="flex items-center gap-1"><Settings className="h-5 w-5" />{vehicle.transmission}</span>
            <span className="flex items-center gap-1"><Fuel className="h-5 w-5" />{vehicle.fuel}</span>
          </div>
          {vehicle.description && <p className="mt-4 text-gray-600">{vehicle.description}</p>}
          <p className="mt-6 text-3xl font-bold">
            {formatKES(vehicle.price_per_day)}<span className="text-base font-normal text-gray-500"> / day</span>
          </p>
        </div>

        <div className="h-fit rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Book this car</h2>
          {!user ? (
            <p className="mt-4 text-gray-600">
              Please <Link to="/login" state={{ from: { pathname: `/vehicles/${id}` } }} className="text-brand-600 underline">log in</Link> or{" "}
              <Link to="/register" className="text-brand-600 underline">create an account</Link> to book.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm text-gray-500">Pickup
                  <input type="date" min={todayStr()} className={input}
                    {...register("start_date", { required: "Required" })} />
                  {errors.start_date && <span className="text-xs text-red-600">{errors.start_date.message}</span>}
                </label>
                <label className="text-sm text-gray-500">Return
                  <input type="date" min={start || todayStr()} className={input}
                    {...register("end_date", {
                      required: "Required",
                      validate: (v) => !start || v > start || "Must be after pickup",
                    })} />
                  {errors.end_date && <span className="text-xs text-red-600">{errors.end_date.message}</span>}
                </label>
              </div>
              <textarea placeholder="Notes (optional)" rows={2} className={input} {...register("notes")} />
              {total > 0 && (
                <div className="rounded-lg bg-brand-50 p-3 text-sm">
                  <div className="flex justify-between"><span>{formatKES(vehicle.price_per_day)} × {days} day(s)</span><span>{formatKES(total)}</span></div>
                  <p className="mt-1 text-xs text-gray-500">The final price and deposit are confirmed by the server.</p>
                </div>
              )}
              <Alert>{submitError}</Alert>
              <button disabled={isSubmitting}
                className="w-full rounded-lg bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                {isSubmitting ? "Submitting..." : "Request booking"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
