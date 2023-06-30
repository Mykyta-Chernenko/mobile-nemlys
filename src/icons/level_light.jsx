import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        opacity={0.9}
        d="M11.55 11.799c3.159-5.614 11.241-5.614 14.4 0l8.376 14.891c3.097 5.507-.882 12.31-7.2 12.31H10.374C4.056 39 .077 32.197 3.174 26.69L11.551 11.8z"
        fill="#C28DFA"
      />
      <Path
        d="M21.468 17.54c-.41.64-.604 1.113-.822 1.993-.23.927-.293 1.535-.265 2.543M15.048 17.54c-.409.64-.604 1.113-.822 1.993-.23.927-.293 1.535-.265 2.543M17.852 31.616s5.047 2.4 6.882-4.798"
        stroke="#221C3F"
        strokeWidth={3.02046}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SvgComponent;
