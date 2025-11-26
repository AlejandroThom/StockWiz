import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
  vus: 20,
  duration: "40s"
};

export default function () {
  const productId = Math.floor(Math.random() * 5) + 1;

  let res = http.get(`http://localhost:8000/api/inventory/product/${productId}`);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "inventory returned": (r) => !!r.json(),
  });

  sleep(1);
}
