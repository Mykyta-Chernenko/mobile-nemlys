import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_3914_20270)" fillRule="evenodd" clipRule="evenodd">
        <Path
          d="M1.143 8.855A1.143 1.143 0 000 9.998v4.857a1.143 1.143 0 001.143 1.143H6a1.143 1.143 0 001.143-1.143V9.998A1.143 1.143 0 006 8.855H1.143zm7.714 1.143A1.143 1.143 0 0110 8.855h4.857A1.143 1.143 0 0116 9.998v4.857a1.143 1.143 0 01-1.143 1.143H10a1.143 1.143 0 01-1.143-1.143V9.998z"
          fill="#8FBFFA"
        />
        <Path
          d="M5.577 0a1.143 1.143 0 00-1.142 1.143V6a1.143 1.143 0 001.142 1.143h4.858A1.143 1.143 0 0011.577 6V1.143A1.143 1.143 0 0010.435 0H5.577z"
          fill="#2859C5"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3914_20270">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
