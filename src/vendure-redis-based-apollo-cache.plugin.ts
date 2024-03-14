import { PluginCommonModule, Type, VendurePlugin, RuntimeVendureConfig} from '@vendure/core';
import {PLUGIN_METADATA} from '@vendure/core/dist/plugin/plugin-metadata'
import Keyv from 'keyv'
import responseCache from '@apollo/server-plugin-response-cache'
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import { KeyvAdapter } from '@apollo/utils.keyvadapter'
import { VendureApolloCacheControlPluginInitOptions } from './types';

export const  defaultPluginOptionsValues: Partial<VendureApolloCacheControlPluginInitOptions>={
    defaultMaxAge: 3600,
    redisConnectionString: 'redis://default@localhost:6379'
}

@VendurePlugin({
    imports: [PluginCommonModule],
    entities: [],
    compatibility: '^2.1.5',
})
export class VendureRedisBasedApolloCachePlugin {
    static options: VendureApolloCacheControlPluginInitOptions;

    static init(options?: VendureApolloCacheControlPluginInitOptions): Type<VendureRedisBasedApolloCachePlugin> {
        if(options){
            this.options = options;
        }else{
            this.options={}
        }
        if(!this.options.redisConnectionString){
            this.options.redisConnectionString=defaultPluginOptionsValues.redisConnectionString;
        }
        if(!this.options.defaultMaxAge){
            this.options.defaultMaxAge=defaultPluginOptionsValues.defaultMaxAge;
        }
        Reflect.defineMetadata(PLUGIN_METADATA.ADMIN_API_EXTENSIONS, {
            resolvers: options?.adminApiResolversWithCacheControl
        }, VendureRedisBasedApolloCachePlugin);
        Reflect.defineMetadata(PLUGIN_METADATA.SHOP_API_EXTENSIONS,  {
            resolvers: options?.shopApiResolversWithCacheControl
        }, VendureRedisBasedApolloCachePlugin);
        Reflect.defineMetadata(PLUGIN_METADATA.CONFIGURATION, (config:RuntimeVendureConfig)=>{
            config.apiOptions.apolloServerPlugins.push(...[ 
                responseCache({
                    cache: new KeyvAdapter(new Keyv(this.options.redisConnectionString)),
                }),
                ApolloServerPluginCacheControl({ defaultMaxAge: this.options.defaultMaxAge})
            ])
            return config;
        }, VendureRedisBasedApolloCachePlugin);
        return VendureRedisBasedApolloCachePlugin;
    }
}