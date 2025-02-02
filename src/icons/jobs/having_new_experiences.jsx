import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

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
      <G clipPath="url(#clip0_3914_20295)">
        <Path
          d="M14.875 3.995c-.302-.124-.641.04-.853.289l-.045.05a1.648 1.648 0 01-2.853-1.269c.028-.314-.083-.656-.369-.79l-.495-.232a1.112 1.112 0 00-1.45.587l-3.647 8.426-.55 1.25a1.112 1.112 0 00.587 1.449l5.073 2.161a1.112 1.112 0 001.449-.587l4.197-9.713a1.112 1.112 0 00-.537-1.412l-.507-.209z"
          fill="#ABCED9"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.938 2.28c-.214-.247-.554-.412-.856-.288l-.48.198A1.084 1.084 0 00.08 3.566l3.378 7.817.396-.9 3.645-8.42.001-.001c.019-.044.039-.087.06-.13L7.006.657A1.084 1.084 0 005.594.083l-.47.22c-.285.135-.396.477-.37.791A1.607 1.607 0 011.937 2.28z"
          fill="#579CB3"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3914_20295">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
