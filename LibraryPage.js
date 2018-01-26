//Library page functions
$("#Library").colResizable({ resizeMode: 'flex' });
$("#Search").colResizable({ resizeMode: 'flex' });
$("#Recommendations").colResizable({ resizeMode: 'flex' });

//Hide to begin with
document.getElementById("Search").style.display = "none";
document.getElementById("Recommendations").style.display = "none";

//Sort table
function sortTable(tname, cname) {
    //Define variables
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    switching = true;
    //Get table
    table = document.getElementById(tname);
    //Delete open frames
    nodes = table.childNodes;
    for (var i = 0; i < nodes.length; i++) {
        if (/FR/g.test(nodes[i].id)) { nodes[i].remove(); }
    }
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
            x = rows[index[i-1]].cells[cname].innerHTML.toLowerCase();
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
                rows[index[i-1]].parentNode.insertBefore(rows[index[i]], rows[index[i-1]]);
            } else {
                rows[index[i]].parentNode.insertBefore(rows[index[i]], rows[index[i - 1] + 1]);
                rows[index[i-1]].parentNode.insertBefore(rows[index[i-1]], rows[index[i] + 1]);
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

//function to add article to library
function addArticleToTable(tableName, pmid, psugcount) {
    //See if paper is not in already
    if (tableName === "Library") {
        nodes = document.getElementById("Library").childNodes;
        for (var i = 1; i < nodes.length; i++) {
            if (!/FR/g.test(nodes[i].id) && nodes[i].childNodes[1].innerHTML == pmid) { return }
        }
    }

    //Record if being added to Library
    if (tableName === "Library") {
        chrome.storage.sync.get("allArticles", function (item) {
            //Get new name
            var d = document.getElementById("libraryTitle").innerHTML + "%in%" + pmid;
            //If already in library dont add
            console.log(item.allArticles.indexOf(d))
            if (item.allArticles.indexOf(d) != -1) { return; }
            
            //Save
            if (item.allArticles == null) {
                item.allArticles = [d]
            } else {
                item.allArticles.push(d);
            };
            //Save
            chrome.storage.sync.set({ "allArticles": item.allArticles })
        })
    }

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
            tr.style.display = "table-row";
            
            tr.onmouseover = function () { changeRowBackgroundColor(this);};
            tr.onmouseout = function () {restoreRowBackgroundColor(this) };
  
            //Make delete button
            var td = document.createElement("td");
            td.id = "remove";
            var img = document.createElement("img");

            if (tableName === "Library") {
                td.onclick = function () { removeFromLibrary("L",adata[0]) };
                img.src = "blueCircle.png";
                tr.id = "L" + adata[0];
            } else if (tableName === "Search") {
                td.onclick = function () { addArticleToTable("Library",adata[0]); removeFromLibrary("S", adata[0]) };
                img.src = "redCircle.png";
                tr.id = "S" + adata[0];
            } else if (tableName === "Recommendations") {
                td.onclick = function () { addArticleToTable("Library", adata[0]); removeFromLibrary("R", adata[0]) };
                img.src = "yellowCircle.png";
                tr.id = "R" + adata[0];
            }
            
            td.style = "white-space: nowrap; text-overflow:ellipsis; overflow: hidden; max-width:1px;";
            td.style.backgroundColor = document.getElementById("tableBackgroundColor").value;
            td.align = "center";
            img.width = "10";
            img.height = "10";
            td.appendChild(img);
            tr.appendChild(td);

            //Add count to recommendations
            if (tableName === "Recommendations") {
                var td = document.createElement("td");
                td.id = "Count";
                td.align = "center";
                td.innerHTML = psugcount;
                td.fontSize = document.getElementById("tableTextSize").value + "px";
                td.style = style = "white-space: nowrap; text-overflow:ellipsis; overflow: hidden; max-width:1px; font-size: " +  document.getElementById("tableTextSize").value + "px";
                td.style.backgroundColor = document.getElementById("tableBackgroundColor").value;
                if (document.getElementById("hooverBool").checked) { td.title = psugcount; }
                tr.appendChild(td);
            }

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
                    if (tableName === "Library") {
                        td.onclick = function () { togglePaperIFrame("L" + adata[0]) }
                    } else if (tableName === "Search") {
                        td.onclick = function () { togglePaperIFrame("S" + adata[0]) }
                    } else if (tableName === "Recommendations") {
                        td.onclick = function () { togglePaperIFrame("R" + adata[0]) }
                    }
                };
                if (document.getElementById("hooverBool").checked) { td.title = adata[i];}
                tr.appendChild(td);
            }
            //Add tr to table
            table = document.getElementById(tableName);
            table.appendChild(tr);
        }
    };
    xhr.open(method, url, true);
    xhr.send();
}

//Remove article from table
function removeFromLibrary(marker,pmid) {
    var tr = document.getElementById(marker + pmid);
    if (tr.nextSibling != null && /FR/g.test(tr.nextSibling.id)) { tr.nextSibling.remove(); }
    tr.remove();
    if (marker === "L") {
        chrome.storage.sync.get("allArticles", function (item) {
            index = item.allArticles.indexOf(document.getElementById("libraryTitle").innerHTML + "%in%" + pmid);
            item.allArticles.splice(index, 1);
            chrome.storage.sync.set({ "allArticles": item.allArticles })
            console.log(item.allArticles)
        })
    }
}

//Get search results
function getSearchPapers() {
    //See if enter was pressed
    var elem = document.getElementById("SearchPubMed");
    elem.onkeypress = function (e) {
        if (e.keyCode == 13) {
            //Clear previous table
            clearSearchTable();

            //Get max Search Size
            maxSearchSize = document.getElementById("maxSearchSize").value;

            //Get search term
            srcterm = elem.value;

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

                    table = document.getElementById("Search");
                    //Display Search
                    if (pprs.length == 0) {
                        document.getElementById("Search").style.display = "none";
                        document.getElementById("singleLineSearchResult").style.display = "inline";
                        document.getElementById("singleLineSearchResult").innerHTML = "No search results found.";
                    } else if (pprs.length == 1) {
                        addArticleToTable("Library", pprs[0])
                        document.getElementById("Search").style.display = "none";
                        document.getElementById("singleLineSearchResult").style.display = "inline";
                        document.getElementById("singleLineSearchResult").innerHTML = "Paper " + pprs[0] + " added to the Library.";
                    } else {
                        //Display header
                        if (numberOfResults > maxSearchSize) {
                            document.getElementById("singleLineSearchResult").style.display = "inline";
                            document.getElementById("singleLineSearchResult").innerHTML = numberOfResults + " papers found. Not all displayed.";
                        } else {
                            document.getElementById("singleLineSearchResult").style.display = "none";
                        }
                        document.getElementById("Search").style.display = "table";
                        //Add papers to table
                        for (var i = 0; i < pprs.length; i++) {
                            addArticleToTable("Search",pprs[i])
                        }
                        $("#Search").colResizable({ resizeMode: 'flex' });
                    }
                }
            }
            xhr.open(method, url, true);
            xhr.send();
        }
     };
}

//Clear search table
function clearSearchTable() {
    document.getElementById("singleLineSearchResult").style.display = "none";
    document.getElementById("Search").style.display = "none";
    $("#Search tr:not(:first)").remove();
}

//Clear recommendations table
function clearRecommendationsTable() {
    document.getElementById("Recommendations").style.display = "none";
    $("#Recommendations tr:not(:first)").remove();
}

//filter library
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

//Insert iframe
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

function getRecommendationList(recterm) {
    clearRecommendationsTable()
    //get papers in library
    nodes = document.getElementById('Library').childNodes
    var libPapers = []
    for (var i = 2; i < nodes.length; i++) {
        libPapers.push(nodes[i].children[1].innerHTML)
    }
    //initialize suggestsion vector
    var sug = [];
    var sugcount = [];
    //parse
    for (var i = 0; i < libPapers.length; i++) {
        //Define connection
        var xhr = new XMLHttpRequest(),
            method = "GET"
        if (recterm === "Recommendations") {
            url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pubmed&linkname=pubmed_pubmed&id=" + libPapers[i];
        } else if (recterm === "Reviews") {
            url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pubmed&linkname=pubmed_pubmed_reviews&id=" + libPapers[i];
        }
            

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
                    var libindex = libPapers.indexOf(tmp[j])
                    if (index == -1 && libindex == -1) {
                        sug.push(tmp[j])
                        sugcount.push(1)
                    } else if (index != -1 && libindex == -1) {
                        sugcount[index]++
                    }
                }
            }
        }
        xhr.open(method, url, false);
        xhr.send();
    }
    //Sort them
    var list = [];
    for (var j = 0; j < sug.length; j++) {
        list.push({ 'pmid': sug[j], 'count': sugcount[j] });
    }
    list.sort(function (a, b) {
        return ((a.pmid > b.pmid) ? -1 : ((a.pmid == b.pmid) ? 0 : 1));
    });
    list.sort(function (a, b) {
        return ((a.count > b.count) ? -1 : ((a.count == b.count) ? 0 : 1));
    });
    
    //Add papers to library
    document.getElementById("Recommendations").style.display = "table";
    maxs = Number(document.getElementById("maxRecSize").value)
    for (var k = 0; k < maxs; k++) {
        addArticleToTable('Recommendations',list[k].pmid,list[k].count)
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
    for(var i = 0; i < ids.length;i++){
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
        for(var i=0; i < tds.length; i++) {
            if (!tds[i].id != "remove") {tds[i].title = tds[i].innerHTML;};
        }
    } else {
        for(var i=0; i < tds.length; i++) {tds[i].title = "";}
    }
}

function changeRowBackgroundColor(row) {
    for (var i=0; i<row.childElementCount; i++) {
        row.childNodes[i].style.backgroundColor = document.getElementById("tableHoverColor").value;
    }
}
function restoreRowBackgroundColor(row) {
    for (var i=0; i<row.childElementCount; i++) {
        row.childNodes[i].style.backgroundColor = document.getElementById("tableBackgroundColor").value;
    }
}

//Onload
chrome.storage.sync.get("lto", function (item) {
    var tmp = document.getElementById("libraryTitle").innerHTML = item.lto;
})

chrome.storage.sync.get("allArticles", function (item) {
    curlib = document.getElementById("libraryTitle").innerHTML;
    for (var i = 0; i < item.allArticles.length; i++) {
        ss = item.allArticles[i].split("%in%");
        if(ss[0] === curlib) { addArticleToTable("Library",ss[1]) }
    }
})

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
