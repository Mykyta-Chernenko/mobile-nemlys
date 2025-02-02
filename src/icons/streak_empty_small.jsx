import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={24}
      height={30}
      viewBox="0 0 24 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M14.097.257a1.083 1.083 0 00-.981-.219 1.084 1.084 0 00-.454.254c-.129.12-.227.271-.287.438l-3 8.39L6.08 5.87a1.088 1.088 0 00-.84-.311 1.076 1.076 0 00-.786.434C1.5 9.935 0 13.9 0 17.778c0 3.241 1.264 6.35 3.515 8.642A11.89 11.89 0 0012 30a11.89 11.89 0 008.485-3.58A12.339 12.339 0 0024 17.778c0-8.257-6.926-15-9.903-17.521z"
        fill="#fff"
        fillOpacity={0.15}
      />
    </Svg>
  );
}

export default SvgComponent;
