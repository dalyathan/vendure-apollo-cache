/* eslint-disable */
import { DefaultLogger, LogLevel, mergeConfig, DefaultSearchPlugin, JobQueueService } from '@vendure/core';
import {
  createTestEnvironment,
  registerInitializer,
  SqljsInitializer,
  testConfig,
} from '@vendure/testing';
import { TestServer } from '@vendure/testing/lib/test-server';
import { compileUiExtensions } from '@vendure/ui-devkit/compiler';
import { initialData } from './initial-data';
import * as path from 'path';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import {VendureRedisBasedApolloCachePlugin} from '../src/vendure-redis-based-apollo-cache.plugin';
import {ProductResolverWithCacheControl} from '../src/resolvers/product-with-cache-control.resolver';
(async () => {
  let server: TestServer;

  registerInitializer('sqljs', new SqljsInitializer('__data__')); 
  const config = mergeConfig(testConfig, {
    logger: new DefaultLogger({ level: LogLevel.Debug }),
    plugins:[
        VendureRedisBasedApolloCachePlugin.init({
            shopApiResolversWithCacheControl: [ProductResolverWithCacheControl]
        }),
        DefaultSearchPlugin,
        AdminUiPlugin.init({
            port: 3002,
            route: 'admin',
            app:  compileUiExtensions({
                  outputPath: path.join(__dirname, 'admin-ui'),
                  extensions: [],
                  devMode: true,
                })
          }),
    ],
    apiOptions: {
      adminApiPlayground: true,
      shopApiPlayground: true,
    },
  });
  ({ server } = createTestEnvironment(config));
  await server.init({
    initialData,
    productsCsvPath: 'test/product-import.csv',
    customerCount: 1,
  });
  const jobQueueService= server.app.get(JobQueueService);
  await jobQueueService.start()
})().catch((err) => {
  console.error(err);
});