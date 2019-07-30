import React, { useEffect } from 'react';
import { WithStdin } from '../utils';
import { Box, Text, Color, StdinContext } from 'ink';

const ARROW_UP = '\u001B[A';
const ARROW_DOWN = '\u001B[B';
const ARROW_LEFT = '\u001B[D';
const ARROW_RIGHT = '\u001B[C';
const ENTER = '\r';
const CTRL_C = '\x03';
const SPACE = ' ';
const BACKSPACE = '\x08';
const DELETE = '\x7F';

interface Props {
  active: boolean;
  value: string;
  onChange: (q?: string) => void;
  loading: boolean;
}

const Search: React.FC<WithStdin<Props>> = ({ stdin, setRawMode, active, value, onChange, loading }) => {
  const handleInput = (data: string) => {
    const char = String(data);
    if ([ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ENTER, CTRL_C, SPACE].includes(char) || !active) {
      return;
    }
    if (char === BACKSPACE || char === DELETE) {
      onChange();// delete
    } else {
      onChange(char);
    }
  };
  // mounted
  useEffect(() => {
    if (setRawMode) setRawMode(true);
    stdin.on('data', handleInput);
    // will unmount
    return () => {
      stdin.removeListener('data', handleInput);
      if (setRawMode) setRawMode(false);
    };
  }, []);

  const hasValue = value.length > 0;
  return (
    <Box flexDirection="row">
      <Box marginRight={1}>
        <Text>
          Search package on <Color cyan>Yarn</Color>
        </Text>
      </Box>
      <Box>
        <Color dim={!hasValue}>{hasValue ? value : 'create-emma'}</Color>
      </Box>
    </Box>
  );
};

export const SearchWithStdin: React.FC<Props> = (props: Props) => {
  return (
    <StdinContext.Consumer>
      {({ stdin, setRawMode }) => <Search {...props} stdin={stdin} setRawMode={setRawMode} />}
    </StdinContext.Consumer>
  );
};
