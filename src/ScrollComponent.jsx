import React, { Component } from "react";
import axios from "axios";
import styles from "./styles.js";
import PropTypes from "prop-types";
import {
  Accordion,
  AccordionSummary,
  Avatar,
  Badge,
  Grid,
  Typography,
  Tooltip,
} from "@material-ui/core";
import StarIcon from "@material-ui/icons/Star";
import CallSplitIcon from "@material-ui/icons/CallSplit";
import BugReportIcon from "@material-ui/icons/BugReport";
import QuestionAnswerIcon from "@material-ui/icons/QuestionAnswer";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { withStyles } from "@material-ui/styles";

class ScrollComponent extends Component {
  constructor(props) {
    super();

    this.state = {
      data:     [],
      ready:    false,
      label:    props.label || "",
      projects: props.projects || "",
      starred:  props.starred || {},
      loading:  false,
      ghtoken:  false,
      page:     0,
      prevY:    0,
      cancelTokenSource: undefined,
    };
  }

  static propTypes = {
    classes: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    projects: PropTypes.string.isRequired,
    ghtoken: PropTypes.string.isRequired,
    starred: PropTypes.object.isRequired,
  };

  static getDerivedStateFromProps(nextProps, prevState){
    if (
      nextProps.label !== prevState.label
      || nextProps.projects !== prevState.projects
      || nextProps.starred !== prevState.starred
      || nextProps.ready !== prevState.ready
      || nextProps.ghtoken !== prevState.ghtoken
    ) {
      return {
        label:    nextProps.label,
        projects: nextProps.projects,
        starred:  nextProps.starred,
        ready:    nextProps.ready,
        ghtoken:  nextProps.ghtoken,
      };
    }
    else return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.label !== prevProps.label
      || this.props.projects !== prevProps.projects
      || this.props.starred !== prevProps.starred
      || this.props.ready !== prevProps.ready
      || this.props.ghtoken !== prevProps.ghtoken
    ) {
      this.setState(state => ({ ...state,
          label:    this.props.label,
          projects: this.props.projects,
          starred:  this.props.starred,
          ready:    this.props.ready,
          ghtoken:  this.props.ghtoken,
        }),
        () => {
          if (this.props.ready) {
            this.getData(this.state.page);
          }
        }
      );
    }
  }

  handleObserver(entities, observer) {
    const y = entities[0].boundingClientRect.y;
    if (this.state.data.length > 0 && this.state.prevY > y) {
      const lastItem = this.state.data[this.state.data.length - 1];
      const curPage = lastItem.page;
      this.getData(curPage+1);
      this.setState(state => ({ ...state, page: curPage+1 }));
    }
    this.setState(state => ({ ...state, prevY: y }));
  }

  componentDidMount() {
    var options = {
      root:       null,
      rootMargin: "0px",
      threshold:  1.0
    };

    this.observer = new IntersectionObserver(
      this.handleObserver.bind(this),
      options
    );
    this.observer.observe(this.loadingRef);
  }

  getData(page) {
    if (this.state.ghtoken === "" || this.state.ghtoken === null) return;
    
    this.setState(state => ({ ...state, loading: true }));

    const query = [
      encodeURIComponent("is:issue"),
      encodeURIComponent("state:open"),
      encodeURIComponent("label:\""+this.state.label+"\""),
      this.state.projects.split(/ /).map(x => encodeURIComponent("repo:")+x).join("+"),
    ].join("+");
    const sort = "updated";
    const order = "desc";

    const url = `https://api.github.com/search/issues?q=${query}&sort=${sort}&order=${order}&per_page=100&page=${page}`;

    if (this.state.cancelTokenSource) {
      this.state.cancelTokenSource.cancel();
    }
    let axiosToken = axios.CancelToken.source();
    this.setState(state => ({ ...state,
      cancelTokenSource: axiosToken,
    }));

    axios
      .get(url, {
        cancelToken: axiosToken.token,
        headers: {
          "Authorization": `token ${this.state.ghtoken}`,
        }
      })
      .catch(function (thrown) {
        if (axios.isCancel(thrown)) {
          console.log("Request canceled", thrown.message);
        }
      })
      .then(res => {
        if (res === undefined) return;
        var issues = [];
        var starred = this.state.starred;

        res.data.items.forEach(function(item) {
          let project = item.repository_url.replace(/https:\/\/api.github.com\/repos\//, "")
          issues.push({
            page:     page,
            title:    item.title,
            details:  item.body,
            link:     item.html_url,
            project:  project,
            logo:     typeof starred[project] !== "undefined" ? starred[project].logo : project[0].toUpperCase(),
            stars:    typeof starred[project] !== "undefined" ? starred[project].stargazers_count : undefined,
            forks:    typeof starred[project] !== "undefined" ? starred[project].forks : undefined,
            issues:   typeof starred[project] !== "undefined" ? starred[project].open_issues_count : undefined,
            comments: item.comments,
            watchers: typeof starred[project] !== "undefined" ? starred[project].watchers : undefined,
          });
        });

        this.setState(state => ({ ...state,
          total: res.data.total_count,
          data:  [...this.state.data, ...issues]
        }));

        this.setState(state => ({ ...state, loading: false }));
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
              >
                  <Grid container className={classes.root} spacing={1}>
                    <Grid item>
                        <Tooltip title={item.project}>
                          <Avatar alt={item.project} src={item.logo} />
                        </Tooltip>
                    </Grid>
                    <Grid item className={classes.issueTitle}>
                      <Typography onClick={()=> window.open(item.link, "_blank")}>
                        {item.title}
                      </Typography>
                    </Grid>
                    <Grid item className={classes.right}>
                        <Tooltip title="Stars"><Badge showZero badgeContent={item.stars} color="primary" className={classes.badge}><StarIcon fontSize="small" /></Badge></Tooltip>
                        <Tooltip title="Forks"><Badge showZero badgeContent={item.forks} color="primary" className={classes.badge}><CallSplitIcon fontSize="small" /></Badge></Tooltip>
                        <Tooltip title="Total Issues"><Badge showZero badgeContent={item.issues} color="primary" className={classes.badge}><BugReportIcon fontSize="small" /></Badge></Tooltip>
                        {/*<Tooltip title="PRs"><Badge showZero badgeContent={item.pullrequests} color="primary" className={classes.badge}><LibraryBooksIcon fontSize="small" /></Badge></Tooltip>*/}
                        <Tooltip title="# Comments"><Badge showZero badgeContent={item.comments} color="primary" className={classes.badge}><QuestionAnswerIcon fontSize="small" /></Badge></Tooltip>
                        <Tooltip title="# Watches"><Badge showZero badgeContent={item.watchers} color="primary" className={classes.badge}><VisibilityIcon fontSize="small" /></Badge></Tooltip>
                    </Grid>
                  </Grid>
              </AccordionSummary>
            </Accordion>)
          })}
        </div>
        <div ref={loadingRef => (this.loadingRef = loadingRef)} style={loadingCSS}>
          <span style={loadingTextCSS}>Loading...</span>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ScrollComponent);
