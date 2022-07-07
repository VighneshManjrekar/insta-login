const { init, login } = require("./instagram");

(async () => {
  // Init browser
  await init();

  // Login
  await login();
})();
