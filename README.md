# Compass — Personal HQ

The Compass Dashboard v4 design, built as a React app on Firebase Realtime Database.
Six views — Today, Clients, Tasks, Goals, Notes, Money — all starting empty.

## Run it

```bash
npm install
npm run dev
```

Opens on http://localhost:5180.

## Firebase

**[SETUP.md](SETUP.md) is the step-by-step guide** — creating the project, the database,
the security rules, email/password sign-in, and the GitHub Pages secrets.

Until you add credentials the app runs on a **localStorage store with the same API**, with
no login required, so it is fully usable before any of that is done.

Once configured, the app requires sign-in and each account's data lives under
`users/<uid>` — the only branch the security rules open up. There is deliberately no
sign-up form; accounts are created in the Firebase console.

### Data shape

```
users/<uid>/            (or `compass/` in local storage mode)
  clients/{id}          name, kind, referrer, amount, stage, date, dateKind,
                        lender, status, rate, lvr, docs, contact, createdAt
                        log/{id}      date, text, ts
  tasks/{id}            cid, title, due, priority, done, focus, createdAt
  notes/{id}            title, body (HTML), updatedAt
  goals/{id}            type (annual|monthly), tag, title, unit (money|count),
                        target, month, parentId, qTargets[4]
                        logs/{id}     date, amount, note
  assets/{id}           name, kind, value
  liabs/{id}            name, kind, value
  expenses/{id}         date, bucket, cat, desc, amount
  income/{id}           date, bucket, cat, desc, amount
  settings/
    partners/{id}       name    — referral partners
    lenders/{id}        name    — banks / lenders
    expCats/{id}        name    — expense categories
    incCats/{id}        name    — income categories
    buckets/{id}        name    — businesses / income streams
```

Writes go through path patches (`update`), never whole-object overwrites, so two
tabs editing different fields will not clobber each other.

## How the pieces connect

- **Star a task** in Tasks (max three) and it pins to Focus on Today.
- **Monthly goals** can roll into a yearly goal; their logged progress counts
  toward the parent's total and its quarter.
- **Businesses** (Money → Edit businesses) tag every income and expense entry, which
  drives the monthly P&L cards and the annualised run-rate table.
- **Referral partners** (Clients → Edit referral partners) feed every referrer dropdown,
  and **banks** (Clients → Edit banks) feed the lender dropdown on every file.
  Renaming either updates every file that used it.

## Notes on the build

Dates are live — "today" is the real date, quarters and the annualised run rate
follow from it. The design's fixed August 2026 demo date is gone.

Three things the design showed as static data now need UI, so they got some:
client detail fields are inline-editable (they read as plain text until focused),
the balance sheet has an add row, and businesses are user-managed like categories.
