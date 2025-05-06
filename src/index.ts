import app from './app';
import config from './config';
import logger from './config/logger';

config
  .init()
  .then(() => {
    app.listen(config.PORT, () =>
      logger.info(`⚡ Server running on port ${config.PORT} ⚡`)
    );
  })
  .catch((err: any) => {
    if (err instanceof Error)
      logger.error(`Server failed to initialize ${err.message}`);
  });
