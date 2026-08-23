# IndicoDataFusion

A desktop app to aggregate, browse, and review Indico conference data (events, contributions, and abstracts) from one or more Indico instances.

Designed for conference organizers (managers), programme committee members (reviewers), and read-only observers who need a lightweight, offline-capable viewer for Indico content.

`IDF` is the brief name for this app.

---

## Table of Contents

1. [Operating Modes](#operating-modes)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [API Token Setup](#api-token-setup)
5. [Data Source Configuration](#data-source-configuration)
6. [Configuration Import & Export](#configuration-import--export)
7. [Management Mode](#management-mode)
8. [Review Mode](#review-mode)
9. [Reading Mode](#reading-mode)
10. [Abstracts Stats Charts](#abstracts-stats-charts)
11. [Cache Management](#cache-management)
12. [Troubleshooting](#troubleshooting)

---

## Operating Modes

IndicoDataFusion supports three distinct operating modes, automatically selected based on the active data source configuration:

| Mode            | API Token                            | Abstracts File             | What you can do                                                                             |
|-----------------|--------------------------------------|----------------------------|---------------------------------------------------------------------------------------------|
| **Management**  | ✅ Valid token                       | ❌ Not required            | Fetch live data from Indico, view all details, export abstracts (redacted) for distribution |
| **Review**      | ✅ Valid token (reviewer permission) | ✅Required (exported file) | View assigned abstracts, submit and edit your own reviews, vote on questions                |
| **Reading**     | ❌ Not required                      | ✅Required (exported file) | Browse abstracts offline — no live Indico connection needed                                 |

The mode is determined at startup by checking the active data source's API token and abstracts file configuration.
You can have multiple data sources configured for different modes and switch between them instantly.

---

## Installation

The project publishes native desktop builds for Windows, macOS and Linux.

Windows
- Download the latest Windows installer (IndicoDataFusion-Setup-x.y.z.exe) from the [releases page](https://github.com/zhangt58/IndicoDataFusion/releases).
- Run the installer and follow the prompts. The application installs to the user data directory by default and creates a Start Menu shortcut.
- To resolve the security issue:
  - Right-clicking the downloaded file -> Properties -> Security: check Unblock -> Apply/OK
  - Double-clicking to install

macOS
- Download the macOS package (IndicoDataFusion-x.y.z.pkg) from the releases page.
- Execute the command recommended at the top of the release page to remove the quarantine attribute from the downloaded file (i.e. `xattr -rd com.apple.quarantine ~/Downloads/IndicoDataFusion-x.y.z.pkg`).
- Double-click the .pkg file and follow the installer prompts. The app is installed to the Applications folder by default.

Linux (brief)
- Use the zipped binary in .tar.gz that downloaded from releases page, unzip it and run the executable inside.
- Alternatively, use a prebuilt AppImage is (IndicoDataFusion-x86_64.AppImage). Make it executable (chmod +x) and run it, or copy it to /usr/local/bin for convenience.
- A Linux distribution released later than Ubuntu 22.04 is recommended to use.

## Quick Start

1. Download and install the package for your platform (Linux, Windows, or macOS).
2. Launch the app. If no data source is configured, the **Setup Wizard** opens automatically and walks you through creating your first API token and data source.
3. Navigate using the sidebar to browse events, contributions, and abstracts.

> **Tip:** If you are a reviewer receiving an abstracts export file from the manager, skip to [Review Mode](#review-mode) for the fastest setup.

---

## API Token Setup

API tokens authenticate your requests to the Indico server. Tokens are stored in the **OS keyring** (Keychain on macOS, Secret Service on Linux, Credential Manager on Windows) and are never written as plain text into config files.

### Creating a token in Indico

1. Log in to your Indico instance.
2. Go to **My Profile → API Tokens** (e.g. `https://indico.jacow.org/user/tokens/`).
3. Click **Create token**, give it a name, and choose all the scopes:
   - The token permission is managed by roles in the specific event, it is not determined by scopes.
     However, to ensure the token has the necessary permissions for all features, select all scopes when creating it.
4. Copy the token value immediately (it is shown only once).

### Adding a token in IndicoDataFusion

1. Open **Settings → Configuration → Data Sources**.
2. Expand **Advanced / API Tokens** and click **Add**.
3. Fill in:
   - **Name** – a short logical identifier (e.g. `bot`, `my-review-token`). This name is used to reference the token from data sources.
   - **Base URL** – the root URL of the Indico instance (e.g. `https://indico.jacow.org`).
   - **Username** – your Indico username (for reference only; used to keep token names unique across instances).
   - **Secret** – paste the API token value here. It will be saved to the OS keyring and cleared from memory.
4. Click **Save**. The token is now available for use by any data source on the same base URL.

### YAML config reference

The `api-tokens` top-level key in your config YAML lists token entries. The `token` field should be left empty in the YAML file; the real secret is read from the OS keyring at runtime.

```yaml
api-tokens:
  - name: bot
    base_url: https://indico.example.org
    username: bot
    token: ""   # leave empty — secret lives in the OS keyring
```

Token resolution order at runtime:

1. `token` field in YAML (non-empty — kept only for migration/testing).
2. OS keyring lookup by the entry `name`.
3. If neither is found, the data source records a non-fatal init problem and the UI prompts you to supply the missing token.

---

## Data Source Configuration

A **data source** ties together an Indico server URL, an event ID, and an API token reference. You can have multiple data sources (e.g. one per conference) and switch between them instantly.

### Adding a data source

1. Open **Settings → Configuration → Data Sources**.
2. Click **(+) Add Indico Source**.
3. Fill in the dialog:
   - **Name** – unique identifier for this source (e.g. `myconf-2026`).
   - **Base URL** – Indico root URL. Typing auto-suggests URLs from existing sources.
   - **Event ID** – the numeric Indico event ID (visible in the event URL).
   - **API Token** – pick a token name from the dropdown (tokens you added in the API Tokens panel).
   - **Timeout** – request timeout for Indico API calls (default `60s`).
   - **Abstracts File** *(optional)* – path to a previously exported abstracts JSON file.
      When set, all abstract lookups read from this file instead of the live API. Leave empty for live mode.
   - Other options like `description`, `tags`, etc. just follow the UI.
4. Click **Apply** to save and activate.

### Selecting the active source

The active data source is shown in the sidebar. To change it, open **Settings → Configuration → Data Sources**,
select a source, and click **Apply**, or directly click the blue circle button in the data source list to switch.

### YAML config reference

```yaml
data-source:
  use: myconf-2026

myconf-2026:
  indico: true
  base_url: https://indico.example.org
  event_id: 42
  api_token_name: bot
  timeout: 60s
  abstracts_file: ""   # optional: path to exported abstracts JSON
```

---

## Configuration Import & Export

IndicoDataFusion can export your entire configuration (data sources, API token metadata, chart settings)
to a single encrypted file for easy migration to a different computer or just back up securely.
It is not recommended to share this file with others since it contains your API token values
(albeit encrypted). Treat it like a password manager export.

### Exporting

1. Open **Settings → Import / Export**.
2. Click **Export Configuration**.
3. Enter a password. The configuration (including API token values fetched from the keyring) is encrypted with AES-256-GCM using a PBKDF2-derived key.
4. Choose a save location. The resulting `.json` file is safe to transmit by email or shared drive — it is unreadable without the password.

### Importing

1. Open **Settings → Import / Export**.
2. Click **Import Configuration** and select the `.json` export file.
3. Enter the password used during export.
4. The configuration is decrypted and merged. API token values found in the file are stored back into the OS keyring automatically.
5. Click **Reload** (or restart the app) to apply the imported configuration.

> **Security note:** The export file contains your API token values. Treat it like a password manager export — use a strong password and store it securely.

---

## Management Mode

Management mode is available when a valid Indico API token with organiser/manager privileges is
configured. It enables full read access to all abstract data including sensitive fields
(judgments, reviews, reviewer identities, submitter details, ratings, etc.).

### Browsing and filtering abstracts

- The **Abstracts** page lists all abstracts fetched from Indico with rich filtering (by track, type, state, keyword search).
- Click any abstract row or card to open the **Abstract Details** dialog, which shows the full abstract content, authors, affiliations,
  attachments, all reviews, and the current judgment.
- Use the **Table / Card** view toggle in the toolbar to switch layouts.

### Exporting abstracts for distribution

Managers can export the current abstracts dataset to a JSON file for distribution to reviewers who do not have
direct abstract data access.

1. Open **Settings → Import / Export → Export Abstracts Data**.
2. Configure the **redaction settings** — check each field you want to strip from the export file before sharing:
3. Click **Export Abstracts** and choose a save path.
4. Distribute the resulting JSON file to reviewers. They load it via the **Abstracts File** field in their data source configuration .

Redaction settings are persisted in your config and reused on the next export.

---

## Review Mode

Review mode activates when the configured API token belongs to a programme committee member (reviewer) for the event. In this mode you can:

- See the abstracts assigned to you for review, highlighted with a personal indicator.
- Submit new reviews or edit your existing review for any assigned abstract.
- View the aggregated review charts (subject to visibility restrictions set by the event manager).
- See the total votes cast per track and the remaining votes to be cast.

### Submitting a review

1. Open the **Abstracts** page and locate an abstract assigned to you (marked with a reviewer badge).
2. Click **Review** (or open the abstract detail and click the review button in the review panel).
3. In the review form:
   - **Track** – select the programme track you are reviewing for (pre-filled if there is only one).
   - **Proposed action** – choose one of: `Accept`, `Reject`, `Change tracks`, `Mark as duplicate`, or `Merge`.
   - **Questions / Ratings** – answer each rating question defined for the event. Two special questions named *First Priority* and *Second Priority* are rendered as a mutually exclusive radio selection (only one can be marked "yes").
   - **Comment** – free-text comment visible to track conveners and managers.
   - **Related abstract** *(for Merge/Duplicate actions)* – search and select the target abstract.
4. Click **Submit Review**. The review is sent to the Indico API immediately.

### Editing an existing review

Open the abstract details dialog. If you have already submitted a review, the form pre-fills with your current responses. Make changes and click **Update Review**.

### My Reviews tab

The **Charts → Reviews → My Reviews** tab (visible only when you have assigned abstracts) shows:

- A count of abstracts assigned, reviewed, and still pending review.
- A **track progress bar chart** showing the total assigned abstracts per track with the reviewed portion highlighted.
- A **timeline** of your submitted reviews over time.

---

## Reading Mode

Reading mode requires no API token. It is ideal for reviewers who receive an abstracts export file from the manager and want to browse abstracts offline.

### Setup

1. Obtain the exported abstracts JSON file from your conference manager.
2. Open **Settings → Configuration → Data Sources** and either:
   - Add a new Indico data source and set the **Abstracts File** field to the path of the JSON file (leave API Token Name empty), or
   - Use the **Setup Wizard** (if no source is configured) and point it to the file.
3. No valid API token is required, just set is as an arbitrary string.
   The app loads all abstract data directly from the file.
4. Navigate to the **Abstracts** page to browse the content.

### What is available in reading mode

- Full abstract browsing (table and card views).
- Abstract details dialog (content, authors, affiliations, custom fields — subject to what the manager chose to include in the export).
- Abstracts stats charts (Affiliation, Submission trend, Word Cloud). Review charts are available only if the manager included review data in the export.
- Keyword search and filtering.
- From the table view, open one by clicking the title, then use the left/right arrow keys to navigate the list without closing the dialog.

---

## Abstracts Stats Charts

The **Charts** page provides several interactive visualisations built from the loaded abstract data. All charts update reactively when the data source changes.

### Affiliation tab

Analyses author affiliations extracted from the `persons` array of each abstract.

- **By Institution** – donut chart (top 10 institutions) + full bar chart of all institutions sorted by count. An optional **Affiliation Deduplication** feature merges aliases (e.g. "MIT" and "Massachusetts Institute of Technology") into a single canonical name. Click the ⚙ button to manage alias mappings, which are persisted in the configuration.
- **By Country** – donut chart grouping affiliations by country name. Structured `country_name` data from the Indico API is used when available; otherwise a heuristic string-match is applied.
- **By Continent** – donut chart grouping by continent derived from country.
- **Table** – paginated tabular view of all affiliation entries with deduplication applied.

### Submission tab

A time-series chart of abstract submission timestamps.

- Toggle between **per-bucket** (bar chart) and **cumulative** (line chart) views.
- Choose the time bucket granularity: **Day**, **Week**, or **Month**.

### Reviews tab

Available when review data is present (management mode or reading mode with reviews included in the export).

**Summary bar** shows total review count, number of unique reviewers, and number of tracks with at least one review.

Sub-tabs:

| Tab | Description |
|-----|-------------|
| **By Reviewer** | Horizontal bar chart of review count per reviewer. Click a reviewer's name to open their profile card (affiliation, avatar, contact). |
| **By Track** | Side-by-side donut + bar chart showing review distribution across programme tracks. |
| **By Action** | Donut chart of proposed review actions: Accept / Reject / Change tracks / Mark as duplicate / Merge. |
| **Ratings** | Stacked bar chart of weighted *First Priority* and *Second Priority* scores per abstract. Use the weight controls (toggle visible via the ⚖ icon) to adjust how much each priority question contributes to the total. |
| **Timeline** | Scatter/line chart of all review submissions over time. |
| **Matrix** | Grid view of all abstracts vs. assigned reviewers, colour-coded by proposed action. Shared priority weights from the Ratings tab are reflected here. Click any cell to open the full review or submit a new one. |
| **My Reviews** | Personal review progress — only visible when the current token has assigned abstracts. Shows assigned count, reviewed count, per-track progress bar, and review timeline. |

### Word Cloud tab

A word cloud generated from abstract titles and content. Controls:

- **Max words** – show top 100 / 200 / 300 / 400 / 500 words.
- **Plural normalisation** – toggle to fold plurals into their singular base form (e.g. "experiments" → "experiment").
- **Custom excluded words** – click the filter icon to open the excluded-words dialog. Add any stop words or conference-specific terms to suppress. The list is saved to your configuration.

---

## Cache Management

IndicoDataFusion caches Indico API responses locally to speed up repeat access and allow offline browsing.

Open **Settings → Cache** to:

- View cache statistics: size on disk, number of entries, and per-data-source breakdown.
- See the age of each cached item and when it was last refreshed.
- **Refresh** a specific entry or the entire cache for the active data source.
- **Delete** a single cache entry or **Clear All** entries.
- Adjust cache settings (TTL, max size, custom cache directory) directly from this panel.

Default cache settings:

| Setting | Default | Description |
|---------|---------|-------------|
| TTL | `24h` | How long a cached response is considered fresh |
| Max size | `100 MB` | Maximum total disk usage for all cache entries |
| Cache dir | OS temp | Where cache files are stored on disk |

> In **test/local-file mode** the cache panel is read-only and refresh operations are disabled.

---

## Troubleshooting

### Setup Wizard

If the app cannot initialise a data source on startup, the **Setup Wizard** opens automatically. It classifies the error and guides you through the fix:

- **Auth error (401/403)** – your API token is missing, expired, or lacks the required permissions. Go to Step 2 in the wizard to add or replace the token.
- **Not found (404)** – the Event ID may be wrong, or the event does not exist on this Indico instance. Verify in Step 3.
- **DNS / Base URL error** – the Indico URL could not be resolved. Check the URL in Step 3.
- **Timeout** – increase the `timeout` value on the data source (e.g. `120s`) or check your network connection.
- **No data source configured** – use Step 3 to add one.

### Common issues

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Abstracts page is empty | Cache stale or no data fetched yet | Open Cache tab and click Refresh |
| "Token not found" warning in status bar | Token name in data source doesn't match any entry in API Tokens | Add a matching token entry or update `api_token_name` |
| Export Abstracts option not shown | App is in Review or Reading mode | Export is only available in Management mode |
| Import fails with "wrong password" | Incorrect password | Use the password that was set at export time |


---

## GitHub Pages — Project Landing Page

The `docs/` directory contains the project landing page hosted via GitHub Pages.

### Folder structure

```
docs/
├── index.html   # Main single-page site
├── style.css    # Stylesheet (mobile-first, dark theme)
└── main.js      # Vanilla JS (nav, scroll-reveal, animations)
```

### Deploying to GitHub Pages

1. Push the `docs/` directory to your default branch.
2. In your repository go to **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**.
4. Select the branch (e.g. `main`) and set the folder to **`/docs`**.
5. Click **Save**. GitHub will publish the site at
   `https://<org>.github.io/<repo>/` within a few minutes.

### Editing content

All placeholder values (project name, links, roadmap items) are in `docs/index.html`.  
Search for `IndicoDataFusion/IDF-App` to find every GitHub link that may need updating.
