import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  thresholds: {
    http_req_failed: ["rate<0.20"],
    http_req_duration: ["p(95)<3000"],
  },
  stages: [
    { duration: "10s", target: 2 },
    { duration: "20s", target: 1 },
    { duration: "10s", target: 0 },
  ],
};

const TARGET_HOST = __ENV.TARGET_HOST;

export default function () {
  const id = Math.floor(Math.random() * 5) + 1;

  let url = `${TARGET_HOST}/api/inventory/${id}`;

  let res = http.get(url);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "returns JSON": (r) => !!r.json(),
  });

  sleep(1);
}
