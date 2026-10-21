import { Link, NavLink, useNavigate } from "react-router-dom";
import { Car } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isStaff = user && ["staff", "admin"].includes(user.role);

  const link = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:text-brand-600"}`;

  return (
    <header className="sticky top-0 z-30 border-b bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-brand-700">
          <Car className="h-6 w-6" /> DriveEasy
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/vehicles" className={link}>Vehicles</NavLink>
          {user && !isStaff && <NavLink to="/my-bookings" className={link}>My Bookings</NavLink>}
          {isStaff && <NavLink to="/admin" end className={link}>Bookings</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin/vehicles" className={link}>Manage Vehicles</NavLink>}
          {user ? (
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600"
            >
              Log out ({user.username})
            </button>
          ) : (
            <>
              <NavLink to="/login" className={link}>Log in</NavLink>
              <Link to="/register" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}