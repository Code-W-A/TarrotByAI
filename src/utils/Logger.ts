type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LEVELS: Record<Exclude<LogLevel, "silent">, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const DEFAULT_LEVEL: LogLevel = __DEV__ ? "info" : "warn";
const ENABLE_DEBUG = false;

const seen = new Set<string>();

const shouldLog = (level: LogLevel) => {
  if (level === "silent") return false;
  if (level === "debug" && !ENABLE_DEBUG) return false;
  return LEVELS[level] >= LEVELS[DEFAULT_LEVEL as Exclude<LogLevel, "silent">];
};

const log = (level: LogLevel, ...args: unknown[]) => {
  if (!shouldLog(level)) return;
  const fn =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.log;
  fn(...args);
};

export const logDebug = (...args: unknown[]) => log("debug", ...args);
export const logInfo = (...args: unknown[]) => log("info", ...args);
export const logWarn = (...args: unknown[]) => log("warn", ...args);
export const logError = (...args: unknown[]) => log("error", ...args);

export const logOnce = (level: LogLevel, key: string, ...args: unknown[]) => {
  if (seen.has(key)) return;
  seen.add(key);
  log(level, ...args);
};
// import Bugsnag from "@bugsnag/expo";

// const log = (error) => Bugsnag.notify(error);

// const start = () => Bugsnag.start();

// export default { log, start };