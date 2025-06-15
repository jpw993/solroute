# SolRoute - Solana DEX Router

SolRoute is a Next.js application designed to find the optimal route for swapping tokens on the Solana blockchain. It utilizes an AI-powered flow to analyze potential paths and presents a user-friendly interface for exploring swap options and (mock) executing them.

This project was developed in Firebase Studio.

## Features

- **Optimal Route Finding**: Leverages an AI flow (`src/ai/flows/optimal-route-finder.ts`) to determine a multi-hop route for token swaps.
- **Single DEX Comparison**: Displays the best direct swap option via a single Decentralized Exchange (DEX) for comparison.
- **Wallet Simulation**: Includes mock wallet connection functionality and displays simulated token balances.
- **Token Swap Simulation**: Allows users to simulate token swaps, which then update the mock balances in the wallet display.
- **Dynamic UI**: Built with Next.js (App Router), React, ShadCN UI components, and Tailwind CSS.
- **Landing Animation**: A brief animated introduction on application load.
- **Responsive Design**: Adapts to different screen sizes.

## Getting Started

The main application page can be found at `src/app/page.tsx`. This component orchestrates the token swap form, route display, and wallet information.

### Prerequisites

Ensure you have Node.js and npm (or yarn) installed on your system.

- Node.js (v18 or later recommended)
- npm or yarn

### Installation

1.  **Clone the repository** (if you have it as a standalone project):
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Variables**:
    If there's an `.env.example` file, copy it to `.env` and fill in any necessary API keys or configuration values.
    ```bash
    cp .env.example .env # If .env.example exists
    ```
    For this project, Genkit with Google AI is used. You might need to set up `GOOGLE_API_KEY` in your `.env` file if you intend to run or extend the Genkit flows.

### Running the Development Server

To start the Next.js development server:

```bash
npm run dev
# or
yarn dev
```

This will typically start the application on `http://localhost:9002` (as configured in `package.json`). Open this URL in your browser to see the application.

To run the Genkit development server (for testing AI flows, if configured):
```bash
npm run genkit:dev
```

## Project Structure Overview

-   `src/app/`: Contains the Next.js pages, layouts (`layout.tsx`, `page.tsx`), and global styles (`globals.css`).
-   `src/components/`: Houses all React components.
    -   `animations/`: Animation components (e.g., `pathfinding-animation.tsx`).
    -   `icons/`: SVG icon components, including token icons.
    -   `layout/`: Components related to the overall page structure (e.g., `app-header.tsx`, `landing-animation.tsx`).
    -   `swap/`: Components specific to the token swapping functionality (e.g., `token-swap-card.tsx`, `route-details-card.tsx`).
    -   `ui/`: ShadCN UI components (Button, Card, Select, etc.).
    -   `wallet/`: Components for wallet connection and information display.
-   `src/ai/`: Genkit AI related code.
    -   `genkit.ts`: Genkit initialization and configuration.
    -   `flows/optimal-route-finder.ts`: The core AI flow for finding swap routes.
    -   `dev.ts`: Genkit development server entry point.
-   `src/hooks/`: Custom React hooks (e.g., `use-toast.ts`, `use-mobile.ts`).
-   `src/lib/`: Utility functions and shared data.
    -   `tokens.ts`: Definitions for mock tokens.
    -   `utils.ts`: General utility functions like `cn` for classnames.
-   `src/schemas/`: Zod schemas for form validation (e.g., `swap-schema.ts`).
-   `public/`: Static assets that are served directly.
-   `package.json`: Lists project dependencies and scripts.
-   `tailwind.config.ts`: Configuration for Tailwind CSS.
-   `next.config.ts`: Configuration for Next.js.

## Key Technologies Used

-   **Next.js**: React framework for server-side rendering, static site generation, and more.
-   **React**: JavaScript library for building user interfaces.
-   **TypeScript**: Superset of JavaScript that adds static typing.
-   **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
-   **ShadCN UI**: Collection of beautifully designed, accessible, and customizable UI components.
-   **Genkit (with Google AI)**: Toolkit for building AI-powered features.
-   **Lucide React**: Library for SVG icons.
-   **Zod**: TypeScript-first schema declaration and validation library.
-   **React Hook Form**: Library for managing form state and validation.

This project was initialized and developed in Firebase Studio.
