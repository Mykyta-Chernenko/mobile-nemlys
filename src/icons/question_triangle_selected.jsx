import * as React from 'react';
import Svg, { Mask, Path, G, Defs } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: filter */

function SvgComponent(props) {
  return (
    <Svg
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Mask
        id="a"
        style={{
          maskType: 'alpha',
        }}
        maskUnits="userSpaceOnUse"
        x={2}
        y={3}
        width={32}
        height={32}
      >
        <Path
          opacity={0.9}
          d="M9.725 7.812c2.853-5.225 10.293-5.399 13.388-.313l6.369 10.464c3.103 5.099-.497 11.641-6.465 11.749l-12.204.22c-5.931.106-9.767-6.23-6.924-11.436L9.725 7.812z"
          fill="#FEBE75"
        />
      </Mask>
      <G mask="url(#a)">
        <Path
          d="M9.478 7.692c2.853-5.225 10.293-5.399 13.388-.313l6.369 10.464c3.103 5.099-.497 11.641-6.465 11.749l-12.204.22c-5.931.106-9.768-6.23-6.924-11.436L9.478 7.692z"
          fill="#FDC180"
        />
        <G filter="url(#filter0_f_788_18459)">
          <Path
            d="M-2.892 16.036c2.854-5.225 10.294-5.399 13.389-.314l6.368 10.465c3.103 5.099-.497 11.641-6.465 11.748l-12.204.22c-5.93.106-9.767-6.23-6.923-11.436l5.835-10.683z"
            fill="#E6A258"
          />
        </G>
        <G filter="url(#filter1_f_788_18459)">
          <Path
            d="M27.33.503C30.184-4.72 37.624-4.895 40.718.19l6.369 10.465c3.103 5.098-.497 11.64-6.465 11.748l-12.204.22c-5.93.106-9.767-6.23-6.924-11.436L27.33.503z"
            fill="#FFDBB4"
          />
        </G>
      </G>
      <Path
        d="M17.874 22.834s-.306.284-.159.334l.378.128M12.904 14.434s1.526-2.279 3.518-2.359c1.992-.08 3.647.847 3.696 2.07.049 1.222-2.915 1.176-3.518 2.358-.45.88.093 2.334.093 2.334"
        stroke="#1A052F"
        strokeWidth={2.03874}
        strokeLinecap="round"
      />
      <Defs></Defs>
    </Svg>
  );
}

export default SvgComponent;
