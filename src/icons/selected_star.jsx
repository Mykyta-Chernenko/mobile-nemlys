import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_3360_9977)">
        <Path
          d="M6.184 5.694l-3.088.439-.055.01a.486.486 0 00-.344.34.466.466 0 00.131.46L5.066 9.08l-.528 3.018-.006.053a.467.467 0 00.22.427.49.49 0 00.488.02l2.762-1.424 2.756 1.425.048.022a.493.493 0 00.483-.074.475.475 0 00.171-.449l-.528-3.018 2.239-2.137.037-.04a.471.471 0 00-.306-.77l-3.088-.44-1.38-2.744a.478.478 0 00-.435-.265.49.49 0 00-.434.265l-1.38 2.745z"
          fill={props.fill || '#1A052F'}
        />
      </G>
    </Svg>
  );
}

export default SvgComponent;
