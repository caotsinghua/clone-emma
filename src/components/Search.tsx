import React, { useEffect, useState } from 'react';
import { WithStdin } from '../utils';
import { Box, Text, Color, StdinContext } from 'ink';
import { SearchContext, WithSearchContext } from '../algolia';

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
  onChange: (q: string) => void;
  loading: boolean;
  query?: string;
}

const Search: React.FC<WithStdin<Props>> = ({ stdin, setRawMode, active, onChange, loading, query }) => {
  const handleInput = (data: string) => {
    const char = String(data);
    if ([ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ENTER, CTRL_C, SPACE].includes(char) || !active) {
      return;
    }
    if (char === BACKSPACE || char === DELETE) {
      onChange(query.slice(0, query.length - 1)); // delete
    } else {
      onChange(`${query}${char}`);
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

  const hasValue = query.length > 0;
  return (
    <Box flexDirection="row">
      <Box marginRight={1}>
        <Text>
          Search package on <Color cyan>Yarn</Color>
        </Text>
      </Box>
      <Box>
        <Color dim={!hasValue}>{hasValue ? query : 'create-emma'}</Color>
      </Box>
    </Box>
  );
};

export const SearchWithStdin: React.FC<Props> = props => {
  return (
    <SearchContext.Consumer>
      {({ query }) => (
        <StdinContext.Consumer>
          {({ stdin, setRawMode }) => <Search {...props} query={query} stdin={stdin} setRawMode={setRawMode} />}
        </StdinContext.Consumer>
      )}
    </SearchContext.Consumer>
  );
};
