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
        const tableBody = $(table).find("tbody");
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

    // given an HTML table object, attach a "column filters" view model to it, which
    // is an array of arrays--each subelement being a possible filter
    function resetColumnFilters(table) {
        const numColumns = $(table).find("thead").find("td").length;
        const rows = getTableData(table);
        const allColumnFilters = [];
        for (let columnIndex = 0; columnIndex < numColumns; columnIndex++) {
            const filterable = {};
            const filterableList = [];

            for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                const row = rows[rowIndex];

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
        }
        table._allColumnFilters = allColumnFilters;
    }

    //Creating custom case insensitive expression for contains
    jQuery.expr[':'].icontains = function(a, i, m) {
        return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };

    $.fn.autofilter = function() {
        // setup the filter modal dialog
        var modalWidgetId = "_jquery_autofilter_modal",
            modalWidget = $("#" + modalWidgetId),
            $this = $(this),
            $inputText;

        if (modalWidget.length == 0) { // not created yet
            var modalWidgetCode = "" +
"<div style='display: none'>" +
    "<div id='" + modalWidgetId + "' class='modal'>" +
    "    <span class='all filter-button-reset'>Select all</span> - <span class='clear filter-button-reset'>Clear</span>" +
    "    <input class='filter-input'></input>" +
    "    <div id='filter-list'>" +
    "    </div>" +
    "</div>" +
"</div>";
            $("body").append(modalWidgetCode);

            modalWidget = $("#" + modalWidgetId);
            $inputText = $('input.filter-input')

            $('.all.filter-button-reset').on('click', function() {
                $('#filter-list input').each(function() {
                    $(this).attr('checked', 'checked')
                });
            });
            $('.clear.filter-button-reset').on('click', function() {
                $('#filter-list input').each(function() {
                    $(this).removeAttr('checked');
                });
            });
            $inputText.on('keyup', function() {
                var value = $inputText.val()
                if (value !== '') {
                    $('#filter-list > div').hide()
                    $('#filter-list > div:icontains(' + value + ')').show()
                } else {
                    $('#filter-list > div').show()
                }
            });
        }

        this.each(function() {
            // TODO: check if is a table
            const table = this;
            let tableBody = $(this).find("tbody");

            // add filter element to all top tds
            let headerRow = $(this).find("thead");
            
            // attach column filters to table
            var allColumnFilters = [];

            resetColumnFilters(table);

            // add filter icons to each header
            var headers = headerRow.find("td");
            headers.each(function(columnIndex) {
                const header = $(this);
                if (header.find(".filter-icon-wrapper").length > 0) { // autofilter() called again, reset with new data
                    header.find('.filter-icon').removeClass('filtering');
                    tableBody.find("tr").show(); // show all rows
                } else { // no icon yet, create it
                    header.append("<div class='filter-icon-wrapper'><div class='filter-icon'></div></div>");
                    var filterIcon = header.find(".filter-icon");

                    filterIcon.click(function() {
                        const allColumnFilters = table._allColumnFilters;

                        // empty the list and put in the filters for this column
                        $("#filter-list").html("");
                        var columnFilters = allColumnFilters[columnIndex];
                        for (var filterIndex = 0; filterIndex < columnFilters.length; filterIndex++) {
                            let filter = columnFilters[filterIndex];
                            let checkId = "autofilter_check" + filterIndex;
                            let checkedStr = filter["checked"] ? " checked" : "";
                            $("#filter-list").append("<div><input id='" + checkId + "' type='checkbox'" + checkedStr + "><label>" + filter["label"] + "</label></div>");
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

                            // build the filter set for each column
                            var allColumnFilterSets = allColumnFilters.map(function(columnFilters) {
                                return new Set(columnFilters.filter(function(filter) {
                                    return filter["checked"];
                                }).map(function(filter){ 
                                    return filter["label"];
                                }));
                            });

                            updateRowVisibility(table, allColumnFilterSets);
                            $inputText.val('');
                            $this.trigger('autofilter.FILTERING_END');
                        });
                    });
                }
            });
        });
    }
}(jQuery));
