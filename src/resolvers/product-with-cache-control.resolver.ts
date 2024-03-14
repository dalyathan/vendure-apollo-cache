import { Args, Info, Query, Resolver } from '@nestjs/graphql'
import { QueryProductArgs } from '@vendure/common/lib/generated-types'
import type { Translated } from '@vendure/core'
import { Ctx, Product, RelationPaths, Relations, RequestContext } from '@vendure/core'
import { ShopProductsResolver } from '@vendure/core/dist/api/resolvers/shop/shop-products.resolver'
import { testProductQueryMaxAgeInSecs } from '../util'
@Resolver('Product')
export class ProductResolverWithCacheControl extends ShopProductsResolver {
  @Query()
  async product(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryProductArgs,
        @Relations({ entity: Product, omit: ['variants', 'assets'] }) relations: RelationPaths<Product>,
        @Info() info?: any,
  ): Promise<Translated<Product> | undefined> {
    info.cacheControl.setCacheHint({ maxAge: testProductQueryMaxAgeInSecs, scope: 'PUBLIC' })
    return super.product(ctx, args, relations)
  }
}