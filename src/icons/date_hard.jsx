import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={41}
      height={40}
      viewBox="0 0 41 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_1626_5956)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.648 0C12.366 0 8.258 1.686 5.23 4.686 2.2 7.686.5 11.756.5 16s1.701 8.313 4.73 11.314c3.028 3 7.136 4.686 11.418 4.686h.01a16.461 16.461 0 006.129-1.23 1.151 1.151 0 00.71-.978 1.133 1.133 0 00-.57-1.065 14.926 14.926 0 01-5.416-5.389A14.753 14.753 0 0115.495 16a14.752 14.752 0 011.988-7.328 14.925 14.925 0 015.38-5.399 1.148 1.148 0 00.565-1.065 1.136 1.136 0 00-.71-.976A16.463 16.463 0 0016.662 0h-.014z"
          fill="#8DB5F1"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1626_5956">
          <Path fill="#fff" transform="translate(.5)" d="M0 0H40V40H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
