import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={40}
      height={43}
      viewBox="0 0 40 43"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        opacity={0.9}
        d="M13.293 3.701c2.394-4.255 8.52-4.255 10.914 0L36.002 24.67c2.347 4.173-.669 9.33-5.457 9.33H6.955c-4.788 0-7.804-5.157-5.457-9.33L13.293 3.7z"
        fill="#B4E88C"
      />
      <Path
        opacity={0.9}
        d="M13.293 37.299c2.394 4.255 8.52 4.255 10.914 0L36.002 16.33C38.349 12.157 35.333 7 30.545 7H6.955c-4.788 0-7.804 5.157-5.457 9.33L13.293 37.3z"
        fill="#B4E88C"
      />
      <Path
        d="M21.468 13.54c-.41.64-.604 1.113-.822 1.993-.23.927-.293 1.535-.265 2.543M15.048 13.54c-.409.64-.604 1.113-.822 1.993-.23.927-.293 1.535-.265 2.543M17.852 27.616s5.047 2.4 6.882-4.798"
        stroke="#221C3F"
        strokeWidth={3.02046}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SvgComponent;
