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

            // add filter element to all top tds
            var headerRow = $(this).find("thead");
            
            var allColumnFilters = [];

            var headers = headerRow.find("td");
            headers.each(function(columnIndex) {
                var header = $(this);
                header.append("<div class='filter-icon-wrapper'><div class='filter-icon'></div></div>");
                var filter = header.find(".filter-icon");

                // add to the create the data model
                let filterable = {};
                let filterableList = [];
                for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                    let data = rows[rowIndex][columnIndex];
                    if (!(data in filterable)) {
                        filterable[data] = true;
                        filterableList.push({
                            "label" : data,
                            "checked" : true
                        });
                    }
                }
                allColumnFilters.push(filterableList);

                filter.click(function() {
                    // empty the list and put in the filters for this column
                    $("#filter-list").html("");
                    var columnFilters = allColumnFilters[columnIndex];
                    for (var filterIndex = 0; filterIndex < columnFilters.length; filterIndex++) {
                        let filter = columnFilters[filterIndex];
                        let checkId = "autofilter_check" + filterIndex;
                        let checkedStr = filter["checked"] ? " checked" : "";
                        $("#filter-list").append("<input id='" + checkId + "' type='checkbox'" + checkedStr + "><label>" + filter["label"] + "</label><br/>");
                    }
                    
                    filterWidget.modal();
                    filterWidget.one($.modal.BEFORE_CLOSE, function(event, modal) {
                        // save off check changes
                        var includeAll = true;
                        for (var filterIndex = 0; filterIndex < columnFilters.length; filterIndex++) {
                            let filter = columnFilters[filterIndex];
                            let checkId = "autofilter_check" + filterIndex;
                            let isIncluding = $("#" + checkId).is(':checked');
                            columnFilters[filterIndex]["checked"] = isIncluding;
                            includeAll = includeAll && isIncluding;
                        }

                        // update filter icon's status
                        if (includeAll) {
                            console.log(filter);
                            filter.removeClass("filtering");
                        } else {
                            filter.addClass("filtering");
                        }

                        // build the check set
                        var allColumnFilterSets = allColumnFilters.map(function(columnFilters) {
                            return new Set(columnFilters.filter(function(filter) {
                                return filter["checked"];
                            }).map(function(filter){ 
                                return filter["label"];
                            }));
                        });

                        // update the table visibility
                        body.find("tr").each(function(rowIndex) {
                            var rowVisible = true;
                            $(this).find("td").each(function(cellColumnIndex) {
                                var cellValue = $(this).text();
                                rowVisible = rowVisible && allColumnFilterSets[cellColumnIndex].has(cellValue);
                            });
                            if (rowVisible) {
                                $(this).show();
                            } else {
                                $(this).hide();
                            }
                        });
                    });
                });
            });
        });
    }
}(jQuery));