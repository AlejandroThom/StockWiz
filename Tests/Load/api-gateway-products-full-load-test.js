import http from "k6/http";
import { check, sleep } from "k6";
const TARGET_HOST = __ENV.TARGET_HOST;
export let options = {
  thresholds: {
    http_req_failed: ["rate<0.20"],
    http_req_duration: ["p(95)<1200"], // más pesado
  },
  stages: [
    { duration: "5s", target: 3 },
    { duration: "10s", target: 2 },
    { duration: "10s", target: 0 },
  ],
};

export default function () {
  let url = `${TARGET_HOST}/api/products-full`;
  const res = http.get(url);

  check(res, {
    "status OK": (r) => r.status === 200,
    "is array": (r) => Array.isArray(r.json()),
  });

  sleep(1);
}
