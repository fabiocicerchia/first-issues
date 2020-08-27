/* eslint no-undef: 0 */ // --> OFF

import React from "react";
import PropTypes from "prop-types";
import ScrollComponent from "./ScrollComponent.jsx";
import axios from "axios";
import ls from "local-storage"
import MenuIcon from "@material-ui/icons/Menu";
import GitHubIcon from '@material-ui/icons/GitHub';
import { withStyles } from "@material-ui/styles";
import {
  AppBar,
  Avatar,
  Chip,
  Drawer,
  TextField,
  Toolbar,
  Typography,
  IconButton,
} from "@material-ui/core";
import "./App.css";
import styles from "./styles.js";
import { githubClientId } from "./config.js"

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      total:       undefined,
      projects:    "",
      drawerState: false,
      ready:       false,
      user:        {},
      ghtoken:     "",
      starred:     {},
      label:       "good first issue",
      clientId:    githubClientId,
    };

    // TODO: Uncaught TypeError: Cannot use "in" operator to search for "default" in undefined
    this.selectLabel          = this.selectLabel.bind(this);
    this.handleChangeProjects = this.handleChangeProjects.bind(this);
    this.startLoadingStarred  = this.startLoadingStarred.bind(this);
    this.loadStarred          = this.loadStarred.bind(this);
  }

  static defaultProps = {
    classes: {},
    labels:  [
      "#starter-task",
      "beginner",
      "beginner friendly",
      "beginners-only",
      "contribution-starter",
      "d: easy",
      "difficulty/1:easy",
      "difficulty/low",
      "difficulty/newcomer",
      "difficulty: easy",
      "documentation",
      "e-easy",
      "easy",
      "easy bug fix",
      "easy-pick",
      "exp/beginner",
      "first time only",
      "first-timers-only",
      "for new contributors",
      "good first bug",
      "good first issue",
      "good first task",
      "good for beginner",
      "good-first-contribution",
      "jump-in",
      "junior job",
      "level:starter",
      "low hanging fruit",
      "low-hanging-fruit",
      "newbie",
      "nice first contribution",
      "starter-issue",
    ]
  };

  static propTypes = {
    classes: PropTypes.object.isRequired,
    labels:  PropTypes.array.isRequired,
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

    var urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get("code");
    let state = urlParams.get("state");
    let at = ls.get("at");
    if (at) {
      this.setState(state => ({ ...state,
          ghtoken: at
        }),
        () => {
          this.loadUser(() => {
            this.startLoadingStarred(1, this.state.user);
          })
        }
      );
    } else if (!this.state.ghtoken && code !== "" && state !== "" /*&& state === ls.get("ghstate")*/) {
      let proxy_url = "http://localhost:5000/authenticate";
      axios
        .post(proxy_url, {"code": code, "redirect_uri": document.location.href})
        .then(data => {
          ls.set('at', data.data.at);
          ls.set('rt', data.data.rt);
          this.setState(state => ({ ...state,
              ghtoken: data.data.at
            }),
            () => {
              this.loadUser(() => {
                this.startLoadingStarred(1, this.state.user);
              })
            }
          );
        })
        .catch(error => {
          this.setState(state => ({ ...state, ghtoken: "" }));
          console.error(error);
        });
    }
  }

  getToday() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;
    return yyyy + "-" + mm + "-" + dd;
  }

  loadUser(callback) {
    axios
      .get(`https://api.github.com/user`, {
          headers: {
            "Authorization": `token ${this.state.ghtoken}`,
          }
      })
      .then(res => {
        let userData = {
          name:     res.data.name,
          avatar:   res.data.avatar_url,
          username: res.data.login,
        };
        this.setState(state => ({ ...state,
          user: userData,
        }));

        callback();
      })
      .catch(error => {
        console.error(error);
      });
  }

  startLoadingStarred(page, userData) {
    this.loadStarred(page, userData.username);
  }

  loadStarred(page, username) {
    let storedData = ls.get("loadStarred")
    let lastDate = ls.get("lastDateLoadStarred")
    let today = this.getToday();
    if (storedData !== null && lastDate === today) {
        var projects = [];
        Object.values(storedData).forEach(function(item) {
          projects.push(item.full_name);
        });
        projects = projects.splice(0, 150); // TODO: MAX 200?

        this.setState(state => ({ ...state,
          starred:  storedData,
          projects: projects.join(" "),
          ready:    !state.ready,
        }));

        return;
    }

    const url = `https://api.github.com/users/${username}/starred?per_page=100&page=${page}`;
    axios
      .get(url, {
          headers: {
            "Authorization": `token ${this.state.ghtoken}`,
          }
      })
      .then(res => {
        var starred = [];
        var projects = [];
        res.data.forEach(function(item) {
          projects.push(item.full_name);

          starred[item.full_name] = {
            name:              item.name,
            full_name:         item.full_name,
            html_url:          item.html_url,
            description:       item.description,
            logo:              item.owner.avatar_url,
            stargazers_count:  item.stargazers_count,
            watchers_count:    item.watchers_count,
            language:          item.language,
            forks_count:       item.forks_count,
            open_issues_count: item.open_issues_count,
            license:           item.license,
            forks:             item.forks,
            watchers:          item.watchers,
          }
        });

        let merged = Object.assign(this.state.starred, starred);
        this.setState(state => ({ ...state,
          starred: merged,
          projects: this.state.projects + " " + projects.join(" "),
        }));

        if (Object.keys(starred).length === 100) {
          this.loadStarred(page + 1, username);
        } else {
          ls.set("loadStarred", merged)
          ls.set("lastDateLoadStarred", today)
          this.setState(state => ({ ...state, ready: true }));
        }
      });
  }

  selectLabel(e) {
    var clickedLabel = e.target.innerText;

    this.setState(state => ({ ...state,
      label: clickedLabel
    }));
  }

  handleChangeProjects(event) {
    this.setState(state => ({ ...state, projects: event.target.value }));
  }

  toggleDrawer(open) {
    return (event) => {
      if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
        return;
      }

      this.setState(state => ({ ...state, drawerState: open }));
    };
  }

  rand() {
    return Math.random().toString(36).substr(2); // remove `0.`
  }

  token() {
    return this.rand() + this.rand(); // to make it longer
  }

  render() {
    const { classes } = this.props;

    let userButton = <GitHubIcon />
    if (this.state.user) {
      userButton = <Avatar alt={this.state.user.name} src={this.state.user.avatar} className={classes.small} />
    }

    if (!this.state.ghtoken) {
      ls.set("ghstate", this.token());
    }
    let state = ls.get("ghstate");
    let ghlogin = `https://github.com/login/oauth/authorize?client_id=${this.state.clientId}&state=${state}&redirect_uri=http://localhost:3000/first-issues`;

    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={this.toggleDrawer(!this.state.drawerState)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.heading}>FirstIssues {this.state.total}</Typography>
            <IconButton className={classes.account} color="inherit" onClick={()=> window.open(ghlogin, "_self")}>
              {userButton}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Drawer anchor="left" open={this.state.drawerState} onClose={this.toggleDrawer(false)} className={classes.drawer}>
          <TextField multiline label="Select your favourite projects" rowsMax={4} className={classes.textarea} value={this.state.projects} onChange={this.handleChangeProjects} />
          {this.props.labels.map((item, i) => {
            let variant = this.state.label === item ? "default" : "outlined"
            return (<Chip key={i} size="small" onClick={this.selectLabel} variant={variant} color="primary" label={item} className={classes.topLabels} />)
          })}
        </Drawer>

        <ScrollComponent ghtoken={this.state.ghtoken} ready={this.state.ready} projects={this.state.projects} label={this.state.label} starred={this.state.starred} />
      </div>
    );
  }
}

export default withStyles(styles)(App);
