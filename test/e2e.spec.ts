import { DefaultLogger, LogLevel, dummyPaymentHandler, mergeConfig } from '@vendure/core';
import {
    createTestEnvironment,
    registerInitializer,
    SimpleGraphQLClient,
    SqljsInitializer,
    testConfig,
  } from '@vendure/testing';
import { TestServer } from '@vendure/testing/lib/test-server';
import { initialData } from './initial-data';
import { VendureRedisBasedApolloCachePlugin } from '../src/vendure-redis-based-apollo-cache.plugin';
import { ProductResolverWithCacheControl } from '../src/resolvers/product-with-cache-control.resolver';
import { GetCollectionWithId, GetProductWithId, UpdateCollectionNameMutation, UpdateProductNameMutation } from './helpers';
import { expect, describe, beforeAll, it } from 'vitest';
import { testDefaultMaxAgeInSecs, testProductQueryMaxAgeInSecs } from '../src/util';
const TEST_TIMEOUT=15*1000;
describe('Customer managed groups', function () {
    let server: TestServer;
    let adminClient: SimpleGraphQLClient;
    let shopClient: SimpleGraphQLClient;
    let serverStarted = false;
    let newProductName: string='newProductName'
    let newCollectionName: string='newCollectionName'
    let updatedProductId= 'T_1';
    let updateCollectionId='T_1'
  
    beforeAll(async () => {
      registerInitializer('sqljs', new SqljsInitializer('__data__'));
      const config = mergeConfig(testConfig, {
        logger: new DefaultLogger({ level: LogLevel.Debug }),
        plugins: [
          VendureRedisBasedApolloCachePlugin.init({
            shopApiResolversWithCacheControl: [ProductResolverWithCacheControl],
            defaultMaxAge: testDefaultMaxAgeInSecs
        }),
        ],
        paymentOptions: {
          paymentMethodHandlers: [dummyPaymentHandler],
        },
      });
  
      ({ server, shopClient, adminClient } = createTestEnvironment(config));
      await server.init({
        initialData: {
          ...initialData,
        },
        productsCsvPath: './test/product-import.csv',
        customerCount: 5,
      });
      await adminClient.asSuperAdmin()
      serverStarted = true;
      //query the product with id {{updatedProductId}} so that the server side cache gets populated
      await adminClient.query(GetProductWithId, {id: updatedProductId})
      //update the same product, whose cahce should be invalidated in {{testProductQueryMaxAgeInSecs}} secs
      await adminClient.query(UpdateProductNameMutation, {id: updatedProductId,newName: newProductName});
      //query a collection with id {{updateCollectionId}} so that the server side cache gets populated
      await adminClient.query(GetCollectionWithId, {id: updateCollectionId})
      //update the same collection, whose cache should be invalidated in {{testDefaultMaxAgeInSecs}} secs
      await adminClient.query(UpdateCollectionNameMutation, {id: updateCollectionId,newName: newCollectionName});
    });
    it('Should start successfully', async () => {
      expect(serverStarted).toBe(true);
    });

    it('Should not reflect the updates in admin-api', async ()=>{
      const {product}= await adminClient.query(GetProductWithId, {id: updatedProductId})
      expect(product.name).not.toBe(newProductName)
      const {collection}= await adminClient.query(GetCollectionWithId, {id: updateCollectionId})
      expect(collection.name).not.toBe(newCollectionName)
    })

    it('Should also not reflect the updates in shop-api since Entity Resolvers are common for both admin and shop apis', async ()=>{
      const {product}= await shopClient.query(GetProductWithId, {id: updatedProductId})
      expect(product.name).not.toBe(newProductName)
      const {collection}= await shopClient.query(GetCollectionWithId, {id: updatedProductId})
      expect(collection.name).not.toBe(newCollectionName)
    })

    it(`Should reflect product updates in admin-api once the cache has been invalidated`, async ()=>{
        await new Promise((r)=>setTimeout(r, (testProductQueryMaxAgeInSecs+1)*1000))
        const {product}= await adminClient.query(GetProductWithId, {id: updatedProductId})
        expect(product.name).toBe(newProductName)
    }, TEST_TIMEOUT)

    it(`Should reflect collection updates in admin-api once the cache has been invalidated`, async ()=>{
        await new Promise((r)=>setTimeout(r, (testDefaultMaxAgeInSecs+1)*1000))
        const {collection}= await adminClient.query(GetCollectionWithId, {id: updateCollectionId})
        expect(collection.name).toBe(newCollectionName)
    }, TEST_TIMEOUT)
}, TEST_TIMEOUT)