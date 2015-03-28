/** @jsx React.DOM */

function path() {
  return "M" + Array.prototype.slice.call(arguments).map(function(p) { return p.join(','); }).join(' L');
}

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
    var ps = this.props.ps;
    var midPoint = [ (ps[0][0] + ps[2][0]) / 2, (ps[0][1] + ps[2][1]) / 2 ];
    var controlPoint = [ 2*ps[1][0] - midPoint[0], 2*ps[1][1] - midPoint[1] ]
    var pathStr = [
      "M" + this.props.ps[0].join(','),
      "Q" + controlPoint.join(','),
      this.props.ps[2].join(',')
    ].join(' ');
    return <g>
      <path d={pathStr}/>
      <path d={path(this.props.ps[0], this.props.ps[2])}/>
    </g>;
  }
});

var YLine = React.createClass({
  getInitialState: function() {
    return {};
  },
  handleStart: function (event, ui) {
    if (!this.state.dragStartX) {
      console.log("storing drag start x: %d", this.props.base[0]);
      this.state.dragStartX = this.props.x;
    }
  },
  handleDrag: function (event, ui) {
    //console.log("updating x, original: %d, new: %d", this.state.dragStartX, this.state.dragStartX + ui.position.left);
    this.props.updateX(this.state.dragStartX + ui.position.left);
  },
  render: function() {
    return (
      <ReactDraggable
            axis="x"
            onStart={this.handleStart}
            onDrag={this.handleDrag}
      >
        <g className="yline">
          <path d={path(this.props.base, [ this.props.base[0], this.props.base[1] - this.props.length ])} ></path>
          <rect width={20} height={this.props.length} x={this.props.base[0]-10} y={this.props.base[1] - this.props.length} />
        </g>
      </ReactDraggable>
    );
  }
});

var PlateauLine = React.createClass({
  getInitialState: function() {
    return {};
  },
  handleStart: function (event, ui) {
    if (!this.state.dragStartY) {
      console.log("storing drag start y: %d", this.props.base[0]);
      this.state.dragStartY = this.props.y;
    }
  },
  handleDrag: function (event, ui) {
    //console.log("updating x, original: %d, new: %d", this.state.dragStartX, this.state.dragStartX + ui.position.left);
    this.props.updateY(this.state.dragStartY - ui.position.top);
  },
  render: function() {
    return (
          <ReactDraggable
                axis="y"
                onStart={this.handleStart}
                onDrag={this.handleDrag}
          >
            <g className="plateau-line">
              <path d={path(this.props.base, [ this.props.base[0] + this.props.length, this.props.base[1] ])} />
              <rect height={20} width={this.props.length} x={this.props.base[0]} y={this.props.base[1] - 10} />
            </g>
          </ReactDraggable>
    );
  }
});

var DraggableCorner = React.createClass({
  getInitialState: function() {
    return {};
  },
  handleStart: function (event, ui) {
    if (!this.state.dragStartY) {
      console.log("storing drag start x,y: %d,%d", this.props.x, this.props.y);
      this.state.dragStartX = this.props.x;
      this.state.dragStartY = this.props.y;
    }
  },
  handleDrag: function (event, ui) {
    //console.log("updating x, original: %d, new: %d", this.state.dragStartX, this.state.dragStartX + ui.position.left);
    this.props.updateXY(this.state.dragStartX + ui.position.left, this.state.dragStartY - ui.position.top);
  },
  render: function() {
    return (
          <ReactDraggable
                zIndex={100}
                onStart={this.handleStart}
                onDrag={this.handleDrag}
          >
            <rect
                  className="draggable-corner"
                  height={20}
                  width={20}
                  x={this.props.origin[0] + this.props.x - 10}
                  y={this.props.origin[1] - this.props.y - 10}
            />
          </ReactDraggable>
    );
  }
});

var Plot = React.createClass({
  render: function() {
    var updatePoint = this.props.updatePoint;
    var circles = this.props.points.map(function(point, idx) {
      return <Circle p={point} onMove={updatePoint(idx)} />
    });

    var firstPoint = this.props.points[0];
    var yBasePoint = [ firstPoint[0] + this.props.x, firstPoint[1] ];
    var yTopPoint = [ yBasePoint[0], yBasePoint[1] - this.props.y ];

    return <svg className="plot">
      <Parabola ps={this.props.points}/>
      {circles}
      <path d={path(firstPoint, yBasePoint)} />
      <YLine base={yBasePoint} length={this.props.y} x={this.props.x} updateX={this.props.updateX} />
      <PlateauLine base={yTopPoint} length={500} y={this.props.y} updateY={this.props.updateY} />
      <DraggableCorner origin={firstPoint} x={this.props.x} y={this.props.y} updateXY={this.props.updateXY} />
    </svg>;
  }
});

var ControlPanel = React.createClass({
  render: function() {
    return <div className="control-panel">
      <div className="control"><span className="label">x:</span><span className="value">{this.props.x}</span></div>
      <div className="control"><span className="label">y:</span><span className="value">{this.props.y}</span></div>
    </div>;
  }
});

var Page = React.createClass({
  getInitialState: function() {
    return {
      points: [[10,200], [50,10], [75,50]],
      x: 100,
      y: 50,
      updatePoint: function(idx) {
        var self = this;
        var state = this.state;
        return function(p) {
          //console.log("updating point %d from [%d,%d] to [%d,%d]", idx, state.points[idx][0], state.points[idx][1], p[0], p[1]);
          state.points[idx] = p;
          this.setState(state);
        }.bind(this);
      },
      updateX: function(x) {
        this.setState({ x: x });
      }.bind(this),
      updateY: function(y) { this.setState({ y: y }); }.bind(this),
      updateXY: function(x, y) { this.setState({ x:x, y:y })}.bind(this)
    }
  },
  render: function() {
    return <div>
      <Plot {...this.state} />
      <ControlPanel {...this.state} />
    </div>
  }
});

React.render(
      <Page />,
      document.getElementById('container')
);
