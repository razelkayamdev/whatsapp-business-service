import winston, { createLogger, format, transports } from "winston";
import expressWinston from "express-winston";

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
	return `${timestamp} [${level}]: ${message}`;
});

export const logger = createLogger({
	level: "silly",
	format: combine(
		colorize(),
		timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		logFormat
	),
	transports: [
		new transports.Console()
	],
});

export const httpLogger = expressWinston.logger({
	transports: [
		new winston.transports.Console()
	],
	format: winston.format.combine(
		winston.format.printf((info: Record<string, any>) => {
			const remoteAddress = info.meta.req.headers["x-forwarded-for"] ?? info.meta.req.ip ?? info.meta.connection?.remoteAddress ?? "0.0.0.0";
			const dateFormatted = new Date().toISOString();
			const method = info.meta.req.method;
			const path = info.meta.req.originalUrl;
			const httpVersion = info.meta.req.httpVersion;
			const statusCode = info.meta.res.statusCode;
			const referrer = info.meta.req.headers.referer || "-";
			const responseDuration = info.meta.responseTime;
			const userAgent = info.meta.req.headers["user-agent"];
			return `${remoteAddress} - [${dateFormatted}] "${method} ${path} HTTP/${httpVersion}" ${statusCode} ${responseDuration}ms ${referrer} ${userAgent}`;
		})
	)
});
