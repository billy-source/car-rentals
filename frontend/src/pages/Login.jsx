import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/ui";
import { getError } from "../utils/format";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async ({ username, password }) => {
    setError("");
    try {
      const me = await login(username, password);
      const dest = location.state?.from?.pathname || (["admin", "staff"].includes(me.role) ? "/admin" : "/vehicles");
      navigate(dest, { replace: true });
    } catch (e) {
      setError(e.response?.status === 401 ? "Wrong username or password." : getError(e));
    }
  };

  const input = "w-full rounded-lg border px-3 py-2 outline-none focus:border-brand-500";
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Log in</h1>
        <input className={input} placeholder="Username" {...register("username", { required: true })} />
        <input className={input} type="password" placeholder="Password" {...register("password", { required: true })} />
        <Alert>{error}</Alert>
        <button disabled={isSubmitting} className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
        <p className="text-center text-sm text-gray-500">
          No account? <Link to="/register" className="text-brand-600 underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}