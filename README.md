# Larder

Phone-first pantry app. Paste a Walmart receipt (or a photo of one), then cook from what you already have.

## What it does

- Import a receipt into the pantry. A labeled sample receipt is included so you can try it without a real one.
- Cook filters recipes by diet and time. Cooking deducts what you used.
- The shopping list is grouped by aisle. Checked items can be shelved back into the pantry.
- A 7-day plan fills gaps onto the list.

Data stays in the browser (`localStorage`). There is no account and no live Walmart login. Walmart does not offer a public shopper purchase API; a live account link would need a receipt partner such as Knot or BlinkReceipt.

## Run

```bash
npm install
npm run dev
```

Open the app on port 8080.
