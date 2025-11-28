import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  thresholds: {
    http_req_failed: ['rate<0.20'],      // <20% errores
    http_req_duration: ['p(95)<900'],    // P95 < 900ms
  },

  stages: [
    { duration: '10s', target: 20 },     // ramp-up
    { duration: '40s', target: 50 },     // carga sostenida
    { duration: '10s', target: 0 },      // ramp-down
  ]
};
const TARGET_HOST = __ENV.TARGET_HOST;

export default function () {
  
  let url = `${TARGET_HOST}/api/products`;
  const res = http.get(url);

  check(res, {
    "status 200": (r) => r.status === 200,
    "body not empty": (r) => r.body && r.body.length > 2,
  });

  sleep(1);
}
