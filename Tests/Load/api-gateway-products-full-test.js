import http from "k6/http";
import { sleep } from "k6";

export let options = {
  scenarios: {
    products: {
      executor: "constant-vus",
      vus: 20,
      duration: "40s",
      exec: "getProducts",
    },
    productById: {
      executor: "constant-vus",
      vus: 15,
      duration: "40s",
      exec: "getProductById",
    },
    productsFull: {
      executor: "constant-vus",
      vus: 10,
      duration: "40s",
      exec: "getProductsFull",
    },
    inventoryByProduct: {
      executor: "constant-vus",
      vus: 15,
      duration: "40s",
      exec: "getInventoryByProduct",
    }
  },
};

export function getProducts() {
  http.get("http://localhost:8000/api/products");
  sleep(1);
}

export function getProductById() {
  const id = Math.floor(Math.random() * 5) + 1;
  http.get(`http://localhost:8000/api/products/${id}`);
  sleep(1);
}

export function getProductsFull() {
  http.get("http://localhost:8000/api/products-full");
  sleep(1);
}

export function getInventoryByProduct() {
  const id = Math.floor(Math.random() * 5) + 1;
  http.get(`http://localhost:8000/api/inventory/product/${id}`);
  sleep(1);
}
