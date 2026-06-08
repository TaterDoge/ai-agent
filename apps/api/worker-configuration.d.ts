/* eslint-disable @typescript-eslint/no-empty-object-type */
interface CloudflareBindings {
  APP_ENV: "development" | "test" | "production";
  ADMIN_ORIGIN: string;
  WEB_ORIGIN: string;
}

declare module "cloudflare:workers" {
  export const env: CloudflareBindings;
}
