import http from "k6/http";
import { check } from "k6";

export let options = { vus: 5, duration: "20s" };

const TARGET_HOST = __ENV.TARGET_HOST;

export default function () {
  const url = `${TARGET_HOST}/health`;
  const res = http.get(url);
  check(res, { "healthy": (r) => r.status === 200 });
}
