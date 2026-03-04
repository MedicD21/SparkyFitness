const DEFAULT_SINGLE_USER = Object.freeze({
  id: "00000000-0000-4000-8000-000000000001",
  email: "single-user@dushinfitness.local",
  name: "Dushin",
  role: "admin",
});

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isSingleUserModeEnabled() {
  return process.env.SPARKY_FITNESS_SINGLE_USER_MODE === "true";
}

function getSingleUserConfig() {
  const email =
    normalizeString(process.env.SPARKY_FITNESS_SINGLE_USER_EMAIL) ||
    DEFAULT_SINGLE_USER.email;
  const name =
    normalizeString(process.env.SPARKY_FITNESS_SINGLE_USER_NAME) ||
    DEFAULT_SINGLE_USER.name;
  const rawRole = normalizeString(
    process.env.SPARKY_FITNESS_SINGLE_USER_ROLE,
  ).toLowerCase();

  return {
    id:
      normalizeString(process.env.SPARKY_FITNESS_SINGLE_USER_ID) ||
      DEFAULT_SINGLE_USER.id,
    email,
    name,
    role: rawRole === "user" ? "user" : DEFAULT_SINGLE_USER.role,
  };
}

function getSingleUserRequestContext() {
  const singleUser = getSingleUserConfig();

  return {
    authenticatedUserId: singleUser.id,
    originalUserId: singleUser.id,
    activeUserId: singleUser.id,
    userId: singleUser.id,
    permissions: { "*": true },
    user: {
      id: singleUser.id,
      email: singleUser.email,
      name: singleUser.name,
      role: singleUser.role,
      emailVerified: true,
    },
  };
}

module.exports = {
  DEFAULT_SINGLE_USER,
  getSingleUserConfig,
  getSingleUserRequestContext,
  isSingleUserModeEnabled,
};
