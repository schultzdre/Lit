//Settings
$("#Latest").colResizable({ resizeMode: 'fit' });
window.onresize = function () {
    table = document.getElementById("Latest");
    tw = Number(table.style.width.replace("px",""));
    ww = window.innerWidth;
    sf = ww/tw;
    tr = document.getElementsByClassName("searchHeader")
    for (var i = 0; i < tr.childElementCount; i++) {
        ow = Number(tr.children[i].style.width.replace("px",""));
        tr.children[i].style.width = Math.floor(ow*sf) + "px";
    }
}
function changeTableTextSize() {
    var sz = document.getElementById("tableTextSize").value + "px";
    tags = ["TD", "TH", "INPUT", "P", "DIV", "OPTION", "BUTTON"]
    for (var count = 0; count < tags.length; count++) {
        ids = document.getElementsByTagName(tags[count]);
        for (var i = 0; i < ids.length; i++) {
            ids[i].style.fontSize = sz;
        }
    }
}
function changeTableBackgroundColor() {
    var sz = document.getElementById("tableBackgroundColor").value;
    ids = document.getElementsByTagName("TD");
    for (var i = 0; i < ids.length; i++) {
        ids[i].style.backgroundColor = sz;
    }
}
function changeBackgroundColor() {
    document.getElementsByTagName('BODY')[0].style.backgroundColor = document.getElementById('backgroundColor').value
}
function changeFont() {
    document.getElementsByTagName('BODY')[0].style.fontFamily = document.getElementById("docFont").value;
}
function toggleHover() {
    var tds = document.getElementsByTagName('TD');
    if (document.getElementById("hooverBool").checked) {
        for (var i = 0; i < tds.length; i++) {
            if (!tds[i].id != "remove") { tds[i].title = tds[i].innerHTML; };
        }
    } else {
        for (var i = 0; i < tds.length; i++) { tds[i].title = ""; }
    }
}
function changeRowBackgroundColor(row) {
    for (var i = 0; i < row.childElementCount; i++) {
        row.childNodes[i].style.backgroundColor = document.getElementById("tableHoverColor").value;
    }
}
function restoreRowBackgroundColor(row) {
    for (var i = 0; i < row.childElementCount; i++) {
        row.childNodes[i].style.backgroundColor = document.getElementById("tableBackgroundColor").value;
    }
}
function changeCellBackgroundColor(cell) {
    if (cell.id != "inlib") {
        cell.style.backgroundColor = document.getElementById("tableHoverColor").value;
    }
}
function restoreCellBackgroundColor(cell) {
    if (cell.id != "inlib") {
        cell.style.backgroundColor = document.getElementById("backgroundColor").value;
    } else {
        cell.style.backgroundColor = "#B3B3B3"
    }
    
}
chrome.storage.sync.get("popupTableTextSize", function (item) {
    var sz = item.popupTableTextSize;
    tags = ["TD", "TH", "INPUT", "P", "DIV", "OPTION", "BUTTON"]
    for (var count = 0; count < tags.length; count++) {
        ids = document.getElementsByTagName(tags[count]);
        for (var i = 0; i < ids.length; i++) {
            ids[i].style.fontSize = sz;
        }
    }
    document.getElementById("tableTextSize").value = sz.replace("px", "");
})
chrome.storage.sync.get("popupTableBackgroundColor", function (item) {
    var sz = item.popupTableBackgroundColor;
    ids = document.getElementsByTagName("TD");
    for (var i = 0; i < ids.length; i++) {
        ids[i].style.backgroundColor = sz;
    }
    document.getElementById("tableBackgroundColor").value = sz;
})
chrome.storage.sync.get("popupBackgroundColor", function (item) {
    var sz = item.popupBackgroundColor;
    document.getElementsByTagName('BODY')[0].style.backgroundColor = sz;
    document.getElementById("backgroundColor").value = sz;
})
chrome.storage.sync.get("popupHoverColor", function (item) {
    var sz = item.popupHoverColor;
    document.getElementById("tableHoverColor").value = sz;
})
chrome.storage.sync.get("popupFont", function (item) {
    var sz = item.popupFont;
    document.getElementsByTagName('BODY')[0].style.fontFamily = sz;
    document.getElementById("docFont").value = sz;
})

//Import
function sortTable(tname, cname) {
    //Define variables
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    switching = true;
    //Get table
    table = document.getElementById(tname);
    //Delete open frames
    nodes = table.children;
    //Set the sorting direction to ascending:
    dir = "asc";
    //Get rows
    rows = table.getElementsByTagName("TR");
    //Get visible rows
    var index = [];
    for (var j = 1; j < rows.length; j++) { if (rows[j].style.display === "table-row") { index.push(j) } };
    //Sort
    while (switching) {
        //start by saying: no switching is done:
        switching = false;
        //Go through each
        for (var i = 1; i < (index.length); i++) {
            //start by saying there should be no switching:
            shouldSwitch = false;
            //Get two elements
            x = rows[index[i - 1]].cells[cname].innerHTML.toLowerCase();
            y = rows[index[i]].cells[cname].innerHTML.toLowerCase();
            //Test
            if (dir == "asc") {
                if (x > y) {
                    //if so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (x < y) {
                    //if so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            if (index[i] - index[i - 1] == 1) {
                rows[index[i - 1]].parentNode.insertBefore(rows[index[i]], rows[index[i - 1]]);
            } else {
                rows[index[i]].parentNode.insertBefore(rows[index[i]], rows[index[i - 1] + 1]);
                rows[index[i - 1]].parentNode.insertBefore(rows[index[i - 1]], rows[index[i] + 1]);
            }
            //Redefine switching
            switching = true;
            //Each time a switch is done, increase this count by 1:
            switchcount++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}
function filterTable(library, searchTerm, regexpBool, byfieldBoolID) {
    //Get filtering element
    var filt = document.getElementById(searchTerm).value;
    if (document.getElementById(regexpBool).checked == false) {
        var regfilt = new RegExp("^(?=.*" + filt.replace(/ /g, ")(?=.*") + ")", 'i');
    } else {
        var regfilt = new RegExp(filt, 'g');
    }
    var byFieldBool = document.getElementById(byfieldBoolID).checked;
    //get nodes
    nodes = document.getElementById(library).childNodes;
    //if empty
    if (filt.length == 0) {
        for (var i = 2; i < nodes.length; i++) {
            nodes[i].style.display = "table-row";
        }
    } else {
        if (byFieldBool) {
            for (var i = 2; i < nodes.length; i++) {
                nodes[i].style.display = "none";
                for (var j = 1; j < nodes[i].childElementCount; j++) {
                    teststr = nodes[i].childNodes[j].innerHTML;
                    if (regfilt.test(teststr)) {
                        nodes[i].style.display = "table-row";
                        break;
                    }
                }
            }
        } else {
            for (var i = 2; i < nodes.length; i++) {
                nodes[i].style.display = "none";
                var teststr = "";
                for (var j = 1; j < nodes[i].childElementCount; j++) {
                    teststr = teststr + " " + nodes[i].childNodes[j].innerHTML;
                }
                if (regfilt.test(teststr)) {
                    nodes[i].style.display = "table-row";
                }
            }
        }

    }
}
function togglePaperIFrame(nodeid) {
    //get the node
    console.log(nodeid)
    var node = document.getElementById(nodeid);
    console.log(node)
    //if frame is in
    if (node.nextSibling != null && /FR/g.test(node.nextSibling.id)) {
        node.nextSibling.remove();
    } else {
        var iframe = document.createElement("iframe");
        iframe.src = "https://www.ncbi.nlm.nih.gov/pubmed/" + /[0-9]+/g.exec(nodeid)[0];
        iframe.style = "width: 100%; height: 100%;";
        var tr = document.createElement("tr");
        tr.id = "FR" + nodeid;
        var td = document.createElement("td");
        td.colSpan = node.childElementCount;
        td.height = 800;
        td.appendChild(iframe)
        tr.appendChild(td);
        console.log(node)
        console.log(node.parentNode)
        if (node.nextSibling == null) {
            node.parentNode.appendChild(tr);
        } else {
            node.parentNode.insertBefore(tr, node.nextSibling);
        }
    }
}

//Get Search Terms
function addAuthor() {
    var elem = document.getElementById("newAuthorName");
    elem.onkeypress = function (e) {
        if (e.keyCode == 13) {
            addAuthorLatest()
        }
    }
}
function addAuthorLatest() {
    chrome.storage.sync.get("authorLatest", function (item) {
        var elem = document.getElementById("newAuthorName").value;
        if (item.authorLatest != null && item.authorLatest.indexOf(elem) != -1) { return;}
        if (elem == "") { return;}
        if (item.authorLatest == null) {
            item.authorLatest = [elem];
        } else {
            item.authorLatest.push(elem);
        }
        chrome.storage.sync.set({ "authorLatest": item.authorLatest })
        reloadAuthorLatest()
        document.getElementById("newAuthorName").value = "";
    })
}
function reloadAuthorLatest() {
    chrome.storage.sync.get("authorLatest", function (item) {
        if (item.authorLatest == null) {return;}
        var ul = document.getElementById("authorsList");
        var select = document.getElementById("removeAuthorOptions");
        while (ul.firstChild) {
            ul.removeChild(ul.firstChild);
        }
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
        for (var i = 0; i < item.authorLatest.length; i++) {
            //Add to list
            var li = document.createElement("li");
            li.id = item.authorLatest[i];
            li.innerHTML = item.authorLatest[i];
            //li.onclick = function () { openURL(this) }
            //Add as remove option
            var option = document.createElement("option")
            option.innerHTML = item.authorLatest[i];
            option.id = "OPT" + item.authorLatest[i];
            //Order
            if (i == 0) {
                ul.appendChild(li);
                select.appendChild(option);
            } else {
                for (var j = 0; j < ul.childElementCount; j++) { if (item.authorLatest[i].toLowerCase() < ul.childNodes[j].innerHTML.toLowerCase()) { break; } }
                ul.insertBefore(li, ul.childNodes[j]);
                select.insertBefore(option, select.childNodes[j])
            }
        }
    })
}
function removeAuthorLatest() {
    elem = document.getElementById("removeAuthorOptions").value;
    chrome.storage.sync.get("authorLatest", function (item) {
        index = item.authorLatest.indexOf(elem);
        item.authorLatest.splice(index, 1)
        chrome.storage.sync.set({ "authorLatest": item.authorLatest })
        reloadAuthorLatest()
    })
}

function addTerm() {
    var elem = document.getElementById("newTermName");
    elem.onkeypress = function (e) {
        if (e.keyCode == 13) {
            addTermLatest()
        }
    }
}
function addTermLatest() {
    chrome.storage.sync.get("termLatest", function (item) {
        var elem = document.getElementById("newTermName").value;
        if (item.termLatest != null && item.termLatest.indexOf(elem) != -1) { return; }
        if (elem == "") { return; }
        if (item.termLatest == null) {
            item.termLatest = [elem];
        } else {
            item.termLatest.push(elem);
        }
        chrome.storage.sync.set({ "termLatest": item.termLatest })
        reloadTermLatest()
        document.getElementById("newTermName").value = "";
    })
}
function reloadTermLatest() {
    chrome.storage.sync.get("termLatest", function (item) {
        if (item.termLatest == null) {return;}
        var ul = document.getElementById("termsList");
        var select = document.getElementById("removeTermOptions");
        while (ul.firstChild) {
            ul.removeChild(ul.firstChild);
        }
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
        for (var i = 0; i < item.termLatest.length; i++) {
            //Add to list
            var li = document.createElement("li");
            li.id = item.termLatest[i];
            li.innerHTML = item.termLatest[i];
            //li.onclick = function () { openURL(this) }
            //Add as remove option
            var option = document.createElement("option")
            option.innerHTML = item.termLatest[i];
            option.id = "OPT" + item.termLatest[i];
            //Order
            if (i == 0) {
                ul.appendChild(li);
                select.appendChild(option);
            } else {
                for (var j = 0; j < ul.childElementCount; j++) { if (item.termLatest[i].toLowerCase() < ul.childNodes[j].innerHTML.toLowerCase()) { break; } }
                ul.insertBefore(li, ul.childNodes[j]);
                select.insertBefore(option, select.childNodes[j])
            }
        }
    })
}
function removeTermLatest() {
    elem = document.getElementById("removeTermOptions").value;
    chrome.storage.sync.get("termLatest", function (item) {
        index = item.termLatest.indexOf(elem);
        item.termLatest.splice(index, 1)
        chrome.storage.sync.set({ "termLatest": item.termLatest })
        reloadTermLatest()
    })
}

function reloadLibsLatest() {
    //chrome.storage.sync.set({ "librariesLatest": [] })
    chrome.storage.sync.get(["libraries","librariesLatest"], function (item) {
        var ul = document.getElementById("liblistlist");
        while (ul.firstChild) {
            ul.removeChild(ul.firstChild);
        }

        //Load Libraries
        for (var i = 0; i < item.libraries.length; i++) {
            var li = document.createElement("li");
            li.innerHTML = item.libraries[i] + ": ";
            li.id = item.libraries[i];
            var input = document.createElement("input");
            input.id = item.libraries[i];
            input.value = item.librariesLatest[i];
            input.type = "number";
            input.style = "width: 3em";
            input.onchange = function () { changeLibrariesLatest(this); };
            li.appendChild(input);
            ul.appendChild(li);
        }
    })
}
function changeLibrariesLatest(node) {
    chrome.storage.sync.get(["libraries","librariesLatest"], function (item) {
        index = item.libraries.indexOf(node.parentNode.id)
        item.librariesLatest[index] = node.value;
        chrome.storage.sync.set({ "librariesLatest": item.librariesLatest })
    })
}

function getSearchPapers(term) {
    //Get max Search Size
    maxSearchSize = document.getElementById("maxRecSize").value;
    //Get search term
    srcterm = term;

    //replace search characters
    rpl = [' ', '%', ':', '\\[', '\\]', '\'']
    rplby = ['+', '%25', '%3A', '%5B', '%5D', '%27']
    for (i = 0; i < rpl.length; i++) {
        srcterm = srcterm.replace(new RegExp(rpl[i], 'g'), rplby[i])
    }

    //Define connection
    var xhr = new XMLHttpRequest(),
        method = "GET",
        url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=" + srcterm + "&RetMax=" + maxSearchSize;

    //Define return
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            //read the document
            var doc = xhr.responseXML;
            numberOfResults = Number(doc.childNodes[1].children[0].innerHTML);

            //get list of papers
            var tmp = doc.childNodes[1].children[3].children;
            var pprs = [];
            for (var i = 0; i < tmp.length; i++) {
                pprs.push(tmp[i].innerHTML)
            }

            table = document.getElementById("Latest");
            for (var i = 0; i < pprs.length; i++) {
                addArticleToTable("Latest", pprs[i],term)
            }
        }
    }
    xhr.open(method, url, true);
    xhr.send();
}
function getRecommendationList(library,thresh) {

    chrome.storage.sync.get(["libraries", "allArticles"], function (item) {
        //get all papers
        libPapers = item.allArticles[item.libraries.indexOf(library)]
        //if not worth it dont bothe
        if (thresh > libPapers.length) { return; }

        //If worth it continue
        //initialize suggestsion vector
        var sug = [];
        var sugcount = [];
        //parse
        for (var i = 0; i < libPapers.length; i++) {
            //Define connection
            var xhr = new XMLHttpRequest(),
                method = "GET"
            url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pubmed&linkname=pubmed_pubmed&id=" + libPapers[i];

            //Get suggestions
            var tmp
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    //read the document
                    var doc = xhr.responseXML;
                    tmp = doc.childNodes[1].innerHTML.match(/<Id>(.*)<\/Id>/gi);
                    tmp = tmp.map(function (e) { e = e.replace("<Id>", ""); return e; })
                    tmp = tmp.map(function (e) { e = e.replace("</Id>", ""); return e; })
                    for (var j = 1; j < tmp.length; j++) {
                        var index = sug.indexOf(tmp[j])
                        if (index == -1) {
                            sug.push(tmp[j])
                            sugcount.push(1)
                        } else {
                            sugcount[index]++
                        }
                    }
                }
            }
            xhr.open(method, url, false);
            xhr.send();
        }

        var list = [];
        for (var j = 0; j < sug.length; j++) {
            list.push({ 'pmid': sug[j], 'count': sugcount[j] });
        }
        list.sort(function (a, b) {
            return ((Number(a.pmid) > Number(b.pmid)) ? -1 : ((a.pmid == b.pmid) ? 0 : 1));
        });

        //Add papers to library
        maxSearchSize = document.getElementById("maxRecSize").value;
        for (var k = 0; k < sug.length && k < maxSearchSize; k++) {
            if (sugcount[k] >= thresh) {
                addArticleToTable("Latest", list[k].pmid, library + " (" + list[k].count + ")")
            }
        }
        
    })
}
function addArticleToTable(tableName, pmid, basedon) {
    //Open connection
    var xhr = new XMLHttpRequest(),
        method = "GET",
        url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=" + pmid + "&retmode=xml",
        adata = [pmid],
        fields = ['PMID', 'Authors', 'Title', 'JournalAbv', 'Year', 'Volume', 'Issue',
            'Page', 'Month', 'Abstract', 'JournalFull'];
    //Execute
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            chrome.storage.sync.get(["libraries","allArticles"], function (item) {
                //read the document
                var doc = xhr.responseXML;
                var tmp;

                //reading function
                function readLocalPath(xmlpath) {
                    var fld = "";
                    tmp = doc.evaluate(xmlpath, doc, null, 0, null);
                    tmpfld = tmp.iterateNext();
                    while (tmpfld) {
                        fld = fld + " " + tmpfld.innerHTML;
                        tmpfld = tmp.iterateNext();
                    }
                    return fld;
                }

                //See if article is recent enough
                since = new Date(document.getElementById("sinceDate").value).getTime()
                all = doc.evaluate('//PubmedData/History/PubMedPubDate[@PubStatus="pubmed"]', doc, null, 0, null).iterateNext();
                if (all == null) { console.log(pmid); return;}

                pubdate = new Date(Number(all.childNodes[1].innerHTML),
                Number(all.childNodes[3].innerHTML) - 1,
                Number(all.childNodes[5].innerHTML)).getTime()
                

                if (pubdate < since) { return; }

                //get all the authors
                var ln = doc.evaluate('//Author/LastName', doc, null, 0, null);
                var fn = doc.evaluate('//Author/Initials', doc, null, 0, null);
                var lnn = ln.iterateNext()
                var fnn = fn.iterateNext()
                authors = [];
                do {
                    var init = fnn.innerHTML
                    var initp = init.split('').join('.') + '.';
                    var y = lnn.innerHTML + ', ' + initp
                    authors.push(y)
                    lnn = ln.iterateNext()
                    fnn = fn.iterateNext()
                } while (lnn != null)
                authors = authors.join('; ')
                adata.push(authors);
                adata.push(readLocalPath('//Article/ArticleTitle'));
                adata.push(readLocalPath('//Article/Journal/ISOAbbreviation'));

                if (readLocalPath('//Journal/JournalIssue/PubDate/Year')) {
                    adata.push(readLocalPath('//Journal/JournalIssue/PubDate/Year'));
                } else if (readLocalPath('//Journal/JournalIssue/PubDate/MedlineDate').split(" ")[0]) {
                    adata.push(readLocalPath('//Journal/JournalIssue/PubDate/MedlineDate').split(" ")[0]);
                } else {
                    adata.push(readLocalPath('//Article/ArticleDate/Year'));
                }
                adata.push(readLocalPath('//Journal/JournalIssue/Volume'));
                adata.push(readLocalPath('//Journal/JournalIssue/Issue'))
                adata.push(readLocalPath('//Article/Pagination/MedlinePgn'));
                adata.push(readLocalPath('//Journal/JournalIssue/PubDate/Month'))
                adata.push(readLocalPath('//Article/Abstract/AbstractText'));
                adata.push(readLocalPath('//Article/Journal/Title'));

                //Make tr element
                var align = ["center", "left", "left", "left", "center", "center",
                    "center", "center", "center", "left", "left"]
                tr = document.createElement("tr");
                tr.id = "L" + adata[0];
                tr.style.display = "table-row";

                tr.onmouseover = function () { changeRowBackgroundColor(this); };
                tr.onmouseout = function () { restoreRowBackgroundColor(this) };

                //Make delete button
                var td = document.createElement("td");
                td.id = "remove";
                var img = document.createElement("img");
                img.src = "blueCircle.png";

                td.className = "CellWithComment";
                span = document.createElement("span");
                span.className = "CellComment";
                ul = document.createElement("ul")
                for (var i = 0; i < item.libraries.length; i++) {
                    //make node
                    li = document.createElement("li")
                    li.onclick = function () { addLatestPaperToLibrary(pmid.replace("L", ""), this) };

                    a = document.createElement("a")
                    a.innerHTML =  item.libraries[i]
                    a.onmouseover = function () { changeCellBackgroundColor(this); };
                    a.onmouseout = function () { restoreCellBackgroundColor(this) };
                    

                    for (var n = 0; n < item.allArticles[i].length; n++) {
                        if (item.allArticles[i][n] == adata[0]) {
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
                span.appendChild(ul)
                
                //td.style = "white-space: nowrap; text-overflow:ellipsis; overflow: hidden; max-width:1px;";
                td.style.backgroundColor = document.getElementById("tableBackgroundColor").value;
                td.align = "center";
                img.width = "10";
                img.height = "10";
                td.appendChild(img);
                td.appendChild(span);
                tr.appendChild(td);

                //Make based on
                var td = document.createElement("td");
                td.id = "basedon";
                td.style = "white-space: nowrap; text-overflow:ellipsis; overflow: hidden; max-width:1px;";
                td.style.backgroundColor = document.getElementById("tableBackgroundColor").value;
                td.align = "center";
                td.innerHTML = basedon.replace("[Author]", "");
                tr.appendChild(td);

                //Make pub date
                var td = document.createElement("td");
                td.id = "pubdate";
                td.style = "white-space: nowrap; text-overflow:ellipsis; overflow: hidden; max-width:1px;";
                td.style.backgroundColor = document.getElementById("tableBackgroundColor").value;
                td.align = "center";
                td.innerHTML = all.childNodes[1].innerHTML + "/"
                if (all.childNodes[3].innerHTML.length == 1) {
                    td.innerHTML = td.innerHTML + "0" + all.childNodes[3].innerHTML + "/" 
                } else {
                    td.innerHTML = td.innerHTML + all.childNodes[3].innerHTML + "/"
                }
                if (all.childNodes[5].innerHTML.length == 1) {
                    td.innerHTML = td.innerHTML + "0" + all.childNodes[5].innerHTML
                } else {
                    td.innerHTML = td.innerHTML + all.childNodes[5].innerHTML
                }
                tr.appendChild(td);

                //Add other tds
                //fields = ['PMID', 'Authors', 'Title', 'JournalAbv', 'Year', 'Volume', 'Issue', 'Page', 'Month', 'Abstract', 'JournalFull'];
                for (var i = 0; i < adata.length; i++) {
                    var td = document.createElement("td");
                    td.id = fields[i];
                    td.align = align[i];
                    td.innerHTML = adata[i];
                    td.style = style = "white-space: nowrap; text-overflow:ellipsis; overflow: hidden; max-width:1px; font-size: " + document.getElementById("tableTextSize").value + "px";
                    td.style.backgroundColor = document.getElementById("tableBackgroundColor").value;
                    if (i == 0) {
                        td.onclick = function () { togglePaperIFrame("L" + adata[0]) }
                    };
                    if (document.getElementById("hooverBool").checked) { td.title = adata[i]; }
                    tr.appendChild(td);
                }
                //Add tr to table
                table = document.getElementById(tableName);
                table.appendChild(tr);
            })
        }
    };
    xhr.open(method, url);
    xhr.send();
}
function getLatest() {
    document.body.style.cursor = "progress"
    clearLatestTable()
    ul = document.getElementById("authorsList");
    for (var i = 0; i < ul.childElementCount; i++) {
        getSearchPapers(ul.childNodes[i].innerHTML + "[Author]")
    }
    ul = document.getElementById("termsList");
    for (var i = 0; i < ul.childElementCount; i++) {
        getSearchPapers(ul.childNodes[i].innerHTML)
    }
    ul = document.getElementById("liblistlist")
    for (var i = 0; i < ul.childElementCount; i++) {
        console.log([ul.childNodes[i].id, Number(ul.childNodes[i].childNodes[1].value)])
        getRecommendationList(ul.childNodes[i].id, Number(ul.childNodes[i].childNodes[1].value))
    }
    document.body.style.cursor = "auto"
}

function clearLatestTable() {
    $("#Latest tr:not(:first)").remove();
}
function addLatestPaperToLibrary(pmid, node) {
    node.childNodes[0].style.backgroundColor = "#B3B3B3"
    node.childNodes[0].id = "inlib"
    chrome.storage.sync.get(["libraries", "allArticles"], function (item) {
        index = item.libraries.indexOf(node.childNodes[0].innerHTML)
        console.log(index)
        if (item.allArticles[index].indexOf(pmid) == -1) { item.allArticles[index].push(pmid) }
        console.log(item.allArticles.indexOf(pmid))
        chrome.storage.sync.set({ "allArticles": item.allArticles })
    })
}

//Action Buttons
document.addEventListener('DOMContentLoaded', function () {
    //Settings
    document.getElementById("tableTextSize").addEventListener("input", changeTableTextSize);
    document.getElementById("tableBackgroundColor").addEventListener("input", changeTableBackgroundColor);
    document.getElementById("backgroundColor").addEventListener("input", changeBackgroundColor);
    document.getElementById("docFont").addEventListener("input", changeFont);
    document.getElementById("hooverBool").addEventListener("click", toggleHover);

    //Other
    document.getElementById("addTermButton").addEventListener("click", addTermLatest);
    document.getElementById("removeTermButton").addEventListener("click", removeTermLatest);
    document.getElementById("newTermName").addEventListener("keydown", addTerm);
    document.getElementById("addAuthorButton").addEventListener("click", addAuthorLatest);
    document.getElementById("removeAuthorButton").addEventListener("click", removeAuthorLatest);
    document.getElementById("newAuthorName").addEventListener("keydown", addAuthor);
    document.getElementById("filterLatest").addEventListener("keydown", function () { filterTable('Latest', 'filterLatest', 'filterLatestRegExBool', 'filterLatestByField') });
    document.getElementById("getLatestButton").addEventListener("click", getLatest);
    document.getElementById("clearLatestButton").addEventListener("click", clearLatestTable);

    //sortTable function
    document.getElementById("LatestPMID").addEventListener("click", function () { sortTable("Latest", "PMID") });
    document.getElementById("LatestBasedOn").addEventListener("click", function () { sortTable("Latest", "basedon") });
    document.getElementById("LatestPubDate").addEventListener("click", function () { sortTable("Latest", "pubdate") });
    document.getElementById("LatestAuthors").addEventListener("click", function () { sortTable("Latest", "Authors") });
    document.getElementById("LatestTitle").addEventListener("click", function () { sortTable("Latest", "Title") });
    document.getElementById("LatestJournalAbv").addEventListener("click", function () { sortTable("Latest", "JournalAbv") });
    document.getElementById("LatestYear").addEventListener("click", function () { sortTable("Latest", "Year") });
    document.getElementById("LatestVolume").addEventListener("click", function () { sortTable("Latest", "Volume") });
    document.getElementById("LatestIssue").addEventListener("click", function () { sortTable("Latest", "Issue") });
    document.getElementById("LatestPage").addEventListener("click", function () { sortTable("Latest", "Page") });
    document.getElementById("LatestMonth").addEventListener("click", function () { sortTable("Latest", "Month") });
    document.getElementById("LatestAbstract").addEventListener("click", function () { sortTable("Latest", "Abstract") });
    document.getElementById("LatestJournalFull").addEventListener("click", function () { sortTable("Latest", "JournalFull") });

});

//onload
reloadAuthorLatest()
reloadTermLatest()
reloadLibsLatest()

var d = new Date();
d.setDate(d.getDate() - 14);
year = d.getFullYear()
month = d.getMonth() + 1
if (month < 10) { month = "0" + month }
day = d.getDate()
if (day < 10) { day = "0" + day }
document.getElementById("sinceDate").value = year + "-" + month + "-" + day;

//addArticleToTable("Latest", "27897000")
//addArticleToTable("Latest", "29377984")
//addArticleToTable("Latest", "29241397")

chrome.storage.sync.get(["libraries", "allArticles", "librariesLatest"], function (item) {
    console.log(item.libraries)
    console.log(item.allArticles)
    console.log(item.librariesLatest)
})
//chrome.storage.sync.remove("librariesLatest")