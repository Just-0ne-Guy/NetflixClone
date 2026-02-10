import {
  createCheckoutSession,
  getStripePayments,
} from "@stripe/firestore-stripe-payments";

import { getFunctions, httpsCallable } from "firebase/functions";
import app from "./firebase"; // your firebase app default export

// if you still use payments elsewhere (fine to keep)
const payments = getStripePayments(app, {
  productsCollection: "products",
  customersCollection: "customers",
});

export default payments;


export const loadCheckout = async (priceId: string) => {
  const session = await createCheckoutSession(payments, {
    price: priceId,
    success_url: window.location.origin,
    cancel_url: `${window.location.origin}/plan`,
  });

  if (!session?.url) {
    throw new Error("checkout session created but no url returned");
  }

  window.location.assign(session.url);
};


export const goToBillingPortal = async (
  uidOrReturnUrl?: string,
  maybeReturnUrl?: string
) => {

  const returnUrl =
    maybeReturnUrl ??
    (uidOrReturnUrl && uidOrReturnUrl.startsWith("http")
      ? uidOrReturnUrl
      : `${window.location.origin}/account`);

  const functions = getFunctions(app);
  const createPortalLink = httpsCallable(
    functions,
    "ext-firestore-stripe-payments-createPortalLink"
  );

  const res = await createPortalLink({ returnUrl });
  const data = res.data as { url?: string };

  if (!data?.url) throw new Error("no portal url returned");

  window.location.assign(data.url);
};
