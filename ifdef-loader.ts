import type {LoaderContext, sources} from 'webpack';
import * as loaderUtils from 'loader-utils';
import { parse } from './preprocessor';
import * as path from 'path';

interface SourceMap {
   version: number;
   sources: string[];
   mappings: string;
   file?: string;
   sourceRoot?: string;
   sourcesContent?: string[];
   names?: string[];
}

interface IIfDefLoaderOptions {
   "ifdef-verbose"?: boolean
   "ifdef-triple-slash"?: boolean
   "ifdef-fill-with-blanks"?: boolean
   "ifdef-uncomment-prefix"?: string
}

export = function(source: string, sourceMap?: SourceMap) {
   const that: LoaderContext<IIfDefLoaderOptions> = this;

   that.cacheable && that.cacheable(true);

   const options: loaderUtils.OptionObject = loaderUtils.getOptions(that) || {};
   const originalData = options.json || options;

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

   const callback = that.async();

   if (source.includes("#if")) {
      console.log("Sourcemap for", sourceMap?.file, sourceMap?.sources)
   }

   try {
      source = parse(source, data, verbose, tripleSlash, filePath, fillWithBlanks, uncommentPrefix);
      callback(null, source);
   } catch(err) {
      callback(err);
   }
};
