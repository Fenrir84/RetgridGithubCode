 //DOCUMENT MODAL CONTROLLER
        (function () {
            "use strict";
            angular.module(APPNAME).controller("documentModalController", DocumentModalController);
            DocumentModalController.$inject = ["$scope", "$baseController", "$uibModalInstance", "items"]
            function DocumentModalController($scope, $baseController, $uibModalInstance, items) {
                var vm = this;
                $baseController.merge(vm, $baseController);
                vm.$scope = $scope;
                vm.$uibModalInstance = $uibModalInstance;

                vm.documentData = null;
                vm.selectedDocument = items;
                vm.cancel = _cancel;
                vm.addParticipant = _addParticipant;
                vm.displayImage = _displayImage;
                vm.imageSrc = null;

                //$('body').css('overflow','hidden');
                //$('body').css('position','fixed');

                renderImage();

                function _cancel () {
                    console.log("The modal knew that the seleced document was " + vm.selectedDocument);
                    vm.$uibModalInstance.dismiss("cancel");
                };

                function _addParticipant () {
                    console.log("Adding participant!");
                }

                function renderImage() {
                    console.log("Rendering!");
                    _displayImage(vm.selectedDocument);
                }

                //**DISPLAY IMAGE**
                function _displayImage(document) {
                    event.preventDefault();
                    console.log("Trying to render the image! " + document);
                    var baseUrl = sabio.page.baseUrl;
                    var bucket = sabio.page.bucket;
                    var folder = sabio.page.folder;
                    var url = "https://" + bucket + "." + baseUrl + "/" + folder + "/" + document.keyName;
                    vm.imageSrc = url;
                };
            }
        })();

        // telephone filter
        angular.module(APPNAME).filter('tel', function () {
            return function (tel) {
                if (!tel) { return ''; }

                var value = tel.toString().trim().replace(/^\+/, '');

                if (value.match(/[^0-9]/)) {
                    return tel;
                }

                var country, city, number;

                switch (value.length) {
                    case 10: // +1PPP####### -> C (PPP) ###-####
                        country = 1;
                        city = value.slice(0, 3);
                        number = value.slice(3);
                        break;

                    case 11: // +CPPP####### -> CCC (PP) ###-####
                        country = value[0];
                        city = value.slice(1, 4);
                        number = value.slice(4);
                        break;

                    case 12: // +CCCPP####### -> CCC (PP) ###-####
                        country = value.slice(0, 3);
                        city = value.slice(3, 5);
                        number = value.slice(5);
                        break;

                    default:
                        return tel;
                }

                if (country == 1) {
                    country = "";
                }

                number = number.slice(0, 3) + '-' + number.slice(3);

                return (country + " (" + city + ") " + number).trim();
            };
        });