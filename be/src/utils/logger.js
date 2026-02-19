// =============================================================================
// POC: Simple console logger (current)
// =============================================================================
const logger = {
  info: (...args) => console.log(`[${new Date().toISOString()}] INFO:`, ...args),
  warn: (...args) => console.warn(`[${new Date().toISOString()}] WARN:`, ...args),
  error: (...args) => console.error(`[${new Date().toISOString()}] ERROR:`, ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${new Date().toISOString()}] DEBUG:`, ...args);
    }
  },
};

export default logger;

// =============================================================================
// PRODUCTION: Structured JSON logger (uncomment & replace the above)
// =============================================================================
// Outputs JSON-structured logs for EKS/CloudWatch/Datadog ingestion.
// JSON logs allow filtering, searching, and alerting in log aggregation tools.
//
// Option A: Minimal structured logger (no extra dependencies)
//
// const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
// const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
//
// function shouldLog(level) {
//   return LEVELS[level] >= LEVELS[LOG_LEVEL];
// }
//
// function formatLog(level, args) {
//   const message = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
//   return JSON.stringify({
//     timestamp: new Date().toISOString(),
//     level,
//     message,
//     service: 'chatapp-backend',
//     environment: process.env.NODE_ENV || 'development',
//   });
// }
//
// const logger = {
//   info: (...args) => shouldLog('info') && console.log(formatLog('info', args)),
//   warn: (...args) => shouldLog('warn') && console.warn(formatLog('warn', args)),
//   error: (...args) => shouldLog('error') && console.error(formatLog('error', args)),
//   debug: (...args) => shouldLog('debug') && console.log(formatLog('debug', args)),
// };
//
// export default logger;
//
// Option B: Use winston (more features — log rotation, transports, etc.)
//
// Prerequisites: npm install winston
//
// import winston from 'winston';
//
// const logger = winston.createLogger({
//   level: process.env.LOG_LEVEL || 'info',
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.json(),
//   ),
//   defaultMeta: { service: 'chatapp-backend' },
//   transports: [
//     new winston.transports.Console(),
//     // Add CloudWatch transport if needed:
//     // new WinstonCloudWatch({ logGroupName: '/ecs/chatapp', logStreamName: 'backend' }),
//   ],
// });
//
// export default logger;
