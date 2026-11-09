# LinkedIn Client Studio — by Gloria Norvor

A public-facing website and stateless Model Context Protocol (MCP) service for LinkedIn ghostwriters, personal branding consultants, and agencies.

## Included
- Four real MCP tools: client brief, content calendar, post review, and metrics review
- Website and support, privacy policy, and terms pages
- Dockerfile and Render deployment blueprint
- No LinkedIn account access, automated publishing, or stored client records

## Deploy
1. In [Render](https://dashboard.render.com/), select **New → Blueprint** and connect this repository.
2. Review the service settings and choose **Apply**.
3. After deployment, visit `/health`, `/support`, `/privacy`, and `/terms`.
4. Test the live `/mcp` endpoint with an MCP inspector and review host logging and security settings.
5. Finalize legal policies and verify the support email before publicly launching.
6. Insert the live HTTPS origin in your plugin submission manifests.

## Development
```bash
npm install
npm test
npm start
```

This is a starter release. It must be deployed and reviewed before public submission. The site's legal texts are drafts, not legal advice.

Built by Gloria Norvor. [LinkedIn Visibility Academy](https://academy.glorianorvor.com/).
