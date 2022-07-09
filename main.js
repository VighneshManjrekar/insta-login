const { init, login } = require("./instagram");

// Asynchronous IIFE
(async () => {
  // Init browser
  await init();

  // Login
  await login();
})();
