# Pre-work for Claude Code, Hands On

Do this before the session. It takes **30 to 45 minutes**, and most of that is waiting for downloads. In the session you will start working in the first few minutes, so a ready laptop matters.

When you finish, you will have the tools installed, your own private copy of the workshop repository, and the app running on your machine. You do not need to know Claude Code yet.

**What you need.** A laptop where you can install software, an internet connection, and a GitHub account. For Claude Code you also need a way to sign in. The docs list the options, so read their authentication page before you start: https://code.claude.com/docs/en/authentication.

**Where to type commands.** Everything below runs in a terminal. On macOS that is the Terminal app. On Linux it is your terminal. On Windows you use WSL, a Linux terminal inside Windows. Step 1 shows how to set it up. Lines in grey boxes are commands: copy one box at a time, paste it into the terminal and press Enter.

**Version numbers will differ.** The outputs below show what a working setup looks like. Your numbers will not match exactly. That is fine.

## Step 1: Install the tools

**Who does it:** Everyone.

**Why it matters:** The labs use git to track changes, Node.js to run the app, the GitHub CLI (`gh`) to read issues and open pull requests, and Claude Code itself.

**Windows users: set up WSL first.** The workshop does not run in PowerShell or CMD. Open PowerShell as an administrator (right-click it, then choose Run as administrator) and run this:

```powershell
wsl --install
```

Allow extra time on Windows: `wsl --install` needs a restart and may need administrator rights. Restart your computer when it asks. Then open Ubuntu from the Start menu, pick a username and password, and wait for the prompt to appear. From here on, type everything in that Ubuntu window, and follow the **Linux and WSL** commands below. Microsoft's guide is at https://learn.microsoft.com/en-us/windows/wsl/install. Keep your work in your Linux home folder, not under `/mnt/c`, because it is faster and avoids permission problems.

**How to do it.**

1. Install **git**.
   - **macOS:** run `xcode-select --install`, or `brew install git` if you use Homebrew (https://brew.sh).
   - **Linux and WSL:**

     ```bash
     sudo apt-get update && sudo apt-get install -y git curl build-essential
     ```

   - Tell git who you are. Use your own name and email.

     ```bash
     git config --global user.name "Your Name"
     ```

     ```bash
     git config --global user.email you@example.com
     ```

2. Install **Node.js 24 LTS** (24.15 or later). Node 22 (22.22.2 or later) and Node 26 also pass the check, but 24 is the one we tested.
   - **macOS:** download the installer from https://nodejs.org/en/download, or with Homebrew run these two commands:

     ```bash
     brew install node@24
     ```

     ```bash
     brew link --overwrite --force node@24
     ```

   - **Linux and WSL:** the Node.js download page offers nvm, a small tool that installs Node for you. Copy the current nvm command from https://nodejs.org/en/download, which looks like this:

     ```bash
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
     ```

     Close the terminal and open a new one. Then install Node:

     ```bash
     nvm install 24
     ```

3. Install the **GitHub CLI**.
   - **macOS:** if you have Homebrew, run the command below. If you do not, either install Homebrew first from https://brew.sh (it needs administrator rights), or download the GitHub CLI installer from https://cli.github.com.

     ```bash
     brew install gh
     ```

   - **Linux and WSL:** the official apt instructions are at https://github.com/cli/cli/blob/trunk/docs/install_linux.md. For Ubuntu and Debian, paste this whole block as one command:

     ```bash
     (type -p wget >/dev/null || (sudo apt update && sudo apt install wget -y)) && sudo mkdir -p -m 755 /etc/apt/keyrings && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg && cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg && sudo mkdir -p -m 755 /etc/apt/sources.list.d && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null && sudo apt update && sudo apt install gh -y
     ```

4. Install **Claude Code** with the native installer. It works on macOS, Linux and WSL.

   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   ```

5. Open a **new terminal window** so your shell picks up the changes, then check each tool.

   ```bash
   git --version
   ```

   ```bash
   node --version
   ```

   ```bash
   gh --version
   ```

   ```bash
   claude --version
   ```

**Done when:** all four commands print a version number. For Node, v24 is recommended; 22.22.2 or later and 26 or later also pass.

**If you get stuck.**

- `command not found: claude`: the install folder is not on your PATH yet. Open a new terminal and try again. If it still fails, see the install troubleshooting page: https://code.claude.com/docs/en/troubleshoot-install.
- `node --version` shows an older number after installing: you have a second copy of Node. Open a new terminal. With nvm, run `nvm use 24`.
- The Claude Code install fails with a `403` or a curl error: this is often a company network or proxy. Try from another network, and tell the facilitator what the error said.
- Your company laptop blocks installs: ask your IT team, or bring a personal laptop. Tell the facilitator ahead of time and we will find a way.
- Setup docs for Claude Code: https://code.claude.com/docs/en/setup.

## Step 2: Sign in

**Who does it:** Everyone.

**Why it matters:** The GitHub CLI creates your copy of the repository and reads the workshop issues. Claude Code needs your account before it will answer anything.

**How to do it.**

1. Sign in to GitHub. Run this and answer the prompts. Choose **GitHub.com**, then **HTTPS**. When it asks "Authenticate Git with your GitHub credentials?", answer **Yes**. Without that, the push in step 3 fails. Then choose to sign in with a **web browser**. gh shows a one-time code and waits for you to press Enter before it opens your browser. Type the code there. If no browser opens (common in WSL), copy the URL that gh prints into a browser on Windows. Adding `-c` to the command copies the code to your clipboard.

   ```bash
   gh auth login
   ```

2. Check that it worked.

   ```bash
   gh auth status
   ```

3. Sign in to Claude Code. Run this from any folder. On first launch Claude Code opens a browser window for you to log in. When it finishes, the terminal shows `Login successful`, and you press Enter to continue.

   ```bash
   claude
   ```

   - If the browser does not open, press `c` to copy the login URL, then paste it into your browser.
   - If the browser shows a login code instead of returning to the terminal, paste the code at the `Paste code here if prompted` prompt. This is common in WSL.
   - If Claude Code asks whether you trust the folder, that is its workspace trust dialog. Read it, and say yes if the folder is one you made.

   - On first run you may also see theme or onboarding screens. Click through them.

4. Leave Claude Code: press `Ctrl+D` twice on an empty prompt. You are back at the normal prompt.

**Done when:** `gh auth status` says you are logged in to github.com, and Claude Code showed `Login successful`.

**If you get stuck.**

- Which sign-in option to use depends on how you pay for Claude. Check the authentication page (https://code.claude.com/docs/en/authentication), or ask your team admin. If your organization gave you an invitation, accept it first.
- `gh auth login` keeps asking for a code: copy the code exactly, including the dash, into the page your browser opened.
- If your company signs in to GitHub with single sign-on, you may need to authorize the GitHub CLI for your organization. This workshop only uses your personal account.

## Step 3: Make your copy of the workshop repository

**Who does it:** Everyone.

**Why it matters:** You get your own private repository, so you can commit, push and open pull requests without touching anyone else's. Cloning (rather than using a template) keeps the full commit history, which Lab 1 asks questions about.

**How to do it.** Run these three commands, one at a time, in the folder where you want the project to live. On WSL, that is your Linux home folder.

1. Clone the workshop repository into a folder called `my-copperline`.

   ```bash
   git clone https://github.com/WWT-AINE-Workshops/workshop-claude-code-advanced.git my-copperline
   ```

2. Move into the folder and remove the link back to the workshop repository.

   ```bash
   cd my-copperline && git remote remove origin
   ```

3. Create your private copy on GitHub and push to it.

   ```bash
   gh repo create my-copperline --private --source . --remote origin --push
   ```

**Done when:** the last command finishes without an error, and the new repository shows up at `github.com/<your user name>/my-copperline`.

**If you get stuck.**

- `Repository not found` on the clone: check your network and try again. If it still fails, tell the facilitator.
- `Name already exists on this account` on the last command: you have a repository called `my-copperline` already. Rename or delete that one on GitHub, or ask a helper.
- `fatal: destination path 'my-copperline' already exists`: you cloned before. Run `cd my-copperline` and continue from command 2, or delete the folder and start again.
- Stay in the `my-copperline` folder for every step below.

## Step 4: Check your setup

**Who does it:** Everyone.

**Why it matters:** One script checks everything above at once and tells you how to fix anything missing.

**How to do it.**

1. In the `my-copperline` folder, run:

   ```bash
   ./scripts/check-setup.sh
   ```

2. Read the output. Each line starts with a mark: a green tick means ready, a warning means fix it if you can, a red cross means it must be fixed.

**What you should see.** On a ready machine, before step 5, it looks like this. Your version numbers will differ.

```text
Checking your computer for the Claude Code workshop…

✅ Node.js 26.10.0
✅ npm 11.19.1
✅ git 2.50.1
✅ Claude Code 2.1.285
⚠️  Playwright Chromium not checked — run npm install first, then run this again
✅ GitHub CLI signed in

Ready for the workshop.
```

The Playwright warning is expected here. It goes away after step 5. The script may also warn that git does not know who you are, or that port 3001, 4010 or 5173 is in use. A message that Claude Code is older than 2.1.283 means you should run `claude update`.

**Done when:** the last line says `Ready for the workshop.`

**If you get stuck.**

- Each ❌ line says what is wrong and the command that fixes it. Run that command, then run the script again.
- `Permission denied`: run `chmod +x scripts/*.sh`, then try again.
- To check the Claude Code sign-in as well, add the `--live` option. It sends one tiny request, so it needs a working sign-in:

  ```bash
  ./scripts/check-setup.sh --live
  ```

## Step 5: Install the app and its tools

**Who does it:** Everyone.

**Why it matters:** The labs run the app and its tests, and Lab 3 uses a browser that Claude can drive for screenshots.

**How to do it.** Run these one at a time. The first and second can take a few minutes.

1. Install the project's packages with `npm ci`, which installs exactly what the lock file lists and never changes it, so your copy stays clean for `./scripts/reset-lab.sh` in Lab 1. A warning from npm about install scripts not yet covered by allowScripts is expected and harmless.

   ```bash
   npm ci
   ```

2. Install the test browser.
   - **macOS:**

     ```bash
     npx playwright install chromium
     ```

   - **Linux and WSL**, which adds the `--with-deps` option to install the system libraries it needs:

     ```bash
     npx playwright install --with-deps chromium
     ```

3. Build the helper tools and create the app's database with its sample data.

   ```bash
   npm run setup
   ```

4. Run the check again.

   ```bash
   ./scripts/check-setup.sh
   ```

**What you should see.** `npm run setup` ends with a line like this. The counts are the sample data for 8 people, 12 items and 40 requests.

```text
Reset …/apps/api/data/copperline.db: 8 users, 12 items, 40 requests
```

The second check shows `✅ Playwright Chromium` in place of the warning, and ends with `Ready for the workshop.`

**Done when:** the check passes with no ❌.

**If you get stuck.**

- `npm ci` fails with an error that mentions `node-gyp` or a compiler: a build tool is missing. On macOS run `xcode-select --install`. On Linux and WSL, install the tools from step 1 with `sudo apt-get install -y build-essential python3`. Then run `npm ci` again.
- `npm ci` warns about the engine or Node version: run `node --version`. You need 22.22.2 or later, and we recommend 24.
- The Playwright step stalls on Linux or WSL: use the Linux and WSL command above and enter your password when `sudo` asks.
- Anything else: run `npm ci` once more and read the first error line, not the last.

## Step 6: Seed GitHub with the workshop issues

**Who does it:** Everyone.

**Why it matters:** Labs 2, 3, 5 and 6 work from real issues and a real draft pull request in your repository. This script creates them.

**How to do it.**

1. Run the script. It needs your `gh` sign-in and your internet connection.

   ```bash
   ./scripts/seed-github.sh
   ```

2. Open your repository on GitHub and look at the Issues tab and the Pull requests tab.

**What you should see.** The script creates labels, four issues and one draft pull request. It then lists the open issues, and its last line is:

```text
Seeded. Issues #1–#4 and the Search v2 draft PR are ready.
```

These are the four issues, in this order:

| #   | Title                                                | Used in |
| --- | ---------------------------------------------------- | ------- |
| 1   | Filter requests by status and show approval history  | Lab 2   |
| 2   | Inventory can go negative when two approvals overlap | Lab 3   |
| 3   | Dashboard cards overflow below ~900px                | Lab 3   |
| 4   | Invalid request id returns 500 instead of 400        | Lab 5   |

The draft pull request is called **Search v2: search requests by item and justification**. Lab 6 reviews it.

**Done when:** you see the last line above, and the four issues are on GitHub.

**If you get stuck.**

- Running it a second time is safe. It prints `issue already exists: <title>` for each issue and does not create duplicates.
- Run `gh auth status`. If you are not signed in, repeat step 2 and run the seed script again.
- The script reads your repository name from the `origin` remote. If it complains about the remote, run `git remote -v`. You should see `origin` pointing at your own `my-copperline`. If not, repeat step 3.

## Step 7: Check the app runs

**Who does it:** Everyone.

**Why it matters:** In the session you will not want to debug a port clash. A two-minute test now avoids that.

**How to do it.**

1. Start the app.

   ```bash
   npm run dev
   ```

2. Wait for three lines like these in the terminal.

   ```text
   [vendor] vendor-stub listening on http://127.0.0.1:4010
   [api] … Server listening at http://127.0.0.1:3001
   [web]   ➜  Local:   http://localhost:5173/
   ```

3. Open http://localhost:5173 in your browser. You should see Copperline, with Dashboard, My requests, New request, Approvals and Catalog in the top bar.
4. Find the **Signed in as** list at the top right. Choose a different person, for example Ben Okafor. The page reloads with that person's data. Click Dashboard and Catalog to look around.
5. Go back to the terminal and press `Ctrl+C` to stop the app.

**Done when:** you saw Copperline in the browser, switched users, and stopped the app. The terminal prompt is back.

**If you get stuck.**

- The app will not start and says a port is in use: something else is using 3001, 4010 or 5173. Close that program and try again. `./scripts/check-setup.sh` names the busy port.
- The page is blank: wait ten seconds and refresh. Then check the terminal for a red error and send it to the facilitator.
- `npm run dev` stops straight away: run `npm run setup` once, then try again.
- You can also check the API directly while the app is running. Open http://localhost:3001/api/health in a browser. It shows `{"ok":true}`.

## Step 8: Optional reading

**Who does it:** Anyone who wants a head start. Skip it if you are short on time.

**Why it matters:** The first part of the session covers the same ideas in a few minutes. The reading gives you the longer version, and it makes the glossary below easier to remember.

**How to do it.** Open `workshop/foundations.md` in your repository. It is the written version of Part 1: what Claude Code is, how its loop works, and the habits that make it reliable. It takes about 10 minutes. The take-home `workshop/best-practices.md` is for after the session.

**Done when:** you have skimmed it, or decided to skip it.

**If you get stuck.** Nothing in the labs depends on it. Ask in the session.

## Before the session checklist

Tick each box.

- [ ] Windows only: WSL is installed, and I type everything in the Ubuntu window.
- [ ] `git --version`, `node --version`, `gh --version` and `claude --version` all print a version.
- [ ] `node --version` shows v24 (or v22.22.2 or later, or v26).
- [ ] `gh auth status` says I am logged in, and Claude Code showed `Login successful`.
- [ ] My private `my-copperline` repository exists on GitHub.
- [ ] `./scripts/check-setup.sh` ends with `Ready for the workshop.`
- [ ] `./scripts/seed-github.sh` ended with `Seeded.` and I can see four issues.
- [ ] `npm run dev` showed Copperline at http://localhost:5173, and I stopped it with `Ctrl+C`.
- [ ] I will bring my laptop, charger and an internet connection.
- [ ] I know who to ask for help if something in this list fails: the facilitator.

If one box will not tick, do not wait. Tell the facilitator before the session what the error says.

## Glossary

You will meet these words in the session. They are also in the workbook.

| Term            | What it means                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agentic         | Claude works in a loop. It gathers context, takes action, then checks the result, and you can interrupt at any point.                                                                                                                                                                                                                                                                                            |
| Checkpoint      | A saved point you can rewind to, with `Esc Esc` or `/rewind`. Checkpoints track only the edits Claude makes with its file-editing tools. Changes made by Bash commands, such as `rm` or `mv`, are not tracked and cannot be rewound.                                                                                                                                                                             |
| CLAUDE.md       | A short project file that Claude reads at the start of every session. It holds what Claude cannot guess from the code, such as commands and team rules.                                                                                                                                                                                                                                                          |
| Context window  | Everything in the current session: your messages, the files Claude opened and command output. It fills up, and Claude does worse as it fills. `/context` shows how full it is.                                                                                                                                                                                                                                   |
| Copperline      | The small equipment-request web app you work on in the labs.                                                                                                                                                                                                                                                                                                                                                     |
| Headless        | Running Claude Code for one turn with no interactive session, using `claude -p "<prompt>"`. It prints the result, which suits scripts and CI.                                                                                                                                                                                                                                                                    |
| Hook            | A command that Claude Code runs automatically at a set point, such as after it edits a file. CLAUDE.md instructions are advisory, but a hook is deterministic: use one for anything that must happen every time.                                                                                                                                                                                                 |
| MCP             | Model Context Protocol, a standard way to connect Claude to outside systems such as a database. A project lists its servers in `.mcp.json`.                                                                                                                                                                                                                                                                      |
| Permission mode | The setting that decides how often Claude asks before acting. `Shift+Tab` cycles through the modes. Manual asks before most actions that change things, and reads do not prompt. Accept edits lets file edits go ahead. Plan reads and answers only. Auto runs actions with background safety checks. On Claude Code 2.1.283 and later a new session starts in auto, unless your organization has turned it off. |
| Plan mode       | A mode where Claude reads files and answers questions but changes nothing. Press `Shift+Tab` until the status bar shows `⏸ plan mode on`, or type `/plan`.                                                                                                                                                                                                                                                       |
| PR              | Pull request. A request on GitHub to merge the changes on one branch into another, so that others can review them first.                                                                                                                                                                                                                                                                                         |
| Skill           | A saved set of instructions in a `SKILL.md` file under `.claude/skills/`. Claude loads it when it is relevant, or you run it by name, like `/fix-issue`.                                                                                                                                                                                                                                                         |
| Subagent        | A helper that runs in its own context window with its own tools and returns a summary. Project subagents are Markdown files in `.claude/agents/`.                                                                                                                                                                                                                                                                |
| Worktree        | A second checkout of the same git repository, in another folder on its own branch. Two sessions can work at once without editing the same files. `claude --worktree <name>` creates one.                                                                                                                                                                                                                         |

## Questions people ask

**Do I need a paid plan?**
You need a way to sign in to Claude Code. The options depend on how your organization buys Claude, and they change from time to time, so we do not list them here. Read the authentication page (https://code.claude.com/docs/en/authentication) and ask your team admin if you are not sure. We do not state prices in this guide.

**Can I use my own repository?**
Not for the labs. The labs are written for Copperline, the app in `my-copperline`, and they use its issues, its history and its tests. Afterwards, everything you learn works in your own projects.

**I use Windows. What do I do?**
Use WSL. Step 1 sets it up, and you then work in the Ubuntu terminal for the whole workshop. Install every tool inside WSL. Tools you installed in Windows are not visible there.

**Do I need to know TypeScript or React?**
No. Copperline is written in TypeScript with a React front end, but Claude reads and writes the code. You need to be able to read it and run commands. The labs say what to look for.

**Is Claude Code only for the terminal?**
No. It also runs in IDE extensions, in a desktop app and on the web, and they share the same engine and settings. The workshop uses the terminal, so every attendee sees the same screen.

**Will Claude change files or run commands without asking?**
It depends on the permission mode. On Claude Code 2.1.283 and later, a new session starts in auto mode, where a separate classifier reviews actions and blocks risky ones. Your organization can turn auto off, and then you start in manual mode, where Claude asks before every action. The labs work in both, and Lab 2 shows you how to switch modes.

**My Claude Code is an older version. Is that a problem?**
The check wants 2.1.283 or later. Run `claude update` to get the latest version. If the new version still does not show up, open a new terminal.

**What if I cannot finish the pre-work?**
Tell the facilitator before the session what you got stuck on. Do not skip steps 1 to 3. Later steps can be finished at the start of the session with a helper, but you will lose lab time.

**What if I fall behind during a lab?**
Run `./scripts/reset-lab.sh <lab number>` from the `my-copperline` folder. It puts you at the start of that lab on a fresh branch. The lab guides explain what it does.
