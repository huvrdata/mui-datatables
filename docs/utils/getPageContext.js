import { createTheme } from '@mui/material/styles';
import purple from '@mui/material/colors/purple';
import green from '@mui/material/colors/green';
import createEmotionCache from './createEmotionCache';

// A theme with custom primary and secondary color.
// It's optional.
const theme = createTheme({
  palette: {
    primary: purple,
    secondary: green,
  },
});

export default function getPageContext() {
  return {
    theme,
    // This is needed in order to deduplicate the injection of CSS in the page.
    emotionCache: createEmotionCache(),
  };
}
