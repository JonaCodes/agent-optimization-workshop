---
description: >-
  Use for requests about connected account balances, transaction history,
  transaction categories, budgets, projected cash flow, or statement comparison.
  Trigger when someone wants a factual view of activity in a linked finance
  workspace or asks to update a bookkeeping category or budget definition. This
  skill selects the smallest relevant account and date scope, keeps currencies
  explicit, and distinguishes recorded transactions from projections. Use it for
  read requests as well as clearly specified categorization and budget tasks; it
  does not calculate values by guessing missing account data.
---

# Finance

1. Identify whether the request concerns a current balance, recorded activity, categorization, a budget, a projection, or statement reconciliation. Preserve the account’s own currency throughout.
2. For a point-in-time amount, call `finance-get_account_balances` with the known account or institution filters. Include the provider’s as-of timestamp when reporting the value.
3. For activity, call `finance-list_transactions` with the narrowest useful date range and account filters. Use its cursor for more pages; preserve provider sign conventions when distinguishing charges and credits.
4. When a transaction category is explicitly specified, use `finance-categorize_transaction` with the exact transaction identifier and a valid provider category key. If the provider rejects a pending or locked item, retrieve it later before retrying.
5. For a requested spending limit, call `finance-create_budget` with the category, amount, currency, cadence, and any stated account scope. Report the returned budget reference and period.
6. For future cash position, call `finance-forecast_cashflow` with the requested horizon and relevant account scope. Label estimated items and scenario adjustments; do not present the projection as a guaranteed balance.
7. For a statement comparison, call `finance-reconcile_account` with the account, statement date, and closing balance. Explain the difference using the provider’s sign convention and include unmatched activity only when returned.

Keep reported values tied to the returned account, date, and currency. Separate observed transactions from modeled amounts, and state when the provider omits a field or returns a partial result.
