# Newsletter Analyzer

This project contains a React frontend and a FastAPI backend. To deploy the frontend on **GitHub Pages** you can run:

```bash
cd frontend
npm install
npm run deploy
```

The `deploy` script builds the project, copies the result to `docs/`, and publishes the static files to the `gh-pages` branch. You can then configure **GitHub Pages** to serve either from this branch or directly from the `docs/` folder.

In your repository settings choose **GitHub Pages** source:
- **Branch**: `gh-pages` (recommended)
- or **Folder**: `docs/` on `main` if you prefer serving from the repository itself.
