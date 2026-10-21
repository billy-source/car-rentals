import { Link } from "react-router-dom";
import { Car, Users, Fuel, Settings } from "lucide-react";
import { formatKES, vehicleImage } from "../utils/format";

export default function VehicleCard({ v }) {
  const img = vehicleImage(v);
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md">
      {img ? (
        <img src={img} alt={`${v.make} ${v.model}`} className="h-44 w-full object-cover" />
      ) : (
        <div className="flex h-44 items-center justify-center bg-gray-100">
          <Car className="h-14 w-14 text-gray-300" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{v.make} {v.model} <span className="font-normal text-gray-400">{v.year}</span></h3>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">{v.category}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Users className="h-4 w-4" />{v.seats}</span>
          <span className="flex items-center gap-1"><Settings className="h-4 w-4" />{v.transmission}</span>
          <span className="flex items-center gap-1"><Fuel className="h-4 w-4" />{v.fuel}</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p>
            <span className="text-lg font-bold">{formatKES(v.price_per_day)}</span>
            <span className="text-sm text-gray-500"> / day</span>
          </p>
          <Link to={`/vehicles/${v.id}`} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            View
          </Link>
        </div>
      </div>
    </div>
  );
}