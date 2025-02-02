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
        d="M11.3 6.799c3.159-5.614 11.241-5.614 14.4 0l8.376 14.891c3.097 5.507-.882 12.31-7.2 12.31H10.124C3.806 34-.173 27.197 2.924 21.69L11.301 6.8z"
        fill="#FF76C0"
      />
      <Path
        d="M20.8 12.214c-.409.64-.604 1.113-.821 1.993-.23.927-.293 1.535-.266 2.543M14.38 12.214c-.409.64-.603 1.113-.821 1.993-.23.927-.293 1.535-.266 2.543M24.067 22.876s-5.047-2.4-6.883 4.798"
        stroke="#221C3F"
        strokeWidth={3.02046}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SvgComponent;
