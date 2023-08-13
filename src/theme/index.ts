import { createTheme } from '@rneui/themed';
const colors = {
  black: 'rgba(26, 5, 47, 1)', // violet 900
  white: 'rgba(255, 255, 255, 1)', // white
  grey0: 'rgba(251, 239, 241, 1)', // beige 50
  grey1: 'rgba(245, 233, 235, 1)', // beige 100
  grey2: 'rgba(227, 211, 214, 1)', // beige 300
  grey3: 'rgba(163, 155, 172, 1)', // violet 300
  grey5: 'rgba(135, 119, 141, 1)', // violet 500
  primary: 'rgba(182, 128, 241, 1)', // purple 400
  error: 'rgba(250, 65, 165, 1)', // pink 400
  warning: 'rgba(253, 193, 128, 1)', // yellow 200
  success: 'rgba(115, 212, 39, 1)', // green 400
};
export const theme = createTheme({
  lightColors: colors,
  darkColors: colors,
  components: {
    Input: {
      containerStyle: {
        height: 72,
        padding: 15,
        paddingBottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderRadius: 16,
      },
      inputContainerStyle: {
        borderBottomWidth: 0,
      },
      inputStyle: {
        fontSize: 16,
        fontWeight: '600',
      },
    },
  },
  mode: 'light',
});
