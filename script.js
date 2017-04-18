
var folio = JSON.parse(localStorage.getItem('folio'))
if(folio == null || (typeof folio) === 'undefined') {
    folio = new Object();
    folio["BTC"] = 1.2;
    folio["ETH"] = 5;
}
load()

function load() {
    $.ajax({ 
        type: 'GET', 
        url: 'http://www.coincap.io/front', 
        data: {  }, 
        dataType: 'json',
        success: function (data) { 
            dtable = new webix.ui({
                view:"datatable",
                columns:[
                { id:"thumb",   header:"Logo", adjust: true},
                { id:"name",   header:[ "Name",{content:"textFilter"}], adjust: true, sort:"string"},
                { id:"symbol",    header:[ "Symbol",{content:"textFilter"}], adjust: true,sort:"string"},
                { id:"price",   header:"Price", adjust: true, sort:"int"},
                { id:"holding",   header:"Holding", editor:"text", adjust: true, sort:"int"},
                { id:"holdingValue",   header:"Holding Value", adjust: true, sort:"int"}
                ],
                data: computeDataTableData(data),
                editable:true

            });
            dtable.attachEvent("onAfterEditStop", function(state, editor, ignoreUpdate){
                if (!ignoreUpdate) {
                   var item = this.getItem(editor.row);
                   folio[item.symbol] = parseFloat(item.holding)
                   item.holdingValue = getHoldingValue(item.symbol, item.price);
                   this.updateItem(editor.row, item);
                   var data_list = []
                   dtable.eachRow( 
                    function (row){ 
                        data_list.push(dtable.getItem(row));
                    }
                    )
                   $("#totalHoldingValue").html( "<h2>Total Holding Value: $" + getTotalHoldingValue(data_list) +  "</h2>");
                   localStorage.setItem('folio', JSON.stringify(folio))

               }
           })
            $("#totalHoldingValue").html( "<h2>Total Holding Value: $" + getTotalHoldingValue(computeDataTableData(data)) +  "</h2>");

        }
    });
}
function getTotalHoldingValue(list) {
    totalHoldingValue = 0;
    $.each(list, function(index, element) {
        if (element.holdingValue == undefined) 
            element.holdingValue = 0
        totalHoldingValue = totalHoldingValue + element.holdingValue;
    });
    return totalHoldingValue;

}
function computeDataTableData(raw_data) {
    var list = []
    $.each(raw_data, function(index, element) {
        list.push({thumb: getThumbnail(element.long), name:element.long, symbol:element.short, price:element.price, holding: getHolding(element.short), holdingValue: getHoldingValue(element.short, element.price)})
    });
    
    return list;
}

function getThumbnail(name) {
    name = name.replace(/\s+/g, '-').toLowerCase();
    return "<img src=\'http://coinmarketcap.com/static/img/coins/16x16/" + name + ".png\'</img>";
}

function getHoldingValue(symbol, price) {
    var holding = getHolding(symbol);
    var holdingValue = holding * price;
    if(Number.isNaN(holdingValue))
        return 0;
    else
        return holdingValue;
}
function getHolding(symbol) {
    return folio[symbol] == undefined ? 0 : folio[symbol];
}
