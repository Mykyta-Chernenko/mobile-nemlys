import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={21}
      height={21}
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M14.672 16.669l-8.39-.734c-1.176-.103-2.235-.604-2.982-1.41a3.982 3.982 0 01-1.046-3.094c.103-1.177.624-2.154 1.506-2.826.695-.53 1.607-.851 2.597-.92a5.054 5.054 0 011.638-1.92 4.724 4.724 0 013.15-.82 4.981 4.981 0 013.337 1.683c.8.915 1.266 2.098 1.36 3.442 1.571.374 3.04 1.588 2.866 3.579-.094 1.075-.566 1.922-1.366 2.45-.702.464-1.625.661-2.67.57z"
        fill="#FDC180"
      />
    </Svg>
  );
}

export default SvgComponent;
