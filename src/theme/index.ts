import { createTheme } from '@rneui/themed';

export const theme = createTheme({
  lightColors: {
    black: 'rgba(26, 5, 47, 1)', // violet 900
    white: 'rgba(255, 255, 255, 1)', // white
    grey0: 'rgba(251, 239, 241, 1)', // beige 40
    grey1: 'rgba(245, 233, 235, 1)', // beige 100
    grey2: 'rgba(227, 211, 214, 1)', // beige 300
    grey3: 'rgba(163, 155, 172, 1)', // violet 300
  },
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
