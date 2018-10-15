import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import NoteIcon from "@material-ui/icons/Note";
import ShareIcon from "@material-ui/icons/Share";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Input from "@material-ui/core/Input";
import TextField from "@material-ui/core/TextField";

const styles = {
  root: {
    maxWidth: "960px",
    margin: "0 auto"
  },
  toolbar: {
    display: "flex"
  },
  toolbarButtons: {
    marginLeft: "auto"
  },
  iconButton: {}
};

function ButtonAppBar(props) {
  const { classes } = props;
  return (
    <div className={classes.root}>
      <Toolbar className={classes.toolbar}>
        <Typography variant="title" color="inherit">
          Photos
        </Typography>
        <div className={classes.toolbarButtons}>
          <IconButton className={classes.iconButton} aria-label="Load">
            <NoteIcon />
          </IconButton>
          <IconButton className={classes.iconButton} aria-label="Share">
            <ShareIcon />
          </IconButton>
        </div>
      </Toolbar>
      <form>
        <div>
          <FormControl>
            <InputLabel htmlFor="">Method</InputLabel>
            <Select>
              <MenuItem value="GET">
                <em>GET</em>
              </MenuItem>
              <MenuItem value="POST">POST</MenuItem>
              <MenuItem value="PUT">PUT</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <Input placeholder="URI" />
          </FormControl>
        </div>
        <FormControl fullWidth>
          <TextField multiline rows="3" label="Headers" />
        </FormControl>
        <FormControl fullWidth>
          <TextField multiline rows="3" label="Request Body" />
        </FormControl>
        <FormControl fullWidth>
          <TextField multiline rows="3" label="Response Body" />
        </FormControl>
      </form>
    </div>
  );
}

ButtonAppBar.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ButtonAppBar);
