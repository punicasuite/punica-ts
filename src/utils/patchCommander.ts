import { Command, CommanderStatic } from 'commander';

export type CommandEx = Command & { forwardSubcommands: ForwardSubcommands };
export type ForwardSubcommands = () => CommandEx;

export function patchCommander(commander: CommanderStatic) {
  commander.Command.prototype.forwardSubcommands = function() {
    const self = this;
    const listener = (args: any, unknown: any) => {
      // Parse any so-far unknown options
      args = args || [];
      unknown = unknown || [];

      const parsed = self.parseOptions(unknown);
      if (parsed.args.length) {
        args = parsed.args.concat(args);
      }
      unknown = parsed.unknown;

      // Output help if necessary
      if (args.length === 0 && (unknown.includes('--help') || unknown.includes('-h') || unknown.length === 0)) {
        self.outputHelp();
        process.exit(0);
      }

      self.parseArgs(args, unknown);
    };

    if (this._args.length > 0) {
      // tslint:disable-next-line:no-console
      console.error('forwardSubcommands cannot be applied to command with explicit args');
    }

    const parent = this.parent || this;
    const name = parent === this ? '*' : this._name;
    parent.on('command:' + name, listener);
    if (this._alias) {
      parent.on('command:' + this._alias, listener);
    }
    return this;
  };
}
