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
      <G clipPath="url(#clip0_3429_5264)">
        <Path
          d="M23.25 7.749c-3.015-5.521-10.877-5.705-14.148-.331l-6.73 11.058c-3.279 5.389.526 12.303 6.832 12.416l12.897.232c6.267.113 10.322-6.584 7.317-12.085L23.25 7.75z"
          fill="#B680F1"
        />
        <Path
          d="M14.187 11.229c.363.568.536.987.73 1.768.203.822.259 1.361.235 2.255M19.88 11.229c.363.568.536.987.73 1.768.203.822.26 1.361.235 2.255M17.395 23.717s-4.478 2.128-6.106-4.256"
          stroke="#1A052F"
          strokeWidth={2.11353}
          strokeLinecap="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3429_5264">
          <Path fill="#fff" transform="translate(.75 .5)" d="M0 0H32V32H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
