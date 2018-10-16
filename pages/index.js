import React from "react";
import * as queryString from "query-string";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import NoteIcon from "@material-ui/icons/Note";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Input from "@material-ui/core/Input";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import CardHeader from "@material-ui/core/CardHeader";
import Card from "@material-ui/core/Card";
import Collapse from "@material-ui/core/Collapse";
import CardContent from "@material-ui/core/CardContent";
import LineProgress from "@material-ui/core/LinearProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContentText from "@material-ui/core/DialogContentText";

const styles = {
  root: {
    maxWidth: "960px",
    margin: "0 auto"
  },
  main: {
    paddingLeft: "24px",
    paddingRight: "24px"
  },
  toolbar: {
    display: "flex"
  },
  toolbarButtons: {
    marginLeft: "auto"
  },
  formWrapper: {
    margin: "auto"
  },
  form: {
    width: "100%"
  },
  card: {
    marginTop: "12px"
  },
  cardHeader: {
    paddingBottom: "2px"
  },
  cardContent: {
    paddingTop: "0"
  },
  buttonBar: {
    marginLeft: "-8px",
    marginTop: "24px"
  },
  button: {
    margin: "8px"
  },
  errorMsg: {
    color: "#f44336",
    marginTop: "24px",
    fontSize: "1.2rem"
  }
};

const cardsConfig = [
  {
    title: "请求头",
    key: "headers",
    helperText: "格式 <key>: <value>"
  },
  {
    title: "请求体",
    key: "body"
  },
  {
    title: "响应头",
    key: "resHeaders"
  },
  {
    title: "响应体",
    key: "resBody"
  },
  {
    title: "备注",
    key: "note",
    helperText: "用来报告更细致的信息，如执行上下文、问题来源推测"
  }
];

class Index extends React.Component {
  state = {
    fetching: false,
    errorMsg: "",
    form: {
      method: "POST",
      uri: "https://postman-echo.com/post",
      headers: "Content-Type: application/json",
      body: `{"key": "value"}`,
      resHeaders: "",
      resBody: "",
      note: ""
    },
    shareId: "",
    showShareDialog: false,
    collapse: {
      reqHeaders: false,
      reqBody: false,
      resHeaders: true,
      resBody: true,
      note: true
    }
  };

  static getInitialProps(ctx) {
    return { shareData: ctx.query.shareData };
  }

  componentDidMount() {
    const { shareData } = this.props;
    if (shareData) {
      const { form, collapse } = JSON.parse(shareData);
      this.setState({
        form: { ...form },
        collapse: {
          ...collapse,
          resBody: !form.resBody,
          note: !form.note
        }
      });
    }
  }

  handleCollapseChange = kind => {
    this.setState({
      collapse: {
        ...this.state.collapse,
        [kind]: !this.state.collapse[kind]
      }
    });
  };

  handleFormFieldChange = event => {
    this.setState({
      errorMsg: "",
      form: {
        ...this.state.form,
        [event.target.name]: event.target.value
      }
    });
  };

  handleShareDialogClose = () => {
    this.setState({ showShareDialog: false });
  };

  handleSendButtonClick = () => {
    const { uri, method, headers, body } = this.state.form;
    const baseUrl = this.getBaseUrl();

    try {
      new URL(uri);
    } catch (err) {
      this.setState({ errorMsg: "无效 URL" });
      return;
    }

    const headersObj = headers.split("\n").reduce((r, c) => {
      const [k, v] = c.split(":");
      r[k.trim()] = (v || "").trim();
      return r;
    }, {});

    this.setState({ fetching: true });
    fetch(baseUrl + "/api/proxy", {
      method: "POST",
      body: JSON.stringify({
        uri,
        method,
        headers: headersObj,
        body
      })
    })
      .then(res => {
        res.json().then(data => {
          const resBody = data.body;
          const resHeaders = Object.keys(data.headers).reduce((r, c) => {
            r += `${c}: ${data.headers[c]}\n`;
            return r;
          }, "");

          this.setState({
            fetching: false,
            errorMsg: "",
            shareId: "",
            form: {
              ...this.state.form,
              resHeaders,
              resBody
            },
            collapse: {
              ...this.state.collapse,
              resBody: !resBody
            }
          });
        });
      })
      .catch(this.handleFetchError);
  };

  handleShareButtonClick = () => {
    const baseUrl = this.getBaseUrl();
    const { form, collapse } = this.state;

    if (this.state.shareId) {
      this.setState({ showShareDialog: true });
      return;
    }

    this.setState({ fetching: true });

    fetch(baseUrl + "/api/share", {
      method: "POST",
      body: JSON.stringify({ form, collapse })
    })
      .then(res => {
        this.setState({ fetching: true });
        res.json().then(({ id }) => {
          this.setState({
            fetching: false,
            errorMsg: "",
            showShareDialog: true,
            shareId: id
          });
        });
      })
      .catch(this.handleFetchError);
  };

  handleFetchError = err => {
    this.setState({ errorMsg: err.message, fetching: false });
  };

  getBaseUrl = () => {
    if (this.baseUrl) return this.baseUrl;
    this.baseUrl =
      location.protocol +
      "//" +
      location.hostname +
      (location.port ? ":" + location.port : "");
    return this.baseUrl;
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="h6" color="inherit">
            Trisue
          </Typography>
          <div className={classes.toolbarButtons}>
            <IconButton className={classes.iconButton} title="导入 CURL">
              <NoteIcon />
            </IconButton>
          </div>
        </Toolbar>
        <div className="main" className={classes.main}>
          {this.state.fetching && <LineProgress />}
          <Grid container className={classes.formWrapper}>
            <form className={classes.form}>
              <Grid container alignItems="center">
                <FormControl style={{ width: "20%" }}>
                  <Select
                    value={this.state.form.method}
                    onChange={this.handleFormFieldChange}
                    inputProps={{
                      name: "method",
                      id: "method"
                    }}
                  >
                    <MenuItem value="GET">GET</MenuItem>
                    <MenuItem value="POST">POST</MenuItem>
                    <MenuItem value="PUT">PUT</MenuItem>
                    <MenuItem value="DELETE">DELETE</MenuItem>
                  </Select>
                </FormControl>
                <FormControl style={{ width: "80%" }}>
                  <Input
                    name="uri"
                    placeholder="URI"
                    value={this.state.form.uri}
                    onChange={this.handleFormFieldChange}
                  />
                </FormControl>
              </Grid>
              {cardsConfig.map(item => {
                const isCollapsed = this.state.collapse[item.key];
                return (
                  <Card key={item.key} className={classes.card}>
                    <CardHeader
                      className={classes.cardHeader}
                      action={
                        <IconButton
                          onClick={() => this.handleCollapseChange(item.key)}
                        >
                          {isCollapsed ? (
                            <ExpandMoreIcon />
                          ) : (
                            <ExpandLessIcon />
                          )}
                        </IconButton>
                      }
                      title={
                        <div style={{ fontSize: "1.4rem" }}>{item.title}</div>
                      }
                    />
                    <Collapse in={!isCollapsed} timeout="auto">
                      <CardContent className={classes.cardContent}>
                        <FormControl fullWidth>
                          <TextField
                            onChange={this.handleFormFieldChange}
                            name={item.key}
                            value={this.state.form[item.key]}
                            multiline
                            helperText={item.helperText || ""}
                            margin="normal"
                            variant="outlined"
                          />
                        </FormControl>
                      </CardContent>
                    </Collapse>
                  </Card>
                );
              })}
            </form>
          </Grid>
          {this.state.errorMsg && (
            <div className={classes.errorMsg}>{this.state.errorMsg}</div>
          )}
          <div className={classes.buttonBar}>
            <Button
              variant="contained"
              className={classes.button}
              onClick={this.handleSendButtonClick}
            >
              Send
            </Button>
            <Button
              variant="contained"
              className={classes.button}
              onClick={this.handleShareButtonClick}
            >
              Share
            </Button>
          </div>
          {process.browser && (
            <Dialog
              open={this.state.showShareDialog}
              onClose={this.handleShareDialogClose}
            >
              <DialogTitle>{"分享"}</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  {this.getBaseUrl() + "/?shareId=" + this.state.shareId}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleShareDialogClose} color="primary">
                  关闭
                </Button>
              </DialogActions>
            </Dialog>
          )}
        </div>
      </div>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
  shareData: PropTypes.string
};

export default withStyles(styles)(Index);
