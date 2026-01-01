import axios, { AxiosInstance } from "axios";
import { WhatsAppWebhookPayload } from "./webhook.service";
import { logger } from "./logger.service";

export interface Messaging {
	sendMessage(phone: string, message: string): Promise<WhatsAppSendMessageResponse>;
	autoReplayMessage(payload: WhatsAppWebhookPayload): Promise<WhatsAppSendMessageResponse>;
	detectMessageStatus(payload: WhatsAppWebhookPayload): Promise<void>;
}

type Configuration = {
	whatsappPhoneNumberId: string;
	whatsappToken: string;
};

type WhatsAppSendMessageResponse = {
	messaging_product: "whatsapp";
	contacts: {
		input: string;
		wa_id: string;
	}[];
	messages: {
		id: string;
	}[];
};

type AutoMessageResolving = {
	text: string;
}


export class MessagesService implements Messaging {

	private client: AxiosInstance;

	constructor(configuration: Configuration) {
		this.client = axios.create({
			baseURL: `https://graph.facebook.com/v23.0/${configuration.whatsappPhoneNumberId}`,
			headers: { Authorization: `Bearer ${configuration.whatsappToken}` }
		});
	}

	async sendMessage(phone: string, message: string): Promise<WhatsAppSendMessageResponse> {
		const e164Number = phone.includes("+") ? phone : `+${phone}`;
		const body = {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: e164Number,
			type: "text",
			text: {
				body: message
			}
		}

		logger.info(`sending message to: ${e164Number}. text: ${message}`);

		const { data } = await this.client.post<WhatsAppSendMessageResponse>("/messages", body);

		logger.info(`message to: ${data.contacts[0].input} sent with id: ${data.messages[0].id}`);

		return data;
	}

	async autoReplayMessage(payload: WhatsAppWebhookPayload): Promise<WhatsAppSendMessageResponse> {
		logger.info(`starting auto replay...`);
		const from = payload.entry
			?.flatMap(entry => entry.changes ?? [])
			.find(change => change.field === "messages")
			?.value
			?.messages
			?.[0]
			?.from;

		if (typeof from === "undefined") {
			throw new Error("couldn't resolve 'from' phone number");
		}

		const message = this.autoCreateMessage(payload);
		return await this.sendMessage(from, message.text);
	}

	async detectMessageStatus(payload: WhatsAppWebhookPayload): Promise<void> {
		const status = payload.entry
			?.flatMap(entry => entry.changes ?? [])
			.find(change => change.field === "messages")
			?.value
			?.statuses
			?.[0];

		if (typeof status === "undefined") {
			throw new Error("Couldn't detect a status");
		}

		logger.info(`message to: ${status.recipient_id} ${status.status} for id: ${status.id}`);
	}

	private autoCreateMessage(payload: WhatsAppWebhookPayload): AutoMessageResolving {
		logger.info(`auto creating message...`);
		const [entry] = payload.entry;
		const [change] = entry.changes;
		const [contact] = change.value.contacts ?? [];
		const [message] = change.value.messages ?? [];

		if (typeof message === "undefined") {
			return { text: "Sorry, i couldn't understand what your intention was from your message..." }
		}

		const messageContent = message.text?.body;
		if (typeof messageContent === "undefined") {
			return { text: "Sorry, i couldn't understand what your intention was from your message content..." }
		}

		if (messageContent.toLowerCase().includes("compliment")) {
			const compliments = [
				"You know, you really are thoughtful and dependable",
				"have I ever mentioned that you communicates clearly and respectfully?",
				"Did you know that you bring a calm, positive presence!"
			];
			const randomIndex = Math.floor(Math.random() * compliments.length);
			const compliment = compliments[randomIndex];
			return {
				text: compliment
			};
		}

		if (typeof contact !== "undefined" && messageContent.includes("Hi")) {
			return {
				text: `Hi there ${contact.profile.name}!`
			};
		}

		return {
			text: `Hello ${contact.profile.name}!, this is an auto replay. You can try me also at +972503972042`
		};
	}
}
