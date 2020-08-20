/* eslint no-undef: 0 */ // --> OFF

import React from 'react';
import PropTypes from 'prop-types';
import './App.css';
import ScrollComponent from './ScrollComponent.jsx';

import { withStyles } from '@material-ui/styles';

import {
  AppBar,
  Chip,
  Toolbar,
  Typography,
} from '@material-ui/core';

import {
  Alert,
} from '@material-ui/lab';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  badge: {
    margin: '1rem',
    display: 'inline-block',
    fontSize: 'small',
  },
  right: {
    marginLeft: 'auto',
  },
  topLabels: {
    margin: '0.1rem',
    cursor: 'pointer',
  },
  backdrop: {
    //zIndex: theme.zIndex.drawer + 1,
    //color: '#fff',
  },
  heading: {
  },
});

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      total: undefined,
      labels: [
        'good first issue',
      ]
    };

    this.selectLabel = this.selectLabel.bind(this);
  }

  static defaultProps = {
    classes: {},
    labels: [
      '#starter-task',
      'beginner',
      'beginner friendly',
      'beginners-only',
      'contribution-starter',
      'd: easy',
      'difficulty/1:easy',
      'difficulty/low',
      'difficulty/newcomer',
      'difficulty: easy',
      'documentation',
      'e-easy',
      'easy',
      'easy bug fix',
      'easy-pick',
      'exp/beginner',
      'first time only',
      'first-timers-only',
      'for new contributors',
      'good first bug',
      'good first issue',
      'good first task',
      'good for beginner',
      'good-first-contribution',
      'jump-in',
      'junior job',
      'level:starter',
      'low hanging fruit',
      'low-hanging-fruit',
      'newbie',
      'nice first contribution',
      'starter-issue',
    ]
  };

  static propTypes = {
    classes: PropTypes.object.isRequired,
    labels: PropTypes.object.isRequired,
  };

  componentDidMount() {
    const style1 = document.createElement("link");
    style1.src = "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap";
    style1.rel = "stylesheet";
    document.body.appendChild(style1);

    const style2 = document.createElement("link");
    style2.src = "https://fonts.googleapis.com/icon?family=Material+Icons";
    style2.rel = "stylesheet";
    document.body.appendChild(style2);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/@material-ui/core@v4.4.0/umd/material-ui.production.min.js";
    script.async = true;
    document.body.appendChild(script);
  }

  selectLabel(e) {
    //var selectedLabels = this.state.labels;
    var clickedLabel = e.target.innerText;
    //var index = selectedLabels.indexOf(clickedLabel)

    this.setState(state => ({
      labels: [clickedLabel]
    }));
    this.getData()

    /*if (index > -1) {
      selectedLabels.splice(index, 1);
    } else {
      selectedLabels.push(clickedLabel);
    }

    if (selectedLabels.length > 1) {
      console.log('max');
      return;
    }

    this.setState(state => ({
      labels: selectedLabels
    }));
    this.getData()*/
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">FirstIssues {this.state.total}</Typography>
          </Toolbar>
        </AppBar>
        <Alert severity="info">
          <Typography>Pick max 5 labels</Typography>
          {this.props.labels.map((item, i) => {
            return (<Chip key={i} size="small" onClick={this.selectLabel} variant={this.state.labels.indexOf(item) > -1 ? "default" : "outlined"} color="primary" label={item} className={classes.topLabels} />)
          })}
        </Alert>

        <ScrollComponent labels={this.state.labels} />
      </div>
    );
  }
}

export default withStyles(styles)(App);
