//NEW DOCUMENT MODAL CONTROLLER
(function () {
    "use strict";
    angular.module(APPNAME).controller("newDocumentModalController", NewDocumentModalController);
    NewDocumentModalController.$inject = ["$scope", "$baseController", "$uibModalInstance", "documentService", "pendingDocumentService"]
    function NewDocumentModalController($scope, $baseController, $uibModalInstance, documentService, pendingDocumentService) {
        var vm = this;
        $baseController.merge(vm, $baseController);
        vm.$scope = $scope;
        vm.$uibModalInstance = $uibModalInstance;
        vm.documentService = documentService;
        vm.pendingDocumentService = pendingDocumentService;
        vm.notify = vm.documentService.getNotifier($scope);

        vm.items = sabio.page.currentTransaction;
        vm.documentData = null;
        vm.addDocument = _addDocument;
        vm.cancel = _cancel;

        //$('body').css('overflow','hidden');
        //$('body').css('position','fixed');

        //ADD DOCUMENT FUNCTION
        function _addDocument() {
            console.log("Creating new document!");
            vm.documentData.taskId = sabio.page.selectedTaskId;
            vm.documentData.keyName = sabio.page.selectedKeyName;
            vm.documentData.transactionId = sabio.page.currentTransaction.id;
            vm.documentData.documentTypeId = vm.documentData.documentTypeId.id;
            vm.documentService.postDocument(vm.documentData, _addDocumentSuccess, _addDocumentFailure);
        };

        function _addDocumentSuccess(data) {
            console.log("You created a document!");
            vm.documentData.id = data.item;
            vm.pendingDocumentService.deleteById(sabio.page.selectedPending.attr("data-id"), _deletePendingSuccess, _deletePendingFailure);
        }

        function _deletePendingSuccess() {
            console.log("Pending Document Deleted!");
            vm.$uibModalInstance.close(vm.documentData, sabio.page.selectedPending.attr("data-id"));
        }

        function _deletePendingFailure() {
            console.log("Your ajax call failed!");
        }

        function _addDocumentFailure() {
            console.log("Your ajax call failed!");
            sabio.page.selectedPending.show();
        }

        function _cancel() {
            vm.$uibModalInstance.dismiss("cancel");
            sabio.page.selectedPending.show();
        };
    }
})();