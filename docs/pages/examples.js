import React from 'react';
import examples from '../../examples/examples';
import Layout from '../utils/layout';
import { withStyles } from 'tss-react/mui';

const styles = theme => ({
  root: {
    padding: theme.spacing(3),
  },
  exampleContainer: {
    marginBottom: theme.spacing(4),
  },
});

class ExamplesPage extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <Layout>
        <div className={classes.root}>
          <h1>Examples</h1>
          {Object.entries(examples).map(([name, Component]) => (
            <div key={name} className={classes.exampleContainer}>
              <h2>{name}</h2>
              <Component />
            </div>
          ))}
        </div>
      </Layout>
    );
  }
}

export default withStyles(ExamplesPage, styles);
