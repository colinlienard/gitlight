# Contributing to GitLight

👋 Hey, thanks for wanting to improve GitLight!

- [Things to know](#things-to-know)
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

## Things to know

The goal of GitLight is to make developers work faster and stay up to date with their git workflow by providing accurate data, filters and more.

It is focused on receiving and managing notifications. I'm trying to make the UI the more intuitive and easy to use to provide the best experience.

GitLight is firstly a side project but I want to make it as better as it can be.

### Roadmap

[See the roadmap on GitHub](https://github.com/users/colinlienard/projects/1)

### Tech Stack

- **UI** → [Svelte](https://svelte.dev/)
- **Framework** → [SvelteKit](https://kit.svelte.dev/)
- **Langage** → [Typescript](https://www.typescriptlang.org/)
- **Desktop app** → [Tauri](https://tauri.app/)
- **Deployment** → [Vercel](https://vercel.com)
- **Package manager** → [pnpm](https://pnpm.io/)

### Feature request

### Reporting bugs

## How to contribute

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

pr name, checks, conventionnal commits, eslint & prettier
