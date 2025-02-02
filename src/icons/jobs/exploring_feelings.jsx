import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

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
      <Path
        d="M13.095 1.198a1.386 1.386 0 011.709 1.709l-2.399 8.54c-.13.466-.494.83-.96.96l-8.54 2.399a1.386 1.386 0 01-1.71-1.71l2.4-8.54c.13-.465.494-.829.959-.96l8.54-2.398z"
        fill="#FFBFE1"
      />
      <Path
        d="M6.407 6.41a2.253 2.253 0 103.186 3.185 2.253 2.253 0 00-3.186-3.186z"
        fill="#CC1479"
      />
    </Svg>
  );
}

export default SvgComponent;
