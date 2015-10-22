(function () {
  "use strict";

  angular
    .module("mnDocuments")
    .controller("mnDocumentsCreateDialogController", mnDocumentsCreateDialogController);

  function mnDocumentsCreateDialogController($scope, mnDocumentsEditingService, mnPromiseHelper, $state, $modalInstance, doc) {
    var vm = this;
    vm.onSubmit = onSubmit;

    function onSubmit() {
      var newDocumentParams = {
        documentsBucket: $state.params.documentsBucket,
        documentId: vm.documentId
      };
      var promise = mnDocumentsEditingService.getDocument(newDocumentParams)
        .then(function () {
          vm.error = "Document with given ID already exists";
        }, function (resp) {
          if (resp.status >= 400 && resp.status < 500) {
            return mnPromiseHelper(vm, mnDocumentsEditingService.createDocument(newDocumentParams, doc), $modalInstance)
              .cancelOnScopeDestroy($scope)
              .catchErrors(function (data) {
                vm.error = data && data.reason;
              })
              .closeOnSuccess()
              .reloadState()
              .getPromise();
          } else {
            vm.error = resp.data && resp.data.reason;
          }
        });
      mnPromiseHelper($scope, promise, $modalInstance)
        .cancelOnScopeDestroy()
        .showSpinner();
    }
  }
})();
