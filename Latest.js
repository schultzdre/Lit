//addToList("newAuthorName","authorsLatest","removeAuthorOptions","authorsList")
function addToList(node, vari, removeOPT, listID) {
    //New Library Name
    var d = document.getElementById(node).value;
    //Append
    ul = document.getElementById(listID);
    for (var j = 0; j < ul.childElementCount; j++) {
        if (d === ul.childNodes[j].innerHTML) {
            document.getElementById(node).value = "";
            return;
        }
    }
    li = document.createElement("li");
    li.id = d;
    li.innerHTML = d;
    ul.appendChild(li)
    //Add as remove option
    var select = document.getElementById(removeOPT);
    var option = document.createElement("option")
    option.innerHTML = d;
    option.id = "OPT" + d;
    select.appendChild(option);
    //Save
    chrome.storage.sync.get(vari, function (item) {
        if (item.authorsLatest == null) {
            item.authorsLatest = [d]
        } else {
            item.authorsLatest.push(d);
        };
        chrome.storage.sync.set({ vari: item.authorsLatest })
    })
    //Reset
    document.getElementById(node).value = "";
}