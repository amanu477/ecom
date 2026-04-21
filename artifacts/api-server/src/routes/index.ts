import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import reviewsRouter from "./reviews";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import catalogRouter from "./catalog";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(reviewsRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(catalogRouter);

export default router;
