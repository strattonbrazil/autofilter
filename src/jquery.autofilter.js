"use strict";

(function($) {
    // given an HTML table object, return the values in the table
    // as a row-major 2D array
    function getTableData(table) {
        var body = $(table).find("tbody");
        var rows = [];
        body.find("tr").each(function(index) {
            var rowValues = [];
            $(this).find("td").each(function(index) {
                rowValues.push($(this).text());
            });
            rows.push(rowValues);
        });
        return rows;
    }

    // given an HTML table object and an array of filters (a Set of keys),
    // toggle the visibility of the individual rows if a given row
    // has a cell that isn't approved by the filter for its
    // respective column
    function updateRowVisibility(table, filters) {
        let tableBody = $(table).find("tbody");
        tableBody.find("tr").each(function(rowIndex) {
            let rowVisible = true;
            $(this).find("td").each(function(cellColumnIndex) {
                let cellValue = $(this).text();
                rowVisible = rowVisible && filters[cellColumnIndex].has(cellValue);
            });
            if (rowVisible) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    $.fn.autofilter = function() {
        // setup the filter modal dialog
        var modalWidgetId = "_jquery_autofilter_modal";
        var modalWidget = $("#" + modalWidgetId);
        if (modalWidget.length == 0) { // not created yet
            var modalWidgetCode = "" +
"<div style='display: none'>" +
    "<div id='" + modalWidgetId + "' class='modal'>" +
    "    <span class='filter-button-reset'>Select all</span> - <span class='filter-button-reset'>Clear</span>" +
    "    <input class='filter-input'></input>" +
    "    <div id='filter-list'>" +
    "    </div>" +
    "</div>" +
"</div>";
            $("body").append(modalWidgetCode);

            modalWidget = $("#" + modalWidgetId);
        }

        this.each(function() {
            // TODO: check if is a table
            const table = this;
            let tableBody = $(this).find("tbody");

            // get table data
            let rows = getTableData(this);

            // add filter element to all top tds
            let headerRow = $(this).find("thead");
            
            // attach column filters to table
            var allColumnFilters = [];

            var headers = headerRow.find("td");
            headers.each(function(columnIndex) {
                var header = $(this);
                header.append("<div class='filter-icon-wrapper'><div class='filter-icon'></div></div>");
                var filterIcon = header.find(".filter-icon");

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

                filterIcon.click(function() {
                    // empty the list and put in the filters for this column
                    $("#filter-list").html("");
                    var columnFilters = allColumnFilters[columnIndex];
                    for (var filterIndex = 0; filterIndex < columnFilters.length; filterIndex++) {
                        let filter = columnFilters[filterIndex];
                        let checkId = "autofilter_check" + filterIndex;
                        let checkedStr = filter["checked"] ? " checked" : "";
                        $("#filter-list").append("<input id='" + checkId + "' type='checkbox'" + checkedStr + "><label>" + filter["label"] + "</label><br/>");
                    }
                    
                    modalWidget.modal();
                    modalWidget.one($.modal.BEFORE_CLOSE, function(event, modal) {
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
                            filterIcon.removeClass("filtering");
                        } else {
                            filterIcon.addClass("filtering");
                        }

                        // build the check set
                        var allColumnFilterSets = allColumnFilters.map(function(columnFilters) {
                            return new Set(columnFilters.filter(function(filter) {
                                return filter["checked"];
                            }).map(function(filter){ 
                                return filter["label"];
                            }));
                        });

                        updateRowVisibility(table, allColumnFilterSets);
                    });
                });
            });
        });
    }
}(jQuery));