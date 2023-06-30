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
        d="M11.3 11.799c3.159-5.614 11.241-5.614 14.4 0l8.376 14.891c3.097 5.507-.882 12.31-7.2 12.31H10.124C3.806 39-.173 32.197 2.924 26.69L11.301 11.8z"
        fill="#BD8AFF"
      />
      <Path
        d="M20.8 17.54c-.409.64-.604 1.113-.821 1.993-.23.927-.293 1.535-.266 2.543M14.38 17.54c-.409.64-.603 1.113-.821 1.993-.23.927-.293 1.535-.266 2.543M17.184 31.616s5.047 2.4 6.883-4.798"
        stroke="#1A052F"
        strokeWidth={3.02046}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SvgComponent;
