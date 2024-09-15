import * as React from 'react';
import Svg, { Rect, Path, G, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={181}
      height={110}
      viewBox="0 0 181 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Rect x={34} y={0.5} width={94} height={49} rx={12} fill="#fff" />
      <Rect x={50} y={16.5} width={48} height={6} rx={3} fill="#A39BAC" />
      <Rect x={50} y={27.5} width={21} height={6} rx={3} fill="#E3D3D6" />
      <Path
        d="M52 72.5c0-6.627 5.373-12 12-12h70c6.627 0 12 5.373 12 12v25c0 6.627-5.373 12-12 12H64c-6.627 0-12-5.373-12-12v-25z"
        fill="#fff"
      />
      <Rect x={68} y={76.5} width={48} height={6} rx={3} fill="#A39BAC" />
      <Rect x={68} y={87.5} width={21} height={6} rx={3} fill="#E3D3D6" />
      <G clipPath="url(#clip0_2439_9181)">
        <Path
          d="M22.502 24.747c-3.016-5.521-10.878-5.705-14.149-.331l-6.73 11.058c-3.279 5.389.526 12.303 6.832 12.416l12.897.232c6.267.112 10.322-6.584 7.317-12.085l-6.167-11.29z"
          fill="#FF76C0"
        />
        <Path
          d="M13.437 28.225c.363.568.536.987.73 1.768.203.822.259 1.361.235 2.255M19.131 28.225c.363.568.536.987.73 1.768.203.822.26 1.361.235 2.255M16.645 40.711s-4.478 2.128-6.106-4.256"
          stroke="#1A052F"
          strokeWidth={2.11353}
          strokeLinecap="round"
        />
        <Path
          d="M41.538 24.747c3.016-5.521 10.878-5.705 14.149-.331l6.73 11.058c3.279 5.389-.526 12.303-6.832 12.416l-12.897.232c-6.267.112-10.322-6.584-7.317-12.085l6.167-11.29z"
          fill="#B680F1"
        />
      </G>
      <G clipPath="url(#clip1_2439_9181)">
        <Path
          d="M156.038 84.747c3.016-5.521 10.878-5.705 14.149-.331l6.73 11.058c3.279 5.389-.526 12.303-6.832 12.416l-12.897.232c-6.267.113-10.322-6.584-7.317-12.085l6.167-11.29z"
          fill="#B680F1"
        />
        <Path
          d="M165.103 88.225c-.363.568-.536.987-.729 1.768-.204.822-.26 1.361-.235 2.255M159.409 88.225c-.363.568-.536.987-.73 1.768-.203.822-.259 1.361-.235 2.255M161.895 100.711s4.477 2.128 6.105-4.256"
          stroke="#1A052F"
          strokeWidth={2.11353}
          strokeLinecap="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_2439_9181">
          <Path fill="#fff" transform="translate(0 17.5)" d="M0 0H32V32H0z" />
        </ClipPath>
        <ClipPath id="clip1_2439_9181">
          <Path fill="#fff" transform="translate(148.5 77.5)" d="M0 0H32V32H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
