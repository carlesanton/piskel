(function () {
  var ns = $.namespace('pskl.controller');

  ns.CoveredSurfaceController = function (piskelController) {
  // ns.PreviewController = function (piskelController, container) {
    this.piskelController = piskelController;
    // this.frame = null;
    this.isDrawing = false;
    this.justReleased = false;
    this.coordinates = {
      x : -1,
      y : -1
    };
    this.covered_surface = 0;
    this.covered_surface_ratio = 0;
    this.changedCoordinates = false;
    this.lookingForColor = rgbToUint32(0,0,0);
    this.targetCoveredSurface = 80;
  };
  
  ns.CoveredSurfaceController.prototype.init = function () {
    this.rootContainer = document.querySelector('.covered-surface-container');
    this.infoContainer = document.querySelector('.covered-surface-value');
    this.targetSurfaceInput = document.querySelector('#target-covered-surface');
    this.targetSurfaceDisplay = document.querySelector('#display-target-surface');
    this.coveredSurface = null;
    // this.frame = this.piskelController.getCurrentFrame();
    
    $.subscribe(Events.CURSOR_MOVED, this.onCursorMoved_.bind(this));
    $.subscribe(Events.DRAG_START, this.onDragStart_.bind(this));
    $.subscribe(Events.DRAG_END, this.onDragEnd_.bind(this));
    $.subscribe(Events.TOOL_PRESSED, this.onToolPressed_.bind(this));
    $.subscribe(Events.TOOL_RELEASED, this.onToolReleased_.bind(this));
    this.targetSurfaceInput.addEventListener('change', this.onTargetSurfaceInputUpdate_.bind(this));
    this.targetSurfaceInput.addEventListener('input', this.onTargetSurfaceInputUpdate_.bind(this));

    this.render_()
  };

  ns.CoveredSurfaceController.prototype.onToolPressed_ = function (event, x, y) {
    this.isDrawing = true;
    // this.coordinates = {
    //   x : x,
    //   y : y
    // };
    this.getCoveredSurface();
  };

  ns.CoveredSurfaceController.prototype.onToolReleased_ = function (event, x, y) {
    this.isDrawing = false;
    this.justReleased = true;
    this.getCoveredSurface();
  };

  ns.CoveredSurfaceController.prototype.onCursorMoved_ = function (event, x, y) {
    this.changedCoordinates = false;
    if (this.coordinates.x !== x && !this.coordinates.y !== y) {
      this.changedCoordinates = true;
    }
    this.coordinates = {
      x : x,
      y : y
    };

    if (!this.isDrawing || !this.changedCoordinates) {return;}

    this.getCoveredSurface();
  };

  ns.CoveredSurfaceController.prototype.onDragStart_ = function (event, x, y) {
    this.isDrawing = true;
  };

  ns.CoveredSurfaceController.prototype.onDragEnd_ = function (event) {
    this.isDrawing = false;
  };

  ns.CoveredSurfaceController.prototype.getCoveredSurface = function () {
    if (!this.isDrawing && !this.justReleased) {return;}
    var newFrame = this.piskelController.getCurrentFrame();

    var covered_surface_dict = this.computeCoveredSurface(newFrame)
    this.covered_surface = covered_surface_dict.all
    this.covered_surface_ratio = covered_surface_dict.ratio
    this.render_()
    this.justReleased = false;
    return
  }

  ns.CoveredSurfaceController.prototype.computeCoveredSurface = function (frame) {

    let total_pixels = frame.pixels.length
    let pixels_with_content = frame.pixels.filter((p) => p === this.lookingForColor)
    let covered_surface = pixels_with_content.length;
    let covered_surface_ratio = covered_surface / total_pixels
    return {'all': covered_surface, 'ratio': covered_surface_ratio}
  };

  ns.CoveredSurfaceController.prototype.onTargetSurfaceInputUpdate_ = function (evt) {
    var newTargetSurface = parseInt(this.targetSurfaceInput.value, 10);
    this.targetCoveredSurface = newTargetSurface;
    this.render_()
  }


  ns.CoveredSurfaceController.prototype.render_ = function () {
    this.targetSurfaceDisplay.textContent = this.targetCoveredSurface + '%';

    let ratio_string = (this.covered_surface_ratio * 100).toFixed(2)
    this.infoContainer.textContent = ratio_string + '%';

    var covered_surface_diff = Math.abs(this.covered_surface_ratio - this.targetCoveredSurface/100)

    // Remove previous state classes
    this.infoContainer.classList.remove(
      'covered-surface-value-good',
      'covered-surface-value-bad',
      'covered-surface-value-mid'
    );

    if (Math.abs(covered_surface_diff) < 0.0002) {
      this.infoContainer.classList.add('covered-surface-value-good');
    } else if (covered_surface_diff < 0.06) {
      this.infoContainer.classList.add('covered-surface-value-mid');
    } else {
      this.infoContainer.classList.add('covered-surface-value-bad');
    }
  }

  var componentToHex = function (c) {
      var hex = c.toString(16);
      return hex.length == 1 ? '0' + hex : hex;
  };

  function hexToRGB(pixel) {
    var r = (pixel >>> 16) & 0xFF;
    var g = (pixel >>> 8) & 0xFF;
    var b = pixel & 0xFF;
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function rgbToHex(r, g, b) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
  };

  function rgbToUint32(r, g, b) {
  return (
    (0xFF << 24) |
    ((r & 0xFF) << 16) |
    ((g & 0xFF) << 8) |
    (b & 0xFF)
  ) >>> 0;
}



})();
