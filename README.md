# Agent Optimization Workshop

A fun way to practice optimizing an agent's token usage and reliability.

Your task is to send **exactly** this prompt to the provided agent:

> add milk, two dozen eggs, oats, bread, 3 olive oil, and 500g beans to the cart

And have the agent successfully add these items to your shopping cart.

This agent is already set up with enough tooling to go to `http://127.0.0.1:4173/favorites` and do the work, but it does so at the cost of ~500K tokens.

You need to optimize the agent as best as you can:

- Cutting token usage to **~250K** should be straightforward
- Getting to **~100-150K** requires a bit more work
- Dropping below **100K** requires some creativity
- The current record stands at **~44K tokens**

## Rules

You may change pretty much anything in the `agent/` directory _as long as you're not removing existing functionality from the agent._

You **may not** change anything in the `shopping-site/` directory. That would be cheating.

## Quick setup

- Run `npm --prefix agent run init-setup` and choose ChatGPT or Azure.
- Then run `npm --prefix agent run dev`.

The run command opens <http://127.0.0.1:4173> and starts Eve in the terminal.

For ChatGPT, run `/login` and choose **ChatGPT Subscription** on first use.

For Azure, follow the prompts and guide below.

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
