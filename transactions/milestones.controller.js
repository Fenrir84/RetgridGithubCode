//MILESTONES CONTROLLER
(function () {
    "use strict";
    angular.module(APPNAME).controller("milestonesController", MilestonesController);
    MilestonesController.$inject = ["$scope", "$baseController", "transactionsService", "milestoneService", "taskService", "chatService", "$uibModal"];
    function MilestonesController($scope, $baseController, transactionsService, milestoneService, taskService, chatService, $uibModal) {
        var vm = this;
        $baseController.merge(vm, $baseController);
        vm.$scope = $scope;
        vm.transactionsService = transactionsService;
        vm.milestoneService = milestoneService;
        vm.taskService = taskService;
        vm.chatService = chatService;
        vm.$uibModal = $uibModal;
        vm.notify = vm.transactionsService.getNotifier($scope);

        vm.openModal = _openModal;
        vm.openMilestoneModal = _openMilestoneModal;
        vm.modalSelected = null;
        vm.selectedId = null;
        vm.newChat = {};
        vm.currentPersonId = sabio.page.currentPersonId;

        vm.items = sabio.page.currentTransaction;
        vm.milestoneData = null;
        vm.taskData = null;
        vm.removeMilestone = _removeMilestone;
        vm.removeTask = _removeTask;
        vm.showLittleMessageBox = _showLittleMessageBox;
        vm.showParticipantMessageBox = _showParticipantMessageBox;
        vm.sendMessage = _sendMessage;
        vm.getChatPersonImage = _getChatPersonImage;
        vm.toggleCollapse = _toggleCollapse;
        vm.toggleTaskCollapse = _toggleTaskCollapse;
        vm.messageReply = _messageReply;
        vm.showReplyBox = _showReplyBox;
        vm.changeStatus = _changeStatus;
        vm.changeTaskStatus = _changeTaskStatus;

        sabio.page.draggable = function () {
            $(".draggable").draggable({
                revert: true,
                start: function (event, ui) {
                    $(this).addClass('tilt');
                },
                stop: function (event, ui) {
                    $(this).removeClass("tilt");
                    $("html").unbind('mousemove', $(this).data("move_handler"));
                    $(this).removeData("move_handler");
                },
                drop: function (event, ui) {
                    $(this).hide();
                },
                drag: function (event, ui) {
                    sabio.page.selectedKeyName = $(this).attr("data-keyName");
                    sabio.page.selectedPending = $(this);
                }
            });

            $(".droppable").droppable({
                accept: ".draggable",
                hoverClass: "dropHover",
                drop: function (event, ui) {
                    sabio.page.selectedPending.hide();
                    sabio.page.selectedTaskId = $(this).attr("id");
                    $("#documentModalButton").click();
                }
            });

            $(".sortable").sortable({
                revert: true,
                placeholder: "placeholder",
                delay: 150,
                distance: 20,
                start: function (event, ui) {
                    ui.item.addClass('tilt');
                },
                stop: function (event, ui) {
                    ui.item.removeClass("tilt");
                    $("html").unbind('mousemove', ui.item.data("move_handler"));
                    ui.item.removeData("move_handler");
                },
                update: function () {
                    sabio.page.milestoneOrder = $('.sortable').sortable('serialize', { key: "" });
                    var array = sabio.page.milestoneOrder.split("&milestone[]=");
                    array[0] = array[0].replace("milestone[]=", "");
                    var orderData = {};
                    orderData.IdList = array;
                    sabio.services.milestones.putOrder(orderData, sabio.page.onSortSuccess, sabio.page.onSortError);
                }
            });
            sabio.page.onSortSuccess = function () {
                console.log("Update Successful!");
            }
            sabio.page.onSortError = function () {
                console.log("Your ajax call failed!");
            }

            $(".taskSortable").sortable({
                revert: true,
                delay: 150,
                placeholder: "placeholder",
                start: function (event, ui) {
                    ui.item.addClass('tilt');
                },
                stop: function (event, ui) {
                    ui.item.removeClass("tilt");
                    $("html").unbind('mousemove', ui.item.data("move_handler"));
                    ui.item.removeData("move_handler");
                },
                update: function () {
                    sabio.page.taskOrder = $(this).sortable('serialize', { key: "" });
                    var taskArray = sabio.page.taskOrder.split("&task[]=");
                    taskArray[0] = taskArray[0].replace("task[]=", "");
                    var taskOrderData = {};
                    taskOrderData.IdList = taskArray;
                    sabio.services.tasks.putOrder(taskOrderData, sabio.page.onTaskSortSuccess, sabio.page.onTaskSortError);
                }
            });

            sabio.page.onTaskSortSuccess = function () {
                console.log("Updated task order successfully!");
            }
            sabio.page.onTaskSortError = function () {
                console.log("Your ajax call failed!");
            }
        };

        sabio.page.draggable();

        //CHANGE TASK STATUS
        function _changeTaskStatus(taskScope, task) {
            if (task.taskStatusId < 3) {
                task.taskStatusId = task.taskStatusId + 1;
            } else {
                task.taskStatusId = 1;
            }

            if (task.taskStatusId == 1) {
                task.statusColor = 'label-light';
            } else if (task.taskStatusId == 2) {
                task.statusColor = 'label-warning';
            } else {
                task.statusColor = 'label-success';
            }
            vm.taskService.updateTaskStatus(task.id, task.taskStatusId, _onUpdateSuccess, _onUpdateError)

            var parentMilestone = taskScope.$parent.milestone;
            var done = true;
            var inProgress = false;
            for (var i = 0; i < parentMilestone.tasks.length ; i++) {
                if (parentMilestone.tasks[i].taskStatusId != 3) {
                    done = false;
                }                 
                if (parentMilestone.tasks[i].taskStatusId == 2 || parentMilestone.tasks[i].taskStatusId == 3) {
                    inProgress = true;
                }
            }     
            if (done) {
                parentMilestone.milestoneStatusId = 3;
                parentMilestone.statusColor = 'label-success';
                parentMilestone.statusName = 'Completed';
            } else if (inProgress) {
                parentMilestone.milestoneStatusId = 2;
                parentMilestone.statusColor = 'label-warning';
                parentMilestone.statusName = 'In Progress';
            } else {
                parentMilestone.milestoneStatusId = 1;
                parentMilestone.statusColor = 'label-light';
                parentMilestone.statusName = 'Not Completed';
            }
            vm.milestoneService.updateMilestoneStatus(parentMilestone.id, parentMilestone.milestoneStatusId, _onUpdateSuccess, _onUpdateError)
        }

        //CHANGE MILESTONE STATUS
        function _changeStatus(milestone) {
            if (milestone.milestoneStatusId < 3) {
                milestone.milestoneStatusId = milestone.milestoneStatusId + 1;
            } else {
                milestone.milestoneStatusId = 1;
            }

            if (milestone.milestoneStatusId == 1) {
                milestone.statusColor = 'label-light';
                milestone.statusName = 'Not Completed';
            } else if (milestone.milestoneStatusId == 2) {
                milestone.statusColor = 'label-warning';
                milestone.statusName = 'In Progress';
            } else {
                milestone.statusColor = 'label-success';
                milestone.statusName = 'Completed';
            }
            vm.milestoneService.updateMilestoneStatus(milestone.id, milestone.milestoneStatusId, _onUpdateSuccess, _onUpdateError)
        }

        function _onUpdateSuccess() {
            console.log("Update Success!");
        }

        function _onUpdateError() {
            console.log("Ajax Failure!");
        }

        _render();

        function _render() {
            if (sabio.page.currentTransaction.milestones == null) {
                vm.showMilestones = true;
            } else {
                vm.showMilestones = false;
            }
        }
        //SHOW MESSAGE REPLY BOX
        function _showReplyBox(chat) {
            if (chat.showingReplyBox == null) {
                chat.showingReplyBox = true;
            } else {
                chat.showingReplyBox = !chat.showingReplyBox;
            }
        }

        //SEND REPLY MESSAGE
        function _messageReply(chat) {
            var id = chat.id;
            var data = {};
            data.personId = vm.currentPersonId;
            data.chatId = chat.id;
            data.messageContent = chat.newMessageContent;
            vm.chatService.insertMessage(id, data, _onMessageReplySuccess, _onMessageReplyFailure);
        };

        function _onMessageReplySuccess(data) {
            console.log(data);
            console.log("Reply sent!");
        }

        function _onMessageReplyFailure() {
            console.log("Your ajax call failed!");
        }

        //RENDER CHAT PERSON IMAGE
        function _getChatPersonImage(keyName) {
            var baseUrl = sabio.page.baseUrl;
            var bucket = sabio.page.bucket;
            var folder = sabio.page.folder;
            var url = "https://" + bucket + "." + baseUrl + "/" + folder + "/" + keyName;
            return url;
        };

        //TOGGLE TASK COLLAPSE
        function _toggleTaskCollapse(task) {
            if (task.isButtonClicked == undefined) {
                task.isButtonClicked = true;
            } else {
                task.isButtonClicked = !task.isButtonClicked;
            }
        };

        //TOGGLE MILESTONE COLLAPSE
        function _toggleCollapse(milestone) {
            if (milestone.isButtonClicked == undefined) {
                milestone.isButtonClicked = true;
            } else {
                milestone.isButtonClicked = !milestone.isButtonClicked;
            }
        }

        //START CHAT
        function _sendMessage(task) {
            console.log(task);

            vm.newChat.personId = vm.currentPersonId;
            vm.newChat.chatParticipantIds = [];
            vm.newChat.chatParticipantIds.push(vm.currentPersonId);
            vm.newChat.transactionId = vm.items.id;
            vm.newChat.chatSubject = "Task Chat";
            vm.newChat.taskId = task.id;
            vm.newChat.messageContent = task.pendingMessage;
            for (var i = 0; i < task.pendingMessageRecipients.length; i++) {
                vm.newChat.chatParticipantIds.push(task.pendingMessageRecipients[i]);
            }
            console.log(vm.newChat);

            vm.chatService.insertChat(vm.newChat, _onSuccessSendChat, _onError);
        }

        function _onSuccessSendChat(data) {
            console.log("Chat created!");
            console.log(data);
        }

        function _onError() {
            console.log("Your ajax call failed!");
        }

        //SHOW PARTICIPANT SELECTOR
        function _showParticipantMessageBox(task) {
            event.preventDefault();
            if (task.showingParticipantsBox == undefined) {
                task.showingParticipantsBox = true;
                task.pendingMessage = null;
            } else {
                task.showingParticipantsBox = !task.showingParticipantsBox;
                task.pendingMessage = null;
            }
        }

        //SHOW MESSAGE BOX
        function _showLittleMessageBox(task) {
            event.preventDefault();
            if (task.showingMessageBox == undefined) {
                task.showingMessageBox = true;
                task.pendingMessage = null;
            } else {
                task.showingMessageBox = !task.showingMessageBox;
                task.pendingMessage = null;
            }
        }

        //**ADD DOCUMENT LISTENER**
        $scope.$on('MilestoneCtrlAddDocument', function (event, newDocument) {
            console.log("Milestone Controller Listening!");
            for (var i = 0; i < vm.items.milestones.length; i++) {
                if (vm.items.milestones[i].tasks != null) {
                    for (var x = 0; x < vm.items.milestones[i].tasks.length; x++) {
                        if (vm.items.milestones[i].tasks[x].id == newDocument.taskId) {
                            if (vm.items.milestones[i].tasks[x].documents == null) {
                                vm.items.milestones[i].tasks[x].documents = [];
                            }
                            vm.items.milestones[i].tasks[x].documents.push(newDocument);
                        }
                    }
                }
            }
        });

        //**ADD TEMPLATE LISTENER**
        $scope.$on('MilestoneCtrlAddTemp', function (event, temp) {
            console.log("Milestone Controller Listening!");
            vm.items.milestones = temp;
            vm.showMilestones = false;
        });

        //OPEN MILESTONE MODAL FUNCTION
        function _openMilestoneModal() {
            var modalInstance = vm.$uibModal.open({
                animation: true,
                templateUrl: "newMilestoneModalContent.html",
                controller: "milestoneModalController as mModalCtrl",
                size: "md",
                resolve: {
                    items: function () {
                        return vm.items.id;
                    }
                }
            });
            modalInstance.result.then(function (selectedItem) {
                vm.modalSelected = selectedItem;
                if (vm.items.milestones == null) {
                    vm.items.milestones = [];
                }
                selectedItem.displayOrder = vm.items.milestones.length;
                vm.items.milestones.push(selectedItem);
                //$('body').css('overflow', 'visible');
                //$('body').css('position', 'static');
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
                //$('body').css('overflow', 'visible');
                //$('body').css('position', 'static');
            });
        }

        //OPEN TASK MODAL FUNCTION
        function _openModal(id) {
            vm.selectedId = id;
            var modalInstance = vm.$uibModal.open({
                animation: true,
                templateUrl: "modalContent.html",
                controller: "taskModalController as tModalCtrl",
                size: "md",
                resolve: {
                    items: function () {
                        return vm.selectedId;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                vm.modalSelected = selectedItem;
                for (var i = 0; i < vm.items.milestones.length; i++) {
                    if (vm.items.milestones[i].id == selectedItem.milestoneId) {
                        if (vm.items.milestones[i].tasks == null) {
                            vm.items.milestones[i].tasks = [];
                        }
                        vm.items.milestones[i].tasks.push(selectedItem);
                    }
                }
                $('body').css('overflow', 'visible');
                $('body').css('position', 'static');
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
                $('body').css('overflow', 'visible');
                $('body').css('position', 'static');
            });
        }

        //DELETE MILESTONE FUNCTION
        function _removeMilestone(id) {
            console.log("Deleting Milestone!");

            sweetAlert({
                title: "Confirm Delete",
                text: "Are you sure you want to delete this Milestone without completing it?",
                type: "warning",
                showCancelButton: true
            }, function (isConfirm) {
                if (isConfirm) {
                    vm.milestoneService.delete(id, _removeSuccess, _removeFailure);
                    for (var i = 0; i < vm.items.milestones.length; i++) {
                        if (vm.items.milestones[i].id == id) {
                            vm.items.milestones.splice(i, 1);
                        }
                    }
                }
                else {
                    vm.$alertService.info("Operation cancelled");
                }
            });
        }

        function _removeSuccess() {
            console.log("Successfully deleted!");
        }

        function _removeFailure() {
            console.log("Ajax failed!");
        }

        //DELETE TASK FUNCTION
        function _removeTask(taskId, milestoneId) {
            console.log("Deleting Task!");
            vm.taskService.delete(taskId, _taskDeleteSuccess, _taskDeleteFailure);
            for (var i = 0; i < vm.items.milestones.length; i++) {
                if (vm.items.milestones[i].id == milestoneId) {
                    for (var x = 0; x < vm.items.milestones[i].tasks.length; x++) {
                        if (vm.items.milestones[i].tasks[x].id == taskId) {
                            vm.items.milestones[i].tasks.splice(x, 1);
                        }
                    }
                }
            }
        }

        function _taskDeleteSuccess() {
            console.log("Task deleted!");
        }

        function _taskDeleteFailure() {
            console.log("Ajax failure!");
        }
    }
})();