export type WithStdin<X> = X & {
  readonly stdin: NodeJS.ReadStream;
  readonly setRawMode: NodeJS.ReadStream['setRawMode'];
};
