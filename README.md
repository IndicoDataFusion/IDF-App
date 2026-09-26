# IndicoDataFusion

**IndicoDataFusion (IDF)** is a cross-platform desktop application for
bringing an Indico event's programme, contributions, abstracts, reviews,
and local research notes into one fast, searchable workspace. It runs as
a native application on Windows, macOS, and Linux, and can work from
live Indico data or an exported abstracts file.

[Download a release](https://github.com/IndicoDataFusion/IDF-App/releases)
· [Report an issue](https://github.com/IndicoDataFusion/IDF-App/issues)
· [MIT license](LICENSE)

## What it does

- Browse event information, abstracts, contributions, sessions, tracks,
  people, attachments, and custom fields in table or card views.
- Search, sort, and filter large abstract and contribution lists,
  including configurable extracted custom-field columns.
- Keep private, local metadata—stars, tags, and notes—for abstracts and
  contributions. Metadata is stored in a local SQLite database and is
  scoped to the active data source.
- Use live Indico data with an API token, or load an abstracts JSON
  export for file-based/offline browsing.
- Manage event registrations: browse every registration form and its
  fields, and mark registrations as paid or unpaid in Indico.
- Optionally link a Cvent event to pair Cvent attendees with their
  Indico registrations and compare payments side by side.
- Review assigned abstracts with your Indico reviewer permissions;
  submit or update reviews, proposed actions, priorities, comments, and
  related-abstract choices.
- Analyse abstract submissions, affiliations, countries and continents,
  review activity, ratings, tracks, and word frequencies with
  interactive charts.
- Configure a proceedings site to derive and validate paper and
  talk-slides links for contributions.
- Ask an optional LLM assistant questions about loaded conference data.
  It can query a read-only in-memory data snapshot, generate charts,
  inspect linked PDFs, stream answers, and retain local chat sessions.
- Cache API responses locally, manage cache freshness and size, and
  export/import encrypted configuration backups.

## Install

Download the package for your platform from the
[releases page](https://github.com/IndicoDataFusion/IDF-App/releases) ,
then follow the normal installer flow for your operating system.

- **Windows:** Run the downloaded installer. If Windows marks an
  unsigned download as blocked, open the file’s Properties and choose
  **Unblock** before installing.
- **macOS:** Open the downloaded package. If macOS quarantines it,
  remove the quarantine attribute using the command shown in the release
  notes, then run the package again.
- **Linux:** Use the supplied archive or AppImage. For an AppImage, make
  it executable before opening it.

On first launch, IDF creates a platform-appropriate configuration file
from the embedded sample and opens the setup wizard when a usable source
is not available. You can also choose a configuration explicitly:

```sh
idf --config /path/to/config.yml
```

The `IDF_CONFIG_PATH` environment variable takes precedence over
`--config` ; this is useful for separate work and test configurations.

## Quick start

1. Launch IDF and complete the **Setup Wizard**, or open **Settings →
   Data Sources**.
2. Add an API token for your Indico instance, then add a data source
   with its base URL and numeric event ID.
3. Select the data source and open **Event Info**, **Abstracts**, or
   **Contributions** from the sidebar.
4. Let the initial data load finish. Subsequent reads use the local
   cache until it expires or you refresh it.

For file-based browsing, obtain an abstracts JSON export, create or edit
a data source, and set **Abstracts File**. Abstracts are then read from
that file; an API token is not required merely to browse it.

## User guide

### Configure a live Indico source

Create an API token in Indico under **My Profile → API Tokens**. Its
effective access is determined by your roles and permissions on the
event, so use an account that has the access you need.

In IDF, open **Settings → Data Sources**, expand **API Tokens**, and add
an entry with a memorable name, the Indico base URL, username, and token
secret. Next, add a data source and supply:

| Field | Purpose |
| --- | --- |
| **Name** | Local label for the source, such as `myconf-2026`. |
| **Base URL** | Indico server root, for example `https://indico.example.org`. |
| **Event ID** | Numeric event ID from the Indico event URL. |
| **API Token** | The saved token entry to use for API requests. |
| **Abstracts File** | Optional exported JSON file; when set, it replaces live abstract loading. |
| **Proceedings URL** | Optional published proceedings root for paper and slides links. |
| **Cvent Event** | Optional Cvent event code whose attendees are matched against the registrations (see below). |
| **Cvent API Token** | The saved token entry holding the Cvent client credentials. |
| **Ref # Question ID** | Optional; pins the Cvent question that asks for the Indico Ref #. |

You can keep multiple sources and switch the active one from this panel.
Source descriptions, tags, and favourites help organise a larger
collection.

### Manage registrations

With an account that manages the event's registrations, open
**Registrations** from the sidebar. IDF gathers every registration form
of the event, with tabs per form, column filters, and a details dialog
that lists all of the registrant's form fields.

Registrations **Awaiting payment** offer **Mark as paid**, which records
a manual payment in Indico; paid registrations offer **Mark as unpaid**.
Both change the live event only after a confirmation, and Indico may
email the registrant. Marking a registration unpaid refunds nothing:
handle refunds of online payments with the payment provider. Refresh
the page to re-read the registrations from Indico.

### Link a Cvent event to the registrations

When attendees also register in Cvent, IDF can pair each Cvent attendee
with their Indico registration and show the Cvent payment next to it on
the **Registrations** page.

1. In Cvent, create REST API client credentials (client ID and secret)
   that can read events, attendees, event questions, orders, and
   transactions.
2. In **Settings → Data Sources → API Tokens**, add an entry for them:

   | Token field | Value |
   | --- | --- |
   | **Name** | Any label, such as `myconf-cvent`. |
   | **Base URL** | The Cvent API: `https://api-platform.cvent.com/ea` (EU: `https://api-platform-eur.cvent.com/ea`). |
   | **Username** | The Cvent **client ID**. |
   | **Token** | The Cvent **client secret**; it is stored in the OS keyring. |

3. Edit the Indico data source, enter the **Cvent Event** code (the short
   code in the Cvent event, such as `EXAMPLECODE`), and pick that token as
   the **Cvent API Token**. Clear the event code to turn the link off.

The **ⓘ Cvent** button in the API Tokens panel, and the help link next to
the data source's Cvent fields, repeat these steps inside the app.

Each Cvent attendee is matched to one registration:

1. **By Ref #** — the attendee's answer to the Cvent question asking for
   their Indico registration reference number is looked up as the
   registration's `#` id (spaces and a `Ref`, `:` or `#` prefix are
   ignored). The question is found by its text; set **Ref # Question ID**
   if it is worded differently. A Ref # hit whose name differs is still
   paired but marked **Ref #, check name**.
2. **By full name** — only when the Ref # is missing or matches nothing.
   Accents, case, punctuation, and word order are ignored; several
   registrations with the same name are reported as ambiguous.

A registration is paired with at most one attendee. The Registrations
table gains **Cvent** and **Cvent payment** columns (paid, due, waived for
fully discounted orders, cancelled), the details dialog shows the Cvent
attendee and order, including discounts and the amount before discount,
and a panel lists Cvent attendees without a registration.

Registrations paid in Cvent but still **Awaiting payment** in Indico are
highlighted and can be shown with the **Paid in Cvent, unpaid in Indico**
filter. IDF never changes Indico on its own: use **Mark as paid** to record
the payment, after checking the amounts in the confirmation. Refreshing
the Registrations page also re-reads Cvent.

### Browse and organise the programme

Use **Abstracts** and **Contributions** to move between table and card
views, filter the data, and open detailed records. Details expose
associated people, tracks, sessions, attachments, links, reviews, and
Indico fields when they are available to the active account.

Star an item or add private tags and notes as you work. The metadata
views in Settings gather these annotations across sources, making it
easy to return to a shortlist later. The **Columns** settings tab can
expose selected Indico abstract custom fields as ordinary table columns.

For published proceedings, set a source’s **Proceedings URL** and
optional talk-suffix. IDF can construct expected paper and slides URLs,
check them, and attach valid links to contributions.

### Review abstracts

With an Indico account that has reviewer access, open an assigned
abstract and choose **Review**. Select the applicable track, complete
the event’s questions and priority choices, choose a proposed action,
add a comment, and submit. Existing personal reviews can be reopened and
updated.

Review availability and visible fields ultimately come from Indico’s
permissions and event configuration. If an **Abstracts File** is
configured, it supplies the displayed abstract dataset; API-backed
actions still require a valid token and network access.

### Work from an abstracts export

Managers can create a shareable JSON dataset from **Settings →
Import/Export → Export Abstracts Data**. Before exporting, select the
fields to redact; keep reviewer identities, contact details, judgments,
and other sensitive information out of a distribution unless they are
deliberately needed.

Recipients load the export through **Abstracts File** in their data
source. This is useful for local, offline browsing and for distributing
a deliberately limited view of abstract data. The exact fields and
analytics available depend on what the export contains.

### Analyse data and charts

The charts associated with abstract data include:

- affiliation breakdowns by institution, country, and continent, with
  configurable institution aliases and continent mappings;
- abstract submission trends by day, week, or month, in per-period or
  cumulative form;
- a configurable word cloud with plural normalisation and excluded
  words; and
- review analysis, when review data is available: reviewer, track,
  action, rating, timeline, matrix, and personal-progress views.

Use **Settings → Affiliation Map** to maintain canonical institution
names and aliases. Chart preferences, excluded words, and affiliation
mappings are saved in your configuration.

### Use the AI assistant (optional)

The **AI Assistant** is disabled until you configure a model under
**Settings → LLM**. IDF supports:

- OpenAI-compatible APIs, including OpenAI, vLLM, Ollama-compatible
  endpoints, llama.cpp, and similar local servers;
- Google Gemini; and
- Anthropic Claude.

Create or reuse an API-token entry for cloud providers, add a named
model profile, and make it active. In the assistant, choose which loaded
contexts to include—abstracts, contributions, reviews, and tracks—then
ask a question. The assistant can use a read-only conference-data query
tool, create inline charts, and retrieve text from linked PDFs when
asked.

Chat sessions and assistant metadata are stored locally. Sending a
prompt to a cloud model sends the selected context and your conversation
to that provider, so select only data you are authorised to share and
follow your organisation’s data-handling policy.

### Manage local data and backups

**Settings → Cache** shows cached API entries, their age, disk usage,
and data-source grouping. Refresh a record or clear cache entries when
fresh data is needed. Default cache settings are a 24-hour TTL and 100
MB maximum size; both are configurable.

**Settings → Import/Export** can save a complete encrypted `.idfc`
configuration backup. This includes configuration and API-token secrets
retrieved from the keyring, encrypted using AES-256-GCM with a
password-derived key. Treat an export like a password-manager backup:
use a strong password and share it only through an approved channel.

## Security and local storage

- Indico and LLM token secrets are stored in the operating-system
  keyring whenever possible, not as plaintext in the YAML configuration.
- API responses are cached on disk; private stars, tags, notes, and LLM
  session history are stored locally in SQLite.
- Abstract JSON exports may contain sensitive conference information.
  Apply redaction before sharing them and store them according to your
  conference policy.

## Configuration reference

The UI is the recommended way to manage configuration. This abbreviated
YAML example shows the essential shape of a live source:

```yaml
data-source:
  use: myconf-2026

cache:
  ttl: 24h
  max_size: 100MB

api-tokens:
  - name: indico-myconf
    base_url: https://indico.example.org
    username: your-username
    token: "" # Secret is stored in the OS keyring.

myconf-2026:
  indico: true
  base_url: https://indico.example.org
  event_id: 42
  api_token_name: indico-myconf
  timeout: 60s
  # abstracts_file: /path/to/abstracts.json
  # proceedings_url: https://proceedings.example.org/myconf2026/
  # proceedings_talk_suffix: talk
  # cvent:                      # optional: match Cvent attendees to registrations
  #   event: EXAMPLECODE        # Cvent event code (or uuid)
  #   api_token_name: myconf-cvent
  #   ref_question_id: ""       # optional; default: detect the Ref # question by text
```

For a Cvent link, the `api-tokens` entry holds the Cvent client
credentials: `base_url` is the Cvent API, `username` the client ID, and
the token the client secret:

```yaml
api-tokens:
  - name: myconf-cvent
    base_url: https://api-platform.cvent.com/ea
    username: your-cvent-client-id
    token: "" # Client secret is stored in the OS keyring.
```

`abstracts_file` switches abstract loading to the named JSON file. It
can be used without `api_token_name` for browsing only. See
[config/sample.yml](config/sample.yml) for a fuller example.

## Develop from source

The application uses Go, Wails v2, Svelte 5, Vite, Tailwind CSS, SQLite,
and ECharts. The Go module currently requires Go **1.26.5**; install a
compatible Node.js version and the Wails v2 CLI as well.

```sh
make install-js
cp config/sample.yml config/dev.yaml
make dev                 # Linux
# make dev-darwin        # macOS
```

`make dev` uses `config/dev.yaml` . For a different configuration, use
`IDF_CONFIG_PATH` with the Wails command or launch a built app with
`--config` .

Useful commands:

| Task | Command |
| --- | --- |
| Run all Go tests | `go test ./...` |
| Run frontend checks | `cd frontend && npm run format:check` |
| Build the frontend | `cd frontend && npm run build` |
| Build Linux app | `make linux` |
| Build macOS app | `make darwin` |
| Build Windows app | `make win` |
| Build CLI helpers | `make cmd` |

The standalone commands under [`cmd/`](cmd) are useful for fetching
event, contribution, abstract, and review-track data outside the desktop
UI. Test fixtures live in [`testdata/`](testdata) .

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Setup wizard reports authentication failure | Confirm the source’s token entry exists in Settings, the secret is in the OS keyring, and the Indico account has access to the event. |
| Event cannot be found | Verify the base URL and numeric event ID from the Indico URL. |
| Abstracts are missing or old | Confirm that the intended source is active, then refresh the relevant cache entry or clear the cache. |
| File-based abstracts fail to load | Check that **Abstracts File** points to an accessible IDF abstracts JSON export. |
| Registrations cannot be loaded or marked paid | The token's account must manage the event's registrations; large forms can take up to two minutes to export. |
| Cvent match unavailable | Check the **Cvent Event** code, that the token's Username is the Cvent client ID and its Base URL the Cvent API, and the client's read permissions. |
| Review submission is unavailable | Use a live, valid reviewer token and confirm that the event has assigned you that abstract and track. |
| Assistant cannot connect | Check the active LLM model profile, endpoint, model ID, token entry, and your network access. |
| Import cannot be decrypted | Use the original backup password; IDF cannot recover a forgotten encryption password. |

## License

IndicoDataFusion is released under the [MIT License](LICENSE) .
