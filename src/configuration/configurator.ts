type Configuration = {
	commitHash: string;
	serverPort: number;
};

export class Configurator {
	public load(): Configuration {
		return {
			commitHash: process.env.COMMIT_HASH!,
			serverPort: Number(process.env.HTTP_PORT!)
		} satisfies Configuration;
	}
}

export const UNIX_TIMESTAMP_SECONDS = () => {
	return Math.floor((new Date()).getTime() / 1000); // unix utc in seconds.
}
