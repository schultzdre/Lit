document.addEventListener('DOMContentLoaded', function () {
    //Settings
    document.getElementById("tableTextSize").addEventListener("input", changeTableTextSize);
    document.getElementById("tableBackgroundColor").addEventListener("input", changeTableBackgroundColor);
    document.getElementById("backgroundColor").addEventListener("input", changeBackgroundColor);
    document.getElementById("docFont").addEventListener("input", changeFont);
    document.getElementById("hooverBool").addEventListener("click", toggleHover);
    document.getElementById("downloadButton").addEventListener("click", downloadLibrary);
    document.getElementById("uploadButton").addEventListener("change", handleFileSelect, false);

    //Other Buttons
    document.getElementById("clearSearchTableButton").addEventListener("click", clearSearchTable);
    document.getElementById("SearchPubMed").addEventListener("keydown", getSearchPapers);

    document.getElementById("getRArticles").addEventListener("click", function () { getRecommendationList('Recommendations') });
    document.getElementById("getRReviews").addEventListener("click", function () { getRecommendationList('Reviews') });
    document.getElementById("clearRTable").addEventListener("click", function () { clearRecommendationsTable() });

    //Filter
    document.getElementById("filterSearch").addEventListener("keydown", function () { filterTable('Search', 'filterSearch', 'filterSearchRegExBool', 'filterSearchByField') });
    document.getElementById("filterLibrary").addEventListener("keydown", function () { filterTable('Library', 'filterLibrary', 'filterLibraryRegExBool', 'filterLibraryhByField') });
    document.getElementById("filterRecommendations").addEventListener("keydown", function () { filterTable('Recommendations', 'filterRecommendations', 'filterRecommendationsRegExBool', 'filterRecommendationsByField') });

    //sortTable function
    document.getElementById("SearchPMID").addEventListener("click", function () { sortTable("Search", "PMID") });
    document.getElementById("SearchAuthors").addEventListener("click", function () { sortTable("Search", "Authors") });
    document.getElementById("SearchTitle").addEventListener("click", function () { sortTable("Search", "Title") });
    document.getElementById("SearchJournalAbv").addEventListener("click", function () { sortTable("Search", "JournalAbv") });
    document.getElementById("SearchYear").addEventListener("click", function () { sortTable("Search", "Year") });
    document.getElementById("SearchVolume").addEventListener("click", function () { sortTable("Search", "Volume") });
    document.getElementById("SearchIssue").addEventListener("click", function () { sortTable("Search", "Issue") });
    document.getElementById("SearchPage").addEventListener("click", function () { sortTable("Search", "Page") });
    document.getElementById("SearchMonth").addEventListener("click", function () { sortTable("Search", "Month") });
    document.getElementById("SearchAbstract").addEventListener("click", function () { sortTable("Search", "Abstract") });
    document.getElementById("SearchJournalFull").addEventListener("click", function () { sortTable("Search", "JournalFull") });
    document.getElementById("LibraryPMID").addEventListener("click", function () { sortTable("Library", "PMID") });
    document.getElementById("LibraryAuthors").addEventListener("click", function () { sortTable("Library", "Authors") });
    document.getElementById("LibraryTitle").addEventListener("click", function () { sortTable("Library", "Title") });
    document.getElementById("LibraryJournalAbv").addEventListener("click", function () { sortTable("Library", "JournalAbv") });
    document.getElementById("LibraryYear").addEventListener("click", function () { sortTable("Library", "Year") });
    document.getElementById("LibraryVolume").addEventListener("click", function () { sortTable("Library", "Volume") });
    document.getElementById("LibraryIssue").addEventListener("click", function () { sortTable("Library", "Issue") });
    document.getElementById("LibraryPage").addEventListener("click", function () { sortTable("Library", "Page") });
    document.getElementById("LibraryMonth").addEventListener("click", function () { sortTable("Library", "Month") });
    document.getElementById("LibraryAbstract").addEventListener("click", function () { sortTable("Library", "Abstract") });
    document.getElementById("LibraryJournalFull").addEventListener("click", function () { sortTable("Library", "JournalFull") });
    document.getElementById("RecommendationsCount").addEventListener("click", function () { sortTable("Recommendations", "Count") });
    document.getElementById("RecommendationsPMID").addEventListener("click", function () { sortTable("Recommendations", "PMID") });
    document.getElementById("RecommendationsAuthors").addEventListener("click", function () { sortTable("Recommendations", "Authors") });
    document.getElementById("RecommendationsTitle").addEventListener("click", function () { sortTable("Recommendations", "Title") });
    document.getElementById("RecommendationsJournalAbv").addEventListener("click", function () { sortTable("Recommendations", "JournalAbv") });
    document.getElementById("RecommendationsYear").addEventListener("click", function () { sortTable("Recommendations", "Year") });
    document.getElementById("RecommendationsVolume").addEventListener("click", function () { sortTable("Recommendations", "Volume") });
    document.getElementById("RecommendationsIssue").addEventListener("click", function () { sortTable("Recommendations", "Issue") });
    document.getElementById("RecommendationsPage").addEventListener("click", function () { sortTable("Recommendations", "Page") });
    document.getElementById("RecommendationsMonth").addEventListener("click", function () { sortTable("Recommendations", "Month") });
    document.getElementById("RecommendationsAbstract").addEventListener("click", function () { sortTable("Recommendations", "Abstract") });
    document.getElementById("RecommendationsJournalFull").addEventListener("click", function () { sortTable("Recommendations", "JournalFull") });


});