describe("authMiddleware single-user mode", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...ORIGINAL_ENV,
      SPARKY_FITNESS_SINGLE_USER_MODE: "true",
      SPARKY_FITNESS_SINGLE_USER_ID: "00000000-0000-4000-8000-000000000111",
      SPARKY_FITNESS_SINGLE_USER_EMAIL: "dushin@example.com",
      SPARKY_FITNESS_SINGLE_USER_NAME: "Dushin",
      SPARKY_FITNESS_SINGLE_USER_ROLE: "admin",
    };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.clearAllMocks();
  });

  function loadAuthMiddleware() {
    jest.doMock("../config/logging", () => ({ log: jest.fn() }));
    jest.doMock("../models/userRepository", () => ({
      ensureUserInitialization: jest.fn(),
      getUserRole: jest.fn(),
    }));
    jest.doMock("../db/poolManager", () => ({
      getClient: jest.fn(),
      getSystemClient: jest.fn(),
    }));
    jest.doMock("../utils/permissionUtils", () => ({
      canAccessUserData: jest.fn(),
    }));

    return require("../middleware/authMiddleware");
  }

  it("injects the configured single-user request context", async () => {
    const { authenticate } = loadAuthMiddleware();
    const req = {
      path: "/foods",
      headers: {},
      cookies: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.authenticatedUserId).toBe(
      "00000000-0000-4000-8000-000000000111",
    );
    expect(req.activeUserId).toBe("00000000-0000-4000-8000-000000000111");
    expect(req.userId).toBe("00000000-0000-4000-8000-000000000111");
    expect(req.permissions).toEqual({ "*": true });
    expect(req.user).toEqual(
      expect.objectContaining({
        id: "00000000-0000-4000-8000-000000000111",
        email: "dushin@example.com",
        name: "Dushin",
        role: "admin",
      }),
    );
  });

  it("allows the single-user admin through the admin guard", async () => {
    const { isAdmin } = loadAuthMiddleware();
    const req = {
      userId: "00000000-0000-4000-8000-000000000111",
      user: {
        email: "dushin@example.com",
        role: "admin",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await isAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
