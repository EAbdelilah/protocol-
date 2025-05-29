# Hydro DEX UI Deployment Guide

This guide provides general instructions for deploying the static frontend application built with Vite.

## 1. Build the Application

Before deploying, you need to create a production build of the application. This process compiles and optimizes the React code, CSS, and other assets into a set of static files.

Navigate to the `hydro-dex-ui` directory and run the build command:

```bash
npm run build
```

This command will generate a `dist` directory (by default, this can be configured in `vite.config.js` via `build.outDir`). The `dist` folder contains all the static files (HTML, CSS, JavaScript bundles, images, etc.) that need to be deployed to your hosting provider.

## 2. Choose a Hosting Platform

Static sites, like this Vite-based React application, can be hosted on various platforms. Some popular choices include:

*   **Vercel:** Offers a seamless experience for deploying frontend applications, especially those built with frameworks like Vite and Next.js. It integrates directly with Git repositories.
*   **Netlify:** Another excellent platform for static sites and serverless functions. It also offers Git integration and a generous free tier.
*   **GitHub Pages:** A simple way to host static sites directly from your GitHub repository.
*   **AWS S3 + CloudFront:** A robust and scalable solution for hosting static assets on Amazon Web Services.
*   **Firebase Hosting:** Google's platform for hosting static and dynamic web apps.
*   **Other Cloud Providers:** Azure Static Web Apps, Google Cloud Storage, etc.

## 3. Deployment Steps (Examples)

The exact deployment steps will vary depending on the chosen platform. Below are general guidelines for Vercel and Netlify.

### Deploying to Vercel

1.  **Sign up/Log in:** Go to [vercel.com](https://vercel.com) and create an account or log in.
2.  **Import Project:**
    *   You can connect your Git repository (GitHub, GitLab, Bitbucket) directly to Vercel.
    *   When importing the project, Vercel usually auto-detects Vite projects.
3.  **Configure Project (if needed):**
    *   **Build Command:** Should be automatically set to `vite build` or `npm run build`.
    *   **Output Directory:** Should be automatically set to `dist`.
    *   **Install Command:** Should be `npm install` or `yarn install`.
    *   **Root Directory:** If your `hydro-dex-ui` app is not at the root of your repository, specify the correct path.
4.  **Environment Variables:** If your application uses environment variables (e.g., for API keys or specific contract addresses not hardcoded for production), you can set them in the Vercel project settings. For this project, ensure any necessary Hydro Protocol contract addresses or RPC URLs are correctly configured if you've externalized them from `hydroService.js`.
5.  **Deploy:** Click the "Deploy" button. Vercel will build and deploy your application. After deployment, you'll get a unique URL for your site.

### Deploying to Netlify

1.  **Sign up/Log in:** Go to [netlify.com](https://netlify.com) and create an account or log in.
2.  **Add New Site:**
    *   Choose "Import an existing project" and connect your Git repository.
3.  **Configure Project (if needed):**
    *   **Branch to deploy:** Typically `main` or `master`.
    *   **Build command:** Netlify often auto-detects this as `npm run build` for Vite projects.
    *   **Publish directory:** Should be `dist`.
4.  **Environment Variables:** Similar to Vercel, configure any necessary environment variables in Netlify's site settings (under "Build & deploy" > "Environment").
5.  **Deploy Site:** Click the "Deploy site" button. Netlify will build and deploy your application.

### Manual Upload

For some platforms (like AWS S3 or simpler web servers), you might manually upload the contents of the `dist` folder to the server's designated web root directory.

## 4. Base Path Configuration (If Not Serving from Root)

If your application is not going to be served from the root of your domain (e.g., `yourdomain.com/hydro-dex-ui/` instead of `yourdomain.com/`), you need to configure the `base` path in your `vite.config.js` file before building:

```javascript
// hydro-dex-ui/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/hydro-dex-ui/', // Replace with your desired sub-path
  // ... other configurations
});
```

After setting the `base` path, run `npm run build` again. This ensures that all asset links in your `index.html` and generated JavaScript/CSS files are prefixed correctly.

## 5. Custom Domains

Most hosting platforms allow you to configure a custom domain for your deployed application. Follow the instructions provided by your hosting platform and DNS provider to set this up.

---

This guide provides a general overview. Always refer to the specific documentation of your chosen hosting platform for the most accurate and up-to-date deployment instructions. Good luck!
