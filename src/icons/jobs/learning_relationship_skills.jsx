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
      <G clipPath="url(#clip0_3914_20316)">
        <Path
          d="M3.371 8l.007 2.877c0 .123.04.243.114.342l.001.002h.002l.002.004.006.007.018.023.057.068c.05.055.12.13.211.219.186.176.458.404.827.632.74.456 1.856.896 3.383.896 1.528 0 2.644-.441 3.387-.896.37-.227.642-.455.827-.631a3.63 3.63 0 00.271-.288l.017-.022.006-.007.002-.003s.003-.002-.452-.348l.455.346c.075-.1.115-.221.115-.346V8L8.794 9.66a2 2 0 01-1.59 0L3.371 8z"
          fill="#8FBFFA"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.937 4.652c.315 0 .571.32.571.715v7.874c0 .395-.256.715-.571.715-.316 0-.572-.32-.572-.715V5.367c0-.395.256-.715.572-.715z"
          fill="#2859C5"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.938 12.572a1.417 1.417 0 10-.115 2.83 1.417 1.417 0 00.115-2.83zM8.227 1.02a.571.571 0 00-.455 0L.344 4.238a.571.571 0 000 1.05l7.428 3.218a.571.571 0 00.455 0l7.429-3.219a.571.571 0 000-1.049L8.227 1.02z"
          fill="#8FBFFA"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.371 6.598l4.401 1.906a.571.571 0 00.455 0l4.4-1.906v3.938-2.537l-3.833 1.66a2 2 0 01-1.59 0L3.371 8V6.598zm0 1.4l.006 2.538h-.005V7.999z"
          fill="#2859C5"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3914_20316">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
