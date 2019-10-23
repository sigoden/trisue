import React from "react";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ClearAllIcon from "@material-ui/icons/ClearAll";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import Router from 'next/router'
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
  mainFormButtonBars: {
    marginLeft: "-8px",
    marginTop: "24px"
  },
  mainFormButton: {
    margin: "8px"
  },
  itemBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemTexts: {
    display: "flex",
    alignItems: "center",
    flexGrow: 2,
    justifyContent: "space-between",
    marginRight: '10px'
  },
  itemText: {
    fontSize: '18px',
  },
  errorAlert: {
    color: "#f44336",
    marginTop: "24px",
    fontSize: "1.2rem"
  }
};


class History extends React.Component {
  componentWillMount() {
    const mapFn = v => {
      const { method, uri } = v;
      return { ...v, title: `${method.toUpperCase()} ${uri}` }
    };
    const storage = new Storage(mapFn);
    this.setState({ storage, list: storage.list() });
  }
  handleItemDelete = id => {
    const { storage } = this.state;
    storage.remove(id)
    this.setState({ list: storage.list() });
  }
  handleClear = () => {
    const { storage } = this.state;
    storage.clear()
    this.setState({ list: storage.list() });
  }
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
              title="清除历史记录"
              onClick={this.handleClear}
            >
              <ClearAllIcon />
            </IconButton>
            <IconButton
              className={classes.iconButton}
              title="返回"
              onClick={() => Router.back()}
            >
              <ArrowBackIcon />
            </IconButton>
          </div>
        </Toolbar>
        <div className={classes.mainContent}>
          {this.state.list.map(v => (
            <div key={v.id} className={classes.itemBox}>
              <div className={classes.itemTexts}>
                <div className={classes.itemText}>{v.method.toUpperCase()} {v.uri}</div>
                <div className={classes.itemText}>{v.at}</div>
              </div>
              <div>
                <IconButton
                  className={classes.iconButton}
                  title="打开"
                  onClick={() => Router.push({ pathname: '/', query: { shareId: v.id } })}
                >
                  <OpenInNewIcon />
                </IconButton>
                <IconButton
                  className={classes.iconButton}
                  title="删除"
                  onClick={() => this.handleItemDelete(v.id)}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(History);
