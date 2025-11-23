/*import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],      // <1% errores
    http_req_duration: ['p(95)<450'],    // P95 < 450ms
  },

  stages: [
    { duration: '10s', target: 20 },     // ramp-up
    { duration: '40s', target: 50 },     // carga sostenida
    { duration: '10s', target: 0 },      // ramp-down
  ]
};

export default function () {
  const res = http.get('http://localhost:8000/api/products');

  check(res, {
    "status 200": (r) => r.status === 200,
    "body not empty": (r) => r.body && r.body.length > 2,
  });

  sleep(1);
}