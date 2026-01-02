export type SubscribeChallenge = any;

type SubscribeData = {
	mode: string;
	challenge: string;
	remoteToken: string;
};

export type WhatsAppWebhookPayload = {
	object: "whatsapp_business_account";
	entry: Array<{
		id: string; // WABA ID
		changes: Array<{
			field: "messages" | string; // Webhook fields - the subscribed field name from "Customize use case" configuration for web hooks on meta's dashboards.
			value: {
				messaging_product: "whatsapp";
				metadata: {
					display_phone_number: string; // digits, no '+'
					phone_number_id: string;
				};

				contacts?: Array<{
					profile: {
						name: string;
					};
					wa_id: string;
				}>;

				messages?: Array<{ // Present on inbound user messages
					from: string;        // sender wa_id
					id: string;          // wamid.*
					timestamp: string;   // unix timestamp (string)
					type: "text";        // extend as needed
					text?: {
						body: string;
					};
				}>;

				statuses?: Array<{ // Present on outbound message lifecycle events
					id: string;          // wamid.*
					status: "sent" | "delivered" | "read" | "failed";
					timestamp: string;   // unix timestamp (string)
					recipient_id: string;
					pricing?: {
						billable: boolean;
						pricing_model: "PMP" | string;
						category: "service" | "utility" | "marketing" | string;
						type: string;
					};
				}>;
			};
		}>;
	}>;
};


export interface Webhooking {
	subscribeToWebHook(token: string, data: SubscribeData): Promise<SubscribeChallenge>;
}

export class WebhookService implements Webhooking {
	subscribeToWebHook(token: string, data: SubscribeData): Promise<SubscribeChallenge> {
		const { mode, challenge, remoteToken } = data;
		if (mode === "subscribe" && remoteToken === token) {
			return challenge as any;
		} else {
			throw new Error(`mode and / or token could not be verified. mode: ${mode} token: ${token}, remoteToken: ${remoteToken}`);
		}
	}
}
