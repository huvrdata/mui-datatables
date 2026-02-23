import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from '../utils/layout';
import { makeStyles } from 'tss-react/mui';
import allExamples from '../../examples/examples';

const useStyles = makeStyles()(theme => ({
  container: {
    marginTop: theme.spacing(2),
  },
  card: {
    cursor: 'pointer',
    '&:hover': {
      background: theme.palette.grey[200],
    },
  },
  cardContent: {
    '&:last-child': {
      padding: theme.spacing(1),
    },
  },
  backButton: {
    marginBottom: theme.spacing(2),
  },
  search: {
    marginBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

function toSlug(name) {
  return name.replace(/\s+/g, '-').toLowerCase();
}

function ExamplesPage() {
  const { classes } = useStyles();
  const [selected, setSelected] = useState(null);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const match = Object.keys(allExamples).find(k => toSlug(k) === hash);
      if (match) setSelected(match);
    }

    const onHashChange = () => {
      const h = window.location.hash.replace('#', '');
      if (!h) {
        setSelected(null);
      } else {
        const m = Object.keys(allExamples).find(k => toSlug(k) === h);
        if (m) setSelected(m);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleSelect = name => {
    window.location.hash = toSlug(name);
    setSelected(name);
  };

  const handleBack = () => {
    window.location.hash = '';
    setSelected(null);
  };

  if (selected) {
    const ExampleComponent = allExamples[selected];
    return (
      <Layout>
        <Button
          className={classes.backButton}
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
          size="small">
          Back to Examples
        </Button>
        <Typography variant="h5" gutterBottom>
          {selected}
        </Typography>
        <ExampleComponent />
      </Layout>
    );
  }

  const sortedKeys = Object.keys(allExamples)
    .sort()
    .filter(k => !searchVal || k.toLowerCase().includes(searchVal.toLowerCase()));

  return (
    <Layout>
      <Typography variant="h5" align="center" gutterBottom>
        Examples
      </Typography>
      <Typography variant="subtitle2" align="center" gutterBottom>
        {sortedKeys.length} examples
      </Typography>
      <div className={classes.search}>
        <TextField
          placeholder="Search examples..."
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          size="small"
        />
      </div>
      <Grid container className={classes.container} spacing={1}>
        {sortedKeys.map(label => (
          <Grid key={label} item xs={6} sm={4} md={3}>
            <Card className={classes.card} onClick={() => handleSelect(label)}>
              <CardContent className={classes.cardContent}>
                <Typography variant="subtitle2" align="center">
                  {label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}

export default ExamplesPage;
