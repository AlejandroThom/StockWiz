import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  vus: 1,
  duration: "5s",
};
const TARGET_HOST = __ENV.TARGET_HOST;
export default function () {

  let url = `${TARGET_HOST}/api/products`;

  // Crear producto
  let createRes = http.post(
    url,
    JSON.stringify({
      name: "k6 Load Test Product",
      description: "Omelo",
      Category:"chino",
      price: Math.floor(Math.random() * 1000) + 100,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  check(createRes, {
    "create OK (201)": (r) => r.status === 201,
  });

  const created = createRes.json();
  const id = created?.id;

  if (!id) {
    sleep(1);
    return;
  }

  // Actualizar producto
  let updateRes = http.put(
    url+`/${id}`,
    JSON.stringify({
      name: "Updated Test Product",
      description : "Omelo chino,soy Homero pero chino",
      price: Math.floor(Math.random() * 500) + 50,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  check(updateRes, {
    "update OK (200)": (r) => r.status === 200,
  });

  // Borrar producto
  let deleteRes = http.del(url+`/${id}`);

  check(deleteRes, {
    "delete OK (204)": (r) => r.status === 204,
  });

  sleep(1);
}
