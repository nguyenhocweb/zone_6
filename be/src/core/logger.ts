export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] ${message}`, context ? JSON.stringify(context) : '');
  },
  warn: (message: string, context?: unknown) => {
    const timestamp = new Date().toISOString();
    const details = context instanceof Error ? context.stack || context.message : (typeof context === 'object' && context !== null ? JSON.stringify(context) : (context !== undefined ? String(context) : ''));
    console.warn(`[${timestamp}] [WARN] ${message}`, details || '');
  },
  error: (message: string, error?: unknown) => {
    const timestamp = new Date().toISOString();
    const errorDetails = error instanceof Error ? error.stack || error.message : error;
    console.error(`[${timestamp}] [ERROR] ${message}`, errorDetails || '');
  },
  debug: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      console.debug(`[${timestamp}] [DEBUG] ${message}`, context ? JSON.stringify(context) : '');
    }
  },
};
