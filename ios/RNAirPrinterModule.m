//
//  RNAirPrinterModule.m
//  zuma_internal
//
//  Created by oscy on 10/24/23.
//
#import "RNAirPrinterModule.h"
#import <React/RCTBridgeModule.h>

@implementation RNAirPrinterModule

RCT_EXPORT_MODULE(RNAirPrinterModule);  // Name of the Native Module

RCT_EXPORT_METHOD(initializePrinter)
{
  // Define the printer URL. Normally, this would be discovered dynamically, but since you said
  // the printer is always going to be there, you might hard-code it like this.
  NSString *printerURLString = @"ipp://example123ddfdf4.local:631/ipp/print";
  NSURL *printerURL = [NSURL URLWithString:printerURLString];
  
  UIPrinter *printer = [UIPrinter printerWithURL:printerURL];
  
  [printer contactPrinter:^(BOOL available) {
    if (available) {
      NSLog(@"Printer is available.");
      // Do any additional setup or caching here if necessary
    } else {
      NSLog(@"Printer is not available.");
    }
  }];
}

RCT_EXPORT_METHOD(printImage:(NSString *)imageBase64)
{
  NSData *imageData = [[NSData alloc] initWithBase64EncodedString:imageBase64 options:NSDataBase64DecodingIgnoreUnknownCharacters];
  
  UIPrintInteractionController *pic = [UIPrintInteractionController sharedPrintController];
  
  if (pic && [UIPrintInteractionController canPrintData:imageData]) {
    UIPrintInfo *printInfo = [UIPrintInfo printInfo];
    printInfo.outputType = UIPrintInfoOutputGeneral;
    printInfo.jobName = @"Image Printing";
    pic.printInfo = printInfo;
    pic.printingItem = imageData;
    
    [pic presentAnimated:YES completionHandler:^(UIPrintInteractionController *printInteractionController, BOOL completed, NSError *error) {
      if (!completed && error) {
        NSLog(@"Printing could not complete because of error: %@", error);
      }
    }];
  }
}

@end
