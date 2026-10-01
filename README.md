# Claude Code, Hands On

**From first prompt to agent-augmented delivery.** A 2-hour hands-on workshop from World Wide Technology.

This repository is your workspace for the workshop. It contains **Copperline**, a small but realistic web app (React front end, REST API, SQLite database), plus the lab guides and helper scripts.

## Start here

Do this before the session. It takes 20 to 40 minutes, longer on Windows. The full pre-work guide, with troubleshooting for every step, is [workshop/pre-work.md](workshop/pre-work.md) (also as [pre-work.docx](workshop/pre-work.docx)).

You need:

- **git**, to track your changes
- **Node.js 24 LTS** (24.15 or later), to run the app. Node 22.22.2 or later and Node 26 also work.
- **The GitHub CLI (`gh`)**, to create your copy and read the workshop issues
- **Claude Code**, plus a Claude account it can sign in with
- **A GitHub account**

### Step 1: Install the tools

Follow the section for your computer, then go to step 2.

#### macOS

These commands use Homebrew. If `brew --version` fails, install Homebrew first from https://brew.sh (it needs administrator rights), or use the installers linked below.

1. git. Either command works; the first one needs no Homebrew.

   ```bash
   xcode-select --install
   ```

   ```bash
   brew install git
   ```

2. Node.js 24. Or download the macOS installer from https://nodejs.org/en/download.

   ```bash
   brew install node@24
   ```

   ```bash
   brew link --overwrite --force node@24
   ```

3. The GitHub CLI. Or download the installer from https://cli.github.com.

   ```bash
   brew install gh
   ```

4. Claude Code, with the native installer.

   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   ```

#### Windows

The workshop runs in **WSL** (Windows Subsystem for Linux), not in PowerShell or CMD. You install the tools inside Ubuntu, using the Linux commands.

1. Open **PowerShell as an administrator**: right-click PowerShell in the Start menu, then choose **Run as administrator**. Run:

   ```powershell
   wsl --install
   ```

2. Restart your computer when it asks.
3. Open **Ubuntu** from the Start menu, pick a username and password, and wait for the prompt.
4. In that Ubuntu window, follow the **Linux (Ubuntu and Debian)** section below. Type everything for the rest of the workshop in Ubuntu too.

Keep your work in your Linux home folder (`cd ~`), not under `/mnt/c`, because it is faster and avoids permission problems. Microsoft's guide is at https://learn.microsoft.com/en-us/windows/wsl/install.

#### Linux (Ubuntu and Debian), and WSL

On another distribution, install the same tools with your package manager. The links in each step have instructions.

1. git, curl and build tools.

   ```bash
   sudo apt-get update && sudo apt-get install -y git curl build-essential
   ```

2. Node.js 24, using nvm. Copy the current nvm command from https://nodejs.org/en/download; it looks like this one.

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
   ```

   Close the terminal and open a new one, then:

   ```bash
   nvm install 24
   ```

3. The GitHub CLI. Paste this whole block as one command. The official instructions are at https://github.com/cli/cli/blob/trunk/docs/install_linux.md.

   ```bash
   (type -p wget >/dev/null || (sudo apt update && sudo apt install wget -y)) && sudo mkdir -p -m 755 /etc/apt/keyrings && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg && cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg && sudo mkdir -p -m 755 /etc/apt/sources.list.d && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null && sudo apt update && sudo apt install gh -y
   ```

4. Claude Code, with the native installer.

   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   ```

#### Every computer: check the tools

Open a **new terminal window**, so it picks up the changes. Then check that each command prints a version number:

```bash
git --version && node --version && gh --version && claude --version
```

Tell git who you are. Use your own name and email.

```bash
git config --global user.name "Your Name"
```

```bash
git config --global user.email you@example.com
```

### Step 2: Sign in

1. Sign in to GitHub. Choose **GitHub.com**, then **HTTPS**. Answer **Yes** to "Authenticate Git with your GitHub credentials?", then sign in with a **web browser**. If no browser opens (common in WSL), copy the URL that `gh` prints into a browser.

   ```bash
   gh auth login
   ```

2. Sign in to Claude Code. A browser window opens for you to log in. When the terminal shows `Login successful`, press Enter. To leave Claude Code, press `Ctrl+D` twice.

   ```bash
   claude
   ```

### Step 3: Make your own copy of this repository

Run these one at a time, in the folder where you want the project to live. Cloning keeps the full history, which Lab 1 uses, so don't use GitHub's "fork" or "template" buttons.

```bash
git clone https://github.com/WWT-AINE-Workshops/workshop-claude-code-advanced.git my-copperline
```

```bash
cd my-copperline && git remote remove origin
```

```bash
gh repo create my-copperline --private --source . --remote origin --push
```

Stay in the `my-copperline` folder for every step below.

### Step 4: Check your computer is ready

```bash
./scripts/check-setup.sh
```

Playwright shows as "not checked" until step 5 installs it. Everything else should be ✅.

### Step 5: Install, set up and seed your copy

```bash
npm ci
```

Install the browser the tests use. On macOS:

```bash
npx playwright install chromium
```

On Linux and WSL, install it with its system libraries instead (it asks for your password):

```bash
npx playwright install --with-deps chromium
```

Then set up the database and add the workshop issues and pull request to your copy on GitHub:

```bash
npm run setup
```

```bash
./scripts/seed-github.sh
```

Run the check once more. Everything should be ✅ and it should end with `Ready for the workshop.`

```bash
./scripts/check-setup.sh
```

### Step 6: Open the workshop guide

**[workshop/README.md](workshop/README.md)** has the agenda and links to every lab.

Fell behind during the session? `./scripts/reset-lab.sh <lab number>` puts you at the start of any lab.

---

# Copperline

Copperline is the internal IT equipment request portal for a fictional company. Employees request laptops, monitors and peripherals; their department manager approves or rejects; IT tracks stock.

## Run it

Requires Node 22.22.2+ (22.x), 24.15+ (24.x) or 26+.

```bash
npm install
npx playwright install chromium   # on Linux/WSL: npx playwright install --with-deps chromium
npm run setup
npm run dev
```

Open http://localhost:5173. Use **Signed in as** in the header to switch between demo users (employees, managers, and an admin).

| Service                | Port | Workspace          |
| ---------------------- | ---- | ------------------ |
| Web (React + Vite)     | 5173 | `apps/web`         |
| API (Fastify + SQLite) | 3001 | `apps/api`         |
| Vendor pricing stub    | 4010 | `apps/vendor-stub` |

## Commands

| Command                                        | What it does                                                                  |
| ---------------------------------------------- | ----------------------------------------------------------------------------- |
| `npm run setup`                                | Builds the database tools, then resets the SQLite database to the demo data   |
| `npm run dev`                                  | Starts web, API and vendor stub together                                      |
| `npm test`                                     | Unit and API tests (Vitest)                                                   |
| `npm run test:e2e`                             | Browser smoke tests (Playwright)                                              |
| `npm run lint` / `npm run typecheck`           | ESLint / TypeScript                                                           |
| `npm run screenshot -- /dashboard --width 800` | Saves a screenshot of a page to `.screenshots/` (needs `npm run dev` running) |

## API at a glance

All routes except `/api/health` need an `X-User-Id` header with a demo user's id.

`GET /api/me` · `GET /api/users` · `GET /api/dashboard` · `GET /api/items[?q=]` · `GET /api/items/:id` · `GET /api/items/:id/price` · `GET /api/requests[?page=&pageSize=]` · `GET /api/requests/:id` · `POST /api/requests` · `POST /api/requests/:id/approve` · `POST /api/requests/:id/reject` · `POST /api/requests/:id/cancel` · `GET /api/approvals`

## Layout

```
apps/web          React front end
apps/api          REST API, migrations, seed data
apps/vendor-stub  Local stand-in for the vendor pricing service
packages/shared   Types shared by web and API
tools/db-mcp      Read-only MCP server for the Copperline database
```
