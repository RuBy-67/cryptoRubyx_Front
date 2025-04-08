// Importation de Next.js
const express = require('express');
const next = require('next');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Initialisation de Next.js avec l'environnement de production
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 443;

// Préparation du serveur Next.js
app.prepare().then(() => {
  const server = express();

  // Configuration des en-têtes de sécurité
  server.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Gestion de toutes les routes avec une approche plus sûre
  server.use((req, res) => {
    return handle(req, res);
  });

  // Configuration HTTPS pour Plesk
  if (process.env.NODE_ENV === 'production') {
    const options = {
      key: fs.readFileSync('/etc/ssl/private/domain.key'),
      cert: fs.readFileSync('/etc/ssl/certs/domain.crt')
    };

    https.createServer(options, server).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on https://localhost:${port}`);
    });
  } else {
    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
  }
});
