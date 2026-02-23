import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DownloadIcon from '@mui/icons-material/CloudDownload';
import BuildIcon from '@mui/icons-material/Build'; // eslint-disable-line import/no-unresolved
import CodeSnippet from '../utils/CodeSnippet';
import Layout from '../utils/layout';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  stepIcon: {
    fontSize: '30px',
    marginRight: theme.spacing(2),
  },
  stepWrapper: {
    marginTop: theme.spacing(4),
    display: 'flex',
    alignItems: 'center',
  },
  mainImage: {
    maxWidth: '100%',
  },
}));

function Homepage() {
  const { classes } = useStyles();

  return (
    <Layout>
      <div>
        <p>
          MUI-Datatables is a data tables component built on <a href="https://mui.com">Material-UI V5 / V6</a>. It comes
          with features like filtering, view/hide columns, search, export to CSV download, printing, selectable rows,
          pagination, and sorting. On top of the ability to customize styling on most views, there are several
          responsive modes for mobile/tablet devices.
        </p>
        <img
          src="/static/mui-datatables-main.jpg"
          className={classes.mainImage}
          border="0"
          alt="The look of the component"
        />

        <div className={classes.stepWrapper}>
          <DownloadIcon className={classes.stepIcon} />
          <Typography variant="h6">Installation</Typography>
        </div>
        <CodeSnippet withMargin language={'bash'} text={`npm install mui-datatables --save`} />

        <div className={classes.stepWrapper}>
          <BuildIcon className={classes.stepIcon} />
          <Typography variant="h6">Usage</Typography>
        </div>
        <CodeSnippet
          language={'jsx'}
          text={`import MUIDataTable from "mui-datatables";

const columns = ["Name", "Company", "City", "State"];

const data = [
 ["Joe James", "Test Corp", "Yonkers", "NY"],
 ["John Walsh", "Test Corp", "Hartford", "CT"],
 ["Bob Herm", "Test Corp", "Tampa", "FL"],
 ["James Houston", "Test Corp", "Dallas", "TX"],
];

const options = {
  filterType: 'checkbox',
};

<MUIDataTable 
  title={"Employee List"} 
  data={data} 
  columns={columns} 
  options={options} 
/>`}
        />
      </div>
    </Layout>
  );
}

export default Homepage;
