//UBER CONTROLLER
(function () {
    "use strict";
    angular.module(APPNAME).controller("uberController", UberController);
    UberController.$inject = ["$scope", "$baseController"];
    function UberController($scope, $baseController) {
        var vm = this;
        $baseController.merge(vm, $baseController);
        vm.$scope = $scope;
        vm.imageSrc = "Nothing selected";
        vm.documentInfo = null;

        //**REMOVE DOCUMENT LISTENER**
        $scope.$on('RemovePendingDocument', function (event, id) {
            console.log("Uber Controller Speaking");
            $scope.$broadcast("RemoveById", id);
            vm.hidden = true;
        });

        //**KEYNAME LISTENER**
        $scope.$on('AddDocumentToTask', function (event, newDocument) {
            console.log("Uber Controller Speaking");
            $scope.$broadcast("MilestoneCtrlAddDocument", newDocument);
        });

        //**DOCUMENT PREVIEW LISTENER**
        $scope.$on('ShowDocPreview', function (event, document) {
            console.log("Uber Controller Speaking");
            $scope.$broadcast("displayDocument", document);
        });

        //**DISPLAY IMAGE**
        function _displayImage(document) {
            event.preventDefault();
            console.log(document);
            var baseUrl = sabio.page.baseUrl;
            var bucket = sabio.page.bucket;
            var folder = sabio.page.folder;
            var url = "https://" + bucket + "." + baseUrl + "/" + folder + "/" + document.keyName;
            vm.imageSrc = url;
        };

        //**SELECT TEMPLATE LISTENER**
        $scope.$on('AddTempToTask', function (event, template) {
            console.log("Uber Controller Speaking");
            $scope.$broadcast("MilestoneCtrlAddTemp", template);
        });
    }
})();