// rate limiting for transactions done by arcjet

import arcjet, { tokenBucket } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["userId"], // Tracking based on clerk user id
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 10, // every hour it will refilled by 10 tokens
      interval: 3600, // refill after 1 hour interval
      capacity: 10, // how much the token bucket can store the tokens
    }),
  ],
});

export default aj;
