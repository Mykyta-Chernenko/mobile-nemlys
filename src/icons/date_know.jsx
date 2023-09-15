import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

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
      <G clipPath="url(#clip0_1626_5959)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M27.022.116a3.134 3.134 0 013.862 3.862l-5.423 19.313a3.134 3.134 0 01-2.17 2.17L3.978 30.887a3.133 3.133 0 01-3.862-3.863L5.539 7.711a3.133 3.133 0 012.17-2.17L27.022.117zm-7.277 11.528a5.454 5.454 0 10-7.714 7.713 5.454 5.454 0 007.714-7.713z"
          fill="#B0E387"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1626_5959">
          <Path fill="#fff" d="M0 0H40V40H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
