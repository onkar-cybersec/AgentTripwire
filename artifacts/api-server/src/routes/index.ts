import { Router, type IRouter } from "express";
import healthRouter from "./health";
import agentTripwireRouter from "./agent-tripwire";

const router: IRouter = Router();

router.use(healthRouter);
router.use(agentTripwireRouter);

export default router;
