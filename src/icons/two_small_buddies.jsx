import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';
import { getFontSizeForScreen } from '@app/components/utils/FontText';

function SvgComponent(props) {
  return (
    <Svg
      width={getFontSizeForScreen('h1') * 2.1}
      height={getFontSizeForScreen('h1')}
      viewBox="0 0 67 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_2301_30190)">
        <Path
          d="M22.804 7.247c-3.016-5.521-10.878-5.705-14.149-.331l-6.73 11.058c-3.279 5.389.526 12.302 6.832 12.416l12.897.232c6.268.113 10.322-6.584 7.317-12.085l-6.167-11.29z"
          fill="#FF76C0"
        />
        <Path
          d="M13.74 10.725c.362.568.535.987.729 1.768.203.822.26 1.361.235 2.255M19.434 10.725c.363.568.536.987.73 1.768.203.822.259 1.361.235 2.255M16.947 23.211s-4.477 2.128-6.105-4.256"
          stroke="#1A052F"
          strokeWidth={2.11353}
          strokeLinecap="round"
        />
        <Path
          d="M41.84 7.247c3.016-5.521 10.878-5.705 14.149-.331l6.73 11.058c3.279 5.389-.526 12.302-6.832 12.416l-12.897.232c-6.268.113-10.322-6.584-7.317-12.085l6.167-11.29z"
          fill="#B680F1"
        />
        <Path
          d="M50.905 10.725c-.363.568-.536.987-.73 1.768-.203.822-.26 1.361-.235 2.255M45.21 10.725c-.363.568-.536.987-.73 1.768-.203.822-.259 1.361-.235 2.255M47.697 23.211s4.477 2.128 6.105-4.256"
          stroke="#1A052F"
          strokeWidth={2.11353}
          strokeLinecap="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_2301_30190">
          <Path fill="#fff" transform="translate(.302)" d="M0 0H66V32H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
