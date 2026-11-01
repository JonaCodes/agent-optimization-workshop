# Agent Optimization Workshop

A fun way to practice optimizing an agent's token usage and reliability.

## Quick setup

- Run `npm --prefix agent run init-setup` and choose ChatGPT or Azure.
- Then run `npm --prefix agent run dev`.

Opens <http://127.0.0.1:4173> and starts Eve in the terminal.
For ChatGPT, run `/login` and choose **ChatGPT Subscription** on first use.

## Requirements

Node.js 24+ with npm, internet, and a ChatGPT subscription or Azure OpenAI deployment.
macOS/Windows x64/arm64, or Ubuntu/Debian x64. Run commands from the repo root.

## Azure

Setup collects deployment details and a hidden API key, then saves them locally.
Rerun setup to update settings or switch providers. Use a tool-calling deployment.
Optional nonsecret defaults: [`agent/workshop-defaults.json`](agent/workshop-defaults.json).

## Troubleshooting

Check settings, dependencies, and browser launch:

```sh
npm --prefix agent run doctor
```

Optional Azure connection check (one model request):

```sh
npm --prefix agent run doctor -- --check-model
```

Keep port 4173 available. `/exit` stops Eve and the store it started.

## Linux ChatGPT login

```sh
sudo apt-get update
sudo apt-get install -y libsecret-tools gnome-keyring dbus-user-session
```

Use an unlocked desktop keyring. Setup may prompt for sudo.
