import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';
import { getFontSizeForScreen } from '@app/components/utils/FontText';

function SvgComponent(props) {
  return (
    <Svg
      width={getFontSizeForScreen('h1')}
      height={getFontSizeForScreen('h1')}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_2365_32940)">
        <Path
          d="M7.538 7.247c3.016-5.521 10.878-5.705 14.149-.331l6.73 11.058c3.279 5.389-.526 12.302-6.832 12.416l-12.897.232c-6.267.113-10.322-6.584-7.317-12.085l6.167-11.29z"
          fill="#B680F1"
        />
        <Path
          d="M16.603 10.725c-.363.568-.536.987-.73 1.768-.203.822-.259 1.361-.234 2.255M10.909 10.725c-.363.568-.536.987-.73 1.768-.203.822-.26 1.361-.235 2.255M13.395 23.211s4.477 2.128 6.105-4.256"
          stroke="#1A052F"
          strokeWidth={2.11353}
          strokeLinecap="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_2365_32940">
          <Path fill="#fff" d="M0 0H32V32H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
