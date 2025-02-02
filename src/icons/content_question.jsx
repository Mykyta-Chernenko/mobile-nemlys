import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M9.455 0a9.454 9.454 0 00-7.876 14.683l-1.263 3.38a.514.514 0 00.574.686l4.426-.797A9.453 9.453 0 109.455 0z"
        fill="#fff"
      />
      <Path
        opacity={0.5}
        d="M16.286 8.57a7.714 7.714 0 016.425 11.98l.974 2.602a.515.515 0 01-.573.686l-3.45-.62A7.715 7.715 0 1116.287 8.57z"
        fill="#fff"
      />
    </Svg>
  );
}

export default SvgComponent;
