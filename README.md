<img src="./assets/images/icon.png" alt="icon" />

# StellarSPA

StellarSPA is a pure JavaScript-based Single Page Application (SPA) mini framework (without external dependencies) designed to be lightweight, fast, and easy to understand.

### Key Features:

- Instance Global State Manager
- SPA-based, hash routing, dynamic layout
- Reactive global state & computed props
- Smart HTTP (timeout, retry, cache, sanitize)
- Dark mode toggle & auto-detect
- Skeleton loading UI
- API interceptors & middleware
- Integrated debug logs
- Modular & extensible
- and more

### Development

```
npm install
npm start
```


### Production

> Nginx / Apache

```
npm install
npm run build
```

### Flder Structure

```
StellarSPA/
│
├── app/
│   ├── Https.js 
│   ├── Main.js 
│   ├── Routers.js 
│   └── States.js 
│
├── assets/
│   ├── css/
│   └── images/
│
├── config/
│   └── app.config.js
│
├── routes/
│   └── web.js
│
├── services/
│   └── api.js
│
├── utils/
│   ├── debug.js
│   ├── navlink.js
│   ├── sanitize.js
│   ├── skeleton.js
│   └── theme.js
│
├── views/
│   ├── components/
│   │   ├── button.js
│   │   ├── darkModeButton.js
│   │   ├── footer.js
│   │   └── header.js
│   ├── layouts/
│   │   └── MainLayout.js
│   ├── pages/
│   │   ├── blog.js
│   │   ├── error.js
│   │   └── landing.js
│   └── partials/
│       └── head.js
│
└── index.html

```
