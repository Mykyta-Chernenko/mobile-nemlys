import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
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
      <Path
        d="M22.502 7.247c-3.016-5.521-10.878-5.705-14.149-.331l-6.73 11.058c-3.279 5.389.526 12.302 6.832 12.416l12.897.232c6.267.113 10.322-6.584 7.317-12.085l-6.167-11.29z"
        fill="#FF76C0"
      />
      <Path
        d="M13.437 10.725c.363.568.536.987.73 1.768.203.822.259 1.361.235 2.255M19.131 10.725c.363.568.536.987.73 1.768.203.822.26 1.361.235 2.255M16.645 23.211s-4.478 2.128-6.106-4.256"
        stroke="#1A052F"
        strokeWidth={2.11353}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SvgComponent;
