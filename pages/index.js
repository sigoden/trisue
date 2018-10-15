import React from "react";
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
  }
};
class Index extends React.Component {
  state = {
    fetching: false,
    method: "GET",
    path: "",
    showShareDialog: true,
    shareUri: "",
    reqHeaders: "",
    reqHeaders: "",
    resBody: "",
    fieldCollapses: {
      reqHeaders: false,
      reqBody: false,
      resHeaders: true,
      resBody: true
    }
  };

  handleSelectMethodChange = event => {
    this.setState({ method: event.target.value });
  };

  handleCollapseChange = kind => {
    this.setState({
      fieldCollapses: {
        ...this.state.fieldCollapses,
        [kind]: !this.state.fieldCollapses[kind]
      }
    });
  };

  handleInputChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleShareDialogClose = () => {
    this.setState({
      showShareDialog: false
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="title" color="inherit">
            Trisue
          </Typography>
          <div className={classes.toolbarButtons}>
            <IconButton className={classes.iconButton} aria-label="Load">
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
                    value={this.state.method}
                    onChange={this.handleSelectMethodChange}
                    inputProps={{
                      name: "method",
                      id: "method"
                    }}
                  >
                    <MenuItem value="GET">
                      <em>GET</em>
                    </MenuItem>
                    <MenuItem value="POST">POST</MenuItem>
                    <MenuItem value="PUT">PUT</MenuItem>
                    <MenuItem value="DELETE">DELETE</MenuItem>
                  </Select>
                </FormControl>
                <FormControl style={{ width: "80%" }}>
                  <Input
                    name="path"
                    placeholder="URI"
                    onChange={this.handleInputChange}
                  />
                </FormControl>
              </Grid>
              {[
                {
                  title: "请求头",
                  key: "reqHeaders",
                  helperText: "格式 <key>: <value>"
                },
                {
                  title: "请求数据",
                  key: "reqBody",
                  helperText: ""
                },
                {
                  title: "响应头",
                  key: "resHeaders",
                  helperText: ""
                },
                {
                  title: "响应数据",
                  key: "resBody",
                  helperText: ""
                }
              ].map(item => {
                const isCollapsed = this.state.fieldCollapses[item.key];
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
                            name={item.key}
                            multiline
                            helperText={item.helperText}
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
          <div className={classes.buttonBar}>
            <Button variant="contained" className={classes.button}>
              Send Request
            </Button>
            <Button variant="contained" className={classes.button}>
              Share
            </Button>
          </div>
          <Dialog
            open={this.state.showShareDialog}
            onClose={this.handleShareDialogClose}
          >
            <DialogTitle>{"分享请求响应数据"}</DialogTitle>
            <DialogContent>
              <DialogContentText>{this.state.shareUri}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleShareDialogClose} color="primary">
                关闭
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Index);
