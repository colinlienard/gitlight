# Contributing to GitLight

👋 Hey, thanks for wanting to improve GitLight!

- [Before contributing](#before-contributing)
  - [Roadmap](#roadmap)
  - [Tech stack](#tech-stack)
- [How to contribute](#how-to-contribute)
  - [Feature request](#feature-request)
  - [Running locally](#running-locally)
    - [Desktop app](#desktop-app)
    - [GiHub OAuth app](#github-oauth-app)
    - [Frontend](#frontend)
    - [Running the project](#running-the-project)
- [Styleguides](#styleguides)

## Before contributing

The goal of GitLight is to make developers work faster and stay up to date with their git workflow by providing accurate data, filters and more. It is focused on receiving and managing notifications. I'm trying to make the UI more intuitive and easier to use in order to provide the best possible experience.

### Roadmap

[See the roadmap on GitHub](https://github.com/users/colinlienard/projects/1)

### Tech Stack

- UI → [Svelte](https://svelte.dev/)
- Framework → [SvelteKit](https://kit.svelte.dev/)
- Langage → [Typescript](https://www.typescriptlang.org/)
- Desktop app → [Tauri](https://tauri.app/)
- Deployment → [Vercel](https://vercel.com)
- Package manager → [pnpm](https://pnpm.io/)

## How to contribute

### Feature request

If you are using GitLight and are missing a feature that you would find helful, please create an issue. Other maybe also find it missing.

### Reporting bugs

If you hit a bug, you should first check if it's not already reported in the issues, and if not, please create an issue or contact me on Twitter.

### Running locally

#### Desktop app

> **Note**: Skip this if you don't want to work on the native app

Just follow the [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites).

#### GitHub OAuth app

The app needs to authenticate the user to GitHub, so we need to create a new OAuth GitHub application [here](https://github.com/settings/applications/new). Fill the fields and set the **Authorization callback url** to `http://localhost:5173/auth/callback`.

Also create a unique 32 characters code here: https://generate-secret.vercel.app/32

Then, create a `.env` file at the root of the project:

```.env
AUTH_GITHUB_ID={your client ID}
AUTH_GITHUB_SECRET={your client secret}
AUTH_SECRET={your 32 characters code}
```

#### Frontend

Just install dependencies:

```bash
pnpm install
```

#### Running the project

|                      | With Tauri         | In the browser |
| -------------------- | ------------------ | -------------- |
| Start the dev server | `pnpm tauri dev`   | `pnpm dev`     |
| Build the app        | `pnpm build:tauri` | `pnpm build`   |

## Styleguides

PR names should follow the [conventionnal commits](https://www.conventionalcommits.org/en/v1.0.0/) guidelines.
