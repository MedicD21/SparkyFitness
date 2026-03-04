import Constants from 'expo-constants';

const PRODUCTION_VARIANTS = new Set(['prod', 'production']);

type ExpoConfigExtra = {
  APP_VARIANT?: unknown;
  DEFAULT_SERVER_URL?: unknown;
};

const getExpoConfigExtra = (): ExpoConfigExtra => {
  const constantsModule = Constants as typeof Constants & {
    default?: typeof Constants;
  };

  const expoConfig = constantsModule.expoConfig ?? constantsModule.default?.expoConfig;
  return (expoConfig?.extra as ExpoConfigExtra | undefined) ?? {};
};

const normalizeString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const getAppVariant = (): string => {
  const configVariant = normalizeString(getExpoConfigExtra().APP_VARIANT);
  if (configVariant) {
    return configVariant.toLowerCase();
  }

  return __DEV__ ? 'development' : 'production';
};

export const isProductionAppVariant = (): boolean => {
  return PRODUCTION_VARIANTS.has(getAppVariant());
};

export const isHttpServerUrlAllowed = (): boolean => {
  return !isProductionAppVariant();
};

export const shouldShowDevTools = (): boolean => {
  return __DEV__ && !isProductionAppVariant();
};

export const getDefaultServerUrl = (): string | null => {
  const serverUrl = normalizeString(getExpoConfigExtra().DEFAULT_SERVER_URL);
  return serverUrl ? serverUrl.replace(/\/+$/, '') : null;
};
