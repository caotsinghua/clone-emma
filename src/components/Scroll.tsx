import React, { useState, useEffect } from 'react';
import { Box, Color, Text, render, StdinContext } from 'ink';
import { WithStdin } from '../utils';
const ARROW_UP = '\u001B[A';
const ARROW_DOWN = '\u001B[B';

interface Props<T> {
  active: boolean;
  values: T[];
  children: (props: T & { active: boolean }) => React.ReactNode;
  onWillReachEnd: () => void;
}

function Scroll<T>({ values, active, children, onWillReachEnd, stdin, setRawMode }: WithStdin<Props<T>>) {
  const [cursor, setCursor] = useState(0);
  let window: number = 5;

  useEffect(() => {
    if (setRawMode) setRawMode(true);
    stdin.on('data', handleInput);
    return () => {
      stdin.removeListener('data', handleInput);
      if (setRawMode) setRawMode(false);
    };
  }, []);

  // useEffect(() => {
  //   if (active === false) {
  //     setCursor(0);
  //   } else if (values.length < cursor) {
  //     setCursor(values.length);
  //   }
  //   if (values.length - 2 === cursor) onWillReachEnd();
  // }, [active, values]);

  const handleInput = (data: any) => {
    if (!active) return;
    const char = String(data);
    switch (char) {
      case ARROW_UP:
        if (cursor - 1 >= 0) setCursor(cursor => cursor - 1);
        break;
      case ARROW_DOWN:
        if (cursor + 1 < values.length) setCursor(cursor => cursor + 1);
        break;
    }
  };

  const getMask = (): number => {
    const size = window;
    const offset = Math.floor(size / 2);
    if (values.length <= size) return 0;
    if (cursor - offset <= 0) return 0;
    if (cursor + offset >= values.length) return values.length - size;
    return cursor - offset;
  };

  const mask = getMask();
  return (
    <Box flexDirection="column">
      {values.length === 0 && (
        <Text>
          <Color grey>Start typing or change query so we can find something!</Color>
        </Text>
      )}
      {values.map((value, i) => children({ ...value, active: active && i + mask === cursor }))}
    </Box>
  );
}

export function ScrollWithStdin<T>(props: Props<T>) {
  return (
    <StdinContext.Consumer>
      {({ stdin, setRawMode }) => <Scroll {...props} stdin={stdin} setRawMode={setRawMode} />}
    </StdinContext.Consumer>
  );
}
