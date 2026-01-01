import { Configurator } from "./configuration/configurator";
import { WebhookController } from "./controllers/webhook.controller";
import { ApplicationServer } from "./server/application.server";
import { MessagesService, Messaging } from "./services/messages.service";
import { Webhooking, WebhookService } from "./services/webhook.service";

async function start() {

	const configuration = new Configurator().load();

	const webhookService: Webhooking = new WebhookService();
	const messagesService: Messaging = new MessagesService({
		whatsappPhoneNumberId: configuration.whatsappPhoneNumberId,
		whatsappToken: configuration.whatsappBusinessApiToken
	});

	const webhookController = new WebhookController({
		webhookService: webhookService,
		token: configuration.webhookSubscriptionToken,
		messagesService: messagesService
	});

	const server = new ApplicationServer({
		port: configuration.serverPort,
		commitHash: configuration.commitHash,
		webhookController
	});

	server.listen();
	process.on("SIGTERM", server.shutdown);
	process.on("SIGINT", server.shutdown); // Typically (Ctrl+C)
}

start();
