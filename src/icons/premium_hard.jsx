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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.574 3.248a7.688 7.688 0 00-5.584 1.74 7.546 7.546 0 00-2.7 5.146 7.546 7.546 0 001.766 5.536 7.688 7.688 0 005.196 2.683h.005a7.8 7.8 0 002.944-.327.546.546 0 00.376-.432.537.537 0 00-.225-.526 7.073 7.073 0 01-2.335-2.768 6.99 6.99 0 01-.648-3.547 6.99 6.99 0 011.24-3.377 7.072 7.072 0 012.763-2.326.543.543 0 00.311-.48.539.539 0 00-.295-.49 7.8 7.8 0 00-2.808-.831l-.006-.001z"
        fill="#8DB5F1"
      />
    </Svg>
  );
}

export default SvgComponent;
