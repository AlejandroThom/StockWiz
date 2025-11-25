import http from "k6/http";
import { check } from "k6";

export let options = { vus: 5, duration: "20s" };

export default function () {
  const res = http.get("http://localhost:8000/health");
  check(res, { "healthy": (r) => r.status === 200 });
}
