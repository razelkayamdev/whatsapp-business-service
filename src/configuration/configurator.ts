type Configuration = {
	commitHash: string;
	serverPort: number;
	webhookSubscriptionToken: string;
	whatsappPhoneNumberId: string;
	whatsappBusinessApiToken: string;
};

export class Configurator {
	public load(): Configuration {
		return {
			commitHash: process.env.COMMIT_HASH!,
			serverPort: Number(process.env.HTTP_PORT!),
			webhookSubscriptionToken: process.env.WEBHOOK_SUBSCRIPTION_TOKEN!,
			whatsappPhoneNumberId: process.env.WHATSAPP_SENDER_PHONE_NUMBER_ID!,
			whatsappBusinessApiToken: process.env.WHATSAPP_BUSINESS_API_TOKEN!
		} satisfies Configuration;
	}
}

export const UNIX_TIMESTAMP_SECONDS = () => {
	return Math.floor((new Date()).getTime() / 1000); // unix utc in seconds.
}
