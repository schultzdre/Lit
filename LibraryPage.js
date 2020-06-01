//Library page functions
        $("#Library").colResizable({ resizeMode: 'fit' });
         $("#Search").colResizable({ resizeMode: 'fit' });
$("#Recommendations").colResizable({ resizeMode: 'fit' });

window.onresize = function () {
    tr = document.getElementsByClassName("searchHeader")
    for (var k = 0; k < tr.length; k++) {
        table = tr[k].parentNode.parentNode;
        tw = Number(table.style.width.replace("px",""));
        ww = window.innerWidth;
        sf = ww/tw;
        for (var i = 0; i < tr[k].childElementCount; i++) {
            ow = Number(tr[k].children[i].style.width.replace("px",""));
            tr[k].children[i].style.width = Math.floor(ow*sf) + "px";
        }
    }
}

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
    //Set the sorting direction to ascending:
    dir = "asc";
    //Get rows
    rows = table.getElementsByTagName("TR");
    //Delete open frames
    var ifc = 0
    while (ifc < rows.length) { if (/FR/g.test(rows[ifc].id)) { rows[ifc].remove() } else { ifc++} }
    //Get visible rows
    var index = [];
    for (var j = 1; j < rows.length; j++) { if (rows[j].style.display === "table-row") { index.push(j) } };
    //Sort
    if (cname == "Tag") {
        while (switching) {
            //start by saying: no switching is done:
            switching = false;
            //Go through each
            for (var i = 1; i < (index.length); i++) {
                //start by saying there should be no switching:
                shouldSwitch = false;
                //Get two elements
                x = rows[index[i-1]].cells[cname].children[0].children[0].value.toLowerCase();
                y = rows[index[i]].cells[cname].children[0].children[0].value.toLowerCase();
                if (x == "" && y != "") {
                    //Test
                    if (dir == "asc") {
                        if (x < y) {
                            //if so, mark as a switch and break the loop:
                            shouldSwitch = true;
                            break;
                        }
                    } else if (dir == "desc") {
                        if (x > y) {
                            //if so, mark as a switch and break the loop:
                            shouldSwitch = true;
                            break;
                        }
                    }
                } else if (x != "" && y != "") {
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
    } else {
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
}

//Query function for atdlfter we define the pmids
function addArticleToTableQuery(tableName, pmid, psugcount) {
    chrome.storage.sync.get("APIkey", function (item) {
        //Open connection
        var xhr = new XMLHttpRequest(),
        method = "GET",
        fields = ['PMID', 'Authors', 'Title', 'JournalAbv', 'Year', 'Volume', 'Issue',
            'Page', 'Month', 'Abstract', 'JournalFull'];

        url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=" + pmid.join(",") + "&tool=litpmextension&email=aschultz@mdanderson.org&retmode=xml";
        if (item.APIkey != null) {url = url + "&api_key=" + item.APIkey}
        //Execute
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                //read the document
                var doc = xhr.responseXML;
                //reading function
                function readLocalPath(xmlpath) {
                    var fld = "";
                    tmp = doc.evaluate(xmlpath, doc, null, 0, null);
                    tmpfld = tmp.iterateNext();
                    while (tmpfld) {
                        fld = fld + " " + tmpfld.innerHTML;
                        tmpfld = tmp.iterateNext();
                    }
                    return fld.trim();
                }
                //Parse
                adata = [];
                for (var mn = 1; mn <= doc.evaluate('/PubmedArticleSet', doc, null, 0, null).iterateNext().childElementCount; mn++) {
                    //Get PubMed ID
                    adata.push([])
                    var curpmid = doc.evaluate('/PubmedArticleSet/PubmedArticle[' + mn + ']/MedlineCitation/PMID', doc, null, 0, null).iterateNext();
                    if (curpmid) {adata[mn-1].push(curpmid.innerHTML);} else {adata.pop(); continue;}
                    
                    //get all the authors
                    var ln = doc.evaluate('/PubmedArticleSet/PubmedArticle[' + mn + ']/MedlineCitation/Article/AuthorList/Author/LastName', doc, null, 0, null);
                    var fn = doc.evaluate('/PubmedArticleSet/PubmedArticle[' + mn + ']/MedlineCitation/Article/AuthorList/Author/Initials', doc, null, 0, null);
                    var lnn = ln.iterateNext()
                    var fnn = fn.iterateNext()
                    authors = [];
                    if (lnn != null) {
                        do {
                            if (fnn) {
                                var init = fnn.innerHTML;
                            } else {
                                var init = "";
                            }
                            var initp = init.split('').join('.') + '.';
                            if (lnn) {
                                var y = lnn.innerHTML + ', ' + initp;
                            } else {
                                var y = initp;
                            }
                            authors.push(y)
                            lnn = ln.iterateNext()
                            fnn = fn.iterateNext()
                        } while (lnn != null)
                    }
                    //If collective name
                    if (authors.length == 0) {
                        coln = doc.evaluate('/PubmedArticleSet/PubmedArticle[' + mn + ']/MedlineCitation/Article/AuthorList/Author[last()]/CollectiveName', doc, null, 0, null)
                        tmp = coln.iterateNext()
                        if (tmp != null) {
                            authors.push(tmp.innerHTML);
                        } else {
                            authors.push("")
                        }
                        
                    }
                    authors = authors.join('; ')
                    adata[mn-1].push(authors);

                    adata[mn-1].push(readLocalPath('/PubmedArticleSet/PubmedArticle[' + mn + ']/MedlineCitation/Article/ArticleTitle'));
                    adata[mn-1].push(readLocalPath('/PubmedArticleSet/PubmedArticle[' + mn + ']/MedlineCitation/Article/Journal/ISOAbbreviation'));

                    if (readLocalPath('/PubmedArticleSet/PubmedArticle[' + mn + ']/MedlineCitation/Article/Journal/JournalIssue/PubDate/Year').length > 0) {
                        adata[mn-1].push(readLocalPath('/PubmedArticleSet/PubmedArticle[' + mn + ']/MedlineCitation/Article/Journal/JournalIssue/PubDate/Year'));
                    } else if (readLocalPath('/PubmedArticleSet/PubmedArticle[' + mn + ']/MedlineCitation/Article/Journal/JournalIssue/PubDate/MedlineDate').length > 0) {
                        adata[mn-1].push(readLocalPath('/PubmedArticleSet/PubmedArticle[' + mn + ']/MedlineCitation/Article/Journal/JournalIssue/PubDate/MedlineDate').match("[0-9]{4}")[0]);
                    } else if (readLocalPath('/PubmedArticleSet/PubmedArticle[' + mn + ']/MedlineCitation/Article/ArticleDate/Year').length > 0) {
                        adata[mn-1].push(readLocalPath('/PubmedArticleSet/PubmedArticle[' + mn + ']/MedlineCitation/Article/ArticleDate/Year'));
                    } else {
                        adata[mn-1].push(" ");
                    }
                    
                    adata[mn-1].push(readLocalPath('/PubmedArticleSet/PubmedArticle[' + mn + ']/MedlineCitation/Article/Journal/JournalIssue/Volume'));
                    adata[mn-1].push(readLocalPath('/PubmedArticleSet/PubmedArticle[' + mn + ']/MedlineCitation/Article/Journal/JournalIssue/Issue'))
                    adata[mn-1].push(readLocalPath('/PubmedArticleSet/PubmedArticle[' + mn + ']/MedlineCitation/Article/Pagination/MedlinePgn'));
                    adata[mn-1].push(readLocalPath('/PubmedArticleSet/PubmedArticle[' + mn + ']/MedlineCitation/Article/Journal/JournalIssue/PubDate/Month'))
                    adata[mn-1].push(readLocalPath('/PubmedArticleSet/PubmedArticle[' + mn + ']/MedlineCitation/Article/Abstract/AbstractText'));
                    adata[mn-1].push(readLocalPath('/PubmedArticleSet/PubmedArticle[' + mn + ']/MedlineCitation/Article/Journal/Title'));

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

                    //if (node.nextSibling != null && /FR/g.test(node.nextSibling.id)) {node.nextSibling.remove()};

                    if (tableName === "Library") {
                        td.onclick = function () {removeFromLibrary(this.parentNode)};
                        img.src = "blueCircle.png";
                        tr.id = "L" + adata[mn-1][0];
                    } else if (tableName === "Search") {
                        td.onclick = function () {fromSearchToLibrary(this.parentNode)};
                        img.src = "redCircle.png";
                        tr.id = "S" + adata[mn-1][0];
                    } else if (tableName === "Recommendations") {
                        td.onclick = function () {fromRecommendationToLibrary(this.parentNode)};
                        img.src = "yellowCircle.png";
                        tr.id = "R" + adata[mn-1][0];
                    } else if (tableName === "Removed") {
                        td.onclick = function () {removeArticleFromRemoved(this.parentNode)};
                        img.src = "blackCircle.png";
                        tr.id = "B" + adata[mn-1][0];
                    }
                    
                    //td.style = "white-space: nowrap; text-overflow:ellipsis; overflow: hidden; max-width:1px;";
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
                        td.innerHTML = psugcount[mn-1];
                        td.fontSize = document.getElementById("tableTextSize").value + "px";
                        td.style = style = "white-space: nowrap; text-overflow:ellipsis; overflow: hidden; max-width:1px; font-size: " +  document.getElementById("tableTextSize").value + "px";
                        td.style.backgroundColor = document.getElementById("tableBackgroundColor").value;
                        if (document.getElementById("hooverBool").checked) { td.title = psugcount[mn-1]; }
                        tr.appendChild(td);
                    }

                    //Add tag if library
                    if (tableName === "Library") {
                        var td = document.createElement("td");
                        td.className = "CellWithComment";
                        td.id = "Tag";
                        span = document.createElement("span");
                        span.className = "CellComment";
                        input = document.createElement("input");
                        input.onkeypress = function() {saveTag(this)}
                        input.value = psugcount[pmid.indexOf(adata[mn-1][0])];
                        span.appendChild(input);
                        //td.style = "white-space: nowrap; text-overflow:ellipsis; overflow: hidden; max-width:1px;";
                        td.style.backgroundColor = document.getElementById("tableBackgroundColor").value;
                        td.align = "left";
                        td.appendChild(span);
                        tr.appendChild(td);
                    }

                    //Add other tds
                    //fields = ['PMID', 'Authors', 'Title', 'JournalAbv', 'Year', 'Volume', 'Issue', 'Page', 'Month', 'Abstract', 'JournalFull'];
                    for (var i = 0; i < adata[mn-1].length; i++) {
                        var td = document.createElement("td");
                        td.id = fields[i];
                        td.align = align[i];
                        td.innerHTML = adata[mn-1][i];
                        td.style = style = "white-space: nowrap; text-overflow:ellipsis; overflow: hidden; max-width:1px; font-size: " + document.getElementById("tableTextSize").value + "px";
                        td.style.backgroundColor = document.getElementById("tableBackgroundColor").value;
                        if (i == 0) { td.onclick = function () { togglePaperIFrame(this.parentNode) } };
                        if (document.getElementById("hooverBool").checked) { td.title = adata[mn-1][i];}
                        tr.appendChild(td);
                    }

                    //Move to recommendations
                    if (tableName === "Recommendations") {
                        var td = document.createElement("td");
                        td.id = "remove";
                        var img = document.createElement("img");
                        td.onclick = function () { fromRecommendationToRemoved(this.parentNode) };
                        img.src = "blackCircle.png";
                        td.style.backgroundColor = document.getElementById("tableBackgroundColor").value;
                        td.align = "center";
                        img.width = "10";
                        img.height = "10";
                        td.appendChild(img);
                        tr.appendChild(td);
                    }

                    //Add tr to table
                    table = document.getElementById(tableName);
                    table.appendChild(tr);
                }
                document.body.style.cursor = "auto"
            }
        };
        xhr.open(method, url, true);
        xhr.send();
    })
}

function removeFromLibrary(node) {
    if (node.nextSibling != null && /FR/g.test(node.nextSibling.id)) {node.nextSibling.remove()};
    chrome.storage.sync.get(["libraries","allArticles","libraryTags"], function(item) {
        //Library index
        libindex = Number(document.getElementById("libraryIndex").innerHTML);
        //Remove
        ai = item.allArticles[libindex].indexOf(node.children[2].innerHTML)
        item.allArticles[libindex].splice(ai,1)
        item.libraryTags[libindex].splice(ai,1)
        chrome.storage.sync.set({ "allArticles": item.allArticles })
        chrome.storage.sync.set({ "libraryTags": item.libraryTags })
        node.remove()
    })
}
function fromSearchToLibrary(node) {
    if (node.nextSibling != null && /FR/g.test(node.nextSibling.id)) {node.nextSibling.remove()};
    chrome.storage.sync.get(["libraries","allArticles","libraryTags"], function(item) {
        //Library index
        libindex = Number(document.getElementById("libraryIndex").innerHTML);
        //If already in do not add
        if(item.allArticles[libindex].indexOf(node.children[1].innerHTML) != -1) {
            node.remove()
            return;
        }
        //change onclick
        node.children[0].onclick = function () { removeFromLibrary(this.parentNode) };
        //Change circle color
        node.children[0].children[0].src = "blueCircle.png"
        //Change ID
        node.id.replace("S","L")
        //Add tag
        var td = document.createElement("td");
        td.className = "CellWithComment";
        td.id = "Tag";
        span = document.createElement("span");
        span.className = "CellComment";
        input = document.createElement("input");
        input.onkeypress = function() {saveTag(this)}
        input.value = "";
        span.appendChild(input);
        td.style.backgroundColor = document.getElementById("tableBackgroundColor").value;
        td.align = "left";
        td.appendChild(span);
        node.insertBefore(td,node.children[1])
        //Add to library
        item.allArticles[libindex].push(node.children[2].innerHTML)
        item.libraryTags[libindex].push("")
        chrome.storage.sync.set({ "allArticles": item.allArticles })
        chrome.storage.sync.set({ "libraryTags": item.libraryTags })
        //Add to Library and remove from search
        document.getElementById("Library").appendChild(node)
    })
}
function fromRecommendationToLibrary(node) {
    if (node.nextSibling != null && /FR/g.test(node.nextSibling.id)) {node.nextSibling.remove()};
    chrome.storage.sync.get(["libraries","allArticles","libraryTags"], function(item) {
        //Library index
        libindex = Number(document.getElementById("libraryIndex").innerHTML);
        //If already in do not add
        if(item.allArticles[libindex].indexOf(node.children[2].innerHTML) != -1) {
            node.remove()
            return;
        }
        //change onclick
        node.children[0].onclick = function () { removeFromLibrary(this.parentNode) };
        //Change circle color
        node.children[0].children[0].src = "blueCircle.png"
        //Change ID
        node.id.replace("R","L")
        //Remove count and last button
        node.children[1].remove()
        node.lastChild.remove()
        //Add tag
        var td = document.createElement("td");
        td.className = "CellWithComment";
        td.id = "Tag";
        span = document.createElement("span");
        span.className = "CellComment";
        input = document.createElement("input");
        input.onkeypress = function() {saveTag(this)}
        input.value = "";
        span.appendChild(input);
        td.style.backgroundColor = document.getElementById("tableBackgroundColor").value;
        td.align = "left";
        td.appendChild(span);
        node.insertBefore(td,node.children[1])
        //Add to library
        item.allArticles[libindex].push(node.children[2].innerHTML)
        item.libraryTags[libindex].push("")
        chrome.storage.sync.set({ "allArticles": item.allArticles })
        chrome.storage.sync.set({ "libraryTags": item.libraryTags })
        //Add to Library and remove from search
        document.getElementById("Library").appendChild(node)
    })
}
function removeArticleFromRemoved(node) {
    if (node.nextSibling != null && /FR/g.test(node.nextSibling.id)) {node.nextSibling.remove()};
    chrome.storage.sync.get("libraryRemoved",function(item) {
        index = Number(document.getElementById("libraryIndex").innerHTML);
        ai = item.libraryRemoved[index].indexOf(node.children[1].innerHTML);
        item.libraryRemoved[index].splice(ai, 1);
        chrome.storage.sync.set({ "libraryRemoved": item.libraryRemoved })
        if (document.getElementById("Recommendations").style.display != "none") {
            //fix left button
            node.children[0].onclick = function () { fromRecommendationToLibrary(this.parentNode)};
            node.children[0].children[0].src = "yellowCircle.png"
            //Add count
            var td = document.createElement("td");
            td.id = "Count";
            td.align = "center";
            td.innerHTML = "0";
            td.fontSize = document.getElementById("tableTextSize").value + "px";
            td.style = style = "white-space: nowrap; text-overflow:ellipsis; overflow: hidden; max-width:1px; font-size: " +  document.getElementById("tableTextSize").value + "px";
            td.style.backgroundColor = document.getElementById("tableBackgroundColor").value;
            if (document.getElementById("hooverBool").checked) { td.title = "0"; }
            node.insertBefore(td,node.children[1])
            //add right button
            var td = document.createElement("td");
            td.id = "remove";
            var img = document.createElement("img");
            td.onclick = function () { fromRecommendationToRemoved(this.parentNode) };
            img.src = "blackCircle.png";
            td.style.backgroundColor = document.getElementById("tableBackgroundColor").value;
            td.align = "center";
            img.width = "10";
            img.height = "10";
            td.appendChild(img);
            node.appendChild(td);
            //move
            document.getElementById("Recommendations").appendChild(node)
        } else {
            node.remove()
        }
    })
}
function fromRecommendationToRemoved(node) {
    if (node.nextSibling != null && /FR/g.test(node.nextSibling.id)) {node.nextSibling.remove()};
    chrome.storage.sync.get("libraryRemoved",function(item) {
        libindex = Number(document.getElementById("libraryIndex").innerHTML);
        item.libraryRemoved[libindex].push(node.children[2].innerHTML)
        chrome.storage.sync.set({ "libraryRemoved": item.libraryRemoved })
        if (document.getElementById("removedDiv").style.display == "") {
            //change onclick
            node.children[0].onclick = function () { removeArticleFromRemoved(this.parentNode) };
            //Change circle color
            node.children[0].children[0].src = "blackCircle.png"
            //Change ID
            node.id.replace("R","B")
            //Remove count and right button
            node.children[1].remove()
            node.lastChild.remove()
            //Add to Library and remove from search
            document.getElementById("Removed").appendChild(node)
        } else {
            node.remove()
        }
    })
}

function toggleRemoved() {
    div = document.getElementById("removedDiv");
    if (div.style.display == "") {
        div.style.display = "none";
        $("#Removed tr:not(:first)").remove();
    } else {
        div.style.display = "";
        chrome.storage.sync.get("libraryRemoved",function(item) {
            index = Number(document.getElementById("libraryIndex").innerHTML);
                addArticleToTableQuery("Removed",item.libraryRemoved[index])
        })
    }
}

function saveTag(node) {
    chrome.storage.sync.get(["allArticles","libraryTags"],function (item) {
        index = Number(document.getElementById("libraryIndex").innerHTML);
        ai = item.allArticles[index].indexOf(node.parentNode.parentNode.parentNode.children[2].innerHTML)
        item.libraryTags[index][ai] = node.value;
        chrome.storage.sync.set({ "libraryTags": item.libraryTags })
    })
}

//Get search results
function getSearchPapers() {
    //See if enter was pressed
    var elem = document.getElementById("SearchPubMed");
    elem.onkeypress = function (e) {
        if (e.keyCode == 13) {
            chrome.storage.sync.get("APIkey", function (item) {
                 //If something is already gonig on stop
                if (document.body.style.cursor == "progress") {console.log("Wait a minute!"); return;}
                //Set progress
                document.body.style.cursor = "progress"
                setTimeout(function(){document.body.style.cursor = "auto"}, 10000) //Scapegoat

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
                    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=" + srcterm + "&RetMax=" + maxSearchSize + "&tool=litpmextension&email=schultzdre@gmail.com";

                if (item.APIkey != null) { url = url + "&api_key=" + item.APIkey }
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
                        } else {
                            //Display header
                            if (numberOfResults > maxSearchSize) {
                                document.getElementById("singleLineSearchResult").style.display = "inline";
                                document.getElementById("singleLineSearchResult").innerHTML = numberOfResults + " papers found. Not all displayed.";
                                addArticleToTableQuery("Search",pprs.slice(0,maxSearchSize))
                            } else {
                                document.getElementById("singleLineSearchResult").style.display = "none";
                                addArticleToTableQuery("Search",pprs)
                            }
                            document.getElementById("Search").style.display = "table";
                            $("#Search").colResizable({ resizeMode: 'flex' });
                        }
                    }
                }
                xhr.open(method, url, true);
                xhr.send();
                setTimeout(function () {document.body.style.cursor = "auto"}, 15000) //Scapegoat
            })
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
    nodes = document.getElementById(library).children;
    //if empty
    if (filt.length == 0) {
        for (var i = 1; i < nodes.length; i++) {
            nodes[i].style.display = "table-row";
        }
    } else {
        if (byFieldBool) {
            for (var i = 1; i < nodes.length; i++) {
                nodes[i].style.display = "none";
                for (var j = 1; j < nodes[i].childElementCount; j++) {
                    if (nodes[i].children[j].id != "Tag") {
                        teststr = nodes[i].children[j].innerHTML;
                    } else {
                        teststr = nodes[i].children[j].children[0].children[0].value;
                    }
                    if (regfilt.test(teststr)) {
                        nodes[i].style.display = "table-row";
                        break;
                    }
                }
            }
        } else {
            for (var i = 1; i < nodes.length; i++) {
                nodes[i].style.display = "none";
                var teststr = "";
                for (var j = 1; j < nodes[i].childElementCount; j++) {
                    if (nodes[i].children[j].id != "Tag") {
                        teststr = teststr + " " + nodes[i].children[j].innerHTML;
                    } else {
                        teststr = teststr + " " + nodes[i].children[j].children[0].children[0].value;
                    }
                }
                if (regfilt.test(teststr)) {
                    nodes[i].style.display = "table-row";
                }
            }
        }

    }
}

//Insert iframe
function togglePaperIFrame(node) {window.open("https://pubmed.ncbi.nlm.nih.gov/" + node.id.replace(/[S,L,R]/,""));}


function getRecommendationList(recterm) {
    //If something is already gonig on stop
    if (document.body.style.cursor == "progress") {console.log("Wait a minute!"); return;}
    //Set timeout cursor
    document.body.style.cursor = "progress"
    setTimeout(function(){document.body.style.cursor = "auto"}, 10000) //Scapegoat
    clearRecommendationsTable()
    chrome.storage.sync.get("APIkey",function (item) {
        //If key is available
        if (item.APIkey != null) {
            urlkey = "&api_key=" + item.APIkey;
            var tdl = 120;
        } else {
            urlkey = "";
            var tdl = 400;
        }
        //get papers in library
        nodes = document.getElementById('Library').children
        var libPapers = []
        for (var i = 1; i < nodes.length; i++) {
            libPapers.push(nodes[i].children[2].innerHTML)
        }
        //initialize suggestsion vector
        var sug = [];
        var sugcount = [];
        //parse
        var tmp;
        //for (var i = 0; i < libPapers.length; i++) {
        function loadXHR(i) {
            //Define connection
            var xhr = new XMLHttpRequest(),
                method = "GET"
            if (recterm === "Recommendations") {
                url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pubmed&linkname=pubmed_pubmed&id=" + libPapers[i] + "&tool=litpmextension&email=aschultz@mdanderson.org" + urlkey;
            } else if (recterm === "Reviews") {
                url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pubmed&linkname=pubmed_pubmed_reviews&id=" + libPapers[i] + "&tool=litpmextension&email=aschultz@mdanderson.org" + urlkey;
            }
            var d = new Date();
            //Get suggestions
            function loadXHR(xhr) {var doc = xhr.responseXML; return doc;}
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
            xhr.open(method, url);
            xhr.send();
        }
        //Parse through them
        for (var i = 0; i < libPapers.length; i++) {
            setTimeout(loadXHR,tdl*i,i);
        }

        //Get results and add to table
        function addArticlesLocal() {
            chrome.storage.sync.get("libraryRemoved",function(item) {
                index = Number(document.getElementById("libraryIndex").innerHTML);
                for (var i = 0; i < sug.length; i++) {
                    if (item.libraryRemoved[index].indexOf(sug[i]) != -1) {
                        sug.splice(i,1);
                        sugcount.splice(i,1);
                    }
                }
                //Sort them
                var list = [];
                for (var j = 0; j < sug.length; j++) {
                    list.push({ 'pmid': sug[j], 'count': sugcount[j] });
                }
                list.sort(function (a, b) {
                    return ((Number(a.pmid) > Number(b.pmid)) ? -1 : ((a.pmid == b.pmid) ? 0 : 1));
                });
                list.sort(function (a, b) {
                    return ((a.count > b.count) ? -1 : ((a.count == b.count) ? 0 : 1));
                });
                //return them
                var maxs = Number(document.getElementById("maxRecSize").value),
                rpmids = [],
                rcounts = [];
                for (var k = 0; k < maxs && k < sug.length; k++) {
                    rpmids.push(list[k].pmid)
                    rcounts.push(list[k].count)
                }
                //Add papers to library
                document.getElementById("Recommendations").style.display = "table";
                addArticleToTableQuery('Recommendations',rpmids,rcounts)
            })
        }
        setTimeout(addArticlesLocal, (tdl*libPapers.length) + 1000)
    })
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

//Download
function downloadLibrary() {
    chrome.storage.sync.get(["libraries", "allArticles"], function (item) {
        //Create list of library
        index = item.libraries.indexOf(document.getElementById("libraryTitle").innerHTML);
        pmids = item.allArticles[index][0]
        for (var i = 1; i < item.allArticles[index].length; i++) {
            pmids = pmids + "\n" + item.allArticles[index][i];
        }

        //Create element and download
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(pmids));
        element.setAttribute('download', 'LitLibrary.txt');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    })
}
function downloadCitations() {
    chrome.storage.sync.get(["libraries", "allArticles"], function (item) {
        format = document.getElementById("citationFormat").value
        index = item.libraries.indexOf(document.getElementById("libraryTitle").innerHTML);
        pmids = item.allArticles[index][0]
        for (var i = 1; i < item.allArticles[index].length; i++) {
            pmids = pmids + "%2C" + item.allArticles[index][i];
        }
        
        if (format == "RIS" || format == "CSL" || format == "MEDLINE") {
            newURL = "https://api.ncbi.nlm.nih.gov/lit/ctxp/v1/pubmed/?format=" + format.toLowerCase() + "&id=" + pmids + "&download=y";
            chrome.tabs.create({ url: newURL });
            return;
        } else if (format == "JSON") {
            newURL = "https://api.ncbi.nlm.nih.gov/lit/ctxp/v1/pubmed/?format=citation&contenttype=json&id=" + pmids + "&download=y";
            chrome.tabs.create({ url: newURL });
            return;
        }
    })
}
//Upload
function handleFileSelect(evt) {
    var files = evt.target.files;
    // Loop through the FileList
    for (var i = 0, f; f = files[i]; i++) {
        // Only process text files.
        if (!f.type.match('text.*')) {
            continue;
        }
        var reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                //Get ids and add to library table
                pmids = e.target.result.split("\n");
                addArticleToTableQuery("Library", pmids,Array(pmids.length).fill(""))
                //Make sure they are added to data
                chrome.storage.sync.get("allArticles", function (item) {
                    //See if article is in the library already
                    index = Number(document.getElementById("libraryIndex").innerHTML);
                    for (var j = 0; j < pmids.length; j++) {
                        if (item.allArticles[index].indexOf(pmids[j]) == -1) {
                            //Save
                            if (item.allArticles[index] == null) {
                                item.allArticles[index] = [pmids[j]]
                            } else {
                                item.allArticles[index].push(pmids[j]);
                            };
                        }
                    }
                    //Save
                    chrome.storage.sync.set({ "allArticles": item.allArticles })
                })
            };
        })(f);
        // Read in the image file as a data URL.
        reader.readAsText(f);
    }
}
function uploadWrapFun() {document.getElementById("uploadButton").click()}

//Onload
chrome.storage.sync.get("lto", function (item) {
    document.getElementById("libraryTitle").innerHTML = item.lto;
})
chrome.storage.sync.get("ltoindex", function (item) {
    document.getElementById("libraryIndex").innerHTML = item.ltoindex;
})
chrome.storage.sync.get(["allArticles","libraryTags"], function (item) {
    libindex = Number(document.getElementById("libraryIndex").innerHTML);
    addArticleToTableQuery("Library", item.allArticles[libindex],item.libraryTags[libindex])
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

//addArticleToTableQuery("Library",["27351836", "26942765", "27897000", "25890056"]);

/*
chrome.storage.sync.get("doc",function (item) {
    console.log(item.doc)
})
*/

/*
chrome.storage.sync.get(["libraries", "allArticles", "librariesLatest","libraryTags","libraryRemoved","APIkey"], function (item) {
    console.log(item.libraries)
    console.log(item.allArticles)
    console.log(item.librariesLatest)
    console.log(item.libraryTags)
    console.log(item.libraryRemoved)
    console.log(item.APIkey)
})
*/