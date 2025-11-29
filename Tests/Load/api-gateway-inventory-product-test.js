import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  thresholds: {
    http_req_failed: ["rate<0.20"],
    http_req_duration: ["p(95)<3000"],
  },
  vus: 1,
  duration: "20s"
};

const TARGET_HOST = __ENV.TARGET_HOST;

export default function () {
  const productId = Math.floor(Math.random() * 5) + 1;
  
  let url = `${TARGET_HOST}/api/inventory/product/${productId}`;
  let res = http.get(url);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "inventory returned": (r) => !!r.json(),
  });

  sleep(1);
}
