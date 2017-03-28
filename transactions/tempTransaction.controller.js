//TEMPLATE TRANSACTION CONTROLLER

(function () {
    "use strict";
    angular.module(APPNAME).controller('tempTransactionController', TempTransactionController)
    TempTransactionController.$inject = ['$baseController', '$scope', '$tempTransService', 'transactionsService', '$uibModal', '$location'];
    function TempTransactionController($baseController, $scope, $tempTransService, transactionService, $uibModal, $location) {
        var vm = this;
        vm.$scope = $scope;
        vm.$tempTransService = $tempTransService;
        vm.transactionService = transactionService;
        vm.$location = $location;
        vm.$uibModal = $uibModal;
        $baseController.merge(vm, $baseController);
        vm.notify = vm.$tempTransService.getNotifier($scope);

        vm.items = [];
        vm.milestones = []
        vm.updatedId = null;
        vm.data = [];
        vm.selectedTemp = [];
        vm.showCreate = true;
        vm.showTemplates = false;
        vm.action;
        vm.status1 = true;

        vm.addMilestone = _addMilestone;
        vm.addTask = _addTask;
        vm.removeMilestone = _removeMilestone;
        vm.editTemp = _editTemp;
        vm.removeTask = _removeTask;
        vm.createTemp = _createTemp;
        vm.postTemp = _postTemp;
        vm.closeTemp = _closeTemp;
        vm.getData = _getData;
        vm.getAll = _getAll;
        vm.selectTemp = _selectTemp;
        vm.deleteTemp = _deleteTemp;
        vm.deleteSuccess = _deleteSuccess;
        vm.getAllSuccess = _getAllSuccess;
        vm.postSuccess = _postSuccess;
        vm.selectedTempSuccess = _selectedTempSuccess;
        vm.updateSuccess = _updateSuccess;
        vm.error = _error;



        render();
        function render() {
            if (sabio.page.currentTransaction.milestones != null) {
                vm.showTemplates = true;
            } else {


                _getAll();
            }

        };



        function _addMilestone() {
            vm.milestones.push({
                name: null
            });
        };

        function _addTask(index) {
            if (vm.milestones[index].tasks == null) {
                vm.milestones[index].tasks = [];
            }
            vm.milestones[index].tasks.push({
                name: null
            });
        };

        function _removeMilestone(index, mIndex, milestone) {
            if (vm.milestones[index].id == null) {
                vm.milestones.splice(index, 1);
                console.log(index);
            } else {
                vm.milestones[mIndex].showMilestone = true;
                vm.milestones[mIndex].name = "Delete";
            }
        };

        function _closeTemp() {
            vm.showCreate = true;
            vm.milestones = [];
            vm.transName = null;
        };

        function _removeTask(mIndex, tIndex, task) {
            if (vm.milestones[mIndex].tasks[tIndex].id == null) {
                vm.milestones[mIndex].tasks.splice(tIndex, 1);

                if (vm.milestones[mIndex].tasks.length == 0) {
                    vm.milestones[mIndex].tasks = [];
                }

            } else {
                vm.milestones[mIndex].tasks[tIndex].showTask = true;
                vm.milestones[mIndex].tasks[tIndex].name = "Delete";
            }
        };

        function _createTemp() {
            vm.showCreate = false;
            vm.action = "CREATE";
        };

        function _getData() {
            var data = [];
            data = {
                "AuthorId": "19"
                , "Name": vm.transName
                , "Milestones": vm.milestones
                , "Id": vm.updateId

            };
            return data;
        };

        function _editTemp(transId, index) {
            vm.showCreate = false;
            vm.action = "EDIT";
            vm.updateId = vm.items[index].id;
            vm.transName = vm.items[index].name;
            vm.milestones = vm.items[index].milestones;
            console.log(transId);
            console.log(index);
            console.log(vm.milestones);
        };

        function _selectTemp(transIndex) {
            sweetAlert(
                {
                    title: "Confirm Template",
                    text: "Are you sure you want to use this template?",
                    type: "warning",
                    showCancelButton: true
                }, function (isConfirm) {
                    if (isConfirm) {
                        vm.selectedTemp = vm.items[transIndex];
                        var data = {
                            "Id": sabio.page.currentTransaction.id
                            , "AuthorId": "19"
                            , "Name": vm.selectedTemp.name
                            , "Milestones": vm.selectedTemp.milestones

                        };
                        console.log(data);
                        vm.$tempTransService.insertTemp(data, vm.selectedTempSuccess, vm.error);
                    }
                    else {
                        vm.$alertService.info("Template cancelled");
                    }
                }
            );



        }

        function _selectedTempSuccess(data) {
            vm.notify(function () {
                vm.showTemplates = true;
                console.log(data);
                $scope.$emit('AddTempToTask', vm.selectedTemp.milestones);
            });

        };


        function _postTemp(form, mIndex, tIndex) {
            event.preventDefault();
            if (form.$valid) {
                if (vm.milestones.length >= 1) {
                    if (vm.milestones[0].id == null) {
                        vm.data = _getData();
                        console.log(vm.data);
                        vm.$tempTransService.insert(vm.data, vm.postSuccess, vm.error);
                    } else {
                        vm.data = _getData();
                        console.log(vm.data);
                        vm.$tempTransService.update(vm.data, vm.updateId, vm.updateSuccess, vm.error);
                    }

                } else {
                    vm.$alertService.warning("Data is not valid. Please add at least one milestone!");
                }
            } else {
                vm.$alertService.warning("Data is not valid. Please review the template!");
            }

            console.log(vm.data);
            vm.showCreate = true;
        };

        function _getAll() {
            vm.$tempTransService.getAll(vm.getAllSuccess, vm.error);
        };

        function _getAllSuccess(data) {
            vm.notify(function () {
                vm.items = data.items;
                console.log(vm.items);
            });
        };

        function _postSuccess() {
            vm.$alertService['success']('Template Saved Successfully');
            vm.transName = null;
            vm.milestones = [];
            _getAll();
        };


        function _updateSuccess() {
            vm.$alertService['success']('Template Updated Successfully');
            vm.transName = null;
            vm.milestones = [];
            _getAll();
        };


        function _deleteTemp(deletedId, index) {
            vm.$tempTransService.delete(deletedId, vm.deleteSuccess, vm.error);
        };

        function _deleteSuccess() {
            console.log(vm.items);
            vm.$alertService['success']('Template Deleted Successfully');
            _getAll();
        };

        function _error() {
            vm.$alertService['error']('Error! Try again');
        };
    }

})();