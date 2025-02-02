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
        d="M7.176 3.996c2.247-3.995 8-3.995 10.247 0l5.962 10.599c2.204 3.918-.628 8.76-5.124 8.76H6.338c-4.496 0-7.328-4.842-5.123-8.76L7.176 3.995z"
        fill="#FDC180"
      />
      <Path
        d="M13.74 9.615V17H12.2v-5.935a1.256 1.256 0 01-.28.13c-.14.05-.309.098-.506.145-.196.047-.4.078-.61.095v-1.22c.21-.027.415-.072.615-.135.2-.067.372-.142.515-.225.147-.083.244-.163.29-.24h1.515z"
        fill="#1A052F"
      />
    </Svg>
  );
}

export default SvgComponent;
