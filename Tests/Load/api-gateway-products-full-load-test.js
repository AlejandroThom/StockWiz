import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<1200"], // más pesado
  },
  stages: [
    { duration: "10s", target: 10 },
    { duration: "30s", target: 25 },
    { duration: "10s", target: 0 },
  ],
};

export default function () {
  const res = http.get("http://localhost:8000/api/products-full");

  check(res, {
    "status OK": (r) => r.status === 200,
    "is array": (r) => Array.isArray(r.json()),
  });

  sleep(1);
}
