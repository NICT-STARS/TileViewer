/******************************************************************************/
/* Sample for k2goTileViewer                                                  */
/* Inoue Computer Service.                                                    */
/******************************************************************************/
/******************************************************************************/
/* window.load                                                                */
/******************************************************************************/
$(window).on("load", function()
{
  $("#tile-viewer").k2goTileViewer(
  {
    tapHold : function(pOffset)
    {
      var objParam  = { element : $("#entity-taphold") };

      if (objParam.element.length == 0) objParam.element = $("<div>tap hold</div>");

      objParam.element.attr({ id : "entity-taphold" });
      objParam.element.css ({ background : "#fff", color : "#000", border : "1px solid #000", width : "60px", height : "30px", lineHeight : "30px", textAlign : "center" });
      objParam.center = { offset : { left : pOffset.x, top : pOffset.y } };

      $("#tile-viewer").k2goTileViewer("addEntity", objParam);
    },
    moveStart : function(pOffset)
    {
           if ($("#position-info").val() == "degrees")
      {
        var objPositionInfo = $("#tile-viewer").k2goTileViewer("getDegreesPosition" , { offset : { left : pOffset.x, top : pOffset.y } });
        $(".position-info.click").html("[click]<br/>lon:" + objPositionInfo.left + "<br/>lat:" + objPositionInfo.top);
      }
      else if ($("#position-info").val() == "absolute")
      {
        var objPositionInfo = $("#tile-viewer").k2goTileViewer("getAbsolutePosition", { offset : { left : pOffset.x, top : pOffset.y } });
        $(".position-info.click").html("[click]<br/>left:" + objPositionInfo.left + "<br/>top:" + objPositionInfo.top);
      }
      else if ($("#position-info").val() == "relative")
      {
        var objPositionInfo = $("#tile-viewer").k2goTileViewer("getRelativePosition", { offset : { left : pOffset.x, top : pOffset.y } });
        $(".position-info.click").html("[click]<br/>left:" + objPositionInfo.left + "<br/>top:" + objPositionInfo.top);
      }

      $(".position-info.click").stop().css({ opacity : 1 }).animate({ opacity : 1 }, { duration : 5000, complete : function() { $(this).html(""); } });
    },
    move      : function(pDifference)
    {
      $("#position-info").trigger("change", true);
    },
    moveEnd   : function()
    {
      $("#position-info").trigger("change", true);
    },
    zoomEnd : function(pZoomInfo)
    {
      $("#position-info").trigger("change", true);
    },
  });

  setTimeout(function() { $("#image").trigger("change"); }, 1000);
});$(function() {
/******************************************************************************/
/* window.resize                                                              */
/******************************************************************************/
$(window).on("resize", function()
{
  $("#position-info").trigger("change", true);
});
/******************************************************************************/
/* change image                                                               */
/******************************************************************************/
$("#image").on("change", function()
{
/*-----* variable *-----------------------------------------------------------*/
  var $viewer         = $("#tile-viewer");
  var objBoundsInfo   = null;
  var objPositionInfo = null;
/*-----* get position & delete all entity *-----------------------------------*/
  if ($viewer.find(".k2go-tile-viewer-main > *").length > 0)
  {
    objBoundsInfo   = $viewer.k2goTileViewer("getBoundsInfo");
    objPositionInfo = { bounds : { degrees : { left : objBoundsInfo.leftTop.degrees.left, top : objBoundsInfo.leftTop.degrees.top, right : objBoundsInfo.rightBottom.degrees.left, bottom : objBoundsInfo.rightBottom.degrees.top } } };

    if (isNaN(objPositionInfo.bounds.degrees.left  )
    ||  isNaN(objPositionInfo.bounds.degrees.top   )
    ||  isNaN(objPositionInfo.bounds.degrees.right )
    ||  isNaN(objPositionInfo.bounds.degrees.bottom))
    {
      objPositionInfo = null;
    }
  }

  $viewer.k2goTileViewer("deleteAllEntity");
/*-----* himawari8 jp *-------------------------------------------------------*/
  if ($(this).val() == "himawari8jp")
  {
    var strUrl = "2019/04/30";//getDateFormat();

    $viewer.k2goTileViewer("setOptions",
    {
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

    $viewer     .k2goTileViewer("create", objPositionInfo, function() { $("#position-info").trigger("change"); });
    $("#credit").text          ("提供：情報通信研究機構（NICT）/ ウェザーニューズ（WNI）");
    $("body"   ).css           ("background", "#000");

  }
/*-----* himawari8 fd *-------------------------------------------------------*/
  else if ($(this).val() == "himawari8fd")
  {
    var strUrl = "2019/04/30";//getDateFormat();

    $viewer.k2goTileViewer("setOptions",
    {
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

    $viewer     .k2goTileViewer("create", objPositionInfo, function() { $("#position-info").trigger("change"); });
    $("#credit").text          ("提供：情報通信研究機構（NICT）/ ウェザーニューズ（WNI）");
    $("body"   ).css           ("background", "#000");

  }
/*-----* gsi *----------------------------------------------------------------*/
  else if ($(this).val() == "gsi")
  {
    $viewer.k2goTileViewer("setOptions",
    {
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

    $viewer     .k2goTileViewer("create", objPositionInfo, function() { $("#position-info").trigger("change"); });
    $("#credit").text          ("国土地理院の標準地図を掲載");
    $("body"   ).css           ("background", "#ddd");
  }
/*-----* openstreetmap *------------------------------------------------------*/
  else if ($(this).val() == "openstreetmap")
  {
    $viewer.k2goTileViewer("setOptions",
    {
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

    $viewer     .k2goTileViewer("create", objPositionInfo, function() { $("#position-info").trigger("change"); });
    $("#credit").text          ("© OpenStreetMap contributors");
    $("body"   ).css           ("background", "#ddd");
  }
});
/******************************************************************************/
/* click zoom                                                                 */
/******************************************************************************/
$("#zoom-in" ).on("click", function() { $("#tile-viewer").k2goTileViewer("zoomIn" ); });
$("#zoom-out").on("click", function() { $("#tile-viewer").k2goTileViewer("zoomOut"); });
/******************************************************************************/
/* click move                                                                 */
/******************************************************************************/
$("#move").on("click", function()
{
  var $viewer         = $("#tile-viewer");
  var objOptions      = $viewer.k2goTileViewer("getOptions");
  var objPositionInfo;

       if ($("#position-info").val() == "degrees" ) objPositionInfo = { degrees    : { left : parseFloat($("#move-degrees-lon"    ).val()), top : parseFloat($("#move-degrees-lat"   ).val()) } };
  else if ($("#position-info").val() == "absolute") objPositionInfo = { absolute   : { left : parseFloat($("#move-absolute-left"  ).val()), top : parseFloat($("#move-absolute-top"  ).val()), scale : objOptions.scale } };
  else if ($("#position-info").val() == "relative") objPositionInfo = { relative   : { left : parseFloat($("#move-relative-left"  ).val()), top : parseFloat($("#move-relative-top"  ).val()) } };
  else if ($("#position-info").val() == "hidden"  ) objPositionInfo = { difference : { left : parseFloat($("#move-difference-left").val()), top : parseFloat($("#move-difference-top").val()) } };

  $("#tile-viewer").k2goTileViewer("move", objPositionInfo, parseInt($("#move-duration").val(), 10));
});
/******************************************************************************/
/* click plot                                                                 */
/******************************************************************************/
/*-----* add *----------------------------------------------------------------*/
$("#plot-add").on("click", function()
{
  var strId       = $("#plot-element option:selected").text();
  var strPosition = $("#plot-element"                ).val ();
  var strColor    = $("#plot-color"                  ).val ();
  var strSize     = $("#plot-size"                   ).val ();
  var objParam    = { element : $("#entity-" + strId) };

  if (objParam.element.length == 0) objParam.element = $("<div></div>");

  objParam.element.attr({ id : "entity-" + strId });
  objParam.element.css ({ background : strColor, width : "20px", height : "20px" });

  if (strSize == "Scalable")
  {
    objParam.bounds = { degrees : { left : parseFloat(strPosition.split(",")[2]), top : parseFloat(strPosition.split(",")[3]), right : parseFloat(strPosition.split(",")[4]), bottom : parseFloat(strPosition.split(",")[5]) } };
    objParam.element.css({ opacity : 0.5, borderRadius : "" });
  }
  else
  {
    objParam.center = { degrees : { left : parseFloat(strPosition.split(",")[0]), top : parseFloat(strPosition.split(",")[1]) } };
    objParam.element.css({ opacity : "" , borderRadius : "100%" });
  }

  $("#tile-viewer").k2goTileViewer("addEntity", objParam);
});
/*-----* del *----------------------------------------------------------------*/
$("#plot-del").on("click", function()
{
  var strId    = $("#plot-element option:selected").text();
  var $element = $("#entity-" + strId             );

  if ($element.length > 0) $("#tile-viewer").k2goTileViewer("deleteEntity", $element);
});
/******************************************************************************/
/* change position-info                                                       */
/******************************************************************************/
$("#position-info").on("change", function(pEvent, pFlg)
{
  $(".degrees"   ).addClass("hidden");
  $(".absolute"  ).addClass("hidden");
  $(".relative"  ).addClass("hidden");
  $(".difference").addClass("hidden");

  if (!pFlg) $(".position-info.click").html("");

  if ($(this).val() == "hidden")
  {
    $(".position-info").   addClass("hidden");
    $(".difference"   ).removeClass("hidden");
  }
  else
  {
    var objCenterInfo = $("#tile-viewer").k2goTileViewer("getCenterInfo");
    var objBoundsInfo = $("#tile-viewer").k2goTileViewer("getBoundsInfo");

    $(".position-info").removeClass("hidden");

         if ($(this).val() == "degrees")
    {
      $(".position-info.center"      ).html       ("[center]<br/>lon:" + objCenterInfo            .degrees.left + "<br/>lat:" + objCenterInfo            .degrees.top);
      $(".position-info.left.top"    ).html       (             "lon:" + objBoundsInfo.leftTop    .degrees.left + "<br/>lat:" + objBoundsInfo.leftTop    .degrees.top);
      $(".position-info.left.bottom" ).html       (             "lon:" + objBoundsInfo.leftBottom .degrees.left + "<br/>lat:" + objBoundsInfo.leftBottom .degrees.top);
      $(".position-info.right.top"   ).html       (             "lon:" + objBoundsInfo.rightTop   .degrees.left + "<br/>lat:" + objBoundsInfo.rightTop   .degrees.top);
      $(".position-info.right.bottom").html       (             "lon:" + objBoundsInfo.rightBottom.degrees.left + "<br/>lat:" + objBoundsInfo.rightBottom.degrees.top);
      $(".degrees"                   ).removeClass("hidden");
    }
    else if ($(this).val() == "absolute")
    {
      $(".position-info.center"      ).html       ("[center]<br/>left:" + objCenterInfo            .absolute.left + "<br/>top:" + objCenterInfo            .absolute.top);
      $(".position-info.left.top"    ).html       (             "left:" + objBoundsInfo.leftTop    .absolute.left + "<br/>top:" + objBoundsInfo.leftTop    .absolute.top);
      $(".position-info.left.bottom" ).html       (             "left:" + objBoundsInfo.leftBottom .absolute.left + "<br/>top:" + objBoundsInfo.leftBottom .absolute.top);
      $(".position-info.right.top"   ).html       (             "left:" + objBoundsInfo.rightTop   .absolute.left + "<br/>top:" + objBoundsInfo.rightTop   .absolute.top);
      $(".position-info.right.bottom").html       (             "left:" + objBoundsInfo.rightBottom.absolute.left + "<br/>top:" + objBoundsInfo.rightBottom.absolute.top);
      $(".absolute"                  ).removeClass("hidden");
    }
    else if ($(this).val() == "relative")
    {
      $(".position-info.center"      ).html       ("[center]<br/>left:" + objCenterInfo            .relative.left + "<br/>top:" + objCenterInfo            .relative.top);
      $(".position-info.left.top"    ).html       (             "left:" + objBoundsInfo.leftTop    .relative.left + "<br/>top:" + objBoundsInfo.leftTop    .relative.top);
      $(".position-info.left.bottom" ).html       (             "left:" + objBoundsInfo.leftBottom .relative.left + "<br/>top:" + objBoundsInfo.leftBottom .relative.top);
      $(".position-info.right.top"   ).html       (             "left:" + objBoundsInfo.rightTop   .relative.left + "<br/>top:" + objBoundsInfo.rightTop   .relative.top);
      $(".position-info.right.bottom").html       (             "left:" + objBoundsInfo.rightBottom.relative.left + "<br/>top:" + objBoundsInfo.rightBottom.relative.top);
      $(".relative"                  ).removeClass("hidden");
    }
  }
});
/******************************************************************************/
/* change limit-zoom-effect                                                   */
/******************************************************************************/
$("#limit-zoom-effect").on("change", function()
{
  $("#tile-viewer").k2goTileViewer("setOptions", { limitZoomEffect : $(this).val() == "true" });
});
/******************************************************************************/
/* getDateFormat                                                              */
/******************************************************************************/
function getDateFormat()
{
  var objDate  = new Date();

  objDate.setDate(objDate.getDate() - 1);

  var strYear  = objDate.getFullYear().toString();
  var strMonth = ("00" + (objDate.getMonth() + 1)).slice(-2);
  var strDate  = ("00" +  objDate.getDate ()     ).slice(-2);

  return strYear + "/" + strMonth + "/" + strDate;
}
});
