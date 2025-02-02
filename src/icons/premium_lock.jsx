import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';

function SvgComponent({ fill = '#1A052F', stroke = '#1A052F', ...props }) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G
        clipPath="url(#clip0_3339_12244)"
        stroke={stroke}
        strokeWidth={0.997024}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path
          d="M4.012 8.165a.997.997 0 01.997-.997h5.982a.997.997 0 01.997.997v2.991a.997.997 0 01-.997.997H5.009a.997.997 0 01-.997-.997V8.165z"
          fill={fill}
        />
        <Path d="M6.006 7.168V5.174a1.994 1.994 0 013.988 0v1.994" />
      </G>
    </Svg>
  );
}

export default SvgComponent;
