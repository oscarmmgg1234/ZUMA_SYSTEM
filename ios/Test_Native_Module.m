//
//  Test_Native_Module.m
//  zuma_internal
//
//  Created by oscy on 10/14/23.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridge.h>

@interface RCT_EXTERN_MODULE(MyNativeModule, NSObject)

RCT_EXTERN_METHOD(sayHello:(NSString *)name resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *response = [NSString stringWithFormat:@"Hello, %@", name];
  resolve(response);
}

@end
