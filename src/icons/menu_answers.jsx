import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={33}
      height={33}
      viewBox="0 0 33 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_3339_9879)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.467 5.253A2.571 2.571 0 019.285 4.5h17.143a2.571 2.571 0 012.571 2.571v17.143a2.572 2.572 0 01-2.571 2.572h-13.61l-6.754 1.688a.857.857 0 01-1.02-1.102l1.67-5.01V7.071c0-.683.27-1.337.753-1.819zm4.487 6.795c.201-.2.474-.314.758-.314h10.286a1.072 1.072 0 010 2.143H12.712a1.072 1.072 0 01-.758-1.829zm.348 5.442c.13-.054.27-.081.41-.081h6.857a1.072 1.072 0 010 2.143h-6.857a1.073 1.073 0 01-.41-2.062z"
          fill="#1A052F"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3339_9879">
          <Path fill="#fff" transform="translate(5 4.5)" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
