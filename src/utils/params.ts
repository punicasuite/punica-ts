import { Address } from 'ontology-ts-crypto';
import { isArray } from 'util';
import { AbiFunction, Param } from '../config/configTypes';

function getParamName(param: Param) {
  return param.name;
}

function getParamValue(param: Param | undefined) {
  if (param === undefined) {
    return undefined;
  }

  return param.value;
}
export function convertParams(invokeParams: Param[], abiInfo: AbiFunction) {
  return abiInfo.parameters.map((abiParameter) => {
    const invokeParameter = getParamValue(invokeParams.find((ip) => getParamName(ip) === abiParameter.name));
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
      return new Buffer(param.substr('ByteArray:'.length), 'hex');
    } else if (param.startsWith('String:')) {
      return param.substr('String:'.length);
    } else if (param.startsWith('Address:')) {
      const address = Address.fromBase58(param.substr('Address:'.length));
      return address.toArray();
    } else {
      // string parameters are more likely hex encoded
      return new Buffer(param, 'hex');
    }
  } else if (isArray(param)) {
    return param.map((child) => convertParam(child));
  } else if (typeof param === 'object') {
    // this is last, because other classes are also objects
    const entries = Object.entries<any>(param);
    const converted = entries.map(([key, value]): [string, any] => [key, convertParam(value)]);
    return new Map(converted);
  } else {
    throw new Error('Unsupported param type');
  }
}

export function convertParamsStr(invokeParams: Param[], abiInfo: AbiFunction) {
  return abiInfo.parameters.map((abiParameter) => {
    const invokeParameter = getParamValue(invokeParams.find((ip) => getParamName(ip) === abiParameter.name));
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
      return `new Buffer('${param.substr('ByteArray:'.length)}', 'hex')`;
    } else if (param.startsWith('String:')) {
      return `'${param.substr('String:'.length)}'`;
    } else if (param.startsWith('Address:')) {
      const address = Address.fromBase58(param.substr('Address:'.length));
      return `new Buffer('${address.toArray().toString('hex')}', 'hex')`;
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
