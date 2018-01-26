//Add to Library
function addLibrary() {
    //New Library Name
    var d = document.getElementById("newLibraryName").value;
    //Append
    ul = document.getElementById("libraryList");
    for (var j = 0; j < ul.childElementCount; j++) {
        if (d === ul.childNodes[j].innerHTML) {
            document.getElementById("newLibraryName").value = "";
            return;
        }
    }
    li = document.createElement("li");
    li.id = d;
    li.innerHTML = d;
    li.onclick = function () { openURL(this) }
    ul.appendChild(li)
    //Add as remove option
    var select = document.getElementById("removeOptions");
    var option = document.createElement("option")
    option.innerHTML = d;
    option.id = "OPT" + d;
    select.appendChild(option);
    //Save
    chrome.storage.sync.get("libraries", function (item) {
        if (item.libraries == null) {
            liblist = [d]
        } else {
            liblist = item.libraries;
            liblist.push(d);
        };
        chrome.storage.sync.set({ "libraries": liblist})
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
            ul.appendChild(li)
            //Add as remove option
            var option = document.createElement("option")
            option.innerHTML = item.libraries[i];
            option.id = "OPT" + item.libraries[i];
            select.appendChild(option);
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

function editName() {
    //New Library Name
    var curlib = document.getElementById("newLibraryName").value;
    var oldlib = document.getElementById("removeOptions").value;
    //Change name in list
    chrome.storage.sync.get("libraries", function (item) {
        var index = item.libraries.indexOf(oldlib);
        item.libraries[index] = curlib;
        chrome.storage.sync.set({ "libraries": item.libraries })
    })
    //Change name in articles
    chrome.storage.sync.get("allArticles", function (item) {
        var i = 0;
        for (var i = 0; i < item.allArticles.length; i++) {
            ss = item.allArticles[i].split("%in%");
            if (ss[0] === oldlib) {
                item.allArticles[i] = curlib + "%in%" + ss[1];
            }
        }
        chrome.storage.sync.set({ "allArticles": item.allArticles })
    })
    //Remove nodes
    tmp = document.getElementById(oldlib);
    tmp.id = curlib;
    tmp.innerHTML = curlib;
    tmp1 = document.getElementById("OPT" + oldlib);
    tmp1.id = "OPT" + curlib;
    tmp1.innerHTML = curlib;
}

function openURL(tab) {
    chrome.storage.sync.set({ "lto": tab.innerHTML })
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
});


loadListOfLibraries()