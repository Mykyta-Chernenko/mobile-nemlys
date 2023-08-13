import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={70}
      height={75}
      viewBox="0 0 70 75"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M28.022 13.627c8.393-17.308 33.05-17.308 41.443 0L94.82 65.916c7.416 15.294-3.724 33.077-20.721 33.077H23.388C6.39 98.993-4.75 81.21 2.666 65.916l25.356-52.29z"
        fill="#FA41A5"
      />
      <Path
        d="M50.723 16.501c-.455.712-.672 1.238-.914 2.217-.255 1.03-.326 1.706-.295 2.827M43.584 16.501c-.455.712-.672 1.238-.914 2.217-.255 1.03-.326 1.706-.295 2.827M48.492 34.043s5.63 2.443 7.677-4.887"
        stroke="#1A052F"
        strokeWidth={2.91003}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SvgComponent;
