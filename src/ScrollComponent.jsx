import React, { Component } from "react";
import axios from "axios";
import PropTypes from 'prop-types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Badge,
  Chip,
  Grid,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import StarIcon from '@material-ui/icons/Star';
import CallSplitIcon from '@material-ui/icons/CallSplit';
import BugReportIcon from '@material-ui/icons/BugReport';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import VisibilityIcon from '@material-ui/icons/Visibility';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import { withStyles } from '@material-ui/styles';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  badge: {
    margin: '1rem',
    display: 'inline-block',
    fontSize: 'small',
  },
  issueTitle: {
    width: '85%',
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

class ScrollComponent extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    labels: PropTypes.object.isRequired,
  };
  constructor() {
    super();
    this.state = {
      data: [],
      loading: false,
      page: 0,
      prevY: 0
    };
  }

  handleObserver(entities, observer) {
    const y = entities[0].boundingClientRect.y;
    if (this.state.prevY > y) {
      const lastItem = this.state.data[this.state.data.length - 1];
      const curPage = lastItem.page;
      this.getData(curPage+1);
      this.setState({ page: curPage+1 });
    }
    this.setState({ prevY: y });
  }

  componentDidMount() {
    this.getData(this.state.page);

    var options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0
    };
    
    this.observer = new IntersectionObserver(
      this.handleObserver.bind(this),
      options
    );
    this.observer.observe(this.loadingRef);
  }

  getData(page) {
    this.setState({ loading: true });

    const query = 'state%3Aopen+'+this.props.labels.map(x => encodeURIComponent("label: "+x)).join('+');
    const sort = 'updated';
    const order = 'desc';

    const url = `https://api.github.com/search/issues?q=${query}&sort=${sort}&order=${order}&per_page=100&page=${page}`;
    axios
      .get(url)
      .then(res => {
        var issues = [];
        
        res.data.items.forEach(function(item) {
          let project = item.repository_url.replace(/https:\/\/api.github.com\/repos\//, "")
          issues.push({
            page: page,
            title: item.title,
            details: item.body,
            link: item.html_url,
            project: project,
            logo: project[0].toUpperCase(),
            //stars: 12,
            //forks: 12,
            //issues: 12,
            //pullrequests: 12,
            comments: item.comments,
            //watchers: 12,
          });
        });
        
        this.setState({
          total: res.data.total_count,
          data: [...this.state.data, ...issues]
        });

        this.setState({ loading: false });
      });
  }

  render() {
    const { classes } = this.props;

    // Additional css
    const loadingCSS = {
      height: "100px",
      margin: "30px"
    };

    // To change the loading icon behavior
    const loadingTextCSS = { display: this.state.loading ? "block" : "none" };

    return (
      <div className="container">
        <div style={{ minHeight: "200px" }}>
          {this.state.data.map((item, i) => {
            return (<Accordion key={i}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                  <Grid container className={classes.root} spacing={1}>
                    <Grid item>
                        <Avatar alt={item.project} src={item.logo} />
                    </Grid>
                    <Grid item className={classes.issueTitle}>
                      <Typography className={classes.heading}>
                        [{item.project}] {item.title}
                      </Typography>
                    </Grid>
                    <Grid item className={classes.right}>
                        {/*<Badge badgeContent={item.stars} color="primary" className={classes.badge}><StarIcon fontSize="small" /></Badge>*/}
                        {/*<Badge badgeContent={item.forks} color="primary" className={classes.badge}><CallSplitIcon fontSize="small" /></Badge>*/}
                        {/*<Badge badgeContent={item.issues} color="primary" className={classes.badge}><BugReportIcon fontSize="small" /></Badge>*/}
                        {/*<Badge badgeContent={item.pullrequests} color="primary" className={classes.badge}><LibraryBooksIcon fontSize="small" /></Badge>*/}
                        <Badge badgeContent={item.comments} color="primary" className={classes.badge}><QuestionAnswerIcon fontSize="small" /></Badge>
                        {/*<Badge badgeContent={item.watchers} color="primary" className={classes.badge}><VisibilityIcon fontSize="small" /></Badge>*/}
                    </Grid>
                  </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{item.details}</Typography>
                <Typography>{item.link}</Typography>
              </AccordionDetails>
            </Accordion>)
          })}
        </div>
        <div
          ref={loadingRef => (this.loadingRef = loadingRef)}
          style={loadingCSS}
        >
          <span style={loadingTextCSS}>Loading...</span>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ScrollComponent);
