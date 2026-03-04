const express = require("express");
const request = require("supertest");

describe("authCoreRoutes single-user mode", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...ORIGINAL_ENV,
      SPARKY_FITNESS_SINGLE_USER_MODE: "true",
      SPARKY_FITNESS_SINGLE_USER_NAME: "Dushin",
    };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.clearAllMocks();
  });

  function buildApp() {
    jest.doMock("../config/logging", () => ({ log: jest.fn() }));
    jest.doMock("../models/globalSettingsRepository", () => ({
      getGlobalSettings: jest.fn(),
    }));
    jest.doMock("../models/oidcProviderRepository", () => ({
      getOidcProviders: jest.fn(),
    }));

    const router = require("../routes/auth/authCoreRoutes");
    const app = express();
    app.use(router);
    return app;
  }

  it("returns auth-disabled settings for single-user mode", async () => {
    const app = buildApp();

    const response = await request(app).get("/settings");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      email: { enabled: false },
      oidc: { enabled: false, providers: [], auto_redirect: false },
      single_user: {
        enabled: true,
        display_name: "Dushin",
      },
    });
  });

  it("reports no MFA factors in single-user mode", async () => {
    const app = buildApp();

    const response = await request(app).get("/mfa-factors?email=dushin@example.com");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      mfa_totp_enabled: false,
      mfa_email_enabled: false,
    });
  });
});
