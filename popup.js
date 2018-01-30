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
    chrome.storage.sync.get("libraries", function (item) {
        if (item.libraries == null) {
            liblist = [d]
        } else {
            liblist = item.libraries;
            liblist.push(d);
        };
        chrome.storage.sync.set({ "libraries": liblist })
        while (ul.firstChild) {
            ul.removeChild(ul.firstChild);
        }
        var select = document.getElementById("removeOptions");
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
        loadListOfLibraries()
    })
    chrome.storage.sync.get("allArticles", function (item) {
        if (item.allArticles == null) {
            item.allArticles = [[]];
        } else {
            item.allArticles.push([]);
        }
        chrome.storage.sync.set({ "allArticles": item.allArticles })
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
        //Get variables
        var ul = document.getElementById("libraryList");
        var select = document.getElementById("removeOptions");
        //Load them
        for (var i = 0; i < item.libraries.length; i++) {
            //Add to list
            var li = document.createElement("li");
            li.id = item.libraries[i];
            li.innerHTML = item.libraries[i];
            li.onclick = function () { openURL(this) }
            
            //Add as remove option
            var option = document.createElement("option")
            option.innerHTML = item.libraries[i];
            option.id = "OPT" + item.libraries[i];
            //select.appendChild(option);

            //Order
            if (i == 0) {
                ul.appendChild(li);
                select.appendChild(option);
            } else {
                for (var j = 0; j < ul.childElementCount; j++) {if (item.libraries[i].toLowerCase() < ul.childNodes[j].innerHTML.toLowerCase()) {break;}}
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
    chrome.storage.sync.get("libraries", function (item) {
        var index = item.libraries.indexOf(curlib);
        item.libraries.splice(index, 1);
        chrome.storage.sync.set({ "libraries": item.libraries })
        //Remove articles from that library from saved list
        chrome.storage.sync.get("allArticles", function (item) {
            item.allArticles.splice(index, 1);
            chrome.storage.sync.set({ "allArticles": item.allArticles })
            console.log(item.allArticles)
        })
        ul = document.getElementById("libraryList");
        while (ul.firstChild) {
            ul.removeChild(ul.firstChild);
        }
        var select = document.getElementById("removeOptions");
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
        loadListOfLibraries()
    })
}

function editName() {
    //New Library Name
    var curlib = document.getElementById("newLibraryName").value;
    var oldlib = document.getElementById("removeOptions").value;
    //Change name in list
    chrome.storage.sync.get("libraries", function (item) {
        var index = item.libraries.indexOf(oldlib);
        item.libraries[index] = curlib;
        chrome.storage.sync.set({ "libraries": item.libraries })
        ul = document.getElementById("libraryList");
        while (ul.firstChild) {
            ul.removeChild(ul.firstChild);
        }
        var select = document.getElementById("removeOptions");
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
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

//Upload
function handleAllFileSelect(evt) {
    var files = evt.target.files;
    var re = new RegExp("^([0-9]{8})$");
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
                ul = document.getElementById("libraryList");
                while (ul.firstChild) {
                    ul.removeChild(ul.firstChild);
                }
                var select = document.getElementById("removeOptions");
                while (select.firstChild) {
                    select.removeChild(select.firstChild);
                }
                loadListOfLibraries()
            })
        };
    })(f);
    // Read in the image file as a data URL.
    reader.readAsText(f);
}

function openURL(tab) {
    chrome.storage.sync.set({ "lto": tab.innerHTML })
    chrome.storage.sync.get("libraries", function (item) {
        chrome.storage.sync.set({ "ltoindex": item.libraries.indexOf(tab.innerHTML) })
    })
    var newURL = "LibraryPage.html";
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
    chrome.storage.sync.set({ "popupBackgroundColor": "#dbdbdb" });
    document.getElementById("backgroundColor").value = "#dbdbdb";
    chrome.storage.sync.set({ "popupFont": "Arial" });
    document.getElementById("docFont").value = "Arial";
    chrome.storage.sync.set({ "popupHoverColor": "#dbdbdb" })
    document.getElementById("tableHoverColor").value = "#dbdbdb";
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
    document.getElementById("uploadButton").addEventListener("change", handleAllFileSelect, false);
});

//on first load
chrome.storage.sync.get("popupTableTextSize", function (item) {
    if(item.popupTableTextSize == null) { restoreSettings(); }
})
chrome.storage.sync.get(["libraries","allArticles"], function (item) {
    if (item.allArticles == null) { chrome.storage.sync.set({ "allArticles": [[]] }) }
    if (item.libraries == null) { chrome.storage.sync.set({ "libraries": [] }) }
})

//onload
loadListOfLibraries()