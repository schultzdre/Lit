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
//RemoveFromList("removeAuthorOptions")
function removeFromList(node) {
    //Get the one to remove
    var d = document.getElementById(node).value;
    //Remove from saved list
    chrome.storage.sync.get("libraries", function (item) {
        var index = item.libraries.indexOf(curlib);
        item.libraries.splice(index, 1);
        chrome.storage.sync.set({ "libraries": item.libraries })
    })
    //Remove articles from that library from saved list
    chrome.storage.sync.get("allArticles", function (item) {
        var i = 0;
        while (i < item.allArticles.length) {
            ss = item.allArticles[i].split("%in%");
            if (ss[0] === curlib) {
                item.allArticles.splice(i, 1);
            } else {
                i++;
            }
        }
        chrome.storage.sync.set({ "allArticles": item.allArticles })
        console.log(item.allArticles)
    })
    //Remove nodes
    document.getElementById(curlib).remove();
    document.getElementById("OPT" + curlib).remove();
}