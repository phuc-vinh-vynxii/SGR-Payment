import paymentRoutes from "./payment.route.js";

export default (app) => {
  const paymentRoute = new paymentRoutes();
  app.use("/api/v1/", paymentRoute.getRouter());
};
