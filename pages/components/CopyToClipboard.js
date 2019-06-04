import React from "react";
import Tooltip from "@material-ui/core/Tooltip";
import copy from "clipboard-copy";

class CopyToClipboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = { showTooltip: false };
  }

  render() {
    return (
      <Tooltip
        open={this.state.showTooltip}
        title={"已复制"}
        leaveDelay={1500}
        onClose={this.handleOnTooltipClose}
        {...this.props.TooltipProps || {}}
      >
        {this.props.children({ copy: this.onCopy })}
      </Tooltip>
    );
  }

  onCopy = (content) => {
    copy(content);
    this.setState({ showTooltip: true });
  };

  handleOnTooltipClose = () => {
    this.setState({ showTooltip: false });
  };
}

export default CopyToClipboard;
