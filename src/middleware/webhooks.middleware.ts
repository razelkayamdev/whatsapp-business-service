import crypto from "crypto";
import express, { Request, Response, NextFunction, RequestHandler } from "express";
import { ServerError } from "../server/application.server";
import { logger } from "../services/logger.service";

export class WebhooksMiddleware {

	private secret: string;

	constructor(metaAppSecret: string) {
		this.secret = metaAppSecret;
	}

	storeRawBytes: RequestHandler = express.json({
		verify: (req, _res, buf) => {
			(req as any).rawBody = buf;
		}
	});

	verifyMetaWhatsappWebhook = (req: Request, _res: Response, next: NextFunction) => {
		logger.info(`Verifying request originates from meta...`);
		const sig = req.header("x-hub-signature-256");
		const raw = (req as any).rawBody as Buffer | undefined;
		if (typeof sig === "undefined" || typeof raw === "undefined") {
			logger.error(`error while verifying signature, raw bites or headers are missing.`);
			next(new ServerError(
				"unauthorized",
				{ payload: {} },
				401
			));
			return;
		}

		const expected = "sha256=" + crypto.createHmac("sha256", this.secret).update(raw).digest("hex");
		if (expected.length !== sig.length) {
			logger.error(`error while verifying signature, expected length mismatch.`);
			next(new ServerError(
				"unauthorized",
				{ payload: {} },
				401
			));
			return;
		}

		const match = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
		if (match === false) {
			logger.error(`error while verifying signature, signature mismatch.`);
			next(new ServerError(
				"unauthorized",
				{ payload: {} },
				401
			));
			return;
		}
		logger.info(`Verified.`);
		next();
	}
}
