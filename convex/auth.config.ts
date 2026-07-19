import type { AuthConfig } from "convex/server";

const issuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;
if (!issuerDomain) throw new Error("CLERK_JWT_ISSUER_DOMAIN is required");

const authConfig = {
  providers: [
    {
      domain: issuerDomain,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;

export default authConfig;
