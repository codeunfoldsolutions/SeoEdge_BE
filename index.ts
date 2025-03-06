import app from "./src/app";
import config from "./src/config";
import logger from "./src/config/logger";

config
  .init()
  .then(() => {
    app.listen(config.PORT, () =>
      logger.info(`⚡ Server running on port ${config.PORT} ⚡`)
    );
  })
  .catch((err) => {
    if (err instanceof Error)
      logger.error(`Server failed to initialize ${err.message}`);
  });
