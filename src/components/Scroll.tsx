import React, { useState, useEffect } from 'react';
import { Box, Color, Text, render, StdinContext } from 'ink';
import { WithStdin } from '../utils';
import { VIEW } from '../Emma';
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
  console.log(active);
  useEffect(() => {
    if (setRawMode) setRawMode(true);
    stdin.on('data', handleInput);
    return () => {
      stdin.removeListener('data', handleInput);
      if (setRawMode) setRawMode(false);
    };
  }, []);

  useEffect(() => {
    if (active === false) {
      setCursor(0);
    } else if (values.length < cursor) {
      setCursor(values.length);
    }
    if (values.length - 2 === cursor) onWillReachEnd(); // 触底加载
  }, [active, cursor, values.length]);

  const handleInput = (data: any) => {
    console.log({ active });
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
    const offset = Math.floor(size / 2); // 中间点
    if (values.length <= size) return 0; // 小于5个元素，mask为0
    if (cursor <= offset) return 0; // cursor在第三个之前，mask为0
    if (cursor >= values.length - offset) return values.length - size; // cursor倒数的offset后，从最后size个开始
    return cursor - offset; // 否则永远从cursor的前offset个开始
  };

  const mask = getMask();
  const size = window;
  const packages = values.slice(mask, mask + size);
  const render = children;
  return (
    <Box flexDirection="column">
      {values.length === 0 && (
        <Text>
          <Color grey>Start typing or change query so we can find something!</Color>
        </Text>
      )}
      {packages.map((value, i) => render({ ...value, active: active && i + mask === cursor }))}
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
