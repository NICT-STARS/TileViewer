/******************************************************************************/
/* k2goTileViewer Web Components                                              */
/* Version 2.0.0                                                              */
/* Copyright (c) k2go. All rights reserved.                                   */
/* See License.txt for the license information.                               */
/******************************************************************************/
class K2goTileViewer extends HTMLElement 
{
  /*-----* properties *---------------------------------------------------------*/
    #flgTouch           = "ontouchstart"            in window;
    #flgEvent           = this.#flgTouch && "event" in window;
    #strMouseWheel      = "onwheel" in document ? "wheel" : "onmousewheel" in document ? "mousewheel" : "DOMMouseScroll";
    #Options = 
    {
      scales: [
        { width: 200, height: 200, size: 1.0, count: 1,  zoom: 0 },
        { width: 200, height: 200, size: 1.5, count: 1,  zoom: 1 },
        { width: 200, height: 200, size: 1.0, count: 2,  zoom: 2 },
        { width: 200, height: 200, size: 1.5, count: 2,  zoom: 3 },
        { width: 200, height: 200, size: 1.0, count: 4,  zoom: 4 },
        { width: 200, height: 200, size: 1.5, count: 4,  zoom: 5 },
        { width: 200, height: 200, size: 1.0, count: 8,  zoom: 6 },
        { width: 200, height: 200, size: 1.5, count: 8,  zoom: 7 },
        { width: 200, height: 200, size: 1.0, count: 16, zoom: 8 },
        { width: 200, height: 200, size: 1.5, count: 16, zoom: 9 }
      ],
      scale: 1,
      drawingSize: 1,
      timeout: 1000,
      disableMove: false,
      disableZoom: false,
      limitZoomEffect: false
    };
    #lock               = false;
    #ContextMenu        = (pEvent) => { pEvent.preventDefault(); pEvent.stopPropagation(); };

    #mainElement;
  /*-----* entities table *-----------------------------------------------------*/
    #entities = [];

  /******************************************************************************/
  /* constructor                                                                */
  /******************************************************************************/
  constructor() 
  {
    super();
  /*-----* shadow dom *---------------------------------------------------------*/
    const objShadowRoot = this.attachShadow({ mode:"open" });
    const objStyle      = document.createElement("style");
    const objTemplate   = document.createElement("template");

    objStyle.textContent = 
    `
      [part="k2go-tile-viewer"]             { position: fixed; left: 0px; top : 0px; width: 100%; height: 100vh; }
      [part="k2go-tile-viewer-main"]        { position: relative; overflow: hidden; background-repeat: no-repeat; }
      [part="k2go-tile-viewer-main"]:active { cursor: move; }
      [part="k2go-tile-viewer-main"] > *    { position: absolute; }
      [part="k2go-tile-viewer-main"] > * > .k2go-tile-viewer-image                              { position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; }
      [part="k2go-tile-viewer-main"]:not(.k2go-tile-viewer-clone) > * > .k2go-tile-viewer-image { animation: k2go-tile-viewer-fade-in 0.3s ease-out 0s 1 normal; }
      [part="k2go-tile-viewer-main"] > * > .k2go-tile-viewer-no-image                           { position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; text-align: center; }
      [part="k2go-tile-viewer-main"] > * > .k2go-tile-viewer-no-image:before                    { position: absolute; left: 0px; top: 0px; right: 0px; bottom: 0px; height: 1em; margin: auto; content: "No Image"; color: #aaa; }
      .k2go-tile-viewer-clone               { position: absolute; pointer-events: none; }
      .k2go-tile-viewer-entity              { position: absolute; }
      @keyframes k2go-tile-viewer-fade-in   { 0% { opacity: 0; } 100% { opacity: 1; } }
    `;

    objTemplate.innerHTML = 
    `
      <div part="k2go-tile-viewer">
        <div part="k2go-tile-viewer-main"></div>
      </div>
    `;

    objShadowRoot.appendChild(objStyle);
    objShadowRoot.appendChild(objTemplate.content.cloneNode(true));

    this.#mainElement       = this.shadowRoot.querySelector("[part='k2go-tile-viewer-main']:not(.k2go-tile-viewer-clone)");

    /*-----* event *--------------------------------------------------------------*/
    window.addEventListener("contextmenu", this.#ContextMenu);
    this.#setMainEvent();
  };

  /******************************************************************************/
  /* #setMainEvent                                                              */
  /******************************************************************************/
  #setMainEvent()
  {
    var $this = this;
    /******************************************************************************/
    /* window.resize                                                              */
    /******************************************************************************/
    window.addEventListener("resize", function() 
    { 
      try
      {
        var main = $this.#mainElement;
        if (main.children.length       ==      0) return;

        var resizeTimeout = main.getAttribute('data-resize');
        if (resizeTimeout) clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(function()
        {
          $this.#lock = true;

          $this.#_moveAdjust();
          $this.#_increment();

          main.setAttribute('data-resize', null);
          $this.#lock = false;
        }, 500);
      }
      catch(pError)
      {
        console.error("k2goTileViewer resize error: " + pError);
      }
    });

    /******************************************************************************/
    /* main.wheel                                                                 */
    /******************************************************************************/
    this.#mainElement.addEventListener(this.#strMouseWheel, function(pEvent) 
    {
      try
      {
        var intDelta  = pEvent.deltaY ? -(pEvent.deltaY) : pEvent.wheelDelta ? pEvent.wheelDelta : -(pEvent.detail);
        var main     = $this.#mainElement;

        if ( $this.#flgEvent                                                                                           ) if ($this.#flgEvent) { if(event && event.cancelable) event.preventDefault(); } else {  if(pEvent && pEvent.cancelable) pEvent.preventDefault(); };
        if ( $this.#Options.disableZoom                                                                                ) return;
        if ( $this.#Options.limitZoomEffect && $this.#Options.scale == 0                                && intDelta < 0) return;
        if ( $this.#Options.limitZoomEffect && $this.#Options.scale == $this.#Options.scales.length - 1 && intDelta > 0) return;
        if ( $this.#lock                                                                                               ) return;                                                                        else $this.#lock =  true;
        if (typeof parseInt(main.dataset.zoom)                     == "number"                                        ) clearTimeout(main.dataset.zoom);

        if ( $this.shadowRoot.querySelectorAll(".k2go-tile-viewer-clone").length == 0)
        {
          if (typeof $this.#Options.zoomStart == "function") setTimeout(function() { $this.#Options.zoomStart({ x : pEvent.pageX, y : pEvent.pageY }); }, 1);
          
          $this.#_createClone({ x : pEvent.pageX, y : pEvent.pageY });
        }

        var clone           = $this.shadowRoot.querySelector(".k2go-tile-viewer-clone");
        var cloneObj        = JSON.parse(clone.dataset.cloneInfo);
        var objMinScaleSize = $this.#_getScaleSize(0);
        var objMaxScaleSize = $this.#_getScaleSize($this.#Options.scales.length - 1);
        var objScaleSize    = $this.#_getScaleSize($this.#Options.scale);
        var intMinScale     = objMinScaleSize.width / objScaleSize.width;
        var intMaxScale     = objMaxScaleSize.width / objScaleSize.width;

        if      (intDelta         > 0  ) 
        {
          cloneObj.scale += 0.05 ;
          clone.dataset.cloneInfo  = JSON.stringify(cloneObj); 
        }
        else if (cloneObj.scale  > 0.1) 
        {
          cloneObj.scale -= 0.05;
          clone.dataset.cloneInfo  = JSON.stringify(cloneObj); 
        }

        if ($this.#Options.limitZoomEffect)
        {
          if      (cloneObj.scale < intMinScale) cloneObj.scale = intMinScale;
          else if (cloneObj.scale > intMaxScale) cloneObj.scale = intMaxScale;
        }

        clone.style.transform = "scale(" + cloneObj.scale + ")";

        main.dataset.zoom =  setTimeout(function()
        {
          $this.#lock = true;
          $this.#_zoom();
          $this.#lock = false;
        }, 500);

        $this.#lock = false;
      }
      catch(pError)
      {
        console.error("k2goTileViewer " + $this.#strMouseWheel + " error: " + pError);
      }
    });

    /******************************************************************************/
    /* main.drag                                                                  */
    /******************************************************************************/
    /*-----* start *--------------------------------------------------------------*/
    ["touchstart", "mousedown"].forEach( function(eventType) 
    {
      var flgTouch = eventType === "touchstart" ? true : false;
      var main    = $this.#mainElement;

      main.addEventListener(eventType, function(pEvent) 
      {
        try
        {
          if ($this.#flgEvent) { if(event && event.cancelable) event.preventDefault(); } else {  if(pEvent && pEvent.cancelable) pEvent.preventDefault(); };
          if ($this.#lock    ) return;
          if ( $this.shadowRoot.querySelectorAll(".k2go-tile-viewer-clone").length > 0     ) return;

          var flgSingle       = ($this.#flgEvent ? (pEvent.touches.length == 1 ? true : false) : flgTouch ? (pEvent.changedTouches.length == 1 ? true : false) : true );
          var flgDouble       = ($this.#flgEvent ? (pEvent.touches.length == 2 ? true : false) : flgTouch ? (pEvent.changedTouches.length == 2 ? true : false) : false) && !$this.#Options.disableZoom;
          var objStart        = { x:0, y:0 };
          var objBase1        = { x:0, y:0 };
          var objBase2        = { x:0, y:0 };
          var objMove1        = { x:0, y:0 };
          var objMove2        = { x:0, y:0 };
          var intBaseDis      = 0;
          var intMoveDis      = 0;
          var objMinScaleSize;
          var objMaxScaleSize;
          var objScaleSize;
          var intMinScale;
          var intMaxScale;

          if (flgSingle)
          {
            objStart.x = $this.#flgEvent ? pEvent.changedTouches[0].pageX : flgTouch ? pEvent.touches.item(0).pageX : pEvent.pageX;
            objStart.y = $this.#flgEvent ? pEvent.changedTouches[0].pageY : flgTouch ? pEvent.touches.item(0).pageY : pEvent.pageY;
            objBase1.x = $this.#flgEvent ? pEvent.changedTouches[0].pageX : flgTouch ? pEvent.touches.item(0).pageX : pEvent.pageX;
            objBase1.y = $this.#flgEvent ? pEvent.changedTouches[0].pageY : flgTouch ? pEvent.touches.item(0).pageY : pEvent.pageY;

            if (main.dataset.dblTap === "true")
            {
              if (typeof $this.#Options.doubleTap == "function") { setTimeout(function() { $this.#Options.doubleTap({ which : (flgTouch ? 1 : (pEvent.which == 3 ? -1 : 1)),   x : objBase1.x, y : objBase1.y }); }, 1); }
              else                                               { $this.#zoom((flgTouch ? 1 : (pEvent.which == 3 ? -1 : 1)), { x : objBase1.x, y : objBase1.y });}

              main.dataset.dblTap = false;
              return;
            }
            else
            {
              main.dataset.dblTap =  true;
              main.dataset.tapHold = setTimeout(function()
              {
                if (typeof $this.#Options.tapHold == "function") setTimeout(function() { $this.#Options.tapHold({ x : objBase1.x, y : objBase1.y }); }, 1);
                main.dataset.tapHold = null;
              }, 1000);

              if (typeof $this.#Options.moveStart == "function") setTimeout(function() { $this.#Options.moveStart({ x : objBase1.x, y : objBase1.y }); }, 1);

            }

            setTimeout(function(){ main.dataset.dblTap = false }, 300);
          }
          else if (flgDouble)
          {
            objBase1        = ($this.#flgEvent ? { x : pEvent.touches[0].pageX, y : pEvent.touches[0].pageY } : flgTouch ? { x : pEvent.touches.item(0).pageX, y : pEvent.touches.item(0).pageY } : { x : pEvent.touches[0].pageX, y : pEvent.touches[0].pageY });
            objBase2        = ($this.#flgEvent ? { x : pEvent.touches[1].pageX, y : pEvent.touches[1].pageY } : flgTouch ? { x : pEvent.touches.item(1).pageX, y : pEvent.touches.item(1).pageY } : { x : pEvent.touches[1].pageX, y : pEvent.touches[1].pageY });
            intBaseDis      = Math.sqrt(Math.pow(objBase1.x - objBase2.x, 2) + Math.pow(objBase1.y - objBase2.y, 2));
            objMinScaleSize = $this.#_getScaleSize(0);
            objMaxScaleSize = $this.#_getScaleSize($this.#Options.scales.length - 1);
            objScaleSize    = $this.#_getScaleSize($this.#Options.scale);
            intMinScale     = objMinScaleSize.width / objScaleSize.width;
            intMaxScale     = objMaxScaleSize.width / objScaleSize.width;

            $this.#_createClone({ x : (objBase1.x + objBase2.x) / 2, y : (objBase1.y + objBase2.y) / 2 });
            if (typeof $this.#Options.zoomStart == "function") setTimeout(function() { $this.#Options.zoomStart({ x : (objBase1.x + objBase2.x) / 2, y : (objBase1.y + objBase2.y) / 2 }); }, 1);

          }
          else
          {
            return;
          }
    /*-----* move *---------------------------------------------------------------*/
          var fncMove = function(pEvent)
          {
            try
            {
              if ($this.#flgEvent) { if(event.cancelable) event.preventDefault(); } else { if(pEvent.cancelable) pEvent.preventDefault(); }

              var flgSingle = $this.#flgEvent ? (event.touches.length == 1 ? true : false) : flgTouch ? (pEvent.touches.length == 1 ? true : false) : true;
              var flgDouble = $this.#flgEvent ? (event.touches.length == 2 ? true : false) : flgTouch ? (pEvent.touches.length == 2 ? true : false) : false;

              if (flgSingle)
              {
                objMove1.x = ($this.#flgEvent ? event.changedTouches[0].pageX : flgTouch ? pEvent.touches.item(0).pageX : pEvent.pageX) - objBase1.x;
                objMove1.y = ($this.#flgEvent ? event.changedTouches[0].pageY : flgTouch ? pEvent.touches.item(0).pageY : pEvent.pageY) - objBase1.y;
                objBase1.x = ($this.#flgEvent ? event.changedTouches[0].pageX : flgTouch ? pEvent.touches.item(0).pageX : pEvent.pageX);
                objBase1.y = ($this.#flgEvent ? event.changedTouches[0].pageY : flgTouch ? pEvent.touches.item(0).pageY : pEvent.pageY);
                $this.#_move({ left : objMove1.x, top : objMove1.y });

                if (typeof parseInt(main.dataset.tapHold) == "number" && (Math.abs(objStart.x - objBase1.x) > 5 || Math.abs(objStart.y - objBase1.y) > 5))
                {
                  clearTimeout(main.dataset.tapHold);
                               main.dataset.tapHold = null;
                }
              }
              else if (flgDouble)
              {
                var clone = $this.shadowRoot.querySelector(".k2go-tile-viewer-clone");

                objMove1   = $this.#flgEvent ? { x : event.touches[0].pageX, y : event.touches[0].pageY } : flgTouch ? { x : pEvent.touches.item(0).pageX, y : pEvent.touches.item(0).pageY } : { x : pEvent.touches[0].pageX, y : pEvent.touches[0].pageY };
                objMove2   = $this.#flgEvent ? { x : event.touches[1].pageX, y : event.touches[1].pageY } : flgTouch ? { x : pEvent.touches.item(1).pageX, y : pEvent.touches.item(1).pageY } : { x : pEvent.touches[1].pageX, y : pEvent.touches[1].pageY };
                intMoveDis = Math.sqrt(Math.pow(objMove1.x - objMove2.x, 2) + Math.pow(objMove1.y - objMove2.y, 2));

                clone.dataset.cloneInfo.scale = intMoveDis / intBaseDis;

                if ($this.#Options.limitZoomEffect)
                {
                       if (clone.dataset.cloneInfo.scale < intMinScale) cloneObj.scale                = intMinScale;
                  else if (clone.dataset.cloneInfo.scale > intMaxScale) clone.dataset.cloneInfo.scale = intMaxScale;
                }

                clone.style.transform = "scale(" + clone.dataset.cloneInfo.scale + ")"
              }
            }
            catch(pError)
            {
              console.error("k2goTileViewer mousemove error: " + pError);
            }
          };

          document.addEventListener(flgTouch ? "touchmove" : "mousemove", fncMove, { passive: false });
    /*-----* end *----------------------------------------------------------------*/
          var fncEnd = function(pEvent)
          {
            try
            {
              if ($this.#flgEvent) { if(event.cancelable) event.preventDefault(); } else { if(pEvent.cancelable) pEvent.preventDefault(); }

              if (typeof parseInt(main.dataset.tapHold) == "number")
              {
                clearTimeout(main.dataset.tapHold);
                             main.dataset.tapHold = null;
              }

              document.removeEventListener( flgTouch ? "touchmove" : "mousemove", fncMove, { passive: false });
              document.removeEventListener(flgTouch ? "touchend"   : "mouseup"  , fncEnd , { passive: false });
              $this.#lock = true;

              if (flgSingle)
              {
                $this.#_moveAdjust();
                $this.#_increment ();
                if (typeof $this.#Options.moveEnd == "function") setTimeout(function() { $this.#Options.moveEnd(); }, 1);
              }
              else if (flgDouble)
              {
                $this.#_zoom();
              }

              $this.#lock = false;
            }
            catch(pError)
            {
              console.error("mouseup error: " + pError);
            }
          }
        }
        catch(pError)
        {
          console.error("mousedown error: " + pError);
        }

        document.addEventListener(flgTouch ? "touchend"  : "mouseup"  , fncEnd , { passive: false });
        });
    });
  };

  /******************************************************************************/
  /* setOptions                                                                 */
  /******************************************************************************/
  setOptions(pOptions) 
  {
      Object.assign(this.#Options, pOptions);   
  };

  /******************************************************************************/
  /* getOptions                                                                 */
  /******************************************************************************/
  getOptions() 
  {
      return this.#Options;
  };

  /******************************************************************************/
  /* #create                                                                    */
  /******************************************************************************/
  #create (pPositionInfo, pCallBack)
  {
    var objPositionInfo = null;
  /*-----* center *-------------------------------------------------------------*/
    if (typeof pPositionInfo == "object" && pPositionInfo != null)
    {
      if ("center" in pPositionInfo && "scale" in pPositionInfo && "width" in pPositionInfo && "height" in pPositionInfo)
      {
        objPositionInfo        = {};
        objPositionInfo.scale  = pPositionInfo.scale;
        objPositionInfo.width  = pPositionInfo.width;
        objPositionInfo.height = pPositionInfo.height;

        if      ("relative" in pPositionInfo.center)
        {
          objPositionInfo.left = pPositionInfo.center.relative.left;
          objPositionInfo.top  = pPositionInfo.center.relative.top;
        }
        else if ("degrees" in pPositionInfo.center)
        {
          var objRelativePosition = this.#_getRelativePosition(pPositionInfo.center);

          objPositionInfo.left = objRelativePosition.left;
          objPositionInfo.top  = objRelativePosition.top;
        }
        else if ("absolute" in pPositionInfo.center)
        {
          var objRelativePosition = this.#_getRelativePosition({ absolute : { scale : pPositionInfo.scale, left : pPositionInfo.center.absolute.left, top : pPositionInfo.center.absolute.top } });

          objPositionInfo.left = objRelativePosition.left;
          objPositionInfo.top  = objRelativePosition.top;
        }
      }
  /*-----* bounds *-------------------------------------------------------------*/
    else if ("bounds" in pPositionInfo)
    {
      if      ("relative" in pPositionInfo.bounds)
      {
        objPositionInfo       = {};
        objPositionInfo.scale = this.#Options.scales.length - 1;

        var objScaleSize = this.#_getScaleSize(objPositionInfo.scale);

        objPositionInfo.width  = objScaleSize.width  * pPositionInfo.bounds.relative.right  - objScaleSize.width  * pPositionInfo.bounds.relative.left;
        objPositionInfo.height = objScaleSize.height * pPositionInfo.bounds.relative.bottom - objScaleSize.height * pPositionInfo.bounds.relative.top;
        objPositionInfo.left   = pPositionInfo.bounds.relative.left + (pPositionInfo.bounds.relative.right  - pPositionInfo.bounds.relative.left) / 2;
        objPositionInfo.top    = pPositionInfo.bounds.relative.top  + (pPositionInfo.bounds.relative.bottom - pPositionInfo.bounds.relative.top ) / 2;
      }
      else if ("degrees" in pPositionInfo.bounds)
      {
        objPositionInfo       = {};
        objPositionInfo.scale = this.#Options.scales.length - 1;

        var objScaleSize   = this.#_getScaleSize       (objPositionInfo.scale);
        var objLeftTop     = this.#_getRelativePosition({ degrees : { left : pPositionInfo.bounds.degrees.left , top : pPositionInfo.bounds.degrees.top    } });
        var objRightBottom = this.#_getRelativePosition({ degrees : { left : pPositionInfo.bounds.degrees.right, top : pPositionInfo.bounds.degrees.bottom } });

        objPositionInfo.width  = objScaleSize.width  * objRightBottom.left - objScaleSize.width  * objLeftTop.left;
        objPositionInfo.height = objScaleSize.height * objRightBottom.top  - objScaleSize.height * objLeftTop.top;
        objPositionInfo.left   = objLeftTop.left + (objRightBottom.left - objLeftTop.left) / 2;
        objPositionInfo.top    = objLeftTop.top  + (objRightBottom.top  - objLeftTop.top ) / 2;
      }
      else if ("absolute" in pPositionInfo.bounds)
      {
        objPositionInfo        = {};
        objPositionInfo.scale  = pPositionInfo.bounds.absolute.scale;
        objPositionInfo.width  = pPositionInfo.bounds.absolute.right  - pPositionInfo.bounds.absolute.left;
        objPositionInfo.height = pPositionInfo.bounds.absolute.bottom - pPositionInfo.bounds.absolute.top;

        var objLeftTop     = this.#_getRelativePosition({ absolute : { left : pPositionInfo.bounds.absolute.left , top : pPositionInfo.bounds.absolute.top   , scale : pPositionInfo.bounds.absolute.scale } });
        var objRightBottom = this.#_getRelativePosition({ absolute : { left : pPositionInfo.bounds.absolute.right, top : pPositionInfo.bounds.absolute.bottom, scale : pPositionInfo.bounds.absolute.scale } });

        objPositionInfo.left = objLeftTop.left + (objRightBottom.left - objLeftTop.left) / 2;
        objPositionInfo.top  = objLeftTop.top  + (objRightBottom.top  - objLeftTop.top ) / 2;
      }
    }
  }
  /*-----* other *--------------------------------------------------------------*/
    if (objPositionInfo == null)
    {
      var intScale     = this.#Options.scales.length - 1;
      var objScaleSize = this.#_getScaleSize(intScale);

      objPositionInfo        = {};
      objPositionInfo.scale  = intScale;
      objPositionInfo.width  = objScaleSize.width;
      objPositionInfo.height = objScaleSize.height;
      objPositionInfo.left   = 0.5;
      objPositionInfo.top    = 0.5;
    }

    this.#_createClone();
    this.#_create     (objPositionInfo);
    this.#_removeClone();
  };

  /******************************************************************************/
  /* #move                                                                      */
  /******************************************************************************/
  #move (pPositionInfo, pDuration, pCallBack)
  {
    if (typeof pPositionInfo != "object" || pPositionInfo == null) return;

    var $this          = this;
    var main           = this.#mainElement;
    var objCenterInfo  = this.#_getCenterInfo();
    var objDestination = {};
    this.#lock         = true;

                                            objCenterInfo  = this.#_getAbsolutePosition({offset   : objCenterInfo.offset});
         if ("relative"   in pPositionInfo) objDestination = this.#_getAbsolutePosition({relative : { scale : objCenterInfo.scale, left : pPositionInfo.relative.left, top : pPositionInfo.relative.top } });
    else if ("degrees"    in pPositionInfo) objDestination = this.#_getAbsolutePosition({ degrees : { scale : objCenterInfo.scale, left : pPositionInfo.degrees .left, top : pPositionInfo.degrees .top } });
    else if ("absolute"   in pPositionInfo) objDestination = Object.assign( {}, pPositionInfo.absolute );
    else if ("difference" in pPositionInfo) objDestination = { left : objCenterInfo.left + pPositionInfo.difference.left, top : objCenterInfo.top + pPositionInfo.difference.top };
    else                                    objDestination = { left : objCenterInfo.left                                , top : objCenterInfo.top                                };

    function animate(elem, properties, duration, easing, progressCallback, complete) 
    {
      const start = performance.now();
      const startProperties = {};
    
      for (let prop in properties)
      {
        startProperties[prop] = parseFloat(getComputedStyle(elem)[prop]);
      }
    
      function frame(time) 
      {
        const elapsed = time - start;
        const progress = Math.min(elapsed / duration, 1);
    
        for (let prop in properties) 
        {
          const startValue = startProperties[prop];
          const endValue = properties[prop];
          const currentValue = startValue + (endValue - startValue) * progress;
    
          elem.style[prop] = currentValue + 'px';
        }
    
        if (typeof progressCallback === 'function') 
        {
          progressCallback(progress, elapsed, duration - elapsed);
        }
    
        if (progress < 1) 
        {
          requestAnimationFrame(frame);
        } else 
        {
          if (typeof complete === 'function') 
          {
            complete();
          }
        }
      }
    
      requestAnimationFrame(frame);
    };

    animate(
      main,
      { left: objDestination.left, top: objDestination.top },
      pDuration,
      'swing',
      function(progress, elapsed, remaining) 
      {
        if (document.querySelector("#position-info").value == "degrees")
        {   
          var intLeft = !isNaN(parseFloat(objDestination.left)) ? parseFloat(objDestination.left) : 0;
          var intTop  = !isNaN(parseFloat(objDestination.top))  ? parseFloat(objDestination.top)  : 0;
        }
        else 
        {
          var intLeft = parseFloat(objDestination.left) || objCenterInfo.left;
          var intTop  = parseFloat(objDestination.top)  || objCenterInfo.top;
        }
    
        $this.#_move({ left: objCenterInfo.left - intLeft, top: objCenterInfo.top - intTop });
    
        objCenterInfo.left = intLeft;
        objCenterInfo.top  = intTop;
      },
      function() 
      {
        $this.#_moveAdjust();
        $this.#_increment();
        if (typeof pCallBack === 'function') setTimeout(pCallBack, 1);
        $this.#lock = false;
      });
  };

  /******************************************************************************/
  /* #zoom                                                                      */
  /******************************************************************************/
  #zoomIn () { this.#zoom( 1) };
  #zoomOut() { this.#zoom(-1) };
  #zoom   (pType, pPosition) 
  {
    var $this    = this;
    var intScale = this.#Options.scale;

    if ( this.shadowRoot.querySelectorAll(".k2go-tile-viewer-clone").length > 0     ) return;
    if ( this.#Options.disableZoom                                                  ) return;
    if ( pType < 0 && intScale <= 0                                                 ) return;
    if ( pType > 0 && intScale >= this.#Options.scales.length - 1                   ) return;
    if ( this.#lock                                                                 ) return; else this.#lock = true;

    if (typeof $this.#Options.zoomStart == "function") setTimeout(function() { $this.#Options.zoomStart(pPosition); }, 1);
    this.#_createClone(pPosition);

    var clone              = this.shadowRoot.querySelector(".k2go-tile-viewer-clone");
    var aryScales          = this.#Options.scales;
    var objScaleSizeBefore = this.#_getScaleSize(intScale);
    var objScaleSizeAfter  = this.#_getScaleSize(intScale + pType);
    var intIncrement       = Math.abs(1 - objScaleSizeAfter.width / objScaleSizeBefore.width) / 10;
    var intCounter         = 0;

    setTimeout(function _loop()
    {
      if (objScaleSizeAfter.width > objScaleSizeBefore.width ) 
      {
        var cloneObj              = JSON.parse(clone.dataset.cloneInfo);
        cloneObj.scale           += intIncrement;
        clone.dataset.cloneInfo   = JSON.stringify(cloneObj); 
      }
      else if (JSON.parse(clone.dataset.cloneInfo).scale > 0.1 ) 
      {
        var cloneObj              = JSON.parse(clone.dataset.cloneInfo);
        cloneObj.scale           -= intIncrement;
        clone.dataset.cloneInfo   = JSON.stringify(cloneObj); 
      }

      var cloneObj          = JSON.parse(clone.dataset.cloneInfo)
      clone.style.transform = 'scale(' + cloneObj.scale + ')';
      intCounter++;

      if (intCounter < 10) setTimeout(_loop, 20); else { $this.#_zoom(); $this.#lock = false; }
    }, 1);
  };

  /******************************************************************************/
  /* #addEntity                                                                 */
  /******************************************************************************/
  #addEntity (pEntity)
  {
    if (!(typeof pEntity == "object" && pEntity != null                   )) return null;
    if (!("element" in pEntity       && pEntity.element instanceof Element)) return null;

    var objEntity = { element : pEntity.element };
  /*-----* center *-------------------------------------------------------------*/
  if ("center" in pEntity)
  {
    if      ("relative" in pEntity.center)
    {
      objEntity.center               = {};
      objEntity.center.relative      = {};
      objEntity.center.relative.left = pEntity.center.relative.left;
      objEntity.center.relative.top  = pEntity.center.relative.top;
      objEntity.center.degrees       = this.#_getDegreesPosition({ relative : pEntity.center.relative });
    }
    else if ("degrees" in pEntity.center)
    {
      objEntity.center              = {};
      objEntity.center.degrees      = {};
      objEntity.center.degrees.left = pEntity.center.degrees.left;
      objEntity.center.degrees.top  = pEntity.center.degrees.top;
      objEntity.center.relative     = this.#_getRelativePosition({ degrees : pEntity.center.degrees });
    }
    else if ("offset" in pEntity.center)
    {
      objEntity.center          = {};
      objEntity.center.relative = this.#_getRelativePosition({ offset : pEntity.center.offset });
      objEntity.center.degrees  = this.#_getDegreesPosition ({ offset : pEntity.center.offset });
    }
    else if ("absolute" in pEntity.center)
    {
      objEntity.center          = {};
      objEntity.center.relative = this.#_getRelativePosition({ absolute : pEntity.center.absolute });
      objEntity.center.degrees  = this.#_getDegreesPosition ({ absolute : pEntity.center.absolute });
    }
  }
  /*-----* bounds *-------------------------------------------------------------*/
  else if ("bounds" in pEntity)
  {
    if ("relative" in pEntity.bounds)
    {
      objEntity.center               = {};
      objEntity.center.relative      = {};
      objEntity.center.relative.left = pEntity.bounds.relative.left + (pEntity.bounds.relative.right  - pEntity.bounds.relative.left) / 2;
      objEntity.center.relative.top  = pEntity.bounds.relative.top  + (pEntity.bounds.relative.bottom - pEntity.bounds.relative.top ) / 2;
      objEntity.center.degrees       = this.#_getDegreesPosition({ relative : { left : objEntity.center.relative.left, top : objEntity.center.relative.top } });

      objEntity.size                 = {};
      objEntity.size.relative        = {};
      objEntity.size.relative.width  = pEntity.bounds.relative.right  - pEntity.bounds.relative.left;
      objEntity.size.relative.height = pEntity.bounds.relative.bottom - pEntity.bounds.relative.top;

      var objLeftTop     = this.#_getDegreesPosition({ relative : { left : pEntity.bounds.relative.left , top : pEntity.bounds.relative.top    } });
      var objRightBottom = this.#_getDegreesPosition({ relative : { left : pEntity.bounds.relative.right, top : pEntity.bounds.relative.bottom } });

      objEntity.size.degrees        = {};
      objEntity.size.degrees.left   = objLeftTop    .left;
      objEntity.size.degrees.top    = objLeftTop    .top;
      objEntity.size.degrees.right  = objRightBottom.left;
      objEntity.size.degrees.bottom = objRightBottom.top;
    }
    else if ("degrees" in pEntity.bounds)
    {
      objEntity.center              = {};
      objEntity.center.degrees      = {};
      objEntity.center.degrees.left = pEntity.bounds.degrees.left + (pEntity.bounds.degrees.right  - pEntity.bounds.degrees.left) / 2;
      objEntity.center.degrees.top  = pEntity.bounds.degrees.top  + (pEntity.bounds.degrees.bottom - pEntity.bounds.degrees.top ) / 2;
      objEntity.center.relative     = this.#_getRelativePosition({ degrees : { left : objEntity.center.degrees.left, top : objEntity.center.degrees.top } });

      objEntity.size                = {};
      objEntity.size.degrees        = {};
      objEntity.size.degrees.left   = pEntity.bounds.degrees.left;
      objEntity.size.degrees.top    = pEntity.bounds.degrees.top;
      objEntity.size.degrees.right  = pEntity.bounds.degrees.right;
      objEntity.size.degrees.bottom = pEntity.bounds.degrees.bottom;

      var objLeftTop     = this.#_getRelativePosition({ degrees : { left : pEntity.bounds.degrees.left , top : pEntity.bounds.degrees.top    } });
      var objRightBottom = this.#_getRelativePosition({ degrees : { left : pEntity.bounds.degrees.right, top : pEntity.bounds.degrees.bottom } });

      objEntity.size.relative        = {};
      objEntity.size.relative.width  = objRightBottom.left - objLeftTop.left;
      objEntity.size.relative.height = objRightBottom.top  - objLeftTop.top;
    }
    else if ("offset" in pEntity.bounds)
    {
      var objRelativeLeftTop     = this.#_getRelativePosition({ offset : { left : pEntity.bounds.offset.left , top : pEntity.bounds.offset.top    } });
      var objRelativeRightBottom = this.#_getRelativePosition({ offset : { left : pEntity.bounds.offset.right, top : pEntity.bounds.offset.bottom } });
      var objDegreesLeftTop      = this.#_getDegreesPosition ({ offset : { left : pEntity.bounds.offset.left , top : pEntity.bounds.offset.top    } });
      var objDegreesRightBottom  = this.#_getDegreesPosition ({ offset : { left : pEntity.bounds.offset.right, top : pEntity.bounds.offset.bottom } });

      objEntity.center               = {};
      objEntity.center.relative      = {};
      objEntity.center.relative.left = objRelativeLeftTop.left + (objRelativeRightBottom.left - objRelativeLeftTop.left) / 2;
      objEntity.center.relative.top  = objRelativeLeftTop.top  + (objRelativeRightBottom.top  - objRelativeLeftTop.top ) / 2;
      objEntity.center.degrees       = {};
      objEntity.center.degrees .left = objDegreesLeftTop .left + (objDegreesRightBottom .left - objDegreesLeftTop .left) / 2;
      objEntity.center.degrees .top  = objDegreesLeftTop .top  + (objDegreesRightBottom .top  - objDegreesLeftTop .top ) / 2;

      objEntity.size                 = {};
      objEntity.size.relative        = {};
      objEntity.size.relative.width  = objRelativeRightBottom.left - objRelativeLeftTop.left;
      objEntity.size.relative.height = objRelativeRightBottom.top  - objRelativeLeftTop.top;
      objEntity.size.degrees         = {};
      objEntity.size.degrees .left   = objDegreesLeftTop    .left;
      objEntity.size.degrees .top    = objDegreesLeftTop    .top;
      objEntity.size.degrees .right  = objDegreesRightBottom.left;
      objEntity.size.degrees .bottom = objDegreesRightBottom.top;
    }
    else if ("absolute" in pEntity.bounds)
    {
      var objRelativeLeftTop     = this.#_getRelativePosition({ absolute : { left : pEntity.bounds.absolute.left , top : pEntity.bounds.absolute.top   , scale : pEntity.bounds.absolute.scale } });
      var objRelativeRightBottom = this.#_getRelativePosition({ absolute : { left : pEntity.bounds.absolute.right, top : pEntity.bounds.absolute.bottom, scale : pEntity.bounds.absolute.scale } });
      var objDegreesLeftTop      = this.#_getDegreesPosition ({ absolute : { left : pEntity.bounds.absolute.left , top : pEntity.bounds.absolute.top   , scale : pEntity.bounds.absolute.scale } });
      var objDegreesRightBottom  = this.#_getDegreesPosition ({ absolute : { left : pEntity.bounds.absolute.right, top : pEntity.bounds.absolute.bottom, scale : pEntity.bounds.absolute.scale } });

      objEntity.center               = {};
      objEntity.center.relative      = {};
      objEntity.center.relative.left = objRelativeLeftTop.left + (objRelativeRightBottom.left - objRelativeLeftTop.left) / 2;
      objEntity.center.relative.top  = objRelativeLeftTop.top  + (objRelativeRightBottom.top  - objRelativeLeftTop.top ) / 2;
      objEntity.center.degrees       = {};
      objEntity.center.degrees .left = objDegreesLeftTop .left + (objDegreesRightBottom .left - objDegreesLeftTop .left) / 2;
      objEntity.center.degrees .top  = objDegreesLeftTop .top  + (objDegreesRightBottom .top  - objDegreesLeftTop .top ) / 2;

      objEntity.size                 = {};
      objEntity.size.relative        = {};
      objEntity.size.relative.width  = objRelativeRightBottom.left - objRelativeLeftTop.left;
      objEntity.size.relative.height = objRelativeRightBottom.top  - objRelativeLeftTop.top;
      objEntity.size.degrees         = {};
      objEntity.size.degrees .left   = objDegreesLeftTop    .left;
      objEntity.size.degrees .top    = objDegreesLeftTop    .top;
      objEntity.size.degrees .right  = objDegreesRightBottom.left;
      objEntity.size.degrees .bottom = objDegreesRightBottom.top;
    }
  }

  if (!("center" in objEntity)) return null;
  /*-----* add entities *-------------------------------------------------------*/
    var main       = this.#mainElement;
    var aryEntities = this.#entities;

    var flgExist = aryEntities.some(function(pEntity, pIndex, pArray)
    {
    if (pEntity.element.id === objEntity.element.id)
    {
      aryEntities.splice(pIndex, 1, objEntity);

      return true;
    }
    });

    if (!flgExist) aryEntities.push(objEntity);

    objEntity.element.classList.add("k2go-tile-viewer-entity");
  /*-----* append entity *------------------------------------------------------*/
    objEntity.tileInfo = this.#_getTileInfo({ scale : this.#Options.scale, left : objEntity.center.relative.left, top : objEntity.center.relative.top });

    var tile = main.querySelector("[x='" + objEntity.tileInfo.x + "'][y='" + objEntity.tileInfo.y + "']");

    if (tile !== null) 
    {
        this.#_appendEntity(tile, objEntity);
    }

    return objEntity;
  };

  /******************************************************************************/
  /* getEntity                                                                  */
  /******************************************************************************/
  #getEntity (pElement)
  {
    var aryEntities = this.#entities;

    for (var i01 = 0; i01 < aryEntities.length; i01++)
    {
      if (aryEntities[i01].element  === pElement.element)
      {
        var objEntity = { element : aryEntities[i01].element };

        if ("center"   in aryEntities[i01]) objEntity.center   = Object.assign({}, aryEntities[i01].center  );
        if ("tileInfo" in aryEntities[i01]) objEntity.tileInfo = Object.assign({}, aryEntities[i01].tileInfo);
        if ("size"     in aryEntities[i01]) objEntity.size     = Object.assign({}, aryEntities[i01].size    );

        return objEntity;
      }
    }

    return null;
  };

  /******************************************************************************/
  /* getEntities                                                                */
  /******************************************************************************/
  #getEntities ()
  {
    var aryEntities = this.#entities;
    var aryResults  = [];

    for (var i01 = 0; i01 < aryEntities.length; i01++)
    {
      var objEntity = { element : aryEntities[i01].element };

      if ("center"   in aryEntities[i01]) objEntity.center   = Object.assign({}, aryEntities[i01].center  );
      if ("tileInfo" in aryEntities[i01]) objEntity.tileInfo = Object.assign({}, aryEntities[i01].tileInfo);
      if ("size"     in aryEntities[i01]) objEntity.size     = Object.assign({}, aryEntities[i01].size    );

      aryResults.push(objEntity);
    }

    return aryResults;
  };

  /******************************************************************************/
  /* #deleteEntity                                                              */
  /******************************************************************************/
  #deleteEntity (pElement) 
  {
    var aryEntities = this.#entities;

    for (var i01 = 0; i01 < aryEntities.length; i01++)
    {
      if (aryEntities[i01].element.id === pElement.id)
      {
        pElement.parentNode.removeChild(pElement);
        aryEntities.splice(i01, 1);
        break;
      }
    }
  };

  /******************************************************************************/
  /* #deleteAllEntity                                                           */
  /******************************************************************************/
  #deleteAllEntity () 
  {
    var entityclass = this.#mainElement.querySelectorAll(".k2go-tile-viewer-entity");

    entityclass.forEach(function(entity) 
    {
      entity.classList.remove(".k2go-tile-viewer-entity");
    });

    this.#entities = [];
  };

  /******************************************************************************/
  /* #getPositionInfo                                                           */
  /******************************************************************************/
  #getPositionInfo (pOffset) 
  {
    var objResult = {};

    objResult.offset      = {};
    objResult.offset.left = pOffset.left;
    objResult.offset.top  = pOffset.top;
    
    objResult.absolute    = this.#_getAbsolutePosition({ offset   : objResult.offset   });
    objResult.relative    = this.#_getRelativePosition({ absolute : objResult.absolute });
    objResult.degrees     = this.#_getDegreesPosition ({ absolute : objResult.absolute });
    objResult.tileInfo    = this.#_getTileInfo        ({ scale    : objResult.absolute.scale, left : objResult.relative.left, top : objResult.relative.top });

    return objResult;
  };
  /*-----* getCenterInfo *------------------------------------------------------*/
  #getCenterInfo ()
  {
    return this.#getPositionInfo(this.#_getCenterInfo().offset);
  };
  /*-----* getBoundsInfo *------------------------------------------------------*/
  #getBoundsInfo ()
  {
    var parent       = this.#mainElement.parentNode;
    var objResult     = {};

    objResult.leftTop       = this.#getPositionInfo({ left : this.#Offset(parent).left                          , top : this.#Offset(parent).top                         });
    objResult.leftBottom    = this.#getPositionInfo({ left : this.#Offset(parent).left                          , top : this.#Offset(parent).top + this.#Height(parent) });
    objResult.rightTop      = this.#getPositionInfo({ left : this.#Offset(parent).left + this.#Width(parent)    , top : this.#Offset(parent).top                         });
    objResult.rightBottom   = this.#getPositionInfo({ left : this.#Offset(parent).left + this.#Width(parent)    , top : this.#Offset(parent).top + this.#Height(parent) });

    return objResult;
  };

  /******************************************************************************/
  /* getXXXXXPosition                                                           */
  /******************************************************************************/
    #getRelativePosition(pPositionInfo) { return this.#_getRelativePosition(pPositionInfo)};
    #getAbsolutePosition(pPositionInfo) { return this.#_getAbsolutePosition(pPositionInfo)};
    #getDegreesPosition (pPositionInfo) { return this.#_getDegreesPosition (pPositionInfo)};

  /******************************************************************************/
  /* _create                                                                    */
  /******************************************************************************/
  #_create (pPositionInfo)
  {
    try
    {
      this.#_abortLoadImages();

      var $this       = this;
      var main        = this.#mainElement;
      var aryEntities = this.#entities;

      main.style.width   =       this.#Options.drawingSize       * 100 + "%";
      main.style.height  =       this.#Options.drawingSize       * 100 + "%";
      main.style.left    = ((1 - this.#Options.drawingSize) / 2) * 100 + "%";
      main.style.top     = ((1 - this.#Options.drawingSize) / 2) * 100 + "%";

      var intScale      = this.#_getAdjustScale(pPositionInfo.scale, pPositionInfo.width, pPositionInfo.height);
      var objTileInfo   = this.#_getTileInfo   ({ scale : intScale, left : pPositionInfo.left, top : pPositionInfo.top });
      var objCenterInfo = this.#_getCenterInfo ();
      
      objTileInfo.left = objCenterInfo.position.left + objTileInfo.left;
      objTileInfo.top  = objCenterInfo.position.top  + objTileInfo.top;

      this.#Options.scale = intScale;
      var entity = this.#mainElement.querySelector(".k2go-tile-viewer-entity");
      if (entity) { entity.parentNode.removeChild(entity); }
      while (this.#mainElement.firstChild) { this.#mainElement.removeChild((this.#mainElement.firstChild)) }

      for (var i01 = 0; i01 < aryEntities.length; i01++)
      {
        var objEntity = aryEntities[i01];
        objEntity.tileInfo = this.#_getTileInfo({ scale : intScale, left : objEntity.center.relative.left, top : objEntity.center.relative.top });
      }

      this.#mainElement.appendChild(this.#_getTileElement(objTileInfo));
      this.#mainElement.style.backgroundImage = '';

      if (typeof this.#Options.backgroundImage == "string")
      {
        var imageLoader = new Image();
        
        imageLoader.addEventListener('load', function() 
        {
          var objScaleSize = $this.#_getScaleSize            (intScale);
          var objPosition  = $this.#_getUpperLeftTilePosition();

          $this.#mainElement.style.backgroundImage    = "url('" + $this.#Options.backgroundImage + "')";
          $this.#mainElement.style.backgroundPosition = objPosition.left + "px " + objPosition.top + "px";
          $this.#mainElement.style.backgroundSize     = objScaleSize.width + "px " + objScaleSize.height + "px";
        });

        imageLoader.setAttribute('src', this.#Options.backgroundImage);
      }

      this.#_increment();
    }
    catch(pError)
    {
      console.error("k2goTileViewer _create error: " + pError);
    }
  };

  /******************************************************************************/
  /* _increment                                                                 */
  /******************************************************************************/
  #_increment ()
  {
    try
    {
  /*-----* variable *-----------------------------------------------------------*/
      var $this             = this;
      var main              = this.#mainElement;
      var intWidth          = this.#Width (main);
      var intHeight         = this.#Height(main);
      var tileInfo          = JSON.parse(main.firstElementChild.dataset.tileInfo);
      var objTileInfo       = { width : tileInfo.width, height : tileInfo.height };
      var objCenterInfo     = this.#_getCenterInfo      ();
      var objCenterPosition = this.#_getRelativePosition({ offset : objCenterInfo.offset });
      var objCenterTileInfo = this.#_getTileInfo        ({ scale  : this.#Options.scale, left : objCenterPosition.left, top : objCenterPosition.top });
  /*-----* _appendCenterTile *--------------------------------------------------*/
      function _appendCenterTile()
      {
        objCenterTileInfo.left = objCenterInfo.position.left + objCenterTileInfo.left;
        objCenterTileInfo.top  = objCenterInfo.position.top  + objCenterTileInfo.top;

        main.appendChild( $this.#_getTileElement(objCenterTileInfo) );
      }
  /*-----* remove right *-------------------------------------------------------*/
      if (main.children.length > 0)
      {
        var intLeft = this.#Position(main.lastElementChild).left;

        while (intWidth < intLeft)
        {
          Array.from(main.children).forEach(function(pElement, pIndex) 
          {
            if (Math.round($this.#Position(pElement).left) == Math.round(intLeft))
            {
              var entities = pElement.querySelectorAll('.k2go-tile-viewer-entity');
              entities.forEach(function(entity) { pElement.removeChild(entity); });
              pElement.parentNode.removeChild(pElement);
            }
          });

          if (main.children.length <= 1) break;
          intLeft = this.#Position(main.lastElementChild).left;
        }
      }
      else
      {
        _appendCenterTile();
      }
  /*-----* remove left *--------------------------------------------------------*/
      if (main.children.length > 0)
      {
        var intLeft  = this.#Position(main.lastElementChild).left;
        var intRight = tileInfo.width + intLeft;

        while (intRight < 0 )
        {
          Array.from(main.children).forEach(function(pElement, pIndex) 
          {
            if (Math.round($this.#Position(pElement).left) == Math.round(intLeft))
            {
              var entities = pElement.querySelectorAll('.k2go-tile-viewer-entity');
              entities.forEach(function(entity) { pElement.removeChild(entity); });
              pElement.parentNode.removeChild(pElement);
            }
          });

          if (main.children.length <= 1) break;
          intLeft  = this.#Position(main.lastElementChild).left;
          intRight = tileInfo.width + intLeft;
        }
      }
      else
      {
        _appendCenterTile();
      }
  /*-----* remove bottom *------------------------------------------------------*/
      if (main.children.length > 0)
      {
        var intTop  = this.#Position(main.lastElementChild).top;

        while ( intHeight < intTop )
        {
          Array.from(main.children).forEach(function(pElement, pIndex) 
          {
            if (Math.round($this.#Position(pElement).top) == Math.round(intTop))
            {
              var entities = pElement.querySelectorAll('.k2go-tile-viewer-entity');
              entities.forEach(function(entity) { pElement.removeChild(entity); });
              pElement.parentNode.removeChild(pElement);
            }
          });

          if (main.children.length <= 1) break;
          intTop  = this.#Position(main.lastElementChild).top;
        }
      }
      else
      {
        _appendCenterTile();
      }
  /*-----* remove top *---------------------------------------------------------*/
      if (main.children.length > 0)
      {
        var intTop    = this.#Position(main.lastElementChild).top;
        var intBottom = tileInfo.height + intTop;

        while ( intBottom < 0 )
        {
          Array.from(main.children).forEach(function(pElement, pIndex) 
          {
            if (Math.round($this.#Position(pElement).top) == Math.round(intTop))
            {
              var entities = pElement.querySelectorAll('.k2go-tile-viewer-entity');
              entities.forEach(function(entity) { pElement.removeChild(entity); });
              pElement.parentNode.removeChild(pElement);
            }
          });

          if (main.children.length <= 1) break;
          intTop    = this.#Position(main.lastElementChild).top;
          intBottom = tileInfo.height + intTop;
        }
      }
      else
      {
        _appendCenterTile();
      }
  /*-----* append right *-------------------------------------------------------*/
      if (main.children.length < 1) _appendCenterTile();

      var intLeft  = this.#Position(main.lastElementChild).left;
      var intRight = tileInfo.width + intLeft;

      while (intRight < intWidth)
      {
        Array.from(main.children).forEach(function(pElement, pIndex)  
        {
          if (Math.round($this.#Position(pElement).left) == Math.round(intLeft))
          {
            var pElementobj  = JSON.parse(pElement.dataset.tileInfo);
            objTileInfo.x    = pElementobj.x + 1;
            objTileInfo.y    = pElementobj.y;
            objTileInfo.left = $this.#Position(pElement).left + objTileInfo.width;
            objTileInfo.top  = $this.#Position(pElement).top;

            pElement.insertAdjacentElement('afterend', $this.#_getTileElement(objTileInfo));
          }
        });

        intLeft  = this.#Position(main.lastElementChild).left;
        intRight = tileInfo.width + intLeft;
      }
  /*-----* prepend left *-------------------------------------------------------*/
      var intLeft     = this.#Position(main.firstElementChild).top;
      
      while (intLeft > 0 ) {
        Array.from(main.children).forEach(function(pElement, pIndex)  
        {
          if (Math.round($this.#Position(pElement).left) == Math.round(intLeft))
          {
            var pElementobj  = JSON.parse(pElement.dataset.tileInfo);
            objTileInfo.x    = pElementobj.x - 1;
            objTileInfo.y    = pElementobj.y;
            objTileInfo.left = $this.#Position(pElement).left - objTileInfo.width;
            objTileInfo.top  = $this.#Position(pElement).top;

            pElement.insertAdjacentElement('beforebegin', $this.#_getTileElement(objTileInfo));
          }
        });
        
        intLeft = $this.#Position(main.firstElementChild).left;
      }
  /*-----* append bottom *------------------------------------------------------*/
      var intTop    = this.#Position(main.lastElementChild).top;
      var intBottom = JSON.parse(main.lastElementChild.dataset.tileInfo).height + intTop;

      while (intBottom < intHeight )
      {
        Array.from(main.children).forEach(function(pElement, pIndex)  
        {
          if (Math.round($this.#Position(pElement).top) == Math.round(intTop))
          {
            var pElementobj  = JSON.parse(pElement.dataset.tileInfo);
            objTileInfo.x    = pElementobj.x;
            objTileInfo.y    = pElementobj.y + 1;
            objTileInfo.left = $this.#Position(pElement).left;
            objTileInfo.top  = $this.#Position(pElement).top + objTileInfo.height;

            pElement.insertAdjacentElement('afterend', $this.#_getTileElement(objTileInfo));
          }
        });

        var mainObj  = JSON.parse(main.lastElementChild.dataset.tileInfo);
        intTop       = this.#Position(main.lastElementChild).top;
        intBottom    = mainObj.height + intTop;
      }
  /*-----* prepend top *--------------------------------------------------------*/
      var intTop = this.#Position(main.firstElementChild).top;

      while (intTop > 0)
      {
        Array.from(main.children).forEach(function(pElement, pIndex)  
        {
          if (Math.round($this.#Position(pElement).top) == Math.round(intTop))
          {
            var pElementobj  = JSON.parse(pElement.dataset.tileInfo);
            objTileInfo.x    = pElementobj.x;
            objTileInfo.y    = pElementobj.y - 1;
            objTileInfo.left = $this.#Position(pElement).left;
            objTileInfo.top  = $this.#Position(pElement).top - objTileInfo.height;

            pElement.insertAdjacentElement('beforebegin', $this.#_getTileElement(objTileInfo));
          }
        });

        intTop = this.#Position(main.firstElementChild).top;
      }
    }
    catch(pError)
    {
      console.error("k2goTileViewer _increment error: " + pError);
    }
  };

  /******************************************************************************/
  /* _move                                                                      */
  /******************************************************************************/
  #_move (pPosition)
  {
    try
    {
      var $this       = this;
      var main       = this.#mainElement;
      var objPosition = Object.assign({ left : 0, top : 0 }, pPosition);

      if (this.#Options.disableMove) return;

      var children = Array.from(main.children);
      
      children.forEach((child) => 
      {
        child.style.left = (parseFloat(child.style.left) || 0) + objPosition.left + "px";
        child.style.top  = (parseFloat(child.style.top)  || 0) + objPosition.top  + "px";
      });

      if (typeof this.#Options.backgroundImage == "string")
      {
        var style      = window.getComputedStyle(main);
        var bgPosition = style.backgroundPosition.split(" ");
        var intLeft    = parseFloat(bgPosition[0]);
        var intTop     = parseFloat(bgPosition[1]);

        main.style.backgroundPosition = ( (intLeft || 0 ) + objPosition.left) + "px " + (( intTop|| 0 ) + objPosition.top) + "px";
      }

      if (typeof this.#Options.move == "function") setTimeout(function() { $this.#Options.move(objPosition); }, 1);
    }
    catch(pError)
    {
        console.error("k2goTileViewer _move error: " + pError);
    }
  };

  /******************************************************************************/
  /* _moveAdjust                                                                */
  /******************************************************************************/
  #_moveAdjust ()
  {
    try
    {
      var main          = this.#mainElement;
      var parent        = main.parentElement;
      var objScale      = this.#Options.scales[this.#Options.scale];
      var left          = Array.from(main.children).find(child => child.getAttribute('x') === '0');
      var right         = Array.from(main.children).find(child => child.getAttribute('x') === String(objScale.count - 1));
      var top           = Array.from(main.children).find(child => child.getAttribute('y') === '0');
      var bottom        = Array.from(main.children).find(child => child.getAttribute('y') === String(objScale.count - 1));
      var objPosition   = { left : 0, top : 0 };

      if (left   && this.#Offset(left)  .left                         > this.#Offset(parent).left + this.#Width (parent) ) objPosition.left = this.#Offset(parent).left + this.#Width (parent)  - this.#Offset(left)  .left  - this.#Width (left)   / 2;
      if (top    && this.#Offset(top)   .top                          > this.#Offset(parent).top  + this.#Height(parent) ) objPosition.top  = this.#Offset(parent).top  + this.#Height(parent)  - this.#Offset(top)   .top   - this.#Height(top)    / 2;
      if (right  && this.#Offset(right) .left + this.#Width (right)   < this.#Offset(parent).left                        ) objPosition.left = this.#Offset(parent).left                         - this.#Offset(right) .left  - this.#Width (right)  / 2;
      if (bottom && this.#Offset(bottom).top  + this.#Height(bottom)  < this.#Offset(parent).top                         ) objPosition.top  = this.#Offset(parent).top                          - this.#Offset(bottom).top   - this.#Height(bottom) / 2;

      if (objPosition.left != 0 || objPosition.top != 0) this.#_move(objPosition);
    }
    catch(pError)
    {
      console.error("k2goTileViewer _moveAdjust error: " + pError);
    }
  };

  /******************************************************************************/
  /* #_createClone                                                              */
  /******************************************************************************/
  #_createClone (pPosition)
  {
    try
    {
      var main       = this.#mainElement;
      var clone      = main.cloneNode(true);
      var parent     = main.parentNode;

      if (typeof pPosition == "undefined")
      {
        pPosition   = {};
        pPosition.x = this.#Offset(parent).left + this.#Width (parent) / 2;
        pPosition.y = this.#Offset(parent).top  + this.#Height(parent) / 2;
      }

      var cloneEntities = clone.querySelectorAll(".k2go-tile-viewer-entity");
      for (var i = 0; i < cloneEntities.length; i++) { cloneEntities[i].parentNode.removeChild(cloneEntities[i]); }

      clone.classList.add("k2go-tile-viewer-clone");
      clone.dataset.cloneInfo     = JSON.stringify({ x : pPosition.x, y : pPosition.y, scale : 1 });
      clone.style.left            = this.#Position(main).left + "px";
      clone.style.top             = this.#Position(main).top  + "px";
      clone.style.transformOrigin = (pPosition.x - this.#Offset(main).left) + "px " + (pPosition.y - this.#Offset(main).top) + "px";

      clone.addEventListener("contextmenu", function(e) { e.preventDefault(); });
      main.insertAdjacentElement('afterend', clone);
      main.style.opacity = "0.01";
    }
    catch(pError)
    {
      console.error("k2goTileViewer _createClone error: " + pError);
    }
  };

  /******************************************************************************/
  /* _removeClone                                                               */
  /******************************************************************************/
  #_removeClone (pCallBack, pArgs)
  {
    try
    {
      var $this           = this;
      var main            = this.#mainElement;
      var clone           = this.shadowRoot.querySelector('.k2go-tile-viewer-clone');
      var parent          = main.parentNode;
      var intScaleCount   = this.#Options.scales[this.#Options.scale].count - 1;
      var intImageCount   = Array.isArray(this.#Options.foregroundImages) ? this.#Options.foregroundImages.length : 0;
      var intParentLeft   = this.#Offset(parent).left;
      var intParentTop    = this.#Offset(parent).top;
      var intParentRight  = this.#Width (parent) + intParentLeft;
      var intParentBottom = this.#Height(parent) + intParentTop;
      var intTimer        = Date.now();

      setTimeout(function _sleep()
      {
        var flgComplate = true;

        Array.from(main.children).forEach(function(pElement, pIndex) 
        {
          var objTileInfo = JSON.parse(pElement.dataset.tileInfo);

          if (0 <= objTileInfo.x && objTileInfo.x <= intScaleCount && 0 <= objTileInfo.y && objTileInfo.y <= intScaleCount)
          {
            var intLeft     = $this.#Offset(pElement).left;
            var intTop      = $this.#Offset(pElement).top;
            var intRight    = $this.#Width (pElement) + intLeft;
            var intBottom   = $this.#Height(pElement) + intTop;
        
            if ((intParentLeft <= intLeft  && intLeft  <= intParentRight && (intParentTop <= intTop && intTop <= intParentBottom || intParentTop <= intBottom && intBottom <= intParentBottom))
            ||  (intParentLeft <= intRight && intRight <= intParentRight && (intParentTop <= intTop && intTop <= intParentBottom || intParentTop <= intBottom && intBottom <= intParentBottom)))
            {
              if (pElement.querySelectorAll(".k2go-tile-viewer-image").length + pElement.querySelectorAll(".k2go-tile-viewer-no-image").length < intImageCount)
              {
                flgComplate = false;
                return false;
              }
            }
          }
        });

        if (!flgComplate && Date.now() - intTimer < $this.#Options.timeout)
        {
          setTimeout(_sleep, 100);
        }
        else
        {
          $this.#mainElement.style.opacity = "";
          clone.style.transition           = 'opacity 200ms';
          clone.style.opacity              = '0';
          setTimeout(function() {  clone.remove(); }, 200);

          if (typeof pCallBack == "object") setTimeout(function() { pCallBack(pArgs); }, 1);
        }
      }, 1);
    }
    catch(pError)
    {
      console.error("k2goTileViewer _removeClone error: " + pError);
    }
  };

  /******************************************************************************/
  /* _zoom                                                                      */
  /******************************************************************************/
  #_zoom ()
  {
    try
    {
  /*-----* variable *-----------------------------------------------------------*/
      var main               = this.#mainElement;
      var clone              = this.shadowRoot.querySelector(".k2go-tile-viewer-clone");
      var cloneObj           = JSON.parse(clone.dataset.cloneInfo);
      var parent             = main.parentNode;
      var aryScales          = this.#Options.scales;
      var intScaleBefore     = this.#Options.scale;
      var intScaleAfter      = 0;
      var objScaleSizeBefore = this.#_getScaleSize(intScaleBefore);
      var objScaleSizeAfter  = { width : objScaleSizeBefore.width * cloneObj.scale, height : objScaleSizeBefore.height * cloneObj.scale };
  /*-----* after scale *--------------------------------------------------------*/
      for (var i01 = 1; i01 < aryScales.length; i01++)
      {
        var objScaleSizeClosest = this.#_getScaleSize(intScaleAfter);
        var objScaleSizeCurrent = this.#_getScaleSize(i01     );
        var intClosestDiff      = Math.abs(objScaleSizeAfter.width - objScaleSizeClosest.width);
        var intCurrentDiff      = Math.abs(objScaleSizeAfter.width - objScaleSizeCurrent.width);

        if (intCurrentDiff < intClosestDiff) intScaleAfter = i01;
      }

      objScaleSizeAfter = this.#_getScaleSize(intScaleAfter);
  /*-----* after center tile *--------------------------------------------------*/
      var objCenterInfo = this.#_getCenterInfo           ();
      var objPosition   = this.#_getUpperLeftTilePosition();

      objPosition.left += this.#Offset(main).left;
      objPosition.top  += this.#Offset(main).top ;
      objPosition.left  = (cloneObj.x - objPosition.left) / objScaleSizeBefore.width;
      objPosition.top   = (cloneObj.y - objPosition.top ) / objScaleSizeBefore.height;
      objPosition.left  =  cloneObj.x - objScaleSizeAfter.width  * objPosition.left;
      objPosition.top   =  cloneObj.y - objScaleSizeAfter.height * objPosition.top;
      objPosition.left  = (objCenterInfo.offset.left - objPosition.left) / objScaleSizeAfter.width;
      objPosition.top   = (objCenterInfo.offset.top  - objPosition.top ) / objScaleSizeAfter.height;
  /*-----* create *-------------------------------------------------------------*/
      this.#_create     ({ scale : intScaleAfter, width : this.#Width(parent), height : this.#Height(parent), left : objPosition.left, top : objPosition.top });
      this.#_removeClone( this.#Options.zoomEnd(), { beforeScale : intScaleBefore, afterScale : intScaleAfter });
    }
    catch(pError)
    {
      console.error("k2goTileViewer _zoom error: " + pError);
    }
  };

  /******************************************************************************/
  /* _getCenterInfo                                                             */
  /******************************************************************************/
  #_getCenterInfo ()
  {
    try
    {
      var main         = this.#mainElement;
      var parent       = main.parentNode;
      var objCenterInfo = { position : {}, offset : {} };

      objCenterInfo.position.left = this.#Width (parent) / 2     - this.#Position(main).left;
      objCenterInfo.position.top  = this.#Height(parent) / 2     - this.#Position(main).top;
      objCenterInfo.offset.  left = objCenterInfo.position.left  + this.#Offset  (main).left;
      objCenterInfo.offset.  top  = objCenterInfo.position.top   + this.#Offset  (main).top;

      return objCenterInfo; 
    }
    catch(pError)
    {
      console.error("k2goTileViewer _getCenterInfo error: " + pError);
    }
  };

  /******************************************************************************/
  /* #_getUpperLeftTilePosition                                                 */
  /******************************************************************************/
  #_getUpperLeftTilePosition ()
  {
    try
    {
      var tile       = this.#mainElement.firstElementChild;
      var tileInfo    = JSON.parse(tile.dataset.tileInfo);
      var objPosition = {};

      objPosition.left = this.#Position(tile).left - tileInfo.width  * tileInfo.x;
      objPosition.top  = this.#Position(tile).top  - tileInfo.height * tileInfo.y;

      return objPosition;
    }
    catch(pError)
    {
      console.error("k2goTileViewer _getUpperLeftTilePosition error: " + pError); 
    }
  };

  /******************************************************************************/
  /* #_getTileInfo                                                              */
  /******************************************************************************/
  #_getTileInfo (pPosition)
  {
    try
    {
      var objScale    = this.#Options.scales[pPosition.scale];
      var objResult   = {};

      objResult.width  = objScale .width  * objScale.size;
      objResult.height = objScale .height * objScale.size;
      objResult.left   = objResult.width  * objScale.count * pPosition.left;
      objResult.top    = objResult.height * objScale.count * pPosition.top;
      objResult.x      = Math.floor(objResult.left / objResult.width );
      objResult.y      = Math.floor(objResult.top  / objResult.height);
      objResult.left   = (objResult.left - objResult.width  * objResult.x) * -1;
      objResult.top    = (objResult.top  - objResult.height * objResult.y) * -1;

      return objResult;
    }
    catch(pError)
    {
      console.error("k2goTileViewer _getTileInfo error: " + pError);
    }
  };

  /******************************************************************************/
  /* #_getTileElement                                                           */
  /******************************************************************************/
  #_getTileElement (pTileInfo)
  {
    try
    {
  /*-----* variable *-----------------------------------------------------------*/     
      var $this           = this;
      var main            = this.#mainElement;
      var parent          = this.#mainElement.parentNode;
      var objScale        = this.#Options.scales[this.#Options.scale];
      var aryEntities     = this.#entities;
      var tile            = document.createElement("div");
      var intParentLeft   = this.#Offset(parent).left;
      var intParentTop    = this.#Offset(parent).top ;
      var intParentRight  = this.#Width (parent) + intParentLeft;
      var intParentBottom = this.#Height(parent) + intParentTop;
  /*-----* create tile element *------------------------------------------------*/
      tile.dataset.tileInfo = JSON.stringify(pTileInfo);
      tile.setAttribute('x', pTileInfo.x);
      tile.setAttribute('y', pTileInfo.y);
      tile.style.left     = pTileInfo.left + "px";
      tile.style.top      = pTileInfo.top + "px";
      tile.style.width    = pTileInfo.width + "px";
      tile.style.height   = pTileInfo.height + "px";
  /*-----* append image *-------------------------------------------------------*/
      if ( 'foregroundImages' in this.#Options 
      &&  0 <= pTileInfo.x && pTileInfo.x < objScale.count
      &&  0 <= pTileInfo.y && pTileInfo.y < objScale.count )
      {
        var intLeft   = pTileInfo.left   + this.#Offset(main).left;
        var intTop    = pTileInfo.top    + this.#Offset(main).top ;
        var intRight  = pTileInfo.width  + intLeft;
        var intBottom = pTileInfo.height + intTop;

        if ((intParentLeft <= intLeft  && intLeft  <= intParentRight && (intParentTop <= intTop && intTop <= intParentBottom || intParentTop <= intBottom && intBottom <= intParentBottom))
        ||  (intParentLeft <= intRight && intRight <= intParentRight && (intParentTop <= intTop && intTop <= intParentBottom || intParentTop <= intBottom && intBottom <= intParentBottom)))
        {
          this.#Options.foregroundImages.forEach( function(pUrl, pIndex) { $this.#_appendTileImage(tile, objScale, pIndex, pUrl); });
        }
        else
        {
          this.#Options.foregroundImages.forEach( function(pUrl, pIndex) { setTimeout(function() {$this.#_appendTileImage(tile, objScale, pIndex, pUrl);},100); });
        }
      }
  /*-----* append entity *------------------------------------------------------*/
      for (var i01 = 0; i01 < aryEntities.length; i01++)
      {
        var objEntity = aryEntities[i01];

        if (objEntity.tileInfo.x == pTileInfo.x && objEntity.tileInfo.y == pTileInfo.y)
        {
          this.#_appendEntity(tile, objEntity);
        }
      }

      if (typeof $this.#Options.addTile == "function") setTimeout(function() { $this.#Options.addTile(tile, JSON.parse(tile.dataset.tileInfo)); }, 1);
      
      return tile;
    }
    catch(pError)
    {
      console.error("k2goTileViewer _getTileElement error: " + pError);
    }
  };

  /******************************************************************************/
  /* #_appendTileImage                                                          */
  /******************************************************************************/
  #_appendTileImage (pTileElement, pScaleInfo, pIndex, pUrl)
  {
    try
    {
      if (pTileElement.querySelectorAll.length == 0) return;

      var strDataName = "image" + pIndex + ".k2goTileViewer";

      var imgElement = document.createElement('img');
      imgElement.className = 'k2go-tile-viewer-image';
      pTileElement.dataset[strDataName] = imgElement;

      imgElement.addEventListener("load", function() 
      {
        setTimeout(function() 
        {
          pTileElement.appendChild(imgElement);
          delete pTileElement.dataset[strDataName];
        }, 1);
      });

      imgElement.addEventListener("error", function()
      {
        setTimeout(function() 
        {
          var errorDiv = document.createElement('div');
          errorDiv.className = 'k2go-tile-viewer-no-image';
          pTileElement.appendChild(errorDiv);
          delete pTileElement.dataset[strDataName];
        }, 1);
      });

      imgElement.style.zIndex = pIndex;
      imgElement.src = this.#_formatUrl(pUrl, JSON.parse(pTileElement.dataset.tileInfo), pScaleInfo);

    }
    catch(pError)
    {
      console.error("k2goTileViewer _appendTileImage error: " + pError);
    }
  };

  /******************************************************************************/
  /* _abortLoadImages                                                           */
  /******************************************************************************/
  #_abortLoadImages ()
  {
    try
    {
      var main         = this.#mainElement;
      var intImageCount = Array.isArray(this.#Options.foregroundImages) ? this.#Options.foregroundImages.length : 0;

      Array.from(main.children).forEach(function(pElement, pIndex) 
      {
        for (var i01 = 0; i01 < intImageCount; i01++) 
        {
          var strDataName = "image" + i01 + ".k2goTileViewer";
          var image = pElement.dataset[strDataName];
      
          if (image instanceof HTMLImageElement) 
          {
            image.src = "";
            delete pElement.dataset[strDataName];
          }
        }
      });
    }
    catch(pError)
    {
      console.error("k2goTileViewer _abortLoadImages error: " + pError);
    }
  };

  /******************************************************************************/
  /* #_appendEntity                                                             */
  /******************************************************************************/
  #_appendEntity (pTileElement, pEntity)
  {
    try
    {
      if (pTileElement == undefined) return; 

      var intIndex = 'foregroundImages' in this.#Options ? this.#Options.foregroundImages.length : 0;

      if ("size" in pEntity)
      {
        var objScaleSize = this.#_getScaleSize(this.#Options.scale);
        pEntity.element.style.width  = (objScaleSize.width  * pEntity.size.relative.width ) + "px";
        pEntity.element.style.height = (objScaleSize.height * pEntity.size.relative.height) + "px";
      }

      pEntity.element.style.left   = pEntity.tileInfo.left * -1 - parseInt(pEntity.element.style.width)  / 2 + "px";
      pEntity.element.style.top    = pEntity.tileInfo.top  * -1 - parseInt(pEntity.element.style.height) / 2 + "px";
      pEntity.element.style.zIndex = intIndex;
      pTileElement.appendChild(pEntity.element);

    }
    catch(pError)
    {
      console.error("k2goTileViewer _appendEntity error: " + pError);
    }
  };

  /******************************************************************************/
  /* #_getScaleSize                                                             */
  /******************************************************************************/
  #_getScaleSize (pScale)
  {
    try
    {
      var objScale  = this.#Options.scales[pScale];
      var objSize   = {};

      objSize.width  = objScale.width  * objScale.size * objScale.count;
      objSize.height = objScale.height * objScale.size * objScale.count;

      return objSize;
    }
    catch(pError)
    {
      console.error("k2goTileViewer _getScaleSize error: " + pError);
    }
  };

  /******************************************************************************/
  /* _getAdjustScale                                                            */
  /******************************************************************************/
  #_getAdjustScale (pScale, pWidth, pHeight)
  {
    try
    {
      var main            = this.#mainElement;
      var parent          = main.parentNode;
      var aryScales       = this.#Options.scales;
      var objScaleSize    = this.#_getScaleSize(pScale);
      var intWidth        = Math.floor(pWidth ) / objScaleSize.width;
      var intHeight       = Math.floor(pHeight) / objScaleSize.height;
      var intParentWidth  = this.#Width(parent) + 1;
      var intParentHeight = this.#Height(parent) + 1;

      for (var intScale = aryScales.length - 1; intScale >= 0; intScale--)
      {
        objScaleSize = this.#_getScaleSize(intScale);

        if (objScaleSize.width  * intWidth  <= intParentWidth
        &&  objScaleSize.height * intHeight <= intParentHeight)
        {
          break;
        }
      }

      return intScale >= 0 ? intScale : 0;
    }
    catch(pError)
    {
      console.error("k2goTileViewer _getAdjustScale error: " + pError);
    }
  };

  /******************************************************************************/
  /* #_getRelativePosition                                                      */
  /******************************************************************************/
  #_getRelativePosition (pPositionInfo)
  {
    try
    {
      var objPosition = { left : 0, top : 0 };
  /*-----* absolute *-----------------------------------------------------------*/
      if ("absolute" in pPositionInfo)
      {
        var objScaleSize = this.#_getScaleSize(pPositionInfo.absolute.scale);

        objPosition.left = pPositionInfo.absolute.left / objScaleSize.width;
        objPosition.top  = pPositionInfo.absolute.top  / objScaleSize.height;
      }
  /*-----* offset *-------------------------------------------------------------*/
      else if ("offset" in pPositionInfo)
      {
        return this.#_getRelativePosition({ absolute : this.#_getAbsolutePosition(pPositionInfo) });
      }
  /*-----* degrees *------------------------------------------------------------*/
      else if ("degrees" in pPositionInfo)
      {
        pPositionInfo.degrees.scale = this.#Options.scales.length - 1;
        return this.#_getRelativePosition({ absolute : this.#_getAbsolutePosition(pPositionInfo) });
      }

      return objPosition;
    }
    catch(pError)
    {
      console.error("k2goTileViewer _getAdjustScale error: " + pError);
    }
  };

  /******************************************************************************/
  /* #_getAbsolutePosition                                                      */
  /******************************************************************************/
  #_getAbsolutePosition (pPositionInfo)
  {
    try
    {
      var main               = this.#mainElement;
      var objPosition = { scale : 0, left : 0, top : 0 };
  /*-----* relative *-----------------------------------------------------------*/
      if ("relative" in pPositionInfo)
      {
        var objScaleSize = this.#_getScaleSize(pPositionInfo.relative.scale);

        objPosition.scale =                       pPositionInfo.relative.scale;
        objPosition.left  = objScaleSize.width  * pPositionInfo.relative.left;
        objPosition.top   = objScaleSize.height * pPositionInfo.relative.top;
      }
  /*-----* offset *-------------------------------------------------------------*/
      else if ("offset" in pPositionInfo)
      {
        objPosition        = this.#_getUpperLeftTilePosition();
        objPosition.scale  = this.#Options.scale;
        objPosition.left  += this.#Offset(main).left;
        objPosition.top   += this.#Offset(main).top ;
        objPosition.left   = pPositionInfo.offset.left - objPosition.left;
        objPosition.top    = pPositionInfo.offset.top  - objPosition.top;
      }
  /*-----* degrees(standard) *--------------------------------------------------*/
      else if ("degrees" in pPositionInfo)
      {
          var objPositionInfo     = Object.assign( {}, pPositionInfo );
          var objScale            = this.#Options.scales[objPositionInfo.degrees.scale];
          var strGeodeticSystem   = this.#Options.geodeticSystem;

          if (strGeodeticSystem == "standard")
          {
            var intOrginLeft = -1 * (2 * 6378137 * Math.PI /   2);
            var intOrginTop  =       2 * 6378137 * Math.PI /   2;
            var intUnit      =       2 * 6378137 * Math.PI / (objScale.width * objScale.size) / Math.pow(2, objScale.zoom);

            objPosition.scale =                            objPositionInfo.degrees.scale;
            objPosition.left  =                            objPositionInfo.degrees.left                                          * 20037508.34 / 180.0;
            objPosition.top   = (Math.log(Math.tan((90.0 + objPositionInfo.degrees.top) * Math.PI / 360.0)) / (Math.PI / 180.0)) * 20037508.34 / 180.0;
            objPosition.left  = (objPosition.left - intOrginLeft   ) / intUnit;
            objPosition.top   = (intOrginTop      - objPosition.top) / intUnit;
          }
  /*-----* degrees(himawari.fd) *-----------------------------------------------*/
        else if (strGeodeticSystem == "himawari8.fd")
        {
          if (objPositionInfo.degrees.left < 0) objPositionInfo.degrees.left = 180 + (180 + objPositionInfo.degrees.left);

          var objScaleSize = this.#_getScaleSize(objPositionInfo.degrees.scale);
          var objMargin    = { top : 0.006, right : 0.0045, bottom : 0.006, left : 0.0045 };
          var intLeft      = ((objPositionInfo.degrees.left + 180 - 140.7) % 360.0 - 180.0) / 180.0 * Math.PI;
          var intTop       = ((objPositionInfo.degrees.top  + 90.0       ) % 180.0 -  90.0) / 180.0 * Math.PI;
          var intRadius    = objScaleSize.width * (1.0 - objMargin.right - objMargin.left)   / 2;
          var e2           = 0.00669438003;
          var n            = intRadius / Math.sqrt(1.0 - e2 * Math.sin(intTop) * Math.sin(intTop));
          var theta        = 0.1535;
          var f            = 6.613;
          var vrad         = 81.3025 / 180.0 * Math.PI;

          if (intLeft < -vrad) intLeft = -vrad;
          if (intLeft >  vrad) intLeft =  vrad;
          if (intTop  < -vrad) intTop  = -vrad;
          if (intTop  >  vrad) intTop  =  vrad;

          var z = intRadius * f - (n * Math.cos(intTop) * Math.cos(intLeft));

          objPosition.scale = objPositionInfo.degrees.scale;
          objPosition.left  =  n * Math.cos(intTop) * Math.sin(intLeft);
          objPosition.top   = (n * (1.0 - e2))      * Math.sin(intTop );
          objPosition.left  = objScaleSize.width / 2 * Math.atan(objPosition.left / z) / theta;
          objPosition.top   = objScaleSize.width / 2 * Math.atan(objPosition.top  / z) / theta;
          objPosition.left += objScaleSize.width / 2;
          objPosition.top   = objScaleSize.width / 2 - objPosition.top;
        }
  /*-----* degrees(himawari.jp) *-----------------------------------------------*/
        else if (strGeodeticSystem == "himawari8.jp")
        {
          var objScaleSize = this.#_getScaleSize(objPositionInfo.degrees.scale);
          var intX         = (objPositionInfo.degrees.left + 180) % 360 - 180;
          var intY         = (objPositionInfo.degrees.top  +  90) % 180 -  90;

          if (intX < 119  ) intX = 119;
          if (intX > 152  ) intX = 152;
          if (intY <  21.5) intY =  21.5;
          if (intY >  48.5) intY =  48.5;

          objPosition.scale = objPositionInfo.degrees.scale;
          objPosition.left  = objScaleSize.width  *      (intX - 119.0) / (152.0 - 119.0);
          objPosition.top   = objScaleSize.height * (1 - (intY -  21.5) / ( 48.5 -  21.5));
        }
      }

      return objPosition;
    }
    catch(pError)
    {
      console.error("k2goTileViewer _getAbsolutePosition error: " + pError);
    }

  };

  /******************************************************************************/
  /* #_getDegreesPosition                                                       */
  /******************************************************************************/
  #_getDegreesPosition (pPositionInfo)
  {
    try
    {
      var objPosition = { left : 0, top : 0 };
    /*-----* absolute(standard) *-------------------------------------------------*/
      if ("absolute" in pPositionInfo)
      {
        var objScale            = this.#Options.scales[pPositionInfo.absolute.scale];
        var strGeodeticSystem   = this.#Options.geodeticSystem;

        if ( strGeodeticSystem == "standard" )
        {
          var intOrgLeft = -1 * (2 * 6378137 * Math.PI / 2);
          var intOrgTop  =       2 * 6378137 * Math.PI / 2;
          var intUnit    =       2 * 6378137 * Math.PI / (objScale.width * objScale.size) / Math.pow(2, objScale.zoom);

          objPosition.left = intOrgLeft + pPositionInfo.absolute.left * intUnit;
          objPosition.top  = intOrgTop  - pPositionInfo.absolute.top  * intUnit;
          objPosition.left =                    objPosition.left * 180     / 20037508.34;
          objPosition.top  = Math.atan(Math.exp(objPosition.top  * Math.PI / 20037508.34)) * 360 / Math.PI - 90;                 
        }
  /*-----* absolute(himawari.fd) *----------------------------------------------*/
        else if (strGeodeticSystem == "himawari8.fd")
        {
          var objScaleSize = this.#_getScaleSize(pPositionInfo.absolute.scale);
          var DEGTORAD     = Math.PI / 180.0;
          var RADTODEG     = 180.0 / Math.PI;
          var SCLUNIT      = 1.525878906250000e-05;
          var coff         = 5500.5;
          var loff         = 5500.5;
          var cfac         = 40932549;
          var lfac         = 40932549;
          var satDis       = 42164.0;
          var projParam3   = 1.006739501;
          var projParamSd  = 1737122264.0;
          var subLon       = 140.7;
          var c            = 11000 * (pPositionInfo.absolute.left / objScaleSize.width );
          var l            = 11000 * (pPositionInfo.absolute.top  / objScaleSize.height);
          var x            = DEGTORAD * (c - coff) / (SCLUNIT * cfac);
          var y            = DEGTORAD * (l - loff) / (SCLUNIT * lfac);
          var Sd           = (satDis * Math.cos(x) * Math.cos(y)) * (satDis * Math.cos(x) * Math.cos(y)) - (Math.cos(y) * Math.cos(y) + projParam3 * Math.sin(y) * Math.sin(y)) * projParamSd;

          Sd = Math.sqrt(Sd);

          var Sn           = (satDis * Math.cos(x) * Math.cos(y) - Sd) / (Math.cos(y) * Math.cos(y) + projParam3 * Math.sin(y) * Math.sin(y));
          var S1           =  satDis - (Sn * Math.cos(x) * Math.cos(y));
          var S2           =  Sn * Math.sin(x) * Math.cos(y);
          var S3           = -Sn * Math.sin(y);
          var Sxy          = Math.sqrt(S1 * S1 + S2 * S2);

          objPosition.left = RADTODEG * Math.atan2(S2, S1) + subLon;
          objPosition.top  = RADTODEG * Math.atan (projParam3 * S3 / Sxy);

          while (objPosition.left >  180.0) objPosition.left = objPosition.left - 360.0;
          while (objPosition.left < -180.0) objPosition.left = objPosition.left + 360.0;
        }
  /*-----* absolute(himawari.jp) *----------------------------------------------*/
        else if (strGeodeticSystem == "himawari8.jp")
        {
          var objScaleSize = this.#_getScaleSize(pPositionInfo.absolute.scale);

          objPosition.left = pPositionInfo.absolute.left * (152.0 - 119.0) / objScaleSize.width + 119.0;
          objPosition.top  = (1 - pPositionInfo.absolute.top / objScaleSize.height) * (48.5 - 21.5) + 21.5;
          objPosition.left = (objPosition.left + 180) % 360 - 180;
          objPosition.top  = (objPosition.top  +  90) % 180 -  90;
        }
      }
  /*-----* relative *-----------------------------------------------------------*/
      else if ("relative" in pPositionInfo)
      {
        pPositionInfo.relative.scale = this.#Options.scales.length - 1;
        return this.#_getDegreesPosition({ absolute : this.#_getAbsolutePosition(pPositionInfo) });
      }
  /*-----* offset *-------------------------------------------------------------*/
      else if ("offset" in pPositionInfo)
      {
        return this.#_getDegreesPosition({ absolute : this.#_getAbsolutePosition(pPositionInfo) });
      }

      return objPosition;
    }
    catch(pError)
    {
      console.error("k2goTileViewer _getDegreesPosition error: " + pError);
    }
  };

  /******************************************************************************/
  /* _formatUrl                                                                 */
  /******************************************************************************/
  #_formatUrl (pUrl, pTileInfo, pScaleInfo)
  {
    try
    {
      var strResult = pUrl;

      strResult = strResult.replace(/%x/g  ,  pTileInfo .x                        .toString());
      strResult = strResult.replace(/%y/g  ,  pTileInfo .y                        .toString());
      strResult = strResult.replace(/%ws/g , (pScaleInfo.width  * pScaleInfo.size).toString());
      strResult = strResult.replace(/%hs/g , (pScaleInfo.height * pScaleInfo.size).toString());
      strResult = strResult.replace(/%w/g  ,  pScaleInfo.width                    .toString());
      strResult = strResult.replace(/%h/g  ,  pScaleInfo.height                   .toString());
      strResult = strResult.replace(/%c/g  ,  pScaleInfo.count                    .toString());
      if (typeof pScaleInfo.zoom == "number")
      strResult = strResult.replace(/%z/g  ,  pScaleInfo.zoom                     .toString());

      return strResult;
    }
    catch(pError)
    {
      console.error("k2goTileViewer _formatUrl error: " + pError);
    }
  };

  /******************************************************************************/
  /* callMethod                                                                 */
  /******************************************************************************/
  callMethod(methodName , ...args) 
  {
    if (methodName === "create"             )   { return this.#create(...args);              };
    if (methodName === "addEntity"          )   { return this.#addEntity(...args);           };
    if (methodName === "getEntity"          )   { return this.#getEntity(...args);           };
    if (methodName === "getEntities"        )   { return this.#getEntities();                };
    if (methodName === "deleteAllEntity"    )   { return this.#deleteAllEntity();            };
    if (methodName === "getPositionInfo"    )   { return this.#getPositionInfo(...args);     };
    if (methodName === "getCenterInfo"      )   { return this.#getCenterInfo();              };
    if (methodName === "getBoundsInfo"      )   { return this.#getBoundsInfo();              };
    if (methodName === "zoomIn"             )   { return this.#zoomIn();                     };
    if (methodName === "zoomOut"            )   { return this.#zoomOut();                    };
    if (methodName === "move"               )   { return this.#move(...args);                };
    if (methodName === "deleteEntity"       )   { return this.#deleteEntity(...args);        };
    if (methodName === "getDegreesPosition" )   { return this.#_getDegreesPosition(...args); };
    if (methodName === "getAbsolutePosition")   { return this.#_getAbsolutePosition(...args);};
    if (methodName === "getRelativePosition")   { return this.#_getRelativePosition(...args);};
  };

  /******************************************************************************/
  /* #Position                                                                  */
  /******************************************************************************/
  #Position (element)
  {
    var positionStyle = window.getComputedStyle(element).position;
    if (positionStyle === 'static')
    {
      return { left: element.offsetLeft, top : element.offsetTop};
    } 
    else 
    {
      var parentPosition = element.offsetParent ? element.offsetParent.getBoundingClientRect() : {top: 0, left: 0};
      var thisPosition = element.getBoundingClientRect();

      return { left: thisPosition.left - parentPosition.left, top : thisPosition.top  - parentPosition.top };
    }
  };

  /******************************************************************************/
  /* #Width                                                                     */
  /******************************************************************************/
  #Width (element)
  {
    var computedStyle = window.getComputedStyle(element);

    var client       = element.clientWidth; 
    var paddingLeft  = parseFloat(computedStyle.paddingLeft); 
    var paddingRight = parseFloat(computedStyle.paddingRight);
    var width        = client - paddingLeft - paddingRight;

    return width;
  };

  /******************************************************************************/
  /* #Height                                                                    */
  /******************************************************************************/
  #Height (element)
  {
    var computedStyle = window.getComputedStyle(element);

    var client        = element.clientHeight; 
    var paddingTop    = parseFloat(computedStyle.paddingTop); 
    var paddingBottom = parseFloat(computedStyle.paddingBottom);
    var Height         = client - paddingTop - paddingBottom;

    return Height;
  };

  /******************************************************************************/
  /* #Offset                                                                    */
  /******************************************************************************/
  #Offset (element) {
    var docElem, win, rect, doc;
    docElem = document.documentElement;
    rect    = element.getBoundingClientRect();

    if ( rect.width || rect.height || element.getClientRects().length ) 
    {
      win = window;
      doc = element.ownerDocument;

      return { top : rect.top  + win.pageYOffset - docElem.clientTop, left: rect.left + win.pageXOffset - docElem.clientLeft };
    }

    return rect;
  };

};

customElements.get("k2go-tile-viewer") || customElements.define("k2go-tile-viewer", K2goTileViewer);