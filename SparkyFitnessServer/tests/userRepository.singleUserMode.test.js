describe("userRepository single-user bootstrap", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.clearAllMocks();
  });

  function loadRepository() {
    jest.doMock("../config/logging", () => ({ log: jest.fn() }));
    jest.doMock("../services/nutrientDisplayPreferenceService", () => ({
      createDefaultNutrientPreferencesForUser: jest.fn(),
    }));
    jest.doMock("../db/poolManager", () => ({
      getClient: jest.fn(),
      getSystemClient: jest.fn(),
    }));

    return {
      userRepository: require("../models/userRepository"),
      poolManager: require("../db/poolManager"),
      nutrientDisplayPreferenceService: require("../services/nutrientDisplayPreferenceService"),
    };
  }

  it("creates the single-user record and seeds nutrient preferences once", async () => {
    const transactionClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    const preferenceClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    const {
      userRepository,
      poolManager,
      nutrientDisplayPreferenceService,
    } = loadRepository();

    poolManager.getSystemClient
      .mockResolvedValueOnce(transactionClient)
      .mockResolvedValueOnce(preferenceClient);

    transactionClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce()
      .mockResolvedValueOnce()
      .mockResolvedValueOnce()
      .mockResolvedValueOnce()
      .mockResolvedValueOnce();

    preferenceClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    await userRepository.ensureSingleUserBootstrap({
      id: "00000000-0000-4000-8000-000000000111",
      email: "dushin@example.com",
      name: "Dushin",
      role: "admin",
    });

    expect(transactionClient.query).toHaveBeenCalledWith("BEGIN");
    expect(transactionClient.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO "user"'),
      [
        "00000000-0000-4000-8000-000000000111",
        "dushin@example.com",
        "Dushin",
        "admin",
      ],
    );
    expect(transactionClient.query).toHaveBeenCalledWith("COMMIT");
    expect(
      nutrientDisplayPreferenceService.createDefaultNutrientPreferencesForUser,
    ).toHaveBeenCalledWith("00000000-0000-4000-8000-000000000111");
    expect(transactionClient.release).toHaveBeenCalledTimes(1);
    expect(preferenceClient.release).toHaveBeenCalledTimes(1);
  });

  it("fails fast when the configured email already belongs to another user", async () => {
    const transactionClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    const { userRepository, poolManager } = loadRepository();

    poolManager.getSystemClient.mockResolvedValueOnce(transactionClient);
    transactionClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({
        rows: [{ id: "00000000-0000-4000-8000-000000000222" }],
        rowCount: 1,
      })
      .mockResolvedValueOnce();

    await expect(
      userRepository.ensureSingleUserBootstrap({
        id: "00000000-0000-4000-8000-000000000111",
        email: "dushin@example.com",
        name: "Dushin",
        role: "admin",
      }),
    ).rejects.toThrow(
      "Single-user bootstrap email dushin@example.com is already assigned",
    );

    expect(transactionClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(transactionClient.release).toHaveBeenCalledTimes(1);
  });
});
