import { writable } from "svelte/store";
import { subscribe } from "../utils";
import type { Credentials } from "./types";

export const credentials = writable<Credentials>({
  url: null,
  secret: null,
});

export async function writeCredentials() {
  subscribe("credentials:read", (payload: Credentials) => {
    credentials.set(payload);
  });
}

export async function deleteCredentials() {
  subscribe("credentials:delete", (payload: Credentials) => {
    credentials.set(payload);
  });
}
