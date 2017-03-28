//PARTICIPANTS CONTROLLER
(function () {
    "use strict";
    angular.module(APPNAME).controller('participantsController', ParticipantsController);
    ParticipantsController.$inject = ['$scope', '$baseController', 'transactionsService', "$uibModal", "participantService"];
    function ParticipantsController($scope, $baseController, transactionsService, $uibModal, participantService) {
        var vm = this;
        $baseController.merge(vm, $baseController);
        vm.$scope = $scope;
        vm.transactionsService = transactionsService;
        vm.participantService = participantService;
        vm.$uibModal = $uibModal;
        vm.notify = vm.transactionsService.getNotifier($scope);

        vm.pImageSource = null;
        vm.getImage = _getImage;
        vm.items = sabio.page.currentTransaction;
        vm.selectedRole = null;
        vm.openModal = _openModal;
        vm.openparticipantDetailsModal = _openparticipantDetailsModal;
        vm.deleteParticipant = _deleteParticipant;

        //DELETE PARTICIPANT
        function _deleteParticipant(id) {
            console.log("Deleting Participant!");

            sweetAlert({
                title: "Confirm Delete",
                text: "Are you sure you want to delete this Participant?",
                type: "warning",
                showCancelButton: true
            }, function (isConfirm) {
                if (isConfirm) {
                    vm.participantService.deleteParticipantById(id, _onDeleteSuccess, _onDeleteFailure);
                    for (var i = 0; i < vm.items.participants.length; i++) {
                        if (vm.items.participants[i].id == id) {
                            vm.items.participants.splice(i, 1);
                            vm.$scope.$apply();
                        }
                    }
                }
                else {
                    vm.$alertService.info("Operation cancelled");
                }
            });
        }

        function _onDeleteSuccess() {
            console.log("Successfully deleted!");
        };

        function _onDeleteFailure() {
            console.log("Ajax failure!");
        };

        //RENDER PARTICIPANT IMAGE
        function _getImage(keyName) {
            var baseUrl = sabio.page.baseUrl;
            var bucket = sabio.page.bucket;
            var folder = sabio.page.folder;
            var url = "https://" + bucket + "." + baseUrl + "/" + folder + "/" + keyName;
            return url;
        };

        //OPEN PARTICIPANT DETAILS MODAL FUNCTION
        function _openparticipantDetailsModal(participant) {
            var modalInstance = vm.$uibModal.open({
                animation: true,
                templateUrl: "participantDetailsModalContent.html",
                controller: "participantDetailsModalController as pDModalCtrl",
                size: "md",
                resolve: {
                    items: function () {
                        return participant;
                    }
                }
            });
            modalInstance.result.then(function (newParticipant) {

            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        }

        //OPEN PARTICIPANTS MODAL FUNCTION
        function _openModal() {
            var modalInstance = vm.$uibModal.open({
                animation: true,
                templateUrl: "participantsModalContent.html",
                controller: "participantsModalController as pModalCtrl",
                size: "md",
                resolve: {
                    items: function () {
                        return vm.items;
                    }
                }
            });
            modalInstance.result.then(function (newParticipant) {
                vm.modalSelected = newParticipant;
                if (vm.items.participants == null) {
                    vm.items.participants = [];
                }
                vm.items.participants.push(newParticipant);
                $('body').css('overflow', 'visible');
                $('body').css('position', 'static');
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
                $('body').css('overflow', 'visible');
                $('body').css('position', 'static');
            });
        }
    }
})();