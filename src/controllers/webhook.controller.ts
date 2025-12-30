import { UNIX_TIMESTAMP_SECONDS } from "../configuration/configurator";
import { ServerError } from "../server/application.server";
import { logger } from "../services/logger.service";

export class WebhookController {
	public async foo(): Promise<void> {
		logger.info("throwing an error...");
		throw new ServerError(
			"bad request",
			{ payload: { error: true, timestamp: UNIX_TIMESTAMP_SECONDS() } },
			400
		);
	}
}
