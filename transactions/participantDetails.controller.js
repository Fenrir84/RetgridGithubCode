//PARTICIPANT DETAILS MODAL CONTROLLER
(function () {
    "use strict";
    angular.module(APPNAME).controller("participantDetailsModalController", ParticipantDetailsModalController);
    ParticipantDetailsModalController.$inject = ["$scope", "$baseController", "$uibModalInstance", "items", "personService", "participantService"]
    function ParticipantDetailsModalController($scope, $baseController, $uibModalInstance, items, personService, participantService) {
        var vm = this;
        $baseController.merge(vm, $baseController);
        vm.$scope = $scope;
        vm.$uibModalInstance = $uibModalInstance;
        vm.personService = personService;
        vm.participantService = participantService;
        vm.cancel = _cancel;
        vm.notify = vm.personService.getNotifier($scope);
        vm.displayImage = _displayImage;
        vm.items = sabio.page.currentTransaction;
        vm.selectedPerson = items;
        vm.person = null;

        //$('body').css('overflow','hidden');
        //$('body').css('position','fixed');

        _getPerson();
        _displayImage(vm.selectedPerson);

        function _getPerson() {
            vm.personService.getPersonById(vm.selectedPerson.personId, _onGetPersonSuccess, _onGetPersonFailure);
        }

        function _onGetPersonSuccess(data) {
            console.log("Success!");
            console.log(data);
            vm.person = data.item;
        }

        function _onGetPersonFailure(data) {
            console.log("Ajax failure!");
        }

        //RENDER PERSON IMAGE
        function _displayImage(person) {
            event.preventDefault();
            if (person.keyName)
                console.log("Trying to render the image! " + person);
            var baseUrl = sabio.page.baseUrl;
            var bucket = sabio.page.bucket;
            var folder = sabio.page.folder;
            var url = "https://" + bucket + "." + baseUrl + "/" + folder + "/" + person.keyName;
            vm.personImageSrc = url;
        };

        //CANCEL
        function _cancel() {
            console.log(vm.selectedRole);
            vm.$uibModalInstance.dismiss("cancel");
        };
    }
})();