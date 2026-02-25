const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

function shouldLog(level) {
  return LEVELS[level] >= LEVELS[LOG_LEVEL];
}

function formatLog(level, args) {
  const message = args
    .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
    .join(' ');
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'chatapp-backend',
  });
}

const logger = {
  info: (...args) => shouldLog('info') && console.log(formatLog('info', args)),
  warn: (...args) => shouldLog('warn') && console.warn(formatLog('warn', args)),
  error: (...args) => shouldLog('error') && console.error(formatLog('error', args)),
  debug: (...args) => shouldLog('debug') && console.log(formatLog('debug', args)),
};

export default logger;
