import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: filter */

function SvgComponent(props) {
  return (
    <Svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <G filter="url(#filter0_d_607_11192)">
        <Path
          d="M4.629 14.277c0-.216.1-.407.257-.614l9.687-12.12c.631-.788 1.619-.29 1.254.681l-3.23 8.732h6.094c.39 0 .647.274.647.615 0 .216-.091.406-.25.614l-9.686 12.12c-.63.78-1.619.281-1.253-.681l3.22-8.741H5.285c-.39 0-.656-.266-.656-.606z"
          fill="#A39BAC"
        />
      </G>
    </Svg>
  );
}

export default SvgComponent;
