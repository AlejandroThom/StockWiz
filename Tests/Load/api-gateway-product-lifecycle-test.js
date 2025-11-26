import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  vus: 10,
  duration: "30s",
};

export default function () {
  // Crear producto
  let createRes = http.post(
    "http://localhost:8000/api/products",
    JSON.stringify({
      name: "k6 Load Test Product",
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
    `http://localhost:8000/api/products/${id}`,
    JSON.stringify({
      name: "Updated Test Product",
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
  let deleteRes = http.del(`http://localhost:8000/api/products/${id}`);

  check(deleteRes, {
    "delete OK (204)": (r) => r.status === 204,
  });

  sleep(1);
}
