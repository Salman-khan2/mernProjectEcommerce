const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const catchAsyncErrors = require("../middleware/catchAsyncErrors");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.processPayment = catchAsyncErrors(async (req, res, next) => {
  const { amount, description } = req.body; // Accept description from the request body

  const myPayment = await stripe.paymentIntents.create({
    amount,
    currency: "USD",
    description, // Add the description here
    metadata: {
      company: "Ecommerce",
    },
  });

  res.status(200).json({ success: true, client_secret: myPayment.client_secret });
});

exports.sendStripeApiKey = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
});
