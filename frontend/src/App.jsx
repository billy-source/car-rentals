import { Link, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Vehicles from "./pages/Vehicles";
import VehicleDetails from "./pages/VehicleDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyBookings from "./pages/MyBookings";
import AdminBookings from "./pages/admin/Bookings";
import ManageVehicles from "./pages/admin/ManageVehicles";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-800">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/:id" element={<VehicleDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={["staff", "admin"]}><AdminBookings /></ProtectedRoute>} />
          <Route path="/admin/vehicles" element={<ProtectedRoute roles={["admin"]}><ManageVehicles /></ProtectedRoute>} />
          <Route path="*" element={
            <div className="py-24 text-center">
              <h1 className="text-3xl font-bold">Page not found</h1>
              <Link to="/" className="mt-4 inline-block text-brand-600 underline">Go home</Link>
            </div>
          } />
        </Routes>
      </main>
      <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} DriveEasy Car Rentals
      </footer>
    </div>
  );
}