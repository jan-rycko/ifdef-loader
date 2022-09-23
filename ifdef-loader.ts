// @ts-ignore
// @ts-ignore

import type {loader} from 'webpack';
import type {RawSourceMap} from 'source-map';
import * as loaderUtils from 'loader-utils';
import { parse } from './preprocessor';
import * as path from 'path';

interface IIfDefLoaderOptions {
   "ifdef-verbose"?: boolean
   "ifdef-triple-slash"?: boolean
   "ifdef-fill-with-blanks"?: boolean
   "ifdef-uncomment-prefix"?: string
}

// @ts-ignore
export = function(source: string, sourceMap?: RawSourceMap) {
   const that: loader.LoaderContext = this;

   that.cacheable && that.cacheable(true);

   if (!source.includes("#if")) {
      return source;
   }

   const options: loaderUtils.OptionObject = loaderUtils.getOptions(that) || {};
   const originalData: IIfDefLoaderOptions = options.json || options;

   const data = { ...originalData };

   const verboseFlag = "ifdef-verbose";
   const verbose = data[verboseFlag];
   if(verbose !== undefined) {
      delete data[verboseFlag];
   }

   let filePath: string | undefined = undefined;
   if(verbose) {
      filePath = path.relative(that.rootContext || '', that.resourcePath);
   }

   const tripleSlashFlag = "ifdef-triple-slash";
   const tripleSlash = data[tripleSlashFlag];
   if(tripleSlash !== undefined) {
      delete data[tripleSlashFlag];
   }

   const fillWithBlanksFlag = "ifdef-fill-with-blanks";
   const fillWithBlanks = data[fillWithBlanksFlag];
   if(fillWithBlanks !== undefined) {
      delete data[fillWithBlanksFlag];
   }

   const uncommentPrefixFlag = "ifdef-uncomment-prefix";
   const uncommentPrefix = data[uncommentPrefixFlag];

   if(uncommentPrefix !== undefined) {
      delete data[uncommentPrefixFlag];
   }

   try {
      const initial = source.split(/\r\n|\n|\r/).length;
      source = parse(source, data, verbose, tripleSlash, filePath, fillWithBlanks, uncommentPrefix);
      const final = source.split(/\r\n|\n|\r/).length;

      console.log("ifdef-loader source lines", {context: that.rootContext, path: that.resourcePath, initial, final}, "sourceMap:", sourceMap);

      return source;
   } catch(err) {
      const callback = that.async();

      callback?.(err, source, sourceMap);
   }
};
