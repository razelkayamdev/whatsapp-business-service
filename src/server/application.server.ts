import express from "express";
import { Application, Response, Request, NextFunction } from "express";
import { Server } from "http";
import { createIsAliveRoute } from "../routes/is_alive.route";
import { httpLogger, logger } from "../services/logger.service";
import { createWebhooksRoute } from "../routes/webhooks.route";
import { WebhookController } from "../controllers/webhook.controller";
import { WebhooksMiddleware } from "../middleware/webhooks.middleware";

type Configuration = {
	port: number;
	commitHash: string;
	webhookController: WebhookController;
	webhooksMiddleware: WebhooksMiddleware;
};

export class ApplicationServer {

	private app: Application;
	private configuration: Configuration;
	private server: Server | undefined;

	constructor(configuration: Configuration) {
		this.configuration = configuration;
		this.app = express();
		this.setupLogs();
		this.loadWebhookRoute();
		this.app.use(express.json());
		this.loadUnprotectedRouters();
		this.loadGeneralRoute();
		this.app.use(this.errorHandler);
	}

	private setupLogs() {
		this.app.use(httpLogger);
	}

	private loadWebhookRoute() {
		const webhooksRoute = createWebhooksRoute({
			webhookController: this.configuration.webhookController,
			webhooksMiddleware: this.configuration.webhooksMiddleware
		});

		this.app.use([
			webhooksRoute
		]);
	}

	private loadUnprotectedRouters() {

		const isAliveRoute = createIsAliveRoute({
			commitHash: this.configuration.commitHash
		});

		this.app.use([
			isAliveRoute
		]);
	}

	private loadGeneralRoute() {
		this.app.use((_req: Request, res: Response, _next: NextFunction) => {
			res.sendStatus(404);
		});
	}

	private errorHandler(error: Error | any, _req: Request, res: Response, _next: NextFunction) {
		logger.error(`Encountered an error. code: ${error.code} message: ${error.message} payload: ${JSON.stringify(error.payload)}`);
		if (error instanceof ServerError) {
			res.status(error.code).send(error.payload);
		} else {
			res.status(500).send(`internal server error: ${error.message}`);
		}
		res.end();
	}

	public listen = () => {
		this.server = this.app.listen(this.configuration.port, () => {
			logger.info(`Express server is listening on http://localhost:${this.configuration.port}`);
		});
	}

	private close = async () => {
		if (typeof this.server === "undefined") {
			return;
		}
		await new Promise<void>((resolve, reject) => {
			this.server!.close((err: any) => {
				if (err) {
					return reject(err);
				}
				logger.info("Express server was closed.");
				resolve();
			});
		});
	}

	public shutdown = async (): Promise<void> => {
		logger.info("Shutting down...");
		try {
			await this.close();
			logger.info("Shutdown completed. Exiting.");
			process.exit(0);
		} catch (error: any) {
			logger.error(`Experienced an error while shutting down: ${error.message}. Forcing an exit.`);
			process.exit(1);
		}
	}
}

export class ServerError extends Error {
	constructor(
		message: string,
		public readonly payload: Record<string, any>,
		public readonly code: number
	) {
		super(message);
	}
}
