export const formatKES = (n) => `KES ${Number(n).toLocaleString()}`;

export const todayStr = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

export const vehicleImage = (v) => (v.images?.find((i) => i.is_primary) || v.images?.[0])?.image;

export function getError(err) {
  const d = err.response?.data;
  if (!d) return "Cannot reach the server. Is the backend running?";
  if (typeof d === "string") return "Something went wrong on the server.";
  if (d.detail) return d.detail;
  return Object.values(d).flat().join(" ");
}