import { Router, Request, Response, NextFunction } from "express";

type Configuration = {
	commitHash: string;
};

export function createIsAliveRoute(configuration: Configuration): Router {

	const isAliveRouter = Router();

	isAliveRouter.get("/is_alive", async (_req: Request, res: Response, _next: NextFunction) => {
		res.status(200).json({
			alive: true,
			commitHash: configuration.commitHash
		});
	});

	return isAliveRouter;
}
