import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-bash';
import Paper from '@mui/material/Paper';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(theme => ({}));

function CodeSnippet({ language, text }) {
  const { classes } = useStyles();
  const hightlightedCode = prism.highlight(text, prism.languages[language]);

  return (
    <Paper elevation={4}>
      <pre>
        <code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: hightlightedCode }} />
      </pre>
    </Paper>
  );
}

CodeSnippet.propTypes = {
  language: PropTypes.string,
  text: PropTypes.string.isRequired,
};

CodeSnippet.defaultProps = {
  language: 'jsx',
};

export default CodeSnippet;
