import { isArray } from 'util';
import { AbiFunction, Params } from '../config/configTypes';

export function convertParams(invokeParams: Params, abiInfo: AbiFunction) {
  return abiInfo.parameters.map((abiParameter) => {
    const invokeParameter = invokeParams[abiParameter.name];
    if (invokeParameter === undefined) {
      throw new Error('Missing parameter value.');
    }

    return convertParam(invokeParameter);
  });
}

export function convertParam(param: any): any {
  if (typeof param === 'boolean') {
    return param;
  } else if (typeof param === 'number') {
    return param;
  } else if (typeof param === 'string') {
    if (param.startsWith('ByteArray:')) {
      return new Buffer(param.substr('ByteArray:'.length));
    } else if (param.startsWith('String:')) {
      return param.substr('String:'.length);
    } else {
      // string parameters are more likely hex encoded
      return new Buffer(param, 'hex');
    }
  } else if (isArray(param)) {
    return param.map((child) => convertParam(child));
  } else {
    throw new Error('Unsupported param type');
  }
}

export function convertParamsStr(invokeParams: Params, abiInfo: AbiFunction) {
  return abiInfo.parameters.map((abiParameter) => {
    const invokeParameter = invokeParams[abiParameter.name];
    if (invokeParameter === undefined) {
      throw new Error('Missing parameter value.');
    }

    return convertParamStr(invokeParameter);
  });
}

export function convertParamStr(param: any): any {
  if (typeof param === 'boolean') {
    return `${param}`;
  } else if (typeof param === 'number') {
    return `${param}`;
  } else if (typeof param === 'string') {
    if (param.startsWith('ByteArray:')) {
      return `new Buffer('${param.substr('ByteArray:'.length)}')`;
    } else if (param.startsWith('String:')) {
      return `'${param.substr('String:'.length)}'`;
    } else {
      // string parameters are more likely hex encoded
      return `new Buffer('${param}', 'hex')`;
    }
  } else if (isArray(param)) {
    return `[${param.map((child) => convertParamStr(child)).join(', ')}]`;
  } else {
    throw new Error('Unsupported param type');
  }
}
