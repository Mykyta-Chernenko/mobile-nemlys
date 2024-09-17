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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.538 2.592a1.485 1.485 0 011.982 1.664l-1.762 9.34a1.485 1.485 0 01-.935 1.114L5.931 18.07a1.486 1.486 0 01-1.983-1.664l1.762-9.34c.097-.51.45-.931.935-1.114l8.893-3.359zm-2.96 5.742a2.585 2.585 0 10-3.322 3.96 2.585 2.585 0 003.323-3.96z"
        fill="#B0E387"
      />
    </Svg>
  );
}

export default SvgComponent;
