# Contributing to GitLight

👋 Hey, thanks for wanting to improve GitLight! Any contribution is welcome and appreciated!

---

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

If you are using GitLight and are missing a feature that you would find helful, please create an issue. Other may also find it missing.

### Reporting bugs

If you hit a bug, you should first check if it's not already reported in the issues, and if not, please create an issue or contact me on Twitter.

### Running locally

#### Desktop app

> **Note**: Skip this if you don't want to work on the native app

Just follow the [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites).

#### GitHub OAuth app

The app needs to authenticate the user to GitHub, so we need to create a new OAuth GitHub application [here](https://github.com/settings/applications/new). Fill the fields and set the **Authorization callback url** to `http://localhost:5173/auth/github/callback`.

Also create a unique 32 characters code here: https://generate-secret.vercel.app/32

Then, create a `.env` file at the root of the project:

```.env
AUTH_GITHUB_ID={your client ID}
AUTH_GITHUB_SECRET={your client secret}
AUTH_SECRET={your 32 characters code}
PUBLIC_SITE_URL=http://localhost:5173
```

#### GitLab application

The app needs to authenticate the user to GitLab, so we need to create a new GitLab application [here](https://gitlab.com/-/profile/applications) and click on **Add new application**. Fill the fields and set the **Callback url** to `http://localhost:5173/auth/gitlab/callback`. Choose the following scopes:

- `read_api`
- `read_user`

Also create a unique 32 characters code here: https://generate-secret.vercel.app/32

Then, create a `.env` file at the root of the project:

```.env
AUTH_GITLAB_ID={your client ID}
AUTH_GITLAB_SECRET={your client secret}
AUTH_SECRET={your 32 characters code}
PUBLIC_SITE_URL=http://localhost:5173
```

#### Frontend

Just install dependencies:

```bash
pnpm install
```

Finally, run `pnpm dev` or `pnpm dev:tauri` to start the dev server!

## Styleguides

- PR names should follow the [conventionnal commits](https://www.conventionalcommits.org/en/v1.0.0/) guidelines.
- Code should be valid for Eslint and Prettier.
- In css, `rem` should be used instead of `px` (apart from borders).
