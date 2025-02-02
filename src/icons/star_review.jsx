import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function SvgComponent({ fill = '#FFBA70', ...props }) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_3792_19135)">
        <Path
          d="M5.27 4.529l-4.646.66-.083.017a.732.732 0 00-.329.186.711.711 0 00-.185.697.712.712 0 00.194.32l3.366 3.215-.794 4.54-.01.079a.703.703 0 00.333.643.737.737 0 00.734.031l4.155-2.143 4.145 2.143.073.033a.742.742 0 00.726-.11.715.715 0 00.259-.676l-.795-4.54 3.367-3.216.057-.06a.707.707 0 00-.112-1.01.735.735 0 00-.349-.148L10.73 4.53 8.653.399a.72.72 0 00-.268-.291.739.739 0 00-1.038.29L5.27 4.529z"
          fill={fill}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3792_19135">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
