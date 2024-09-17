import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { getFontSizeForScreen } from '@app/components/utils/FontText';

function SvgComponent(props) {
  return (
    <Svg
      width={getFontSizeForScreen('h3')}
      height={getFontSizeForScreen('h3')}
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M12.326 5.91a3.766 3.766 0 115.326 5.325l-4.263 4.263a3.766 3.766 0 01-5.326-5.326l4.263-4.263z"
        fill="#FA41A5"
      />
      <Path
        d="M7.125 14.95a3.766 3.766 0 106.17-4.32l-3.27-4.67a3.766 3.766 0 10-6.17 4.32l3.27 4.67z"
        fill="#FA41A5"
      />
    </Svg>
  );
}

export default SvgComponent;
