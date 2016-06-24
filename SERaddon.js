// ==UserScript==
// @name         Secondary Entry Report addon
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://mis.emitra.gov.in/Reports/rpt_bhamashah_secondary_trans_dtl.jsp*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0/jquery.min.js

// @grant        none
// ==/UserScript==

// go to line number 179

(function($) {

$.fn.ddTableFilter = function(options) {
  options = $.extend(true, $.fn.ddTableFilter.defaultOptions, options);

  return this.each(function() {
    if($(this).hasClass('ddtf-processed')) {
      refreshFilters(this);
      return;
    }
    var table = $(this);
    var start = new Date();

    $('th:visible', table).each(function(index) {
      if($(this).hasClass('skip-filter')) return;
      var selectbox = $('<select>');
      var values = [];
      var opts = [];
      selectbox.append('<option value="--all--">' + $(this).text() + '</option>');

      var col = $('tr:not(.skip-filter) td:nth-child(' + (index + 1) + ')', table).each(function() {
        var cellVal = options.valueCallback.apply(this);
        if(cellVal.length == 0) {
          cellVal = '--empty--';
        }
        $(this).attr('ddtf-value', cellVal);

        if($.inArray(cellVal, values) === -1) {
          var cellText = options.textCallback.apply(this);
          if(cellText.length == 0) {cellText = options.emptyText;}
          values.push(cellVal);
          opts.push({val:cellVal, text:cellText});
        }
      });
      if(opts.length < options.minOptions){
        return;
      }
      if(options.sortOpt) {
        opts.sort(options.sortOptCallback);
      }
      $.each(opts, function() {
        $(selectbox).append('<option value="' + this.val + '">' + this.text + '</option>');
      });

      $(this).wrapInner('<div style="display:none">');
      $(this).append(selectbox);

      selectbox.bind('change', {column:col}, function(event) {
        var changeStart = new Date();
        var value = $(this).val();

        event.data.column.each(function() {
          if($(this).attr('ddtf-value') === value || value == '--all--') {
            $(this).removeClass('ddtf-filtered');
          }
          else {
            $(this).addClass('ddtf-filtered');
          }
        });
        var changeStop = new Date();
        if(options.debug) {
          console.log('Search: ' + (changeStop.getTime() - changeStart.getTime()) + 'ms');
        }
        refreshFilters(table);

      });
      table.addClass('ddtf-processed');
      if($.isFunction(options.afterBuild)) {
        options.afterBuild.apply(table);
      }
    });

    function refreshFilters(table) {
      var refreshStart = new Date();
      $('tr', table).each(function() {
        var row = $(this);
        if($('td.ddtf-filtered', row).length > 0) {
          options.transition.hide.apply(row, options.transition.options);
        }
        else {
          options.transition.show.apply(row, options.transition.options);
        }
      });

      if($.isFunction(options.afterFilter)) {
        options.afterFilter.apply(table);
      }

      if(options.debug) {
        var refreshEnd = new Date();
        console.log('Refresh: ' + (refreshEnd.getTime() - refreshStart.getTime()) + 'ms');
      }
    }

    if(options.debug) {
      var stop = new Date();
      console.log('Build: ' + (stop.getTime() - start.getTime()) + 'ms');
    }
  });
};

$.fn.ddTableFilter.defaultOptions = {
  valueCallback:function() {
    return encodeURIComponent($.trim($(this).text()));
  },
  textCallback:function() {
    return $.trim($(this).text());
  },
  sortOptCallback: function(a, b) {
    return a.text.toLowerCase() > b.text.toLowerCase();
  },
  afterFilter: null,
  afterBuild: null,
  transition: {
    hide:$.fn.hide,
    show:$.fn.show,
    options: []
  },
  emptyText:'--Empty--',
  sortOpt:true,
  debug:false,
  minOptions:2
};

})(jQuery);
//-----------------

var tableRow = $('table tr').not(':first');




var ia_gp;
function csvToArray (data) {
   var row, rows = data.split(';');
    var arr = [];
    for (var i = 0; i < rows.length; i++) {
       row = rows[i].split(',');
        arr[row[0]] = row[1];
    }
    return arr;
}
function sumCols(columnIndex) {
    var t = 0;
    $('table tr:visible > td:nth-child(' +  columnIndex + ')').each(function() {
        var text =  $(this).text().trim();
        t += parseInt(text, 10);
    });
   return t;
}

function addName(ia_gp) {
    $('table tr:first-child').append('<th width="80">IA Name</th>');
    tableRow.each(function(){
        var gp = $(this).find('td:last-child').text().trim();
        var ia = ia_gp[gp];
        $(this).append('<td bgcolor="#FFD6AD">' + ia + '</td>');
    });
}

(function() {
    'use strict';
    
    //use your GP,IA; formated string;

    var data = "BDIYAL KLAN,ravi ved;LOTWADA,ravi ved;NIHALPURA,sushil pardhan;KHERI,ravi ved;BEJUPADA,brijesh;BDIYAL KHURD,brijesh;ANANTWADA,ravi ved;BASWA,brijesh;BHANDEDA,devendra;ABHANERI,devendra;RLAVTA,ravi ved;GOLADA,sushil pardhan;BHANWTA-BHANWTI,nihal singh;MUNDGHISYA,ravi ved;NAGALJAMARWADA,devendra;GUDHLIYAN,nihal singh;KARNAWAR,brijesh;UNBADAGANV,sushil pardhan;KOLWA,nihal singh;PUNDARPADA,ravi ved;DIGARIYA BHIM,sushil pardhan;DELADI,nihal singh;SHYALAWAS,sushil pardhan;PICHPADA KLAN,nihal singh;BIVAI,devendra;MUHI,brijesh;CHANDAIRA,brijesh;ANNIYAN,nihal singh;DHNAWADH,nihal singh;GUDAKATLA,brijesh;PANDHITPURA,devendra;PRATAPPURA,nihal singh;KOLANA,sushil pardhan;NANDERA,ravi ved";
    ///
    ////
    /////
    
    
    ia_gp = csvToArray(data);
    addName(ia_gp);
    $('Table').ddTableFilter();
    $('body').append('<h2 id="count">Transaction total: ' + sumCols(7) + ' Amount: ' + sumCols(8));

    $('select').on('change', function() {
        $('#count').text('Transaction total: ' + sumCols(7) + ' Amount: ' + sumCols(8));
    });

})();

