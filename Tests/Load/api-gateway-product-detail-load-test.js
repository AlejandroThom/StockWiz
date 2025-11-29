import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  thresholds: {
    http_req_failed: ["rate<0.20"],
    http_req_duration: ["p(95)<5000"],
  },
  stages: [
    { duration: "15s", target: 5 },
    { duration: "45s", target: 15 },
    { duration: "10s", target: 0 },
  ],
};

const TARGET_HOST = __ENV.TARGET_HOST;

export default function () {
  const productId = Math.floor(Math.random() * 5) + 1;

  let url = `${TARGET_HOST}/api/products/${productId}`;
  const res = http.get(
    url
  );

  check(res, {
    "status OK": (r) => r.status === 200,
    "returns JSON": (r) => !!r.json(),
    "includes inventory": (r) => {
      const json = r.json();
      return json.inventory === null || typeof json.inventory === "object";
    }
  });

  sleep(1);
}
