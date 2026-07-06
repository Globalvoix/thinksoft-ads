# Thinksoft Ads — Claude Code Plugin

Replaces Claude Code's whimsical thinking spinners with your Thinksoft ad content. Each session fetches a serving ad and patches the spinner text so you see ad headlines instead of "Flibbertigibbeting...".

## How it works

1. On `SessionStart`, the plugin fetches a random serving ad from your Thinksoft API
2. Patches the Claude Code native binary to replace the 184 spinner words with the ad headline
3. On `Stop` (after each response), displays a completion ad with the ad headline, URL, and description
4. Tracks impressions via the Thinksoft API

## Install

```bash
claude plugin install ./claude-plugin
```

Or from the `/plugin` interface, choose "Install from disk" and point to this directory.

## Configuration

The plugin prompts for two settings on first enable:

| Setting    | Description                                      | Default               |
| ---------- | ------------------------------------------------ | --------------------- |
| `api_base` | Thinksoft Ads API server URL                     | `http://localhost:4000` |
| `campaign_id` | (Optional) Only show ads from a specific campaign | empty (all campaigns)  |

## Development

1. Start your Thinksoft API server: `npx tsx server/index.ts`
2. Create a campaign with at least one ad
3. Install the plugin: `claude plugin install ./claude-plugin`
4. Restart Claude Code for the spinner patch to take effect

## Files

```
.claude-plugin/plugin.json   — Plugin manifest
hooks/hooks.json              — SessionStart + Stop hooks
scripts/patch-spinner.cjs     — Binary patcher (spinner words → ad headline)
scripts/show-completion-ad.cjs — Stop-hook ad display
```
