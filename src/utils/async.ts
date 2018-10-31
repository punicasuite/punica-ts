import * as readline from 'readline';

export function questionAsync(msg: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const rlAny: any = rl;

  const stdin = process.openStdin();
  const onDataHandler = (char: string) => {
    char = char + '';
    switch (char) {
      case '\n':
      case '\r':
      case '\u0004':
        // Remove this handler
        stdin.removeListener('data', onDataHandler);
        break; // stdin.pause(); break;
      default:
        process.stdout.write('\x1B[2K\x1B[200D' + msg + Array(rlAny.line.length + 1).join('*'));
        break;
    }
  };
  process.stdin.on('data', onDataHandler);

  return new Promise((resolve) => {
    rl.question(msg, (answer: string) => {
      rlAny.history = rlAny.history.slice(1);
      rl.close();
      resolve(answer);
    });
  });
}
