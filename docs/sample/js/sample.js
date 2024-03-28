/******************************************************************************/
/* k2goTileViewer Web Components Sample App                                   */
/* sample.js                                                                  */
/******************************************************************************/
import "./k2go-tile-viewer.js";

var k2gotileviewer  = document                  .querySelector('k2go-tile-viewer');
var viewer          = k2gotileviewer.shadowRoot.querySelector("[part='k2go-tile-viewer']");

window.addEventListener("load" , () => 
{

  k2gotileviewer.setOptions(
  {
    tapHold : function(pOffset)
    {
      var objParam = { element : k2gotileviewer.shadowRoot.querySelector("#entity-taphold") }

      if (!objParam.element) 
      {
        var div = document.createElement("div");
        div.textContent = "tap hold";
        objParam.element = div;
      }

      objParam.element.setAttribute("id", "entity-taphold");
      objParam.element.style.background = "#fff";
      objParam.element.style.color      = "#000";
      objParam.element.style.border     = "1px solid #000";
      objParam.element.style.width      = "60px";
      objParam.element.style.height     = "30px";
      objParam.element.style.lineHeight = "30px";
      objParam.element.style.textAlign  = "center";
      objParam.center = { offset : { left : pOffset.x, top : pOffset.y } };

      k2gotileviewer.callMethod("addEntity", objParam); 
    },

    moveStart : function(pOffset)
    {
      if (document.querySelector("#position-info").value == "degrees")
      {
        var objPositionInfo = k2gotileviewer.callMethod("getDegreesPosition" , {offset : { left : pOffset.x, top : pOffset.y }});
        document.querySelector(".position-info.click").innerHTML = "[click]<br/>lon:" + objPositionInfo.left + "<br/>lat:" + objPositionInfo.top;
      }
      else if (document.querySelector("#position-info").value == "absolute")
      {
        var objPositionInfo = k2gotileviewer.callMethod("getAbsolutePosition" , {offset : { left : pOffset.x, top : pOffset.y }});
        document.querySelector(".position-info.click").innerHTML = "[click]<br/>left:" + objPositionInfo.left + "<br/>top:" + objPositionInfo.top;
      }
      else if (document.querySelector("#position-info").value == "relative")
      {
        var objPositionInfo = k2gotileviewer.callMethod("getRelativePosition" , {offset : { left : pOffset.x, top : pOffset.y }});
        document.querySelector(".position-info.click").innerHTML = "[click]<br/>left:" + objPositionInfo.left + "<br/>top:" + objPositionInfo.top;
      }

      let element = document.querySelector('.position-info.click');
      element.style.opacity = '1';
      
      element.style.opacity = '1';
      setTimeout(function() {
        element.innerHTML = "";
      }, 5000);
    },

    move : function(pDifference)
    {
      document.querySelector("#position-info").dispatchEvent(new CustomEvent("change", { detail : true }));
    },

    moveEnd : function()
    {
      document.querySelector("#position-info").dispatchEvent(new CustomEvent("change", { detail : true }));
    },

    //zoomStart : function(pOffset)
    //{
    //  console.log("zoomstart:" + "x=" + pOffset.x + " y=" + pOffset.y);
    //},

    //doubleTap : function(pDblTapInfo)
    //{
    //  console.log("x=" + pDblTapInfo.x + " y=" + pDblTapInfo.y + " which=" + pDblTapInfo.which);
    //},

    zoomEnd : function(pZoomInfo)
    {
      document.querySelector("#position-info").dispatchEvent(new CustomEvent("change", { detail : true }));
    },

    //addTile : function(pTileElement, pTileInfo)
    //{
    //  console.log("x=" + pTileInfo.x + " y=" + pTileInfo.y + " width=" + pTileInfo.width + " height=" + pTileInfo.height);
    //}

  });

  setTimeout(function() { document.querySelector("#image").dispatchEvent(new CustomEvent("change")); }, 1000);
});
/******************************************************************************/
/* window.resize                                                              */
/******************************************************************************/
window.addEventListener("resize" , () => 
{
  document.querySelector("#position-info").dispatchEvent(new CustomEvent("change", { detail : true }));
});
/******************************************************************************/
/* change image                                                               */
/******************************************************************************/
document.querySelector("#image").addEventListener("change", () =>
{
  /*-----* variable *-----------------------------------------------------------*/
  var objBoundsInfo   = null;
  var objPositionInfo = null;
  /*-----* get position & delete all entity *-----------------------------------*/
  if (viewer.querySelector("[part='k2go-tile-viewer-main']  > *") !== null)
  {
    objBoundsInfo   =  k2gotileviewer.callMethod("getBoundsInfo");
    objPositionInfo = { bounds : { degrees : { left : objBoundsInfo.leftTop.degrees.left, top : objBoundsInfo.leftTop.degrees.top, right : objBoundsInfo.rightBottom.degrees.left, bottom : objBoundsInfo.rightBottom.degrees.top } } };
    
    if (isNaN(objPositionInfo.bounds.degrees.left  )
    ||  isNaN(objPositionInfo.bounds.degrees.top   )
    ||  isNaN(objPositionInfo.bounds.degrees.right )
    ||  isNaN(objPositionInfo.bounds.degrees.bottom))
    {
      objPositionInfo = null;
    }
  }

  k2gotileviewer.callMethod("deleteAllEntity");
  /*-----* himawari8 jp *-------------------------------------------------------*/
  if (document.querySelector("#image").value == "himawari8jp") 
  {
    var strUrl = "2019/04/30";//getDateFormat();
    k2gotileviewer.setOptions({
      backgroundImage  : "https://himawari8-dl.nict.go.jp/himawari8/img/D531107/thumbnail/600/" + strUrl + "/000000_0_0.png",
      foregroundImages :
      [
        "https://himawari8-dl.nict.go.jp/himawari8/img/D531107/%cd/%w/" + strUrl + "/000000_%x_%y.png",
        "https://himawari8-dl.nict.go.jp/himawari8/img/D531107/%cd/%ws/coastline/ffff00_%x_%y.png",
        "img/weathermap/%cd/%w/2019-04-30/000000_%x_%y.png"
      ],
      scales           :
      [
        { width:600, height:480, size:0.5, count:1 },
        { width:600, height:480, size:0.7, count:1 },
        { width:600, height:480, size:1.0, count:1 },
        { width:600, height:480, size:1.4, count:1 },
        { width:600, height:480, size:1.0, count:2 },
        { width:600, height:480, size:1.4, count:2 },
        { width:600, height:480, size:1.0, count:4 },
        { width:600, height:480, size:1.2, count:5 },
        { width:600, height:480, size:2.0, count:5 },
        { width:600, height:480, size:2.8, count:5 },
        { width:600, height:480, size:4.0, count:5 }
      ],
      geodeticSystem : "himawari8.jp",
      drawingSize    : 1.5
    });
    k2gotileviewer.callMethod("create" , objPositionInfo, function() { document.querySelector("#position-info").dispatchEvent(new CustomEvent("change"))} );
    document.querySelector("#credit").innerHTML = "提供：情報通信研究機構（NICT）/ ウェザーニューズ（WNI）";
    document.body.style.background = "#000";
    }
    /*-----* himawari8 fd *-------------------------------------------------------*/
    else if (document.querySelector("#image").value == "himawari8fd") 
    {
      var strUrl = "2019/04/30";//getDateFormat();
      k2gotileviewer.setOptions({
        backgroundImage  : "https://himawari8-dl.nict.go.jp/himawari8/img/D531106/thumbnail/550/" + strUrl + "/000000_0_0.png",
        foregroundImages :
        [
          "https://himawari8-dl.nict.go.jp/himawari8/img/D531106/%cd/%w/" + strUrl + "/000000_%x_%y.png",
          "https://himawari8-dl.nict.go.jp/himawari8/img/D531106/%cd/%ws/coastline/ffff00_%x_%y.png",
          "img/weathermap/%cd/%w/2019-04-30/000000_%x_%y.png"
        ],
        scales           :
        [
          { width : 550, height : 550, size : 0.5, count :  1 },
          { width : 550, height : 550, size : 0.7, count :  1 },
          { width : 550, height : 550, size : 1.0, count :  1 },
          { width : 550, height : 550, size : 1.4, count :  1 },
          { width : 550, height : 550, size : 1.0, count :  2 },
          { width : 550, height : 550, size : 1.4, count :  2 },
          { width : 550, height : 550, size : 1.0, count :  4 },
          { width : 550, height : 550, size : 1.4, count :  4 },
          { width : 550, height : 550, size : 1.0, count :  8 },
          { width : 550, height : 550, size : 1.4, count :  8 },
          { width : 550, height : 550, size : 1.0, count : 16 },
          { width : 550, height : 550, size : 1.0, count : 20 }
        ],
        geodeticSystem : "himawari8.fd",
        drawingSize    : 1.5
      });
      k2gotileviewer.callMethod("create" , objPositionInfo, function() { document.querySelector("#position-info").dispatchEvent(new CustomEvent("change"))} );
      document.querySelector("#credit").innerHTML = "提供：情報通信研究機構（NICT）/ ウェザーニューズ（WNI）";
      document.body.style.background = "#000";
    }
    /*-----* gsi *----------------------------------------------------------------*/
    else if (document.querySelector("#image").value == "gsi") 
    {
      k2gotileviewer.setOptions({
        backgroundImage  : "https://cyberjapandata.gsi.go.jp/xyz/std/0/0/0.png",
        foregroundImages :
        [
          "https://cyberjapandata.gsi.go.jp/xyz/std/%z/%x/%y.png"
        ],
        scales           :
        [
          { width : 256, height : 256, size : 1.0, count :     32, zoom :  5 },
          { width : 256, height : 256, size : 1.5, count :     32, zoom :  5 },
          { width : 256, height : 256, size : 1.0, count :     64, zoom :  6 },
          { width : 256, height : 256, size : 1.5, count :     64, zoom :  6 },
          { width : 256, height : 256, size : 1.0, count :    128, zoom :  7 },
          { width : 256, height : 256, size : 1.5, count :    128, zoom :  7 },
          { width : 256, height : 256, size : 1.0, count :    256, zoom :  8 },
          { width : 256, height : 256, size : 1.5, count :    256, zoom :  8 },
          { width : 256, height : 256, size : 1.0, count :    512, zoom :  9 },
          { width : 256, height : 256, size : 1.5, count :    512, zoom :  9 },
          { width : 256, height : 256, size : 1.0, count :   1024, zoom : 10 },
          { width : 256, height : 256, size : 1.5, count :   1024, zoom : 10 },
          { width : 256, height : 256, size : 1.0, count :   2048, zoom : 11 },
          { width : 256, height : 256, size : 1.5, count :   2048, zoom : 11 },
          { width : 256, height : 256, size : 1.0, count :   4096, zoom : 12 },
          { width : 256, height : 256, size : 1.5, count :   4096, zoom : 12 },
          { width : 256, height : 256, size : 1.0, count :   8192, zoom : 13 },
          { width : 256, height : 256, size : 1.5, count :   8192, zoom : 13 },
          { width : 256, height : 256, size : 1.0, count :  16384, zoom : 14 },
          { width : 256, height : 256, size : 1.5, count :  16384, zoom : 14 },
          { width : 256, height : 256, size : 1.0, count :  32768, zoom : 15 },
          { width : 256, height : 256, size : 1.5, count :  32768, zoom : 15 },
          { width : 256, height : 256, size : 1.0, count :  65536, zoom : 16 },
          { width : 256, height : 256, size : 1.5, count :  65536, zoom : 16 },
          { width : 256, height : 256, size : 1.0, count : 131072, zoom : 17 },
          { width : 256, height : 256, size : 1.5, count : 131072, zoom : 17 },
          { width : 256, height : 256, size : 1.0, count : 262144, zoom : 18 },
          { width : 256, height : 256, size : 1.5, count : 262144, zoom : 18 }
        ],
        geodeticSystem : "standard",
        drawingSize    : 1
      });
      k2gotileviewer.callMethod("create" , objPositionInfo, function() { document.querySelector("#position-info").dispatchEvent(new CustomEvent("change"))} );
      document.querySelector("#credit").innerHTML = "国土地理院の標準地図を掲載";
      document.body.style.background = "#ddd";
    }
    /*-----* openstreetmap *------------------------------------------------------*/
    else if (document.querySelector("#image").value == "openstreetmap")
    {
      k2gotileviewer.setOptions({
        backgroundImage  : "http://tile.openstreetmap.jp/0/0/0.png",
        foregroundImages :
        [
          "http://tile.openstreetmap.jp/%z/%x/%y.png"
        ],
        scales           :
        [
          { width : 256, height : 256, size : 1.0, count :     32, zoom :  5 },
          { width : 256, height : 256, size : 1.5, count :     32, zoom :  5 },
          { width : 256, height : 256, size : 1.0, count :     64, zoom :  6 },
          { width : 256, height : 256, size : 1.5, count :     64, zoom :  6 },
          { width : 256, height : 256, size : 1.0, count :    128, zoom :  7 },
          { width : 256, height : 256, size : 1.5, count :    128, zoom :  7 },
          { width : 256, height : 256, size : 1.0, count :    256, zoom :  8 },
          { width : 256, height : 256, size : 1.5, count :    256, zoom :  8 },
          { width : 256, height : 256, size : 1.0, count :    512, zoom :  9 },
          { width : 256, height : 256, size : 1.5, count :    512, zoom :  9 },
          { width : 256, height : 256, size : 1.0, count :   1024, zoom : 10 },
          { width : 256, height : 256, size : 1.5, count :   1024, zoom : 10 },
          { width : 256, height : 256, size : 1.0, count :   2048, zoom : 11 },
          { width : 256, height : 256, size : 1.5, count :   2048, zoom : 11 },
          { width : 256, height : 256, size : 1.0, count :   4096, zoom : 12 },
          { width : 256, height : 256, size : 1.5, count :   4096, zoom : 12 },
          { width : 256, height : 256, size : 1.0, count :   8192, zoom : 13 },
          { width : 256, height : 256, size : 1.5, count :   8192, zoom : 13 },
          { width : 256, height : 256, size : 1.0, count :  16384, zoom : 14 },
          { width : 256, height : 256, size : 1.5, count :  16384, zoom : 14 },
          { width : 256, height : 256, size : 1.0, count :  32768, zoom : 15 },
          { width : 256, height : 256, size : 1.5, count :  32768, zoom : 15 },
          { width : 256, height : 256, size : 1.0, count :  65536, zoom : 16 },
          { width : 256, height : 256, size : 1.5, count :  65536, zoom : 16 },
          { width : 256, height : 256, size : 1.0, count : 131072, zoom : 17 },
          { width : 256, height : 256, size : 1.5, count : 131072, zoom : 17 },
          { width : 256, height : 256, size : 1.0, count : 262144, zoom : 18 },
          { width : 256, height : 256, size : 1.5, count : 262144, zoom : 18 }
        ],
        geodeticSystem : "standard",
        drawingSize    : 1
    });
    
    k2gotileviewer.callMethod("create" , objPositionInfo, function() { document.querySelector("#position-info").dispatchEvent(new CustomEvent("change"))} );
    document.querySelector("#credit").innerHTML = "© OpenStreetMap contributors";
    document.body.style.background = "#ddd";
  };
});
/******************************************************************************/
/* click zoom                                                                 */
/******************************************************************************/
document.querySelector("#zoom-in" ).addEventListener("click", () => { k2gotileviewer.callMethod("zoomIn" ) });
document.querySelector("#zoom-out").addEventListener("click", () => { k2gotileviewer.callMethod("zoomOut") });
/******************************************************************************/
/* click move                                                                 */
/******************************************************************************/
document.querySelector("#move").addEventListener("click", () =>
{
  var objOptions = k2gotileviewer.getOptions();
  var objPositionInfo;

       if (document.querySelector("#position-info").value == "degrees" ) objPositionInfo =  { degrees:    { left: parseFloat(document.querySelector("#move-degrees-lon"    ).value), top: parseFloat(document.querySelector("#move-degrees-lat"   ).value) }};
  else if (document.querySelector("#position-info").value == "absolute") objPositionInfo =  { absolute:   { left: parseFloat(document.querySelector("#move-absolute-left"  ).value), top: parseFloat(document.querySelector("#move-absolute-top"  ).value), scale : objOptions.scale }};
  else if (document.querySelector("#position-info").value == "relative") objPositionInfo =  { relative:   { left: parseFloat(document.querySelector("#move-relative-left"  ).value), top: parseFloat(document.querySelector("#move-relative-top"  ).value) }};
  else if (document.querySelector("#position-info").value == "hidden"  ) objPositionInfo =  { difference: { left: parseFloat(document.querySelector("#move-difference-left").value), top: parseFloat(document.querySelector("#move-difference-top").value) }};

  k2gotileviewer.callMethod("move", objPositionInfo, parseInt(document.querySelector("#move-duration").value, 10));
});
/******************************************************************************/
/* click plot                                                                 */
/******************************************************************************/
/*-----* add *----------------------------------------------------------------*/
document.querySelector("#plot-add").addEventListener("click", () =>
{
  var strId       = document.querySelector("#plot-element").options[document.querySelector("#plot-element").selectedIndex].text;
  var strPosition = document.querySelector("#plot-element").value;
  var strColor    = document.querySelector("#plot-color  ").value;
  var strSize     = document.querySelector("#plot-size   ").value;
  var objParam    = { element : k2gotileviewer.shadowRoot.querySelector("#entity-" + strId) }

  if ( objParam.element == null ) objParam.element = document.createElement('div');

  objParam.element.setAttribute("id", "entity-" + strId);
  objParam.element.style.background = strColor;
  objParam.element.style.width      = "20px";
  objParam.element.style.height     = "20px";

  if (strSize == "Scalable")
  {
    objParam.bounds                     = { degrees : { left : parseFloat(strPosition.split(",")[2]), top : parseFloat(strPosition.split(",")[3]), right : parseFloat(strPosition.split(",")[4]), bottom : parseFloat(strPosition.split(",")[5]) } };
    objParam.element.style.opacity      = "0.5";
    objParam.element.style.borderRadius = "";
  }
  else
  {
    objParam.center = { degrees : { left : parseFloat(strPosition.split(",")[0]), top : parseFloat(strPosition.split(",")[1]) } };
    objParam.element.style.opacity      = "";
    objParam.element.style.borderRadius = "100%";
  }

  k2gotileviewer.callMethod("addEntity", objParam);
});
/*-----* del *----------------------------------------------------------------*/
document.querySelector("#plot-del").addEventListener("click", () =>{
  var strId       = document.querySelector("#plot-element").options[document.querySelector("#plot-element").selectedIndex].text;
  var element     =  k2gotileviewer.shadowRoot.querySelector("#entity-" + strId);

  if (element) k2gotileviewer.callMethod("deleteEntity", element);
});
/******************************************************************************/
/* change position-info                                                       */
/******************************************************************************/
document.querySelector("#position-info").addEventListener("change", (pEvent, pFlg) =>
{
  document.querySelector(".degrees"   ).classList.add("hidden");
  document.querySelector(".absolute"  ).classList.add("hidden");
  document.querySelector(".relative"  ).classList.add("hidden");
  document.querySelector(".difference").classList.add("hidden");

  if (!pEvent.detail) document.querySelector(".position-info.click").innerHTML = "";

  if (document.querySelector("#position-info").value == "hidden")
  {
    document.querySelectorAll('.position-info').forEach(function(el) 
    {
      el.classList.add('hidden');
    });
    document.querySelector(".difference   ").classList.remove("hidden");
  }
  else 
  {
    var objCenterInfo = k2gotileviewer.callMethod("getCenterInfo");
    var objBoundsInfo = k2gotileviewer.callMethod("getBoundsInfo");

    document.querySelectorAll('.position-info').forEach(function(el) 
    {
      el.classList.remove('hidden');
    });

    if (document.querySelector("#position-info").value == "degrees")
    {
      document.querySelector(".position-info.center"      ).innerHTML = "[center]<br/>lon:" + objCenterInfo            .degrees.left + "<br/>lat:" + objCenterInfo            .degrees.top;
      document.querySelector(".position-info.left.top"    ).innerHTML =              "lon:" + objBoundsInfo.leftTop    .degrees.left + "<br/>lat:" + objBoundsInfo.leftTop    .degrees.top;
      document.querySelector(".position-info.left.bottom" ).innerHTML =              "lon:" + objBoundsInfo.leftBottom .degrees.left + "<br/>lat:" + objBoundsInfo.leftBottom .degrees.top;
      document.querySelector(".position-info.right.top"   ).innerHTML =              "lon:" + objBoundsInfo.rightTop   .degrees.left + "<br/>lat:" + objBoundsInfo.rightTop   .degrees.top;
      document.querySelector(".position-info.right.bottom").innerHTML =              "lon:" + objBoundsInfo.rightBottom.degrees.left + "<br/>lat:" + objBoundsInfo.rightBottom.degrees.top;
      document.querySelector(".degrees"                   ).classList.remove("hidden");
    }
    else if (document.querySelector("#position-info").value == "absolute")
    {
      document.querySelector(".position-info.center"      ).innerHTML = "[center]<br/>left:" + objCenterInfo            .absolute.left + "<br/>top:" + objCenterInfo            .absolute.top;
      document.querySelector(".position-info.left.top"    ).innerHTML =              "left:" + objBoundsInfo.leftTop    .absolute.left + "<br/>top:" + objBoundsInfo.leftTop    .absolute.top;
      document.querySelector(".position-info.left.bottom" ).innerHTML =              "left:" + objBoundsInfo.leftBottom .absolute.left + "<br/>top:" + objBoundsInfo.leftBottom .absolute.top;
      document.querySelector(".position-info.right.top"   ).innerHTML =              "left:" + objBoundsInfo.rightTop   .absolute.left + "<br/>top:" + objBoundsInfo.rightTop   .absolute.top;
      document.querySelector(".position-info.right.bottom").innerHTML =              "left:" + objBoundsInfo.rightBottom.absolute.left + "<br/>top:" + objBoundsInfo.rightBottom.absolute.top;
      document.querySelector(".absolute"                  ).classList.remove("hidden");
    }
    else if (document.querySelector("#position-info").value == "relative")
    {
      document.querySelector(".position-info.center"      ).innerHTML = "[center]<br/>left:" + objCenterInfo            .relative.left + "<br/>top:" + objCenterInfo            .relative.top;
      document.querySelector(".position-info.left.top"    ).innerHTML =              "left:" + objBoundsInfo.leftTop    .relative.left + "<br/>top:" + objBoundsInfo.leftTop    .relative.top;
      document.querySelector(".position-info.left.bottom" ).innerHTML =              "left:" + objBoundsInfo.leftBottom .relative.left + "<br/>top:" + objBoundsInfo.leftBottom .relative.top;
      document.querySelector(".position-info.right.top"   ).innerHTML =              "left:" + objBoundsInfo.rightTop   .relative.left + "<br/>top:" + objBoundsInfo.rightTop   .relative.top;
      document.querySelector(".position-info.right.bottom").innerHTML =              "left:" + objBoundsInfo.rightBottom.relative.left + "<br/>top:" + objBoundsInfo.rightBottom.relative.top;
      document.querySelector(".relative"                  ).classList.remove("hidden");
    }
  }
});
/******************************************************************************/
/* change limit-zoom-effect                                                   */
/******************************************************************************/
document.querySelector("#limit-zoom-effect").addEventListener("change", (pEvent, pFlg) =>
{
  k2gotileviewer.setOptions({ limitZoomEffect : document.querySelector("#limit-zoom-effect").value == "true" });
});
/******************************************************************************/
/* getDateFormat                                                              */
/******************************************************************************/
function getDateFormat () 
{
  var objDate  = new Date();

  objDate.setDate(objDate.getDate() - 1);

  var strYear  = objDate.getFullYear().toString();
  var strMonth = ("00" + (objDate.getMonth() + 1)).slice(-2);
  var strDate  = ("00" +  objDate.getDate ()     ).slice(-2);

  return strYear + "/" + strMonth + "/" + strDate;
};