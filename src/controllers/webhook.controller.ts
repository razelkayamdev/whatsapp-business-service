import { ServerError } from "../server/application.server";
import { logger } from "../services/logger.service";
import { Messaging } from "../services/messages.service";
import { SubscribeChallenge, Webhooking, WhatsAppWebhookPayload } from "../services/webhook.service";

type Configuration = {
	webhookService: Webhooking;
	messagesService: Messaging;
	token: string;
};

export type WebhookSubscribeQuery = {
	'hub.mode': string;
	'hub.challenge': string;
	'hub.verify_token': string
};

export class WebhookController {

	private webhookService: Webhooking;
	private messagesService: Messaging;
	private token: string;

	constructor(configuration: Configuration) {
		this.webhookService = configuration.webhookService;
		this.messagesService = configuration.messagesService;
		this.token = configuration.token
	}

	public async subscribe(query: WebhookSubscribeQuery): Promise<SubscribeChallenge> {
		try {
			logger.info("subscribing to webhook...");
			const challenge = await this.webhookService.subscribeToWebHook(this.token, {
				challenge: query["hub.challenge"],
				remoteToken: query["hub.verify_token"],
				mode: query["hub.mode"]
			});
			logger.info("subscribed.");
			return challenge;
		} catch (error: any) {
			logger.error(`error while subscribing webhook. error: ${error.message}`);
			throw new ServerError(
				"forbidden",
				{ payload: {} },
				403
			);
		}
	}

	public async handleIncoming(body: WhatsAppWebhookPayload): Promise<void> {
		logger.info("Handling incoming webhook...");
		try {
			const payload = body as WhatsAppWebhookPayload;

			if (typeof payload.entry[0].changes[0].value.messages !== "undefined") {
				await this.messagesService.autoReplayMessage(payload);
				logger.info("Handling incoming webhook completed.");
				return;
			}

			if (typeof payload.entry[0].changes[0].value.statuses !== "undefined") {
				await this.messagesService.detectMessageStatus(payload);
				logger.info("Handling incoming webhook completed.");
				return;
			}

			logger.info("Handling incoming webhook completed. No action taken for payload:");
			logger.info(`${JSON.stringify(body)}`);
		} catch (error: any) {
			logger.error(`Error while parsing incoming webhook body: ${error.message}`);
			throw new ServerError(
				"server error",
				{ payload: body },
				500
			);
		}
	}
}
