import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        opacity={0.9}
        d="M7.176 20.359c2.247 3.995 8 3.995 10.247 0l5.962-10.598C25.588 5.842 22.756 1 18.26 1H6.338C1.842 1-.99 5.842 1.215 9.76l5.961 10.598z"
        fill="#AC8FFA"
      />
      <Path
        d="M12.778 15v-1.415h-3.12V12.51l2.63-4.895h2.005v4.8h.88v1.17h-.88V15h-1.515zm-1.955-1.92l-.415-.665h2.37v-3.81l.315.085-2.27 4.39z"
        fill="#1A052F"
      />
    </Svg>
  );
}

export default SvgComponent;
