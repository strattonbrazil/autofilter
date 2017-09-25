# autofilter (jquery plugin)

*autofilter* is a simple jquery plugin for filtering tables per column.  When applied to a well-formatted table element, it will allow multi-column filtering.  

# Dependencies
* jquery
* jquery-modal (https://github.com/kylefox/jquery-modal)

# Integration
To use autofilter, included the required dependencies as well as the *autofilter.js* file.  Then call *autofilter()* on the jquery-wrapped table.  
```javascript
$('table').autofilter();
```
If the data in the table changes after calling *autofilter*, simply call the function again and the filters will be regenerated.  

### Config Options
*autofilter* also takes an optional configuration dictionary.  

```javascript
$('table').autofilter({
    // config
});
```
*blacklist* - an array of column indices (zero-indexed) to be excluded from sorting

# TODO
* support automatic updates to dynamic tables (no need for reset)
* move demo code out of *src* directory
