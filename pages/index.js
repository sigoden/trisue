import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import NoteIcon from "@material-ui/icons/Note";
import HistoryIcon from "@material-ui/icons/History";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import FormatIndentIncreaseIcon from "@material-ui/icons/FormatIndentIncrease";
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
import Router from 'next/router'
import CopyToClipboard from "./components/CopyToClipboard";
import parseCurl from "../lib/parseCurl";
import buildCurl from "../lib/buildCurl";
import xmlBeautify from "xml-beautifier";
import Storage from "../lib/Storage";

const styles = {
  root: {
    maxWidth: "960px",
    margin: "0 auto"
  },
  mainContent: {
    paddingLeft: "24px",
    paddingRight: "24px"
  },
  headerBar: {
    display: "flex"
  },
  headerBarBtns: {
    marginLeft: "auto"
  },
  mainForm: {
    width: "100%"
  },
  formFieldCard: {
    marginTop: "12px"
  },
  formCardHeader: {
    paddingBottom: "2px"
  },
  formCardContent: {
    paddingTop: "0"
  },
  resStatusCard: {
    marginTop: "12px",
    paddingBottom: "12px"
  },
  resStatusText: {
    marginRight: "10px",
    marginTop: "10px",
    fontSize: "1.4rem"
  },
  mainFormButtonBars: {
    marginLeft: "-8px",
    marginTop: "24px"
  },
  mainFormButton: {
    margin: "8px"
  },
  formatButton: {
    position: "absolute",
    zIndex: "99",
    right: 0,
    top: "16px"
  },
  errorAlert: {
    color: "#f44336",
    marginTop: "24px",
    fontSize: "1.2rem"
  }
};

class Index extends React.Component {
  state = {
    fetching: false,
    errorMsg: "",
    form: {
      method: "POST",
      uri: "https://httpbin.org/anything",
      headers: "Content-Type: application/json",
      body: `{"key": "value"}`,
      resHeaders: "",
      resBody: "",
      resBodyOrigin: "",
      resStatus: 0,
      note: ""
    },
    fetched: false,
    shareId: "",
    curlText: "",
    exportCurlText: "",
    shareUrl: "",
    showShareDialog: false,
    showExportCurlDialog: false,
    showImportDialog: false,
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
  componentWillMount() {
    const storage = new Storage()
    this.setState({ storage });
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
      if (typeof (location) !== "undefined") {
        const { shareId: id } = parseQuery(location.search);
        const { uri, method } = form;
        this.state.storage.add(id, { uri, method });
      }
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

  handleDialogClose = key => {
    this.setState({
      [key]: false,
    });
  };

  handleExportCurlButtonClick = () => {
    const { uri, method, headers, body } = this.state.form;
    const exportCurlText = buildCurl({ uri, method, headers: this.parseHeaders(headers), body });
    this.setState({
      exportCurlText,
      showExportCurlDialog: true,
    });
  }

  parseHeaders = headers => {
    return headers.split("\n").filter(l => l !== "").reduce((r, c) => {
      const sepIndex = c.indexOf(":");
      const k = c.slice(0, sepIndex);
      const v = c.slice(sepIndex + 1);
      r[k.trim()] = (v || "").trim();
      return r;
    }, {});
  }

  handleSendButtonClick = () => {
    const { uri, method, headers, body } = this.state.form;
    const baseUrl = this.getBaseUrl();

    try {
      new URL(uri);
    } catch (err) {
      this.setState({ errorMsg: "无效 URL" });
      return;
    }


    this.setState({ fetching: true });
    const reqObj = {
      uri,
      method,
      headers,
      body
    };
    fetch(baseUrl + "/api/proxy", {
      method: "POST",
      body: JSON.stringify({ ...reqObj, headers: this.parseHeaders(headers) })
    })
      .then(res => {
        return res.json().then(data => {
          if (data.err) {
            return Promise.reject(new Error(data.err));
          }
          const resStatus = data.status;
          const resBody = data.body;
          const resHeaders = Object.keys(data.headers || {}).reduce((r, c) => {
            r += `${c}: ${data.headers[c]}\n`;
            return r;
          }, "");

          this.setState({
            fetching: false,
            errorMsg: "",
            fetched: true,
            shareId: "",
            form: {
              ...this.state.form,
              resHeaders,
              resBody,
              resStatus
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

    const shareUrlBase = this.getBaseUrl() + "/?shareId=";
    if (this.state.shareId) {
      this.setState({
        showShareDialog: true,
        shareUrl: shareUrlBase + this.state.shareId,
      });
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
          const { method, uri } = this.state.form;
          this.setState({
            fetching: false,
            errorMsg: "",
            showShareDialog: true,
            shareUrl: shareUrlBase + id,
            shareId: id
          });
          this.state.storage.add(id, { method, uri });
        });
      })
      .catch(this.handleFetchError);
  };

  hanleInputButtonClick = () => {
    this.state({ showImportDialog: true });
  };

  handleImportButtonClick = () => {
    const { curlText } = this.state;
    if (!curlText) return;
    const { uri, headers, body, method } = parseCurl(curlText);
    this.setState({
      form: {
        ...this.state.form,
        uri,
        method,
        headers: headers.join("\n"),
        body,
        curlText: "",
        resBody: "",
        resHeaders: "",
        resStatus: 0
      },
      showImportDialog: false
    });
  };

  handleUrlFieldChange = event => {
    this.setState({ curlText: event.target.value });
  };

  toggleImportDialog = () => {
    const { showImportDialog } = this.state;
    this.setState({ showImportDialog: !showImportDialog });
  };

  handleFetchError = err => {
    this.setState({ errorMsg: err.message, fetching: false });
  };

  handleResBodyFormatButtonClick = type => {
    if (!type) return;
    if (!this.state.fetched && this.state.form.resBodyOrigin) {
      this.setState({
        form: {
          ...this.state.form,
          resBody: this.state.form.resBodyOrigin,
          resBodyOrigin: ""
        }
      });
      return;
    }
    let resBody;
    const resBodyOrigin = this.state.form.resBody;
    try {
      if (type === "json") {
        resBody = JSON.stringify(JSON.parse(resBodyOrigin), null, 2);
      } else if (type === "xml") {
        resBody = xmlBeautify(resBodyOrigin);
      }
    } catch (err) {
      resBody = err.message;
    }
    this.setState({
      form: {
        ...this.state.form,
        resBody,
        resBodyOrigin
      }
    });
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
        <Toolbar className={classes.headerBar}>
          <Typography variant="h6" color="inherit">
            Trisue
          </Typography>
          <div className={classes.headerBarBtns}>
            <IconButton
              className={classes.iconButton}
              title="历史记录"
              onClick={() => Router.push({ pathname: '/history' })}
            >
              <HistoryIcon />
            </IconButton>
            <IconButton
              className={classes.iconButton}
              title="导入 CURL"
              onClick={this.toggleImportDialog}
            >
              <NoteIcon />
            </IconButton>
          </div>
        </Toolbar>
        <div className={classes.mainContent}>
          {this.state.fetching && <LineProgress />}
          <Grid container>
            <form className={classes.mainForm}>
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
                    <MenuItem value="HEAD">HEAD</MenuItem>
                    <MenuItem value="OPTIONS">OPTIONS</MenuItem>
                    <MenuItem value="PATCH">PATCH</MenuItem>
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
              {this.renderCardTextArea({
                title: "请求头",
                key: "headers",
                helperText: "格式 <key>: <value>"
              })}
              {this.renderCardTextArea({
                title: "请求体",
                key: "body"
              })}
              {this.renderCardResStatus()}
              {this.renderCardTextArea({
                title: "响应头",
                key: "resHeaders"
              })}
              {this.renderCardTextArea({
                title: "响应体",
                key: "resBody"
              })}
              {this.renderCardTextArea({
                title: "备注",
                key: "note",
                helperText: "用来报告更细致的信息，如执行上下文、问题来源推测"
              })}
            </form>
          </Grid>
          {this.state.errorMsg && (
            <div className={classes.errorAlert}>{this.state.errorMsg}</div>
          )}
          <div className={classes.mainFormButtonBars}>
            <Button
              variant="contained"
              className={classes.mainFormButton}
              onClick={this.handleSendButtonClick}
            >
              发起请求
            </Button>
            <Button
              variant="contained"
              className={classes.mainFormButton}
              onClick={this.handleShareButtonClick}
            >
              分享
            </Button>
            <Button
              variant="contained"
              className={classes.mainFormButton}
              onClick={this.handleExportCurlButtonClick}
            >
              导出CURL
            </Button>
          </div>
          {this.renderShareDialog()}
          {this.renderExportCurlDialog()}
          {this.renderImportDialog()}
        </div>
      </div>
    );
  }

  renderShareDialog() {
    if (!process.browser) return;
    return (
      <Dialog
        open={this.state.showShareDialog}
        onClose={() => this.handleDialogClose(this.state.showShareDialog)}
      >
        <DialogTitle>{"分享"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {this.state.shareUrl}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <CopyToClipboard>
            {({ copy }) => (
              <Button
                onClick={() => copy(this.state.shareUrl)}
              >
                复制
              </Button>
            )}
          </CopyToClipboard>
          <Button onClick={() => this.handleDialogClose("showShareDialog")}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderExportCurlDialog() {
    if (!process.browser) return;
    return (
      <Dialog
        open={this.state.showExportCurlDialog}
        onClose={() => this.handleDialogClose("showExportCurlDialog")}
      >
        <DialogTitle>{"导出CURL"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {this.state.exportCurlText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <CopyToClipboard>
            {({ copy }) => (
              <Button
                onClick={() => copy(this.state.exportCurlText)}
              >
                复制
              </Button>
            )}
          </CopyToClipboard>
          <Button onClick={() => this.handleDialogClose("showExportCurlDialog")}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderImportDialog() {
    return (
      <Dialog
        open={this.state.showImportDialog}
        fullWidth
        onClose={this.toggleImportDialog}
      >
        <DialogTitle>{"导入 CURL"}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <TextField
              onChange={this.handleUrlFieldChange}
              value={this.state.curlText}
              multiline
              margin="normal"
              variant="outlined"
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleImportButtonClick}>导入</Button>
          <Button onClick={this.toggleImportDialog}>取消</Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderCardResStatus() {
    const { classes } = this.props;
    if (!this.state.form.resStatus) return;
    return (
      <Card key="resStatus" className={classes.resStatusCard}>
        <CardHeader
          className={classes.formCardHeader}
          action={
            <div className={classes.resStatusText}>
              {this.state.form.resStatus}
            </div>
          }
          title={<div style={{ fontSize: "1.4rem" }}>响应码</div>}
        />
      </Card>
    );
  }
  renderCardTextArea(item) {
    const { classes } = this.props;
    const isCollapsed = this.state.collapse[item.key];
    return (
      <Card key={item.key} className={classes.formFieldCard}>
        <CardHeader
          className={classes.formCardHeader}
          action={
            <IconButton onClick={() => this.handleCollapseChange(item.key)}>
              {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          }
          title={<div style={{ fontSize: "1.4rem" }}>{item.title}</div>}
        />
        <Collapse in={!isCollapsed} timeout="auto">
          <CardContent className={classes.formCardContent}>
            <FormControl fullWidth>
              {item.key === "resBody" && this.renderResBodyFormatButton()}
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
  }

  renderResBodyFormatButton() {
    const { classes } = this.props;
    const { resHeaders } = this.state.form;
    if (!resHeaders) return;
    const type = getContentType(resHeaders);
    return (
      <IconButton
        className={classes.formatButton}
        title="格式化开关"
        onClick={() => this.handleResBodyFormatButtonClick(type)}
      >
        <FormatIndentIncreaseIcon />
      </IconButton>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
  shareData: PropTypes.string
};

export default withStyles(styles)(Index);

function getContentType(headersText) {
  const contetTypeLine = headersText
    .split("\n")
    .find(line => /Content-Type/i.test(line));
  if (!contetTypeLine) return false;
  let contentType = contetTypeLine
    .trim()
    .slice(13)
    .trim();
  contentType = contentType.split(";")[0];
  switch (contentType) {
    case "application/json":
      return "json";
    case "application/xml":
    case "text/xml":
      return "xml";
    default:
      return false;
  }
}

function parseQuery(queryString) {
  const query = {};
  const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}