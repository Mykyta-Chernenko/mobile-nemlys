import * as React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

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
      <Rect width={24} height={24} rx={12} fill="#F5E9EB" />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.784 16.432H7.568v-2.216l4.184-4.183 1.993 1.993c.08.08.177.136.279.166l-4.24 4.24zm5.068-5.068l.748-.748A1.567 1.567 0 1013.384 8.4l-.692.693 1.993 1.993c.08.08.136.176.167.278z"
        fill="#1A052F"
      />
    </Svg>
  );
}

export default SvgComponent;
