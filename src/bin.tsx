import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import updateNotifier from 'update-notifier';
import Emma from './Emma';
const cli = meow(`
 Usage
  $ emma

 Controls:
  - space: toggle dependencies
  - up/down: scroll the list
  - right/left: hide or show details
  - double right: show repo
`);

const notifer = updateNotifier(cli);
notifer.notify();

if (notifer.update) {
  process.exit(0);
}

render(<Emma />, {
  exitOnCtrlC: true
});
