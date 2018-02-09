//Greys
//e7e7e7
//d1d1d1
//B3B3B3

//Add to Library
function addLibrary() {
    //New Library Name
    var d = document.getElementById("newLibraryName").value;
    if (d == "") { return;}
    //Append
    ul = document.getElementById("libraryList");
    for (var j = 0; j < ul.childElementCount; j++) {
        if (d === ul.childNodes[j].innerHTML) {
            document.getElementById("newLibraryName").value = "";
            return;
        }
    }
    //Save
    chrome.storage.sync.get(["libraries", "librariesLatest", "allArticles","libraryTags","libraryRemoved"], function (item) {
        //Add to list
        if (item.libraries == null) {
            item.libraries = [d];
            item.allArticles = [[]];
            item.libraryTags = [[]];
            item.librariesLatest = [999 + ""];
            item.libraryRemoved = [[]]
        } else {
            item.libraries.push(d);
            item.allArticles.push([]);
            item.libraryTags.push([]);
            item.librariesLatest.push(999 + "");
            item.libraryRemoved.push([])
        };
        //Save lists
        chrome.storage.sync.set({ "libraries": item.libraries })
        chrome.storage.sync.set({ "allArticles": item.allArticles })
        chrome.storage.sync.set({ "libraryTags": item.libraryTags })
        chrome.storage.sync.set({ "librariesLatest": item.librariesLatest })
        chrome.storage.sync.set({ "libraryRemoved": item.libraryRemoved })
        //load list of libraries
        loadListOfLibraries()
    })
    //Reset
    document.getElementById("newLibraryName").value = "";
}

function addEnter() {
    var elem = document.getElementById("newLibraryName");
    elem.onkeypress = function (e) {
        if (e.keyCode == 13) {
            addLibrary();
        }
    }
}

function loadListOfLibraries() {
    chrome.storage.sync.get("libraries", function (item) {
        //REmove previous
        var ul = document.getElementById("libraryList");
        var select = document.getElementById("removeOptions");
        while (ul.firstChild) {
            ul.removeChild(ul.firstChild);
            select.removeChild(select.firstChild);
        }
        //Load them
        for (var i = 0; i < item.libraries.length; i++) {
            //Add to list
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.id = item.libraries[i];
            a.innerHTML = item.libraries[i];
            a.onclick = function () { openURL(this) }
            a.onmouseover = function () { changeCellBackgroundColor(this); };
            a.onmouseout = function () { restoreCellBackgroundColor(this) };
            li.appendChild(a)
            
            //Add as remove option
            var option = document.createElement("option")
            option.innerHTML = item.libraries[i];
            option.id = "OPT" + item.libraries[i];

            //Order
            if (i == 0) {
                ul.appendChild(li);
                select.appendChild(option);
            } else {
                for (var j = 0; j < ul.childElementCount; j++) {if (item.libraries[i].toLowerCase() < ul.childNodes[j].childNodes[0].innerHTML.toLowerCase()) {break;}}
                ul.insertBefore(li,ul.childNodes[j]);
                select.insertBefore(option,select.childNodes[j])
            }
        }
    })
}

function removeLibrary() {
    //Get the one to remove
    var curlib = document.getElementById("removeOptions").value;
    //Remove from saved list
    chrome.storage.sync.get(["libraries", "librariesLatest", "allArticles","libraryTags"], function (item) {
        var index = item.libraries.indexOf(curlib);
        item.libraries.splice(index, 1);
        chrome.storage.sync.set({ "libraries": item.libraries })
        //Remove articles from that library from saved list
        item.allArticles.splice(index, 1);
        chrome.storage.sync.set({ "allArticles": item.allArticles })
        item.libraryTags.splice(index, 1);
        chrome.storage.sync.set({ "libraryTags": item.libraryTags })
        item.librariesLatest.splice(index,1);
        chrome.storage.sync.set({ "librariesLatest": item.librariesLatest })
        item.libraryRemoved.splice(index, 1);
        chrome.storage.sync.set({ "libraryRemoved": item.libraryRemoved })
        //Reload
        loadListOfLibraries()
    })
}

function editName() {
    //New Library Name
    var curlib = document.getElementById("newLibraryName").value;
    var oldlib = document.getElementById("removeOptions").value;
    //Change name in list
    chrome.storage.sync.get(["libraries", "librariesLatest"], function (item) {
        //Update data
        var index = item.libraries.indexOf(oldlib);
        item.libraries[index] = curlib;
        chrome.storage.sync.set({ "libraries": item.libraries })
        //Reload
        loadListOfLibraries()
    })
    //Remove nodes
    document.getElementById("newLibraryName").value = "";
}

//Download
function downloadAllLibrary() {
    //Create list of library
    chrome.storage.sync.get(["libraries","allArticles"], function (item) {
        for (var i = 0; i < item.libraries.length; i++) {
            //Save library name
            if (i == 0) {
                var libr = item.libraries[i];
            } else {
                libr = libr + "\n" + item.libraries[i];
            }
            //Save papers in it
            for (var j = 0; j < item.allArticles[i].length; j++) {
                libr = libr + "\n" + item.allArticles[i][j];
            }
        }

        //Create element and download
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(libr));
        element.setAttribute('download', 'LitLibraries.txt');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    })
}
function downloadCitations() {
    chrome.storage.sync.get(["libraries", "allArticles"], function (item) {
        format = document.getElementById("citationFormat").value
        pmids = ""
        console.log("start")
        for (var i = 0; i < item.libraries.length; i++) {
            for (var j = 0; j < item.allArticles[i].length; j++) {
                if (pmids.indexOf(item.allArticles[i][j]) == -1) {
                    pmids = pmids + "," + item.allArticles[i][j];
                }
            }
        }
        console.log("end")
        pmids = pmids.substr(1);
        console.log(pmids)

        if (format == "NBIB" || format == "RIS") {
            newURL = "https://www.ncbi.nlm.nih.gov/pmc/utils/ctxp?ids=" + pmids + "&report=" + format.toLowerCase();
            chrome.tabs.create({ url: newURL });
            return;
        } else if (format == "JSON") {
            newURL = "https://www.ncbi.nlm.nih.gov/pmc/utils/ctxp?ids=" + pmids + "&report=citeproc";
            //Open connection
            var xhr = new XMLHttpRequest(),
                method = "GET";
            //Execute
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    //read the document
                    var doc = xhr.responseText;
                    var element = document.createElement('a');
                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(doc));
                    element.setAttribute('download', 'LitLibrary.json');
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                }
            };
            xhr.open(method, newURL);
            xhr.send();
            return;
        }
    })
}

//Upload
function handleAllFileSelect(evt) {
    var files = evt.target.files;
    var re = new RegExp("^([0-9]*)$");
    // Only process text files.
    f = files[0]
    if (!f.type.match('text.*')) {
        return;
    }
    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function (theFile) {
        return function (e) {
            chrome.storage.sync.get(["libraries", "allArticles"], function (item) {
                //Get ids and add to library table
                console.log(e.target.result)
                pmids = e.target.result.split(/\r?\n/);
                console.log(pmids)
                for (var j = 0; j < pmids.length; j++) { console.log(re.test(pmids[j])) }
                for (var j = 0; j < pmids.length; j++) {
                    if (!re.test(pmids[j])) { //If it is a library
                        //Find library index
                        index = item.libraries.indexOf(pmids[j])
                        if (index == -1) {
                            index = item.libraries.length;
                            item.libraries.push(pmids[j])
                            item.allArticles.push([])
                        }
                    } else {
                        if (item.allArticles[index].indexOf(pmids[j]) == -1) {
                            item.allArticles[index].push(pmids[j])
                        }
                    }
                }
                chrome.storage.sync.set({ "allArticles": item.allArticles })
                chrome.storage.sync.set({ "libraries": item.libraries })
                loadListOfLibraries()
            })
        };
    })(f);
    // Read in the image file as a data URL.
    reader.readAsText(f);
}

function openURL(tab) {
    tab.style.background = "#b3b3b3"
    chrome.storage.sync.set({ "lto": tab.innerHTML })
    chrome.storage.sync.get("libraries", function (item) {
        chrome.storage.sync.set({ "ltoindex": item.libraries.indexOf(tab.innerHTML) })
    })
    var newURL = "LibraryPage.html";
    chrome.tabs.create({ url: newURL });
}

function openLatest(tab) {
    var newURL = "Latest.html";
    chrome.tabs.create({ url: newURL });
}

function toggleOptions() {
    div = document.getElementById("setMenu");
    if (div.style.display === "none") {
        div.style.display = "";
    } else {
        div.style.display = "none";
    }
}

function popupTableTextSize() {
    chrome.storage.sync.set({ "popupTableTextSize": document.getElementById("tableTextSize").value + "px" })
}
function popupTableBackgroundColor() {
    chrome.storage.sync.set({ "popupTableBackgroundColor": document.getElementById("tableBackgroundColor").value })
}
function popupBackgroundColor() {
    chrome.storage.sync.set({ "popupBackgroundColor": document.getElementById("backgroundColor").value })
}
function popupHoverColor() {
    chrome.storage.sync.set({ "popupHoverColor": document.getElementById("tableHoverColor").value })
}
function popupFont() {
    chrome.storage.sync.set({ "popupFont": document.getElementById("docFont").value })
}
function changeCellBackgroundColor(cell) {
    cell.style.backgroundColor = document.getElementById("tableHoverColor").value;
}
function restoreCellBackgroundColor(cell) {
    cell.style.backgroundColor = document.getElementById("backgroundColor").value;
}
chrome.storage.sync.get("popupTableTextSize", function (item) {
    var sz = item.popupTableTextSize;
    if (sz) { document.getElementById("tableTextSize").value = sz.replace("px", "") };
})
chrome.storage.sync.get("popupTableBackgroundColor", function (item) {
    var sz = item.popupTableBackgroundColor;
    if (sz) { document.getElementById("tableBackgroundColor").value = sz };
})
chrome.storage.sync.get("popupBackgroundColor", function (item) {
    var sz = item.popupBackgroundColor;
    if (sz) { document.getElementById("backgroundColor").value = sz };
})
chrome.storage.sync.get("popupHoverColor", function (item) {
    var sz = item.popupHoverColor;
    if (sz) { document.getElementById("tableHoverColor").value = sz };
})
chrome.storage.sync.get("popupFont", function (item) {
    var sz = item.popupFont;
    if (sz) { document.getElementById("docFont").value = sz };
})

function restoreSettings() {
    chrome.storage.sync.set({ "popupTableTextSize": "12px" })
    document.getElementById("tableTextSize").value = 12;
    chrome.storage.sync.set({ "popupTableBackgroundColor": "#ffffff" });
    document.getElementById("tableBackgroundColor").value = "#ffffff";
    chrome.storage.sync.set({ "popupBackgroundColor": "#e7e7e7" });
    document.getElementById("backgroundColor").value = "#e7e7e7";
    chrome.storage.sync.set({ "popupFont": "Arial" });
    document.getElementById("docFont").value = "Arial";
    chrome.storage.sync.set({ "popupHoverColor": "#d1d1d1" })
    document.getElementById("tableHoverColor").value = "#d1d1d1";
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("remove").addEventListener("click", removeLibrary);
    document.getElementById("edit").addEventListener("click", editName);
    document.getElementById("addLibraryButton").addEventListener("click", addLibrary);
    document.getElementById("setMenuTitle").addEventListener("click", toggleOptions);
    document.getElementById("newLibraryName").addEventListener("keydown", addEnter);

    document.getElementById("tableTextSize").addEventListener("input", popupTableTextSize);
    document.getElementById("tableBackgroundColor").addEventListener("input", popupTableBackgroundColor);
    document.getElementById("tableHoverColor").addEventListener("input", popupHoverColor);
    document.getElementById("backgroundColor").addEventListener("input", popupBackgroundColor);
    document.getElementById("docFont").addEventListener("input", popupFont);
    document.getElementById("restoreSettings").addEventListener("click", restoreSettings);

    document.getElementById("downloadButton").addEventListener("click", downloadAllLibrary);
    document.getElementById("downloadCitations").addEventListener("click", downloadCitations);
    document.getElementById("uploadButton").addEventListener("change", handleAllFileSelect, false);
    document.getElementById("latestButton").addEventListener("click", openLatest);
});

//on first load
chrome.storage.sync.get("popupTableTextSize", function (item) {
    if(item.popupTableTextSize == null) { restoreSettings(); }
})

//onload
loadListOfLibraries()