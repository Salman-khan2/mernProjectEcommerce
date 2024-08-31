// Import necessary modules and components
import React, { Fragment, useEffect, useRef } from "react";
import CheckoutSteps from "../Cart/CheckoutSteps";
import { useSelector, useDispatch } from "react-redux";
import MetaData from "../layout/MetaData";
import { Typography } from "@material-ui/core";
import { useAlert } from "react-alert";
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import "./payment.css";
import CreditCardIcon from "@material-ui/icons/CreditCard";
import EventIcon from "@material-ui/icons/Event";
import VpnKeyIcon from "@material-ui/icons/VpnKey";
import { createOrder, clearErrors } from "../../actions/orderAction";

const Payment = ({ history }) => {
  // Fetch necessary data from Redux state and session storage
  const orderInfo = JSON.parse(sessionStorage.getItem("orderInfo"));
  const dispatch = useDispatch();
  const alert = useAlert();
  const stripe = useStripe();
  const elements = useElements();
  const payBtn = useRef(null);
  const { shippingInfo, cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);
  const { error } = useSelector((state) => state.newOrder);

  // Payment data object to be sent to backend
  const paymentData = {
    amount: Math.round(orderInfo.totalPrice * 100), // Convert total price to cents
    description: "Ecommerce order payment", // Description of the transaction
  };

  // Order object with necessary details
  const order = {
    shippingInfo,
    orderItems: cartItems,
    itemsPrice: orderInfo.subtotal,
    taxPrice: orderInfo.tax,
    shippingPrice: orderInfo.shippingCharges,
    totalPrice: orderInfo.totalPrice,
  };

  // Function to handle form submission and process payment
  const submitHandler = async (e) => {
    e.preventDefault();
    payBtn.current.disabled = true; // Disable the pay button to prevent multiple submissions

    try {
      // Configuration for Axios request
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      // Send payment data to the backend API
      const { data } = await axios.post("/api/v1/payment/process", paymentData, config);

      // Retrieve client secret from backend response
      const client_secret = data.client_secret;

      // If Stripe or Elements is not initialized, return early
      if (!stripe || !elements) return;

      // Confirm card payment with Stripe using client secret and payment method details
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: user.name,
            email: user.email,
            address: {
              line1: shippingInfo.address,
              city: shippingInfo.city,
              state: shippingInfo.state,
              postal_code: shippingInfo.pinCode,
              country: shippingInfo.country,
            },
          },
        },
      });

      // Handle payment confirmation result
      if (result.error) {
        // If there's an error, enable the pay button and display the error message
        payBtn.current.disabled = false;
        alert.error(result.error.message);
      } else {
        // If payment is successful
        if (result.paymentIntent.status === "succeeded") {
          // Update order payment information
          order.paymentInfo = {
            id: result.paymentIntent.id,
            status: result.paymentIntent.status,
          };

          // Dispatch createOrder action to store order details
          dispatch(createOrder(order));

          // Redirect to the success page
          history.push("/success");
        } else {
          // If payment status is not succeeded, display an error message
          alert.error("There's some issue while processing payment");
        }
      }
    } catch (error) {
      // Handle any errors from the backend API
      payBtn.current.disabled = false;
      alert.error(error.response.data.message);
    }
  };

  // Effect hook to handle error messages
  useEffect(() => {
    if (error) {
      alert.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, error, alert]);

  // Render the Payment component
  return (
    <Fragment>
      <MetaData title="Payment" />
      <CheckoutSteps activeStep={2} />
      <div className="paymentContainer">
        <form className="paymentForm" onSubmit={(e) => submitHandler(e)}>
          <Typography>Card Info</Typography>
          <div>
            <CreditCardIcon />
            <CardNumberElement className="paymentInput" />
          </div>
          <div>
            <EventIcon />
            <CardExpiryElement className="paymentInput" />
          </div>
          <div>
            <VpnKeyIcon />
            <CardCvcElement className="paymentInput" />
          </div>
          <input
            type="submit"
            value={`Pay - ₹${orderInfo && orderInfo.totalPrice}`}
            ref={payBtn}
            className="paymentFormBtn"
          />
        </form>
      </div>
    </Fragment>
  );
};

export default Payment;
