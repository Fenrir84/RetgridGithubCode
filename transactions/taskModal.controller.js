//TASK MODAL CONTROLLER
(function () {
    "use strict";
    angular.module(APPNAME).controller("taskModalController", TaskModalController);
    TaskModalController.$inject = ["$scope", "$baseController", "$uibModalInstance", "items", "taskService"]
    function TaskModalController($scope, $baseController, $uibModalInstance, items, taskService) {
        var vm = this;
        $baseController.merge(vm, $baseController);
        vm.$scope = $scope;
        vm.$uibModalInstance = $uibModalInstance;
        vm.taskService = taskService;
        vm.notify = vm.taskService.getNotifier($scope);

        vm.taskData = null;
        vm.modalItems = items;
        vm.addTask = _addTask;
        vm.cancel = _cancel;
        vm.selected = {
            item: vm.modalItems[0]
        };

        //$('body').css('overflow','hidden');
        //$('body').css('position','fixed');

        //ADD TASK FUNCTION
        function _addTask() {
            console.log("Creating new task!");
            vm.taskData.milestoneId = vm.modalItems;
            vm.taskService.post(vm.taskData, _addTaskSuccess, _addTaskFailure);
        };

        function _addTaskSuccess(data) {
            console.log("You created a task!");
            vm.taskData.id = data.item;
            vm.$uibModalInstance.close(vm.taskData);
        }

        function _addTaskFailure() {
            console.log("Your ajax call failed!");
        }

        function _cancel() {
            vm.$uibModalInstance.dismiss("cancel");
        };
    }
})();