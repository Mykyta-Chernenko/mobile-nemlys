import { createTheme } from '@rneui/themed';

export const theme = createTheme({
  lightColors: {
    primary: 'rgb(108, 99, 255)',
    secondary: 'rgba(108, 99, 255, 0.5)',
  },
  mode: 'light',
  components: {
    Button: {
      radius: 'md',
    },
  },
});
