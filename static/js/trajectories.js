/** @jsx React.DOM */

var Circle = React.createClass({
  getInitialState: function() {
    return {};
  },
  handleStart: function (event, ui) {
    console.log("dragStart: %O %O [%d,%d] [%d,%d] [%d,%d]",
          event, ui,
          event.clientX, event.clientY,
          event.pageX, event.pageY,
          ui.position.left, ui.position.top
    );
    if (!this.state.dragStart) {
      this.state.dragStart = this.props.p;
    }
  },
  handleDrag: function (event, ui) {
    //console.log("drag: %O %O [%d,%d] [%d,%d] [%d,%d] [%d,%d] [%d,%d] [%d,%d]", event, ui, event.x, event.y, event.clientX, event.clientY, event.offsetX, event.offsetY, event.pageX, event.pageY, event.layerX, event.layerY, ui.position.left, ui.position.top);
    this.props.onMove([this.state.dragStart[0] + ui.position.left, this.state.dragStart[1] + ui.position.top]);
  },
  handleStop: function (event, ui) {
    console.log("dragStop: %O %O [%d,%d] [%d,%d] [%d,%d] [%d,%d] [%d,%d] [%d,%d]", event, ui, event.x, event.y, event.clientX, event.clientY, event.offsetX, event.offsetY, event.pageX, event.pageY, event.layerX, event.layerY, ui.position.left, ui.position.top);
  },
  render: function() {
    return <ReactDraggable
          onStart={this.handleStart}
          onDrag={this.handleDrag}
          onStop={this.handleStop}
    >
      <circle
            r={this.props.r || 5}
            cx={this.props.p[0]}
            cy={this.props.p[1]}
      />
    </ReactDraggable>;
  }
});

var Parabola = React.createClass({
  render: function() {
    var pathStr = [
      "M" + this.props.ps[0].join(','),
      "Q" + this.props.ps[1].join(','),
      this.props.ps[2].join(',')
    ].join(' ');
    var lineStr = [
      "M" + this.props.ps[0].join(','),
      "L" + this.props.ps[2].join(',')
    ].join(' ');
    return <g>
      <path d={pathStr}/>
      <path d={lineStr}/>
    </g>;
  }
});

var Plot = React.createClass({
  getInitialState: function() {
    return {
      points: [[10,200], [50,10], [75,50]]
    }
  },
  updatePoint: function(idx) {
    var self = this;
    var state = this.state;
    return function(p) {
      //console.log("updating point %d from [%d,%d] to [%d,%d]", idx, state.points[idx][0], state.points[idx][1], p[0], p[1]);
      state.points[idx] = p;
      this.setState(state);
    }.bind(this);
  },
  render: function() {
    var updatePoint = this.updatePoint;
    var circles = this.state.points.map(function(point, idx) {
      return <Circle p={point} onMove={updatePoint(idx)} />
    });
    return <svg className="plot">
      <Parabola ps={this.state.points}/>
      {circles}
    </svg>;
  }
});

React.render(
      <Plot />,
      document.getElementById('container')
);
