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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.947.294a.878.878 0 00-1.175.826v.704c.004 1.199.006 2.217-.081 3.132-.103 1.071-.324 1.913-.763 2.625-.35.566-1.074.594-1.457.11-.53-.67-.93-1.45-1.102-1.86a.878.878 0 00-1.246-.422 9.82 9.82 0 00-4.947 8.53c0 5.425 4.398 9.823 9.823 9.823 5.426 0 9.824-4.398 9.824-9.823v-.957c0-3.07-.772-5.736-2.296-7.9-1.523-2.165-3.756-3.77-6.58-4.788z"
        fill="#FA41A5"
      />
    </Svg>
  );
}

export default SvgComponent;
