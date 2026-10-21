import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/ui";
import { getError } from "../utils/format";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (form) => {
    setError("");
    try {
      await api.post("/auth/register/", form);
      await login(form.username, form.password);
      navigate("/vehicles", { replace: true });
    } catch (e) {
      setError(getError(e));
    }
  };

  const input = "w-full rounded-lg border px-3 py-2 outline-none focus:border-brand-500";
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Create account</h1>
        <div className="grid grid-cols-2 gap-3">
          <input className={input} placeholder="First name" {...register("first_name", { required: true })} />
          <input className={input} placeholder="Last name" {...register("last_name", { required: true })} />
        </div>
        <input className={input} placeholder="Username" {...register("username", { required: true })} />
        <input className={input} type="email" placeholder="Email" {...register("email", { required: true })} />
        <input className={input} placeholder="Phone (e.g. 0712345678)" {...register("phone", { required: true })} />
        <div>
          <input className={input} type="password" placeholder="Password"
            {...register("password", { required: true, minLength: { value: 8, message: "At least 8 characters" } })} />
          {errors.password && <span className="text-xs text-red-600">{errors.password.message}</span>}
        </div>
        <Alert>{error}</Alert>
        <button disabled={isSubmitting} className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {isSubmitting ? "Creating..." : "Sign up"}
        </button>
        <p className="text-center text-sm text-gray-500">
          Already registered? <Link to="/login" className="text-brand-600 underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}