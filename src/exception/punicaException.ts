export class PunicaException extends Error {
  code: number;

  constructor(code: number, msg: string) {
    super(msg);

    this.code = code;
  }
}

export const invalidBoxName = () => new PunicaException(10000, 'box error, invalid box name');
export const configFileNotFound = () => new PunicaException(10001, 'punica config file not found');
export const walletFileNotFound = () => new PunicaException(10003, 'wallet file not found');
export const walletFileError = () => new PunicaException(10004, 'error exist in wallet file');
// tslint:disable-next-line:quotemark
export const directoryError = () => new PunicaException(10006, "the path isn't a directory");
export const avmFileEmpty = () => new PunicaException(10007, 'the avm file is empty');

export const abiFileNotFound = () => new PunicaException(10008, 'abi file not found');
export const abiFileEmpty = () => new PunicaException(10009, 'abi file is empty');
export const abiFileError = () => new PunicaException(10009, 'error exist in abi file');

export const networkError = () =>
  new PunicaException(20000, 'please make sure you network state, and the repository exists.');

export const fileExistError = () => new PunicaException(30000, 'something already exists at the destination.');
export const permissionError = () => new PunicaException(30001, 'permission denied, please check your file path.');
export const dirPathError = () => new PunicaException(30002, 'dir path not exist, please check your dir path.');
