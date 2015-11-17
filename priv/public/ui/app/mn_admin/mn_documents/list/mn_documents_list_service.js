(function () {
  "use strict";

  angular
    .module("mnDocumentsListService", ["mnHttp", "mnBucketsService"])
    .factory("mnDocumentsListService", mnDocumentsListFactory);

  function mnDocumentsListFactory(mnHttp, $q, mnBucketsService, docsLimit) {
    var mnDocumentsListService = {
      getDocumentsListState: getDocumentsListState,
      populateBucketsSelectBox: populateBucketsSelectBox
    };

    return mnDocumentsListService;

    function populateBucketsSelectBox(params) {
      return mnBucketsService.getBucketsByType().then(function (buckets) {
        var rv = {};
        rv.bucketsNames = buckets.byType.membase.names;
        rv.bucketsNames.selected = params.documentsBucket;
        return rv;
      });
    }

    function getListState(docs, params) {
      var rv = {};
      rv.pageNumber = params.pageNumber;
      rv.isNextDisabled = docs.rows.length <= params.pageLimit || params.pageLimit * (params.pageNumber + 1) === docsLimit;
      if (docs.rows.length > params.pageLimit) {
        docs.rows.pop();
      }
      rv.docs = docs;

      rv.pageLimits = [5, 10, 20, 50, 100];
      rv.pageLimits.selected = params.pageLimit;
      return rv;
    }

    function getDocumentsListState(params) {
      return getDocuments(params).then(function (resp) {
        return getListState(resp.data, params);
      }, function (resp) {
        switch (resp.status) {
          case 500: return getEmptyListState(params, resp);
        }
      });
    }

    function getEmptyListState(params, resp) {
      var rv = getListState({rows: [], errors: [resp && resp.data]}, params);
      rv.isEmptyState = true;
      return rv;
    }

    function getDocuments(params) {
      var param;
      try {
        param = JSON.parse(params.documentsFilter) || {};
      } catch (e) {
        param = {};
      }
      var page = params.pageNumber;
      var limit = params.pageLimit;
      var skip = page * limit;

      param.skip = String(skip);
      param.include_docs = true;
      param.limit = String(limit + 1);

      if (param.startkey) {
        param.startkey = JSON.stringify(param.startkey);
      }

      if (param.endkey) {
        param.endkey = JSON.stringify(param.endkey);
      }

      return mnHttp({
        method: "GET",
        url: "/pools/default/buckets/" + encodeURIComponent(params.documentsBucket) + "/docs",
        params: param
      });
    }
  }
})();