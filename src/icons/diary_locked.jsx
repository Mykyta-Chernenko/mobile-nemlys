import * as React from 'react';
import Svg, { Path, G, Rect, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={34}
      height={34}
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.349 7.61c-1.923-3.364-6.775-3.364-8.698 0l-.544.953A2.852 2.852 0 018.63 10c-3.846 0-6.257 4.155-4.349 7.494.533.933.533 2.08 0 3.013C2.374 23.846 4.785 28 8.631 28c1.023 0 1.968.549 2.476 1.437l.544.953c1.923 3.365 6.775 3.365 8.698 0l.544-.953A2.852 2.852 0 0123.37 28c3.846 0 6.257-4.154 4.349-7.493a3.036 3.036 0 010-3.013c1.908-3.34-.503-7.494-4.349-7.494a2.852 2.852 0 01-2.476-1.437l-.544-.952z"
        fill="#A39BAC"
      />
      <Path
        d="M11.149 19.76l6.843-6.842a1 1 0 011.413-.002l1.43 1.424a1 1 0 01.001 1.415l-6.853 6.853a1 1 0 01-.61.289l-1.574.152a1 1 0 01-1.091-1.092l.152-1.585a1 1 0 01.289-.611z"
        fill="#fff"
      />
      <G clipPath="url(#clip0_788_18477)">
        <Rect x={16} y={2} width={16} height={16} rx={8} fill="#A39BAC" />
        <Path d="M20 10a1 1 0 011-1h6a1 1 0 011 1v3a1 1 0 01-1 1h-6a1 1 0 01-1-1v-3z" fill="#fff" />
        <Path
          d="M22 9V7a2 2 0 114 0v2"
          stroke="#fff"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Rect x={15} y={1} width={18} height={18} rx={9} stroke="#fff" strokeWidth={2} />
      <Defs>
        <ClipPath id="clip0_788_18477">
          <Rect x={16} y={2} width={16} height={16} rx={8} fill="#fff" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
