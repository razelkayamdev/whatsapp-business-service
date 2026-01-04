import { Router, Request, Response, NextFunction } from "express";
import { WebhookController, WebhookSubscribeQuery } from "../controllers/webhook.controller";
import { WebhooksMiddleware } from "../middleware/webhooks.middleware";

type Configuration = {
	webhookController: WebhookController;
	webhooksMiddleware: WebhooksMiddleware;
};

export function createWebhooksRoute(configuration: Configuration): Router {

	const webhooksRoute = Router();
	const { webhookController, webhooksMiddleware } = configuration;

	webhooksRoute.get("/webhooks/whatsapp", async (req: Request, res: Response, next: NextFunction) => {
		try {
			const challenge = await webhookController.subscribe(req.query as WebhookSubscribeQuery);
			res.status(200).send(challenge);
		} catch (error) {
			next(error);
		}
	});

	webhooksRoute.post(
		"/webhooks/whatsapp",
		webhooksMiddleware.storeRawBytes,
		webhooksMiddleware.verifyMetaWhatsappWebhook,
		async (req: Request, res: Response, next: NextFunction) => {
			try {
				await webhookController.handleIncoming(req.body);
				res.status(200).send();
			} catch (error) {
				next(error);
			}
		});

	return webhooksRoute;
}
