import { Configurator } from "./configuration/configurator";
import { WebhookController } from "./controllers/webhook.controller";
import { ApplicationServer } from "./server/application.server";

async function start() {

	const configuration = new Configurator().load();
	const webhookController = new WebhookController();

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
