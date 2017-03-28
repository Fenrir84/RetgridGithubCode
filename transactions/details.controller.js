//DETAILS CONTROLLER
(function () {
    "use strict";
    angular.module(APPNAME).controller('transactionDetailsController', TransactionDetailsController);
    TransactionDetailsController.$inject = ['$scope', '$baseController', 'transactionsService'];
    function TransactionDetailsController($scope, $baseController, transactionsService) {
        var vm = this;
        $baseController.merge(vm, $baseController);
        vm.$scope = $scope;
        vm.transactionsService = transactionsService;
        vm.notify = vm.transactionsService.getNotifier($scope);
        vm.items = sabio.page.currentTransaction;
        vm.buyingAgent = null;
        vm.potentialEarnings = null;
        vm.getAgent = _getAgent;
        vm.getAgentCut = _getAgentCut;
        _getAgent();

        function _getAgentCut() {
            vm.potentialEarnings = (vm.items.listingDetails.listPrice) * (.01) * (vm.buyingAgent.defaultCommission);
        }

        function _getAgent() {
            for (var i = 0; i < vm.items.participants.length; i++) {
                if (vm.items.participants[i].roleId == 117) {
                    vm.buyingAgent = vm.items.participants[i];
                    _getAgentCut();
                }
            }
        }
    }
})();