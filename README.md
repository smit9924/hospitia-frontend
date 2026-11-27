# hospitia-frontend

The web client apps of [Hospitia](https://github.com/smit9924/hospitia-master), a guest house management system for NGOs, built with Angular and Angular Material.

This repository is used inside the `hospitia-master` workspace, cloned into `hospitia-master/frontend`. **All documentation lives in hospitia-master:** start with the [Frontend overview](https://github.com/smit9924/hospitia-master/blob/main/docs/frontend/index.md) and [Getting started](https://github.com/smit9924/hospitia-master/blob/main/docs/getting-started/index.md).

| App | Purpose | Local port / URL | Docs |
|---|---|---|---|
| `clients/main` | The main Hospitia web app | 8001 / http://main-client.localhost | [Frontend overview](https://github.com/smit9924/hospitia-master/blob/main/docs/frontend/index.md) |

New apps go under `clients/`; see [Adding a client app](https://github.com/smit9924/hospitia-master/blob/main/docs/frontend/adding-a-client-app.md).

```bash
cd clients/main
npm ci
npm start      # http://main-client.localhost
npm run lint
npm test
```

Contributing: [CONTRIBUTING.md](CONTRIBUTING.md) · Security: [SECURITY.md](SECURITY.md)
