import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

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
      <G clipPath="url(#clip0_3339_12249)">
        <Path
          d="M6.185 5.694l-3.088.439-.055.01a.486.486 0 00-.344.34.466.466 0 00.131.46L5.067 9.08l-.528 3.018-.006.053a.467.467 0 00.22.427.49.49 0 00.488.02l2.762-1.424L10.76 12.6l.048.022a.493.493 0 00.483-.074.476.476 0 00.171-.449l-.528-3.018 2.239-2.137.037-.04a.471.471 0 00-.306-.77l-3.088-.44-1.38-2.744A.478.478 0 008 2.684a.49.49 0 00-.434.265l-1.38 2.745z"
          fill="#1A052F"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3339_12249">
          <Path fill="#fff" transform="translate(.023 .023)" d="M0 0H15.9524V15.9524H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
