import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={33}
      height={33}
      viewBox="0 0 33 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_3429_5275)">
        <Path
          d="M7.788 7.749c3.016-5.521 10.878-5.705 14.149-.331l6.73 11.058c3.279 5.389-.526 12.303-6.832 12.416l-12.897.232C2.67 31.237-1.384 24.54 1.62 19.039L7.788 7.75z"
          fill="#FF76C0"
        />
        <Path
          d="M16.852 11.229c-.363.568-.536.987-.73 1.768-.203.822-.259 1.361-.235 2.255M11.159 11.229c-.363.568-.536.987-.73 1.768-.203.822-.26 1.361-.235 2.255M13.645 23.717s4.477 2.128 6.105-4.256"
          stroke="#1A052F"
          strokeWidth={2.11353}
          strokeLinecap="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3429_5275">
          <Path fill="#fff" transform="translate(.25 .5)" d="M0 0H32V32H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
