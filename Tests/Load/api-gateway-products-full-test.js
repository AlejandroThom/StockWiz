import http from "k6/http";
import { sleep } from "k6";
const TARGET_HOST = __ENV.TARGET_HOST;
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
  let url = `${TARGET_HOST}/api/products`;
  http.get(url);
  sleep(1);
}

export function getProductById() {
  const id = Math.floor(Math.random() * 5) + 1;
  let url = `${TARGET_HOST}/api/products`;
  http.get(url+`/${id}`);
  sleep(1);
}

export function getProductsFull() {
  let url = `${TARGET_HOST}/api/products-full`;
  http.get(url);
  sleep(1);
}

export function getInventoryByProduct() {
  const id = Math.floor(Math.random() * 5) + 1;
  let url = `${TARGET_HOST}/api/inventory/product`;
  http.get(url+`/${id}`);
  sleep(1);
}
