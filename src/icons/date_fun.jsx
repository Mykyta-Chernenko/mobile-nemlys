import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={41}
      height={40}
      viewBox="0 0 41 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_1626_5954)">
        <Path
          d="M27.57 24H9.797c-2.491 0-4.81-.857-6.53-2.414C1.484 19.969.5 17.727.5 15.273c0-2.494.915-4.645 2.647-6.22 1.362-1.24 3.221-2.083 5.29-2.411a10.666 10.666 0 013.09-4.337C13.336.797 15.574 0 18 0a10.512 10.512 0 017.324 2.925c1.85 1.777 3.048 4.178 3.494 6.986 3.37.498 6.682 2.781 6.682 6.998 0 2.277-.837 4.144-2.42 5.402C31.687 23.416 29.782 24 27.57 24z"
          fill="#FDC180"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1626_5954">
          <Path fill="#fff" transform="translate(.5)" d="M0 0H40V40H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
