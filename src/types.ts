/**
 * The plugin can be configured using the following options:
 */
import {Type} from '@vendure/core';
export interface VendureApolloCacheControlPluginInitOptions {
    /**
     * @description
     * The Default (maxAge)[https://www.apollographql.com/docs/apollo-server/performance/caching/#default-maxage] in secs
     * 
     * @default 3600
     * 
     */
    defaultMaxAge?: number;
    /**
     * @description
     * The Redis Connection String with the format `redis://USERNAME:PASSWORD@HOSTNAME:PORT_NUMBER`
     * 
     * @default redis://default@localhost:6379
     * 
     */
    redisConnectionString?:string;
    /**
     * @description
     * 
     * `shop-api` graphql resolver overrides that set the cache control settings per field/query. According to (this discussion)[https://discord.com/channels/1100672177260478564/1155851246352207932/1155953607221444618],
     * it is better to provide the overriding logic by extending the default resolver. 
     * 
     * @example
     * 
     * ```ts
     * import {..., Info} from '@nestjs/graphql'
     * ...
     * import { ShopProductsResolver } from '@vendure/core/dist/api/resolvers/shop/shop-products.resolver'
     * @Resolver('Product')
     * export class ProductResolverWithCacheControl extends ShopProductsResolver {
     *  @Query()
     *  async product(@Ctx() ctx: RequestContext,@Args() args: QueryProductArgs,@Relations({ entity: Product, omit: ['variants', 'assets'] }) relations: RelationPaths<Product>,@Info() info?: any,
     *  ): Promise<Translated<Product> | undefined> {
     *      info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PUBLIC' })
     *      return super.product(ctx, args, relations)
     *  }
     * }
     * ```
     */
    shopApiResolversWithCacheControl?: Array<Type<any>>
    /**
     * @description
     * `admin-api` graphql resolver overrides that set the cache control settings per field/query
     * 
     * @example
     * You may reference the example for `shopApiResolversWithCacheControl`
     */
    adminApiResolversWithCacheControl?: Array<Type<any>>
}