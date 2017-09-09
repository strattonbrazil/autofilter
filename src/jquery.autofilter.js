"use strict";

(function($) {
    $.fn.autofilter = function() {
        // setup the filter modal dialog
        var filterWidgetId = "_jquery_autofilter_modal";
        var filterWidget = $("#" + filterWidgetId);
        if (filterWidget.length == 0) { // not created yet
            var filterWidgetCode = "" +
"<div style='display: none'>" +
    "<div id='" + filterWidgetId + "' class='modal'>" +
    "    <span class='filter-button-reset'>Select all</span> - <span class='filter-button-reset'>Clear</span>" +
    "    <input class='filter-input'></input>" +
    "</div>" +
"</div>";
            $("body").append(filterWidgetCode);

            filterWidget = $("#" + filterWidgetId);
        }
        console.log(filterWidget);

        //<form id="login-form" class="widget">
        //...
        //</form>
        console.log(this);
        this.each(function() {
            // TODO: check if is a table

            // add filter element to all top tds
            var header = $(this).find("thead");
            //console.log(header);
            var headers = header.find("td");
            headers.each(function(index) {
                //console.log(this);
                $(this).append("<div class='filter-icon-wrapper'><div class='filter-icon'></div></div>");
                var filter = $(this).find(".filter-icon-wrapper");
                filter.click(function() {
                    //console.log("got a click");
                    filterWidget.modal();
                })
                //console.log(filter);
                // TODO: add the autofilter button

                
            });
        });
    }

}(jQuery));