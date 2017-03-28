//PARTICIPANTS MODAL CONTROLLER
(function () {
    "use strict";
    angular.module(APPNAME).controller("participantsModalController", ParticipantsModalController);
    ParticipantsModalController.$inject = ["$scope", "$baseController", "$uibModalInstance", "items", "personService", "participantService"]
    function ParticipantsModalController($scope, $baseController, $uibModalInstance, items, personService, participantService) {
        var vm = this;
        $baseController.merge(vm, $baseController);
        vm.$scope = $scope;
        vm.$uibModalInstance = $uibModalInstance;
        vm.personService = personService;
        vm.participantService = participantService;
        vm.cancel = _cancel;
        vm.notify = vm.personService.getNotifier($scope);
        vm.displayPeople = _displayPeople;
        vm.displayPersonDetails = _displayPersonDetails;
        vm.displayImage = _displayImage;
        vm.addParticipant = _addParticipant;
        vm.showPeople = false;
        vm.showPersonDetails = false;


        vm.participantData = {};
        vm.people = [];
        vm.items = sabio.page.currentTransaction;
        vm.selectedRole = null;
        vm.selectedPerson = null;

        //$('body').css('overflow','hidden');
        //$('body').css('position','fixed');

        //ADD PARTICIPANT FUNCTION
        function _addParticipant() {
            console.log("Adding participant!");
            vm.participantData.transactionId = sabio.page.currentTransaction.id;
            vm.participantData.personId = vm.selectedPerson.id;
            vm.participantData.roleId = vm.selectedRole.id;
            vm.participantService.createParticipant(vm.participantData, _onParticipantSuccess, _onParticipantFailure);
        };

        function _onParticipantSuccess(data) {
            console.log("Participant Added! Id: " + data);
            vm.participantData.id = data.item;
            vm.participantData.keyName = vm.selectedPerson.keyName;
            vm.participantData.personFirstName = vm.selectedPerson.firstName;
            vm.participantData.personLastName = vm.selectedPerson.lastName;
            vm.participantData.personRoleName = vm.selectedPerson.roles;
            vm.$uibModalInstance.close(vm.participantData);
        };

        function _onParticipantFailure() {
            console.log("Ajax failure!");
        };

        //DISPLAY PEOPLE FUNCTION
        function _displayPeople() {
            console.log(vm.selectedRole);
            vm.personService.getPeopleByRoleId(vm.selectedRole.id, _getSuccess, _getFailure);
        };

        function _getSuccess(data) {
            vm.notify(function () {
                console.log(data);
                vm.people = data.item;
                vm.showPeople = true;
            });
        };

        function _getFailure(data) {
            console.log("Ajax failed!");
            console.log(data);
        };

        //DISPLAY PERSON DETAILS
        function _displayPersonDetails(person) {
            vm.selectedPerson = person;
            vm.displayImage(vm.selectedPerson);
            vm.showPersonDetails = true;
        };

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