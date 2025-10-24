# GitHub Pages Deployment Guide

This file provides instructions for deploying the Türsteher Rechner PWA to GitHub Pages.

## Automatic Deployment

The app is configured to work with GitHub Pages out of the box. No build step is required.

### Steps to Enable GitHub Pages:

1. Go to your repository on GitHub: `https://github.com/JsSenior/patricks-rechner`

2. Click on **Settings** (in the repository menu)

3. In the left sidebar, click on **Pages**

4. Under "Build and deployment":
   - Source: Select **Deploy from a branch**
   - Branch: Select **main** (or **master**) and **/ (root)**
   - Click **Save**

5. GitHub will automatically deploy your site. After a few minutes, your app will be available at:
   ```
   https://jssenior.github.io/patricks-rechner/
   ```

## Verification

Once deployed, you can verify the PWA works correctly:

1. Open the URL in a modern browser (Chrome, Edge, Safari)
2. Check that the Service Worker registers (open DevTools → Application → Service Workers)
3. Test the "Install App" feature (look for the install icon in the address bar)
4. Verify offline functionality by:
   - Loading the app
   - Turning off network in DevTools
   - Refreshing the page - it should still work

## Updating the App

Any changes pushed to the main/master branch will automatically trigger a redeployment.

## Custom Domain (Optional)

If you want to use a custom domain:

1. In the **Pages** settings, enter your custom domain
2. Add the required DNS records as instructed by GitHub
3. Wait for DNS propagation (can take up to 24 hours)

## Troubleshooting

### App not loading
- Ensure GitHub Pages is enabled in repository settings
- Check that the branch is correct (main or master)
- Wait a few minutes after enabling - initial deployment can take time

### Service Worker not registering
- Check browser console for errors
- Ensure you're accessing via HTTPS (required for Service Workers)
- GitHub Pages automatically provides HTTPS

### PWA not installable
- Verify manifest.json is accessible
- Check that icons (icon-192.png, icon-512.png) are loading
- Ensure Service Worker is active
- Some browsers require the site to be visited multiple times before showing the install prompt

## Local Development

To test locally before deploying:

```bash
# Start a local server
python3 -m http.server 8080

# Or with Node.js
npx http-server -p 8080
```

Then open http://localhost:8080 in your browser.

## Files Structure

```
patricks-rechner/
├── index.html          # Main HTML file
├── app.js             # Application logic
├── db.js              # IndexedDB management
├── style.css          # Styling
├── sw.js              # Service Worker
├── manifest.json      # PWA manifest
├── icon-192.png       # App icon (192x192)
├── icon-512.png       # App icon (512x512)
├── README.md          # Documentation
└── .gitignore         # Git ignore rules
```

All files are required for the app to function properly. Do not delete any of them.
