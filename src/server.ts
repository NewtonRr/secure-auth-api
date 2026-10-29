import { app } from './app.js';
import { env } from './config/env.js';
import { startCleanupJob } from './jobs/cleanup.js';

app.listen(env.PORT, () => {
  console.log(`API listening at internal port:${env.PORT} (expecting Nginx in front)`);
  console.log(`trust proxy hops: ${env.TRUST_PROXY}`);
  if (env.NODE_ENV === 'production' && env.TRUST_PROXY === 0) {
    console.warn('WARNING: TRUST_PROXY is 0 in production. All clients will share the same IP');
  }
  console.log(`Running Jobs...`);
  startCleanupJob();
});
