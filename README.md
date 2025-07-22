# Newsletter Analyzer

This project contains a React frontend and a FastAPI backend. To deploy the frontend on **GitHub Pages** you can run:

```bash
cd frontend
npm install
npm run deploy
```

The `deploy` script builds the project and publishes the static files to the `gh-pages` branch so they can be served via GitHub Pages. The built files are also available in the `docs/` directory for simple "Pages" deployments from the repository root.
After running `npm run deploy`, visit your repository settings on GitHub. Under **Pages** choose "Deploy from a branch – gh-pages" to publish your site. It will be available at `https://<username>.github.io/<repo>/`.

