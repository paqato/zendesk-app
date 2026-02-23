# PAQATO Zendesk Integration

Zendesk sidebar app that integrates PAQATO services directly into your support workflow.

## Features

- **AI Agent** - AI-powered response suggestions for support tickets
- **Shipment History** - View PAQATO tracking information for customer orders

## Requirements

- Zendesk Support account with admin access
- PAQATO account with API key

## Installation

### 1. Get your PAQATO API key

Log in to your PAQATO account and navigate to **Settings** → **API Keys** to generate a new key.

### 2. Install the app in Zendesk

1. Download the latest release ZIP file
2. Go to **Zendesk Admin Center** → **Apps and integrations** → **Apps** → **Zendesk Support apps**
3. Click **Upload private app** and select the ZIP file
4. Enter your PAQATO API key during installation
5. Enable the features you want to use

### 3. Connect your Zendesk account (for AI Agent)

If you're using the AI Agent feature:

1. Open any ticket in Zendesk Support
2. Find the PAQATO app in the right sidebar
3. Click **Connect** to authorize the integration
4. Grant the requested permissions

## Usage

The app appears as a sidebar panel when viewing tickets in Zendesk Support.

**AI Agent**: Shows AI-generated response suggestions based on the ticket conversation. Click a suggestion to copy it to the reply editor.

**Shipment History**: Displays shipment tracking information linked to the customer's email address.

## Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Build and package as ZIP for Zendesk upload
yarn package

# Type checking
yarn type-check
```

### Creating a release

1. Increment the version numbers in *package.json* and *src/manifest.json*
2. Commit, tag and push your changes. This will trigger a GitHub workflow that builds the app and creates a new release.
3. Upload the generated `paqato-zendesk-app.zip` to Zendesk.

## Tech Stack

- Vue 3 + TypeScript
- Vite
- Zendesk Apps Framework (ZAF)

## Support

For questions or issues, contact support@paqato.com
