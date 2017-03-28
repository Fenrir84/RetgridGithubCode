//MILESTONE MODAL CONTROLLER
(function () {
    "use strict";
    angular.module(APPNAME).controller("milestoneModalController", MilestoneModalController);
    MilestoneModalController.$inject = ["$scope", "$baseController", "$uibModalInstance", "items", "milestoneService"]
    function MilestoneModalController($scope, $baseController, $uibModalInstance, items, milestoneService) {
        var vm = this;
        $baseController.merge(vm, $baseController);
        vm.$scope = $scope;
        vm.$uibModalInstance = $uibModalInstance;
        vm.milestoneService = milestoneService;
        vm.notify = vm.milestoneService.getNotifier($scope);

        vm.milestoneData = null;
        vm.modalItems = items;
        vm.addMilestone = _addMilestone;
        vm.cancel = _cancel;
        vm.selected = {
            item: vm.modalItems[0]
        };
        //$('body').css('overflow','hidden');
        //$('body').css('position','fixed');

        //ADD MILESTONE FUNCTION
        function _addMilestone() {
            console.log("Creating new milestone!");
            vm.milestoneData.transactionId = vm.modalItems;
            vm.milestoneService.post(vm.milestoneData, _addMilestoneSuccess, _addMilestoneFailure);
        };

        function _addMilestoneSuccess(data) {
            console.log("You created a milestone!");
            vm.milestoneData.id = data.item;
            if (vm.milestoneData.milestoneStatusId == 1) {
                vm.milestoneData.statusColor = 'label-light';
                vm.milestoneData.statusName = 'Not Completed';
            } else if (vm.milestoneData.milestoneStatusId == 2) {
                vm.milestoneData.statusColor = 'label-warning';
                vm.milestoneData.statusName = 'In Progress';
            } else {
                vm.milestoneData.statusColor = 'label-success';
                vm.milestoneData.statusName = 'Completed';
            }
            vm.$uibModalInstance.close(vm.milestoneData);
        };

        function _addMilestoneFailure() {
            console.log("Your ajax call failed!");
        };

        function _cancel() {
            vm.$uibModalInstance.dismiss("cancel");
        };
    }
})();