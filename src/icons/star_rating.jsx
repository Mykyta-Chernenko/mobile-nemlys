import * as React from 'react';
import Svg, { G, Path, Defs } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: filter */

function SvgComponent(props) {
  return (
    <Svg
      width={24}
      height={20}
      viewBox="0 0 24 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G filter="url(#filter0_d_1960_2120)">
        <Path
          d="M9.27 4.529l-4.646.66-.083.017a.732.732 0 00-.329.186.711.711 0 00-.185.697.712.712 0 00.194.32l3.366 3.215-.794 4.54-.01.079a.703.703 0 00.333.643.737.737 0 00.734.031l4.155-2.143 4.145 2.143.073.033a.742.742 0 00.727-.11.715.715 0 00.258-.676l-.795-4.54 3.367-3.216.057-.06a.707.707 0 00-.112-1.01.735.735 0 00-.349-.148L14.73 4.53 12.653.399a.72.72 0 00-.268-.291.739.739 0 00-1.038.29L9.27 4.529z"
          fill="#000"
        />
        <Path
          d="M9.27 4.529l-4.646.66-.083.017a.732.732 0 00-.329.186.711.711 0 00-.185.697.712.712 0 00.194.32l3.366 3.215-.794 4.54-.01.079a.703.703 0 00.333.643.737.737 0 00.734.031l4.155-2.143 4.145 2.143.073.033a.742.742 0 00.727-.11.715.715 0 00.258-.676l-.795-4.54 3.367-3.216.057-.06a.707.707 0 00-.112-1.01.735.735 0 00-.349-.148L14.73 4.53 12.653.399a.72.72 0 00-.268-.291.739.739 0 00-1.038.29L9.27 4.529z"
          stroke="#2C3E50"
        />
      </G>
      <Defs></Defs>
    </Svg>
  );
}

export default SvgComponent;
