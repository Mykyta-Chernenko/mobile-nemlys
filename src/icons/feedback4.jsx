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
        d="M10.3 6.799c3.159-5.614 11.241-5.614 14.4 0l8.376 14.891c3.097 5.507-.882 12.31-7.2 12.31H9.124c-6.317 0-10.296-6.803-7.199-12.31L10.301 6.8z"
        fill="#B4E88C"
      />
      <Path
        d="M19.8 12.214c-.409.64-.604 1.113-.821 1.993-.23.927-.293 1.535-.266 2.543M13.38 12.214c-.409.64-.603 1.113-.821 1.993-.23.927-.293 1.535-.266 2.543M21.998 26.5c-.931 1.662-3.4 2.068-4.814.79-1.569-1.416-.867-4.65 1.148-5.29 2.161-.685 4.774 2.523 3.666 4.5z"
        stroke="#1A052F"
        strokeWidth={3.02046}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SvgComponent;
