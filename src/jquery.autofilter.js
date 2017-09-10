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
    "    <div id='filter-list'>" +
    "    </div>" +
    "</div>" +
"</div>";
            $("body").append(filterWidgetCode);

            filterWidget = $("#" + filterWidgetId);
        }

        //<form id="login-form" class="widget">
        //...
        //</form>
        this.each(function() {
            // TODO: check if is a table

            // get table data
            var body = $(this).find("tbody");
            var rows = [];
            body.find("tr").each(function(index) {
                var rowValues = [];
                $(this).find("td").each(function(index) {
                    rowValues.push($(this).text());
                });
                rows.push(rowValues);
            });
            //console.log(rows);

            // add filter element to all top tds
            var header = $(this).find("thead");
            
            //console.log(header);
            var headers = header.find("td");
            headers.each(function(columnIndex) {
                $(this).append("<div class='filter-icon-wrapper'><div class='filter-icon'></div></div>");
                var filter = $(this).find(".filter-icon-wrapper");
                filter.click(function() {
                    var columnFilters = $(this).attr("data-filters");
                    if (columnFilters == undefined) {
                        console.log("creating filters");
                        // get all the filterable values
                        var filterable = {};
                        var filterableList = [];

                        for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                            var data = rows[rowIndex][columnIndex];
                            if (!(data in filterable)) {
                                filterable[data] = true;
                                filterableList.push({
                                    "label" : data,
                                    "checked" : true
                                });
                            }
                        }
                        columnFilters = filterableList;
                        $(this).attr("data-filters", JSON.stringify(columnFilters));
                    } else {
                        columnFilters = JSON.parse(columnFilters);
                    }

                    $("#filter-list").html("");
                    for (var filterIndex = 0; filterIndex < columnFilters.length; filterIndex++) {
                        var filter = columnFilters[filterIndex];
                        var checkId = "autofilter_check" + filterIndex;
                        var checkedStr = filter["checked"] ? " checked" : "";
                        $("#filter-list").append("<input id='" + checkId + "' type='checkbox'" + checkedStr + "><label>" + filter["label"] + "</label><br/>");
                    }
                    
                    filterWidget.modal();
                    filterWidget.one($.modal.BEFORE_CLOSE, function(event, modal) {
                        console.log("closed");

                        // save off check changes
                        for (var filterIndex = 0; filterIndex < columnFilters.length; filterIndex++) {
                            var filter = columnFilters[filterIndex];
                            var checkId = "autofilter_check" + filterIndex;
                            columnFilters[filterIndex]["checked"] = $("#" + checkId).is(':checked');
                        }
                        console.log(columnFilters);
                        $(this).attr("data-filters", JSON.stringify(columnFilters));

                        // update the table visibility
                    });
                });
            });
        });
    }
}(jQuery));