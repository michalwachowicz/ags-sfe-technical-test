import { setupWorker } from "msw/browser";
import { handlers } from "@/msw/handlers";

export const worker = setupWorker(...handlers);

export async function startWorker() {
  await worker.start({
    quiet: true,
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
    onUnhandledRequest: "bypass",
  });
}
