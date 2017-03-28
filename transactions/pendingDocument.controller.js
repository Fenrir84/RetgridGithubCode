//PENDING DOCUMENT CONTROLLER
(function () {
    "use strict";
    angular.module(APPNAME).controller('pendingDocumentController', PendingDocumentController);
    PendingDocumentController.$inject = ['$scope', '$baseController', 'transactionsService', "$uibModal", "participantService", "pendingDocumentService"];
    function PendingDocumentController($scope, $baseController, transactionsService, $uibModal, participantService, pendingDocumentService) {
        var vm = this;
        $baseController.merge(vm, $baseController);
        vm.$scope = $scope;
        vm.transactionsService = transactionsService;
        vm.participantService = participantService;
        vm.pendingDocumentService = pendingDocumentService;
        vm.$uibModal = $uibModal;
        vm.notify = vm.transactionsService.getNotifier($scope);
        vm.pDocImageSrc = null;
        vm.getImage = _getImage;
        vm.hidden = false;
        vm.deletePendingDocument = _deletePendingDocument;
        vm.items = sabio.page.currentTransaction;

        $scope.$on('RemoveById', function (event, id) {
            console.log("Pending Documents Controller is Listening!");
            for (var i = 0; i < vm.items.pendingDocuments.length; i++) {
                if (vm.items.pendingDocuments[i].id == id) {
                    vm.notify(function () {
                        vm.items.pendingDocuments.splice(i, 1);
                    });
                }
            }
        });

        //RENDER PENDING DOCUMENT IMAGE
        function _getImage(keyName) {
            var baseUrl = sabio.page.baseUrl;
            var bucket = sabio.page.bucket;
            var folder = sabio.page.folder;
            var url = "https://" + bucket + "." + baseUrl + "/" + folder + "/" + keyName;
            return url;
        };

        function _deletePendingDocument(id) {
            sweetAlert({
                title: "Confirm Delete",
                text: "Are you sure you want to delete this Document without assigning it to a task?",
                type: "warning",
                showCancelButton: true
            }, function (isConfirm) {
                if (isConfirm) {
                    vm.pendingDocumentService.deleteById(id, _deletePendingSuccess, _deletePendingFailure);
                    for (var i = 0; i < vm.items.pendingDocuments.length; i++) {
                        if (vm.items.pendingDocuments[i].id == id) {
                            vm.notify(function () {
                                vm.items.pendingDocuments.splice(i, 1);
                            });
                        }
                    }
                }
                else {
                    vm.$alertService.info("Operation cancelled");
                }
            });

        }

        function _deletePendingSuccess() {
            console.log("Pending Document Deleted!");
            vm.$uibModalInstance.close(vm.documentData, sabio.page.selectedPending.attr("data-id"));
        }

        function _deletePendingFailure() {
            console.log("Your ajax call failed!");
        }
    }
})();