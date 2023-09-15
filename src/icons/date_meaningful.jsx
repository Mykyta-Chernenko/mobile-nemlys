import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_1626_5980)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18.359 1.039a1.173 1.173 0 00-.883.116 1.159 1.159 0 00-.543.701l-5.665 20.997a1.15 1.15 0 00.118.877c.155.266.41.46.708.538l14.77 3.93c.3.08.617.037.884-.117.268-.153.463-.406.542-.702l5.67-20.994a1.151 1.151 0 00-.417-1.219 1.169 1.169 0 00-.408-.2L18.36 1.04h-.002zM8.337 22.072l3.876-14.359L.865 10.73a1.169 1.169 0 00-.708.54 1.151 1.151 0 00-.117.878l5.67 20.994c.08.297.274.55.542.703.267.154.585.196.883.117l14.774-3.93c.018-.005.037-.01.056-.017l-10.66-2.833a4.214 4.214 0 01-1.471-.72 4.18 4.18 0 01-1.608-2.767 4.142 4.142 0 01.109-1.625l.002.003z"
          fill="#8C7BF4"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1626_5980">
          <Path fill="#fff" d="M0 0H40V40H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
