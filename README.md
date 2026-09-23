# Policy Compass

Policy Compass is a privacy-preserving, multilingual insurance comparison demo. It runs entirely in the browser and can be hosted directly on GitHub Pages. It uses deterministic scoring—not a remote or opaque AI service—to rank fictional policies against the user’s stated needs.

The landing page always opens with a country dropdown. Selecting a country with multiple supported official languages reveals a second language choice before the comparator begins.

> **Important:** Every insurer, policy, price, term, and limit in this repository is fictional demonstration data. This is not insurance, legal, or financial advice and must not be presented as a live-market comparison.

## Supported markets and languages

| Market | Interface languages | Currency |
|---|---|---|
| España | Español | EUR |
| Italia | Italiano | EUR |
| Deutschland | Deutsch | EUR |
| France | Français | EUR |
| België / Belgique / Belgien | Nederlands, Français, Deutsch | EUR |
| Schweiz / Suisse / Svizzera | Deutsch, Français, Italiano | CHF |

The demo includes health, travel, car, home, and life categories for every configured market.

## Project structure

```text
insurance-policy-comparator/
├── index.html
├── styles.css
├── app.js
├── .nojekyll
├── data/
│   ├── config.js
│   └── policies.js
├── locales/
│   └── translations.js
└── README.md
```

## How scoring works

Each policy receives normalized component scores for monthly price fit, coverage breadth, deductible/flexibility, and extra benefits. These are combined using the four importance weights selected by the user. A missing must-have feature or an age outside a policy’s demonstration eligibility range makes that policy ineligible. Identical inputs always produce identical results.

The score measures only fit to the submitted preferences. It does not measure insurer quality, claims service, financial strength, regulatory compliance, or likelihood of acceptance.

## Run locally

Because the app uses only relative static assets, either open `index.html` directly or serve the folder:

```bash
python -m http.server 8000 --directory insurance-policy-comparator
```

Then open `http://localhost:8000`.

## Publish to GitHub Pages

1. Sign in to GitHub as **maxbaiani26-lab**.
2. Create a new **public** repository named **insurance-policy-comparator**. Do not initialize it with another README.
3. Upload the *contents* of this folder so `index.html` is at the repository root, then commit the files.
4. Open **Settings → Pages** in the repository.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Select branch **main**, folder **/(root)**, and click **Save**.
7. Wait a few minutes for deployment.

The site will then be available at:

**https://maxbaiani26-lab.github.io/insurance-policy-comparator/**

The URL will not work until the files are uploaded and GitHub Pages is enabled.

### Optional command-line upload

```bash
git init
git add .
git commit -m "Build Policy Compass"
git branch -M main
git remote add origin https://github.com/maxbaiani26-lab/insurance-policy-comparator.git
git push -u origin main
```

## Replace demonstration data

Policy records are created in `data/policies.js`, separately for each country and category. Before any real deployment:

1. Replace fictional records with licensed, verified product data.
2. Preserve the existing fields: `id`, `country`, `category`, `premium`, `deductible`, `deductibleAmount`, `coverage`, `flexibility`, `extras`, `limit`, `features`, `exclusions`, `ageMin`, `ageMax`, `waitingDays`, `scope`, `source`, and `verified`.
3. Link every record to its authoritative source and set a genuine verification date.
4. Establish an update and withdrawal process; stale products must not remain searchable.
5. Obtain legal review for each market, especially if the tool will generate leads, receive commissions, or provide a personalized recommendation.

## Add a country or language

- Add country metadata and official-language choices in `data/config.js`.
- Add a complete translation object in `locales/translations.js`.
- Add localized feature labels in `data/config.js`.
- Add or import a verified country catalog in `data/policies.js`.
- Test currency, pluralization, text expansion, keyboard navigation, and the country-specific notice.

## Privacy and accessibility

Answers stay in browser memory. Country and language are stored in `localStorage` only when the user checks the optional consent box. Reset removes that data. No analytics or external calls are included. The interface uses semantic controls, keyboard focus indicators, a live region, sufficient contrast, responsive layouts, and print styles. A production deployment should undergo formal WCAG and jurisdiction-specific compliance testing.
