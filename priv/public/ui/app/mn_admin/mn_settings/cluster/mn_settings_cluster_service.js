(function () {
  "use strict";

  angular.module('mnSettingsClusterService', [
    'mnPools'
  ]).factory('mnSettingsClusterService', mnSettingsClusterServiceFactory);

  function mnSettingsClusterServiceFactory($http, $q, IEC, mnPools) {
    var mnSettingsClusterService = {
      postPoolsDefault: postPoolsDefault,
      getIndexSettings: getIndexSettings,
      postIndexSettings: postIndexSettings
    };

    return mnSettingsClusterService;

    function maybeSetQuota(data, memory, service, key) {
      if (!memory.services || memory.services.model[service]) {
        if (memory[key] === null) {
          data[key] = "";
        } else {
          data[key] = memory[key];
        }
      }
    }

    function postPoolsDefault(memoryQuotaConfig, justValidate, clusterName) {
      var data = {
        clusterName: clusterName
      };

      if (memoryQuotaConfig) {
        maybeSetQuota(data, memoryQuotaConfig, "kv", "memoryQuota");
        maybeSetQuota(data, memoryQuotaConfig, "index", "indexMemoryQuota");
        maybeSetQuota(data, memoryQuotaConfig, "fts", "ftsMemoryQuota");
        if (mnPools.export.isEnterprise) {
          maybeSetQuota(data, memoryQuotaConfig, "cbas", "cbasMemoryQuota");
          maybeSetQuota(data, memoryQuotaConfig, "eventing", "eventingMemoryQuota");
        }
      }

      var config = {
        method: 'POST',
        url: '/pools/default',
        data: data
      };
      if (justValidate) {
        config.params = {
          just_validate: 1
        };
      }
      return $http(config);
    }
    function getIndexSettings() {
      return $http.get("/settings/indexes").then(function (resp) {
        return resp.data;
      });
    }
    function postIndexSettings(data, justValidate) {
      var configData = {};
      (["indexerThreads", "logLevel", "maxRollbackPoints", "storageMode"])
        .forEach(function (name) {
          if (data[name] !== undefined) {
            configData[name] = data[name];
          }
        });
      var config = {
        method: 'POST',
        url: '/settings/indexes',
        data: configData
      };
      if (justValidate) {
        config.params = {
          just_validate: 1
        };
      }
      return $http(config);
    }
  }
})();
