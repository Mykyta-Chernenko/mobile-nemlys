import { Input, InputProps } from '@rneui/themed';

import React, { Ref, useRef } from 'react';
import { REGULAR_FONT_FAMILY } from './FontText';

const StyledInput = React.forwardRef((props: InputProps, ref?: Ref<any>) => {
  useRef();
  const { style, ...otherProps } = props;
  return (
    <Input
      style={[
        {
          fontFamily: REGULAR_FONT_FAMILY,
        },
        style,
      ]}
      ref={ref}
      {...otherProps}
    />
  );
});

export default StyledInput;
