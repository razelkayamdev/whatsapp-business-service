import { Router, Request, Response, NextFunction } from "express";
import { WebhookController } from "../controllers/webhook.controller";

type Configuration = {
	webhookController: WebhookController;
};

export function createWebhooksRoute(configuration: Configuration): Router {

	const webhooksRoute = Router();
	const { webhookController } = configuration;

	webhooksRoute.get("/webhook", async (_req: Request, res: Response, next: NextFunction) => {
		try {
			await webhookController.foo();
			res.status(200).json({});
		} catch (error) {
			next(error);
		}
	});

	return webhooksRoute;
}
