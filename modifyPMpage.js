function changeCellBackgroundColor(cell) {
    if (cell.id != "inlib") {
        cell.style.backgroundColor = "#B3B3B3";
    }
}
function restoreCellBackgroundColor(cell) {
    if (cell.id != "inlib") {
        cell.style.backgroundColor = "#ffffff";
    } else {
        cell.style.backgroundColor = "#B3B3B3"
    }
    
}
function addLatestPaperToLibrary(node) {
    node.childNodes[0].style.backgroundColor = "#B3B3B3"
    node.childNodes[0].id = "inlib"
    pmid = node.className
    chrome.storage.sync.get(["libraries", "allArticles","libraryTags"], function (item) {
        index = item.libraries.indexOf(node.childNodes[0].innerHTML)
        if (item.allArticles[index].indexOf(pmid) == -1) { 
            item.allArticles[index].push(pmid) 
            item.libraryTags[index].push("")
        }
        chrome.storage.sync.set({ "allArticles": item.allArticles })
        chrome.storage.sync.set({ "libraryTags": item.libraryTags })
    })
}

chrome.storage.sync.get(["libraries","allArticles","alterPMsite"],function(item) {
    //Get pmid node
    if (!item.alterPMsite) {return}
    node = document.getElementsByClassName("result-actions-bar")
    if (node.length == 0) {
        node = [document.getElementById("full-view-heading")]
        paperpage = true
    } else {
        paperpage = false
    }
    for(var k = 0; k < node.length; k++) {
        if (node[k].childElementCount == 1) {continue;}
        //Make menu
        var dt = document.createElement("div");
        dt.className = "CellWithComment";
        dt.innerHTML = "Lit";
        dt.style.display = "inline";
        dt.style.color = "#5b616b"
        span = document.createElement("span");
        span.className = "CellComment";
        ul = document.createElement("ul")

        if (paperpage) {
            pmid = node[k].getElementsByClassName("current-id")[0].innerHTML
        } else {
            pmid = node[k].parentNode.children[0].children[0].getAttribute("data-ga-label")
        }

        if (item.libraries != null) {
            for (var i = 0; i < item.libraries.length; i++) {
                //make node
                li = document.createElement("li")
                li.onclick = function () { addLatestPaperToLibrary(this) };
                li.className = pmid;

                a = document.createElement("a")
                a.innerHTML =  item.libraries[i]
                a.className = "LitLib"
                a.onmouseover = function () { changeCellBackgroundColor(this); };
                a.onmouseout = function () { restoreCellBackgroundColor(this) };
                
                for (var n = 0; n < item.allArticles[i].length; n++) {
                    if (item.allArticles[i][n] == pmid) {
                        a.id = "inlib";
                        a.style.backgroundColor = "#B3B3B3";
                        break;
                    }
                }
                li.appendChild(a)
                
                //append
                if (i == 0) {
                    ul.appendChild(li);
                } else {
                    for (var j = 0; j < ul.childElementCount; j++) { if (item.libraries[i].toLowerCase() < ul.childNodes[j].innerHTML.toLowerCase()) { break; } }
                    ul.insertBefore(li, ul.childNodes[j]);
                }
            }
        }
            span.appendChild(ul)
            dt.appendChild(span)
            node[k].appendChild(dt)
    }
})