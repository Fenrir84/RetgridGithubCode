//DOCUMENTS CONTROLLER
(function () {
    "use strict";
    angular.module(APPNAME).controller("documentsController", DocumentsController);
    DocumentsController.$inject = ["$scope", "$baseController", "transactionsService", "pendingDocumentService", "$uibModal"];
    function DocumentsController($scope, $baseController, transactionsService, pendingDocumentService, $uibModal) {
        var vm = this;
        $baseController.merge(vm, $baseController);
        vm.$scope = $scope;
        vm.transactionsService = transactionsService;
        vm.pendingDocumentService = pendingDocumentService;
        vm.$uibModal = $uibModal;
        vm.notify = vm.transactionsService.getNotifier($scope);
        vm.items = vm.$sabio.currentTransaction;
        vm.selectedDocument = null;
        vm.openModal = _openModal;
        vm.openNewDocModal = _openNewDocModal;
        vm.documents = [];
        vm.assembleDocs = _assembleDocs;

        _assembleDocs();

        function _assembleDocs() {
            if (vm.items.milestones != null) {
                for (var i = 0; i < vm.items.milestones.length; i++) {
                    if (vm.items.milestones[i].tasks != null) {
                        for (var x = 0; x < vm.items.milestones[i].tasks.length; x++) {
                            if (vm.items.milestones[i].tasks[x].documents != null) {
                                for (var y = 0; y < vm.items.milestones[i].tasks[x].documents.length; y++) {
                                    vm.documents.push(vm.items.milestones[i].tasks[x].documents[y]);
                                }
                            }
                        }
                    }
                }
            }
        }

        $scope.$on('displayDocument', function (event, document) {
            console.log("Doc Controller Listening!");
            _openModal(document);
        });

        //OPEN NEW DOCUMENT MODAL FUNCTION
        function _openNewDocModal(document) {
            vm.selectedDocument = document;
            var modalInstance = vm.$uibModal.open({
                animation: true,
                templateUrl: "newDocumentModalContent.html",
                controller: "newDocumentModalController as nDModalCtrl",
                size: "md",
                resolve: {
                    items: function () {
                        return vm.selectedDocument;
                    }
                }
            });
            modalInstance.result.then(function (newDocument, pendingDocId) {
                $scope.$emit('RemovePendingDocument', pendingDocId);
                $scope.$emit('AddDocumentToTask', newDocument);

                if (vm.items.documents == null) {
                    vm.items.documents = [];
                }
                vm.items.documents.push(newDocument);
                //$('body').css('overflow', 'visible');
                //$('body').css('position', 'static');

            }, function () {
                console.log('Modal dismissed at: ' + new Date());
                //$('body').css('overflow', 'visible');
                //$('body').css('position', 'static');
            });
        }

        //OPEN DOCUMENT MODAL FUNCTION
        function _openModal(document) {
            vm.selectedDocument = document;
            var modalInstance = vm.$uibModal.open({
                animation: true,
                templateUrl: "documentModalContent.html",
                controller: "documentModalController as dModalCtrl",
                size: "lg",
                resolve: {
                    items: function () {
                        return vm.selectedDocument;
                    }
                }
            });
            modalInstance.result.then(function (selectedItem) {
                vm.modalSelected = selectedItem;
                //$('body').css('overflow', 'visible');
                //$('body').css('position', 'static');
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
                $('body').css('overflow', 'visible');
                $('body').css('position', 'static');
            });
        }
    }
})();