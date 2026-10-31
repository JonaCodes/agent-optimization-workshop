# Agent Optimization Workshop

A fun way to practice optimizing an agent's token usage and reliability.

## Quick Start

- Run `npm --prefix agent run init-setup`
- Then run `npm --prefix agent run dev`

This should open <http://127.0.0.1:4173> in your browser and start the agent chat in the terminal.
On first use, run `/login` in Eve and choose **ChatGPT Subscription**.

## Troubleshooting the Quick Start:

Requires Node.js 24 or newer (with npm), a ChatGPT subscription, and internet access.
Use macOS or Windows (x64/arm64), or Ubuntu/Debian Linux (x64).
Linux ARM64 is unsupported. No API key or `.env` file is required.

On Linux, install the login prerequisites first:

```sh
sudo apt-get update
sudo apt-get install -y libsecret-tools gnome-keyring dbus-user-session
```

Use a desktop session with an unlocked Secret Service keyring.

Run these commands from the repository root.

Install once (uses the committed dependency lockfile and pinned Chrome build; Linux may prompt for sudo):

```sh
npm --prefix agent run init-setup
```

Check dependencies, login prerequisites, and browser launch:

```sh
npm --prefix agent run doctor
```

Start the store and Eve:

```sh
npm --prefix agent run dev
```

Opens <http://127.0.0.1:4173> in your browser and starts Eve chat in the terminal.
On first use, run `/login` in Eve and choose **ChatGPT Subscription**.
Use `/exit` to stop Eve and the store started by this command.
Startup reports missing or mismatched dependencies and browser failures.
Keep port 4173 available, or reuse the store already running there.
